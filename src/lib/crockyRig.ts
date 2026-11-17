// Three.js stage and Crocky rig.
// A stage owns one renderer, one scene and one render loop.
// The loop pauses when the host is off screen or the tab is hidden.
import {
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    Group,
    HemisphereLight,
    DirectionalLight,
    ACESFilmicToneMapping,
    SRGBColorSpace,
    Quaternion,
    Euler,
    MathUtils,
    Vector3,
    type Mesh,
    type Material,
    type Object3D,
    type Texture
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Session flag: the visitor closed Crocky.
const FLAG = 'crocky-hidden';
export function readHidden(): boolean {
    try {
        return sessionStorage.getItem(FLAG) === '1';
    } catch {
        return false;
    }
}
export function writeHidden(v: boolean): void {
    try {
        if (v) sessionStorage.setItem(FLAG, '1');
        else sessionStorage.removeItem(FLAG);
    } catch {
        /* Storage can be blocked. Ignore it. */
    }
}
export const prefersReduced = (): boolean =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface View {
    pos: [number, number, number];
    target: [number, number, number];
    fov?: number;
}

export interface Stage {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    // Resolves true when the model is loaded, false on error.
    ready: Promise<boolean>;
    // Fraction of the width to move the scene right (negative: left).
    setShift(frac: number): void;
    // Called after each resize with the canvas size.
    onResize: ((w: number, h: number) => void) | null;
    // Called each frame with dt (s) and time (ms).
    onFrame: ((dt: number, now: number) => void) | null;
    followCursor: boolean;
    // Mode 'local' only: look at the centre of this element instead of the cursor.
    aimTarget: HTMLElement | null;
    pet(): void;
    jaw(ms?: number): void;
    blink(): void;
    dispose(): void;
}

interface RigNode {
    node: Object3D;
    rest: Quaternion;
}

const D = MathUtils.degToRad(1);
const BLINK_MS = 220;
const MODEL_URL = `${import.meta.env.BASE_URL}/models/crocky.glb`.replace(/\/{2,}/g, '/');
const RIG_NAMES = [
    'Crocky',
    'Body',
    'Head',
    'Jaw',
    'Arm_L',
    'Arm_R',
    'Tail',
    'Eyelid_L',
    'Eyelid_R',
    'Pupil_L',
    'Pupil_R'
];

function find(root: Object3D, name: string): Object3D | null {
    let hit = null as Object3D | null;
    root.traverse((o) => {
        if (!hit && (o.name === name || o.name.startsWith(name + '.') || o.name.startsWith(name + '_0'))) {
            hit = o;
        }
    });
    return hit;
}

export interface StageOptions {
    // false: no model (builds only).
    model?: boolean;
    // 'local': aim from the centre of the host. 'window': aim from the window centre.
    gaze?: 'window' | 'local';
}

// Return null when WebGL is not available.
export function createStage(host: HTMLElement, view: View, opts: StageOptions = {}): Stage | null {
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

    let shift = 0;
    let rw = 1;
    let rh = 1;
    function applyShift() {
        if (shift) camera.setViewOffset(rw, rh, -rw * shift, 0, rw, rh);
        else camera.clearViewOffset();
    }
    camera.position.set(...view.pos);
    camera.lookAt(new Vector3(...view.target));
    camera.updateProjectionMatrix();

    const mouse = { x: 0, y: 0 };
    const cursor = { x: 0, y: 0, in: false };
    const petS = { until: 0, amt: 0 };
    const pose = { jaw: 0, jawTarget: 0 };
    const blink = { l: -1, r: -1, nextAt: 0 };
    const gaze = { x: 0, y: 0 };
    const rig: Record<string, RigNode> = {};
    let jawTimer = 0;
    let model: Object3D | null = null;
    let restBodyY = 0;
    let disposed = false;

    const stage: Stage = {
        scene,
        camera,
        renderer,
        ready: Promise.resolve(false),
        setShift: (f) => {
            shift = f;
            applyShift();
            camera.updateProjectionMatrix();
        },
        onResize: null,
        onFrame: null,
        followCursor: !reduced,
        aimTarget: null,
        pet() {
            petS.until = performance.now() + 900;
        },
        jaw(ms = 700) {
            pose.jawTarget = 1;
            window.clearTimeout(jawTimer);
            jawTimer = window.setTimeout(() => {
                pose.jawTarget = 0;
            }, ms);
        },
        blink() {
            blink.l = blink.r = performance.now();
        },
        dispose
    };

    function resize() {
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        rw = w;
        rh = h;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        applyShift();
        camera.updateProjectionMatrix();
        stage.onResize?.(w, h);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const onMove = (e: PointerEvent) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
        cursor.x = e.clientX;
        cursor.y = e.clientY;
        cursor.in = true;
    };
    const onOut = () => {
        cursor.in = false;
    };
    if (opts.model !== false) {
        window.addEventListener('pointermove', onMove);
        document.documentElement.addEventListener('pointerleave', onOut);
        window.addEventListener('blur', onOut);
    }
    resize();

    function rot(name: string, x: number, y = 0, z = 0, order: 'XYZ' | 'ZYX' = 'XYZ') {
        const r = rig[name];
        if (!r) return;
        r.node.quaternion.copy(r.rest).multiply(new Quaternion().setFromEuler(new Euler(x, y, z, order)));
    }

    stage.ready = new Promise<boolean>((resolve) => {
        if (opts.model === false) {
            resolve(true);
            return;
        }
        new GLTFLoader().load(
            MODEL_URL,
            (gltf) => {
                if (disposed) {
                    resolve(false);
                    return;
                }
                model = gltf.scene;
                root.add(model);
                RIG_NAMES.forEach((n) => {
                    const node = find(gltf.scene, n);
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

    const pulse = (t: number) => Math.sin(Math.PI * Math.min(Math.max(t, 0), 1));

    function animateModel(now: number, dt: number) {
        const t = now / 1000;
        // The pet amount follows a target, so a new pet never snaps.
        petS.amt += ((now < petS.until ? 1 : 0) - petS.amt) * (1 - Math.exp(-9 * dt));
        const pa = petS.amt;
        const osc = Math.sin(t * 2 * Math.PI * 2.2) * pa;
        if (!reduced) {
            if (rig.Body) {
                rig.Body.node.position.y = restBodyY + Math.sin(t * 1.6) * 0.012 + Math.max(0, osc) * 0.03;
            }
            rot('Tail', 0, Math.sin(t * 1.1) * 0.25 + Math.sin(t * 14) * 0.4 * pa, 0);
            root.scale.set(1 + 0.025 * osc, 1 - 0.04 * osc, 1 + 0.025 * osc);
            if (blink.nextAt > 0 && now > blink.nextAt) {
                blink.l = blink.r = now;
                blink.nextAt = now + 3000 + Math.random() * 3000;
            }
        }
        if (blink.l > 0 && now - blink.l > BLINK_MS) blink.l = -1;
        if (blink.r > 0 && now - blink.r > BLINK_MS) blink.r = -1;
        const lid = Math.max(blink.l < 0 ? 0 : pulse((now - blink.l) / BLINK_MS), pa * 0.75);
        rot('Eyelid_L', lid * 112 * D);
        rot('Eyelid_R', lid * 112 * D);

        pose.jaw += (pose.jawTarget - pose.jaw) * Math.min(1, dt * 12);
        rot('Jaw', pose.jaw * 30 * D);

        let tx = 0;
        let ty = 0;
        if (opts.gaze === 'local') {
            // Aim from the centre of the host. The length of the vector is at most 1.
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
                if (len > 1) {
                    gx /= len;
                    gy /= len;
                }
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
        // Head yaw limit: 35 degrees.
        rot('Head', gaze.y * 10 * D - tilt * 6 * D, MathUtils.clamp(gaze.x * 18 * D, -35 * D, 35 * D), tilt * 7 * D);
    }

    // Render loop. It runs only when the host is visible and the tab is active.
    let last = performance.now();
    let raf = 0;
    let inView = true;
    function tick(now: number) {
        raf = requestAnimationFrame(tick);
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        stage.onFrame?.(dt, now);
        if (model) animateModel(now, dt);
        renderer.render(scene, camera);
    }
    function sync() {
        const run = inView && !document.hidden && !disposed;
        if (run && !raf) {
            last = performance.now();
            raf = requestAnimationFrame(tick);
        } else if (!run && raf) {
            cancelAnimationFrame(raf);
            raf = 0;
        }
    }
    const io = new IntersectionObserver((entries) => {
        const e = entries[entries.length - 1];
        if (e) {
            inView = e.isIntersecting;
            sync();
        }
    });
    io.observe(host);
    document.addEventListener('visibilitychange', sync);
    sync();

    function dispose() {
        if (disposed) return;
        disposed = true;
        sync();
        window.clearTimeout(jawTimer);
        window.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('pointerleave', onOut);
        window.removeEventListener('blur', onOut);
        document.removeEventListener('visibilitychange', sync);
        io.disconnect();
        ro.disconnect();
        stage.onFrame = null;
        stage.onResize = null;
        scene.traverse((o) => {
            const m = o as Mesh;
            m.geometry?.dispose();
            const mat = m.material as Material | Material[] | undefined;
            if (mat) {
                (Array.isArray(mat) ? mat : [mat]).forEach((mm) => {
                    Object.values(mm).forEach((v) => {
                        if (v && (v as Texture).isTexture) (v as Texture).dispose();
                    });
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
