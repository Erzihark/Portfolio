<template>
    <header class="header">
        <div class="header__logo">
            <img
                class="header__logo__image"
                :width="isMobile ? 30 : 50"
                :height="isMobile ? 30 : 50"
                src="../assets/logo.webp"
            />

            <div
                class="header__logo__text michroma-regular"
                :class="{ 'header__logo__text--mobile': isMobile }"
            >
                Manuel Carretero
            </div>
        </div>

        <!-- Desktop Navigation -->
        <div v-if="!isMobile" class="header__navigation-buttons">
            <button
                v-for="planet of planetButtons"
                :key="planet.text"
                :disabled="isPlanetTransitioning"
                class="header__navigation-buttons__button cursor-pointer bruno-ace-sc-regular"
                @click="go($event, planet.go_to)"
            >
                {{ planet.text }}
            </button>
        </div>

        <!-- Mobile Hamburger -->
        <div v-else class="header__mobile">
            <button class="header__mobile__hamburger cursor-pointer" @click="menuOpen = !menuOpen">
                ☰
            </button>

            <transition name="mobile-menu">
                <div v-if="menuOpen" class="header__mobile__menu">
                    <button
                        v-for="planet of planetButtons"
                        :key="planet.text"
                        :disabled="isPlanetTransitioning"
                        class="header__mobile__menu__button bruno-ace-sc-regular"
                        @click="go($event, planet.go_to)"
                    >
                        {{ planet.text }}
                    </button>
                </div>
            </transition>
        </div>

        <div v-if="!isMobile" class="header__placeholder"></div>
    </header>
</template>

<script>
import emitter from '@/services/emitter.service';
import { EVENTS } from '@/constants/events';

export default {
    props: ['isPlanetTransitioning', 'setModal', 'isMobile'],

    data() {
        return {
            menuOpen: false,

            planetButtons: [
                { text: 'Home', go_to: 'home' },
                { text: 'Experience', go_to: 'experience' },
                { text: 'Skills', go_to: 'skills' },
                { text: 'Projects', go_to: 'projects' },
                { text: 'Contact', go_to: 'contact' }
            ]
        };
    },

    methods: {
        go(event, id) {
            this.menuOpen = false;

            emitter.emit(EVENTS.NAVIGATE_TO, { event, id });
        }
    }
};
</script>

<style lang="scss" scoped>
.header {
    position: fixed;
    width: calc(100% - 16px);
    height: 50px;
    z-index: 10;

    display: flex;
    flex-direction: row;
    align-items: center;

    margin: 8px;

    &__logo {
        display: flex;
        padding: 4px;
        justify-content: center;
        z-index: 12;

        &__text {
            color: #90cf38;
            line-height: 1.1;
            align-self: center;

            &--mobile {
                font-size: 12px;
            }
        }
    }

    &__navigation-buttons {
        display: flex;
        justify-content: center;
        align-items: center;

        gap: 8px;

        width: 100%;
        height: 100%;

        &__button {
            background-image: linear-gradient(#2ea04391, #2ea04344);
            border: 2px solid rgba(46, 160, 67, 0.4);
            border-radius: 4px 4px 24px 4px;
            color: #f0f6fc;
            padding: 8px 12px 8px 8px;
            text-align: center;
            background-color: unset;

            transition:
                background-color 0.2s,
                transform 0.2s;

            &:hover {
                background-color: #2ea04391;
                transform: translateY(-1px);
            }

            &:disabled {
                background-image: unset;
                background-color: #17221991;
            }
        }
    }

    &__mobile {
        margin-left: auto;
        position: relative;

        &__hamburger {
            width: 42px;
            height: 42px;

            border-radius: 6px;
            border: 2px solid rgba(46, 160, 67, 0.4);
            background-color: unset;

            background-image: linear-gradient(#2ea04391, #2ea04344);

            color: #f0f6fc;
            font-size: 22px;

            display: flex;
            justify-content: center;
            align-items: center;
        }

        &__menu {
            position: absolute;

            top: 52px;
            right: 0;

            width: 180px;

            display: flex;
            flex-direction: column;

            gap: 8px;

            padding: 12px;

            border-radius: 10px;

            background: rgba(10, 15, 20, 0.95);
            border: 1px solid rgba(46, 160, 67, 0.4);

            backdrop-filter: blur(10px);

            &__button {
                background-image: linear-gradient(#2ea04391, #2ea04344);

                border: 2px solid rgba(46, 160, 67, 0.4);
                border-radius: 4px;

                color: #f0f6fc;

                padding: 10px;

                background-color: unset;

                &:disabled {
                    background-image: unset;
                    background-color: #17221991;
                }
            }
        }
    }

    &__placeholder {
        width: 22%;
    }
}

/* Transition */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
