<template>
    <div ref="host" class="hero-planet" :class="{ 'hero-planet--ready': ready }" aria-hidden="true"></div>
</template>

<script>
const ROTATION_SPEED = 0.12;

function supportsWebGL() {
    try {
        return Boolean(document.createElement('canvas').getContext('webgl2'));
    } catch {
        return false;
    }
}

export default {
    name: 'HeroPlanet',

    data() {
        return {
            ready: false
        };
    },

    mounted() {
        if (navigator.connection?.saveData || !supportsWebGL()) return;

        // Wait until the text and the images have priority over the 3D library.
        const start = () => this.start().catch(() => this.dispose());
        if (window.requestIdleCallback) {
            this.idleHandle = window.requestIdleCallback(start, { timeout: 1500 });
        } else {
            this.idleHandle = window.setTimeout(start, 300);
        }
    },

    beforeUnmount() {
        this.unmounted = true;
        if (window.cancelIdleCallback) window.cancelIdleCallback(this.idleHandle);
        else window.clearTimeout(this.idleHandle);
        this.dispose();
    },

    methods: {
        async start() {
            const [THREE, { GLTFLoader }, { normalizeModel }] = await Promise.all([
                import('three'),
                import('three/examples/jsm/loaders/GLTFLoader.js'),
                import('@/engine/utils/normalize-model.util')
            ]);
            const gltf = await new GLTFLoader().loadAsync(
                `${import.meta.env.BASE_URL}models/center.glb`
            );
            if (this.unmounted) return;

            const scene = new THREE.Scene();
            scene.add(new THREE.HemisphereLight(0xffffff, 0x1a2a1f, 1.4));
            const sun = new THREE.DirectionalLight(0xffffff, 2.2);
            sun.position.set(3, 2, 4);
            scene.add(sun);

            const model = gltf.scene;
            normalizeModel(model, 2);
            const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
            model.position.sub(center);

            const pivot = new THREE.Group();
            pivot.add(model);
            pivot.rotation.x = 0.25;
            scene.add(pivot);

            const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
            camera.position.z = 4.6;

            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.$refs.host.appendChild(renderer.domElement);

            this.three = { scene, camera, renderer, pivot };
            this.timer = new THREE.Clock();

            this.resizeObserver = new ResizeObserver(() => this.resize());
            this.resizeObserver.observe(this.$refs.host);
            this.resize();

            this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            renderer.render(scene, camera);
            this.ready = true;

            if (this.reducedMotion) return;

            this.intersectionObserver = new IntersectionObserver(([entry]) => {
                this.setRunning(entry.isIntersecting);
            });
            this.intersectionObserver.observe(this.$refs.host);
        },

        resize() {
            const { renderer, scene, camera } = this.three;
            const size = this.$refs.host.clientWidth;
            renderer.setSize(size, size, false);
            renderer.render(scene, camera);
        },

        setRunning(running) {
            const { renderer, scene, camera, pivot } = this.three;
            if (!running) {
                renderer.setAnimationLoop(null);
                return;
            }

            this.timer.getDelta();
            renderer.setAnimationLoop(() => {
                pivot.rotation.y += this.timer.getDelta() * ROTATION_SPEED;
                renderer.render(scene, camera);
            });
        },

        dispose() {
            this.intersectionObserver?.disconnect();
            this.resizeObserver?.disconnect();
            if (!this.three) return;

            const { renderer, scene } = this.three;
            renderer.setAnimationLoop(null);
            scene.traverse((node) => {
                node.geometry?.dispose();
                [node.material].flat().forEach((material) => {
                    if (!material) return;
                    Object.values(material).forEach((value) => value?.isTexture && value.dispose());
                    material.dispose();
                });
            });
            renderer.dispose();
            renderer.domElement.remove();
            this.three = null;
        }
    }
};
</script>

<style lang="scss" scoped>
.hero-planet {
    aspect-ratio: 1;
    opacity: 0;
    transition: opacity 0.6s ease;
    pointer-events: none;

    &--ready {
        opacity: 1;
    }

    :deep(canvas) {
        display: block;
        width: 100%;
        height: 100%;
    }
}
</style>
