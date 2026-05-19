<template>
    <div class="overlay">
        <app-header @setModal="setModal" />

        <div class="box">
            <base-animation
                type="drag"
                :loop="true"
                :hasTransition="true"
                :hasElapsed="hasElapsed"
            ></base-animation>
        </div>

        <base-modal :modal="isModalOpen" buttonText="X" @buttonClick="setModal(false)">
            {{ modalContent }}
        </base-modal>
    </div>
</template>

<script>
import BaseAnimation from './BaseAnimation.vue';
import AppHeader from './AppHeader.vue';
import BaseModal from './BaseModal.vue';
import emitter from '@/services/emitter.service';

export default {
    data() {
        return {
            hasElapsed: false,
            animationDuration: 3,
            isHoveringPlanet: false,
            modalContent: 'test text',
            isModalOpen: false
        };
    },

    methods: {
        setModal(value) {
            this.isModalOpen = value;

            if (!value) {
                emitter.emit('close-planet-view');
            }
        }
    },

    mounted() {
        emitter.on('planet-focus-complete', () => {
            this.setModal(true);
        });

        setTimeout(() => {
            this.hasElapsed = true;
        }, this.animationDuration * 1000);
    },

    components: {
        BaseAnimation,
        AppHeader,
        BaseModal
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
