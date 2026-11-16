<template>
    <header class="site-header">
        <div class="site-header__inner site-container">
            <a class="site-header__brand" href="#top">
                <img :src="logo" alt="" width="32" height="32" />
                <span>Manuel Carretero</span>
            </a>

            <nav class="site-header__nav" :aria-label="$t('site.nav.label')">
                <a href="#services">{{ $t('site.nav.services') }}</a>
                <a href="#example">{{ $t('site.nav.example') }}</a>
                <a href="#process">{{ $t('site.nav.process') }}</a>
                <a href="#about">{{ $t('site.nav.about') }}</a>
            </nav>

            <div class="site-header__actions">
                <div class="site-header__lang" role="group" :aria-label="$t('site.nav.language')">
                    <button
                        v-for="option in languages"
                        :key="option.code"
                        type="button"
                        :lang="option.code"
                        :aria-label="option.name"
                        :aria-pressed="$locale === option.code"
                        @click="$setLocale(option.code)"
                    >
                        {{ option.code.toUpperCase() }}
                    </button>
                </div>
                <a class="btn btn--primary btn--small" href="#contact">
                    {{ $t('site.nav.contact') }}
                </a>
            </div>
        </div>
    </header>
</template>

<script>
import logo from '@/assets/logo.webp';

export default {
    name: 'SiteHeader',

    data() {
        return {
            logo,
            languages: [
                { code: 'es', name: 'Español' },
                { code: 'en', name: 'English' }
            ]
        };
    }
};
</script>

<style lang="scss" scoped>
.site-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--bg);
    border-bottom: 1px solid var(--border);

    &__inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: 68px;
    }

    &__brand {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
        color: var(--text);
        font-family: var(--font-heading);
        font-weight: 500;
        text-decoration: none;
        white-space: nowrap;

        img {
            width: 32px;
            height: 32px;
            border-radius: 6px;
        }
    }

    &__nav {
        display: none;
        gap: 4px;

        a {
            display: flex;
            align-items: center;
            min-height: 44px;
            padding: 0 12px;
            border-radius: 8px;
            color: var(--muted);
            font-size: 16px;
            text-decoration: none;
            transition: color 0.15s ease;

            &:hover {
                color: var(--text);
            }
        }
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    &__lang {
        display: flex;
        border: 1px solid var(--border);
        border-radius: 8px;

        button {
            min-width: 40px;
            min-height: 44px;
            border: 0;
            border-radius: 7px;
            background: transparent;
            color: var(--muted);
            font: inherit;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: color 0.15s ease;

            &:hover {
                color: var(--text);
            }

            &[aria-pressed='true'] {
                background: var(--surface-2);
                color: var(--text);
            }
        }
    }

    @media (max-width: 520px) {
        &__brand span {
            display: none;
        }
    }

    @media (min-width: 960px) {
        &__nav {
            display: flex;
        }
    }
}
</style>
