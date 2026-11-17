<script setup lang="ts">
// Crocky: a fixed round portrait in the corner with a speech bubble.
// Crocky never blocks the page. The visitor can hide it, and it stays hidden for the session.
// Any element with data-crocky="text" makes Crocky comment on hover or focus.
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import type { Messages } from '../i18n';
import type { Stage } from '../lib/crockyRig';
import { crocky } from '../lib/store';

const props = defineProps<{ t: Messages['crocky'] }>();

const portraitHost = ref<HTMLElement | null>(null);
const collapsed = ref(false);
const bubbleOpen = ref(false);
const failed = ref(false);
const ready = ref(false);
const base = ref(props.t.greeting);
const hover = ref<string | null>(null);
const text = computed(() => hover.value ?? base.value);

let rig: typeof import('../lib/crockyRig') | null = null;
let stage: Stage | null = null;
let alive = true;
let hoverEl: HTMLElement | null = null;
let leaveTimer = 0;
let petTimer = 0;
let hideTimer = 0;
let petN = 0;
const isPhone = () => window.innerWidth < 640;

function applyAim() {
    if (stage) stage.aimTarget = hoverEl ?? crocky.aim;
}

// The bubble closes by itself, so it never stays over the content.
function armAutoHide() {
    window.clearTimeout(hideTimer);
    if (!bubbleOpen.value || hoverEl) return;
    hideTimer = window.setTimeout(() => {
        bubbleOpen.value = false;
    }, isPhone() ? 4000 : 6000);
}
function open() {
    bubbleOpen.value = true;
    armAutoHide();
}

async function startPortrait() {
    if (stage || !portraitHost.value) return;
    rig ??= await import('../lib/crockyRig');
    if (!alive || stage || !portraitHost.value) return;
    const s = rig.createStage(
        portraitHost.value,
        { pos: [0.2, 0.8, 2.7], target: [0, 0.68, 0], fov: 26 },
        { gaze: 'local' }
    );
    if (!s) {
        failed.value = true;
        return;
    }
    stage = s;
    s.ready.then((ok) => {
        if (s !== stage) return;
        if (!ok) {
            failed.value = true;
            return;
        }
        ready.value = true;
        if (!rig!.prefersReduced()) s.blink();
    });
    applyAim();
}
function stopPortrait() {
    stage?.dispose();
    stage = null;
    ready.value = false;
}

function collapse() {
    collapsed.value = true;
    try {
        sessionStorage.setItem('crocky-hidden', '1');
    } catch {
        /* Storage can be blocked. Ignore it. */
    }
}
function expand() {
    collapsed.value = false;
    try {
        sessionStorage.removeItem('crocky-hidden');
    } catch {
        /* Storage can be blocked. Ignore it. */
    }
}
watch(collapsed, async (c) => {
    if (c) {
        stopPortrait();
        hover.value = null;
        hoverEl = null;
        bubbleOpen.value = false;
        window.clearTimeout(hideTimer);
    } else {
        await nextTick();
        void startPortrait();
    }
});

function pet() {
    stage?.pet();
    const lines = props.t.petLines;
    const line = lines[petN++ % lines.length]!;
    window.clearTimeout(petTimer);
    hover.value = line;
    open();
    petTimer = window.setTimeout(() => {
        if (hover.value === line) hover.value = null;
    }, 2000);
}

// A new line from a page script or an island.
watch(
    () => crocky.msg,
    (msg) => {
        if (!msg || collapsed.value) return;
        base.value = msg.text;
        // A visitor action replaces the hover text, so the reply stays visible.
        if (msg.kind === 'say') hover.value = null;
        stage?.jaw(450);
        // On phones the hero line stays closed, so it never covers the main button.
        if (msg.kind === 'section' && isPhone() && crocky.section === 'inicio') return;
        open();
    }
);
watch(() => crocky.aim, applyAim);

// Hover and focus on any element with data-crocky.
function target(e: Event): HTMLElement | null {
    const el = (e.target as Element | null)?.closest<HTMLElement>('[data-crocky]');
    return el ?? null;
}
function show(el: HTMLElement) {
    if (collapsed.value) return;
    window.clearTimeout(leaveTimer);
    window.clearTimeout(petTimer);
    hoverEl = el;
    hover.value = el.dataset.crocky ?? null;
    bubbleOpen.value = true;
    window.clearTimeout(hideTimer);
    applyAim();
}
function leave() {
    window.clearTimeout(leaveTimer);
    leaveTimer = window.setTimeout(() => {
        hoverEl = null;
        hover.value = null;
        applyAim();
        armAutoHide();
    }, 150);
}
function onOver(e: PointerEvent) {
    if (e.pointerType === 'touch') return;
    const el = target(e);
    if (el) show(el);
}
function onOut(e: PointerEvent) {
    const el = target(e);
    if (!el) return;
    const to = e.relatedTarget as Node | null;
    if (to && el.contains(to)) return;
    leave();
}
function onFocusIn(e: FocusEvent) {
    const el = target(e);
    if (el) show(el);
}
function onFocusOut(e: FocusEvent) {
    if (target(e)) leave();
}

onMounted(() => {
    try {
        collapsed.value = sessionStorage.getItem('crocky-hidden') === '1';
    } catch {
        collapsed.value = false;
    }
    if (crocky.msg) base.value = crocky.msg.text;
    // Phones start with the bubble closed.
    if (!isPhone() && !collapsed.value) open();
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    if (!collapsed.value) void startPortrait();
});
onBeforeUnmount(() => {
    alive = false;
    window.clearTimeout(leaveTimer);
    window.clearTimeout(petTimer);
    window.clearTimeout(hideTimer);
    document.removeEventListener('pointerover', onOver);
    document.removeEventListener('pointerout', onOut);
    document.removeEventListener('focusin', onFocusIn);
    document.removeEventListener('focusout', onFocusOut);
    stopPortrait();
});
</script>

<template>
    <div class="crocky" role="group" :aria-label="t.label">
        <template v-if="!collapsed">
            <div class="cb" :class="{ 'cb--open': bubbleOpen }" role="status" aria-live="polite">
                <p class="cb__text">{{ text }}</p>
            </div>
            <div class="pwrap">
                <button class="portrait" type="button" :aria-label="t.pet" @click="pet">
                    <span ref="portraitHost" class="portrait__canvas"></span>
                    <span v-if="failed" class="portrait__fallback">{{ t.name }}</span>
                    <span v-else-if="!ready" class="portrait__fallback" role="status">
                        <span class="spinner" aria-hidden="true"></span>
                        <span class="sr-only">{{ t.loading }}</span>
                    </span>
                </button>
                <button class="badge" type="button" :aria-label="t.hide" @click="collapse">
                    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.5" fill="none" />
                    </svg>
                </button>
            </div>
        </template>
        <button v-else class="restore" type="button" :aria-label="t.show" @click="expand">
            {{ t.name }}
        </button>
    </div>
</template>

<style scoped>
.crocky {
    position: fixed;
    right: max(16px, env(safe-area-inset-right));
    bottom: max(16px, env(safe-area-inset-bottom));
    z-index: var(--z-crocky);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    pointer-events: none;
}
.crocky > *,
.pwrap {
    pointer-events: auto;
}
/* The bubble has a fixed size and never takes clicks, so it cannot move or block the page. */
.cb {
    position: relative;
    display: flex;
    align-items: center;
    width: min(17rem, calc(100vw - 32px));
    height: 4.5rem;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-accent);
    background: var(--color-bg);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition:
        opacity var(--dur-base) var(--ease-out),
        visibility var(--dur-base);
}
.cb--open {
    opacity: 1;
    visibility: visible;
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
    display: -webkit-box;
    overflow: hidden;
    font-family: var(--font-heading);
    font-size: 0.875rem;
    line-height: 1.3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
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
.portrait__fallback .spinner {
    width: 1.75rem;
    height: 1.75rem;
}
/* The close badge sits at 45 degrees on the top right of the circle. */
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
    display: inline-grid;
    place-items: center;
    min-width: 44px;
    min-height: 44px;
    padding: 0 var(--space-4);
    border: 1px solid var(--color-accent);
    background: var(--color-bg);
    color: var(--color-accent);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
}
/* From 640 px the bubble stacks above the portrait. Both stay inside the reserved gutter. */
@media (min-width: 640px) {
    .pwrap {
        width: 9rem;
        height: 9rem;
    }
    .cb {
        width: 11rem;
        height: 7.5rem;
    }
    .cb::after {
        right: 66px;
    }
    .cb__text {
        font-size: 0.9375rem;
        -webkit-line-clamp: 4;
    }
}
</style>
