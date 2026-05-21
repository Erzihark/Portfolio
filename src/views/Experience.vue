<template>
    <section class="experience">
        <div class="experience__background-glow"></div>

        <div class="experience__container">
            <!-- EVOLVE -->
            <article class="experience__card">
                <div class="experience__header">
                    <div>
                        <h3 class="experience__role">Front End Engineer</h3>

                        <div class="experience__company">Evolve Media LLC · Remote</div>
                    </div>

                    <div class="experience__date">Oct 2022 – Apr 2026</div>
                </div>

                <ul class="experience__list">
                    <li class="experience__item">
                        Improved application performance by reducing Largest Contentful Paint from
                        ~3s to ~0.7s (peaks 5s → 1s) through optimizations in rendering, lazy
                        loading, state management, data loading and bundling, significantly
                        enhancing internal productivity.
                    </li>

                    <li class="experience__item">
                        Refactored frontend architecture across React and Angular applications,
                        including Redux optimizations, migrations from React 16 to 19, and Angular
                        10 to 18 upgrades, improving performance, stability, maintainability and
                        reliability through enhanced error handling.
                    </li>

                    <li class="experience__item">
                        Standardized and scaled frontend systems by migrating more than 20 forms to
                        React Hook Form with reusable validation schemas and introducing type-safe
                        models and shared abstractions across ~50 modules.
                    </li>

                    <li class="experience__item">
                        Built and optimized data-heavy (1000+ entries) interfaces and complex
                        multi-step workflows with shared validation state, pagination, filters,
                        search parameters and conditional rendering using Vue.js and Vuetify.
                    </li>

                    <li class="experience__item">
                        Developed and integrated interactive, multiplatform ad experiences (2D, AR
                        and physics-based) using Vue.js, Phaser, Three.js and ammo.js, including
                        real-time event tracking via postMessage for analytics and BI systems.
                    </li>

                    <li class="experience__item">
                        Improved reliability by implementing extensive end-to-end testing suites
                        with Cypress and Playwright, significantly reducing production bugs and
                        enabling safe large-scale refactoring.
                    </li>

                    <li class="experience__item">
                        Authored technical documentation defining API contracts, improving
                        collaboration between frontend and backend teams.
                    </li>
                </ul>
            </article>

            <!-- UNDOSTRES -->
            <article class="experience__card">
                <div class="experience__header">
                    <div>
                        <h3 class="experience__role">Software Engineer</h3>

                        <div class="experience__company">UnDosTres · Remote</div>
                    </div>

                    <div class="experience__date">Jul 2021 – Jul 2022</div>
                </div>

                <ul class="experience__list">
                    <li class="experience__item">
                        Developed a credit card statement generation system by building an
                        HTML-to-PDF pipeline in PHP and integrating with Go microservices to process
                        and display transaction data.
                    </li>

                    <li class="experience__item">
                        Implemented a heap-based algorithm in Go to efficiently compute top spending
                        categories, enabling real-time insights without full dataset reprocessing.
                    </li>

                    <li class="experience__item">
                        Contributed to backend API development and data modeling for credit card
                        services, supporting transaction categorization and reporting features.
                    </li>

                    <li class="experience__item">
                        Built onboarding and payment flows using Kotlin-based webviews, enabling
                        users to apply for and manage credit cards across mobile platforms.
                    </li>

                    <li class="experience__item">
                        Contributed to a PHP SDK that enabled third-party merchants to integrate
                        with the company’s e-commerce platform.
                    </li>
                </ul>
            </article>
        </div>
    </section>
</template>

<script>
export default {
    name: 'ExperienceView'
};
</script>

<style lang="scss" scoped>
.experience {
    position: relative;
    width: 100%;
    overflow: hidden;
    color: #f0f6fc;
    font-size: 12px;

    &__background-glow {
        position: absolute;

        top: 20%;
        left: 50%;

        width: 600px;
        height: 600px;

        transform: translateX(-50%);

        background: radial-gradient(circle, rgba(144, 207, 56, 0.12) 0%, rgba(144, 207, 56, 0) 70%);

        pointer-events: none;
    }

    &__container {
        position: relative;
        padding: 8px;
        z-index: 1;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 32px;
    }

    &__title {
        font-size: 3rem;
        color: #90cf38;

        margin-bottom: 24px;

        text-shadow: 0 0 12px rgba(144, 207, 56, 0.3);
    }

    &__card {
        position: relative;
        padding: 8px;

        border-radius: 20px;

        background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));

        border: 1px solid rgba(144, 207, 56, 0.18);

        backdrop-filter: blur(14px);

        box-shadow:
            0 0 30px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);

        transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease;

        &:hover {
            transform: translateY(-4px);

            border-color: rgba(144, 207, 56, 0.4);

            box-shadow:
                0 0 40px rgba(144, 207, 56, 0.08),
                0 0 20px rgba(0, 0, 0, 0.35);
        }
    }

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        text-align: left;
        margin-bottom: 28px;
        padding-left: 8px;

        @media (max-width: 768px) {
            flex-direction: column;
        }
    }

    &__role {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 700;
        color: #ffffff;
    }

    &__company {
        margin-top: 6px;
        font-size: 0.8rem;
        color: #90cf38;
    }

    &__date {
        padding-top: 4px;
        font-size: 0.7rem;
        color: rgba(240, 246, 252, 0.65);
        white-space: nowrap;
    }

    &__list {
        text-align: left;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    &__item {
        position: relative;
        color: rgba(240, 246, 252, 0.88);
        line-height: 1.5;
        font-size: 0.8rem;
        margin-left: 16px;

        &::marker {
            color: #90cf38;
        }
    }
}
</style>
