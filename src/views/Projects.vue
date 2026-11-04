<template>
    <section class="work">
        <div class="work__glow"></div>

        <div class="work__container">
            <header class="work__intro">
                <div class="work__eyebrow">{{ $t('work.eyebrow') }}</div>
                <h2 class="work__heading">{{ $t('work.heading') }}</h2>
            </header>

            <!-- FEATURED: WRSI -->
            <article class="work__featured">
                <div class="work__badge">{{ $t('work.badge') }}</div>

                <h3 class="work__featured-title">{{ $t('work.title') }}</h3>
                <p class="work__featured-subtitle">{{ $t('work.subtitle') }}</p>

                <dl class="work__results">
                    <div v-for="item in $t('work.results')" :key="item.label" class="work__result">
                        <dt class="work__result-value">{{ item.value }}</dt>
                        <dd class="work__result-label">{{ item.label }}</dd>
                    </div>
                </dl>

                <div class="work__columns">
                    <div>
                        <h4 class="work__label">{{ $t('work.problemLabel') }}</h4>
                        <p class="work__text">{{ $t('work.problem') }}</p>
                    </div>

                    <div>
                        <h4 class="work__label">{{ $t('work.builtLabel') }}</h4>
                        <ul class="work__list">
                            <li v-for="item in $t('work.built')" :key="item">{{ item }}</li>
                        </ul>
                    </div>
                </div>

                <ul class="work__stack" :aria-label="$t('work.stackLabel')">
                    <li v-for="tech in $t('work.stack')" :key="tech">{{ tech }}</li>
                </ul>

                <div class="work__links">
                    <a
                        href="https://wrsi.expo.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="work__link"
                    >
                        {{ $t('work.liveSite') }}
                        <span class="work__sr-only">{{ $t('common.newTab') }}</span>
                    </a>
                </div>
            </article>

            <!-- EXPERIMENTS -->
            <div class="work__more">
                <h3 class="work__more-title">{{ $t('work.moreTitle') }}</h3>
                <p class="work__more-text">{{ $t('work.moreText') }}</p>
            </div>

            <div class="work__grid">
                <article
                    v-for="(project, index) in $t('work.experiments')"
                    :key="project.title"
                    class="work__card"
                >
                    <div class="work__card-top">
                        <div class="work__icon" aria-hidden="true">
                            <i :class="experiments[index].icon"></i>
                        </div>
                        <div>
                            <h4 class="work__card-title">{{ project.title }}</h4>
                            <div class="work__card-stack">{{ project.stack }}</div>
                        </div>
                    </div>

                    <p class="work__text">{{ project.text }}</p>

                    <div class="work__links">
                        <a
                            :href="experiments[index].demo"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="work__link"
                        >
                            {{ $t('work.liveDemo') }}
                            <span class="work__sr-only">
                                {{ project.title }} {{ $t('common.newTab') }}
                            </span>
                        </a>
                        <a
                            :href="experiments[index].github"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="work__link work__link--secondary"
                        >
                            {{ $t('work.github') }}
                            <span class="work__sr-only">
                                {{ project.title }} {{ $t('common.newTab') }}
                            </span>
                        </a>
                    </div>
                </article>
            </div>

            <div class="work__cta">
                <p class="work__cta-text">{{ $t('work.ctaText') }}</p>
                <button type="button" class="work__button" @click="openPlanet('contact')">
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
    name: 'ProjectsView',

    data() {
        return {
            // Same order as `work.experiments` in the messages file.
            experiments: [
                {
                    icon: 'fas fa-table-cells',
                    demo: 'https://2048masac.netlify.app/',
                    github: 'https://github.com/Erzihark/2048'
                },
                {
                    icon: 'fas fa-clone',
                    demo: 'https://memory-masac.netlify.app/',
                    github: 'https://github.com/Erzihark/memoryGame'
                },
                {
                    icon: 'fas fa-chart-simple',
                    demo: 'https://sorting-visualizer-masac.netlify.app/',
                    github: 'https://github.com/Erzihark/sortingVisualizer'
                }
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
.work {
    position: relative;
    width: 100%;
    overflow: hidden;
    color: #f0f6fc;
    font-family: 'IBM Plex Sans', sans-serif;
    text-align: left;

    &__glow {
        position: absolute;
        top: 5%;
        left: 50%;
        transform: translateX(-50%);
        width: 700px;
        height: 700px;
        max-width: 100%;
        background: radial-gradient(circle, rgba(144, 207, 56, 0.09) 0%, rgba(144, 207, 56, 0) 70%);
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
    }

    &__featured {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 24px;
        border-radius: 20px;
        background: linear-gradient(180deg, rgba(144, 207, 56, 0.1), rgba(255, 255, 255, 0.03));
        border: 1px solid rgba(144, 207, 56, 0.4);
        box-shadow: 0 0 40px rgba(144, 207, 56, 0.08);
    }

    &__badge {
        align-self: flex-start;
        padding: 4px 12px;
        border-radius: 999px;
        background: #90cf38;
        color: #08110a;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
    }

    &__featured-title {
        margin: 0;
        font-size: 1.5rem;
        color: #ffffff;
    }

    &__featured-subtitle {
        margin: 0;
        color: rgba(240, 246, 252, 0.9);
        font-size: 1.05rem;
        line-height: 1.5;
    }

    &__results {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin: 0;
    }

    &__result {
        padding: 14px;
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(144, 207, 56, 0.25);
    }

    &__result-value {
        color: #90cf38;
        font-size: 1.6rem;
        font-weight: 700;
        line-height: 1.1;
    }

    &__result-label {
        margin: 6px 0 0;
        color: rgba(240, 246, 252, 0.85);
        font-size: 0.85rem;
        line-height: 1.4;
    }

    &__columns {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 20px;
    }

    &__label {
        margin: 0 0 8px;
        color: #90cf38;
        font-size: 0.8rem;
        letter-spacing: 1.5px;
        text-transform: uppercase;
    }

    &__text {
        margin: 0;
        color: rgba(240, 246, 252, 0.85);
        font-size: 0.95rem;
        line-height: 1.6;
    }

    &__list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 0;
        padding-left: 18px;
        color: rgba(240, 246, 252, 0.85);
        font-size: 0.95rem;
        line-height: 1.5;

        li::marker {
            color: #90cf38;
        }
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
            background: rgba(144, 207, 56, 0.08);
            border: 1px solid rgba(144, 207, 56, 0.25);
            color: #c8f28d;
            font-size: 0.78rem;
        }
    }

    &__links {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: auto;
    }

    &__link {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        padding: 10px 16px;
        border-radius: 10px;
        background: #90cf38;
        color: #08110a;
        font-size: 0.9rem;
        font-weight: 700;
        text-decoration: none;
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

        &--secondary {
            background: rgba(255, 255, 255, 0.04);
            color: #f0f6fc;
            border: 1px solid rgba(255, 255, 255, 0.25);
        }
    }

    &__more-title {
        margin: 0;
        font-size: 1.1rem;
        color: #ffffff;
    }

    &__more-text {
        margin: 4px 0 0;
        color: rgba(240, 246, 252, 0.8);
        font-size: 0.95rem;
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
    }

    &__card {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 20px;
        border-radius: 16px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
        border: 1px solid rgba(144, 207, 56, 0.15);
        transition:
            transform 0.25s ease,
            border-color 0.25s ease;

        &:hover {
            transform: translateY(-4px);
            border-color: rgba(144, 207, 56, 0.4);
        }
    }

    &__card-top {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    &__icon {
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(144, 207, 56, 0.1);
        border: 1px solid rgba(144, 207, 56, 0.25);
        color: #90cf38;
    }

    &__card-title {
        margin: 0;
        font-size: 1rem;
        color: #ffffff;
    }

    &__card-stack {
        margin-top: 2px;
        font-size: 0.78rem;
        color: rgba(240, 246, 252, 0.7);
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

    &__sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    @media (prefers-reduced-motion: reduce) {
        &__card,
        &__link,
        &__button {
            transition: none;

            &:hover {
                transform: none;
            }
        }
    }
}
</style>
