// The four low-poly builds of the hero: dashboard, phone, speed gauge, 3D object.
// One build shows at a time. It assembles, holds, then comes apart.
import {
    BoxGeometry,
    TorusGeometry,
    CylinderGeometry,
    IcosahedronGeometry,
    OctahedronGeometry,
    EdgesGeometry,
    Mesh,
    LineSegments,
    Group,
    Vector3,
    Euler,
    MathUtils,
    type BufferGeometry
} from 'three';
import type { Stage } from './crockyRig';
import { createMats, createBench, ease } from './threeKit';

interface Piece {
    g: Group;
    to: Vector3;
    toRot: Euler;
    from: Vector3;
    spin: number;
    delay: number;
}
interface Build {
    group: Group;
    pieces: Piece[];
    tick?: (t: number, done: boolean) => void;
}

const A = 2.6; // assemble seconds
const H = 3.4; // hold seconds
const O = 0.9; // take apart seconds
export const TOTAL = A + H + O;

export interface HeroBuilds {
    // Show build i and restart its timeline.
    set(i: number): void;
    // Advance the timeline. Return the progress (0..1) of the current build.
    frame(dt: number, play: boolean): number;
    // True when the current build reached its end.
    finished(): boolean;
    // Fit the camera and the builds to the canvas size.
    layout(w: number, h: number): void;
}

export function createHeroBuilds(stage: Stage, reduced: boolean): HeroBuilds {
    const s = stage;
    const mats = createMats();
    const { faceMat, lineMat, accentMat } = mats;
    createBench(s.scene, 3.2, 1.8, mats);

    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

    function makeBuild(): Build {
        const group = new Group();
        group.visible = false;
        s.scene.add(group);
        return { group, pieces: [] };
    }
    function add(
        b: Build,
        geo: BufferGeometry,
        x: number,
        y: number,
        z: number,
        rot: [number, number, number] = [0, 0, 0],
        opts: { amber?: boolean; spin?: number } = {}
    ): Piece {
        const g = new Group();
        g.add(new Mesh(geo, faceMat));
        g.add(new LineSegments(new EdgesGeometry(geo, 12), opts.amber ? accentMat : lineMat));
        const to = new Vector3(x, y, z);
        // Pieces start close above the target, so they stay in frame.
        const from = new Vector3(x + rnd() * 0.9, y + 0.5 + Math.abs(rnd()) * 0.5, z + rnd() * 0.6);
        g.position.copy(from);
        g.scale.setScalar(0.0001);
        b.group.add(g);
        const p: Piece = {
            g,
            to,
            toRot: new Euler(...rot),
            from,
            spin: opts.spin ?? 2.4,
            delay: b.pieces.length
        };
        b.pieces.push(p);
        return p;
    }
    const box = (w: number, h: number, d: number) => new BoxGeometry(w, h, d);
    const plate = (b: Build, w: number, d: number) => add(b, box(w, 0.02, d), 0, 0.01, 0);

    // 1. Dashboard panel.
    const b1 = makeBuild();
    plate(b1, 0.6, 0.28);
    add(b1, box(0.05, 0.26, 0.05), 0, 0.15, 0);
    add(b1, box(1.0, 0.62, 0.03), 0, 0.53, 0);
    add(b1, box(0.92, 0.06, 0.012), 0, 0.75, 0.02);
    [0.12, 0.22, 0.17, 0.3].forEach((h, i) =>
        add(b1, box(0.08, h, 0.02), -0.38 + i * 0.12, 0.29 + h / 2, 0.03)
    );
    add(b1, new TorusGeometry(0.13, 0.014, 6, 20), 0.3, 0.5, 0.025);
    add(b1, box(0.3, 0.03, 0.012), 0.3, 0.68, 0.02, [0, 0, 0], { amber: true });

    // 2. Phone.
    const b2 = makeBuild();
    plate(b2, 0.6, 0.3);
    add(b2, box(0.4, 0.78, 0.05), 0, 0.41, 0);
    add(b2, box(0.34, 0.62, 0.012), 0, 0.45, 0.03);
    [0.64, 0.5, 0.36].forEach((y) => add(b2, box(0.26, 0.07, 0.012), 0, y, 0.04));
    add(b2, box(0.1, 0.014, 0.012), 0, 0.77, 0.03);
    add(b2, new CylinderGeometry(0.028, 0.028, 0.014, 12), 0, 0.12, 0.035, [Math.PI / 2, 0, 0], {
        amber: true
    });

    // 3. Speed gauge.
    const b3 = makeBuild();
    plate(b3, 0.8, 0.3);
    add(b3, new TorusGeometry(0.38, 0.02, 6, 24, Math.PI), 0, 0.12, 0);
    for (let i = 0; i < 7; i++) {
        const a = Math.PI * (i / 6);
        add(b3, box(0.02, 0.07, 0.02), Math.cos(a) * 0.3, 0.12 + Math.sin(a) * 0.3, 0, [
            0,
            0,
            a - Math.PI / 2
        ]);
    }
    add(b3, new CylinderGeometry(0.045, 0.045, 0.03, 12), 0, 0.12, 0, [Math.PI / 2, 0, 0]);
    const needleGeo = box(0.3, 0.02, 0.02);
    needleGeo.translate(0.14, 0, 0);
    const needle = add(b3, needleGeo, 0, 0.12, 0, [0, 0, Math.PI], { amber: true });
    b3.tick = (t, done) => {
        if (!done || reduced) return;
        const k = 0.5 - 0.5 * Math.cos(Math.min(1, t / 1.6) * Math.PI);
        needle.g.rotation.z = Math.PI * (1 - 0.85 * k) + Math.sin(t * 9) * 0.015 * k;
    };

    // 4. Small interactive 3D object.
    const b4 = makeBuild();
    plate(b4, 0.6, 0.4);
    add(b4, new CylinderGeometry(0.12, 0.15, 0.1, 8), 0, 0.07, 0);
    const ico = add(b4, new IcosahedronGeometry(0.22, 0), 0, 0.38, 0);
    const orbitRing = add(b4, new TorusGeometry(0.34, 0.008, 4, 32), 0, 0.38, 0, [Math.PI / 2.3, 0, 0]);
    const sat = add(b4, new OctahedronGeometry(0.05, 0), 0.34, 0.38, 0, [0, 0, 0], { amber: true });
    b4.tick = (t, done) => {
        if (!done || reduced) return;
        ico.g.rotation.y = t * 0.9;
        ico.g.rotation.x = t * 0.35;
        orbitRing.g.rotation.z = t * 0.4;
        const a = t * 1.5;
        sat.g.position.set(Math.cos(a) * 0.34, 0.38 + Math.sin(a * 0.7) * 0.07, Math.sin(a) * 0.34);
    };
    const builds = [b1, b2, b3, b4];

    let bt = reduced ? A + 0.2 : 0;
    let current = 0;

    function place(scale: number) {
        builds.forEach((b) => {
            b.group.position.set(0, 0, 0);
            b.group.rotation.y = -0.3;
            b.group.scale.setScalar(b === b2 ? scale * 1.25 : scale);
        });
    }
    function apply() {
        builds.forEach((b, bi) => {
            b.group.visible = bi === current;
        });
        const b = builds[current]!;
        const n = b.pieces.length;
        b.pieces.forEach((p) => {
            const start = (p.delay / n) * (A - 0.9);
            const ein = ease((bt - start) / 0.9);
            const eout = ease((bt - (A + H) - (p.delay / n) * 0.3) / 0.6);
            const e = Math.max(0, ein - eout);
            p.g.visible = e > 0.002;
            p.g.scale.setScalar(Math.max(e, 0.0001));
            p.g.position.lerpVectors(p.from, p.to, e);
            const r = (1 - e) * p.spin;
            p.g.rotation.set(p.toRot.x + r, p.toRot.y + r * 0.6, p.toRot.z);
        });
        b.tick?.(Math.max(0, bt - A), bt >= A);
    }

    let lastKey = '';
    apply();
    return {
        set(i) {
            current = i;
            bt = reduced ? A + 0.2 : 0;
            apply();
        },
        frame(dt, play) {
            if (play && !reduced) bt = Math.min(TOTAL, bt + dt);
            apply();
            return reduced ? 1 : Math.min(1, bt / TOTAL);
        },
        finished() {
            return !reduced && bt >= TOTAL;
        },
        layout(w, h) {
            // Three sizes: compact (< 700 px), medium, wide overlay (>= 1280 px).
            const mode = w < 700 ? 'c' : window.innerWidth >= 1280 ? 'w' : 'm';
            const cfg = {
                c: { vis: 2.7, shift: 0, sc: 1.25 },
                m: { vis: 3.7, shift: 0, sc: 1.55 },
                w: { vis: 4.8, shift: 0.14, sc: 1.45 }
            }[mode];
            const half = Math.tan(MathUtils.degToRad(s.camera.fov / 2));
            const dist = Math.max(3.6, cfg.vis / (w / h) / (2 * half));
            const key = `${dist.toFixed(2)}|${mode}`;
            if (key === lastKey) return;
            lastKey = key;
            s.camera.position.set(0, dist * 0.26, dist);
            s.camera.lookAt(0, 0.45, 0);
            s.setShift(cfg.shift);
            place(cfg.sc);
        }
    };
}
