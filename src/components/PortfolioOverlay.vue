<template>
    <div class="overlay">
        <app-header
            :isPlanetTransitioning="isPlanetTransitioning"
            :isMobile="isMobile"
            @setModal="setModal"
        />

        <div class="box">
            <base-animation
                type="drag"
                :loop="true"
                :hasTransition="true"
                :hasElapsed="hasElapsed"
            ></base-animation>
        </div>

        <base-modal
            :modalTitle="'TEST TITLE'"
            :open="isModalOpen"
            buttonText="X"
            @buttonClick="setModal(false)"
        >
            <component :is="currentComponent" />
        </base-modal>
    </div>
</template>

<script>
import BaseAnimation from './BaseAnimation.vue';
import AppHeader from './AppHeader.vue';
import BaseModal from './BaseModal.vue';
import emitter from '@/services/emitter.service';
import SkillsView from '../views/Skills.vue';
import ExperienceView from '../views/Experience.vue';
import ProjectsView from '../views/Projects.vue';
import ContactView from '../views/Contact.vue';

export default {
    props: ['isMobile'],

    data() {
        return {
            hasElapsed: false,
            animationDuration: 3,
            selectedView: null,
            isHoveringPlanet: false,
            modalContent: 'test text',
            isModalOpen: false,
            isPlanetTransitioning: false,
            transitionPlanetId: null
        };
    },

    computed: {
        currentComponent() {
            switch (this.transitionPlanetId) {
                case 'experience':
                    return ExperienceView;

                case 'skills':
                    return SkillsView;

                case 'projects':
                    return ProjectsView;
                case 'contact':
                    return ContactView;

                default:
                    return 'HomeContent';
            }
        }
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
            this.isPlanetTransitioning = false;
        });

        emitter.on('planet-transition-start', (id) => {
            this.isPlanetTransitioning = true;
            this.transitionPlanetId = id;
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
