// @ts-nocheck (no @types/three in this project; the other prototypes are .vue files and are not type checked)
// THROWAWAY PROTOTYPE. Shared, non-layout module.
// It loads crocky.glb, drives the rig and disposes everything.
import {
    WebGLRenderer, Scene, PerspectiveCamera, Group, HemisphereLight, DirectionalLight,
    ACESFilmicToneMapping, SRGBColorSpace, Quaternion, Euler, MathUtils, Vector3,
    type Mesh, type Object3D, type Texture
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ---- Copy (real text, used by all variants) ----
export const COPY = {
    heading: 'Tecnología a la medida de tu negocio, no al revés.',
    sub: 'Tú me cuentas el problema. Yo encuentro la solución correcta y la construyo: a veces es automatizar, a veces conectar lo que ya usas, a veces una app nueva.',
    cta1: { label: 'Cuéntame tu problema', href: '#contacto' },
    cta2: { label: 'Ver cómo trabajo', href: '#proceso' },
    trust: [
        'Más de 5 años en empresas de EE. UU. y México',
        'Trabajas directamente con quien lo construye',
        'Sin tecnicismos'
    ],
    greeting: '¡Hola! Soy Crocky. ¿Qué te gustaría resolver?',
    services: [
        { title: 'Sistemas internos y automatización', text: 'Deja Excel, WhatsApp y las tareas repetidas. Un solo sistema para tu equipo.', say: '¿Tu equipo vive en hojas de cálculo? Lo ordenamos.' },
        { title: 'Apps y productos nuevos', text: 'De la idea a una app en iOS, Android y web.', say: '¿Tienes una idea? Empecemos por lo más simple.' },
        { title: 'Mejorar el software que ya tienes', text: 'Más rápido, más estable y más fácil de mantener.', say: '¿Tu sistema va lento? Lo afinamos.' },
        { title: 'Experiencias interactivas', text: 'Contenido 2D, 3D y AR que la gente quiere tocar.', say: '¿Quieres que tu marca se pueda tocar? Lo hacemos 3D.' }
    ]
};

// ---- Session flag (dismissed Crocky) ----
const FLAG = 'proto-crocky-hidden';
export function readHidden(): boolean {
    try { return sessionStorage.getItem(FLAG) === '1'; } catch { return false; }
}
export function writeHidden(v: boolean) {
    try { if (v) sessionStorage.setItem(FLAG, '1'); else sessionStorage.removeItem(FLAG); } catch { /* ignore */ }
}
export const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Stage ----
export interface View { pos: [number, number, number]; target: [number, number, number]; fov?: number }
export interface CrockyStage {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    /** Group that holds the model. Move or hide it here. */
    root: Group;
    /** Resolves true when the model is loaded, false on error. */
    ready: Promise<boolean>;
    setView(v: View): void;
    /** Fraction of the width to move the scene right (negative: left). */
    setShift(frac: number): void;
    /** Called after each resize with the canvas size. */
    onResize: ((w: number, h: number) => void) | null;
    /** Called each frame with dt (s) and time (ms). */
    onFrame: ((dt: number, now: number) => void) | null;
    /** Look at a screen direction. x right +, y down +, range -1..1. null: follow the cursor. */
    setGaze(x: number | null, y?: number): void;
    followCursor: boolean;
    /** gaze 'local' mode only: look at the centre of this element instead of the cursor. */
    aimTarget: HTMLElement | null;
    /** Happy pet reaction (eyes close, head tilt, small bounce). Calls in the middle restart it smoothly. */
    pet(): void;
    wave(): void;
    jaw(ms?: number): void;
    blink(): void;
    dispose(): void;
}

type Rig = { node: Object3D; rest: Quaternion };
const D = MathUtils.degToRad(1);
const BLINK_MS = 220;
const url = `${import.meta.env.BASE_URL}/models/crocky.glb`.replace(/\/{2,}/g, '/');

function find(root: Object3D, name: string): Object3D | null {
    let hit: Object3D | null = null;
    root.traverse((o) => {
        if (!hit && (o.name === name || o.name.startsWith(name + '.') || o.name.startsWith(name + '_0'))) hit = o;
    });
    return hit;
}

/** Returns null if WebGL is not available. */
export function createCrockyStage(host: HTMLElement, view: View, opts: { model?: boolean; gaze?: 'window' | 'local' } = {}): CrockyStage | null {
    const reduced = prefersReduced();
    let renderer: WebGLRenderer;
    try {
        renderer = new WebGLRenderer({ antialias: true, alpha: true });
    } catch {
        return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.cssText = 'display:block;width:100%;height:100%';
    host.appendChild(canvas);

    const scene = new Scene();
    const camera = new PerspectiveCamera(view.fov ?? 32, 1, 0.05, 60);
    const root = new Group();
    scene.add(root);
    scene.add(new HemisphereLight(0xcfe8ff, 0x1a2230, 1.2));
    const key = new DirectionalLight(0xffffff, 2.6);
    key.position.set(2, 3, 3);
    scene.add(key);
    const rim = new DirectionalLight(0x4ade9b, 1.6);
    rim.position.set(-3, 2, -3);
    scene.add(rim);

    let target = new Vector3();
    let shift = 0;
    let rw = 1;
    let rh = 1;
    const applyView = (v: View) => {
        camera.position.set(...v.pos);
        target = new Vector3(...v.target);
        if (v.fov) camera.fov = v.fov;
        camera.lookAt(target);
        camera.updateProjectionMatrix();
        applyShift();
    };
    function applyShift() {
        if (shift) camera.setViewOffset(rw, rh, -rw * shift, 0, rw, rh);
        else camera.clearViewOffset();
    }

    const stage: CrockyStage = {
        scene, camera, renderer, root,
        ready: Promise.resolve(false),
        setView: (v) => { applyView(v); resize(); },
        setShift: (f) => { shift = f; applyShift(); camera.updateProjectionMatrix(); },
        onResize: null,
        onFrame: null,
        followCursor: !reduced,
        aimTarget: null,
        pet() { petS.until = performance.now() + 900; },
        setGaze(x, y = 0) {
            if (x === null) gazeOverride = null;
            else gazeOverride = { x, y };
        },
        wave() { pose.wave = performance.now(); },
        jaw(ms = 700) { pose.jawTarget = 1; window.clearTimeout(jawTimer); jawTimer = window.setTimeout(() => { pose.jawTarget = 0; }, ms); },
        blink() { blink.l = blink.r = performance.now(); },
        dispose
    };

    function resize() {
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        rw = w; rh = h;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        applyShift();
        camera.updateProjectionMatrix();
        stage.onResize?.(w, h);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const mouse = { x: 0, y: 0 };
    const cursor = { x: 0, y: 0, in: false };
    const petS = { until: 0, amt: 0 };
    const onMove = (e: PointerEvent) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
        cursor.x = e.clientX;
        cursor.y = e.clientY;
        cursor.in = true;
    };
    const onOut = () => { cursor.in = false; };
    window.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('pointerleave', onOut);
    window.addEventListener('blur', onOut);

    applyView(view);
    resize();

    // Rig state.
    const rig: Record<string, Rig> = {};
    const pose = { jaw: 0, jawTarget: 0, wave: -1 };
    const blink = { l: -1, r: -1, nextAt: 0 };
    const gaze = { x: 0, y: 0 };
    let gazeOverride: { x: number; y: number } | null = null;
    let jawTimer = 0;
    let model: Object3D | null = null;
    let restBodyY = 0;
    let disposed = false;

    function rot(key: string, x: number, y = 0, z = 0, order: 'XYZ' | 'ZYX' = 'XYZ') {
        const r = rig[key];
        if (!r) return;
        r.node.quaternion.copy(r.rest).multiply(new Quaternion().setFromEuler(new Euler(x, y, z, order)));
    }

    stage.ready = new Promise<boolean>((resolve) => {
        if (opts.model === false) { resolve(true); return; }
        new GLTFLoader().load(
            url,
            (gltf) => {
                if (disposed) { resolve(false); return; }
                model = gltf.scene;
                root.add(model);
                ['Crocky', 'Body', 'Head', 'Jaw', 'Arm_L', 'Arm_R', 'Tail', 'Eyelid_L', 'Eyelid_R', 'Pupil_L', 'Pupil_R'].forEach((n) => {
                    const node = find(model!, n);
                    if (node) rig[n] = { node, rest: node.quaternion.clone() };
                });
                if (rig.Body) restBodyY = rig.Body.node.position.y;
                blink.nextAt = reduced ? 0 : performance.now() + 1500;
                resolve(true);
            },
            undefined,
            () => resolve(false)
        );
    });

    const ease = (t: number) => Math.sin(Math.PI * Math.min(Math.max(t, 0), 1));
    let last = performance.now();
    let raf = 0;
    function tick(now: number) {
        raf = requestAnimationFrame(tick);
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        stage.onFrame?.(dt, now);
        if (model && root.visible) {
            const t = now / 1000;
            // Pet state. The amount follows a target, so a new pet never snaps.
            petS.amt += ((now < petS.until ? 1 : 0) - petS.amt) * (1 - Math.exp(-9 * dt));
            const pa = petS.amt;
            const osc = Math.sin(t * 2 * Math.PI * 2.2) * pa;
            if (!reduced) {
                if (rig.Body) rig.Body.node.position.y = restBodyY + Math.sin(t * 1.6) * 0.012 + Math.max(0, osc) * 0.03;
                rot('Tail', 0, Math.sin(t * 1.1) * 0.25 + Math.sin(t * 14) * 0.4 * pa, 0);
                root.scale.set(1 + 0.025 * osc, 1 - 0.04 * osc, 1 + 0.025 * osc);
                if (blink.nextAt > 0 && now > blink.nextAt) {
                    blink.l = blink.r = now;
                    blink.nextAt = now + 3000 + Math.random() * 3000;
                }
            }
            if (blink.l > 0 && now - blink.l > BLINK_MS) blink.l = -1;
            if (blink.r > 0 && now - blink.r > BLINK_MS) blink.r = -1;
            const a = Math.max(blink.l < 0 ? 0 : ease((now - blink.l) / BLINK_MS), pa * 0.75);
            rot('Eyelid_L', a * 112 * D);
            rot('Eyelid_R', a * 112 * D);

            pose.jaw += (pose.jawTarget - pose.jaw) * Math.min(1, dt * 12);
            rot('Jaw', pose.jaw * 30 * D);

            let tx = 0;
            let ty = 0;
            if (gazeOverride) {
                tx = gazeOverride.x;
                ty = gazeOverride.y;
            } else if (opts.gaze === 'local') {
                // Aim from the centre of the host. Inside the circle: offset / radius. Outside: same, length capped at 1.
                const r = host.getBoundingClientRect();
                const R = Math.max(1, Math.min(r.width, r.height) / 2);
                let sx: number | null = null;
                let sy = 0;
                if (stage.aimTarget) {
                    const a = stage.aimTarget.getBoundingClientRect();
                    sx = a.left + a.width / 2;
                    sy = a.top + a.height / 2;
                } else if (stage.followCursor && cursor.in) {
                    sx = cursor.x;
                    sy = cursor.y;
                }
                if (sx !== null) {
                    let gx = (sx - (r.left + r.width / 2)) / R;
                    let gy = (sy - (r.top + r.height / 2)) / R;
                    const len = Math.hypot(gx, gy);
                    if (len > 1) { gx /= len; gy /= len; }
                    tx = gx;
                    ty = gy;
                }
            } else if (stage.followCursor) {
                tx = mouse.x;
                ty = mouse.y;
            }
            const k = 1 - Math.exp(-12 * dt);
            gaze.x += (tx - gaze.x) * k;
            gaze.y += (ty - gaze.y) * k;
            const lim = 22 * D;
            const px = Math.max(-1, Math.min(1, gaze.x)) * lim;
            const py = Math.max(-1, Math.min(1, -gaze.y)) * lim * 0.7;
            rot('Pupil_L', -py, px);
            rot('Pupil_R', -py, px);
            const tilt = reduced ? 0 : pa;
            rot('Head', gaze.y * 10 * D - tilt * 6 * D, MathUtils.clamp(gaze.x * 18 * D, -35 * D, 35 * D), tilt * 7 * D); // head yaw limit: 35 deg

            if (rig.Arm_L) {
                const w = pose.wave > 0 ? (now - pose.wave) / 1600 : 2;
                if (w >= 1) {
                    pose.wave = -1;
                    rot('Arm_L', 0);
                } else {
                    const up = Math.min(1, w * 6, (1 - w) * 6);
                    const shake = Math.sin(w * Math.PI * 8) * 14;
                    rot('Arm_L', 0, 0, up * (65 + shake) * D, 'ZYX');
                }
            }
        }
        renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(tick);

    function dispose() {
        if (disposed) return;
        disposed = true;
        cancelAnimationFrame(raf);
        window.clearTimeout(jawTimer);
        window.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('pointerleave', onOut);
        window.removeEventListener('blur', onOut);
        ro.disconnect();
        stage.onFrame = null;
        stage.onResize = null;
        scene.traverse((o) => {
            const m = o as Mesh;
            const geo = (m as any).geometry;
            if (geo) geo.dispose();
            const mat = (m as any).material;
            if (mat) {
                (Array.isArray(mat) ? mat : [mat]).forEach((mm) => {
                    Object.values(mm).forEach((v) => { if (v && (v as Texture).isTexture) (v as Texture).dispose(); });
                    mm.dispose();
                });
            }
        });
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
    }
    return stage;
}
