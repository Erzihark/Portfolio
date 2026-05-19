<template>
    <header class="header">
        <div class="header__logo">
            <img class="header__logo__image" width="50" height="50" src="../assets/logo.webp" />
            <div class="header__logo__text">Manuel Sanchez</div>
        </div>
        <div class="header__navigation-buttons">
            <button
                v-for="planet of planetButtons"
                @click="go(planet.go_to)"
                :key="planet.text"
                class="header__navigation-buttons__button cursor-pointer michroma-regular"
            >
                {{ planet.text }}
            </button>
        </div>
        <div></div>
    </header>
</template>
<script>
import emitter from '@/services/emitter.service';

export default {
    props: ['setModal'],
    data() {
        return {
            planetButtons: [
                {
                    text: 'Home',
                    go_to: 'home'
                },
                {
                    text: 'Projects',
                    go_to: 'projects'
                },
                {
                    text: 'Skills',
                    go_to: 'skills'
                },
                {
                    text: 'Experience',
                    go_to: 'experience'
                }
            ]
        };
    },

    methods: {
        go(id) {
            console.log('clicked: ', id);
            emitter.emit('navigate-to', id);
            
        }
    }
};
</script>
<style lang="scss" scoped>
.header {
    position: fixed;
    width: 100%;
    height: 50px;
    z-index: 10;
    display: flex;
    flex-direction: row;
    margin: 8px;
    &__logo {
        display: flex;
        padding: 10px;
        justify-content: center;
        //align-items: center;

        &__image {
        }

        &__text {
            color: #2ea04391;
        }
    }

    &__navigation-buttons {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        width: 100%;
        height: 100%;

        &__button {
            background-image: linear-gradient(#2ea04391, #2ea04344);
            border: 2px solid rgba(46, 160, 67, 0.4);
            border-radius: 4px;
            color: #f0f6fc;
            padding: 8px;
            text-align: center;
            background-color: unset;

            &:hover {
                background-color: #2ea04391;
            }
        }
    }
}
</style>
