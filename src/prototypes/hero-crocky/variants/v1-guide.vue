<script setup lang="ts">
// THROWAWAY PROTOTYPE. v1 "Guía": split layout. Crocky stands on a HUD grid and guides with chips.
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { GridHelper, RingGeometry, Mesh, MeshBasicMaterial, MathUtils, type LineBasicMaterial } from 'three';
import { COPY, createCrockyStage, readHidden, writeHidden, prefersReduced, type CrockyStage } from '../crockyRig';

const host = ref<HTMLDivElement | null>(null);
const hidden = ref(readHidden());
const failed = ref(false);
const active = ref(-1);
const text = computed(() => (active.value < 0 ? COPY.greeting : COPY.services[active.value].say));
let stage: CrockyStage | null = null;
let timer = 0;

function pick(i: number) {
    active.value = i;
    if (!stage) return;
    if (i % 2 === 0) stage.wave();
    else stage.jaw(900);
}
function hide() {
    hidden.value = true;
    writeHidden(true);
}
function show() {
    hidden.value = false;
    writeHidden(false);
}
watch(hidden, (h) => {
    if (stage) stage.root.visible = !h;
});

onMounted(() => {
    stage = createCrockyStage(host.value!, { pos: [0.55, 0.7, 3.6], target: [0, 0.46, 0], fov: 30 });
    if (!stage) {
        failed.value = true;
        return;
    }
    const s = stage;
    s.root.visible = !hidden.value;
    const grid = new GridHelper(4, 16, 0x4ade9b, 0x4ade9b);
    const gm = grid.material as LineBasicMaterial;
    gm.transparent = true;
    gm.opacity = 0.22;
    gm.toneMapped = false;
    s.scene.add(grid);
    const ring = new Mesh(
        new RingGeometry(0.55, 0.565, 72),
        new MeshBasicMaterial({ color: 0x4ade9b, transparent: true, opacity: 0.7, toneMapped: false })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.003;
    s.scene.add(ring);

    let lastDist = 0;
    s.onResize = (w, h) => {
        const half = Math.tan(MathUtils.degToRad(s.camera.fov / 2));
        const dist = Math.max(3.6, 2.7 / (w / h) / (2 * half));
        if (Math.abs(dist - lastDist) < 0.01) return;
        lastDist = dist;
        s.camera.position.set(dist * 0.15, 0.7, dist);
        s.camera.lookAt(0, 0.46, 0);
    };
    s.ready.then((ok) => {
        if (!ok) failed.value = true;
        else if (!prefersReduced() && !hidden.value) timer = window.setTimeout(() => s.wave(), 600);
    });
});
onBeforeUnmount(() => {
    window.clearTimeout(timer);
    stage?.dispose();
    stage = null;
});
</script>

<template>
    <section class="v1" aria-label="Inicio">
        <div class="hero">
            <div class="copy">
                <p class="tag">SYS · 01 / SERVICIOS A LA MEDIDA</p>
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

            <div class="panel hud" aria-label="Crocky, tu guía">
                <div class="panel__head">
                    <span class="tag">GUÍA · CROCKY</span>
                    <button v-if="!hidden" class="x" type="button" aria-label="Ocultar a Crocky" @click="hide">
                        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" fill="none" /></svg>
                    </button>
                    <button v-else class="restore" type="button" aria-label="Mostrar a Crocky" @click="show">Crocky</button>
                </div>

                <div v-if="!hidden" class="bubble" role="status" aria-live="polite">
                    <p class="bubble__text">{{ text }}</p>
                    <ul class="chips">
                        <li v-for="(s, i) in COPY.services" :key="s.title">
                            <button type="button" class="chip" :aria-pressed="active === i" @click="pick(i)">{{ s.title }}</button>
                        </li>
                    </ul>
                </div>

                <div class="stage">
                    <div ref="host" class="stage__canvas" :hidden="hidden"></div>
                    <p v-if="failed && !hidden" class="stage__fallback">Crocky</p>
                </div>
            </div>
        </div>

        <ul class="cards">
            <li v-for="(s, i) in COPY.services" :key="s.title" class="card hud" :class="{ 'is-on': active === i }" :aria-current="active === i ? 'true' : undefined">
                <span class="tag">SRV · 0{{ i + 1 }}</span>
                <h2>{{ s.title }}</h2>
                <p>{{ s.text }}</p>
            </li>
        </ul>
    </section>
</template>

<style scoped>
.v1 {
    --line: var(--color-border);
    max-width: var(--container-max);
    margin-inline: auto;
    padding: var(--space-12) var(--gutter) 10rem;
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
.hero {
    display: grid;
    gap: var(--space-8);
    grid-template-columns: minmax(0, 1fr);
}
@media (min-width: 900px) {
    .hero {
        grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
        align-items: center;
        gap: var(--space-12);
    }
}
h1 {
    margin-top: var(--space-3);
    font-size: clamp(2rem, 1.1rem + 3.3vw, 3.5rem);
    line-height: var(--leading-tight);
    letter-spacing: -0.02em;
}
.sub {
    margin-top: var(--space-4);
    max-width: 38rem;
    color: var(--color-text-muted);
    font-size: var(--text-lg);
}
.ctas {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-6);
}
.btn {
    display: inline-flex;
    align-items: center;
    min-height: 48px;
    padding: 0 var(--space-6);
    border: 1px solid var(--line);
    background: transparent;
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
    display: grid;
    gap: var(--space-2);
    margin-top: var(--space-6);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
}
.trust li {
    padding-left: var(--space-4);
    position: relative;
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
.panel {
    min-width: 0;
    background:
        linear-gradient(var(--line) 1px, transparent 1px) 0 0 / 100% 32px,
        linear-gradient(90deg, var(--line) 1px, transparent 1px) 0 0 / 32px 100%,
        var(--color-surface);
    background-blend-mode: soft-light, soft-light, normal;
}
.panel__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
    padding: 0 var(--space-3) 0 var(--space-4);
    border-bottom: 1px solid var(--line);
    background: var(--color-surface);
}
.x,
.restore {
    display: inline-grid;
    place-items: center;
    min-width: 44px;
    min-height: 44px;
    border: 0;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
}
.restore {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-accent);
}
.x:hover {
    color: var(--color-text);
}
.bubble {
    position: relative;
    margin: var(--space-4);
    padding: var(--space-4);
    border: 1px solid var(--color-accent);
    background: var(--color-bg);
}
.bubble::after {
    content: '';
    position: absolute;
    left: 40%;
    bottom: -7px;
    width: 12px;
    height: 12px;
    background: var(--color-bg);
    border-right: 1px solid var(--color-accent);
    border-bottom: 1px solid var(--color-accent);
    transform: rotate(45deg);
}
.bubble__text {
    font-family: var(--font-heading);
    font-size: var(--text-base);
    line-height: 1.35;
}
.chips {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
    margin-top: var(--space-3);
}
.chip {
    width: 100%;
    height: 100%;
    min-height: 44px;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--line);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: 0.8125rem;
    line-height: 1.25;
    text-align: left;
    overflow-wrap: anywhere;
    cursor: pointer;
}
.chip:hover,
.chip[aria-pressed='true'] {
    border-color: var(--color-accent);
}
.chip[aria-pressed='true'] {
    color: var(--color-accent);
}
.stage {
    position: relative;
    height: clamp(240px, 34vw, 340px);
}
.stage__canvas {
    position: absolute;
    inset: 0;
}
.stage__canvas[hidden] {
    display: none;
}
.stage__fallback {
    position: absolute;
    inset: var(--space-4);
    display: grid;
    place-items: center;
    border: 1px dashed var(--line);
    color: var(--color-text-muted);
    font-family: var(--font-heading);
    font-size: var(--text-xl);
}
.cards {
    display: grid;
    gap: var(--space-4);
    grid-template-columns: minmax(0, 1fr);
    margin-top: var(--space-12);
}
@media (min-width: 600px) {
    .cards {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
@media (min-width: 1100px) {
    .cards {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}
.card {
    padding: var(--space-4);
    transition: border-color var(--dur-base), background var(--dur-base);
}
.card::before {
    opacity: 0.35;
    transition: opacity var(--dur-base);
}
.card h2 {
    margin-top: var(--space-3);
    font-size: var(--text-lg);
    line-height: 1.2;
}
.card p {
    margin-top: var(--space-2);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
}
.card.is-on {
    border-color: var(--color-accent);
    background: var(--color-surface-2);
}
.card.is-on::before {
    opacity: 1;
}
.card.is-on .tag {
    color: var(--color-accent);
}
</style>
