<script setup lang="ts">
// THROWAWAY PROTOTYPE. v3 "Consola": text first. Crocky is a comms portrait that comments on the hovered service panel.
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import { COPY, createCrockyStage, readHidden, writeHidden, prefersReduced, type CrockyStage } from '../crockyRig';

const host = ref<HTMLDivElement | null>(null);
const portrait = ref<HTMLElement | null>(null);
const collapsed = ref(readHidden());
const failed = ref(false);
const active = ref(-1);
const text = computed(() => (active.value < 0 ? COPY.greeting : COPY.services[active.value].say));
let stage: CrockyStage | null = null;
let alive = true;

function startStage() {
    if (stage || !host.value) return;
    stage = createCrockyStage(host.value, { pos: [0.2, 0.8, 2.7], target: [0, 0.68, 0], fov: 26 });
    if (!stage) {
        failed.value = true;
        return;
    }
    const s = stage;
    s.ready.then((ok) => {
        if (!ok) failed.value = true;
        else if (!prefersReduced() && alive && s === stage) s.blink();
    });
}
function stopStage() {
    stage?.dispose();
    stage = null;
}
function collapse() {
    collapsed.value = true;
    writeHidden(true);
}
function expand() {
    collapsed.value = false;
    writeHidden(false);
}
watch(collapsed, async (c) => {
    if (c) {
        stopStage();
        active.value = -1;
    } else {
        await nextTick();
        startStage();
    }
});

// Aim the pupils from the portrait to the panel.
function aim(i: number, e: Event) {
    active.value = i;
    if (!stage || !portrait.value) return;
    const p = portrait.value.getBoundingClientRect();
    const t = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dx = t.left + t.width / 2 - (p.left + p.width / 2);
    const dy = t.top + t.height / 2 - (p.top + p.height / 2);
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    stage.setGaze(clamp(dx / 450), clamp(dy / 450));
    if (!prefersReduced()) stage.jaw(500);
}
function leave() {
    active.value = -1;
    stage?.setGaze(null);
}

onMounted(() => {
    if (!collapsed.value) startStage();
});
onBeforeUnmount(() => {
    alive = false;
    stopStage();
});
</script>

<template>
    <section class="v3" aria-label="Inicio">
        <div class="head">
            <p class="tag">SYS · 03 / CONSOLA</p>
            <h1>{{ COPY.heading }}</h1>
            <p class="sub">{{ COPY.sub }}</p>
            <p class="ctas">
                <a class="btn btn--primary" :href="COPY.cta1.href">{{ COPY.cta1.label }}</a>
                <a class="btn" :href="COPY.cta2.href">{{ COPY.cta2.label }}</a>
            </p>
            <ul class="trust">
                <li v-for="t in COPY.trust" :key="t">{{ t }}</li>
            </ul>
        </div>

        <div class="frame hud">
            <div class="frame__bar">
                <span class="tag">SERVICIOS · 04 MÓDULOS</span>
                <span class="tag">ESTADO · DISPONIBLE</span>
            </div>

            <ul class="grid2">
                <li
                    v-for="(s, i) in COPY.services"
                    :key="s.title"
                    class="panel hud"
                    :class="{ 'is-on': active === i }"
                    tabindex="0"
                    :aria-label="s.title"
                    @pointerenter="aim(i, $event)"
                    @pointerleave="leave"
                    @focus="aim(i, $event)"
                    @blur="leave"
                >
                    <span class="tag">MOD · 0{{ i + 1 }}</span>
                    <h2>{{ s.title }}</h2>
                    <p>{{ s.text }}</p>
                </li>
            </ul>

            <div class="comms">
                <template v-if="!collapsed">
                    <div class="bubble" role="status" aria-live="polite">
                        <p class="bubble__text">{{ text }}</p>
                        <button class="x" type="button" aria-label="Ocultar a Crocky" @click="collapse">
                            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" fill="none" /></svg>
                        </button>
                    </div>
                    <div ref="portrait" class="portrait" aria-label="Crocky">
                        <div ref="host" class="portrait__canvas"></div>
                        <span v-if="failed" class="portrait__fallback">Crocky</span>
                    </div>
                </template>
                <button v-else class="restore" type="button" aria-label="Mostrar a Crocky" @click="expand">Crocky</button>
            </div>
        </div>
    </section>
</template>

<style scoped>
.v3 {
    --line: var(--color-border);
    max-width: var(--container-max);
    margin-inline: auto;
    padding: var(--space-16) var(--gutter) 10rem;
}
.tag {
    font-family: ui-monospace, 'SFMono-Regular', Consolas, monospace;
    font-size: 0.6875rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-muted);
}
.hud {
    position: relative;
    border: 1px solid var(--line);
    background: var(--color-surface);
}
.hud::before {
    --c: var(--color-accent);
    content: '';
    position: absolute;
    inset: -1px;
    pointer-events: none;
    background:
        linear-gradient(var(--c), var(--c)) top left / 10px 1px no-repeat,
        linear-gradient(var(--c), var(--c)) top left / 1px 10px no-repeat,
        linear-gradient(var(--c), var(--c)) top right / 10px 1px no-repeat,
        linear-gradient(var(--c), var(--c)) top right / 1px 10px no-repeat,
        linear-gradient(var(--c), var(--c)) bottom left / 10px 1px no-repeat,
        linear-gradient(var(--c), var(--c)) bottom left / 1px 10px no-repeat,
        linear-gradient(var(--c), var(--c)) bottom right / 10px 1px no-repeat,
        linear-gradient(var(--c), var(--c)) bottom right / 1px 10px no-repeat;
}
.head {
    display: grid;
    justify-items: center;
    text-align: center;
}
h1 {
    max-width: 18ch;
    margin-top: var(--space-4);
    font-size: clamp(2.25rem, 1.2rem + 4.2vw, 4.5rem);
    line-height: var(--leading-tight);
    letter-spacing: -0.02em;
}
.sub {
    max-width: 40rem;
    margin-top: var(--space-6);
    color: var(--color-text-muted);
    font-size: var(--text-lg);
}
.ctas {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-3);
    margin-top: var(--space-8);
}
.btn {
    display: inline-flex;
    align-items: center;
    min-height: 48px;
    padding: 0 var(--space-6);
    border: 1px solid var(--line);
    color: var(--color-text);
    text-decoration: none;
    font-weight: 600;
}
.btn:hover {
    border-color: var(--color-accent);
}
.btn--primary {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: var(--color-on-accent);
}
.trust {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-2) var(--space-6);
    margin-top: var(--space-8);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
}
.trust li {
    position: relative;
    padding-left: var(--space-4);
    text-align: left;
}
.trust li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.55em;
    width: 6px;
    height: 1px;
    background: var(--color-accent);
}
.frame {
    margin-top: var(--space-16);
    padding: 0 var(--space-4) var(--space-4);
}
.frame__bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-3) 0;
    margin-bottom: var(--space-4);
    border-bottom: 1px solid var(--line);
}
.grid2 {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
}
@media (min-width: 640px) {
    .grid2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
.panel {
    padding: var(--space-6);
    background: var(--color-bg);
    transition: border-color var(--dur-base);
}
.panel::before {
    opacity: 0.35;
    transition: opacity var(--dur-base);
}
.panel h2 {
    margin-top: var(--space-3);
    font-size: var(--text-xl);
    line-height: 1.2;
}
.panel p {
    margin-top: var(--space-2);
    color: var(--color-text-muted);
}
.panel:hover,
.panel.is-on {
    border-color: var(--color-accent);
}
.panel:hover::before,
.panel.is-on::before {
    opacity: 1;
}
.panel.is-on .tag {
    color: var(--color-accent);
}
.comms {
    display: flex;
    flex-direction: column-reverse;
    align-items: flex-end;
    gap: var(--space-3);
    margin-top: var(--space-6);
    padding-top: var(--space-4);
    border-top: 1px solid var(--line);
}
@media (min-width: 640px) {
    .comms {
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        gap: var(--space-4);
    }
}
.bubble {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    max-width: 24rem;
    min-height: 3.5rem;
    padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
    border: 1px solid var(--color-accent);
    background: var(--color-bg);
}
.bubble::after {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    background: var(--color-bg);
    border-right: 1px solid var(--color-accent);
    border-bottom: 1px solid var(--color-accent);
    right: 28px;
    bottom: -7px;
    transform: rotate(45deg);
}
@media (min-width: 640px) {
    .bubble::after {
        right: -7px;
        bottom: auto;
        top: calc(50% - 6px);
        transform: rotate(-45deg);
    }
}
.bubble__text {
    flex: 1;
    font-family: var(--font-heading);
    line-height: 1.3;
}
.x,
.restore {
    display: inline-grid;
    flex: none;
    place-items: center;
    min-width: 44px;
    min-height: 44px;
    border: 0;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
}
.x:hover {
    color: var(--color-text);
}
.restore {
    padding: 0 var(--space-4);
    border: 1px solid var(--line);
    color: var(--color-accent);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
.portrait {
    position: relative;
    flex: none;
    width: 7rem;
    height: 7rem;
    overflow: hidden;
    border: 1px solid var(--color-accent);
    border-radius: 50%;
    box-shadow: 0 0 0 4px var(--color-bg), 0 0 0 5px var(--line);
    background:
        radial-gradient(circle at 50% 40%, rgb(74 222 155 / 0.16), transparent 65%),
        linear-gradient(var(--line) 1px, transparent 1px) 0 0 / 100% 14px,
        var(--color-bg);
}
.portrait__canvas {
    position: absolute;
    inset: 0;
}
.portrait__fallback {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--color-text-muted);
    font-family: var(--font-heading);
}
@media (min-width: 640px) {
    .portrait {
        width: 9rem;
        height: 9rem;
    }
}
</style>
