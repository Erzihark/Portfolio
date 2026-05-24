<template>
    <div class="contact">
        <div class="contact__vitals">
            <div class="contact__vitals__title">
                Let's make something
                <br />
                <strong> phenomenal </strong>.
            </div>

            <div class="contact__vitals__info">
                <div>
                    <i class="fas fa-phone"></i>
                    <span>+52 222 1888 266</span>
                </div>

                <div>
                    <i class="fas fa-envelope"></i>
                    <span>manuelalejandrosac@gmail.com</span>
                </div>
            </div>

            <div class="contact__vitals__social">
                <a
                    href="https://www.linkedin.com/in/manuel-sanchez-a-carretero-2b43801bb/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i class="fab fa-linkedin-in"></i>
                </a>

                <a href="https://github.com/Erzihark" target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-github"></i>
                </a>

                <a
                    href="https://instagram.com/manuelalejandrosac"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i class="fab fa-instagram"></i>
                </a>
            </div>
        </div>

        <form class="contact__form" @submit.prevent="sendEmail">
            <input
                v-model="form.name"
                class="contact__form__field"
                type="text"
                placeholder="Your Name"
                required
            />

            <input
                v-model="form.email"
                class="contact__form__field"
                type="email"
                placeholder="Email Address"
                required
            />

            <textarea
                v-model="form.message"
                class="contact__form__field"
                placeholder="Message..."
                required
            ></textarea>

            <button
                class="contact__form__submit michroma-regular"
                type="submit"
                :disabled="isSending"
            >
                {{ isSending ? 'SENDING...' : 'SUBMIT' }}
            </button>

            <div v-if="successMessage" class="contact__form--success">
                {{ successMessage }}
            </div>

            <div v-if="errorMessage" class="contact__form--error">
                {{ errorMessage }}
            </div>
        </form>
    </div>
</template>

<script>
import emailjs from '@emailjs/browser';

export default {
    name: 'ContactView',

    data() {
        return {
            isSending: false,

            successMessage: '',
            errorMessage: '',

            form: {
                name: '',
                email: '',
                message: ''
            }
        };
    },

    methods: {
        async sendEmail() {
            this.isSending = true;

            this.successMessage = '';
            this.errorMessage = '';

            try {
                await emailjs.send(
                    'gmail_service',
                    'contact_us_template',
                    {
                        name: this.form.name,
                        email: this.form.email,
                        message: this.form.message
                    },
                    'V9o4OVcSSzL1MT7jV'
                );

                this.successMessage = 'Message sent successfully.';

                this.form = {
                    name: '',
                    email: '',
                    message: ''
                };
            } catch (error) {
                console.error(error);

                this.errorMessage = 'Failed to send message.';
            } finally {
                this.isSending = false;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.contact {
    .fas,
    .fab {
        margin-right: 4px;
        color: white;
    }
    &__vitals {
        &__title {
            margin-bottom: 16px;

            strong {
                color: #90cf38;
            }
        }

        &__info {
            margin: 8px 0;
            font-size: 1rem;
            margin-bottom: 16px;
            .fas {
                font-size: 12px;
            }

            @media (max-width: 768px) {
                font-size: 0.8rem;
            }
        }

        &__social {
            display: flex;
            justify-content: space-evenly;
            margin: 8px 0;
            padding: 8px;
            a > .fab {
                font-size: 24px;
            }
        }
    }

    &__form {
        display: flex;
        flex-direction: column;
        gap: 12px;

        &__field {
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #2ea04366;
            background: rgba(0, 0, 0, 0.479);
            color: white;
            outline: none;

            &:focus {
                border-color: #90cf38;
            }

            &::placeholder {
                color: rgba(255, 255, 255, 0.514);
            }
        }

        &__submit {
            padding: 12px;
            border: none;
            border-radius: 6px;
            background-image: linear-gradient(#2ea043, #237a33);
            color: white;
            cursor: pointer;
            transition: 0.2s;

            &:hover:not(:disabled) {
                transform: translateY(-2px);
            }

            &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        }

        &--success {
            color: #90cf38;
        }

        &--error {
            color: #ff6b6b;
        }
    }
}
</style>
