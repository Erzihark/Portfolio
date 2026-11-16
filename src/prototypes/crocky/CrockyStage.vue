<script setup lang="ts">
// Throwaway test page for crocky.glb. It loads the model and tests each animation.
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import {
    WebGLRenderer, Scene, PerspectiveCamera, Color, HemisphereLight, DirectionalLight,
    ACESFilmicToneMapping, SRGBColorSpace, Box3, Vector3, Quaternion, Euler, MathUtils,
    type Mesh, type Object3D, type Material, type MeshStandardMaterial, type Texture
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const host = ref<HTMLDivElement | null>(null);
const stats = reactive({ tris: 0, fps: 0, loadMs: 0, status: 'loading', nodes: [] as string[], missing: [] as string[] });
const state = reactive({ jawOpen: false, wire: false, normal: true });
const url = `${import.meta.env.BASE_URL}/models/crocky.glb`.replace(/\/{2,}/g, '/');

// Rest pose and animation state.
type Rig = { node: Object3D; rest: Quaternion };
const rig: Record<string, Rig> = {};
const sign: Record<string, number> = {};
const pose = { jaw: 0, jawTarget: 0, wave: -1 };
const blink = { l: -1, r: -1, nextAt: 0 };
const mouse = { x: 0, y: 0 };
const BLINK_MS = 220;
// Wave angles in degrees. The tick reads them each frame. The forward swing goes first.
const tune = reactive({ fwd: 0, up: 65, shake: 14 });
const D = MathUtils.degToRad(1);
let reduced = false;
const held: Record<string, number> = {}; // Held poses. Key is the pose name.

// Find a node by name or by name prefix.
function find(root: Object3D, name: string): Object3D | null {
    let hit: Object3D | null = null;
    root.traverse((o) => {
        if (!hit && (o.name === name || o.name.startsWith(name + '.') || o.name.startsWith(name + '_0'))) hit = o;
    });
    return hit;
}
// Apply a local rotation on top of the rest rotation.
function rot(key: string, x: number, y = 0, z = 0, order: 'XYZ' | 'ZYX' = 'XYZ') {
    const r = rig[key];
    if (!r) return;
    r.node.quaternion.copy(r.rest).multiply(new Quaternion().setFromEuler(new Euler(x, y, z, order)));
}
// Measure how the world centre of a node moves when it rotates. This finds the sign.
function shift(key: string, axis: 'x' | 'y' | 'z', angle: number) {
    const r = rig[key];
    const box = new Box3();
    const c0 = new Vector3();
    const c1 = new Vector3();
    r.node.updateWorldMatrix(true, true);
    box.setFromObject(r.node).getCenter(c0);
    const e = new Euler(axis === 'x' ? angle : 0, axis === 'y' ? angle : 0, axis === 'z' ? angle : 0);
    r.node.quaternion.copy(r.rest).multiply(new Quaternion().setFromEuler(e));
    r.node.updateWorldMatrix(true, true);
    box.setFromObject(r.node).getCenter(c1);
    r.node.quaternion.copy(r.rest);
    r.node.updateWorldMatrix(true, true);
    return c1.sub(c0);
}
// Pick the sign so that the world centre moves in the wanted direction.
function pickSign(key: string, axis: 'x' | 'y' | 'z', comp: 'x' | 'y' | 'z', want: 1 | -1) {
    if (!rig[key]) return;
    const d = shift(key, axis, 0.3)[comp];
    sign[`${key}.${axis}`] = Math.abs(d) < 1e-5 ? 1 : d * want > 0 ? 1 : -1;
}

const actions: Record<string, () => void> = { blink() {}, wink() {}, jaw() {}, wave() {}, wire() {}, normal() {} };
let cleanup = () => {};

onMounted(() => {
    const el = host.value!;
    const t0 = performance.now();
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.setClearColor(new Color('#07090D'));
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';

    const scene = new Scene();
    const camera = new PerspectiveCamera(35, 1, 0.05, 50);
    camera.position.set(1.4, 0.9, 3.2);
    scene.add(new HemisphereLight(0xcfe8ff, 0x1a2230, 1.2));
    const keyLight = new DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);
    const rim = new DirectionalLight(0x4ade9b, 1.6);
    rim.position.set(-3, 2, -3);
    scene.add(rim);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;

    const materials: MeshStandardMaterial[] = [];
    const normals = new Map<Material, Texture | null>();
    let model: Object3D | null = null;
    let restBodyY = 0;

    function resize() {
        const w = el.clientWidth || 1;
        const h = el.clientHeight || 1;
        renderer.setSize(w, h, false);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    function onMove(e: PointerEvent) {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener('pointermove', onMove);

    // Actions for the buttons.
    const holdMode = new URLSearchParams(location.search).get('hold') === '1';
    const toggleHold = (n: string) => { if (held[n]) delete held[n]; else held[n] = 1; };
    actions.blink = () => { if (holdMode) toggleHold('blink'); else blink.l = blink.r = performance.now(); };
    actions.wink = () => { if (holdMode) toggleHold('wink'); else { blink.l = performance.now(); blink.r = -1; } };
    actions.jaw = () => { state.jawOpen = !state.jawOpen; pose.jawTarget = state.jawOpen ? 1 : 0; };
    actions.wave = () => { if (holdMode) toggleHold('wave'); else pose.wave = performance.now(); };
    actions.wire = () => {
        state.wire = !state.wire;
        materials.forEach((m) => { m.wireframe = state.wire; });
    };
    actions.normal = () => {
        state.normal = !state.normal;
        materials.forEach((m) => { m.normalMap = state.normal ? (normals.get(m) ?? null) : null; m.needsUpdate = true; });
    };

    new GLTFLoader().load(
        url,
        (gltf) => {
            model = gltf.scene;
            scene.add(model);
            const names: string[] = [];
            model.traverse((o) => {
                names.push(`${(o as Mesh).isMesh ? 'Mesh' : 'Node'} ${o.name}`);
                const m = o as Mesh;
                if (m.isMesh) {
                    const list = Array.isArray(m.material) ? m.material : [m.material];
                    list.forEach((mat) => {
                        const s = mat as MeshStandardMaterial;
                        materials.push(s);
                        normals.set(s, s.normalMap);
                    });
                }
            });
            console.log('[crocky] nodes\n' + names.join('\n'));
            stats.nodes = names;

            const want = ['Crocky', 'Body', 'Head', 'Jaw', 'Arm_L', 'Arm_R', 'Tail', 'Leg_L', 'Leg_R',
                'Eye_L', 'Eye_R', 'Pupil_L', 'Pupil_R', 'Eyelid_L', 'Eyelid_R'];
            want.forEach((n) => {
                const node = find(model!, n);
                if (node) rig[n] = { node, rest: node.quaternion.clone() };
                else stats.missing.push(n);
            });
            if (rig.Body) restBodyY = rig.Body.node.position.y;

            model.updateWorldMatrix(true, true);
            // Find the correct sign of each rotation by testing.
            pickSign('Jaw', 'x', 'y', -1);        // open moves the jaw down
            pickSign('Eyelid_L', 'x', 'z', 1);    // close moves the lid forward (+z)
            pickSign('Eyelid_R', 'x', 'z', 1);
            pickSign('Pupil_L', 'y', 'x', 1);     // +yaw looks to +x
            pickSign('Pupil_L', 'x', 'y', 1);     // +pitch looks up
            pickSign('Head', 'y', 'x', 1);
            pickSign('Head', 'x', 'y', 1);
            pickSign('Arm_L', 'z', 'y', 1);       // wave raises the arm
            pickSign('Arm_L', 'x', 'z', 1);       // swing the arm forward (+z)
            console.log('[crocky] signs', JSON.stringify(sign));

            // Frame the whole character.
            const box = new Box3().setFromObject(model);
            const size = box.getSize(new Vector3());
            const centre = box.getCenter(new Vector3());
            const dist = ((Math.max(size.y, size.x) * 0.5) / Math.tan(MathUtils.degToRad(camera.fov / 2))) * 1.5;
            controls.target.copy(centre);
            camera.position.set(centre.x + dist * 0.45, centre.y + size.y * 0.15, centre.z + dist);
            controls.minDistance = dist * 0.4;
            controls.maxDistance = dist * 3;
            controls.update();

            stats.loadMs = Math.round(performance.now() - t0);
            stats.status = 'ready';
            blink.nextAt = holdMode ? 0 : performance.now() + 2000;
        },
        undefined,
        (err) => { stats.status = 'error: ' + (err as Error).message; console.error(err); }
    );

    const sg = (k: string) => sign[k] ?? 1;
    const ease = (t: number) => Math.sin(Math.PI * Math.min(Math.max(t, 0), 1)); // 0 to 1 to 0
    let last = performance.now();
    let frames = 0;
    let fpsT = last;
    let raf = 0;
    const gaze = { x: 0, y: 0 };

    function tick(now: number) {
        raf = requestAnimationFrame(tick);
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        frames++;
        if (now - fpsT > 500) { stats.fps = Math.round((frames * 1000) / (now - fpsT)); frames = 0; fpsT = now; }

        if (model) {
            const t = now / 1000;
            // Idle motion. It stops with reduced motion.
            if (!reduced) {
                if (rig.Body) rig.Body.node.position.y = restBodyY + Math.sin(t * 1.6) * 0.012;
                rot('Tail', 0, Math.sin(t * 1.1) * 0.25, 0);
                if (blink.nextAt > 0 && now > blink.nextAt) {
                    blink.l = blink.r = now;
                    blink.nextAt = now + 3000 + Math.random() * 3000;
                }
            }
            // Blink. 0 is open, 1 is closed. A wink closes half way.
            if (blink.l > 0 && now - blink.l > BLINK_MS) blink.l = -1;
            if (blink.r > 0 && now - blink.r > BLINK_MS) blink.r = -1;
            const both = blink.l > 0 && blink.r > 0;
            let lA = blink.l < 0 ? 0 : ease((now - blink.l) / BLINK_MS) * (both ? 1 : 0.5);
            let rA = blink.r < 0 ? 0 : ease((now - blink.r) / BLINK_MS);
            if (held.blink !== undefined) { lA = rA = held.blink; }
            else if (held.wink !== undefined) { lA = held.wink * 0.5; rA = 0; }
            const FULL = MathUtils.degToRad(112);
            rot('Eyelid_L', sg('Eyelid_L.x') * lA * FULL);
            rot('Eyelid_R', sg('Eyelid_R.x') * rA * FULL);

            // Jaw.
            pose.jaw += (pose.jawTarget - pose.jaw) * Math.min(1, dt * 12);
            rot('Jaw', sg('Jaw.x') * pose.jaw * MathUtils.degToRad(30));

            // Pupils and head follow the cursor.
            const k = Math.min(1, dt * 8);
            gaze.x += ((reduced ? 0 : mouse.x) - gaze.x) * k;
            gaze.y += ((reduced ? 0 : mouse.y) - gaze.y) * k;
            const lim = MathUtils.degToRad(22);
            const px = Math.max(-1, Math.min(1, gaze.x)) * lim;
            const py = Math.max(-1, Math.min(1, -gaze.y)) * lim * 0.7;
            rot('Pupil_L', sg('Pupil_L.x') * py, sg('Pupil_L.y') * px);
            rot('Pupil_R', sg('Pupil_L.x') * py, sg('Pupil_L.y') * px);
            rot('Head',
                sg('Head.x') * -gaze.y * MathUtils.degToRad(10),
                sg('Head.y') * gaze.x * MathUtils.degToRad(18));

            // Wave. The arm goes up and shakes for 1.6 s.
            if (rig.Arm_L && held.wave !== undefined) {
                rot('Arm_L', sg('Arm_L.x') * held.wave * tune.fwd * D, 0, sg('Arm_L.z') * held.wave * tune.up * D, 'ZYX');
            } else if (rig.Arm_L) {
                const w = pose.wave > 0 ? (now - pose.wave) / 1600 : 2;
                if (w >= 1) {
                    pose.wave = -1;
                    rot('Arm_L', 0);
                } else {
                    const up = Math.min(1, w * 6, (1 - w) * 6);
                    const shake = Math.sin(w * Math.PI * 8) * tune.shake;
                    rot('Arm_L', sg('Arm_L.x') * up * tune.fwd * D, 0, sg('Arm_L.z') * up * (tune.up + shake) * D, 'ZYX');
                }
            }
        }
        controls.update();
        renderer.render(scene, camera);
        stats.tris = renderer.info.render.triangles;
    }
    raf = requestAnimationFrame(tick);

    // Debug hook for this prototype only.
    (window as any).__crocky = {
        rig, sign, tune, camera,
        setPose(name: 'blink' | 'wink' | 'wave' | 'jaw', amount: number) {
            if (name === 'jaw') { pose.jawTarget = amount; state.jawOpen = amount > 0; return; }
            if (amount > 0) held[name] = Math.min(1, amount); else delete held[name];
        }
    };

    cleanup = () => {
        delete (window as any).__crocky;
        cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', onMove);
        ro.disconnect();
        controls.dispose();
        scene.traverse((o) => {
            const m = o as Mesh;
            if (m.isMesh) {
                m.geometry.dispose();
                (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => {
                    Object.values(mat).forEach((v) => { if (v && (v as Texture).isTexture) (v as Texture).dispose(); });
                    mat.dispose();
                });
            }
        });
        renderer.dispose();
        renderer.domElement.remove();
    };
});

onBeforeUnmount(() => cleanup());
</script>

<template>
    <div class="cs">
        <div ref="host" class="cs__view" role="img" aria-label="Crocky 3D model"></div>

        <div class="cs__bar" role="toolbar" aria-label="Crocky controls">
            <button type="button" @click="actions.blink()">Blink</button>
            <button type="button" @click="actions.wink()">Wink left</button>
            <button type="button" :aria-pressed="state.jawOpen" @click="actions.jaw()">
                {{ state.jawOpen ? 'Close jaw' : 'Open jaw' }}
            </button>
            <button type="button" @click="actions.wave()">Wave</button>
            <button type="button" :aria-pressed="state.wire" @click="actions.wire()">Wireframe</button>
            <button type="button" :aria-pressed="!state.normal" @click="actions.normal()">
                Normal map: {{ state.normal ? 'on' : 'off' }}
            </button>
        </div>

        <aside class="cs__stats" aria-label="Stats">
            <p><b>{{ stats.status }}</b></p>
            <p>tris {{ stats.tris }} · {{ stats.fps }} fps · load {{ stats.loadMs }} ms</p>
            <p v-if="stats.missing.length" class="cs__warn">missing: {{ stats.missing.join(', ') }}</p>
            <details>
                <summary>nodes ({{ stats.nodes.length }})</summary>
                <ul>
                    <li v-for="(n, i) in stats.nodes" :key="i">{{ n }}</li>
                </ul>
            </details>
        </aside>
    </div>
</template>

<style scoped>
.cs { position: fixed; inset: 0; background: #07090d; color: #dfe7ee; font: 13px/1.4 system-ui, sans-serif; }
.cs__view { position: absolute; inset: 0; }
.cs__bar { position: absolute; left: 16px; right: 16px; bottom: 16px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.cs__bar button {
    background: rgba(7, 9, 13, 0.8); color: #dfe7ee; border: 1px solid #2a3340; border-radius: 8px;
    padding: 8px 14px; cursor: pointer; font: inherit;
}
.cs__bar button:hover { border-color: #4ade9b; }
.cs__bar button:focus-visible { outline: 2px solid #4ade9b; outline-offset: 2px; }
.cs__bar button[aria-pressed='true'] { border-color: #4ade9b; color: #4ade9b; }
.cs__stats {
    position: absolute; top: 12px; left: 12px; max-width: min(320px, calc(100vw - 24px)); max-height: 60vh; overflow: auto;
    background: rgba(7, 9, 13, 0.75); border: 1px solid #2a3340; border-radius: 8px; padding: 8px 12px;
    font-family: ui-monospace, monospace; font-size: 12px;
}
.cs__stats p { margin: 0 0 4px; }
.cs__stats ul { margin: 4px 0 0; padding-left: 16px; }
.cs__warn { color: #ff9b6b; }
</style>
