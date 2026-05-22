<template>
    <div
        ref="container"
        class="three__container"
        :class="{
            'three__container--drag': isDragging,
            'cursor-pointer': isHoveringPlanet
        }"
    ></div>
</template>

<script>
import emitter from '@/services/emitter.service';

import { EVENTS } from '@/constants/events';

import SceneManager from '@/engine/core/SceneManager';
import WorldEngine from '@/engine/core/WorldEngine';
import InputController from '@/engine/InputController';

export default {
    data() {
        return {
            isHoveringPlanet: false,
            isDragging: false
        };
    },

    mounted() {
        this.sceneManager = new SceneManager(this.$refs.container);

        this.input = new InputController(this.sceneManager.renderer, this.sceneManager.worldRoot);

        this.world = new WorldEngine({
            scene: this.sceneManager.scene,
            camera: this.sceneManager.camera,
            renderer: this.sceneManager.renderer,
            worldRoot: this.sceneManager.worldRoot,
            skyRoot: this.sceneManager.skyRoot,
            input: this.input
        });

        this.world.init();

        this.bindEvents();

        window.addEventListener('resize', this.onResize);
    },

    beforeUnmount() {
        this.world?.destroy();

        this.input?.destroy();

        this.sceneManager?.destroy();

        window.removeEventListener('resize', this.onResize);
    },

    methods: {
        bindEvents() {
            emitter.on(EVENTS.PLANET_HOVER, (value) => {
                this.isHoveringPlanet = value;
            });

            emitter.on(EVENTS.IS_DRAGGING, (value) => {
                this.isDragging = value;
            });
        },

        onResize() {
            this.sceneManager.resize();
        }
    }
};
</script>

<style lang="scss" scoped>
.three__container {
    cursor: grab;

    &--drag {
        cursor: grabbing;
    }

    &.cursor-pointer {
        cursor: pointer;
    }
}
</style>
