<script setup lang="ts">
// THROWAWAY PROTOTYPE. v2 "Lado a lado": each service line has its own slot with its own build.
// One renderer draws all four slots. Empty slots show a faint outline.
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { Vector3 } from 'three';
import { createCrockyStage, prefersReduced, type CrockyStage } from '../../hero-crocky/crockyRig';
import SectionFrame from '../SectionFrame.vue';
import { LINES, lineOfChip, useSelection, createMats, createBench, createModules, project, fitDist } from '../shared';

const sel = useSelection();
const host = ref<HTMLElement | null>(null);
const marker = ref<HTMLElement | null>(null);
const failed = ref(false);
const labelPos = ref<{ x: number; y: number }[]>(LINES.map(() => ({ x: 0, y: 0 })));
const compact = ref(false);
const active = computed(() => LINES.map((l) => l.chips.some((c) => sel.selected.includes(c.id))));
const aimEl = computed(() => (sel.newest && sel.selected.includes(sel.newest) ? marker.value : null));
let stage: CrockyStage | null = null;

// Slot spots (x, z) and module scale. Wide: one row. Compact: 2 x 2 grid.
const ROW = { sc: 0.8, p: { ops: [-2.9, 0], app: [-0.97, 0], soft: [0.97, 0], exp: [2.9, 0] } };
const GRID = { sc: 0.58, p: { ops: [-1.1, -0.95], app: [1.1, -0.95], soft: [-1.1, 0.95], exp: [1.1, 0.95] } };

onMounted(() => {
    stage = createCrockyStage(host.value!, { pos: [0, 3, 7], target: [0, 0.3, 0], fov: 32 }, { model: false });
    if (!stage) {
        failed.value = true;
        return;
    }
    const s = stage;
    const reduced = prefersReduced();
    const mats = createMats();
    const bench = createBench(s.scene, 7.6, 2.4, mats);
    const M = createModules(s.scene, mats, reduced);

    function placeMarker() {
        if (!sel.newest || !marker.value) return;
        const g = M.mods[lineOfChip(sel.newest).id].group;
        const p = project(s.camera, g.position.clone().add(new Vector3(0, 0.4, 0)), host.value!.clientWidth, host.value!.clientHeight);
        marker.value.style.transform = `translate(${p.x}px, ${p.y}px)`;
    }

    let lastKey = '';
    s.onResize = (w, h) => {
        const c = w < 560;
        const cfg = c ? GRID : ROW;
        const dist = fitDist(s.camera, c ? 5 : 7.2, w, h, 3.4);
        const key = `${dist.toFixed(2)}|${c}`;
        if (key === lastKey) return;
        lastKey = key;
        compact.value = c;
        bench.scale.set(c ? 0.55 : 1, 1, c ? 1.9 : 1);
        LINES.forEach((l) => {
            const [x, z] = cfg.p[l.id];
            const g = M.mods[l.id].group;
            g.position.set(x, 0, z);
            g.scale.setScalar(cfg.sc);
            g.rotation.y = -0.25;
        });
        if (c) s.camera.position.set(0, dist * 0.62, dist * 0.8);
        else s.camera.position.set(0, dist * 0.42, dist);
        // Compact: look lower so the scene and labels sit higher, clear of the portrait.
        s.camera.lookAt(0, c ? 0.05 : 0.45, 0);
        labelPos.value = LINES.map((l) => {
            const [x, z] = cfg.p[l.id];
            return project(s.camera, new Vector3(x, 0, z + (c ? 0.6 : 0.55)), w, h);
        });
        placeMarker();
    };
    s.onResize(host.value!.clientWidth || 1, host.value!.clientHeight || 1);

    s.onFrame = (dt, now) => M.frame(dt, now / 1000);

    watch(
        () => [...sel.selected],
        () => {
            M.update(sel.selected);
            placeMarker();
        },
        { immediate: true }
    );
    s.ready.then((ok) => {
        if (!ok) failed.value = true;
    });
});
onBeforeUnmount(() => {
    stage?.dispose();
    stage = null;
});
</script>

<template>
    <SectionFrame tag="SYS · 05 / LADO A LADO" :sel="sel" :aim-el="aimEl">
        <template #stage>
            <div class="stage" role="img" aria-label="Vista 3D de lo que podríamos construir, una parte por cada área">
                <div ref="host" class="stage__canvas"></div>
                <span ref="marker" class="aim" aria-hidden="true"></span>
                <span
                    v-for="(l, i) in LINES"
                    :key="l.id"
                    class="slot tag"
                    :class="{ 'slot--on': active[i], 'slot--compact': compact }"
                    :style="{ transform: `translate(-50%, 0) translate(${labelPos[i].x}px, ${labelPos[i].y}px)` }"
                    aria-hidden="true"
                >
                    SRV · {{ l.n }}<br />{{ l.title }}
                </span>
                <p v-if="failed" class="stage__fallback">3D no disponible</p>
            </div>
        </template>
    </SectionFrame>
</template>

<style scoped>
.stage {
    position: relative;
    height: clamp(340px, 36vw, 380px);
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
.tag {
    font-family: ui-monospace, 'SFMono-Regular', Consolas, monospace;
    font-size: 0.6875rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-muted);
}
.slot {
    position: absolute;
    left: 0;
    top: 0;
    width: max-content;
    max-width: 9rem;
    text-align: center;
    line-height: 1.4;
    pointer-events: none;
}
.slot--on {
    color: var(--color-accent);
}
.slot--compact {
    font-size: 0.5625rem;
    letter-spacing: 0.06em;
    max-width: none;
    white-space: nowrap;
}
.stage__fallback {
    position: absolute;
    left: 50%;
    top: 40%;
    padding: var(--space-4) var(--space-8);
    transform: translateX(-50%);
    border: 1px dashed var(--color-border);
    color: var(--color-text-muted);
    font-family: var(--font-heading);
}
</style>
