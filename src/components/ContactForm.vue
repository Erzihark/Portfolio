<script setup lang="ts">
// Contact form. The message follows the picks of "Arma tu sistema" until the visitor edits it.
// The form sends the message with EmailJS.
import { ref, reactive, computed, watch } from 'vue';
import type { Messages } from '../i18n';
import { selection } from '../lib/store';

const props = defineProps<{ t: Messages['contact']; labels: Record<string, string> }>();

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const name = ref('');
const email = ref('');
const auto = computed(() => {
    const ids = selection.selected;
    if (!ids.length) return props.t.messageEmpty;
    return props.t.messageIntro + '\n' + ids.map((id) => '- ' + (props.labels[id] ?? id)).join('\n');
});
const message = ref(auto.value);
const edited = ref(false);
const errors = reactive({ name: false, email: false, message: false });
const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle');
const nameEl = ref<HTMLInputElement | null>(null);
const emailEl = ref<HTMLInputElement | null>(null);
const messageEl = ref<HTMLTextAreaElement | null>(null);

// Follow the picks while the visitor has not edited the message.
watch(auto, (v) => {
    if (!edited.value) message.value = v;
});
const stale = computed(() => edited.value && message.value !== auto.value);
function onInput() {
    edited.value = message.value !== auto.value;
    errors.message = false;
}
function refresh() {
    message.value = auto.value;
    edited.value = false;
}

function validate(): boolean {
    errors.name = !name.value.trim();
    errors.email = !EMAIL.test(email.value.trim());
    errors.message = !message.value.trim();
    const first = errors.name ? nameEl.value : errors.email ? emailEl.value : errors.message ? messageEl.value : null;
    first?.focus();
    return !first;
}

const mailto = computed(
    () =>
        `mailto:${props.t.email}?subject=${encodeURIComponent(props.t.mailSubject)}&body=${encodeURIComponent(message.value)}`
);

async function submit() {
    if (status.value === 'sending' || !validate()) return;
    status.value = 'sending';
    try {
        const { default: emailjs } = await import('@emailjs/browser');
        await emailjs.send(
            'gmail_service',
            'contact_us_template',
            { name: name.value.trim(), email: email.value.trim(), message: message.value },
            'V9o4OVcSSzL1MT7jV'
        );
        status.value = 'success';
        name.value = '';
        email.value = '';
        edited.value = false;
        message.value = auto.value;
    } catch {
        status.value = 'error';
    }
}
</script>

<template>
    <form class="form hud" novalidate @submit.prevent="submit">
        <p class="tag">{{ t.tag }}</p>

        <div class="field">
            <label for="contact-name">{{ t.name }}</label>
            <input
                id="contact-name"
                ref="nameEl"
                v-model="name"
                type="text"
                name="name"
                autocomplete="name"
                required
                :aria-invalid="errors.name"
                :aria-describedby="errors.name ? 'contact-name-error' : undefined"
                @input="errors.name = false"
            />
            <p v-if="errors.name" id="contact-name-error" class="error">{{ t.errName }}</p>
        </div>

        <div class="field">
            <label for="contact-email">{{ t.mail }}</label>
            <input
                id="contact-email"
                ref="emailEl"
                v-model="email"
                type="email"
                name="email"
                autocomplete="email"
                required
                :aria-invalid="errors.email"
                :aria-describedby="errors.email ? 'contact-email-error' : undefined"
                @input="errors.email = false"
            />
            <p v-if="errors.email" id="contact-email-error" class="error">{{ t.errEmail }}</p>
        </div>

        <div class="field">
            <label for="contact-message">{{ t.message }}</label>
            <textarea
                id="contact-message"
                ref="messageEl"
                v-model="message"
                name="message"
                rows="6"
                required
                :aria-invalid="errors.message"
                :aria-describedby="errors.message ? 'contact-message-error' : undefined"
                @input="onInput"
            ></textarea>
            <p v-if="errors.message" id="contact-message-error" class="error">{{ t.errMessage }}</p>
        </div>

        <button v-if="stale" type="button" class="link" @click="refresh">{{ t.refresh }}</button>
        <button type="submit" class="submit" :disabled="status === 'sending'">
            {{ status === 'sending' ? t.sending : t.submit }}
        </button>

        <div class="status" role="status" aria-live="polite">
            <p v-if="status === 'success'" class="ok">{{ t.success }}</p>
            <p v-else-if="status === 'error'" class="fail">
                {{ t.error }} <a :href="mailto">{{ t.errorLink }}</a>
            </p>
        </div>
    </form>
</template>

<style scoped>
.form {
    display: grid;
    gap: var(--space-4);
    align-content: start;
    padding: var(--space-6);
    background: var(--color-surface);
}
.field {
    display: grid;
    gap: var(--space-1);
}
label {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
}
input,
textarea {
    width: 100%;
    min-height: 44px;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    color: var(--color-text);
    font: inherit;
}
textarea {
    resize: vertical;
}
input:focus-visible,
textarea:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 1px;
}
input[aria-invalid='true'],
textarea[aria-invalid='true'] {
    border-color: var(--color-accent-2);
}
.error {
    color: var(--color-accent-2);
    font-size: var(--text-sm);
}
.link {
    justify-self: start;
    min-height: 44px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-accent);
    font-size: var(--text-sm);
    text-decoration: underline;
    cursor: pointer;
}
.submit {
    justify-self: start;
    min-height: 48px;
    padding: 0 var(--space-8);
    border: 1px solid var(--color-accent);
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-weight: 600;
    cursor: pointer;
}
.submit:disabled {
    opacity: 0.6;
    cursor: progress;
}
.status {
    min-height: 1.6em;
    font-size: var(--text-sm);
}
.ok {
    color: var(--color-accent);
}
.fail {
    color: var(--color-accent-2);
}
.fail a {
    color: inherit;
    overflow-wrap: anywhere;
}
</style>
