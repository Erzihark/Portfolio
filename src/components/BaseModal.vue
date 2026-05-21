<template>
    <Teleport to="#app">
        <div
            :class="{
                'wrapper__modal animate__animated': true,
                animate__fadeIn: open,
                animate__fadeOut: !open,
                'display-none': !open
            }"
        >
            <div
                v-if="animate"
                class="modal animate__animated animate__slideInUp"
                :class="{ 'modal--mobile': isMobile }"
            >
                <div class="modal__header">
                    <div class="bruno-ace-sc-regular">{{ modalTitle }}</div>
                    <button class="wrapper__button" @click="handleButtonClick">X</button>
                </div>
                <div class="modal__content michroma-regular">
                    <slot></slot>
                    <!-- Use slot to pass content from parent -->
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script>
export default {
    name: 'BaseModal',

    emits: ['buttonClick'],

    props: {
        isMobile: Boolean,
        modalTitle: String,
        open: Boolean,
        buttonText: String
    },

    data() {
        return {
            animate: false
        };
    },

    mounted() {
        setTimeout(() => {
            this.animate = true;
        }, 300);
    },

    methods: {
        handleButtonClick() {
            this.$emit('buttonClick');
        }
    }
};
</script>

<style lang="scss">
.wrapper__modal {
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .modal {
        background-image: linear-gradient(#2ea04391, #2ea04344);
        border: 2px solid rgba(46, 160, 67, 0.4);
        border-radius: 4px;
        color: #f0f6fc;
        padding: 8px;
        text-align: center;
        width: 80%;
        max-width: 550px;
        box-sizing: border-box;
        text-align: center;

        &__header {
            display: flex;
            justify-content: space-between;
        }

        &__content {
            padding: 10px;
            margin-top: 8px;
            max-height: 85vh;
            overflow: auto;
            scrollbar-color: #90cf38 #2ea04391;
            scrollbar-width: thin;
        }

        p {
            color: #fefdc5;
            margin-bottom: 20px;
        }

        .wrapper__button {
            font-family: 'League Gothic', sans-serif;
            font-size: 16px;
            padding: 5px 10px;
            border-radius: 10px;
            color: #fefdc5;
            position: relative;
            box-shadow: -1px 1px 0px 1px rgba(0, 0, 0, 0.75);
            -webkit-box-shadow: -1px 1px 0px 1px rgba(0, 0, 0, 0.75);
            -moz-box-shadow: -1px 1px 0px 1px rgba(0, 0, 0, 0.75);

            &:hover {
                color: #90cf38;
            }
        }

        &--mobile {
            max-width: 400px;
        }
    }
}

.display-none {
    display: none;
}
</style>
