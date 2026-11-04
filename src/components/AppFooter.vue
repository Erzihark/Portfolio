<template>
    <footer class="footer">
        <div
            class="footer__planet michroma-regular"
            :class="{ 'footer__planet--null': !targetablePlanet }"
        >
            {{ targetablePlanet ? planetLabel(targetablePlanet).toUpperCase() : $t('hint') }}
        </div>
    </footer>
</template>

<script>
import emitter from '@/services/emitter.service';
import { EVENTS } from '@/constants/events';

import { planetLabel } from '@/constants/planets';

export default {
    props: ['targetablePlanet'],

    methods: {
        planetLabel,

        go(event, id) {
            emitter.emit(EVENTS.NAVIGATE_TO, { event, id });
        }
    }
};
</script>

<style lang="scss" scoped>
.footer {
    position: fixed;
    bottom: 12vh;
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: center;

    &__planet {
        color: #90cf38;
        font-size: 2rem;

        &--null {
            color: rgba(172, 166, 166, 0.7);
            font-size: 1.5rem;
        }
    }

    @media (max-width: 768px) {
        bottom: 5vh;

        &__planet {
            font-size: 1.2rem;

            &--null {
                font-size: 1rem;
            }
        }
    }
}
</style>
