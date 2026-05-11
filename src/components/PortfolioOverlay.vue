<template>
    <div class="overlay">
        <button @click="go('projects')">Projects</button>
        <button @click="go('skills')">Skills</button>
        <button @click="go('experience')">Experience</button>
        <button @click="go('home')">Home</button>
    </div>
</template>

<script>
import emitter from '@/services/emitter.service';

export default {
    methods: {
        go(id) {
            emitter.emit('navigate-to', id);
        }
    }
};
</script>
