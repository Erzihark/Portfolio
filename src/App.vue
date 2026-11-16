<template>
    <world-app v-if="isWorld" />
    <site-page v-else />
</template>

<script>
import { defineAsyncComponent } from 'vue';
import SitePage from './site/SitePage.vue';

const WORLD_HASH = '#/explore';

export default {
    name: 'App',

    components: {
        SitePage,
        WorldApp: defineAsyncComponent(() => import('./world/WorldApp.vue'))
    },

    data() {
        return {
            isWorld: window.location.hash === WORLD_HASH
        };
    },

    mounted() {
        window.addEventListener('hashchange', this.onHashChange);
    },

    beforeUnmount() {
        window.removeEventListener('hashchange', this.onHashChange);
    },

    methods: {
        // The world adds global styles. A reload removes them when the visitor goes back.
        onHashChange() {
            if ((window.location.hash === WORLD_HASH) !== this.isWorld) {
                window.location.reload();
            }
        }
    }
};
</script>
