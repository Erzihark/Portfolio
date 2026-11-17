import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';

// Remove the throwaway prototype pages from the production output.
const dropPrototypes = {
    name: 'drop-prototypes',
    hooks: {
        'astro:build:done': ({ dir }) => {
            rmSync(fileURLToPath(new URL('prototype/', dir)), { recursive: true, force: true });
        }
    }
};

export default defineConfig({
    site: 'https://manuelcarretero.dev',
    trailingSlash: 'always',
    // GitHub Pages (Jekyll) hides folders that start with "_".
    build: { assets: 'assets' },
    integrations: [
        vue(),
        sitemap({
            filter: (page) => !page.includes('/prototype/'),
            i18n: { defaultLocale: 'es', locales: { es: 'es-MX', en: 'en-US' } }
        }),
        dropPrototypes
    ],
    i18n: {
        defaultLocale: 'es',
        locales: ['es', 'en'],
        routing: { prefixDefaultLocale: false }
    }
});
