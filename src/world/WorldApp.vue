<template>
    <div
        :class="{
            wrapper: true,
            'wrapper--mobile': isMobile,
            'wrapper--desktop': !isMobile
        }"
    >
        <a class="wrapper__back" href="#">{{ $t('world.back') }}</a>
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
import AppScene from '@/components/AppScene.vue';
import AppOverlay from '@/components/AppOverlay.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import '@fortawesome/fontawesome-free/css/all.min.css';
import emitter from '@/services/emitter.service';
import { EVENTS } from '@/constants/events';

function loadStylesheet(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

// Only this page needs the scripts below, so the main page stays light.
function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = resolve;
        document.head.appendChild(script);
    });
}

export default {
    name: 'WorldApp',

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

        loadStylesheet('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');
        loadStylesheet(
            'https://fonts.googleapis.com/css2?family=Bruno+Ace+SC&family=IBM+Plex+Sans:wght@400;500;600;700&family=Michroma&display=swap'
        );

        const lottieReady = loadScript(
            'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.9.6/lottie.min.js'
        );

        Promise.all([this.defers.imagesReady.promise, lottieReady]).then(() => {
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

    &__back {
        position: fixed;
        left: 12px;
        bottom: 12px;
        z-index: 1000;
        padding: 10px 14px;
        border-radius: 8px;
        background: rgba(10, 15, 20, 0.85);
        border: 1px solid rgba(144, 207, 56, 0.5);
        color: #f0f6fc;
        font-size: 14px;
        text-decoration: none;

        &:focus-visible {
            outline: 2px solid #90cf38;
            outline-offset: 2px;
        }
    }

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
