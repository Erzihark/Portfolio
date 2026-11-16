import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: 'https://erzihark.github.io',
    base: '/Portfolio',
    trailingSlash: 'always',
    integrations: [
        vue(),
        sitemap({
            filter: (page) => !page.includes('/prototype/'),
            i18n: { defaultLocale: 'es', locales: { es: 'es-MX', en: 'en-US' } }
        })
    ],
    i18n: {
        defaultLocale: 'es',
        locales: ['es', 'en'],
        routing: { prefixDefaultLocale: false }
    }
});
