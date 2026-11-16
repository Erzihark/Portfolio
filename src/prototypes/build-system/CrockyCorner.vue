<script setup lang="ts">
// THROWAWAY PROTOTYPE. Fixed corner portrait of Crocky with a speech bubble.
// The parent calls say(), setAim(), hover() and quiet(). Crocky never builds pieces.
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import { createCrockyStage, readHidden, writeHidden, prefersReduced, type CrockyStage } from '../hero-crocky/crockyRig';
import { GREETING } from './shared';

const portraitHost = ref<HTMLElement | null>(null);
const collapsed = ref(readHidden());
const bubbleOpen = ref(typeof window === 'undefined' || window.innerWidth >= 640);
const failedP = ref(false);
const text = ref(GREETING);
const PET_LINES = ['¡Jeje, gracias!', '¡Eso me gusta!'];
let petN = 0;
let pstage: CrockyStage | null = null;
let defaultAim: HTMLElement | null = null;
let hoverAim: HTMLElement | null = null;
let autoHide = 0;
const isPhone = () => window.innerWidth < 640;

function applyAim() {
    if (pstage) pstage.aimTarget = hoverAim ?? defaultAim;
}
function armAutoHide() {
    window.clearTimeout(autoHide);
    if (bubbleOpen.value && isPhone())
        autoHide = window.setTimeout(() => {
            bubbleOpen.value = false;
        }, 4000);
}
function say(t: string) {
    if (collapsed.value) return;
    text.value = t;
    bubbleOpen.value = true;
    pstage?.jaw(450);
    armAutoHide();
}
function setAim(el: HTMLElement | null) {
    defaultAim = el;
    applyAim();
}
function hover(el: HTMLElement | null) {
    hoverAim = el;
    applyAim();
}
function quiet() {
    bubbleOpen.value = false;
}
function pet() {
    pstage?.pet();
    say(PET_LINES[petN++ % PET_LINES.length]);
}
function startPortrait() {
    if (pstage || !portraitHost.value) return;
    pstage = createCrockyStage(portraitHost.value, { pos: [0.2, 0.8, 2.7], target: [0, 0.68, 0], fov: 26 }, { gaze: 'local' });
    if (!pstage) {
        failedP.value = true;
        return;
    }
    const p = pstage;
    p.ready.then((ok) => {
        if (!ok) failedP.value = true;
        else if (!prefersReduced() && p === pstage) p.blink();
    });
    applyAim();
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
        window.clearTimeout(autoHide);
    } else {
        await nextTick();
        startPortrait();
    }
});
onMounted(() => {
    if (!collapsed.value) startPortrait();
    armAutoHide();
});
onBeforeUnmount(() => {
    window.clearTimeout(autoHide);
    stopPortrait();
});
defineExpose({ say, setAim, hover, quiet });
</script>

<template>
    <div class="crocky">
        <template v-if="!collapsed">
            <div v-show="bubbleOpen" class="cb" role="status" aria-live="polite">
                <p class="cb__text">{{ text }}</p>
            </div>
            <div class="pwrap">
                <button class="portrait" type="button" aria-label="Acariciar a Crocky" @click="pet">
                    <span ref="portraitHost" class="portrait__canvas"></span>
                    <span v-if="failedP" class="portrait__fallback">Crocky</span>
                </button>
                <button class="badge" type="button" aria-label="Ocultar a Crocky" @click="collapse">
                    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" fill="none" />
                    </svg>
                </button>
            </div>
        </template>
        <button v-else class="restore" type="button" aria-label="Mostrar a Crocky" @click="expand">Crocky</button>
    </div>
</template>

<style scoped>
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
.crocky > *:not(.cb) {
    pointer-events: auto;
}
.cb {
    position: relative;
    display: flex;
    align-items: center;
    width: min(16rem, calc(100vw - 32px));
    min-height: 3.5rem;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-accent);
    background: var(--color-bg);
}
.cb::after {
    content: '';
    position: absolute;
    right: 38px;
    bottom: -7px;
    width: 12px;
    height: 12px;
    background: var(--color-bg);
    border-right: 1px solid var(--color-accent);
    border-bottom: 1px solid var(--color-accent);
    transform: rotate(45deg);
}
.cb__text {
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
.portrait {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--color-accent);
    border-radius: 50%;
    box-shadow:
        0 0 0 4px var(--color-bg),
        0 0 0 5px var(--color-border);
    background:
        radial-gradient(circle at 50% 40%, rgb(74 222 155 / 0.16), transparent 65%),
        linear-gradient(var(--color-border) 1px, transparent 1px) 0 0 / 100% 14px,
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
.restore {
    min-width: 44px;
    min-height: 44px;
    padding: 0 var(--space-4);
    border: 1px solid var(--color-accent);
    background: var(--color-bg);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-accent);
    cursor: pointer;
}
@media (min-width: 640px) {
    .pwrap {
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
</style>
