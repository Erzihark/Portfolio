<template>
    <section class="about">
        <div class="about__glow"></div>

        <div class="about__container">
            <div class="about__person">
                <img
                    class="about__avatar"
                    src="../assets/profile.jpg"
                    :alt="$t('home.portraitAlt')"
                    width="72"
                    height="72"
                />

                <div>
                    <div class="about__name">Manuel Carretero</div>
                    <div class="about__availability">
                        <span class="about__dot" aria-hidden="true"></span>
                        {{ $t('home.availability') }}
                    </div>
                </div>
            </div>

            <div class="about__eyebrow">{{ $t('home.eyebrow') }}</div>

            <h1 class="about__title">
                {{ $t('home.titleBefore')
                }}<span class="about__title-highlight">{{ $t('home.titleHighlight') }}</span
                >{{ $t('home.titleAfter') }}
            </h1>

            <p class="about__description">{{ $t('home.description') }}</p>

            <div class="about__actions">
                <button type="button" class="about__button" @click="openPlanet('contact')">
                    {{ $t('common.startProject') }}
                </button>
                <button
                    type="button"
                    class="about__button about__button--secondary"
                    @click="openPlanet('projects')"
                >
                    {{ $t('home.seeWork') }}
                </button>
            </div>

            <dl class="about__stats">
                <div v-for="stat in $t('home.stats')" :key="stat.label" class="about__stat">
                    <dt class="about__stat-value">{{ stat.value }}</dt>
                    <dd class="about__stat-label">{{ stat.label }}</dd>
                </div>
            </dl>

            <ul class="about__tags" :aria-label="$t('home.tagsLabel')">
                <li v-for="tag in $t('home.tags')" :key="tag" class="about__tag">{{ tag }}</li>
            </ul>
        </div>
    </section>
</template>

<script>
import emitter from '@/services/emitter.service';
import { EVENTS } from '@/constants/events';

export default {
    name: 'HomeView',

    methods: {
        openPlanet(id) {
            emitter.emit(EVENTS.OPEN_PLANET, id);
        }
    }
};
</script>

<style lang="scss" scoped>
.about {
    position: relative;
    width: 100%;
    overflow: hidden;
    color: #f0f6fc;
    font-family: 'IBM Plex Sans', sans-serif;
    text-align: left;

    &__glow {
        position: absolute;
        inset: 0;
        background:
            radial-gradient(circle at top left, rgba(144, 207, 56, 0.15), transparent 40%),
            radial-gradient(circle at bottom right, rgba(72, 187, 255, 0.08), transparent 40%);
        pointer-events: none;
    }

    &__container {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 12px;
    }

    &__person {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    &__avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(144, 207, 56, 0.5);
    }

    &__name {
        font-size: 1rem;
        font-weight: 600;
        color: #ffffff;
    }

    &__availability {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
        font-size: 0.85rem;
        color: #c8f28d;
    }

    &__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #90cf38;
        box-shadow: 0 0 8px rgba(144, 207, 56, 0.8);
    }

    &__eyebrow {
        color: #90cf38;
        font-size: 0.8rem;
        letter-spacing: 2px;
        text-transform: uppercase;
        font-weight: 600;
    }

    &__title {
        margin: 0;
        font-size: clamp(1.4rem, 4vw, 2rem);
        line-height: 1.2;
        font-weight: 700;
        color: #ffffff;
        text-wrap: balance;
    }

    &__title-highlight {
        color: #90cf38;
        text-shadow: 0 0 12px rgba(144, 207, 56, 0.35);
    }

    &__description {
        margin: 0;
        max-width: 60ch;
        color: rgba(240, 246, 252, 0.88);
        line-height: 1.65;
        font-size: 1rem;
    }

    &__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
    }

    &__button {
        min-height: 44px;
        padding: 12px 20px;
        border-radius: 10px;
        border: 1px solid #90cf38;
        background: #90cf38;
        color: #08110a;
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background-color 0.2s ease;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 20px rgba(144, 207, 56, 0.3);
        }

        &:focus-visible {
            outline: 2px solid #ffffff;
            outline-offset: 2px;
        }

        &--secondary {
            background: rgba(255, 255, 255, 0.04);
            color: #f0f6fc;
            border-color: rgba(255, 255, 255, 0.25);

            &:hover {
                box-shadow: 0 0 18px rgba(255, 255, 255, 0.1);
            }
        }
    }

    &__stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 12px;
        margin: 0;
    }

    &__stat {
        padding: 16px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(144, 207, 56, 0.18);
    }

    &__stat-value {
        margin-bottom: 6px;
        color: #90cf38;
        font-size: 1.2rem;
        font-weight: 700;
    }

    &__stat-label {
        margin: 0;
        color: rgba(240, 246, 252, 0.78);
        font-size: 0.85rem;
        line-height: 1.4;
    }

    &__tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    &__tag {
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(144, 207, 56, 0.08);
        border: 1px solid rgba(144, 207, 56, 0.25);
        color: #c8f28d;
        font-size: 0.8rem;
    }

    @media (prefers-reduced-motion: reduce) {
        &__button {
            transition: none;

            &:hover {
                transform: none;
            }
        }
    }
}
</style>
