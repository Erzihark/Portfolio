<template>
    <section class="results">
        <div class="results__glow"></div>

        <div class="results__container">
            <header>
                <div class="results__eyebrow">{{ $t('results.eyebrow') }}</div>
                <h2 class="results__heading">{{ $t('results.heading') }}</h2>
            </header>

            <div class="results__grid">
                <article
                    v-for="item in $t('results.outcomes')"
                    :key="item.label"
                    class="results__card"
                >
                    <div class="results__value">{{ item.value }}</div>
                    <h3 class="results__label">{{ item.label }}</h3>
                    <p class="results__text">{{ item.text }}</p>
                </article>
            </div>

            <section class="results__panel" aria-labelledby="also-title">
                <h3 id="also-title" class="results__panel-title">{{ $t('results.alsoTitle') }}</h3>
                <ul class="results__list">
                    <li v-for="item in $t('results.also')" :key="item">{{ item }}</li>
                </ul>
            </section>

            <section class="results__panel" aria-labelledby="background-title">
                <h3 id="background-title" class="results__panel-title">
                    {{ $t('results.backgroundTitle') }}
                </h3>
                <ul class="results__roles">
                    <li v-for="job in $t('results.roles')" :key="job.company" class="results__role">
                        <div class="results__role-head">
                            <span class="results__role-name">{{ job.role }}</span>
                            <span class="results__role-date">{{ job.date }}</span>
                        </div>
                        <div class="results__role-company">{{ job.company }}</div>
                        <p class="results__role-text">{{ job.text }}</p>
                    </li>
                </ul>
            </section>

            <div class="results__cta">
                <p class="results__cta-text">{{ $t('results.cta') }}</p>
                <button type="button" class="results__button" @click="openPlanet('contact')">
                    {{ $t('common.startProject') }}
                </button>
            </div>
        </div>
    </section>
</template>

<script>
import emitter from '@/services/emitter.service';
import { EVENTS } from '@/constants/events';

export default {
    name: 'ExperienceView',

    methods: {
        openPlanet(id) {
            emitter.emit(EVENTS.OPEN_PLANET, id);
        }
    }
};
</script>

<style lang="scss" scoped>
.results {
    position: relative;
    width: 100%;
    overflow: hidden;
    color: #f0f6fc;
    font-family: 'IBM Plex Sans', sans-serif;
    text-align: left;

    &__glow {
        position: absolute;
        top: 15%;
        left: 50%;
        transform: translateX(-50%);
        width: 600px;
        height: 600px;
        max-width: 100%;
        background: radial-gradient(circle, rgba(144, 207, 56, 0.1) 0%, rgba(144, 207, 56, 0) 70%);
        pointer-events: none;
    }

    &__container {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 12px;
    }

    &__eyebrow {
        color: #90cf38;
        font-size: 0.8rem;
        letter-spacing: 2px;
        text-transform: uppercase;
        font-weight: 600;
    }

    &__heading {
        margin: 8px 0 0;
        font-size: clamp(1.2rem, 3.5vw, 1.6rem);
        line-height: 1.25;
        color: #ffffff;
        text-wrap: balance;
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;
    }

    &__card {
        padding: 20px;
        border-radius: 16px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
        border: 1px solid rgba(144, 207, 56, 0.18);
        transition:
            transform 0.25s ease,
            border-color 0.25s ease;

        &:hover {
            transform: translateY(-4px);
            border-color: rgba(144, 207, 56, 0.4);
        }
    }

    &__value {
        color: #90cf38;
        font-size: 1.6rem;
        font-weight: 700;
        line-height: 1.1;
        text-shadow: 0 0 12px rgba(144, 207, 56, 0.3);
    }

    &__label {
        margin: 8px 0;
        font-size: 1rem;
        font-weight: 600;
        color: #ffffff;
    }

    &__text {
        margin: 0;
        color: rgba(240, 246, 252, 0.85);
        font-size: 0.92rem;
        line-height: 1.6;
    }

    &__panel {
        padding: 20px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    &__panel-title {
        margin: 0 0 12px;
        font-size: 1rem;
        color: #ffffff;
    }

    &__list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 0;
        padding-left: 18px;
        color: rgba(240, 246, 252, 0.85);
        font-size: 0.92rem;
        line-height: 1.5;

        li::marker {
            color: #90cf38;
        }
    }

    &__roles {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    &__role-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 4px 16px;
    }

    &__role-name {
        font-weight: 600;
        color: #ffffff;
    }

    &__role-date {
        color: rgba(240, 246, 252, 0.7);
        font-size: 0.85rem;
    }

    &__role-company {
        margin-top: 2px;
        color: #90cf38;
        font-size: 0.88rem;
    }

    &__role-text {
        margin: 6px 0 0;
        color: rgba(240, 246, 252, 0.85);
        font-size: 0.92rem;
        line-height: 1.5;
    }

    &__cta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    &__cta-text {
        margin: 0;
        font-size: 1rem;
        color: rgba(240, 246, 252, 0.9);
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
            box-shadow 0.2s ease;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 20px rgba(144, 207, 56, 0.3);
        }

        &:focus-visible {
            outline: 2px solid #ffffff;
            outline-offset: 2px;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        &__card,
        &__button {
            transition: none;

            &:hover {
                transform: none;
            }
        }
    }
}
</style>
