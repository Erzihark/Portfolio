<template>
    <div
        :class="{
            wrapper: true,
            'wrapper--mobile': isMobile,
            'wrapper--desktop': !isMobile
        }"
    >
        <template v-if="ready">
            <app-scene />
            <div v-if="threeReady">
                <app-overlay :isMobile="isMobile" />
            </div>
        </template>
        <div v-else>
            <base-spinner></base-spinner>
        </div>
    </div>
</template>

<script>
import CONFIG from '@/config';
import defer from 'promise-defer';
import Preloader from '@/services/preloader.service';
import AppScene from './components/AppScene.vue';
import AppOverlay from './components/AppOverlay.vue';
import BaseSpinner from './components/BaseSpinner.vue';
import emitter from '@/services/emitter.service';
import { EVENTS } from '@/constants/events';

export default {
    name: 'App',

    data() {
        return {
            assets: CONFIG.assets,
            ready: false,
            threeReady: false,
            defers: {
                imagesReady: new defer()
            },
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            ),
            isTransitioning: false
        };
    },

    mounted() {
        const handleFirstInteraction = () => {
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };

        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('touchstart', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);

        window.addEventListener('resize', this.adjustViewportHeight);

        emitter.on(EVENTS.WORLD_READY, () => {
            this.threeReady = true;
        });

        this.adjustViewportHeight();
    },

    created() {
        this.setPreloader();

        Promise.all([this.defers.imagesReady.promise]).then(() => {
            this.onDataReady();
        });
    },

    methods: {
        adjustViewportHeight() {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        },

        onDataReady() {
            this.ready = true;
        },

        setPreloader() {
            const vm = this;

            Preloader.bind('images', vm.assets.images.preload, {
                complete() {
                    console.log('Images preloaded!');
                    vm.defers.imagesReady.resolve();
                },
                error() {
                    console.log('Failed to load one or more images!');
                    vm.defers.imagesReady.resolve();
                }
            });

            Preloader.bind('images', vm.assets.images.subsequent, {
                complete() {
                    console.log('Subsequent images Loaded!');
                },
                error() {
                    console.log('Failed to load one or more images!');
                }
            });
        },

        onTransitionEnd() {
            this.isTransitioning = false;
        }
    },

    components: {
        AppScene,
        AppOverlay,
        BaseSpinner
    }
};
</script>

<style lang="scss">
* {
    margin: 0;
    padding: 0;

    &:focus {
        outline: none;
    }
}

html,
body {
    background-color: #000000;
    height: 100%;
    width: 100%;
    font-family: 'Dosis', sans-serif;
    font-optical-sizing: auto;
}

.wrapper {
    background-repeat: no-repeat;
    background-position: 50% 50%;
    height: 100vh;
    width: 100vw;
    margin: 0px auto;
    overflow: hidden;
    position: relative;

    &__exit,
    &__intro,
    &__interactive {
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
    }

    &__button {
        background-color: transparent;
        border: none;
        position: absolute;
        cursor: pointer;
    }

    &--mobile {
        width: 100%;
        height: 100dvh;
    }
}

.michroma-regular {
    font-family: 'Michroma', sans-serif;
    font-weight: 400;
    font-style: normal;
}

.bruno-ace-sc-regular {
    font-family: 'Bruno Ace SC', sans-serif;
    font-weight: 400;
    font-style: normal;
}
</style>
