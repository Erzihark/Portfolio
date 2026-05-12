<template>
    <a-scene
        ref="scene"
        embedded
        vr-mode-ui="enabled: false"
        bloom-system
        renderer="sortObjects: true;"
    >
        <!-- WORLD ROOT -->
        <a-entity ref="worldRoot"></a-entity>

        <!-- CAMERA -->
        <a-entity id="cameraRig" position="0 0 22">
            <a-camera
                ref="camera"
                near="0.1"
                far="1000"
                look-controls="enabled: false"
                wasd-controls="enabled: false"
            ></a-camera>
        </a-entity>

        <!-- DEBUG -->
        <!-- remove later -->
        <a-box position="0 0 0" color="red" depth="1" height="1" width="1"></a-box>
    </a-scene>
</template>

<script>
import WorldEngine from '@/engine/WorldEngine';
import NavigationSystem from '@/engine/NavigationSystem';
import InputController from '@/engine/InputController';
import '../engine/effects/Bloom.js';

export default {
    mounted() {
        const sceneEl = this.$refs.scene;

        sceneEl.addEventListener('loaded', () => {
            this.initialize();
        });
    },

    methods: {
        initialize() {
            this.world = new WorldEngine(this.$refs.scene, this.$refs.camera, this.$refs.worldRoot);

            this.nav = new NavigationSystem(this.world);

            this.input = new InputController(this.$refs.scene, this.$refs.worldRoot);

            this.world.init({
                navigation: this.nav,
                input: this.input
            });
        }
    }
};
</script>
