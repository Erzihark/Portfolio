<template>
    <footer class="footer">
        <div
            class="footer__planet michroma-regular"
            :class="{ 'footer__planet--null': !targetablePlanet }"
        >
            {{ targetablePlanet ? targetablePlanet.toUpperCase() : '' }}
        </div>
    </footer>
</template>

<script>
import emitter from '@/services/emitter.service';
import { EVENTS } from '@/constants/events';

export default {
    data() {
        return {
            targetablePlanet: null
        };
    },

    mounted() {
        emitter.on(EVENTS.PLANET_TARGETABLE, (value) => {
            this.targetablePlanet = value;
        });
    },

    methods: {
        go(event, id) {
            this.menuOpen = false;

            emitter.emit('navigate-to', { event, id });
        }
    }
};
</script>

<style lang="scss" scoped>
.footer {
    position: fixed;
    bottom: 10vh;
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: center;

    &__planet {
        color: #90cf38;
        font-size: 2rem;

        &--null {
            color: rgb(172, 166, 166);
        }
    }
}
</style>
