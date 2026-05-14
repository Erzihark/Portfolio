<template>
    <div ref="container" class="three-container"></div>
</template>

<script>
import * as THREE from 'three';

import WorldEngine from '@/engine/WorldEngine';
import NavigationSystem from '@/engine/NavigationSystem';
import InputController from '@/engine/InputController';
import Bloom from '@/engine/effects/Bloom';

export default {
    mounted() {
        this.onResize = this.onResize.bind(this);

        this.initThree();
        this.initialize();

        window.addEventListener('resize', this.onResize);
    },

    beforeUnmount() {
        window.removeEventListener('resize', this.onResize);

        this.world?.destroy();
    },

    methods: {
        initThree() {
            // Renderer

            this.renderer = new THREE.WebGLRenderer({
                alpha: true
            });

            this.renderer.setSize(window.innerWidth, window.innerHeight);

            this.renderer.setClearColor(0x000000, 0);

            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

            this.renderer.outputColorSpace = THREE.SRGBColorSpace;

            this.renderer.toneMapping = THREE.NoToneMapping;

            this.$refs.container.appendChild(this.renderer.domElement);

            // Scene

            this.scene = new THREE.Scene();

            this.scene.background = null;

            // Camera

            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );

            this.camera.position.set(0, 0, 22);

            // World root

            this.worldRoot = new THREE.Group();

            this.scene.add(this.worldRoot);

            // Debug cube

            const cube = new THREE.Mesh(
                new THREE.BoxGeometry(),
                new THREE.MeshBasicMaterial({
                    color: 'red'
                })
            );

            this.scene.add(cube);
        },

        initialize() {
            this.world = new WorldEngine(this.scene, this.camera, this.worldRoot, this.renderer);

            this.nav = new NavigationSystem(this.world);

            this.input = new InputController(this.renderer, this.worldRoot, this.world);

            this.world.init({
                navigation: this.nav,
                input: this.input
            });

            //this.bloom = new Bloom(this.renderer, this.scene, this.camera);
        },

        onResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight;

            this.camera.updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
};
</script>
<style lang="scss" scoped>
.three-container {
    position: fixed;
    inset: 0;
    z-index: 1;
}

.three-container canvas {
    width: 100%;
    height: 100%;
    display: block;
    background: transparent !important;
}
</style>
