<template>
    <video
        ref="backgroundVideo"
        :class="['background-video', { 'background-video--mobile': isMobile }]"
        :autoplay="props.autoplay"
        :muted="props.muted"
        :loop="props.loop"
        playsinline
        preload="auto"
    >
        <source :src="videoSrc" type="video/mp4" />
    </video>
</template>

<script>
export default {
    name: 'BaseVideo',

    props: {
        videoSrc: {
            type: String,
            required: true
        },
        props: {
            type: Object,
            required: false
        },
        isMobile: {
            type: Boolean,
            default: false
        }
    },

    mounted() {
        const video = this.$refs.backgroundVideo;

        video.muted = true;
        video.playsInline = true;

        video.playbackRate = this.props.playbackRate;
        const playPromise = video.play();

        if (playPromise !== undefined) {
            playPromise.catch((error) => {
                console.warn('Background video autoplay failed:', error);
            });
        }
    }
};
</script>

<style lang="scss">
.background-video {
    position: fixed;
    top: 5%;
    left: 0;

    width: 100vw;
    height: 90vh;

    object-fit: cover;
    z-index: 0;

    pointer-events: none;

    backface-visibility: hidden;
    transform: translateZ(0);

    will-change: transform;
}

.background-video--mobile {
    transform: translateZ(0) rotate(90deg) scale(1.8);
    height: 40vh;
    top: 30%;
    transform-origin: center center;
}

.a-scene,
.a-canvas,
canvas {
    position: relative;
    z-index: 1;
}
</style>
