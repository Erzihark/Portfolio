<script setup lang="ts">
// Placeholder for a 3D stage: a simple outline of a bench with three boxes.
// It shows in the server HTML, while the scene loads, and when WebGL fails.
// With `loading`, it shows a spinner and that text. With `text`, it shows the failure text.
defineProps<{ text?: string; loading?: string }>();
</script>

<template>
    <div class="fb" :class="{ 'fb--loading': loading && !text }">
        <svg viewBox="0 0 320 180" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
            <path d="M20 140 L160 170 L300 140 L160 112 Z" opacity="0.5" />
            <path d="M60 140 L160 160 M260 140 L160 160 M110 126 L210 150 M210 126 L110 150" opacity="0.25" />
            <path d="M100 118 V60 L150 48 V104 Z M100 60 L120 52 L170 40 L150 48" />
            <path d="M175 112 V76 L205 70 V106 Z" />
            <path d="M215 118 V88 L245 82 V112 Z" stroke="var(--color-accent-2)" />
        </svg>
        <p v-if="text" class="fb__text">{{ text }}</p>
        <p v-else-if="loading" class="fb__text fb__loading" role="status">
            <span class="spinner" aria-hidden="true"></span>
            {{ loading }}
        </p>
    </div>
</template>

<style scoped>
.fb {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    align-content: center;
    gap: var(--space-2);
    color: var(--color-accent);
    pointer-events: none;
}
svg {
    width: min(80%, 22rem);
    height: auto;
    opacity: 0.8;
}
.fb--loading svg {
    animation: fb-pulse 1.8s ease-in-out infinite;
}
.fb__text {
    color: var(--color-text-muted);
    font-family: var(--font-heading);
    font-size: var(--text-sm);
}
.fb__loading {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
}
@keyframes fb-pulse {
    50% {
        opacity: 0.35;
    }
}
</style>
