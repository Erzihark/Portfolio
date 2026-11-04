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
                <span v-if="!isMobile" class="header__logo__role">{{ $t('header.role') }}</span>
            </div>
        </div>

        <!-- Desktop Navigation -->
        <nav
            v-if="!isMobile"
            class="header__navigation-buttons"
            :aria-label="$t('header.sections')"
        >
            <button
                v-for="planet of planetButtons"
                :key="planet.text"
                :disabled="isPlanetTransitioning"
                class="header__navigation-buttons__button cursor-pointer bruno-ace-sc-regular"
                @click="go($event, planet.go_to)"
            >
                {{ planet.text }}
            </button>
            <button
                :disabled="isPlanetTransitioning"
                class="header__navigation-buttons__button header__navigation-buttons__button--cta cursor-pointer bruno-ace-sc-regular"
                @click="go($event, 'contact')"
            >
                {{ $t('header.cta') }}
            </button>
        </nav>

        <div
            v-if="!isMobile"
            class="header__language"
            role="group"
            :aria-label="$t('header.language')"
        >
            <button
                v-for="lang in languages"
                :key="lang.code"
                type="button"
                class="header__language__button"
                :class="{ 'header__language__button--active': $locale === lang.code }"
                :aria-pressed="$locale === lang.code"
                :aria-label="lang.label"
                :lang="lang.code"
                @click="$setLocale(lang.code)"
            >
                {{ lang.code.toUpperCase() }}
            </button>
        </div>

        <!-- Mobile Hamburger -->
        <div v-else class="header__mobile">
            <button
                class="header__mobile__hamburger cursor-pointer"
                :aria-expanded="menuOpen"
                :aria-label="$t('header.menu')"
                @click="menuOpen = !menuOpen"
            >
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
                    <button
                        :disabled="isPlanetTransitioning"
                        class="header__mobile__menu__button header__mobile__menu__button--cta bruno-ace-sc-regular"
                        @click="go($event, 'contact')"
                    >
                        {{ $t('header.cta') }}
                    </button>
                    <div
                        class="header__mobile__language"
                        role="group"
                        :aria-label="$t('header.language')"
                    >
                        <button
                            v-for="lang in languages"
                            :key="lang.code"
                            type="button"
                            class="header__language__button"
                            :class="{ 'header__language__button--active': $locale === lang.code }"
                            :aria-pressed="$locale === lang.code"
                            :aria-label="lang.label"
                            :lang="lang.code"
                            @click="$setLocale(lang.code)"
                        >
                            {{ lang.code.toUpperCase() }}
                        </button>
                    </div>
                </div>
            </transition>
        </div>

        <div v-if="!isMobile" class="header__placeholder"></div>
    </header>
</template>

<script>
import emitter from '@/services/emitter.service';
import { EVENTS } from '@/constants/events';
import { planetLabel } from '@/constants/planets';

export default {
    props: ['isPlanetTransitioning', 'setModal', 'isMobile'],

    data() {
        return {
            menuOpen: false,

            languages: [
                { code: 'en', label: 'English' },
                { code: 'es', label: 'Español' }
            ]
        };
    },

    computed: {
        planetButtons() {
            return ['home', 'skills', 'projects', 'experience'].map((id) => ({
                text: planetLabel(id),
                go_to: id
            }));
        }
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

        &__role {
            display: block;
            margin-top: 2px;
            color: rgba(240, 246, 252, 0.7);
            font-size: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
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

            &:focus-visible {
                outline: 2px solid #90cf38;
                outline-offset: 2px;
            }

            &:disabled {
                background-image: unset;
                background-color: #17221991;
            }

            // Primary call to action: one per screen
            &--cta {
                background-image: none;
                background-color: #90cf38;
                border-color: #90cf38;
                color: #08110a;
                font-weight: 700;

                &:hover:not(:disabled) {
                    background-color: #a6e04f;
                }

                &:disabled {
                    background-color: #3b4f1c;
                    color: rgba(240, 246, 252, 0.5);
                }
            }
        }
    }

    &__language,
    &__mobile__language {
        display: flex;
        flex: none;
        border: 1px solid rgba(46, 160, 67, 0.4);
        border-radius: 6px;
        overflow: hidden;

        &__button {
            min-width: 44px;
            min-height: 36px;
            border: none;
            background: rgba(10, 15, 20, 0.6);
            color: rgba(240, 246, 252, 0.8);
            font-family: 'Michroma', sans-serif;
            font-size: 11px;
            cursor: pointer;

            &:hover {
                color: #ffffff;
            }

            &:focus-visible {
                outline: 2px solid #90cf38;
                outline-offset: -2px;
            }

            &--active {
                background: #90cf38;
                color: #08110a;
                font-weight: 700;

                &:hover {
                    color: #08110a;
                }
            }
        }
    }

    &__mobile__language {
        align-self: stretch;

        .header__language__button {
            flex: 1;
            min-height: 44px;
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

                padding: 12px 10px;

                background-color: unset;

                &:disabled {
                    background-image: unset;
                    background-color: #17221991;
                }

                &--cta {
                    background-image: none;
                    background-color: #90cf38;
                    border-color: #90cf38;
                    color: #08110a;
                    font-weight: 700;
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
