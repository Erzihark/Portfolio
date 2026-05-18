<template>
    <div
        :class="{
            wrapper: true,
            'wrapper--mobile': isMobile,
            'wrapper--desktop': !isMobile
        }"
    >
        <base-spinner v-if="spinner"></base-spinner>

        <template v-if="ready">
            <portfolio-scene />
            <portfolio-overlay />
        </template>
    </div>
</template>

<script>
import CONFIG from '@/config';
import defer from 'promise-defer';
import Preloader from '@/services/preloader.service';
import SoundManager from '@/services/sound-manager.service';
import BaseSpinner from '@/components/BaseSpinner.vue';
import PortfolioScene from './components/PortfolioScene.vue';
import PortfolioOverlay from './components/PortfolioOverlay.vue';

export default {
    name: 'App',

    data() {
        return {
            assets: CONFIG.assets,
            ready: false,
            spinner: true,
            defers: {
                imagesReady: new defer()
            },
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            ),
            isTransitioning: false,
            soundManager: new SoundManager()
        };
    },

    mounted() {
        this.soundManager.init();

        const handleFirstInteraction = () => {
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };

        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('touchstart', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);

        this.emitter.on('play-sound', (sound) => {
            this.soundManager.play(sound);
        });

        this.emitter.on('toggle-sound', () => {
            this.soundManager.toggle();
        });

        window.addEventListener('resize', this.adjustViewportHeight);

        this.adjustViewportHeight();
    },

    created() {
        this.showSpinner();

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
            this.hideSpinner();
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
        },

        showSpinner() {
            this.spinner = true;
        },

        hideSpinner() {
            this.spinner = false;
        }
    },

    components: {
        BaseSpinner,
        PortfolioScene,
        PortfolioOverlay
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
}

.cursor-pointer {
    cursor: pointer;
}
</style>
