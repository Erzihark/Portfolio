<script setup lang="ts">
// Hero 3D stage and the clickable step row.
// The text renders on the server. The 3D scene starts after the page loads.
import { ref, onMounted, onBeforeUnmount } from 'vue';
import type { Stage } from '../lib/crockyRig';
import type { HeroBuilds } from '../lib/heroBuilds';
import { crocky, crockySay } from '../lib/store';
import StageFallback from './StageFallback.vue';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
    items: { title: string; say: string }[];
    ariaLabel: string;
    fallback: string;
    stepsLabel: string;
    stageSay: string;
}>();

const host = ref<HTMLElement | null>(null);
const dock = ref<HTMLElement | null>(null);
const idx = ref(0);
const ready = ref(false);
const failed = ref(false);
const paused = ref(false);
let stage: Stage | null = null;
let builds: HeroBuilds | null = null;
let alive = true;

function choose(i: number) {
    idx.value = i;
    builds?.set(i);
    crockySay(props.items[i]!.say);
}

onMounted(async () => {
    const [rig, hb] = await Promise.all([import('../lib/crockyRig'), import('../lib/heroBuilds')]);
    if (!alive || !host.value) return;
    const reduced = rig.prefersReduced();
    const s = rig.createStage(host.value, { pos: [0, 0.95, 4.2], target: [0, 0.42, 0], fov: 32 }, { model: false });
    if (!s) {
        failed.value = true;
        return;
    }
    stage = s;
    const H = hb.createHeroBuilds(s, reduced);
    builds = H;
    s.onResize = (w, h) => H.layout(w, h);
    H.layout(host.value.clientWidth || 1, host.value.clientHeight || 1);
    let first = true;
    s.onFrame = (dt) => {
        const play = !reduced && !paused.value;
        const frac = H.frame(dt, play);
        const bars = dock.value?.querySelectorAll<HTMLElement>('.step__bar');
        bars?.forEach((el, i) => {
            el.style.transform = `scaleX(${i === idx.value ? frac : 0})`;
        });
        if (play && H.finished()) {
            const next = (idx.value + 1) % props.items.length;
            idx.value = next;
            H.set(next);
            // Crocky comments only while the hero is on screen.
            if (crocky.section === 'inicio') crockySay(props.items[next]!.say);
        }
        if (first) {
            first = false;
            ready.value = true;
        }
    };
    s.ready.then((ok) => {
        if (!ok) failed.value = true;
    });
});

onBeforeUnmount(() => {
    alive = false;
    stage?.dispose();
    stage = null;
    builds = null;
});
</script>

<template>
    <div
        class="hero-stage"
        :data-crocky="stageSay + ' ' + items[idx]!.title + '.'"
        @pointerenter="paused = true"
        @pointerleave="paused = false"
    >
        <div ref="host" class="hero-stage__canvas" role="img" :aria-label="ariaLabel"></div>
        <StageFallback v-if="!ready" :text="failed ? fallback : undefined" />
    </div>
    <div
        ref="dock"
        class="hero-dock"
        @pointerenter="paused = true"
        @pointerleave="paused = false"
        @focusin="paused = true"
        @focusout="paused = false"
    >
        <p class="tag caption">BUILD 0{{ idx + 1 }} / 0{{ items.length }} · {{ items[idx]!.title }}</p>
        <ol class="steps" :aria-label="stepsLabel">
            <li v-for="(s, i) in items" :key="s.title">
                <button
                    type="button"
                    class="step"
                    :aria-pressed="idx === i"
                    :data-crocky="s.say"
                    @click="choose(i)"
                >
                    <span class="tag">SRV · 0{{ i + 1 }}</span>
                    <span class="step__title">{{ s.title }}</span>
                    <span class="step__bar" aria-hidden="true"></span>
                </button>
            </li>
        </ol>
    </div>
</template>

<style scoped>
.hero-stage {
    position: relative;
    border-block: 1px solid var(--color-border);
    background: radial-gradient(60% 70% at 55% 70%, rgb(74 222 155 / 0.07), transparent 70%);
}
.hero-stage__canvas {
    position: absolute;
    inset: 0;
}
.hero-dock {
    position: relative;
    z-index: 2;
}
.caption {
    min-height: 32px;
    margin-bottom: var(--space-2);
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
    align-content: start;
    width: 100%;
    height: 100%;
    min-height: 44px;
    padding: var(--space-3);
    border: 1px solid var(--color-border);
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
</style>
