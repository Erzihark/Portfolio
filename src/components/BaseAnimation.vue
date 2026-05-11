<template>
    <div class="animation" ref="animation"></div>
</template>

<script>
export default {
    name: 'BaseAnimation',

    props: ['type', 'options'],

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
                loop: false,
                autoplay: true,
                path: '/animations/' + this.type + '.json'
            };

            this.animation = window.lottie.loadAnimation({ ...options, ...this.options });

            this.animation.onComplete = () => {
                this.$emit('onComplete');
            };

            this.$emit('onReady', this.animation);
        }
    }
};
</script>

<style lang="scss">
.animation {
    width: 100%;
    height: 100%;
}
</style>
