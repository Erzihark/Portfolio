<script setup lang="ts">
// THROWAWAY PROTOTYPE. Shared frame: heading, chips, summary, form and Crocky.
// The variant fills the "stage" slot and reads the selection state.
import { ref, computed, watch } from 'vue';
import Picker from './Picker.vue';
import ContactForm from './ContactForm.vue';
import CrockyCorner from './CrockyCorner.vue';
import { LINES, chipById, REMOVE_LINE, GREETING } from './shared';

const props = defineProps<{
    tag: string;
    sel: { selected: string[]; newest: string | null; toggle: (id: string) => boolean; clear: () => void };
    aimEl: HTMLElement | null;
}>();
const crocky = ref<InstanceType<typeof CrockyCorner> | null>(null);

function toggle(id: string) {
    const added = props.sel.toggle(id);
    if (added) crocky.value?.say(chipById(id).say);
    else crocky.value?.say(props.sel.selected.length ? REMOVE_LINE : GREETING);
}
function clearAll() {
    props.sel.clear();
    crocky.value?.say(GREETING);
}
watch(
    () => props.aimEl,
    (el) => crocky.value?.setAim(el),
    { immediate: true, flush: 'post' }
);

const summary = computed(() =>
    LINES.map((l) => ({ line: l, chips: l.chips.filter((c) => props.sel.selected.includes(c.id)) })).filter((s) => s.chips.length)
);
</script>

<template>
    <section class="sys" aria-labelledby="sys-h">
        <header class="head">
            <p class="tag">{{ tag }}</p>
            <h2 id="sys-h">Arma tu sistema</h2>
            <p class="sub">Marca lo que te pasa en tu negocio y mira cómo podríamos resolverlo.</p>
        </header>

        <Picker :selected="sel.selected" @toggle="toggle" @hover="(el) => crocky?.hover(el)" @leave="crocky?.hover(null)" />

        <div class="stagebar">
            <p class="tag caption" aria-live="polite">
                {{ summary.length ? summary.length + ' de 4 áreas en marcha' : 'Sin selección' }}
            </p>
            <button v-if="sel.selected.length" type="button" class="clear" @click="clearAll">Quitar todo</button>
        </div>
        <slot name="stage" />

        <div class="lower">
            <div class="result">
                <p class="tag">LO QUE PODRÍAMOS CONSTRUIR</p>
                <p v-if="!summary.length" class="empty">Marca lo que te pasa y aquí verás cómo podríamos ayudarte.</p>
                <ul v-else class="mods">
                    <li v-for="s in summary" :key="s.line.id" class="mod">
                        <p class="mod__title">
                            <span class="tag">SRV · {{ s.line.n }}</span>
                            {{ s.line.module }}
                        </p>
                        <ul>
                            <li v-for="c in s.chips" :key="c.id">{{ c.benefit }}</li>
                        </ul>
                    </li>
                </ul>
            </div>
            <ContactForm :selected="sel.selected" @focusin="crocky?.quiet()" />
        </div>

        <CrockyCorner ref="crocky" />
    </section>
</template>

<style scoped>
.sys {
    position: relative;
    display: grid;
    gap: var(--space-6);
    max-width: 76rem;
    margin-inline: auto;
    padding: var(--space-12) var(--gutter) 12rem;
}
.tag {
    font-family: ui-monospace, 'SFMono-Regular', Consolas, monospace;
    font-size: 0.6875rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-muted);
}
h2 {
    margin-top: var(--space-3);
    font-size: clamp(2rem, 1.1rem + 3.3vw, 3.25rem);
    line-height: var(--leading-tight);
    letter-spacing: -0.02em;
}
.sub {
    margin-top: var(--space-3);
    max-width: 36rem;
    color: var(--color-text-muted);
    font-size: var(--text-lg);
}
.stagebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
    margin-bottom: calc(var(--space-4) * -1);
}
.caption {
    color: var(--color-accent);
}
.clear {
    min-height: 44px;
    padding: 0 var(--space-3);
    border: 0;
    background: transparent;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    text-decoration: underline;
    cursor: pointer;
}
.lower {
    display: grid;
    gap: var(--space-8);
}
.result {
    display: grid;
    gap: var(--space-3);
    align-content: start;
}
.empty {
    color: var(--color-text-muted);
}
.mods {
    display: grid;
    gap: var(--space-3);
    padding: 0;
    list-style: none;
}
.mod {
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border);
    border-left: 2px solid var(--color-accent);
    background: var(--color-surface);
}
.mod__title {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-2);
    font-family: var(--font-heading);
    font-weight: 600;
}
.mod ul {
    display: grid;
    gap: var(--space-1);
    margin-top: var(--space-2);
    padding: 0;
    list-style: none;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
}
.mod ul li::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 1px;
    margin-right: var(--space-2);
    vertical-align: middle;
    background: var(--color-accent);
}
/* Keep content clear of the fixed speech bubble (16rem + 16px). */
@media (min-width: 900px) {
    .sys {
        padding-right: max(var(--gutter), calc(17rem - max(0px, (100vw - 76rem) / 2)));
    }
}
@media (min-width: 900px) {
    .lower {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        padding-right: 0;
    }
}
</style>
