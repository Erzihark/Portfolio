<script setup lang="ts">
// THROWAWAY PROTOTYPE. v2 "Taller": full-width stage. Four low-poly builds assemble in a loop. Crocky watches.
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import {
    GridHelper, BoxGeometry, TorusGeometry, CylinderGeometry, IcosahedronGeometry, OctahedronGeometry,
    EdgesGeometry, Mesh, LineSegments, Group, Vector3, Euler, MeshBasicMaterial, LineBasicMaterial,
    MathUtils, type BufferGeometry
} from 'three';
import { COPY, createCrockyStage, readHidden, writeHidden, prefersReduced, type CrockyStage } from '../crockyRig';

const host = ref<HTMLDivElement | null>(null);
const dock = ref<HTMLElement | null>(null);
const hidden = ref(readHidden());
const failed = ref(false);
const idx = ref(0);
const spoke = ref(false); // false: greeting. true: service line.
const text = computed(() => (spoke.value ? COPY.services[idx.value].say : COPY.greeting));
let stage: CrockyStage | null = null;
let setBuild: (i: number, user: boolean) => void = () => {};

function choose(i: number) {
    spoke.value = true;
    setBuild(i, true);
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

// ---- Build pieces ----
interface Piece {
    g: Group;
    to: Vector3;
    toRot: Euler;
    from: Vector3;
    spin: number;
    delay: number;
}
interface Build {
    group: Group;
    pieces: Piece[];
    tick?: (t: number, done: boolean) => void;
}
const A = 2.6; // assemble seconds
const H = 3.4; // hold seconds
const O = 0.9; // take apart seconds
const TOTAL = A + H + O;
const ease = (t: number) => 1 - Math.pow(1 - MathUtils.clamp(t, 0, 1), 3);

onMounted(() => {
    stage = createCrockyStage(host.value!, { pos: [0, 0.95, 4.2], target: [0, 0.42, 0], fov: 32 });
    if (!stage) {
        failed.value = true;
        return;
    }
    const s = stage;
    const reduced = prefersReduced();
    s.root.visible = !hidden.value;

    const faceMat = new MeshBasicMaterial({ color: 0x0f131a, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, toneMapped: false });
    const lineMat = new LineBasicMaterial({ color: 0x4ade9b, toneMapped: false });
    const accentMat = new LineBasicMaterial({ color: 0xffb454, toneMapped: false });

    // Holographic bench.
    const bench = new Group();
    const slab = new BoxGeometry(4.0, 0.04, 2.0);
    const slabMesh = new Mesh(slab, faceMat);
    slabMesh.position.y = -0.021;
    const slabEdges = new LineSegments(new EdgesGeometry(slab), lineMat);
    slabEdges.position.y = -0.021;
    const grid = new GridHelper(4.0, 20, 0x4ade9b, 0x4ade9b);
    const gm = grid.material as LineBasicMaterial;
    gm.transparent = true;
    gm.opacity = 0.2;
    gm.toneMapped = false;
    grid.scale.z = 2.0 / 4.0;
    grid.position.y = 0.002;
    bench.add(slabMesh, slabEdges, grid);
    s.scene.add(bench);

    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

    function makeBuild(): Build {
        const group = new Group();
        group.visible = false;
        s.scene.add(group);
        return { group, pieces: [] };
    }
    function add(b: Build, geo: BufferGeometry, x: number, y: number, z: number, rot: [number, number, number] = [0, 0, 0], opts: { amber?: boolean; spin?: number } = {}) {
        const g = new Group();
        g.add(new Mesh(geo, faceMat));
        g.add(new LineSegments(new EdgesGeometry(geo, 12), opts.amber ? accentMat : lineMat));
        const to = new Vector3(x, y, z);
        const from = new Vector3(x + rnd() * 1.1, y + 0.9 + Math.abs(rnd()) * 0.9, z + rnd() * 0.8);
        g.position.copy(from);
        g.scale.setScalar(0.0001);
        b.group.add(g);
        const p: Piece = { g, to, toRot: new Euler(...rot), from, spin: opts.spin ?? 2.4, delay: b.pieces.length };
        b.pieces.push(p);
        return p;
    }
    const box = (w: number, h: number, d: number) => new BoxGeometry(w, h, d);
    const plate = (b: Build, w: number, d: number) => add(b, box(w, 0.02, d), 0, 0.01, 0);

    // 1. Dashboard panel.
    const b1 = makeBuild();
    plate(b1, 0.6, 0.28);
    add(b1, box(0.05, 0.26, 0.05), 0, 0.15, 0);
    add(b1, box(1.0, 0.62, 0.03), 0, 0.53, 0);
    add(b1, box(0.92, 0.06, 0.012), 0, 0.75, 0.02);
    [0.12, 0.22, 0.17, 0.3].forEach((h, i) => add(b1, box(0.08, h, 0.02), -0.38 + i * 0.12, 0.29 + h / 2, 0.03));
    add(b1, new TorusGeometry(0.13, 0.014, 6, 20), 0.3, 0.5, 0.025);
    add(b1, box(0.3, 0.03, 0.012), 0.3, 0.68, 0.02, [0, 0, 0], { amber: true });

    // 2. Phone.
    const b2 = makeBuild();
    plate(b2, 0.6, 0.3);
    add(b2, box(0.4, 0.78, 0.05), 0, 0.41, 0);
    add(b2, box(0.34, 0.62, 0.012), 0, 0.45, 0.03);
    [0.64, 0.5, 0.36].forEach((y) => add(b2, box(0.26, 0.07, 0.012), 0, y, 0.04));
    add(b2, box(0.1, 0.014, 0.012), 0, 0.77, 0.03);
    add(b2, new CylinderGeometry(0.028, 0.028, 0.014, 12), 0, 0.12, 0.035, [Math.PI / 2, 0, 0], { amber: true });

    // 3. Speed gauge.
    const b3 = makeBuild();
    plate(b3, 0.8, 0.3);
    add(b3, new TorusGeometry(0.38, 0.02, 6, 24, Math.PI), 0, 0.12, 0);
    for (let i = 0; i < 7; i++) {
        const a = Math.PI * (i / 6);
        add(b3, box(0.02, 0.07, 0.02), Math.cos(a) * 0.3, 0.12 + Math.sin(a) * 0.3, 0, [0, 0, a - Math.PI / 2]);
    }
    add(b3, new CylinderGeometry(0.045, 0.045, 0.03, 12), 0, 0.12, 0, [Math.PI / 2, 0, 0]);
    const needleGeo = box(0.3, 0.02, 0.02);
    needleGeo.translate(0.14, 0, 0);
    const needle = add(b3, needleGeo, 0, 0.12, 0, [0, 0, Math.PI], { amber: true });
    b3.tick = (t, done) => {
        if (!done || reduced) return;
        const k = 0.5 - 0.5 * Math.cos(Math.min(1, t / 1.6) * Math.PI);
        needle.g.rotation.z = Math.PI * (1 - 0.85 * k) + Math.sin(t * 9) * 0.015 * k;
    };

    // 4. Small interactive 3D object.
    const b4 = makeBuild();
    plate(b4, 0.6, 0.4);
    add(b4, new CylinderGeometry(0.12, 0.15, 0.1, 8), 0, 0.07, 0);
    const ico = add(b4, new IcosahedronGeometry(0.22, 0), 0, 0.38, 0);
    const orbitRing = add(b4, new TorusGeometry(0.34, 0.008, 4, 32), 0, 0.38, 0, [Math.PI / 2.3, 0, 0]);
    const sat = add(b4, new OctahedronGeometry(0.05, 0), 0.34, 0.38, 0, [0, 0, 0], { amber: true });
    b4.tick = (t, done) => {
        if (!done || reduced) return;
        ico.g.rotation.y = t * 0.9;
        ico.g.rotation.x = t * 0.35;
        orbitRing.g.rotation.z = t * 0.4;
        const a = t * 1.5;
        sat.g.position.set(Math.cos(a) * 0.34, 0.38 + Math.sin(a * 0.7) * 0.07, Math.sin(a) * 0.34);
    };
    const builds = [b1, b2, b3, b4];

    // ---- Timeline ----
    let bt = reduced ? A + 0.2 : 0;
    let current = 0;
    function place(x: number, scale: number) {
        builds.forEach((b) => {
            b.group.position.set(x, 0, 0.15);
            b.group.rotation.y = -0.35;
            b.group.scale.setScalar(b === b2 ? scale * 1.25 : scale);
        });
    }
    function apply() {
        builds.forEach((b, bi) => {
            b.group.visible = bi === current;
        });
        const b = builds[current];
        const n = b.pieces.length;
        b.pieces.forEach((p) => {
            const start = (p.delay / n) * (A - 0.9);
            const ein = ease((bt - start) / 0.9);
            const eout = ease((bt - (A + H) - (p.delay / n) * 0.3) / 0.6);
            const e = Math.max(0, ein - eout);
            p.g.visible = e > 0.002;
            p.g.scale.setScalar(Math.max(e, 0.0001));
            p.g.position.lerpVectors(p.from, p.to, e);
            const r = (1 - e) * p.spin;
            p.g.rotation.set(p.toRot.x + r, p.toRot.y + r * 0.6, p.toRot.z);
        });
        b.tick?.(Math.max(0, bt - A), bt >= A);
    }
    function look() {
        s.setGaze(0.5, -0.05);
    }
    setBuild = (i, user) => {
        current = i;
        idx.value = i;
        bt = reduced ? A + 0.2 : 0;
        if (!user && !reduced) s.jaw(450);
        apply();
    };

    // ---- View ----
    let lastKey = '';
    // Three sizes: compact (< 700 px), medium, wide overlay (>= 1280 px).
    s.onResize = (w, h) => {
        const mode = w < 700 ? 'c' : window.innerWidth >= 1280 ? 'w' : 'm';
        const cfg = { c: { vis: 2.9, shift: -0.1, x: 1.0, sc: 0.95 }, m: { vis: 5.0, shift: 0.03, x: 1.4, sc: 1.2 }, w: { vis: 6.2, shift: 0.08, x: 1.5, sc: 1.35 } }[mode];
        const half = Math.tan(MathUtils.degToRad(s.camera.fov / 2));
        const dist = Math.max(3.6, cfg.vis / (w / h) / (2 * half));
        const key = `${dist.toFixed(2)}|${mode}`;
        if (key === lastKey) return;
        lastKey = key;
        s.camera.position.set(0, dist * 0.23, dist);
        s.camera.lookAt(0, 0.42, 0);
        s.setShift(cfg.shift);
        place(cfg.x, cfg.sc);
        look();
    };
    s.onResize(host.value!.clientWidth || 1, host.value!.clientHeight || 1);

    // ---- Frame ----
    const bars = () => Array.from(dock.value?.querySelectorAll<HTMLElement>('.step__bar') ?? []);
    s.onFrame = (dt) => {
        if (!reduced) {
            bt += dt;
            if (bt >= TOTAL) {
                spoke.value = true;
                setBuild((current + 1) % builds.length, false);
            }
        }
        apply();
        const frac = reduced ? 1 : Math.min(1, bt / TOTAL);
        bars().forEach((el, i) => {
            el.style.transform = `scaleX(${i === current ? frac : 0})`;
        });
    };
    apply();
    s.ready.then((ok) => {
        if (!ok) failed.value = true;
    });
});
onBeforeUnmount(() => {
    setBuild = () => {};
    stage?.dispose();
    stage = null;
});
</script>

<template>
    <section class="v2" aria-label="Inicio">
        <div class="copy">
            <p class="tag">SYS · 02 / TALLER</p>
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

        <div v-if="!hidden" class="bubble hud" role="status" aria-live="polite">
            <p class="bubble__text">{{ text }}</p>
            <button class="x" type="button" aria-label="Ocultar a Crocky" @click="hide">
                <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" fill="none" /></svg>
            </button>
        </div>

        <div class="stage">
            <div ref="host" class="stage__canvas"></div>
            <p v-if="failed" class="stage__fallback">Crocky</p>
        </div>

        <div ref="dock" class="dock">
            <div class="dock__row">
                <p class="tag caption" aria-live="polite">BUILD 0{{ idx + 1 }} / 04 · {{ COPY.services[idx].title }}</p>
                <button v-if="hidden" class="restore" type="button" aria-label="Mostrar a Crocky" @click="show">Crocky</button>
            </div>
            <ol class="steps">
                <li v-for="(s, i) in COPY.services" :key="s.title">
                    <button type="button" class="step" :aria-pressed="idx === i" @click="choose(i)">
                        <span class="tag">SRV · 0{{ i + 1 }}</span>
                        <span class="step__title">{{ s.title }}</span>
                        <span class="step__bar" aria-hidden="true"></span>
                    </button>
                </li>
            </ol>
        </div>
    </section>
</template>

<style scoped>
.v2 {
    --line: var(--color-border);
    position: relative;
    display: grid;
    gap: var(--space-6);
    max-width: 100%;
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
    background: var(--color-bg);
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
.copy {
    position: relative;
    z-index: 2;
    max-width: 36rem;
}
h1 {
    margin-top: var(--space-3);
    font-size: clamp(2rem, 1.1rem + 3.3vw, 3.5rem);
    line-height: var(--leading-tight);
    letter-spacing: -0.02em;
}
.sub {
    margin-top: var(--space-4);
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
    background: var(--color-bg);
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
    position: relative;
    padding-left: var(--space-4);
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
.bubble {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    max-width: 22rem;
    padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
    border-color: var(--color-accent);
}
.bubble__text {
    font-family: var(--font-heading);
    font-size: var(--text-base);
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
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-accent);
}
.stage {
    position: relative;
    height: clamp(340px, 56vw, 520px);
    margin-inline: calc(var(--gutter) * -1);
    border-block: 1px solid var(--line);
    background: radial-gradient(60% 70% at 55% 70%, rgb(74 222 155 / 0.07), transparent 70%);
}
.stage__canvas {
    position: absolute;
    inset: 0;
}
.stage__fallback {
    position: absolute;
    left: 50%;
    top: 40%;
    padding: var(--space-4) var(--space-8);
    transform: translateX(-50%);
    border: 1px dashed var(--line);
    color: var(--color-text-muted);
    font-family: var(--font-heading);
    font-size: var(--text-xl);
}
.dock {
    position: relative;
    z-index: 2;
}
.dock__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 32px;
    margin-bottom: var(--space-2);
}
.caption {
    color: var(--color-accent);
}
.steps {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
    padding: 0;
    list-style: none;
}
.step {
    position: relative;
    display: grid;
    gap: var(--space-1);
    width: 100%;
    height: 100%;
    min-height: 44px;
    padding: var(--space-3) var(--space-3) var(--space-3);
    border: 1px solid var(--line);
    background: var(--color-bg);
    text-align: left;
    cursor: pointer;
    overflow: hidden;
}
.step__title {
    font-size: 0.8125rem;
    line-height: 1.25;
}
.step:hover,
.step[aria-pressed='true'] {
    border-color: var(--color-accent);
}
.step[aria-pressed='true'] .tag {
    color: var(--color-accent);
}
.step__bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: var(--color-accent);
    transform: scaleX(0);
    transform-origin: left;
}
@media (min-width: 900px) {
    .steps {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}
@media (min-width: 900px) and (max-width: 1279px) {
    .v2 {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        grid-template-rows: auto auto auto;
        column-gap: var(--space-6);
        align-items: start;
    }
    .copy {
        grid-column: 1;
        grid-row: 1;
    }
    .bubble {
        grid-column: 1;
        grid-row: 2;
    }
    .stage {
        grid-column: 2;
        grid-row: 1 / span 2;
        height: auto;
        height: 460px;
        align-self: start;
        margin: 0;
        border: 1px solid var(--line);
    }
    .dock {
        grid-column: 1 / -1;
        grid-row: 3;
    }
}
@media (min-width: 1280px) {
    .v2 {
        display: block;
        min-height: max(820px, 100svh);
        padding-bottom: 10rem;
    }
    .stage {
        position: absolute;
        inset: 0 0 0 0;
        height: auto;
        margin: 0;
        border: 0;
    }
    .bubble {
        position: absolute;
        right: 6%;
        top: 16%;
        z-index: 2;
    }
    .dock {
        position: absolute;
        left: var(--gutter);
        right: var(--gutter);
        bottom: 8.5rem;
        max-width: 76rem;
        margin-inline: auto;
    }
}
</style>
