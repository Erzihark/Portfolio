<script setup lang="ts">
// Prototype v1 "Ensamble": scattered business pieces join into one system.
// @ts-ignore three has no bundled types in this project
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const wrapRef = ref<HTMLElement | null>(null);
const stageRef = ref<HTMLElement | null>(null);
const canvasBox = ref<HTMLElement | null>(null);
const reduced = ref(false);

const hero = {
    eyebrow: 'Software a medida para negocios y emprendedores',
    title: 'Haz crecer tu negocio con software hecho para ti.',
    before: 'Hoy tus herramientas viven sueltas.',
    after: 'De Word, Excel y WhatsApp a un solo sistema.',
    text: '¿Quieres atender a más clientes, facilitarle el trabajo a tu equipo o lanzar una idea nueva? Diseño y desarrollo las herramientas digitales para lograrlo, para negocios pequeños y medianos y para personas con una idea.',
    primary: 'Cuéntame tu idea',
    secondary: 'Ver un ejemplo real',
    points: ['Más de 5 años de experiencia', 'Trabajas directamente conmigo', 'Sin tecnicismos']
};

type Kind = 'doc' | 'sheet' | 'chat' | 'note' | 'calendar' | 'calc';

let cleanup: (() => void) | null = null;

onMounted(() => {
    const wrap = wrapRef.value!;
    const stage = stageRef.value!;
    const box = canvasBox.value!;
    reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isReduced = reduced.value;
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    // ---------- Textures ----------
    const textures: any[] = [];
    const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
        c.beginPath();
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
        c.closePath();
    };
    const makeTexture = (kind: Kind) => {
        const cv = document.createElement('canvas');
        cv.width = 256;
        cv.height = 192;
        const c = cv.getContext('2d')!;
        const bg: Record<Kind, string> = {
            doc: '#f5f2ea',
            sheet: '#eaf6ef',
            chat: '#1e2531',
            note: '#ffd86b',
            calendar: '#ffffff',
            calc: '#232b38'
        };
        c.fillStyle = bg[kind];
        rr(c, 4, 4, 248, 184, 16);
        c.fill();
        c.save();
        rr(c, 4, 4, 248, 184, 16);
        c.clip();
        if (kind === 'doc') {
            c.fillStyle = '#3b5bdb';
            c.fillRect(20, 22, 90, 10);
            c.fillStyle = '#b9b4a6';
            for (let i = 0; i < 7; i++) c.fillRect(20, 46 + i * 18, i % 3 === 2 ? 130 : 216, 7);
        } else if (kind === 'sheet') {
            c.fillStyle = '#1f9d63';
            c.fillRect(4, 4, 248, 28);
            c.strokeStyle = '#9fcfb5';
            c.lineWidth = 2;
            for (let i = 1; i < 5; i++) {
                c.beginPath();
                c.moveTo(4 + i * 49.6, 4);
                c.lineTo(4 + i * 49.6, 188);
                c.stroke();
            }
            for (let j = 1; j < 6; j++) {
                c.beginPath();
                c.moveTo(4, 32 + j * 26);
                c.lineTo(252, 32 + j * 26);
                c.stroke();
            }
            c.fillStyle = '#2b7a52';
            for (let j = 0; j < 5; j++) c.fillRect(14, 42 + j * 26, 26 + ((j * 13) % 20), 6);
        } else if (kind === 'chat') {
            c.fillStyle = '#e8edf4';
            rr(c, 20, 24, 150, 40, 14);
            c.fill();
            c.fillStyle = '#25d366';
            rr(c, 86, 76, 150, 40, 14);
            c.fill();
            c.fillStyle = '#e8edf4';
            rr(c, 20, 128, 110, 36, 14);
            c.fill();
            c.fillStyle = '#5b6678';
            c.fillRect(32, 40, 100, 7);
            c.fillStyle = '#0b3d20';
            c.fillRect(98, 92, 110, 7);
            c.fillStyle = '#5b6678';
            c.fillRect(32, 142, 70, 7);
        } else if (kind === 'note') {
            c.fillStyle = '#b7791f';
            for (let i = 0; i < 4; i++) c.fillRect(24, 40 + i * 28, i === 3 ? 90 : 190, 8);
        } else if (kind === 'calendar') {
            c.fillStyle = '#e5484d';
            c.fillRect(4, 4, 248, 40);
            c.fillStyle = '#c9ced8';
            for (let r = 0; r < 4; r++)
                for (let k = 0; k < 7; k++) c.fillRect(20 + k * 30, 58 + r * 30, 20, 18);
            c.fillStyle = '#e5484d';
            c.fillRect(20 + 2 * 30, 58 + 1 * 30, 20, 18);
        } else {
            c.fillStyle = '#9fe8c4';
            c.fillRect(20, 20, 216, 34);
            c.fillStyle = '#4a5568';
            for (let r = 0; r < 3; r++)
                for (let k = 0; k < 4; k++) {
                    rr(c, 20 + k * 56, 68 + r * 38, 48, 30, 8);
                    c.fill();
                }
        }
        c.restore();
        const t = new THREE.CanvasTexture(cv);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        textures.push(t);
        return t;
    };

    const glowTexture = (() => {
        const cv = document.createElement('canvas');
        cv.width = cv.height = 128;
        const c = cv.getContext('2d')!;
        const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'rgba(74,222,155,0.9)');
        g.addColorStop(0.4, 'rgba(74,222,155,0.28)');
        g.addColorStop(1, 'rgba(74,222,155,0)');
        c.fillStyle = g;
        c.fillRect(0, 0, 128, 128);
        const t = new THREE.CanvasTexture(cv);
        textures.push(t);
        return t;
    })();

    // ---------- Scene ----------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.className = 'v1-canvas';
    box.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    const root = new THREE.Group();
    scene.add(root);

    const planeGeo = new THREE.PlaneGeometry(1, 1);
    const TILE_W = 1.2;
    const TILE_H = 0.9;
    const kinds: Kind[] = ['doc', 'sheet', 'chat', 'calendar', 'note', 'doc', 'chat', 'sheet', 'calc', 'sheet', 'doc', 'chat'];
    const amber = new THREE.Color(0xffb454).multiplyScalar(0.5);
    const lit = new THREE.Color(0xe6fff1);
    const mint = new THREE.Color(0x4ade9b);

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const materials: any[] = [];
    const pieces = kinds.map((kind, i) => {
        const mat = new THREE.MeshBasicMaterial({
            map: makeTexture(kind),
            alphaTest: 0.5,
            side: THREE.DoubleSide
        });
        materials.push(mat);
        const mesh = new THREE.Mesh(planeGeo, mat);
        root.add(mesh);
        const col = i % 4;
        const row = Math.floor(i / 4);
        const s = rand(0.8, 1.2);
        return {
            mesh,
            mat,
            delay: (i / kinds.length) * 0.35,
            from: new THREE.Vector3(rand(-4.4, 4.4), rand(-2.8, 2.8), rand(-2.5, 1.5)),
            to: new THREE.Vector3((col - 1.5) * 1.28, (1 - row) * 0.98, 0.02),
            fromScale: new THREE.Vector2(TILE_W * s, TILE_H * s),
            fromRot: new THREE.Euler(rand(-0.7, 0.7), rand(-0.7, 0.7), rand(-0.9, 0.9)),
            spin: new THREE.Vector3(rand(-0.2, 0.2), rand(-0.2, 0.2), rand(-0.15, 0.15)),
            bob: rand(0.1, 0.3),
            phase: rand(0, 6.28)
        };
    });

    // Back panel, frame and glow
    const panelMat = new THREE.MeshBasicMaterial({ color: 0x0f131a, transparent: true, opacity: 0 });
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 3.4), panelMat);
    panel.position.z = -0.05;
    root.add(panel);
    const edgeGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(5.5, 3.4));
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x4ade9b, transparent: true, opacity: 0 });
    const edge = new THREE.LineSegments(edgeGeo, edgeMat);
    edge.position.z = -0.03;
    root.add(edge);
    const glowMat = new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.set(11, 8, 1);
    glow.position.z = -0.6;
    root.add(glow);
    materials.push(panelMat, edgeMat, glowMat);

    // ---------- State ----------
    let target = isReduced ? 1 : 0;
    let smooth = target;
    let time = 0;
    let last = performance.now();
    let raf = 0;
    let inView = true;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;

    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const identity = new THREE.Quaternion();
    const q = new THREE.Quaternion();
    const eul = new THREE.Euler();
    const tmp = new THREE.Vector3();

    const update = () => {
        for (const p of pieces) {
            const local = ease(clamp01((smooth - 0.04 - p.delay) / 0.55));
            const free = 1 - local;
            tmp.copy(p.from);
            tmp.y += Math.sin(time * p.bob * 4 + p.phase) * 0.25 * free;
            tmp.x += Math.cos(time * p.bob * 3 + p.phase) * 0.15 * free;
            p.mesh.position.lerpVectors(tmp, p.to, local);
            p.mesh.position.z += Math.sin(local * Math.PI) * 0.9;
            eul.set(
                p.fromRot.x + time * p.spin.x,
                p.fromRot.y + time * p.spin.y,
                p.fromRot.z + time * p.spin.z
            );
            q.setFromEuler(eul).slerp(identity, local);
            p.mesh.quaternion.copy(q);
            p.mesh.scale.set(
                p.fromScale.x + (TILE_W - p.fromScale.x) * local,
                p.fromScale.y + (TILE_H - p.fromScale.y) * local,
                1
            );
            p.mat.color.copy(amber).lerp(lit, local);
        }
        const done = clamp01((smooth - 0.78) / 0.2);
        const pulse = isReduced ? 1 : 0.88 + 0.12 * Math.sin(time * 1.6);
        panelMat.opacity = clamp01((smooth - 0.5) / 0.4) * 0.95;
        edgeMat.opacity = done;
        glowMat.opacity = done * 0.6 * pulse;
        glowMat.color.copy(mint);
        root.rotation.y = px * 0.3;
        root.rotation.x = -py * 0.18;
    };

    const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        time += dt;
        smooth += (target - smooth) * Math.min(1, dt * 6);
        px += (tx - px) * Math.min(1, dt * 5);
        py += (ty - py) * Math.min(1, dt * 5);
        update();
        renderer.render(scene, camera);
    };
    const renderOnce = () => {
        update();
        renderer.render(scene, camera);
    };
    const sync = () => {
        const should = !isReduced && inView && !document.hidden;
        if (should && !raf) {
            last = performance.now();
            raf = requestAnimationFrame(frame);
        } else if (!should && raf) {
            cancelAnimationFrame(raf);
            raf = 0;
        }
    };

    // ---------- Resize ----------
    const resize = () => {
        const w = Math.max(1, box.clientWidth);
        const h = Math.max(1, box.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const tan = Math.tan((camera.fov * Math.PI) / 360);
        const dist = Math.max(3.4 / tan, 4.6 / (tan * camera.aspect));
        camera.position.set(0, 0, dist);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        if (isReduced || !raf) renderOnce();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    resize();

    // ---------- Observers and listeners ----------
    const io = new IntersectionObserver((entries) => {
        inView = entries[0].isIntersecting;
        sync();
    });
    io.observe(stage);
    const onVis = () => sync();
    document.addEventListener('visibilitychange', onVis);
    const onMove = (e: PointerEvent) => {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!isTouch && !isReduced) window.addEventListener('pointermove', onMove, { passive: true });
    sync();
    if (isReduced) renderOnce();

    // ---------- GSAP ----------
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
        if (isReduced) return;
        gsap.fromTo(
            '.v1-reveal',
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
        );
        gsap.set('.v1-tl-b', { opacity: 0, y: 8 });
        let swapped = false;
        ScrollTrigger.create({
            trigger: wrap,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                target = self.progress;
                const on = self.progress >= 0.6;
                if (on === swapped) return;
                swapped = on;
                gsap.to('.v1-tl-a', { opacity: on ? 0 : 1, y: on ? -8 : 0, duration: 0.4 });
                gsap.to('.v1-tl-b', { opacity: on ? 1 : 0, y: on ? 0 : 8, duration: 0.4 });
            }
        });
    }, wrap);

    cleanup = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        ctx.revert();
        ro.disconnect();
        io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('pointermove', onMove);
        planeGeo.dispose();
        edgeGeo.dispose();
        panel.geometry.dispose();
        materials.forEach((m) => m.dispose());
        textures.forEach((t) => t.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
    };
});

onBeforeUnmount(() => {
    cleanup?.();
    cleanup = null;
});
</script>

<template>
    <div ref="wrapRef" class="v1-wrap">
        <section ref="stageRef" class="v1-stage" :class="{ 'is-reduced': reduced }">
            <div class="v1-text">
                <p class="v1-eyebrow v1-reveal">{{ hero.eyebrow }}</p>
                <h1 class="v1-title v1-reveal">{{ hero.title }}</h1>
                <div class="v1-tagline v1-reveal">
                    <p class="v1-tl v1-tl-a">{{ hero.before }}</p>
                    <p class="v1-tl v1-tl-b">{{ hero.after }}</p>
                </div>
                <p class="v1-lead v1-reveal">{{ hero.text }}</p>
                <div class="v1-cta v1-reveal">
                    <a class="v1-btn v1-btn-primary" href="#contacto">{{ hero.primary }}</a>
                    <a class="v1-btn v1-btn-secondary" href="#proyecto">{{ hero.secondary }}</a>
                </div>
                <ul class="v1-points v1-reveal">
                    <li v-for="p in hero.points" :key="p">{{ p }}</li>
                </ul>
            </div>
            <div ref="canvasBox" class="v1-canvas-box" aria-hidden="true"></div>
        </section>
    </div>
</template>

<style scoped>
.v1-wrap {
    height: 300vh;
    position: relative;
}
.v1-stage {
    position: sticky;
    top: 0;
    height: 100dvh;
    padding: var(--header-height) var(--gutter) 96px;
    display: grid;
    grid-template-rows: auto minmax(180px, 1fr);
    gap: var(--space-4);
    max-width: var(--container-max);
    margin: 0 auto;
    overflow: hidden;
    align-items: center;
}
.v1-text {
    display: grid;
    gap: var(--space-3);
    align-content: center;
    position: relative;
    z-index: var(--z-base);
}
.v1-eyebrow {
    color: var(--color-accent);
    font-size: var(--text-sm);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}
.v1-title {
    font-size: var(--text-2xl);
    line-height: var(--leading-tight);
}
.v1-tagline {
    display: grid;
    font-family: var(--font-heading);
    font-size: var(--text-lg);
    color: var(--color-accent-2);
    min-height: 1.6em;
}
.v1-tl {
    grid-area: 1 / 1;
}
.v1-tl-b {
    color: var(--color-accent);
}
.is-reduced .v1-tl-a {
    opacity: 0;
}
.v1-lead {
    color: var(--color-text-muted);
    max-width: 38rem;
    font-size: var(--text-base);
}
.v1-cta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
}
.v1-btn {
    display: inline-flex;
    align-items: center;
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-full);
    font-weight: 600;
    text-decoration: none;
    transition: transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
}
.v1-btn:hover {
    transform: translateY(-2px);
}
.v1-btn-primary {
    background: var(--color-accent);
    color: var(--color-on-accent);
    box-shadow: 0 0 24px var(--color-accent-glow);
}
.v1-btn-secondary {
    border: 1px solid var(--color-border);
    color: var(--color-text);
}
.v1-btn-secondary:hover {
    border-color: var(--color-accent);
}
.v1-points {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-6);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
}
.v1-points li::before {
    content: '';
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    margin-right: var(--space-2);
    border-radius: var(--radius-full);
    background: var(--color-accent);
}
.v1-canvas-box {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 180px;
}
.v1-canvas-box :deep(.v1-canvas) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}

@media (max-width: 767px) {
    .v1-lead {
        display: none;
    }
    .v1-points {
        display: none;
    }
}

@media (min-width: 768px) {
    .v1-stage {
        grid-template-rows: none;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
        gap: var(--space-8);
    }
    .v1-title {
        font-size: var(--text-3xl);
    }
    .v1-text {
        gap: var(--space-4);
    }
    .v1-canvas-box {
        height: min(100%, 36rem);
    }
}
</style>
