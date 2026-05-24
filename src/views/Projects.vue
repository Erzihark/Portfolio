<template>
    <section class="projects">
        <div class="projects__background-glow"></div>

        <div class="projects__container">
            <div class="projects__intro">
                <span class="projects__eyebrow">Interactive Experiments</span>

                <h2 class="projects__title">
                    Small projects focused on interaction, animation and problem solving.
                </h2>

                <p class="projects__description">
                    A collection of lightweight frontend experiments exploring gameplay systems,
                    rendering, animations and algorithm visualization.
                </p>
            </div>

            <div class="projects__grid">
                <!-- 2048 -->
                <article class="projects__card">
                    <div class="projects__card-glow"></div>

                    <div class="projects__content">
                        <div class="projects__top">
                            <div class="projects__icon">▣</div>

                            <div>
                                <h3 class="projects__project-title">2048 Clone</h3>

                                <div class="projects__stack">JavaScript · Vue · Game Logic</div>
                            </div>
                        </div>

                        <p class="projects__text">
                            Recreation of the classic 2048 puzzle game featuring smooth tile
                            animations, score tracking, keyboard controls and responsive gameplay
                            systems.
                        </p>

                        <div class="projects__tags">
                            <span class="projects__tag">Animations</span>
                            <span class="projects__tag">State Management</span>
                            <span class="projects__tag">Game Logic</span>
                        </div>

                        <div class="projects__links">
                            <a
                                href="https://2048masac.netlify.app/"
                                target="_blank"
                                class="projects__link"
                            >
                                Live Demo
                            </a>

                            <a
                                href="https://github.com/Erzihark/2048"
                                target="_blank"
                                class="projects__link projects__link--secondary"
                            >
                                GitHub
                            </a>
                        </div>
                    </div>
                </article>

                <!-- MEMORY GAME -->
                <article class="projects__card">
                    <div class="projects__card-glow"></div>

                    <div class="projects__content">
                        <div class="projects__top">
                            <div class="projects__icon">◈</div>

                            <div>
                                <h3 class="projects__project-title">Memory Card Game</h3>

                                <div class="projects__stack">Vue · CSS Animations · UX</div>
                            </div>
                        </div>

                        <p class="projects__text">
                            Interactive memory game with animated card transitions, score tracking
                            and responsive layouts designed for smooth gameplay across devices.
                        </p>

                        <div class="projects__tags">
                            <span class="projects__tag">Transitions</span>
                            <span class="projects__tag">Responsive</span>
                            <span class="projects__tag">UI Systems</span>
                        </div>

                        <div class="projects__links">
                            <a
                                href="https://memory-masac.netlify.app/"
                                target="_blank"
                                class="projects__link"
                            >
                                Live Demo
                            </a>

                            <a
                                href="https://github.com/Erzihark/memoryGame"
                                target="_blank"
                                class="projects__link projects__link--secondary"
                            >
                                GitHub
                            </a>
                        </div>
                    </div>
                </article>

                <!-- SORTING VISUALIZER -->
                <article class="projects__card">
                    <div class="projects__card-glow"></div>

                    <div class="projects__content">
                        <div class="projects__top">
                            <div class="projects__icon">⬡</div>

                            <div>
                                <h3 class="projects__project-title">Sorting Visualizer</h3>

                                <div class="projects__stack">
                                    Algorithms · Visualization · JavaScript
                                </div>
                            </div>
                        </div>

                        <p class="projects__text">
                            Visualization tool for classic sorting algorithms featuring animated
                            comparisons, configurable speeds and real-time rendering of sorting
                            operations.
                        </p>

                        <div class="projects__tags">
                            <span class="projects__tag">Algorithms</span>
                            <span class="projects__tag">Data Visualization</span>
                            <span class="projects__tag">Rendering</span>
                        </div>

                        <div class="projects__links">
                            <a
                                href="https://sorting-visualizer-masac.netlify.app/"
                                target="_blank"
                                class="projects__link"
                            >
                                Live Demo
                            </a>

                            <a
                                href="https://github.com/Erzihark/sortingVisualizer"
                                target="_blank"
                                class="projects__link projects__link--secondary"
                            >
                                GitHub
                            </a>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'ProjectsView'
};
</script>

<style lang="scss" scoped>
.projects {
    position: relative;
    width: 100%;
    overflow: hidden;
    color: #f0f6fc;

    &__background-glow {
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        width: 700px;
        height: 700px;
        background: radial-gradient(circle, rgba(144, 207, 56, 0.08) 0%, rgba(144, 207, 56, 0) 70%);
        pointer-events: none;
    }

    &__container {
        position: relative;
        z-index: 1;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 32px;
    }

    &__intro {
        display: flex;
        flex-direction: column;
        gap: 12px;
        text-align: left;
    }

    &__eyebrow {
        color: #90cf38;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-family: monospace;
    }

    &__title {
        margin: 0;
        font-size: 1.1rem;
        line-height: 1.2;
        color: #ffffff;
        max-width: 700px;
    }

    &__description {
        margin: 0;
        max-width: 700px;
        line-height: 1.7;
        color: rgba(240, 246, 252, 0.7);
        font-size: 0.95rem;
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 20px;
    }

    &__card {
        position: relative;
        overflow: hidden;
        border-radius: 24px;
        border: 1px solid rgba(144, 207, 56, 0.15);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
        backdrop-filter: blur(14px);
        transition:
            transform 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;

        &:hover {
            transform: translateY(-6px);
            border-color: rgba(144, 207, 56, 0.35);
            box-shadow:
                0 0 30px rgba(144, 207, 56, 0.08),
                0 0 60px rgba(0, 0, 0, 0.25);

            .projects__card-glow {
                opacity: 1;
            }
        }
    }

    &__card-glow {
        position: absolute;
        inset: 0;
        opacity: 0;
        transition: opacity 0.3s ease;
        background: radial-gradient(circle at top, rgba(144, 207, 56, 0.15), transparent 60%);
        pointer-events: none;
    }

    &__content {
        position: relative;
        z-index: 1;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    &__top {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    &__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 52px;
        min-height: 52px;
        border-radius: 16px;
        background: rgba(144, 207, 56, 0.08);
        border: 1px solid rgba(144, 207, 56, 0.2);
        color: #90cf38;
        font-size: 1.4rem;
        box-shadow: 0 0 18px rgba(144, 207, 56, 0.12);
    }

    &__project-title {
        margin: 0;
        color: #ffffff;
        font-size: 1.1rem;
    }

    &__stack {
        margin-top: 6px;
        font-size: 0.75rem;
        color: rgba(240, 246, 252, 0.55);
        font-family: monospace;
    }

    &__text {
        margin: 0;
        color: rgba(240, 246, 252, 0.78);
        line-height: 1.7;
        font-size: 0.92rem;
    }

    &__tags {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    &__tag {
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(144, 207, 56, 0.08);
        border: 1px solid rgba(144, 207, 56, 0.15);
        color: #c8f28d;
        font-size: 0.72rem;
        font-family: monospace;
    }

    &__links {
        display: flex;
        gap: 12px;
        margin-top: auto;
        flex-wrap: wrap;
    }

    &__link {
        text-decoration: none;
        padding: 10px 14px;
        border-radius: 12px;
        background: #90cf38;
        color: #08110a;
        font-size: 0.82rem;
        font-weight: 700;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 20px rgba(144, 207, 56, 0.25);
        }

        &--secondary {
            background: rgba(255, 255, 255, 0.04);
            color: #f0f6fc;
            border: 1px solid rgba(255, 255, 255, 0.08);

            &:hover {
                box-shadow: 0 0 18px rgba(255, 255, 255, 0.08);
            }
        }
    }

    @media (max-width: 768px) {
        &__title {
            font-size: 1.1rem;
        }

        &__description {
            font-size: 0.9rem;
        }

        &__content {
            padding: 12px;
        }
    }
}
</style>
