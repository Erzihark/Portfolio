<template>
    <div class="overlay">
        <button @click="go('projects')">Projects</button>
        <button @click="go('skills')">Skills</button>
        <button @click="go('experience')">Experience</button>
        <button @click="go('home')">Home</button>

        <div class="box">
            <base-animation
                type="drag"
                :loop="true"
                :hasTransition="true"
                :hasElapsed="hasElapsed"
            ></base-animation>
        </div>
    </div>
</template>

<script>
import emitter from '@/services/emitter.service';
import BaseAnimation from './BaseAnimation.vue';

export default {
    data() {
        return {
            hasElapsed: false,
            animationDuration: 3,
            isHoveringPlanet: false
        };
    },

    mounted() {
        setTimeout(() => {
            this.hasElapsed = true;
        }, this.animationDuration * 1000);
    },

    methods: {
        go(id) {
            emitter.emit('navigate-to', id);
        }
    },

    components: {
        BaseAnimation
    }
};
</script>

<style lang="scss">
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;

    width: fit-content;
    height: fit-content;
}

.box {
    position: relative;
    top: 98vh;
}

.fade-leave-active {
    transition: opacity 1.5s ease;
}

.fade-leave-to {
    opacity: 0;
}
</style>
