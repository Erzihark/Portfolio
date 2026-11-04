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
                :targetablePlanet="targetablePlanet"
            ></base-animation>
        </div>

        <base-modal
            :modalTitle="transitionPlanetId ? planetLabel(transitionPlanetId) : ''"
            :isMobile="isMobile"
            :open="isModalOpen"
            buttonText="X"
            @buttonClick="setModal(false)"
        >
            <component :is="currentComponent" />
        </base-modal>

        <app-footer :targetablePlanet="targetablePlanet"></app-footer>
    </div>
</template>

<script>
import BaseAnimation from './BaseAnimation.vue';
import AppHeader from './AppHeader.vue';
import AppFooter from './AppFooter.vue';
import BaseModal from './BaseModal.vue';
import emitter from '@/services/emitter.service';
import { EVENTS } from '@/constants/events';
import SkillsView from '../views/Skills.vue';
import ExperienceView from '../views/Experience.vue';
import ProjectsView from '../views/Projects.vue';
import ContactView from '../views/Contact.vue';
import HomeView from '../views/Home.vue';
import { planetLabel } from '@/constants/planets';

export default {
    props: ['isMobile'],

    data() {
        return {
            animationDuration: 3,
            selectedView: null,
            isHoveringPlanet: false,
            isModalOpen: false,
            isPlanetTransitioning: false,
            transitionPlanetId: null,
            targetablePlanet: false
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
                case 'home':
                    return HomeView;

                default:
                    return HomeView;
            }
        }
    },

    methods: {
        setModal(value) {
            this.isModalOpen = value;

            if (!value) {
                emitter.emit(EVENTS.CLOSE_PLANET_VIEW);
            }
        },

        planetLabel,

        // Close the open modal, wait for the camera to return, then fly to the planet.
        openPlanet(id) {
            if (!this.isModalOpen) {
                emitter.emit(EVENTS.NAVIGATE_TO, { event: null, id });
                return;
            }

            if (this.isPlanetTransitioning || id === this.transitionPlanetId) return;

            const onReturned = () => {
                emitter.off(EVENTS.PLANET_FOCUS_COMPLETE, onReturned);
                emitter.emit(EVENTS.NAVIGATE_TO, { event: null, id });
            };

            emitter.on(EVENTS.PLANET_FOCUS_COMPLETE, onReturned);
            this.setModal(false);
        }
    },

    mounted() {
        emitter.on(EVENTS.OPEN_PLANET, (id) => this.openPlanet(id));

        emitter.on(EVENTS.PLANET_FOCUS_COMPLETE, () => {
            if (this.transitionPlanetId) {
                this.setModal(true);
            }

            this.isPlanetTransitioning = false;
        });

        emitter.on(EVENTS.PLANET_TRANSITION_START, (id = null) => {
            this.isPlanetTransitioning = true;
            this.transitionPlanetId = id;
        });

        emitter.on(EVENTS.PLANET_TARGETABLE, (value) => {
            this.targetablePlanet = value;
        });
    },

    components: {
        BaseAnimation,
        AppHeader,
        BaseModal,
        AppFooter
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
    top: 100vh;
    left: 42vw;
}

.fade-leave-active {
    transition: opacity 1.5s ease;
}

.fade-leave-to {
    opacity: 0;
}
</style>
