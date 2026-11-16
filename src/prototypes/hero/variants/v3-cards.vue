<script setup lang="ts">
// PROTOTYPE v3 "Tarjetas": readable app cards in CSS 3D.
// Question: does a owner see their own daily mess at once?
// The base CSS is the assembled state. GSAP sets the scattered start state.
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import es from '@/i18n/es';

const t = es.hero;
const lineB = 'De Word, Excel y WhatsApp a un solo sistema.';

const root = ref<HTMLElement | null>(null);
const tilt = ref<HTMLElement | null>(null);

type Scatter = { x: number; y: number; z: number; rx: number; ry: number; rz: number; blur?: number };

// Order sets the stagger. x and y are in vw and vh. Angles are in degrees.
const order = ['sheet', 'chat', 'calendar', 'doc', 'mail', 'receipt', 'note'];

const desktopScatter: Record<string, Scatter> = {
  sheet: { x: -20, y: 12, z: 120, rx: 10, ry: 14, rz: -8 },
  chat: { x: 9, y: -3, z: -180, rx: -8, ry: -16, rz: 9, blur: 2.5 },
  calendar: { x: -6, y: -24, z: -260, rx: 6, ry: 12, rz: 7, blur: 3 },
  doc: { x: -30, y: -8, z: 200, rx: -6, ry: 18, rz: -12 },
  mail: { x: 6, y: 20, z: 60, rx: 12, ry: -10, rz: -6 },
  receipt: { x: -9, y: -30, z: 150, rx: -10, ry: -12, rz: 14 },
  note: { x: -33, y: 6, z: 260, rx: 8, ry: 10, rz: -14 }
};

const phoneScatter: Record<string, Scatter> = {
  sheet: { x: 6, y: 8, z: 60, rx: 4, ry: 6, rz: -4 },
  chat: { x: -8, y: -10, z: -120, rx: -4, ry: -6, rz: 5, blur: 1.5 },
  calendar: { x: 10, y: -14, z: -160, rx: 3, ry: 6, rz: 4, blur: 2 },
  receipt: { x: -6, y: -22, z: 90, rx: -5, ry: -6, rz: 7 },
  note: { x: -10, y: 10, z: 130, rx: 4, ry: 5, rz: -8 }
};

let ctx: gsap.Context | null = null;
let mm: gsap.MatchMedia | null = null;
let onMove: ((e: PointerEvent) => void) | null = null;

onMounted(() => {
  const rootEl = root.value;
  const tiltEl = tilt.value;
  if (!rootEl || !tiltEl) return;

  // Reduced motion: keep the assembled state. No GSAP.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);
  const q = gsap.utils.selector(rootEl);
  const vw = (n: number) => (n * window.innerWidth) / 100;
  const vh = (n: number) => (n * window.innerHeight) / 100;
  let prog = 0;
  let nx = 0;
  let ny = 0;

  const rotX = gsap.quickTo(tiltEl, 'rotationX', { duration: 0.9, ease: 'power3.out' });
  const rotY = gsap.quickTo(tiltEl, 'rotationY', { duration: 0.9, ease: 'power3.out' });
  // Tilt fades out while the cards assemble.
  const applyTilt = () => {
    const amp = 7 * (1 - Math.min(prog / 0.6, 1));
    rotX(-ny * amp);
    rotY(nx * amp);
  };

  ctx = gsap.context(() => {
    // Text reveal on load.
    gsap.from(q('.reveal'), {
      y: 28,
      opacity: 0,
      duration: 0.9,
      stagger: 0.09,
      ease: 'power3.out',
      delay: 0.1
    });

    mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 767px)', desk: '(min-width: 768px)' }, (c) => {
      const isPhone = !!c.conditions?.phone;
      const scatter = isPhone ? phoneScatter : desktopScatter;
      const keys = order.filter((k) => scatter[k]);
      const step = 0.3 / Math.max(keys.length - 1, 1);

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: rootEl,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            prog = self.progress;
            applyTilt();
          }
        }
      });

      // 0.25 to 0.8: cards fly to their slots.
      keys.forEach((key, i) => {
        const el = q(`[data-card="${key}"]`)[0];
        const s = scatter[key];
        if (!el) return;
        tl.fromTo(
          el,
          {
            x: vw(s.x),
            y: vh(s.y),
            z: s.z,
            rotationX: s.rx,
            rotationY: s.ry,
            rotationZ: s.rz,
            '--bob': 1,
            filter: s.blur ? `blur(${s.blur}px)` : 'none'
          },
          {
            x: 0,
            y: 0,
            z: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            '--bob': 0,
            filter: s.blur ? 'blur(0px)' : 'none',
            ease: 'power3.inOut',
            duration: 0.25,
            immediateRender: true
          },
          0.25 + i * step
        );
      });

      // Window chrome appears behind the cards.
      tl.fromTo(q('.window'), { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: true }, 0.4);

      // Card titles change from file names to panel names.
      tl.fromTo(q('.t-a'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.08, immediateRender: true }, 0.7);
      tl.fromTo(q('.t-b'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08, immediateRender: true }, 0.74);
      tl.fromTo(q('.note-a'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1, immediateRender: true }, 0.68);
      tl.fromTo(q('.note-b'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1, immediateRender: true }, 0.72);

      // Second text line crossfades near 0.6.
      tl.fromTo(q('.sub-a'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -8, duration: 0.08, immediateRender: true }, 0.56);
      tl.fromTo(q('.sub-b'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.08, immediateRender: true }, 0.62);

      // 0.8 to 1: amber edges turn mint, glow and badge appear.
      tl.fromTo(q('.edge-a'), { opacity: 1 }, { opacity: 0, duration: 0.15, immediateRender: true }, 0.8);
      tl.fromTo(q('.edge-m'), { opacity: 0 }, { opacity: 1, duration: 0.15, immediateRender: true }, 0.8);
      tl.fromTo(q('.glow'), { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: true }, 0.8);
      tl.fromTo(
        q('.badge'),
        { opacity: 0, y: 10, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, ease: 'back.out(1.6)', duration: 0.12, immediateRender: true },
        0.88
      );
    });
  }, rootEl);

  // Pointer tilt. Skip on touch devices.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    onMove = (e: PointerEvent) => {
      nx = (e.clientX / window.innerWidth - 0.5) * 2;
      ny = (e.clientY / window.innerHeight - 0.5) * 2;
      applyTilt();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
  }
});

onBeforeUnmount(() => {
  if (onMove) window.removeEventListener('pointermove', onMove);
  onMove = null;
  mm?.revert();
  mm = null;
  ctx?.revert();
  ctx = null;
});
</script>

<template>
  <div ref="root" class="v3">
    <div class="stage">
      <!-- Text block -->
      <div class="copy">
        <p class="eyebrow reveal">{{ t.eyebrow }}</p>
        <h1 class="reveal">{{ t.title }}</h1>
        <div class="sub reveal">
          <p class="sub-a">{{ t.text }}</p>
          <p class="sub-b">{{ lineB }}</p>
        </div>
        <div class="ctas reveal">
          <a class="btn btn-primary" href="#contacto">{{ t.primary }}</a>
          <a class="btn btn-secondary" href="#proyectos">{{ t.secondary }}</a>
        </div>
        <ul class="points reveal">
          <li v-for="p in t.points" :key="p">{{ p }}</li>
        </ul>
      </div>

      <!-- Card stage. Decorative. -->
      <div class="stage3d" aria-hidden="true">
        <div ref="tilt" class="tilt">
          <div class="window">
            <div class="glow"></div>
            <div class="topbar">
              <i></i><i></i><i></i>
              <b>Tu negocio</b>
            </div>
            <ul class="side">
              <li class="on">Inicio</li>
              <li>Clientes</li>
              <li>Mensajes</li>
              <li>Agenda</li>
              <li>Cobros</li>
            </ul>
          </div>

          <!-- Spreadsheet -->
          <div class="card c-sheet" data-card="sheet" style="--i: 0">
            <div class="bob">
              <div class="face">
                <div class="bar bar-green">
                  <span class="t-a">Clientes 2024 (versión final 3).xlsx</span>
                  <span class="t-b">Clientes</span>
                </div>
                <div class="grid">
                  <span class="h">Cliente</span><span class="h">Saldo</span><span class="h">Estado</span>
                  <span>Pastelería Luna</span><span>$4,200</span><span>Pagó</span>
                  <span>Taller Ruiz</span><span class="warn">$12,800</span><span class="warn">Debe</span>
                  <span>Dra. Pérez</span><span>$1,950</span><span>Pagó</span>
                  <span>Ferretería Sol</span><span>$7,300</span><span class="warn">¿?</span>
                  <span>Abarrotes Mary</span><span>$860</span><span class="warn">Debe</span>
                </div>
                <span class="edge edge-a"></span><span class="edge edge-m"></span>
              </div>
            </div>
          </div>

          <!-- Chat -->
          <div class="card c-chat" data-card="chat" style="--i: 1">
            <div class="bob">
              <div class="face">
                <div class="bar bar-teal">
                  <span class="t-a">Cliente nuevo</span>
                  <span class="t-b">Mensajes</span>
                </div>
                <div class="chat">
                  <p class="in">¿Me reenvías la cotización?</p>
                  <p class="out">Ya te la mandé por correo</p>
                  <p class="in">¿Cuál era el precio?</p>
                  <p class="out">Está en el Excel, creo</p>
                </div>
                <span class="edge edge-a"></span><span class="edge edge-m"></span>
              </div>
            </div>
          </div>

          <!-- Calendar -->
          <div class="card c-calendar" data-card="calendar" style="--i: 2">
            <div class="bob">
              <div class="face">
                <div class="bar bar-red">
                  <span class="t-a">Noviembre · Martes 12</span>
                  <span class="t-b">Agenda</span>
                </div>
                <div class="cal">
                  <span class="hr" style="top: 0%">9</span>
                  <span class="hr" style="top: 33%">10</span>
                  <span class="hr" style="top: 66%">11</span>
                  <p class="ev e1">Sr. Ruiz 10:00</p>
                  <p class="ev e2">Entrega pedido</p>
                  <p class="ev e3">Junta equipo</p>
                </div>
                <span class="edge edge-a"></span><span class="edge edge-m"></span>
              </div>
            </div>
          </div>

          <!-- Text document -->
          <div class="card c-doc" data-card="doc" style="--i: 3">
            <div class="bob">
              <div class="face">
                <div class="bar bar-blue">
                  <span class="t-a">Cotización_v7_FINAL.docx</span>
                  <span class="t-b">Cotizaciones</span>
                </div>
                <div class="page">
                  <b>COTIZACIÓN</b>
                  <i></i><i class="s"></i>
                  <div class="row"><span>Sitio web</span><span>$18,000</span></div>
                  <div class="row"><span>Mantenimiento</span><span>$2,400</span></div>
                  <i></i><i class="s"></i>
                </div>
                <span class="edge edge-a"></span><span class="edge edge-m"></span>
              </div>
            </div>
          </div>

          <!-- Email inbox -->
          <div class="card c-mail" data-card="mail" style="--i: 4">
            <div class="bob">
              <div class="face">
                <div class="bar bar-slate">
                  <span class="t-a">Bandeja de entrada</span>
                  <span class="t-b">Correos</span>
                  <em class="badge-n">37</em>
                </div>
                <ul class="mails">
                  <li class="unread"><b>Sra. López</b><span>URGENTE: ¿ya está?</span></li>
                  <li class="unread"><b>Proveedor Díaz</b><span>Re: Re: Pedido</span></li>
                  <li><b>Banco</b><span>Aviso importante</span></li>
                </ul>
                <span class="edge edge-a"></span><span class="edge edge-m"></span>
              </div>
            </div>
          </div>

          <!-- Receipt -->
          <div class="card c-receipt" data-card="receipt" style="--i: 5">
            <div class="bob">
              <div class="face">
                <div class="bar bar-mono">
                  <span class="t-a">TICKET #0342</span>
                  <span class="t-b">Totales</span>
                </div>
                <div class="ticket">
                  <p><span>Pastel 3 leches</span><span>380</span></p>
                  <p><span>Caja 12 pzas</span><span>520</span></p>
                  <p><span>Envío</span><span>120</span></p>
                  <p class="total"><span>TOTAL</span><span>$1,240</span></p>
                </div>
                <span class="edge edge-a"></span><span class="edge edge-m"></span>
              </div>
            </div>
          </div>

          <!-- Sticky note -->
          <div class="card c-note" data-card="note" style="--i: 6">
            <div class="bob">
              <div class="face face-note">
                <div class="note-a">
                  <span class="tape"></span>
                  <p>Llamar a Sra. López — urgente</p>
                </div>
                <div class="note-b">
                  <div class="bar bar-slate"><span>Pendientes</span></div>
                  <ul>
                    <li>Llamar a Sra. López</li>
                    <li>Enviar cotización</li>
                  </ul>
                </div>
                <span class="edge edge-a"></span><span class="edge edge-m"></span>
              </div>
            </div>
          </div>

          <div class="badge">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            Todo en un solo lugar
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.v3 {
  --sheet-green: #1f8a4f;
  --teal: #0f6b5c;
  --bubble-in: #232d38;
  --bubble-out: #11594a;
  --doc-blue: #2f62d9;
  --mail-red: #e5564f;
  --paper: #f6e58d;
  --ink: #3b3320;
  --bw: min(60vw, 66rem, calc((100dvh - 96px - 5.5rem) / 0.62));
  --bh: calc(var(--bw) * 0.62);
  --u: calc(var(--bw) / 100);
  position: relative;
  height: 300vh;
  background: var(--color-bg);
  color: var(--color-text);
}

.stage {
  position: sticky;
  top: 0;
  height: 100dvh;
  overflow: clip;
  background:
    radial-gradient(60% 50% at 70% 70%, rgb(74 222 155 / 0.07), transparent 70%),
    radial-gradient(40% 40% at 20% 85%, rgb(255 180 84 / 0.06), transparent 70%),
    var(--color-bg);
}

/* ---------- Text ---------- */
.copy {
  position: absolute;
  z-index: 5;
  top: calc(var(--header-height) + var(--space-6));
  left: var(--gutter);
  max-width: min(40rem, 92vw);
}
.copy::before {
  content: '';
  position: absolute;
  inset: -3rem -4rem -2rem -3rem;
  z-index: -1;
  background: radial-gradient(closest-side, rgb(7 9 13 / 0.78), transparent);
  pointer-events: none;
}
.eyebrow {
  margin-bottom: var(--space-3);
  color: var(--color-accent);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
h1 {
  font-size: clamp(2.1rem, 4.4vw + 0.5rem, 4.4rem);
  font-weight: 700;
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  overflow-wrap: break-word;
}
.sub {
  display: grid;
  margin-top: var(--space-4);
  max-width: 34rem;
  color: var(--color-text-muted);
  font-size: var(--text-lg);
}
.sub > p {
  grid-area: 1 / 1;
}
/* Base is the final state. */
.sub-a {
  visibility: hidden;
  opacity: 0;
}
.sub-b {
  color: var(--color-text);
  font-weight: 500;
}
.ctas {
  display: flex;
  flex-wrap: wrap;
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
  text-align: center;
  text-decoration: none;
  transition:
    transform var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out);
}
.btn:hover {
  transform: translateY(-2px);
}
.btn-primary {
  background: var(--color-accent);
  color: var(--color-on-accent);
}
.btn-secondary {
  border-color: var(--color-border);
  color: var(--color-text);
  background: rgb(7 9 13 / 0.5);
}
.btn-secondary:hover {
  border-color: var(--color-accent);
}
.points {
  display: flex;
  flex-wrap: wrap;
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
  background: var(--color-accent-2);
}

/* ---------- 3D stage ---------- */
.stage3d {
  position: absolute;
  inset: 0;
  z-index: 1;
  perspective: 1400px;
  perspective-origin: 70% 70%;
  pointer-events: none;
}
.tilt {
  position: absolute;
  right: var(--gutter);
  bottom: 96px;
  width: var(--bw);
  height: var(--bh);
  transform-style: preserve-3d;
}

/* Window chrome. It sits behind the cards. */
.window {
  position: absolute;
  inset: 0;
  transform: translateZ(-2px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: #0b0f15;
  font-size: calc(var(--u) * 1.4);
}
.glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow:
    0 0 0 1px rgb(74 222 155 / 0.45),
    0 0 4em rgb(74 222 155 / 0.28),
    0 0 12em rgb(74 222 155 / 0.14);
}
.topbar {
  position: absolute;
  inset: 0 0 auto 0;
  display: flex;
  align-items: center;
  gap: 0.5em;
  height: 8%;
  padding-inline: 1.4em;
  border-bottom: 1px solid var(--color-border);
}
.topbar i {
  width: 0.7em;
  height: 0.7em;
  border-radius: 50%;
  background: var(--color-border);
}
.topbar b {
  margin-left: 1em;
  font-family: var(--font-heading);
  font-size: 1.1em;
}
.side {
  position: absolute;
  top: 8%;
  bottom: 0;
  left: 0;
  width: 12%;
  display: grid;
  align-content: start;
  gap: 0.4em;
  padding: 1.2em 0.9em;
  border-right: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.9em;
}
.side li {
  padding: 0.5em 0.7em;
  border-radius: 0.5em;
}
.side .on {
  background: var(--color-surface-2);
  color: var(--color-accent);
}

/* ---------- Cards ---------- */
.card {
  position: absolute;
  left: calc(var(--x) * 1%);
  top: calc(var(--y) * 1%);
  width: calc(var(--w) * 1%);
  height: calc(var(--h) * 1%);
  --bob: 0;
  will-change: transform;
}
.c-sheet { --x: 14; --y: 11; --w: 33; --h: 46; }
.c-chat { --x: 49; --y: 11; --w: 24; --h: 46; }
.c-mail { --x: 75; --y: 11; --w: 23; --h: 26; }
.c-note { --x: 75; --y: 39; --w: 23; --h: 18; }
.c-calendar { --x: 14; --y: 59; --w: 33; --h: 38; }
.c-doc { --x: 49; --y: 59; --w: 24; --h: 38; }
.c-receipt { --x: 75; --y: 59; --w: 23; --h: 38; }

.bob {
  width: 100%;
  height: 100%;
  animation: bob 6s ease-in-out infinite;
  animation-delay: calc(var(--i) * -1.1s);
}
@keyframes bob {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  50% {
    transform: translate3d(0, calc(var(--bob) * -0.9em), 0) rotate(calc(var(--bob) * 1.4deg));
  }
}

.face {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 0.9em;
  background: var(--color-surface);
  font-size: calc(var(--u) * 1.4);
  line-height: 1.3;
  box-shadow:
    0 1px 2px rgb(0 0 0 / 0.5),
    0 0.6em 1.2em rgb(0 0 0 / 0.35),
    0 2em 4em rgb(0 0 0 / 0.4);
}
.edge {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
}
.edge-a {
  opacity: 0;
  box-shadow:
    inset 0 0 0 1px rgb(255 180 84 / 0.6),
    inset 0 0 1.4em rgb(255 180 84 / 0.12),
    0 0 1.6em rgb(255 180 84 / 0.2);
}
.edge-m {
  opacity: 1;
  box-shadow:
    inset 0 0 0 1px rgb(74 222 155 / 0.7),
    inset 0 0 1.4em rgb(74 222 155 / 0.1);
}

.bar {
  position: relative;
  display: grid;
  align-items: center;
  flex: none;
  padding: 0.55em 0.9em;
  background: var(--c, var(--color-surface-2));
  color: #fff;
  font-size: 0.9em;
  font-weight: 600;
  white-space: nowrap;
}
.bar > span {
  grid-area: 1 / 1;
  overflow: hidden;
  text-overflow: ellipsis;
}
.t-a {
  visibility: hidden;
  opacity: 0;
}
.bar-green { --c: var(--sheet-green); }
.bar-teal { --c: var(--teal); }
.bar-red { --c: #b3453f; }
.bar-blue { --c: var(--doc-blue); }
.bar-slate { --c: #2a3446; }
.bar-mono { --c: #2a2f3a; font-family: ui-monospace, Consolas, monospace; }

/* Spreadsheet */
.grid {
  display: grid;
  grid-template-columns: 1.7fr 1fr 0.9fr;
  flex: 1;
  align-content: start;
  font-size: 0.85em;
}
.grid span {
  padding: 0.4em 0.7em;
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
  overflow: hidden;
}
.grid .h {
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  font-weight: 700;
}
.grid .warn {
  background: rgb(255 180 84 / 0.16);
  color: var(--color-accent-2);
}

/* Chat */
.chat {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.5em;
  padding: 0.8em;
  background: #0d1318;
  font-size: 0.85em;
}
.chat p {
  max-width: 82%;
  padding: 0.45em 0.7em;
  border-radius: 0.8em;
}
.chat .in {
  align-self: flex-start;
  background: var(--bubble-in);
  border-top-left-radius: 0.2em;
}
.chat .out {
  align-self: flex-end;
  background: var(--bubble-out);
  border-top-right-radius: 0.2em;
}

/* Calendar */
.cal {
  position: relative;
  flex: 1;
  margin: 0.6em 0.8em 0.8em 2em;
  font-size: 0.8em;
}
.hr {
  position: absolute;
  left: -1.8em;
  width: calc(100% + 1.8em);
  padding-top: 0.1em;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
}
.ev {
  position: absolute;
  overflow: hidden;
  padding: 0.3em 0.6em;
  border-radius: 0.5em;
  border-left: 0.25em solid rgb(255 255 255 / 0.5);
  white-space: nowrap;
}
.e1 { top: 20%; left: 0; width: 62%; height: 38%; background: #b3453f; }
.e2 { top: 36%; left: 30%; width: 66%; height: 34%; background: #2f62d9; }
.e3 { top: 50%; left: 8%; width: 56%; height: 36%; background: #6b4fbf; }

/* Document */
.page {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.5em;
  margin: 0.7em 1.2em 0;
  padding: 0.8em 1em;
  border-radius: 0.3em 0.3em 0 0;
  background: #eef0f4;
  color: #2a3040;
  font-size: 0.8em;
}
.page b {
  font-family: var(--font-heading);
  letter-spacing: 0.08em;
}
.page i {
  height: 0.45em;
  border-radius: 0.2em;
  background: #c8ccd6;
}
.page i.s {
  width: 60%;
}
.page .row {
  display: flex;
  justify-content: space-between;
  padding-block: 0.25em;
  border-bottom: 1px dashed #b5bac6;
}

/* Mail */
.badge-n {
  position: absolute;
  top: 50%;
  right: 0.7em;
  transform: translateY(-50%);
  padding: 0.05em 0.6em;
  border-radius: 999px;
  background: var(--mail-red);
  font-size: 0.9em;
  font-style: normal;
}
.mails {
  display: grid;
  flex: 1;
  align-content: start;
  font-size: 0.8em;
}
.mails li {
  display: grid;
  padding: 0.4em 0.9em;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
}
.mails li.unread {
  color: var(--color-text);
}
.mails li.unread b::before {
  content: '';
  display: inline-block;
  width: 0.55em;
  height: 0.55em;
  margin-right: 0.5em;
  border-radius: 50%;
  background: var(--mail-red);
}

/* Receipt */
.ticket {
  display: grid;
  flex: 1;
  align-content: start;
  gap: 0.35em;
  padding: 0.8em 1em;
  background: repeating-linear-gradient(0deg, transparent 0 1.6em, rgb(255 255 255 / 0.03) 1.6em 1.7em);
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.8em;
}
.ticket p {
  display: flex;
  justify-content: space-between;
  gap: 0.5em;
}
.ticket .total {
  margin-top: 0.4em;
  padding-top: 0.5em;
  border-top: 1px dashed var(--color-text-muted);
  color: var(--color-accent-2);
  font-size: 1.15em;
  font-weight: 700;
}

/* Sticky note. Base shows the clean panel. */
.face-note {
  background: var(--color-surface);
}
.note-a,
.note-b {
  position: absolute;
  inset: 0;
}
.note-a {
  visibility: hidden;
  opacity: 0;
  display: grid;
  place-items: center;
  padding: 0.9em;
  background: var(--paper);
  color: var(--ink);
  font-family: 'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive;
  font-size: 1.15em;
  line-height: 1.2;
  transform: rotate(0.01deg);
}
.tape {
  position: absolute;
  top: -0.4em;
  left: 50%;
  width: 3em;
  height: 1.1em;
  background: rgb(255 255 255 / 0.45);
  transform: translateX(-50%) rotate(-3deg);
}
.note-b {
  display: flex;
  flex-direction: column;
}
.note-b ul {
  display: grid;
  gap: 0.3em;
  padding: 0.5em 0.9em;
  font-size: 0.85em;
}
.note-b li::before {
  content: '';
  display: inline-block;
  width: 0.8em;
  height: 0.8em;
  margin-right: 0.5em;
  border: 1px solid var(--color-accent);
  border-radius: 0.2em;
  vertical-align: -0.1em;
}

/* Badge */
.badge {
  position: absolute;
  z-index: 3;
  top: 0;
  right: 1.2em;
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.45em 0.9em 0.45em 0.6em;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-size: clamp(0.75rem, calc(var(--u) * 1.5), 0.95rem);
  font-weight: 700;
  transform: translate3d(0, -50%, 40px);
  white-space: nowrap;
  box-shadow: 0 0.5em 1.5em var(--color-accent-glow);
}

/* ---------- Phone ---------- */
@media (max-width: 767px) {
  .v3 {
    --bw: calc(100vw - 2 * var(--gutter));
    --bh: clamp(210px, 38dvh, 340px);
    --u: calc(var(--bw) / 50);
  }
  .copy {
    top: calc(var(--header-height) + var(--space-2));
  }
  .eyebrow {
    margin-bottom: var(--space-2);
    font-size: 0.75rem;
  }
  .sub-a,
  .points,
  .copy::before {
    display: none;
  }
  .sub {
    margin-top: var(--space-3);
    font-size: var(--text-base);
  }
  .ctas {
    margin-top: var(--space-4);
  }
  .btn {
    min-height: 2.75rem;
    padding-inline: var(--space-4);
  }
  .side,
  .c-doc,
  .c-mail {
    display: none;
  }
  .topbar {
    height: 9%;
  }
  .c-sheet { --x: 3; --y: 11; --w: 60; --h: 36; }
  .c-note { --x: 65; --y: 11; --w: 32; --h: 36; }
  .c-chat { --x: 3; --y: 49; --w: 46; --h: 48; }
  .c-calendar { --x: 51; --y: 49; --w: 46; --h: 23; }
  .c-receipt { --x: 51; --y: 74; --w: 46; --h: 23; }
  .face {
    font-size: calc(var(--u) * 1.5);
  }
  .window {
    font-size: calc(var(--u) * 1.5);
  }
}

/* ---------- Reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .v3 {
    height: auto;
  }
  .bob {
    animation: none;
  }
}
</style>
