<script setup lang="ts">
// THROWAWAY PROTOTYPE. v4 "Combinado": v2 workshop with centred builds, no Crocky on the stage.
// Crocky is a fixed corner portrait (from v3). It comments on what the visitor hovers or focuses.
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import {
    GridHelper,
    BoxGeometry,
    TorusGeometry,
    CylinderGeometry,
    IcosahedronGeometry,
    OctahedronGeometry,
    EdgesGeometry,
    Mesh,
    LineSegments,
    Group,
    Vector3,
    Euler,
    MeshBasicMaterial,
    LineBasicMaterial,
    MathUtils,
    type BufferGeometry
} from 'three';
import {
    COPY,
    createCrockyStage,
    readHidden,
    writeHidden,
    prefersReduced,
    type CrockyStage
} from '../crockyRig';

const host = ref<HTMLDivElement | null>(null);
const dock = ref<HTMLElement | null>(null);
const portraitHost = ref<HTMLElement | null>(null);
const portraitEl = ref<HTMLElement | null>(null);
const collapsed = ref(readHidden());
const bubbleOpen = ref(typeof window === 'undefined' || window.innerWidth >= 640); // phones start with the bubble closed
const failed = ref(false);
const failedP = ref(false);
const idx = ref(0);
const spoke = ref(false); // false: greeting. true: service line.
const hoverText = ref<string | null>(null);
const text = computed(
    () => hoverText.value ?? (spoke.value ? COPY.services[idx.value].say : COPY.greeting)
);
const LINES = {
    cta1: 'Escríbeme qué te estorba. Lo hablamos sin tecnicismos.',
    cta2: 'Aquí te cuento cómo trabajo, paso a paso.'
};
const stageLine = computed(() => 'Así se arma: ' + COPY.services[idx.value].title + '.');
let stage: CrockyStage | null = null; // builds only, no Crocky
let pstage: CrockyStage | null = null; // portrait
let setBuild: (i: number, user: boolean) => void = () => {};

function choose(i: number) {
    spoke.value = true;
    setBuild(i, true);
    hoverText.value = COPY.services[i].say;
}
let leaveTimer = 0;
let petTimer = 0;
let autoHide = 0;
const PET_LINES = ['¡Jeje, gracias!', '¡Eso me gusta!'];
let petN = 0;
const isPhone = () => window.innerWidth < 640;
function say(t: string, e: Event) {
    window.clearTimeout(leaveTimer); // moving to another target: go straight to it
    window.clearTimeout(petTimer);
    hoverText.value = t;
    bubbleOpen.value = true;
    if (pstage) pstage.aimTarget = e.currentTarget as HTMLElement;
}
function unsay() {
    window.clearTimeout(leaveTimer);
    leaveTimer = window.setTimeout(() => {
        hoverText.value = null;
        if (pstage) pstage.aimTarget = null;
    }, 150);
}
function pet() {
    pstage?.pet();
    const line = PET_LINES[petN++ % PET_LINES.length];
    window.clearTimeout(petTimer);
    hoverText.value = line;
    bubbleOpen.value = true;
    petTimer = window.setTimeout(() => {
        if (hoverText.value === line) hoverText.value = null;
    }, 2000);
}
// Phones: the bubble closes by itself after a few seconds.
watch([bubbleOpen, text], () => {
    window.clearTimeout(autoHide);
    if (bubbleOpen.value && isPhone())
        autoHide = window.setTimeout(() => {
            bubbleOpen.value = false;
        }, 5000);
});
function startPortrait() {
    if (pstage || !portraitHost.value) return;
    pstage = createCrockyStage(
        portraitHost.value,
        { pos: [0.2, 0.8, 2.7], target: [0, 0.68, 0], fov: 26 },
        { gaze: 'local' }
    );
    if (!pstage) {
        failedP.value = true;
        return;
    }
    const p = pstage;
    p.ready.then((ok) => {
        if (!ok) failedP.value = true;
        else if (!prefersReduced() && p === pstage) p.blink();
    });
}
function stopPortrait() {
    pstage?.dispose();
    pstage = null;
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
        stopPortrait();
        hoverText.value = null;
        window.clearTimeout(autoHide);
    } else {
        await nextTick();
        startPortrait();
    }
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
    stage = createCrockyStage(
        host.value!,
        { pos: [0, 0.95, 4.2], target: [0, 0.42, 0], fov: 32 },
        { model: false }
    );
    if (!stage) {
        failed.value = true;
        return;
    }
    const s = stage;
    const reduced = prefersReduced();
    if (!collapsed.value) startPortrait();

    const faceMat = new MeshBasicMaterial({
        color: 0x0f131a,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
        toneMapped: false
    });
    const lineMat = new LineBasicMaterial({ color: 0x4ade9b, toneMapped: false });
    const accentMat = new LineBasicMaterial({ color: 0xffb454, toneMapped: false });

    // Holographic bench.
    const bench = new Group();
    const slab = new BoxGeometry(3.2, 0.04, 1.8);
    const slabMesh = new Mesh(slab, faceMat);
    slabMesh.position.y = -0.021;
    const slabEdges = new LineSegments(new EdgesGeometry(slab), lineMat);
    slabEdges.position.y = -0.021;
    const grid = new GridHelper(3.2, 16, 0x4ade9b, 0x4ade9b);
    const gm = grid.material as LineBasicMaterial;
    gm.transparent = true;
    gm.opacity = 0.2;
    gm.toneMapped = false;
    grid.scale.z = 1.8 / 3.2;
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
    function add(
        b: Build,
        geo: BufferGeometry,
        x: number,
        y: number,
        z: number,
        rot: [number, number, number] = [0, 0, 0],
        opts: { amber?: boolean; spin?: number } = {}
    ) {
        const g = new Group();
        g.add(new Mesh(geo, faceMat));
        g.add(new LineSegments(new EdgesGeometry(geo, 12), opts.amber ? accentMat : lineMat));
        const to = new Vector3(x, y, z);
        const from = new Vector3(x + rnd() * 1.1, y + 0.9 + Math.abs(rnd()) * 0.9, z + rnd() * 0.8);
        g.position.copy(from);
        g.scale.setScalar(0.0001);
        b.group.add(g);
        const p: Piece = {
            g,
            to,
            toRot: new Euler(...rot),
            from,
            spin: opts.spin ?? 2.4,
            delay: b.pieces.length
        };
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
    [0.12, 0.22, 0.17, 0.3].forEach((h, i) =>
        add(b1, box(0.08, h, 0.02), -0.38 + i * 0.12, 0.29 + h / 2, 0.03)
    );
    add(b1, new TorusGeometry(0.13, 0.014, 6, 20), 0.3, 0.5, 0.025);
    add(b1, box(0.3, 0.03, 0.012), 0.3, 0.68, 0.02, [0, 0, 0], { amber: true });

    // 2. Phone.
    const b2 = makeBuild();
    plate(b2, 0.6, 0.3);
    add(b2, box(0.4, 0.78, 0.05), 0, 0.41, 0);
    add(b2, box(0.34, 0.62, 0.012), 0, 0.45, 0.03);
    [0.64, 0.5, 0.36].forEach((y) => add(b2, box(0.26, 0.07, 0.012), 0, y, 0.04));
    add(b2, box(0.1, 0.014, 0.012), 0, 0.77, 0.03);
    add(b2, new CylinderGeometry(0.028, 0.028, 0.014, 12), 0, 0.12, 0.035, [Math.PI / 2, 0, 0], {
        amber: true
    });

    // 3. Speed gauge.
    const b3 = makeBuild();
    plate(b3, 0.8, 0.3);
    add(b3, new TorusGeometry(0.38, 0.02, 6, 24, Math.PI), 0, 0.12, 0);
    for (let i = 0; i < 7; i++) {
        const a = Math.PI * (i / 6);
        add(b3, box(0.02, 0.07, 0.02), Math.cos(a) * 0.3, 0.12 + Math.sin(a) * 0.3, 0, [
            0,
            0,
            a - Math.PI / 2
        ]);
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
    const orbitRing = add(b4, new TorusGeometry(0.34, 0.008, 4, 32), 0, 0.38, 0, [
        Math.PI / 2.3,
        0,
        0
    ]);
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
            b.group.position.set(x, 0, 0);
            b.group.rotation.y = -0.3;
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
    setBuild = (i, user) => {
        current = i;
        idx.value = i;
        bt = reduced ? A + 0.2 : 0;
        if (!user && !reduced) pstage?.jaw(450);
        apply();
    };

    // ---- View ----
    let lastKey = '';
    // Three sizes: compact (< 700 px), medium, wide overlay (>= 1280 px).
    s.onResize = (w, h) => {
        const mode = w < 700 ? 'c' : window.innerWidth >= 1280 ? 'w' : 'm';
        const cfg = {
            c: { vis: 2.7, shift: 0, x: 0, sc: 1.25 },
            m: { vis: 3.7, shift: 0, x: 0, sc: 1.55 },
            w: { vis: 4.8, shift: 0.14, x: 0, sc: 1.45 }
        }[mode];
        const half = Math.tan(MathUtils.degToRad(s.camera.fov / 2));
        const dist = Math.max(3.6, cfg.vis / (w / h) / (2 * half));
        const key = `${dist.toFixed(2)}|${mode}`;
        if (key === lastKey) return;
        lastKey = key;
        s.camera.position.set(0, dist * 0.26, dist);
        s.camera.lookAt(0, 0.45, 0);
        s.setShift(cfg.shift);
        place(cfg.x, cfg.sc);
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
    window.clearTimeout(leaveTimer);
    window.clearTimeout(petTimer);
    window.clearTimeout(autoHide);
    setBuild = () => {};
    stopPortrait();
    stage?.dispose();
    stage = null;
});
</script>

<template>
    <section class="v2" aria-label="Inicio">
        <div class="copy">
            <p class="tag">SYS · 04 / COMBINADO</p>
            <h1>{{ COPY.heading }}</h1>
            <p class="sub">{{ COPY.sub }}</p>
            <p class="ctas">
                <a
                    class="btn btn--primary"
                    :href="COPY.cta1.href"
                    @pointerenter="say(LINES.cta1, $event)"
                    @pointerleave="unsay"
                    @focus="say(LINES.cta1, $event)"
                    @blur="unsay"
                    >{{ COPY.cta1.label }}</a
                >
                <a
                    class="btn"
                    :href="COPY.cta2.href"
                    @pointerenter="say(LINES.cta2, $event)"
                    @pointerleave="unsay"
                    @focus="say(LINES.cta2, $event)"
                    @blur="unsay"
                    >{{ COPY.cta2.label }}</a
                >
            </p>
            <ul class="trust">
                <li v-for="t in COPY.trust" :key="t">{{ t }}</li>
            </ul>
        </div>

        <div class="stage" @pointerenter="say(stageLine, $event)" @pointerleave="unsay">
            <div ref="host" class="stage__canvas"></div>
            <p v-if="failed" class="stage__fallback">3D no disponible</p>
        </div>

        <div ref="dock" class="dock">
            <div class="dock__row">
                <p class="tag caption" aria-live="polite">
                    BUILD 0{{ idx + 1 }} / 04 · {{ COPY.services[idx].title }}
                </p>
            </div>
            <ol class="steps">
                <li v-for="(s, i) in COPY.services" :key="s.title">
                    <button
                        type="button"
                        class="step"
                        :aria-pressed="idx === i"
                        @click="choose(i)"
                        @pointerenter="say(s.say, $event)"
                        @pointerleave="unsay"
                        @focus="say(s.say, $event)"
                        @blur="unsay"
                    >
                        <span class="tag">SRV · 0{{ i + 1 }}</span>
                        <span class="step__title">{{ s.title }}</span>
                        <span class="step__bar" aria-hidden="true"></span>
                    </button>
                </li>
            </ol>
        </div>

        <div class="crocky">
            <template v-if="!collapsed">
                <div v-show="bubbleOpen" class="cb" role="status" aria-live="polite">
                    <p class="cb__text">{{ text }}</p>
                </div>
                <div class="pwrap">
                    <button
                        ref="portraitEl"
                        class="portrait"
                        type="button"
                        aria-label="Acariciar a Crocky"
                        @click="pet"
                    >
                        <span ref="portraitHost" class="portrait__canvas"></span>
                        <span v-if="failedP" class="portrait__fallback">Crocky</span>
                    </button>
                    <button
                        class="badge"
                        type="button"
                        aria-label="Ocultar a Crocky"
                        @click="collapse"
                    >
                        <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                            <path
                                d="M2 2l8 8M10 2l-8 8"
                                stroke="currentColor"
                                stroke-width="1.5"
                                fill="none"
                            />
                        </svg>
                    </button>
                </div>
            </template>
            <button
                v-else
                class="restore"
                type="button"
                aria-label="Mostrar a Crocky"
                @click="expand"
            >
                Crocky
            </button>
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
    border: 1px solid var(--color-accent);
    background: var(--color-bg);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-accent);
}
.crocky {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 40;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    pointer-events: none;
}
.crocky > * {
    pointer-events: auto;
}
.cb {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-1);
    width: min(17rem, calc(100vw - 32px));
    height: 4.5rem;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-accent);
    background: var(--color-bg);
}
.cb::after {
    content: '';
    position: absolute;
    right: 56px;
    bottom: -7px;
    width: 12px;
    height: 12px;
    background: var(--color-bg);
    border-right: 1px solid var(--color-accent);
    border-bottom: 1px solid var(--color-accent);
    transform: rotate(45deg);
}
.cb__text {
    flex: 1;
    font-family: var(--font-heading);
    font-size: 0.875rem;
    line-height: 1.3;
}
.pwrap {
    position: relative;
    flex: none;
    width: 6rem;
    height: 6rem;
}
.pwrap .portrait {
    width: 100%;
    height: 100%;
}
.badge {
    position: absolute;
    left: 85.36%;
    top: 14.64%;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    padding: 0;
    transform: translate(-50%, -50%);
    border: 1px solid var(--color-accent);
    border-radius: 50%;
    background: var(--color-surface);
    color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-bg);
    cursor: pointer;
}
.badge::before {
    content: '';
    position: absolute;
    inset: -9px;
    border-radius: 50%;
}
.badge:hover {
    background: var(--color-accent);
    color: var(--color-on-accent);
}
.portrait {
    position: relative;
    flex: none;
    width: 6rem;
    height: 6rem;
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--color-accent);
    border-radius: 50%;
    box-shadow:
        0 0 0 4px var(--color-bg),
        0 0 0 5px var(--line);
    background:
        radial-gradient(circle at 50% 40%, rgb(74 222 155 / 0.16), transparent 65%),
        linear-gradient(var(--line) 1px, transparent 1px) 0 0 / 100% 14px,
        var(--color-bg);
    cursor: pointer;
}
.portrait__canvas {
    position: absolute;
    inset: 0;
    display: block;
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
    .pwrap {
        width: 9rem;
        height: 9rem;
    }
    .portrait {
        width: 9rem;
        height: 9rem;
    }
    .cb__text {
        font-size: var(--text-base);
    }
}
@media (max-width: 1099px) {
    .crocky {
        bottom: calc(var(--proto-bar-h, 0px) + 4px);
    }
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
    .stage {
        grid-column: 2;
        grid-row: 1;
        height: 460px;
        align-self: start;
        margin: 0;
        border: 1px solid var(--line);
    }
    .dock {
        grid-column: 1 / -1;
        grid-row: 2;
        padding-right: 11rem;
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
    .dock {
        position: absolute;
        left: var(--gutter);
        right: var(--gutter);
        bottom: 8.5rem;
        max-width: 76rem;
        margin-inline: auto;
        padding-right: 11rem;
    }
}
</style>
