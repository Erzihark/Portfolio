<template>
    <section class="skills">
        <div class="skills__background-glow"></div>

        <div class="skills__container">
            <!-- TECHNOLOGIES -->
            <article class="skills__card">
                <div class="skills__header">
                    <h3 class="skills__title">Technologies</h3>

                    <span class="skills__badge"> Frontend & Creative </span>
                </div>

                <div class="skills__grid">
                    <div class="skills__item">
                        <i class="fab fa-react"></i>
                        <span>React</span>
                    </div>

                    <div class="skills__item">
                        <i class="fab fa-vuejs"></i>
                        <span>Vue</span>
                    </div>

                    <div class="skills__item">
                        <i class="fab fa-angular"></i>
                        <span>Angular</span>
                    </div>

                    <div class="skills__item">
                        <span>Three.js</span>
                    </div>

                    <div class="skills__item">
                        <i class="fab fa-docker"></i>
                        <span>Docker</span>
                    </div>

                    <div class="skills__item">
                        <i class="fab fa-git-alt"></i>
                        <span>Git</span>
                    </div>

                    <div class="skills__item">
                        <span>Material UI</span>
                    </div>

                    <div class="skills__item">
                        <i class="fab fa-sass"></i>
                        <span>Sass</span>
                    </div>

                    <div class="skills__item">
                        <i class="fab fa-css3-alt"></i>
                        <span>CSS</span>
                    </div>

                    <div class="skills__item">
                        <i class="fab fa-html5"></i>
                        <span>HTML</span>
                    </div>

                    <div class="skills__item">
                        <span>Cypress</span>
                    </div>

                    <div class="skills__item">
                        <span>Phaser</span>
                    </div>
                </div>
            </article>

            <!-- LANGUAGES -->
            <article class="skills__card">
                <div class="skills__header">
                    <h3 class="skills__title">Languages</h3>

                    <span class="skills__badge"> Backend & Systems </span>
                </div>

                <div class="skills__grid">
                    <div class="skills__item">
                        <i class="fab fa-js"></i>
                        <span>JavaScript</span>
                    </div>

                    <div class="skills__item">
                        <i class="fab fa-typescript"></i>
                        <span>TypeScript</span>
                    </div>

                    <div class="skills__item">
                        <i class="fab fa-php"></i>
                        <span>PHP</span>
                    </div>

                    <div class="skills__item">
                        <i class="fab fa-golang"></i>
                        <span>Go</span>
                    </div>

                    <div class="skills__item">
                        <span>C#</span>
                    </div>
                </div>
            </article>

            <!-- TOOLS -->
            <article class="skills__card">
                <div class="skills__header">
                    <h3 class="skills__title">Tools</h3>

                    <span class="skills__badge"> Workflow & Design </span>
                </div>

                <div class="skills__grid">
                    <div class="skills__item">
                        <i class="fab fa-jira"></i>
                        <span>Jira</span>
                    </div>

                    <div class="skills__item">
                        <i class="fab fa-jenkins"></i>
                        <span>Jenkins</span>
                    </div>

                    <div class="skills__item">
                        <i class="fab fa-linux"></i>
                        <span>Linux</span>
                    </div>

                    <div class="skills__item">
                        <i class="fab fa-vim"></i>
                        <span>Vim</span>
                    </div>

                    <div class="skills__item">
                        <span>VSCode</span>
                    </div>

                    <div class="skills__item">
                        <span>Photoshop</span>
                    </div>

                    <div class="skills__item">
                        <span>Blender</span>
                    </div>
                </div>
            </article>
        </div>
    </section>
</template>

<script>
export default {
    name: 'SkillsView'
};
</script>

<style lang="scss" scoped>
.skills {
    position: relative;
    width: 100%;
    overflow: hidden;
    color: #f0f6fc;
    font-size: 12px;

    &__background-glow {
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
        padding: 8px;
    }

    &__card {
        position: relative;
        overflow: hidden;
        border-radius: 20px;
        padding: 16px;
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
            border-color: rgba(144, 207, 56, 0.35);
            box-shadow:
                0 0 40px rgba(144, 207, 56, 0.08),
                0 0 20px rgba(0, 0, 0, 0.35);
        }
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(144, 207, 56, 0.8), transparent);
            animation: skills-scan 6s linear infinite;
        }
    }

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 18px;

        @media (max-width: 768px) {
            flex-direction: column;
            align-items: flex-start;
        }
    }

    &__title {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 1px;
        text-transform: uppercase;
    }

    &__badge {
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(144, 207, 56, 0.12);
        border: 1px solid rgba(144, 207, 56, 0.25);
        color: #90cf38;
        font-size: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        white-space: nowrap;
    }

    &__grid {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
    }

    &__item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.05);
        color: rgba(240, 246, 252, 0.92);
        font-size: 0.82rem;
        font-family: monospace;
        transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;

        &:hover {
            transform: translateY(-2px);
            border-color: rgba(144, 207, 56, 0.35);
            background: rgba(144, 207, 56, 0.08);
        }

        i {
            font-size: 1rem;
            color: #90cf38;
        }

        span {
            white-space: nowrap;
        }
    }
}

@keyframes skills-scan {
    from {
        left: -100%;
    }

    to {
        left: 100%;
    }
}
</style>
