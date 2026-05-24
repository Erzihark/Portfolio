<template>
    <section class="about">
        <div class="about__background-grid"></div>
        <div class="about__background-glow"></div>

        <div class="about__container">
            <!-- LEFT -->
            <div class="about__content">
                <div class="about__eyebrow">SOFTWARE ENGINEER</div>

                <h1 class="about__title">
                    Building fast,
                    <span class="about__title-highlight"> interactive </span>
                    and scalable digital experiences.
                </h1>

                <p class="about__description">
                    Software Engineer with 5++ years of experience building high-performance web
                    applications and interactive experiences using modern frontend ecosystems.
                </p>

                <p class="about__description">
                    Specialized in Frontend development with React and Vue, with a strong focus on
                    performance optimization, scalable architecture, and complex UI systems — from
                    enterprise platforms to immersive 2D, 3D and AR-powered experiences.
                </p>

                <p class="about__description">
                    Passionate about solving complex engineering challenges at the intersection of
                    performance, user experience and system design.
                </p>

                <div class="about__tags">
                    <div class="about__tag">React</div>
                    <div class="about__tag">Vue</div>
                    <div class="about__tag">Three.js</div>
                    <div class="about__tag">TypeScript</div>
                    <div class="about__tag">Performance</div>
                    <div class="about__tag">UI Systems</div>
                </div>
            </div>

            <!-- RIGHT -->
            <div class="about__panel">
                <div class="about__panel-overlay"></div>

                <!-- IMAGE -->
                <div class="about__image-wrapper">
                    <div class="about__image-glow"></div>

                    <img class="about__image" src="../assets/profile.jpg" alt="Profile" />
                </div>

                <div class="about__stats">
                    <div class="about__stat">
                        <div class="about__stat-value">5+</div>

                        <div class="about__stat-label">Years of Experience</div>
                    </div>

                    <div class="about__stat">
                        <div class="about__stat-value">2D / 3D</div>

                        <div class="about__stat-label">Interactive Systems</div>
                    </div>
                </div>

                <div class="about__terminal">
                    <div class="about__terminal-header">
                        <div class="about__terminal-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>

                        <div class="about__terminal-title">system.log</div>
                    </div>

                    <div class="about__terminal-content">
                        <div>> initializing frontend systems...</div>

                        <div>> optimizing rendering pipeline...</div>

                        <div>> loading interactive modules...</div>

                        <div class="about__terminal-success">> status: operational</div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'HomeView'
};
</script>

<style lang="scss" scoped>
.about {
    position: relative;
    width: 100%;
    overflow: hidden;
    color: #f0f6fc;
    font-size: 12px;

    &__background-grid {
        position: absolute;
        inset: 0;
        background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 30px 30px;
        mask-image: radial-gradient(circle at center, black 30%, transparent 100%);
        pointer-events: none;
    }

    &__background-glow {
        position: absolute;
        inset: 0;
        background:
            radial-gradient(circle at top left, rgba(144, 207, 56, 0.15), transparent 35%),
            radial-gradient(circle at bottom right, rgba(72, 187, 255, 0.08), transparent 35%);

        pointer-events: none;
    }

    &__container {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 24px;
        padding: 8px;

        @media (max-width: 900px) {
            grid-template-columns: 1fr;
        }
    }

    &__content,
    &__panel {
        position: relative;
        border-radius: 24px;
        padding: 20px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
        border: 1px solid rgba(144, 207, 56, 0.14);
        backdrop-filter: blur(14px);
        box-shadow:
            0 0 30px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    &__eyebrow {
        margin-bottom: 16px;
        color: #90cf38;
        font-size: 0.75rem;
        letter-spacing: 2px;
        font-family: monospace;
    }

    &__title {
        margin: 0 0 20px;
        font-size: clamp(0.8rem, 3vw, 1.4rem);
        line-height: 1.1;
        font-weight: 800;
        color: #ffffff;
    }

    &__title-highlight {
        color: #90cf38;
        text-shadow: 0 0 12px rgba(144, 207, 56, 0.35);
    }

    &__description {
        margin: 0 0 18px;
        color: rgba(240, 246, 252, 0.82);
        line-height: 1.5;
        font-size: 0.9rem;
        text-align: left;
        font-family: monospace;
    }

    &__tags {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 28px;
    }

    &__tag {
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(144, 207, 56, 0.08);
        border: 1px solid rgba(144, 207, 56, 0.2);
        color: #90cf38;
        font-size: 0.75rem;
        letter-spacing: 1px;
        font-family: monospace;
    }

    &__panel {
        overflow: hidden;
    }

    &__panel-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(144, 207, 56, 0.08), transparent 40%);
        pointer-events: none;
    }

    &__image-wrapper {
        position: relative;
        margin-bottom: 20px;
        border-radius: 24px;
        overflow: hidden;
        max-width: 280px;
        border: 1px solid rgba(144, 207, 56, 0.2);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
        margin-left: auto;
        margin-right: auto;
    }

    &__image-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at top, rgba(144, 207, 56, 0.2), transparent 60%);
        pointer-events: none;
        z-index: 1;
    }

    &__image {
        position: relative;
        z-index: 0;
        display: block;
        width: 100%;
        object-fit: cover;
        filter: saturate(1.05) contrast(1.02);
    }

    &__stats {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 20px;
        justify-content: center;
    }

    &__stat {
        padding: 18px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.04);
        text-align: left;
    }

    &__stat-value {
        margin-bottom: 8px;
        color: #90cf38;
        font-size: 1.5rem;
        font-weight: 700;
    }

    &__stat-label {
        color: rgba(240, 246, 252, 0.7);
        font-size: 0.75rem;
        line-height: 1.4;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    &__terminal {
        position: relative;
        overflow: hidden;
        border-radius: 18px;
        background: rgba(5, 10, 20, 0.75);
        border: 1px solid rgba(144, 207, 56, 0.14);
        font-family: monospace;
    }

    &__terminal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        background: rgba(255, 255, 255, 0.02);
    }

    &__terminal-dots {
        display: flex;
        gap: 6px;
        span {
            width: 8px;
            height: 8px;

            border-radius: 50%;

            background: rgba(255, 255, 255, 0.35);
        }
    }

    &__terminal-title {
        color: rgba(240, 246, 252, 0.5);
        font-size: 0.7rem;
    }

    &__terminal-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        color: rgba(240, 246, 252, 0.8);
        font-size: 0.78rem;
        line-height: 1.6;
    }

    &__terminal-success {
        color: #90cf38;
        text-shadow: 0 0 8px rgba(144, 207, 56, 0.3);
    }
}
</style>
