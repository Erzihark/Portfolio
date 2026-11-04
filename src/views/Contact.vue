<template>
    <section class="contact">
        <div class="contact__glow"></div>

        <div class="contact__container">
            <header>
                <h2 class="contact__heading">{{ $t('contact.heading') }}</h2>
                <p class="contact__sub">{{ $t('contact.sub') }}</p>
            </header>

            <form class="contact__form" @submit.prevent="sendEmail">
                <div class="contact__field">
                    <label for="contact-name">{{ $t('contact.name') }}</label>
                    <input
                        id="contact-name"
                        v-model="form.name"
                        type="text"
                        name="name"
                        autocomplete="name"
                        required
                    />
                </div>

                <div class="contact__field">
                    <label for="contact-email">{{ $t('contact.email') }}</label>
                    <input
                        id="contact-email"
                        v-model="form.email"
                        type="email"
                        name="email"
                        autocomplete="email"
                        inputmode="email"
                        required
                    />
                </div>

                <div class="contact__field">
                    <label for="contact-topic">{{ $t('contact.topic') }}</label>
                    <select id="contact-topic" v-model="form.topic" name="topic" required>
                        <option value="" disabled>{{ $t('contact.topicPlaceholder') }}</option>
                        <option
                            v-for="topic in $t('contact.topics')"
                            :key="topic.value"
                            :value="topic.value"
                        >
                            {{ topic.label }}
                        </option>
                    </select>
                </div>

                <div class="contact__field">
                    <label for="contact-message">{{ $t('contact.message') }}</label>
                    <textarea
                        id="contact-message"
                        v-model="form.message"
                        name="message"
                        rows="5"
                        required
                    ></textarea>
                </div>

                <button class="contact__submit" type="submit" :disabled="isSending">
                    {{ isSending ? $t('contact.sending') : $t('contact.submit') }}
                </button>

                <div class="contact__status" role="status" aria-live="polite">
                    <p v-if="successMessage" class="contact__status--success">
                        {{ successMessage }}
                    </p>
                    <p v-if="errorMessage" class="contact__status--error">
                        {{ errorMessage }}
                        <a :href="'mailto:' + email">{{ email }}</a>
                    </p>
                </div>
            </form>

            <div class="contact__direct">
                <p class="contact__direct-title">{{ $t('contact.direct') }}</p>

                <ul class="contact__links">
                    <li>
                        <a :href="'mailto:' + email">
                            <i class="fas fa-envelope" aria-hidden="true"></i>
                            <span>{{ email }}</span>
                        </a>
                    </li>
                    <li>
                        <a href="tel:+522221888266">
                            <i class="fas fa-phone" aria-hidden="true"></i>
                            <span>+52 222 1888 266</span>
                        </a>
                    </li>
                </ul>

                <ul class="contact__social">
                    <li>
                        <a
                            href="https://www.linkedin.com/in/manuel-sanchez-a-carretero-2b43801bb/"
                            target="_blank"
                            rel="noopener noreferrer"
                            :aria-label="$t('contact.linkedin')"
                        >
                            <i class="fab fa-linkedin-in" aria-hidden="true"></i>
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://github.com/Erzihark"
                            target="_blank"
                            rel="noopener noreferrer"
                            :aria-label="$t('contact.github')"
                        >
                            <i class="fab fa-github" aria-hidden="true"></i>
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://instagram.com/manuelalejandrosac"
                            target="_blank"
                            rel="noopener noreferrer"
                            :aria-label="$t('contact.instagram')"
                        >
                            <i class="fab fa-instagram" aria-hidden="true"></i>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>

<script>
import emailjs from '@emailjs/browser';
import { tIn, locale } from '@/i18n';

export default {
    name: 'ContactView',

    data() {
        return {
            email: 'manuelalejandrosac@gmail.com',
            isSending: false,
            sent: false,
            failed: false,

            form: {
                name: '',
                email: '',
                topic: '',
                message: ''
            }
        };
    },

    computed: {
        // Status text follows the language, even after the message was sent.
        successMessage() {
            return this.sent ? this.$t('contact.success') : '';
        },

        errorMessage() {
            return this.failed ? this.$t('contact.error') : '';
        }
    },

    methods: {
        async sendEmail() {
            this.isSending = true;
            this.sent = false;
            this.failed = false;

            // The email is for me, so the topic and language are always in English.
            const topic = tIn('en', 'contact.topics').find(
                (item) => item.value === this.form.topic
            );
            const message = [
                `Topic: ${topic ? topic.label : this.form.topic}`,
                `Site language: ${locale.value}`,
                '',
                this.form.message
            ].join('\n');

            try {
                await emailjs.send(
                    'gmail_service',
                    'contact_us_template',
                    {
                        name: this.form.name,
                        email: this.form.email,
                        message
                    },
                    'V9o4OVcSSzL1MT7jV'
                );

                this.sent = true;
                this.form = { name: '', email: '', topic: '', message: '' };
            } catch (error) {
                console.error(error);
                this.failed = true;
            } finally {
                this.isSending = false;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.contact {
    position: relative;
    width: 100%;
    overflow: hidden;
    color: #f0f6fc;
    font-family: 'IBM Plex Sans', sans-serif;
    text-align: left;

    &__glow {
        position: absolute;
        inset: 0;
        background:
            radial-gradient(circle at top right, rgba(144, 207, 56, 0.14), transparent 40%),
            radial-gradient(circle at bottom left, rgba(72, 187, 255, 0.08), transparent 35%);
        pointer-events: none;
    }

    &__container {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 12px;
    }

    &__heading {
        margin: 0;
        font-size: clamp(1.3rem, 4vw, 1.8rem);
        line-height: 1.25;
        color: #ffffff;
        text-wrap: balance;
    }

    &__sub {
        margin: 10px 0 0;
        max-width: 56ch;
        color: rgba(240, 246, 252, 0.88);
        font-size: 1rem;
        line-height: 1.6;
    }

    &__form {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    &__field {
        display: flex;
        flex-direction: column;
        gap: 6px;

        label {
            font-size: 0.9rem;
            font-weight: 500;
            color: rgba(240, 246, 252, 0.92);
        }

        input,
        select,
        textarea {
            width: 100%;
            min-height: 44px;
            box-sizing: border-box;
            padding: 10px 12px;
            border-radius: 8px;
            border: 1px solid rgba(144, 207, 56, 0.4);
            background: rgba(0, 0, 0, 0.5);
            color: #ffffff;
            font-family: inherit;
            font-size: 1rem;

            &:focus-visible {
                outline: 2px solid #90cf38;
                outline-offset: 1px;
                border-color: #90cf38;
            }
        }

        textarea {
            resize: vertical;
        }

        select option {
            background: #0b1210;
            color: #ffffff;
        }
    }

    &__submit {
        min-height: 48px;
        padding: 12px 20px;
        border: 1px solid #90cf38;
        border-radius: 10px;
        background: #90cf38;
        color: #08110a;
        font-family: inherit;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 0 20px rgba(144, 207, 56, 0.3);
        }

        &:focus-visible {
            outline: 2px solid #ffffff;
            outline-offset: 2px;
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }

    &__status {
        p {
            margin: 0;
            font-size: 0.95rem;
            line-height: 1.5;
        }

        a {
            color: inherit;
            text-decoration: underline;
        }

        &--success {
            color: #c8f28d;
        }

        &--error {
            color: #ff9b9b;
        }
    }

    &__direct {
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    &__direct-title {
        margin: 0 0 10px;
        color: rgba(240, 246, 252, 0.8);
        font-size: 0.9rem;
    }

    &__links,
    &__social {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 20px;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    &__links a {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 44px;
        color: #f0f6fc;
        text-decoration: none;

        i {
            color: #90cf38;
        }

        &:hover span {
            text-decoration: underline;
        }
    }

    &__social {
        margin-top: 4px;

        a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #f0f6fc;
            font-size: 1.1rem;
            transition:
                border-color 0.2s ease,
                color 0.2s ease;

            &:hover {
                border-color: #90cf38;
                color: #90cf38;
            }
        }
    }

    &__links a:focus-visible,
    &__social a:focus-visible {
        outline: 2px solid #90cf38;
        outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
        &__submit {
            transition: none;

            &:hover:not(:disabled) {
                transform: none;
            }
        }
    }
}
</style>
