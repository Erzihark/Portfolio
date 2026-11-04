<template>
    <section class="services">
        <div class="services__glow"></div>

        <div class="services__container">
            <header class="services__intro">
                <div class="services__eyebrow">{{ $t('services.eyebrow') }}</div>
                <h2 class="services__heading">{{ $t('services.heading') }}</h2>
            </header>

            <div class="services__grid">
                <article
                    v-for="(service, index) in $t('services.items')"
                    :key="service.number"
                    class="services__card"
                >
                    <div class="services__icon" aria-hidden="true">
                        <i :class="icons[index]"></i>
                    </div>
                    <div class="services__number" aria-hidden="true">{{ service.number }}</div>
                    <h3 class="services__title">{{ service.title }}</h3>
                    <p class="services__text">{{ service.text }}</p>
                </article>
            </div>

            <div class="services__reassure">
                <h3 class="services__reassure-title">{{ $t('services.noNeedTitle') }}</h3>
                <p class="services__reassure-text">{{ $t('services.noNeedText') }}</p>
            </div>

            <section class="services__process" aria-labelledby="process-title">
                <h3 id="process-title" class="services__process-title">
                    {{ $t('services.processTitle') }}
                </h3>
                <ol class="services__steps">
                    <li
                        v-for="(step, index) in $t('services.steps')"
                        :key="step.title"
                        class="services__step"
                    >
                        <span class="services__step-number" aria-hidden="true">{{
                            index + 1
                        }}</span>
                        <div>
                            <div class="services__step-title">{{ step.title }}</div>
                            <div class="services__step-text">{{ step.text }}</div>
                        </div>
                    </li>
                </ol>
            </section>

            <section aria-labelledby="tech-title">
                <h3 id="tech-title" class="services__tech-title">{{ $t('services.techTitle') }}</h3>
                <ul class="services__stack">
                    <li v-for="tech in $t('services.tech')" :key="tech">{{ tech }}</li>
                </ul>
            </section>

            <div class="services__cta">
                <p class="services__cta-text">{{ $t('services.cta') }}</p>
                <button type="button" class="services__button" @click="openPlanet('contact')">
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
    name: 'SkillsView',

    data() {
        return {
            icons: [
                'fas fa-bolt',
                'fas fa-cart-shopping',
                'fas fa-chart-line',
                'fas fa-wand-magic-sparkles'
            ]
        };
    },

    methods: {
        openPlanet(id) {
            emitter.emit(EVENTS.OPEN_PLANET, id);
        }
    }
};
</script>

<style lang="scss" scoped>
.services {
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
            radial-gradient(circle at top left, rgba(144, 207, 56, 0.12), transparent 40%),
            radial-gradient(circle at bottom right, rgba(72, 187, 255, 0.08), transparent 35%);
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
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 16px;
    }

    &__card {
        display: flex;
        flex-direction: column;
        gap: 12px;
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

    &__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(144, 207, 56, 0.1);
        border: 1px solid rgba(144, 207, 56, 0.25);
        color: #90cf38;
        font-size: 1.1rem;
    }

    &__card {
        position: relative;
    }

    &__number {
        position: absolute;
        top: 16px;
        right: 20px;
        color: rgba(144, 207, 56, 0.55);
        font-family: 'Michroma', sans-serif;
        font-size: 0.9rem;
    }

    &__title {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #ffffff;
    }

    &__reassure {
        padding: 20px;
        border-radius: 16px;
        background: rgba(144, 207, 56, 0.08);
        border: 1px solid rgba(144, 207, 56, 0.35);
    }

    &__reassure-title {
        margin: 0 0 8px;
        font-size: 1.1rem;
        color: #ffffff;
    }

    &__reassure-text {
        margin: 0;
        color: rgba(240, 246, 252, 0.9);
        font-size: 0.95rem;
        line-height: 1.6;
    }

    &__tech-title {
        margin: 0 0 10px;
        font-size: 0.85rem;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: rgba(240, 246, 252, 0.7);
    }

    &__text {
        margin: 0;
        color: rgba(240, 246, 252, 0.85);
        font-size: 0.95rem;
        line-height: 1.6;
    }

    &__stack {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin: 0;
        padding: 0;
        list-style: none;

        li {
            padding: 4px 10px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: rgba(240, 246, 252, 0.8);
            font-size: 0.78rem;
        }
    }

    &__process {
        padding: 20px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    &__process-title {
        margin: 0 0 16px;
        font-size: 1rem;
        color: #ffffff;
    }

    &__steps {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    &__step {
        display: flex;
        gap: 12px;
    }

    &__step-number {
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #90cf38;
        color: #08110a;
        font-size: 0.85rem;
        font-weight: 700;
    }

    &__step-title {
        font-weight: 600;
        color: #ffffff;
    }

    &__step-text {
        margin-top: 4px;
        color: rgba(240, 246, 252, 0.8);
        font-size: 0.9rem;
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
        color: rgba(240, 246, 252, 0.9);
        font-size: 1rem;
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
