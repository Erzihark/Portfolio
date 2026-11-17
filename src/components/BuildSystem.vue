<script setup lang="ts">
// "Arma tu sistema": chip picker, four 3D slots and the result list.
// The chips render on the server as real buttons. The 3D scene starts in onMounted.
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import type { Messages } from '../i18n';
import type { Stage } from '../lib/crockyRig';
import type { Modules, LineId } from '../lib/buildModules';
import { selection, toggleChip, clearChips, crocky, crockySay } from '../lib/store';
import StageFallback from './StageFallback.vue';

const props = defineProps<{ t: Messages['build'] }>();

const host = ref<HTMLElement | null>(null);
const marker = ref<HTMLElement | null>(null);
const ready = ref(false);
const failed = ref(false);
const compact = ref(false);
const positioned = ref(false);
const labelPos = ref(props.t.lines.map(() => ({ x: 0, y: 0 })));
let stage: Stage | null = null;
let modules: Modules | null = null;
let placeMarker: () => void = () => {};
let alive = true;

const lineOfChip = (id: string) => props.t.lines.find((l) => l.chips.some((c) => c.id === id))!;
const active = computed(() => props.t.lines.map((l) => l.chips.some((c) => selection.selected.includes(c.id))));
const summary = computed(() =>
    props.t.lines
        .map((line) => ({ line, chips: line.chips.filter((c) => selection.selected.includes(c.id)) }))
        .filter((s) => s.chips.length)
);
const counter = computed(() =>
    summary.value.length ? props.t.counter.replace('{n}', String(summary.value.length)) : props.t.counterNone
);

function toggle(id: string, say: string) {
    const added = toggleChip(id);
    if (added) crockySay(say);
    else crockySay(selection.selected.length ? props.t.removed : props.t.greeting);
}
function clearAll() {
    clearChips();
    crockySay(props.t.greeting);
}

// Slot spots (x, z) and module scale. Wide: one row. Compact: 2 x 2 grid.
type Spots = Record<LineId, [number, number]>;
const ROW = {
    sc: 1,
    p: { ops: [-2.45, 0], app: [-0.82, 0], soft: [0.82, 0], exp: [2.45, 0] } as Spots
};
const GRID = {
    sc: 0.85,
    p: { ops: [-1.1, -0.95], app: [1.1, -0.95], soft: [-1.1, 0.95], exp: [1.1, 0.95] } as Spots
};

onMounted(async () => {
    const [rig, kit, bm, three] = await Promise.all([
        import('../lib/crockyRig'),
        import('../lib/threeKit'),
        import('../lib/buildModules'),
        import('three')
    ]);
    if (!alive || !host.value) return;
    const el = host.value;
    const s = rig.createStage(el, { pos: [0, 3, 7], target: [0, 0.3, 0], fov: 32 }, { model: false });
    if (!s) {
        failed.value = true;
        return;
    }
    stage = s;
    const reduced = rig.prefersReduced();
    const mats = kit.createMats();
    const bench = kit.createBench(s.scene, 7.6, 2.4, mats);
    const M = bm.createModules(s.scene, mats, reduced);
    modules = M;

    placeMarker = () => {
        if (!selection.newest || !marker.value) return;
        const id = lineOfChip(selection.newest).id as LineId;
        const g = M.mods[id].group;
        const p = kit.project(
            s.camera,
            g.position.clone().add(new three.Vector3(0, 0.4, 0)),
            el.clientWidth,
            el.clientHeight
        );
        marker.value.style.transform = `translate(${p.x}px, ${p.y}px)`;
    };

    let lastKey = '';
    s.onResize = (w, h) => {
        const c = w < 560;
        const cfg = c ? GRID : ROW;
        const dist = kit.fitDist(s.camera, c ? 4.3 : 7.2, w, h, 3.4);
        const key = `${dist.toFixed(2)}|${c}|${w}`;
        if (key === lastKey) return;
        lastKey = key;
        compact.value = c;
        bench.scale.set(c ? 0.55 : 1, 1, c ? 1.9 : 1);
        bm.LINE_IDS.forEach((id) => {
            const [x, z] = cfg.p[id];
            const m = M.mods[id];
            m.group.position.set(x, 0, z);
            m.baseScale = cfg.sc;
            m.group.rotation.y = -0.25;
        });
        if (c) s.camera.position.set(0, dist * 0.62, dist * 0.8);
        else s.camera.position.set(0, dist * 0.34, dist);
        s.camera.lookAt(0, c ? 0.05 : 0.38, 0);
        labelPos.value = bm.LINE_IDS.map((id) => {
            const [x, z] = cfg.p[id];
            return kit.project(s.camera, new three.Vector3(x, 0, z + (c ? 0.6 : 0.55)), w, h);
        });
        positioned.value = true;
        placeMarker();
    };
    s.onResize(el.clientWidth || 1, el.clientHeight || 1);

    let first = true;
    s.onFrame = (dt, now) => {
        M.frame(dt, now / 1000);
        if (first) {
            first = false;
            ready.value = true;
        }
    };
    M.update(selection.selected);
    placeMarker();
    s.ready.then((ok) => {
        if (!ok) failed.value = true;
    });
});

watch(
    () => [...selection.selected],
    () => {
        modules?.update(selection.selected);
        placeMarker();
    }
);
// Crocky looks at the marker of the newest module.
watch(
    () => selection.newest,
    (n) => {
        crocky.aim = n ? marker.value : null;
    },
    { flush: 'post' }
);

onBeforeUnmount(() => {
    alive = false;
    stage?.dispose();
    stage = null;
    modules = null;
    if (crocky.aim === marker.value) crocky.aim = null;
});
</script>

<template>
    <div class="build">
        <div class="picker">
            <div v-for="l in t.lines" :key="l.id" class="group" role="group" :aria-labelledby="'grp-' + l.id">
                <p :id="'grp-' + l.id" class="tag">SRV · {{ l.n }} · {{ l.title }}</p>
                <div class="chips">
                    <button
                        v-for="c in l.chips"
                        :key="c.id"
                        type="button"
                        class="chip"
                        :aria-pressed="selection.selected.includes(c.id)"
                        :data-crocky="c.say"
                        @click="toggle(c.id, c.say)"
                    >
                        {{ c.label }}
                    </button>
                </div>
            </div>
        </div>

        <div class="stagebar">
            <p class="tag caption" aria-live="polite">{{ counter }}</p>
            <button v-if="selection.selected.length" type="button" class="clear" @click="clearAll">
                {{ t.clear }}
            </button>
        </div>
        <div class="stage" role="img" :aria-label="t.stageAria">
            <div ref="host" class="stage__canvas"></div>
            <span ref="marker" class="aim" aria-hidden="true"></span>
            <StageFallback
            v-if="!ready"
            :text="failed ? t.stageFallback : undefined"
            :loading="failed ? undefined : t.stageLoading"
        />
            <div class="labels" :class="{ 'labels--abs': positioned }" aria-hidden="true">
                <span
                    v-for="(l, i) in t.lines"
                    :key="l.id"
                    class="slot tag"
                    :class="{ 'slot--on': active[i], 'slot--compact': compact }"
                    :style="
                        positioned
                            ? { transform: `translate(-50%, 0) translate(${labelPos[i]!.x}px, ${labelPos[i]!.y}px)` }
                            : undefined
                    "
                >
                    SRV · {{ l.n }}<br />{{ l.title }}
                </span>
            </div>
        </div>

        <div class="result">
            <p class="tag">{{ t.resultTag }}</p>
            <p v-if="!summary.length" class="empty">{{ t.empty }}</p>
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
            <a v-if="summary.length" class="send" href="#contacto">{{ t.send }}</a>
        </div>
    </div>
</template>

<style scoped>
.build {
    display: grid;
    gap: var(--space-6);
}
.picker {
    display: grid;
    gap: var(--space-4);
}
.group {
    display: grid;
    gap: var(--space-2);
    align-content: start;
}
.chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
}
.chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: 44px;
    padding: var(--space-1) var(--space-4);
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    color: var(--color-text);
    font-size: var(--text-sm);
    text-align: left;
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out);
}
.chip::before {
    content: '+';
    display: inline-grid;
    flex: none;
    place-items: center;
    width: 14px;
    height: 14px;
    border: 1px solid var(--color-text-muted);
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1;
}
.chip:hover {
    border-color: var(--color-accent);
}
.chip[aria-pressed='true'] {
    border-color: var(--color-accent);
    background: rgb(74 222 155 / 0.1);
}
.chip[aria-pressed='true']::before {
    content: '✓';
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-size: 0.6875rem;
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
.stage {
    position: relative;
    height: clamp(260px, 27vw, 320px);
    overflow: hidden;
    border: 1px solid var(--color-border);
    background: radial-gradient(60% 70% at 50% 65%, rgb(74 222 155 / 0.07), transparent 70%);
}
.stage__canvas {
    position: absolute;
    inset: 0;
}
.aim {
    position: absolute;
    left: 0;
    top: 0;
    width: 1px;
    height: 1px;
    pointer-events: none;
}
/* Before the 3D scene starts, the labels sit in a row at the bottom. */
.labels {
    position: absolute;
    inset: auto 0 var(--space-2) 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-2);
    padding-inline: var(--space-2);
    text-align: center;
    pointer-events: none;
}
.labels--abs {
    inset: 0;
    display: block;
    padding: 0;
}
.slot {
    font-size: clamp(0.5625rem, 0.9vw, 0.6875rem);
    letter-spacing: 0.1em;
    line-height: 1.4;
}
.labels--abs .slot {
    position: absolute;
    left: 0;
    top: 0;
    width: max-content;
    text-align: center;
    white-space: nowrap;
}
.slot--on {
    color: var(--color-accent);
}
.slot--compact {
    font-size: 0.5625rem;
    letter-spacing: 0.06em;
}
@media (max-width: 899px) {
    .labels:not(.labels--abs) .slot,
    .labels--abs .slot:not(.slot--compact) {
        font-size: 0.5625rem;
        letter-spacing: 0.06em;
    }
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
.send {
    justify-self: start;
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--color-accent);
    font-weight: 600;
}
@media (min-width: 900px) {
    .picker {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--space-6) var(--space-8);
    }
    .mods {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
@media (min-width: 1200px) {
    .mods {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}
</style>
