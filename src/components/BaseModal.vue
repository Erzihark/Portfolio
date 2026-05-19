<template>
    <Teleport to="#app">
        <div
            :class="{
                'wrapper__modal animate__animated': true,
                animate__fadeIn: modal,
                animate__fadeOut: !modal,
                'display-none': !modal
            }"
        >
            <div v-if="animate" class="modal animate__animated animate__slideInUp">
                <div class="modal__content">
                    <slot></slot>
                    <!-- Use slot to pass content from parent -->
                    <button class="wrapper__button" @click="handleButtonClick">
                        {{ buttonText }}
                    </button>
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
        modal: Boolean,
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
    background-color: rgba(255, 255, 255, 0.07);
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
        max-width: 400px;
        box-sizing: border-box;
        text-align: center;

        &__content {
            padding: 20px;
            overflow: hidden;
        }

        p {
            color: #fefdc5;
            margin-bottom: 20px;
        }

        .wrapper__button {
            font-family: 'League Gothic', sans-serif;
            font-size: 32px;
            padding: 5px 10px;
            border-radius: 10px;
            color: #fefdc5;
            position: relative;
            box-shadow: -2px 2px 0px 2px rgba(0, 0, 0, 0.75);
            -webkit-box-shadow: -2px 2px 0px 2px rgba(0, 0, 0, 0.75);
            -moz-box-shadow: -2px 2px 0px 2px rgba(0, 0, 0, 0.75);
        }
    }
}

.display-none {
    display: none;
}
</style>
