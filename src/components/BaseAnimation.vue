<template>
    <div v-if="hasTransition">
        <Transition name="fade" @leave="stopLottie">
            <div v-if="!hasElapsed" class="animation" ref="animation"></div>
        </Transition>
    </div>
    <div v-else class="animation" ref="animation"></div>
</template>

<script>
export default {
    name: 'BaseAnimation',

    props: ['type', 'loop', 'hasTransition', 'hasElapsed'],

    data() {
        return {
            animation: null
        };
    },

    mounted() {
        this.animate();
    },

    methods: {
        animate() {
            const options = {
                container: this.$refs.animation,
                renderer: 'svg',
                loop: this.loop,
                autoplay: true,
                path: '/animations/' + this.type + '.json'
            };

            this.animation = window.lottie.loadAnimation({ ...options, ...this.options });

            this.animation.onComplete = () => {
                this.$emit('onComplete');
            };

            this.$emit('onReady', this.animation);
        },
        stopLottie() {
            if (this.animation) {
                this.animation.stop();
            }
        }
    },

    beforeUnmount() {
        if (this.animation) {
            this.animation.destroy();
            this.animation = null;
        }
    }
};
</script>

<style lang="scss">
.animation {
    position: absolute;
    bottom: 5px;
    left: 5px;
    width: 8vw;
    height: 8vw;
}

.fade-leave-active {
    transition: opacity 1.5s ease;
}
.fade-leave-to {
    opacity: 0;
}
</style>
