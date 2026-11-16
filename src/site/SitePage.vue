<template>
    <div id="top" class="site">
        <a class="skip-link" href="#main">{{ $t('site.skip') }}</a>
        <site-header />

        <main id="main" tabindex="-1">
            <section class="hero">
                <div class="hero__grid site-container">
                    <div class="hero__copy">
                        <p class="eyebrow">{{ $t('site.hero.eyebrow') }}</p>
                        <h1>{{ $t('site.hero.title') }}</h1>
                        <p class="hero__text">{{ $t('site.hero.text') }}</p>
                        <div class="hero__actions">
                            <a class="btn btn--primary" href="#contact">{{ $t('site.hero.primary') }}</a>
                            <a class="btn btn--ghost" href="#example">{{ $t('site.hero.secondary') }}</a>
                        </div>
                        <ul class="hero__points">
                            <li v-for="point in $t('site.hero.points')" :key="point">{{ point }}</li>
                        </ul>
                    </div>

                    <div class="hero__visual">
                        <hero-planet class="hero__planet" />
                        <img
                            class="hero__phone"
                            :src="images.mobile"
                            :alt="$t('site.hero.imageAlt')"
                            width="390"
                            height="780"
                            fetchpriority="high"
                        />
                    </div>
                </div>
            </section>

            <section id="services" class="section">
                <div class="site-container">
                    <p class="eyebrow">{{ $t('site.services.eyebrow') }}</p>
                    <h2 class="section-title">{{ $t('site.services.title') }}</h2>
                    <ul class="services">
                        <li v-for="(item, index) in $t('site.services.items')" :key="item.title">
                            <span class="services__number" aria-hidden="true">0{{ index + 1 }}</span>
                            <h3>{{ item.title }}</h3>
                            <p>{{ item.text }}</p>
                        </li>
                    </ul>
                </div>
            </section>

            <section class="reassure">
                <div class="site-container">
                    <h2>{{ $t('site.reassure.title') }}</h2>
                    <p>{{ $t('site.reassure.text') }}</p>
                </div>
            </section>

            <section id="example" class="section">
                <div class="site-container">
                    <div class="example__intro">
                        <p class="eyebrow">{{ $t('site.example.eyebrow') }}</p>
                        <h2 class="section-title">{{ $t('site.example.title') }}</h2>
                        <p class="example__text">{{ $t('site.example.text') }}</p>
                    </div>

                    <dl class="results">
                        <div v-for="result in $t('site.example.results')" :key="result.label">
                            <dt>{{ result.label }}</dt>
                            <dd>{{ result.value }}</dd>
                        </div>
                    </dl>

                    <figure class="example__figure">
                        <img
                            :src="images.students"
                            :alt="$t('site.example.studentsAlt')"
                            width="1600"
                            height="1000"
                            loading="lazy"
                        />
                    </figure>

                    <div class="example__detail">
                        <figure class="example__figure">
                            <img
                                :src="images.event"
                                :alt="$t('site.example.eventAlt')"
                                width="1600"
                                height="1000"
                                loading="lazy"
                            />
                        </figure>
                        <div>
                            <h3>{{ $t('site.example.changedTitle') }}</h3>
                            <ul class="example__changes">
                                <li v-for="change in $t('site.example.changed')" :key="change">
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                                    </svg>
                                    <span>{{ change }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <p class="example__caption">{{ $t('site.example.caption') }}</p>
                </div>
            </section>

            <section id="process" class="section section--alt">
                <div class="site-container">
                    <p class="eyebrow">{{ $t('site.process.eyebrow') }}</p>
                    <h2 class="section-title">{{ $t('site.process.title') }}</h2>
                    <ol class="steps">
                        <li v-for="(step, index) in $t('site.process.steps')" :key="step.title">
                            <span class="steps__number" aria-hidden="true">{{ index + 1 }}</span>
                            <h3>{{ step.title }}</h3>
                            <p>{{ step.text }}</p>
                        </li>
                    </ol>
                </div>
            </section>

            <section id="about" class="section">
                <div class="about site-container">
                    <img
                        class="about__photo"
                        :src="images.profile"
                        :alt="$t('site.about.photoAlt')"
                        loading="lazy"
                    />
                    <div>
                        <p class="eyebrow">{{ $t('site.about.eyebrow') }}</p>
                        <h2 class="section-title">{{ $t('site.about.title') }}</h2>
                        <p v-for="paragraph in $t('site.about.paragraphs')" :key="paragraph" class="about__text">
                            {{ paragraph }}
                        </p>
                    </div>
                </div>
            </section>

            <site-contact />
        </main>

        <footer class="footer">
            <div class="footer__inner site-container">
                <div>
                    <p class="footer__name">Manuel Carretero</p>
                    <p class="footer__tagline">{{ $t('site.footer.tagline') }}</p>
                </div>
                <ul class="footer__links">
                    <li><a :href="`mailto:${email}`">{{ email }}</a></li>
                    <li>
                        <a
                            href="https://www.linkedin.com/in/manuel-sanchez-a-carretero-2b43801bb/"
                            target="_blank"
                            rel="noopener noreferrer"
                            :aria-label="`${$t('site.footer.linkedin')} ${$t('site.footer.newTab')}`"
                        >
                            {{ $t('site.footer.linkedin') }}
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://github.com/Erzihark"
                            target="_blank"
                            rel="noopener noreferrer"
                            :aria-label="`${$t('site.footer.github')} ${$t('site.footer.newTab')}`"
                        >
                            {{ $t('site.footer.github') }}
                        </a>
                    </li>
                    <li><a href="#/explore">{{ $t('site.footer.explore') }}</a></li>
                </ul>
            </div>
        </footer>
    </div>
</template>

<script>
import SiteHeader from './SiteHeader.vue';
import SiteContact from './SiteContact.vue';
import HeroPlanet from './HeroPlanet.vue';
import mobile from '@/assets/work/portal-mobile.webp';
import students from '@/assets/work/portal-students.webp';
import event from '@/assets/work/portal-event.webp';
import profile from '@/assets/profile.jpg';

export default {
    name: 'SitePage',

    components: {
        SiteHeader,
        SiteContact,
        HeroPlanet
    },

    data() {
        return {
            email: 'manuelalejandrosac@gmail.com',
            images: { mobile, students, event, profile }
        };
    }
};
</script>

<style lang="scss">
/* Everything stays under .site, because the 3D world keeps its own global styles. */
/* :where() keeps this reset at zero specificity, so component rules can override it. */
:where(.site) :where(h1, h2, h3, p, ul, ol, dl, dd, figure) {
    margin: 0;
    padding: 0;
}

:where(.site) :where(ul, ol) {
    list-style: none;
}

html {
    scroll-behavior: smooth;
    scroll-padding-top: 84px;
}

body {
    margin: 0;
}

.site {
    --bg: #0b0f0d;
    --surface: #121815;
    --surface-2: #1c2520;
    --border: #26302a;
    --field-border: #66736b;
    --text: #eef2ef;
    --muted: #a6b2ab;
    --accent: #90cf38;
    --on-accent: #0b120a;
    --error: #ff9c8f;
    --font-heading: 'Lexend', system-ui, sans-serif;
    --font-body: 'Source Sans 3', system-ui, sans-serif;

    min-height: 100dvh;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 18px;
    line-height: 1.6;

    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }

    h1,
    h2,
    h3 {
        font-family: var(--font-heading);
        font-weight: 600;
        line-height: 1.2;
        text-wrap: balance;
    }

    img {
        display: block;
        max-width: 100%;
        height: auto;
    }

    :focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
    }

    main:focus {
        outline: none;
    }
}

.site-container {
    width: min(1120px, 100% - 40px);
    margin-inline: auto;
}

.skip-link {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 20;
    padding: 10px 16px;
    border-radius: 8px;
    background: var(--accent);
    color: var(--on-accent);
    font-weight: 600;
    transform: translateY(-200%);

    &:focus {
        transform: none;
    }
}

.section {
    padding-block: clamp(64px, 9vw, 112px);

    &--alt {
        background: var(--surface);
    }
}

.section-title {
    max-width: 24ch;
    font-size: clamp(28px, 4vw, 40px);
}

.eyebrow {
    margin-bottom: 12px;
    color: var(--accent);
    font-size: 16px;
    font-weight: 600;
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 0 22px;
    border: 1px solid transparent;
    border-radius: 8px;
    font: inherit;
    font-weight: 600;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    transition:
        background-color 0.15s ease,
        border-color 0.15s ease;

    &--primary {
        background: var(--accent);
        color: var(--on-accent);

        &:hover {
            background: #a3dc50;
        }

        &:disabled {
            opacity: 0.6;
            cursor: wait;
        }
    }

    &--ghost {
        border-color: var(--field-border);
        color: var(--text);

        &:hover {
            border-color: var(--text);
        }
    }

    &--small {
        min-height: 44px;
        padding: 0 14px;
        font-size: 16px;
        white-space: nowrap;
    }
}

.hero {
    overflow: clip;
    padding-block: clamp(40px, 6vw, 72px);

    &__grid {
        display: grid;
        gap: 40px;
        align-items: center;

        @media (min-width: 960px) {
            grid-template-columns: 1.25fr 1fr;
            gap: 56px;
        }
    }

    h1 {
        font-size: clamp(36px, 5.4vw, 58px);
        line-height: 1.1;
    }

    &__text {
        max-width: 56ch;
        margin-top: 20px;
        color: var(--muted);
        font-size: clamp(18px, 1.8vw, 20px);
    }

    &__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 32px;
    }

    &__points {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 24px;
        margin-top: 28px;
        color: var(--muted);
        font-size: 16px;
    }

    &__visual {
        position: relative;
        display: flex;
        justify-content: center;
    }

    &__planet {
        position: absolute;
        top: -2%;
        left: 50%;
        width: min(460px, 110%);
        margin-left: calc(min(460px, 110%) / -2 + 70px);
    }

    &__phone {
        position: relative;
        width: min(250px, 62vw);
        border: 6px solid var(--surface-2);
        border-radius: 28px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
    }
}

.services {
    display: grid;
    gap: 40px 64px;
    margin-top: 48px;

    @media (min-width: 768px) {
        grid-template-columns: 1fr 1fr;
    }

    li {
        padding-top: 20px;
        border-top: 1px solid var(--border);
    }

    h3 {
        margin-top: 8px;
        font-size: 22px;
    }

    p {
        margin-top: 10px;
        color: var(--muted);
    }

    &__number {
        color: var(--accent);
        font-family: var(--font-heading);
        font-size: 16px;
        font-weight: 500;
    }
}

.reassure {
    padding-block: clamp(56px, 7vw, 80px);
    background: var(--surface);

    h2 {
        max-width: 22ch;
        font-size: clamp(28px, 4vw, 40px);
    }

    p {
        max-width: 60ch;
        margin-top: 16px;
        color: var(--muted);
        font-size: 20px;
    }
}

.example {
    &__text {
        max-width: 62ch;
        margin-top: 16px;
        color: var(--muted);
    }

    &__figure img {
        width: 100%;
        border: 1px solid var(--border);
        border-radius: 12px;

        /* Shows the left part larger, because the full screen is too small to read on a phone. */
        @media (max-width: 600px) {
            aspect-ratio: 1;
            object-fit: cover;
            object-position: left top;
        }
    }

    &__detail {
        display: grid;
        gap: 32px;
        align-items: center;
        margin-top: 32px;

        @media (min-width: 960px) {
            grid-template-columns: 1.5fr 1fr;
            gap: 56px;
        }

        h3 {
            font-size: 22px;
        }
    }

    &__changes {
        display: grid;
        gap: 14px;
        margin-top: 20px;

        li {
            display: flex;
            gap: 12px;
        }

        svg {
            flex: none;
            width: 22px;
            height: 22px;
            margin-top: 4px;
            fill: none;
            stroke: var(--accent);
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
    }

    &__caption {
        margin-top: 24px;
        color: var(--muted);
        font-size: 15px;
    }
}

.results {
    display: grid;
    gap: 24px;
    margin-block: 48px;

    @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
    }

    div {
        display: flex;
        flex-direction: column-reverse;
        justify-content: flex-end;
        gap: 4px;
        padding-top: 16px;
        border-top: 1px solid var(--border);
    }

    dd {
        color: var(--accent);
        font-family: var(--font-heading);
        font-size: clamp(40px, 5vw, 52px);
        font-weight: 600;
        line-height: 1.1;
    }

    dt {
        color: var(--muted);
    }
}

.steps {
    display: grid;
    gap: 40px;
    margin-top: 48px;

    @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
        gap: 48px;
    }

    h3 {
        margin-top: 16px;
        font-size: 22px;
    }

    p {
        margin-top: 8px;
        color: var(--muted);
    }

    &__number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: 1px solid var(--accent);
        border-radius: 50%;
        color: var(--accent);
        font-family: var(--font-heading);
        font-weight: 500;
    }
}

.about {
    display: grid;
    gap: 32px;
    align-items: center;

    @media (min-width: 768px) {
        grid-template-columns: 280px 1fr;
        gap: 64px;
    }

    &__photo {
        width: min(280px, 70vw);
        aspect-ratio: 1;
        border-radius: 12px;
        object-fit: cover;
    }

    &__text {
        max-width: 62ch;
        margin-top: 16px;
        color: var(--muted);
    }
}

.footer {
    padding-block: 40px;
    border-top: 1px solid var(--border);
    font-size: 16px;

    &__inner {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 24px 48px;
    }

    &__name {
        font-family: var(--font-heading);
        font-weight: 500;
    }

    &__tagline {
        color: var(--muted);
    }

    &__links {
        display: flex;
        flex-wrap: wrap;
        gap: 0 24px;

        a {
            display: inline-flex;
            align-items: center;
            min-height: 44px;
            color: var(--muted);
            overflow-wrap: anywhere;

            &:hover {
                color: var(--text);
            }
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    html {
        scroll-behavior: auto;
    }

    .site *,
    .site *::before,
    .site *::after {
        transition: none !important;
    }
}
</style>
