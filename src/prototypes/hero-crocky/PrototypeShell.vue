<script setup lang="ts">
// THROWAWAY PROTOTYPE. Shell for the hero-crocky variants. It loads one variant and shows a switch bar.
import { ref, shallowRef, computed, watch, nextTick, defineAsyncComponent, onMounted, onBeforeUnmount } from 'vue';

const meta: Record<string, { name: string; tests: string }> = {
    v4: { name: 'Combinado', tests: 'Workshop with centred builds. Crocky is a fixed corner portrait that comments on what you hover or focus.' },
};

const files = import.meta.glob('./variants/v*.vue');
const keyOfPath = (f: string) => f.split('/').pop()!.split('-')[0].replace('.vue', '');
const keys = Object.keys(files).map(keyOfPath).sort();
const fileOf = (k: string) => Object.keys(files).find((f) => keyOfPath(f) === k)!;

const active = ref('');
const comp = shallowRef<any>(null);
const hidden = ref(false);
const vw = ref(0);
const vh = ref(0);
const fps = ref(0);
const barEl = ref<HTMLElement | null>(null);
// Publish the bar height so fixed elements can sit above it.
let barRo: ResizeObserver | null = null;
function setBarVar(px: number) {
    document.documentElement.style.setProperty('--proto-bar-h', px + 'px');
}
watch([hidden, barEl], async () => {
    await nextTick();
    barRo?.disconnect();
    if (hidden.value || !barEl.value) {
        setBarVar(0);
        return;
    }
    barRo = new ResizeObserver(() => setBarVar(barEl.value ? Math.round(barEl.value.getBoundingClientRect().height) + 12 : 0));
    barRo.observe(barEl.value);
});

function readParam() {
    const v = new URL(location.href).searchParams.get('v');
    return v && keys.includes(v) ? v : keys[0] || '';
}
function load(k: string) {
    active.value = k;
    comp.value = k ? defineAsyncComponent(files[fileOf(k)] as any) : null;
}
function select(k: string) {
    if (!k || k === active.value) return;
    const u = new URL(location.href);
    u.searchParams.set('v', k);
    history.pushState({}, '', u);
    load(k);
    window.scrollTo(0, 0);
}
function step(d: number) {
    if (!keys.length) return;
    const i = keys.indexOf(active.value);
    select(keys[(i + d + keys.length) % keys.length]);
}
function onPop() {
    load(readParam());
    window.scrollTo(0, 0);
}
function onKey(e: KeyboardEvent) {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'h' || e.key === 'H') hidden.value = !hidden.value;
    else if (/^[1-4]$/.test(e.key) && keys.includes('v' + e.key)) select('v' + e.key);
}
function measure() {
    vw.value = window.innerWidth;
    vh.value = window.innerHeight;
}

let raf = 0;
let frames = 0;
let last = 0;
function loop(t: number) {
    frames++;
    if (t - last >= 500) {
        fps.value = Math.round((frames * 1000) / (t - last));
        frames = 0;
        last = t;
    }
    raf = requestAnimationFrame(loop);
}

onMounted(() => {
    load(readParam());
    measure();
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', measure);
    last = performance.now();
    raf = requestAnimationFrame(loop);
});
onBeforeUnmount(() => {
    window.removeEventListener('popstate', onPop);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', measure);
    cancelAnimationFrame(raf);
    barRo?.disconnect();
    document.documentElement.style.removeProperty('--proto-bar-h');
});

const info = computed(() => meta[active.value] || { name: active.value, tests: '' });
const short = (k: string) => meta[k]?.name || k;
</script>

<template>
    <div>
        <p v-if="!keys.length" class="proto-empty">
            No variant files yet. Add files in src/prototypes/hero-crocky/variants/ named v4-*.vue.
        </p>
        <Suspense v-else>
            <component :is="comp" :key="active" />
            <template #fallback>
                <p class="proto-loading">Loading {{ active }}...</p>
            </template>
        </Suspense>

        <button v-if="hidden" class="proto-show" type="button" @click="hidden = false">PROTOTYPE · show (H)</button>

        <div v-else ref="barEl" class="proto-bar" role="region" aria-label="Prototype controls">
            <div class="proto-row">
                <strong class="proto-tag">PROTOTYPE</strong>
                <button type="button" class="proto-btn" aria-label="Previous variant" @click="step(-1)">&larr;</button>
                <button
                    v-for="k in keys"
                    :key="k"
                    type="button"
                    class="proto-btn"
                    :aria-pressed="k === active"
                    @click="select(k)"
                >
                    {{ k }} <span class="proto-name">{{ short(k) }}</span>
                </button>
                <button type="button" class="proto-btn" aria-label="Next variant" @click="step(1)">&rarr;</button>
                <button type="button" class="proto-btn" aria-label="Hide bar" @click="hidden = true">Hide</button>
            </div>
            <p class="proto-state">
                <b>{{ active || '-' }}</b> {{ info.name }} · {{ vw }}x{{ vh }} · {{ fps }} fps
            </p>
            <p v-if="info.tests" class="proto-tests">{{ info.tests }}</p>
        </div>
    </div>
</template>

<style scoped>
.proto-empty,
.proto-loading {
    padding: var(--space-16) var(--gutter);
    color: var(--color-text-muted);
    text-align: center;
}
.proto-bar {
    position: fixed;
    left: 50%;
    bottom: var(--space-3);
    transform: translateX(-50%);
    z-index: 2147483647;
    width: max-content;
    max-width: calc(100vw - 16px);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: 1.5rem;
    background: rgb(7 9 13 / 0.85);
    backdrop-filter: blur(10px);
    color: var(--color-text);
    font-size: 0.8125rem;
    text-align: center;
}
.proto-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
}
.proto-tag {
    padding: 0 var(--space-2);
    color: var(--color-accent-2);
    letter-spacing: 0.08em;
}
.proto-btn,
.proto-show {
    min-width: 44px;
    min-height: 44px;
    padding: 0 var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    background: var(--color-surface-2);
    cursor: pointer;
}
.proto-btn[aria-pressed='true'] {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: var(--color-on-accent);
    font-weight: 600;
}
.proto-state,
.proto-tests {
    margin-top: var(--space-1);
    color: var(--color-text-muted);
    line-height: 1.35;
}
.proto-tests {
    max-width: 38rem;
    margin-inline: auto;
}
.proto-show {
    position: fixed;
    right: var(--space-3);
    bottom: var(--space-3);
    z-index: 2147483647;
    background: rgb(7 9 13 / 0.85);
    color: var(--color-text);
    font-size: 0.75rem;
}
@media (max-width: 480px) {
    .proto-name {
        display: none;
    }
    .proto-btn {
        padding: 0 var(--space-2);
    }
}
</style>
