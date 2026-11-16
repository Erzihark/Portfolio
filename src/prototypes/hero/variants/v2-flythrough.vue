<script setup lang="ts">
// PROTOTYPE v2 "Recorrido": full-screen flythrough.
// Question: does travelling through the mess, then arriving at order, explain the service?
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import es from '@/i18n/es';

gsap.registerPlugin(ScrollTrigger);

const hero = es.hero;
const titleWords = hero.title.split(' ');
const statementWords = 'Word, Excel, WhatsApp, libretas…'.split(' ');
const systemWords = 'Un solo sistema, hecho para tu negocio.'.split(' ');

const root = ref<HTMLElement>();
const canvas = ref<HTMLCanvasElement>();
const progressBar = ref<HTMLElement>();
const reduced = ref(false);

let cleanup: (() => void) | null = null;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

onMounted(async () => {
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  await nextTick();
  if (!root.value || !canvas.value) return;
  cleanup = init(root.value, canvas.value, reduced.value);
});

onBeforeUnmount(() => {
  cleanup?.();
  cleanup = null;
});

function init(rootEl: HTMLElement, canvasEl: HTMLCanvasElement, still: boolean) {
  const cs = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) =>
    new THREE.Color(cs.getPropertyValue(name).trim() || fallback);
  const bgColor = token('--color-bg', '#07090d');
  const surfaceColor = token('--color-surface', '#0f131a');
  const mint = token('--color-accent', '#4ade9b');
  const amber = token('--color-accent-2', '#ffb454');

  const phone = window.innerWidth < 768;
  const maxDpr = phone ? 1.5 : 2;
  const COUNT = phone ? 80 : 150;
  const WALL_Z = -100;
  const START_Z = 6;
  const CELL_W = 2.0;
  const CELL_H = 1.5;

  // Renderer and scene
  const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: !phone, alpha: false });
  renderer.setClearColor(bgColor);
  const scene = new THREE.Scene();
  scene.background = bgColor;
  scene.fog = new THREE.Fog(bgColor, 8, 60);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 220);

  // Textures: simple office shapes drawn on canvas
  const textures: THREE.Texture[] = [];
  const makeTex = (draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) => {
    const cv = document.createElement('canvas');
    cv.width = 256;
    cv.height = 192;
    const c = cv.getContext('2d')!;
    draw(c, cv.width, cv.height);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    textures.push(tex);
    return tex;
  };
  const round = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    c.beginPath();
    c.roundRect(x, y, w, h, r);
  };
  const paperTex = makeTex((c, w, h) => {
    c.fillStyle = '#f1f3f6';
    round(c, 6, 6, w - 12, h - 12, 14);
    c.fill();
    c.fillStyle = '#6b7482';
    c.fillRect(30, 30, 90, 12);
    c.fillStyle = '#aab2bf';
    for (let i = 0; i < 6; i++) c.fillRect(30, 62 + i * 18, i % 3 === 2 ? 110 : 196, 7);
  });
  const sheetTex = makeTex((c, w, h) => {
    c.fillStyle = '#f1f3f6';
    round(c, 6, 6, w - 12, h - 12, 12);
    c.fill();
    c.fillStyle = '#8c95a3';
    c.fillRect(6, 6, w - 12, 28);
    c.strokeStyle = '#aab2bf';
    c.lineWidth = 3;
    for (let i = 1; i < 5; i++) {
      c.beginPath();
      c.moveTo(6 + (i * (w - 12)) / 5, 6);
      c.lineTo(6 + (i * (w - 12)) / 5, h - 6);
      c.stroke();
    }
    for (let j = 1; j < 6; j++) {
      c.beginPath();
      c.moveTo(6, 6 + 28 + (j * (h - 40)) / 6);
      c.lineTo(w - 6, 6 + 28 + (j * (h - 40)) / 6);
      c.stroke();
    }
  });
  const chatTex = makeTex((c, w, h) => {
    c.fillStyle = '#f1f3f6';
    round(c, 10, 14, w - 60, h - 70, 30);
    c.fill();
    c.beginPath();
    c.moveTo(40, h - 56);
    c.lineTo(34, h - 12);
    c.lineTo(86, h - 56);
    c.fill();
    c.fillStyle = '#8c95a3';
    c.fillRect(40, 48, 150, 12);
    c.fillRect(40, 78, 110, 12);
    c.fillStyle = '#aab2bf';
    round(c, w - 130, 20, 120, 40, 18);
    c.fill();
  });
  const glowTex = (() => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const c = cv.getContext('2d')!;
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(cv);
    textures.push(tex);
    return tex;
  })();

  // Meshes: one InstancedMesh for each piece type
  const planeGeo = new THREE.PlaneGeometry(1, 1);
  const types = [
    { tex: paperTex, aspect: 0.78 },
    { tex: sheetTex, aspect: 1.3 },
    { tex: chatTex, aspect: 1.15 }
  ];
  const materials: THREE.Material[] = [];
  const meshes = types.map((tp) => {
    const m = new THREE.MeshBasicMaterial({
      map: tp.tex,
      alphaTest: 0.4,
      side: THREE.DoubleSide
    });
    materials.push(m);
    return m;
  });

  interface Piece {
    type: number;
    idx: number;
    x: number;
    y: number;
    z: number;
    rx: number;
    ry: number;
    rz: number;
    spin: number;
    phase: number;
    w: number;
    h: number;
    delay: number;
    conv: boolean;
    tx: number;
    ty: number;
    col: number;
  }
  const pieces: Piece[] = [];
  const perType = [0, 0, 0];
  for (let i = 0; i < COUNT; i++) {
    const type = i % 3;
    const z = -4 - 96 * Math.pow(Math.random(), 0.75);
    const s = 0.9 + Math.random() * 1.2;
    pieces.push({
      type,
      idx: perType[type]++,
      x: (Math.random() < 0.5 ? -1 : 1) * (2.8 + Math.random() * 15),
      y: (Math.random() * 2 - 1) * 9,
      z,
      rx: (Math.random() - 0.5) * 1.6,
      ry: (Math.random() - 0.5) * 1.6,
      rz: (Math.random() - 0.5) * 2.4,
      spin: (Math.random() - 0.5) * 0.5,
      phase: Math.random() * 6.28,
      w: s * types[type].aspect,
      h: s,
      delay: Math.random() * 0.12,
      conv: z < -58,
      tx: 0,
      ty: 0,
      col: 0
    });
  }
  const insts = types.map((_, t) => {
    const im = new THREE.InstancedMesh(planeGeo, meshes[t], Math.max(1, perType[t]));
    im.frustumCulled = false;
    im.setColorAt(0, new THREE.Color(1, 1, 1));
    scene.add(im);
    return im;
  });

  // Wall layout: sorted by type, so each band is one kind of piece
  const conv = pieces.filter((p) => p.conv).sort((a, b) => a.type - b.type);
  const M = conv.length;
  const cols = Math.ceil(Math.sqrt(M * 1.7));
  const rows = Math.ceil(M / cols);
  conv.forEach((p, n) => {
    const r = Math.floor(n / cols);
    const c = n % cols;
    const rowLen = Math.min(cols, M - r * cols);
    p.tx = (c - (rowLen - 1) / 2) * CELL_W;
    p.ty = ((rows - 1) / 2 - r) * CELL_H;
    p.col = c;
  });
  const wallW = cols * CELL_W;
  const wallH = rows * CELL_H;

  // Panel behind the wall, and a glow sprite
  const panelMat = new THREE.MeshBasicMaterial({ color: surfaceColor, transparent: true, opacity: 0, fog: false });
  const panel = new THREE.Mesh(planeGeo, panelMat);
  panel.scale.set(wallW + 1.2, wallH + 1.2, 1);
  panel.position.set(0, 0, WALL_Z - 0.3);
  scene.add(panel);
  const glowMat = new THREE.SpriteMaterial({
    map: glowTex,
    color: mint,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: false
  });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.set(wallW * 1.7, wallH * 2.1, 1);
  glow.position.set(0, 0, WALL_Z - 0.6);
  scene.add(glow);

  // State
  const dim = amber.clone().multiplyScalar(0.5);
  const tmp = new THREE.Color();
  const dummy = new THREE.Object3D();
  let camEndZ = WALL_Z + 16;
  let target = still ? 1 : 0;
  let smooth = still ? 1 : 0;
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  let onScreen = true;
  let tabVisible = !document.hidden;
  let raf = 0;
  let last = 0;

  function update(p: number, t: number) {
    const ep = p + (smoothstep(0, 1, p) - p) * 0.6;
    const camZ = START_Z + (camEndZ - START_Z) * ep;
    const settle = smoothstep(0.8, 1, p);
    const calm = 1 - settle * 0.7;
    const roll = Math.sin(p * 9) * 0.07 * (1 - settle);
    camera.position.set(
      ptr.sx * 1.4 * calm + Math.sin(t * 0.4) * 0.25 * (1 - settle),
      ptr.sy * 0.9 * calm + Math.cos(t * 0.33) * 0.2 * (1 - settle),
      camZ
    );
    camera.lookAt(ptr.sx * 2.5 * calm, ptr.sy * 1.5 * calm, camZ - 20);
    camera.rotation.z += roll;

    const fog = scene.fog as THREE.Fog;
    fog.far = 60 + 90 * smoothstep(0.55, 1, p);
    fog.near = 8 + 20 * smoothstep(0.6, 1, p);

    const globalTint = 0.3 * smoothstep(0.5, 1, p);
    for (const pc of pieces) {
      let a = 0;
      if (pc.conv) a = smoothstep(0.6 + pc.delay, 0.8 + pc.delay, p);
      const drift = 1 - a;
      const sx = pc.x + Math.sin(t * 0.5 + pc.phase) * 0.5 * drift;
      const sy = pc.y + Math.cos(t * 0.4 + pc.phase) * 0.4 * drift;
      let x = sx;
      let y = sy;
      let z = pc.z;
      if (pc.conv) {
        x += (pc.tx - sx) * a;
        y += (pc.ty - sy) * a;
        z += (WALL_Z - pc.z) * a;
      }
      dummy.position.set(x, y, z);
      dummy.rotation.set(
        (pc.rx + t * pc.spin) * drift,
        (pc.ry + t * pc.spin * 0.7) * drift,
        (pc.rz + t * pc.spin * 0.4) * drift
      );
      const w = pc.w + (CELL_W * 0.9 - pc.w) * a;
      const h = pc.h + (CELL_H * 0.88 - pc.h) * a;
      dummy.scale.set(w, h, 1);
      dummy.updateMatrix();
      insts[pc.type].setMatrixAt(pc.idx, dummy.matrix);

      const k = pc.conv ? a : globalTint;
      tmp.copy(dim).lerp(mint, k);
      const pulse = pc.conv ? 1 + 0.3 * a * Math.sin(t * 2.2 - pc.col * 0.6) : 1;
      tmp.multiplyScalar((1 + 0.25 * k) * pulse);
      insts[pc.type].setColorAt(pc.idx, tmp);
    }
    for (const im of insts) {
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
    }
    const end = smoothstep(0.72, 1, p);
    glowMat.opacity = 0.75 * end;
    panelMat.opacity = 0.92 * smoothstep(0.78, 1, p);
  }

  function resize() {
    const w = canvasEl.clientWidth || 1;
    const h = canvasEl.clientHeight || 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Stand far enough to see the full wall
    const halfV = Math.tan((camera.fov * Math.PI) / 360);
    const need = Math.max(wallW / 2 / (halfV * camera.aspect), wallH / 2 / halfV) * 1.12;
    camEndZ = WALL_Z + Math.min(70, Math.max(16, need));
    if (!running()) draw(performance.now());
  }

  const running = () => !still && onScreen && tabVisible;

  function draw(now: number) {
    update(smooth, now / 1000);
    renderer.render(scene, camera);
  }

  function loop(now: number) {
    raf = 0;
    if (!running()) return;
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    smooth += (target - smooth) * (1 - Math.exp(-dt * 4));
    ptr.sx += (ptr.x - ptr.sx) * (1 - Math.exp(-dt * 3));
    ptr.sy += (ptr.y - ptr.sy) * (1 - Math.exp(-dt * 3));
    draw(now);
    raf = requestAnimationFrame(loop);
  }
  function kick() {
    if (running() && !raf) {
      last = 0;
      raf = requestAnimationFrame(loop);
    }
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvasEl);
  resize();

  let io: IntersectionObserver | null = null;
  let ctx: gsap.Context | null = null;
  const onMove = (e: PointerEvent) => {
    ptr.x = (e.clientX / window.innerWidth) * 2 - 1;
    ptr.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  const onVis = () => {
    tabVisible = !document.hidden;
    kick();
  };

  if (still) {
    draw(0);
  } else {
    io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      kick();
    });
    io.observe(rootEl);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('visibilitychange', onVis);

    ctx = gsap.context(() => {
      const q = gsap.utils.selector(rootEl);
      const b1 = q('.b1');
      const b2 = q('.b2');
      const b3 = q('.b3');

      // Load reveal for beat 1
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from(q('.b1 .eyebrow'), { opacity: 0, y: 16, duration: 0.7 }, 0.1)
        .from(q('.b1 .wi'), { yPercent: 115, duration: 1, stagger: 0.07 }, 0.25)
        .from(q('.hint'), { opacity: 0, duration: 0.8 }, 1.2);

      // Scroll story
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: rootEl,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            target = self.progress;
          }
        }
      });
      tl.fromTo(progressBar.value!, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
      tl.to(b1, { autoAlpha: 0, scale: 1.1, duration: 0.06, ease: 'power1.in' }, 0.29);
      tl.fromTo(b2, { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.05 }, 0.36);
      tl.fromTo(q('.b2 .wi'), { yPercent: 115 }, { yPercent: 0, duration: 0.05, stagger: 0.012 }, 0.36);
      tl.fromTo(q('.b2 .sub'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.05 }, 0.42);
      tl.to(b2, { autoAlpha: 0, scale: 1.1, duration: 0.05, ease: 'power1.in' }, 0.64);
      tl.fromTo(b3, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.05 }, 0.72);
      tl.fromTo(q('.b3 .wi'), { yPercent: 115 }, { yPercent: 0, duration: 0.05, stagger: 0.01 }, 0.72);
      tl.fromTo(
        q('.b3 .item'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.05, stagger: 0.018 },
        0.76
      );
    }, rootEl);
    kick();
  }

  return () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    ro.disconnect();
    io?.disconnect();
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('visibilitychange', onVis);
    ctx?.revert();
    ctx = null;
    insts.forEach((im) => {
      scene.remove(im);
      im.dispose();
    });
    planeGeo.dispose();
    materials.forEach((m) => m.dispose());
    panelMat.dispose();
    glowMat.dispose();
    textures.forEach((t) => t.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
  };
}
</script>

<template>
  <div ref="root" class="v2" :class="{ still: reduced }">
    <div class="stage">
      <canvas ref="canvas" class="canvas" aria-hidden="true"></canvas>
      <div class="vignette" aria-hidden="true"></div>
      <div ref="progressBar" class="progress" aria-hidden="true"></div>
      <a class="top-cta" href="#contacto">{{ hero.primary }}</a>

      <section class="beat b1">
        <p class="eyebrow">{{ hero.eyebrow }}</p>
        <h1 class="big">
          <template v-for="(w, i) in titleWords" :key="i">
            <span class="w"><span class="wi">{{ w }}</span></span>{{ ' ' }}
          </template>
        </h1>
        <p v-if="!reduced" class="hint" aria-hidden="true">
          <span>desliza</span>
          <i></i>
        </p>
      </section>

      <section class="beat b2">
        <p class="statement big">
          <template v-for="(w, i) in statementWords" :key="i">
            <span class="w"><span class="wi">{{ w }}</span></span>{{ ' ' }}
          </template>
        </p>
        <p class="sub">Tu información vive en diez lugares.</p>
      </section>

      <section class="beat b3">
        <div class="panel">
          <h2 class="big">
            <template v-for="(w, i) in systemWords" :key="i">
              <span class="w" :class="{ hl: i < 3 }"><span class="wi">{{ w }}</span></span>{{ ' ' }}
            </template>
          </h2>
          <p class="lead item">{{ hero.text }}</p>
          <div class="ctas item">
            <a class="btn btn-primary" href="#contacto">{{ hero.primary }}</a>
            <a class="btn btn-secondary" href="#proyectos">{{ hero.secondary }}</a>
          </div>
          <ul class="points item">
            <li v-for="p in hero.points" :key="p">{{ p }}</li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.v2 {
  position: relative;
  height: 400vh;
}
.stage {
  position: sticky;
  top: 0;
  height: 100dvh;
  overflow: hidden;
  background: var(--color-bg);
}
.canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 70% 60% at 50% 50%,
    color-mix(in srgb, var(--color-bg) 82%, transparent) 0%,
    color-mix(in srgb, var(--color-bg) 55%, transparent) 45%,
    transparent 100%
  );
}
.progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left;
  z-index: 3;
}
.top-cta {
  position: absolute;
  top: var(--space-4);
  right: var(--gutter);
  z-index: 4;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
}
.top-cta:hover {
  box-shadow: 0 0 24px var(--color-accent-glow);
}

/* Beats */
.beat {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4.5rem var(--gutter) 96px;
  text-align: center;
}
.b2,
.b3 {
  opacity: 0;
  visibility: hidden;
}
.eyebrow {
  margin-bottom: var(--space-6);
  color: var(--color-accent);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.big {
  max-width: 20ch;
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: var(--leading-tight);
  letter-spacing: -0.03em;
  text-wrap: balance;
}
.b1 .big {
  max-width: 17ch;
  font-size: clamp(2.5rem, 7vw + 0.5rem, 6.75rem);
}
.statement {
  max-width: 14ch;
  color: var(--color-accent-2);
  font-size: clamp(2.5rem, 9vw, 8rem);
}
.b3 .big {
  max-width: 18ch;
  font-size: clamp(2rem, 5vw + 0.25rem, 4.5rem);
}
.w {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding-bottom: 0.14em;
  margin-bottom: -0.14em;
}
.wi {
  display: inline-block;
}
.hl {
  color: var(--color-accent);
}
.sub {
  margin-top: var(--space-6);
  color: var(--color-text);
  font-size: var(--text-xl);
}
.panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 52rem;
  padding: var(--space-8) var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-bg) 84%, transparent);
  backdrop-filter: blur(8px);
}
.lead {
  max-width: 40rem;
  margin-top: var(--space-6);
  color: var(--color-text);
  font-size: var(--text-lg);
}
.ctas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-6);
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: var(--space-3) var(--space-6);
  border: 2px solid transparent;
  border-radius: var(--radius-full);
  font-weight: 600;
  text-decoration: none;
}
.btn-primary {
  background: var(--color-accent);
  color: var(--color-on-accent);
}
.btn-secondary {
  border-color: var(--color-border);
  color: var(--color-text);
}
.btn-secondary:hover {
  border-color: var(--color-accent);
}
.points {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2) var(--space-6);
  margin-top: var(--space-6);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
.points li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.points li::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--radius-full);
  background: var(--color-accent);
}
.hint {
  position: absolute;
  bottom: calc(96px + var(--space-4));
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  transform: translateX(-50%);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.hint i {
  width: 1px;
  height: 2rem;
  background: linear-gradient(var(--color-text-muted), transparent);
  animation: hint 1.6s var(--ease-out) infinite;
  transform-origin: top;
}
@keyframes hint {
  0% {
    transform: scaleY(0);
  }
  60% {
    transform: scaleY(1);
  }
  100% {
    transform: scaleY(1);
    opacity: 0;
  }
}

/* Reduced motion: stacked sections, static render behind the first one */
.still {
  height: auto;
}
.still .stage {
  position: relative;
  height: auto;
  overflow: visible;
}
.still .canvas,
.still .vignette {
  height: 100dvh;
}
.still .progress {
  display: none;
}
.still .beat {
  position: relative;
  min-height: 100dvh;
  opacity: 1;
  visibility: visible;
}
.still .b2,
.still .b3 {
  background: var(--color-bg);
}
</style>
