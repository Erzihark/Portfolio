<template>
    <Transition name="fade">
        <div v-show="!targetablePlanet" class="animation" ref="animation"></div>
    </Transition>
</template>

<script>
export default {
    name: 'BaseAnimation',

    props: ['type', 'loop', 'targetablePlanet'],

    data() {
        return {
            animation: null
        };
    },

    mounted() {
        setTimeout(() => {
            this.animate();
        }, 1200);
    },

    methods: {
        animate() {
            const options = {
                container: this.$refs.animation,
                renderer: 'svg',
                loop: this.loop,
                autoplay: true,
                path: `${import.meta.env.BASE_URL}animations/${this.type}.json`
            };

            this.animation = window.lottie.loadAnimation({
                ...options,
                ...this.options
            });

            this.animation.onComplete = () => {
                this.$emit('onComplete');
            };

            this.$emit('onReady', this.animation);
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
    width: 12vw;
    height: 12vw;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 1.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
}
</style>
