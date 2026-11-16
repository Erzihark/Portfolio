<script setup lang="ts">
// THROWAWAY PROTOTYPE. Fake contact form. The message follows the selection until the visitor edits it.
import { ref, watch, computed } from 'vue';
import { buildMessage } from './shared';

const props = defineProps<{ selected: string[] }>();
const emit = defineEmits<{ (e: 'focusin'): void }>();
const auto = computed(() => buildMessage(props.selected));
const message = ref(auto.value);
const edited = ref(false);
const sent = ref(false);

watch(auto, (v) => {
    if (!edited.value) message.value = v;
});
const stale = computed(() => edited.value && message.value !== auto.value);
function onInput() {
    edited.value = message.value !== auto.value;
}
function refresh() {
    message.value = auto.value;
    edited.value = false;
}
function submit() {
    sent.value = true;
}
</script>

<template>
    <form class="form" @submit.prevent="submit" @focusin="emit('focusin')">
        <p class="tag">CONTACTO</p>
        <label class="field">
            <span>Nombre</span>
            <input type="text" name="name" autocomplete="name" required />
        </label>
        <label class="field">
            <span>Correo o teléfono</span>
            <input type="text" name="contact" autocomplete="email" required />
        </label>
        <label class="field">
            <span>Mensaje</span>
            <textarea v-model="message" name="message" rows="6" @input="onInput"></textarea>
        </label>
        <button v-if="stale" type="button" class="link" @click="refresh">Actualizar con mi selección</button>
        <button type="submit" class="submit">Enviar</button>
        <p v-if="sent" class="note" role="status">Prototipo: no se envía.</p>
    </form>
</template>

<style scoped>
.form {
    display: grid;
    gap: var(--space-3);
    align-content: start;
}
.tag {
    font-family: ui-monospace, 'SFMono-Regular', Consolas, monospace;
    font-size: 0.6875rem;
    letter-spacing: 0.14em;
    color: var(--color-text-muted);
}
.field {
    display: grid;
    gap: var(--space-1);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
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
input:focus,
textarea:focus {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
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
.note {
    color: var(--color-accent-2);
    font-size: var(--text-sm);
}
</style>
