<script setup lang="ts">
// THROWAWAY PROTOTYPE. Problem chips, grouped by service line. Chips are real toggle buttons.
import { LINES } from './shared';

defineProps<{ selected: string[] }>();
const emit = defineEmits<{
    (e: 'toggle', id: string): void;
    (e: 'hover', el: HTMLElement): void;
    (e: 'leave'): void;
}>();
const over = (e: Event) => emit('hover', e.currentTarget as HTMLElement);
</script>

<template>
    <div class="picker">
        <div v-for="l in LINES" :key="l.id" class="group" role="group" :aria-labelledby="'grp-' + l.id">
            <p :id="'grp-' + l.id" class="tag">SRV · {{ l.n }} · {{ l.title }}</p>
            <div class="chips">
                <button
                    v-for="c in l.chips"
                    :key="c.id"
                    type="button"
                    class="chip"
                    :aria-pressed="selected.includes(c.id)"
                    @click="emit('toggle', c.id)"
                    @pointerenter="over"
                    @pointerleave="emit('leave')"
                    @focus="over"
                    @blur="emit('leave')"
                >
                    {{ c.label }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.picker {
    display: grid;
    gap: var(--space-4);
}
.group {
    display: grid;
    gap: var(--space-2);
}
.tag {
    font-family: ui-monospace, 'SFMono-Regular', Consolas, monospace;
    font-size: 0.6875rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-muted);
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
    padding: 0 var(--space-4);
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    color: var(--color-text);
    font-size: var(--text-sm);
    text-align: left;
    cursor: pointer;
}
.chip::before {
    content: '+';
    display: inline-grid;
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
</style>
