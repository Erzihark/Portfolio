<template>
    <section id="contact" class="contact section">
        <div class="contact__grid site-container">
            <div>
                <p class="eyebrow">{{ $t('site.contact.eyebrow') }}</p>
                <h2 class="section-title">{{ $t('site.contact.title') }}</h2>
                <p class="contact__text">{{ $t('site.contact.text') }}</p>

                <p class="contact__email-label">{{ $t('site.contact.emailLabel') }}</p>
                <a class="contact__email" :href="`mailto:${email}`">{{ email }}</a>
            </div>

            <form class="contact__form" novalidate @submit.prevent="submit">
                <h3>{{ $t('site.contact.formTitle') }}</h3>

                <div v-for="field in fields" :key="field.name" class="field">
                    <label :for="`contact-${field.name}`">{{ $t(`site.contact.${field.name}`) }}</label>
                    <textarea
                        v-if="field.tag === 'textarea'"
                        :id="`contact-${field.name}`"
                        :ref="field.name"
                        v-model.trim="form[field.name]"
                        :name="field.name"
                        :rows="field.rows"
                        :aria-invalid="Boolean(errors[field.name])"
                        :aria-describedby="describedBy(field)"
                        required
                    ></textarea>
                    <input
                        v-else
                        :id="`contact-${field.name}`"
                        :ref="field.name"
                        v-model.trim="form[field.name]"
                        :type="field.type"
                        :name="field.name"
                        :autocomplete="field.autocomplete"
                        :aria-invalid="Boolean(errors[field.name])"
                        :aria-describedby="describedBy(field)"
                        required
                    />
                    <p v-if="field.helper" :id="`contact-${field.name}-helper`" class="field__helper">
                        {{ $t('site.contact.helper') }}
                    </p>
                    <p v-if="errors[field.name]" :id="`contact-${field.name}-error`" class="field__error">
                        {{ $t(`site.contact.errors.${field.name}`) }}
                    </p>
                </div>

                <button class="btn btn--primary" type="submit" :disabled="status === 'sending'">
                    {{ $t(status === 'sending' ? 'site.contact.sending' : 'site.contact.submit') }}
                </button>

                <div class="contact__status" role="status">
                    <p v-if="status === 'success'" class="contact__success">
                        {{ $t('site.contact.success') }}
                    </p>
                    <p v-if="status === 'error'" class="field__error">
                        {{ $t('site.contact.error') }}
                        <a :href="`mailto:${email}`">{{ email }}</a>
                    </p>
                </div>
            </form>
        </div>
    </section>
</template>

<script>
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
    name: 'SiteContact',

    data() {
        return {
            email: 'manuelalejandrosac@gmail.com',
            status: 'idle',
            form: { name: '', email: '', message: '' },
            errors: {},
            fields: [
                { name: 'name', tag: 'input', type: 'text', autocomplete: 'name' },
                { name: 'email', tag: 'input', type: 'email', autocomplete: 'email' },
                { name: 'message', tag: 'textarea', rows: 4, helper: true }
            ]
        };
    },

    methods: {
        describedBy(field) {
            const ids = [];
            if (field.helper) ids.push(`contact-${field.name}-helper`);
            if (this.errors[field.name]) ids.push(`contact-${field.name}-error`);
            return ids.join(' ') || null;
        },

        validate() {
            this.errors = {
                name: !this.form.name,
                email: !EMAIL_PATTERN.test(this.form.email),
                message: !this.form.message
            };

            const firstInvalid = this.fields.find((field) => this.errors[field.name]);
            if (firstInvalid) this.$refs[firstInvalid.name][0].focus();
            return !firstInvalid;
        },

        async submit() {
            if (this.status === 'sending' || !this.validate()) return;

            this.status = 'sending';
            try {
                const { default: emailjs } = await import('@emailjs/browser');
                await emailjs.send(
                    'gmail_service',
                    'contact_us_template',
                    { ...this.form },
                    'V9o4OVcSSzL1MT7jV'
                );
                this.status = 'success';
                this.form = { name: '', email: '', message: '' };
            } catch {
                this.status = 'error';
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.contact {
    background: var(--surface);
    border-top: 1px solid var(--border);

    &__grid {
        display: grid;
        gap: 48px;

        @media (min-width: 960px) {
            grid-template-columns: 1.1fr 1fr;
            gap: 80px;
        }
    }

    &__text {
        max-width: 54ch;
        margin-top: 16px;
        color: var(--muted);
    }

    &__email-label {
        margin-top: 40px;
        color: var(--muted);
        font-size: 16px;
    }

    &__email {
        display: inline-block;
        padding-block: 8px;
        color: var(--accent);
        font-family: var(--font-heading);
        font-size: clamp(18px, 4.6vw, 26px);
        font-weight: 500;
        overflow-wrap: anywhere;
        text-underline-offset: 5px;
    }

    &__form {
        display: grid;
        gap: 20px;
        align-content: start;

        h3 {
            font-size: 20px;
        }

        .btn {
            justify-self: start;
        }
    }

    &__status:empty {
        display: none;
    }

    &__success {
        color: var(--accent);
        font-weight: 600;
    }
}

.field {
    display: grid;
    gap: 6px;

    label {
        font-size: 16px;
        font-weight: 600;
    }

    input,
    textarea {
        width: 100%;
        min-height: 48px;
        padding: 12px 14px;
        border: 1px solid var(--field-border);
        border-radius: 8px;
        background: var(--bg);
        color: var(--text);
        font: inherit;
        resize: vertical;

        &[aria-invalid='true'] {
            border-color: var(--error);
        }
    }

    &__helper {
        color: var(--muted);
        font-size: 15px;
    }

    &__error {
        color: var(--error);
        font-size: 15px;

        a {
            color: inherit;
        }
    }
}
</style>
