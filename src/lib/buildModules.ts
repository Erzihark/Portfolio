// The four modules of "Arma tu sistema": dashboard, phone, speed gauge, 3D object and chart.
// Each module has a slot outline. Pieces show or hide with the picked chips.
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
    type BufferGeometry,
    type Scene
} from 'three';
import { ease, type Mats } from './threeKit';

export type LineId = 'ops' | 'app' | 'soft' | 'exp';
export const LINE_IDS: LineId[] = ['ops', 'app', 'soft', 'exp'];

// Chip ids for each line. The text of each chip lives in the i18n files.
export const CHIP_IDS: Record<LineId, string[]> = {
    ops: ['ops1', 'ops2', 'ops3', 'ops4'],
    app: ['app1', 'app2', 'app3'],
    soft: ['soft1', 'soft2', 'soft3'],
    exp: ['exp1', 'exp2']
};
export const lineOfChip = (id: string): LineId => LINE_IDS.find((l) => CHIP_IDS[l].includes(id))!;

type Has = (id: string) => boolean;
type When = (has: Has, n: number) => boolean;

interface Piece {
    g: Group;
    to: Vector3;
    toRot: Euler;
    from: Vector3;
    spin: number;
    when: When;
    target: number;
    prog: number;
    wait: number;
}
export interface Mod {
    id: LineId;
    group: Group;
    inner: Group;
    slot: LineSegments;
    pieces: Piece[];
    tick: ((t: number) => void) | null;
    active: boolean;
    shift: number;
    shiftTo: number;
    // Size factor of the content. It shrinks when a line has several picks.
    mul: number;
    mulTo: number;
    baseScale: number;
}

export interface Modules {
    mods: Record<LineId, Mod>;
    update(selected: string[]): void;
    frame(dt: number, t: number): void;
}

interface AddOpts {
    amber?: boolean;
    spin?: number;
    when?: When;
}

export function createModules(scene: Scene, mats: Mats, reduced: boolean): Modules {
    const { faceMat, lineMat, accentMat, slotMat } = mats;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    const box = (w: number, h: number, d: number) => new BoxGeometry(w, h, d);
    const mods = {} as Record<LineId, Mod>;

    function make(id: LineId): Mod {
        const group = new Group();
        scene.add(group);
        const slot = new LineSegments(new EdgesGeometry(box(1.0, 0.01, 0.6)), slotMat);
        slot.position.y = 0.006;
        group.add(slot);
        // The inner group holds the pieces. It shifts sideways to centre the active content.
        const inner = new Group();
        group.add(inner);
        const m: Mod = {
            id,
            group,
            inner,
            slot,
            pieces: [],
            tick: null,
            active: false,
            shift: 0,
            shiftTo: 0,
            mul: 1,
            mulTo: 1,
            baseScale: 1
        };
        mods[id] = m;
        return m;
    }
    // "when" says if a piece is visible. n is the count of picks in the line.
    function add(
        m: Mod,
        geo: BufferGeometry,
        x: number,
        y: number,
        z: number,
        rot: [number, number, number] = [0, 0, 0],
        opts: AddOpts = {}
    ): Piece {
        const g = new Group();
        g.add(new Mesh(geo, faceMat));
        g.add(new LineSegments(new EdgesGeometry(geo, 12), opts.amber ? accentMat : lineMat));
        const to = new Vector3(x, y, z);
        const from = new Vector3(x + rnd() * 0.9, y + 0.5 + Math.abs(rnd()) * 0.5, z + rnd() * 0.6);
        g.position.copy(from);
        g.scale.setScalar(0.0001);
        g.visible = false;
        m.inner.add(g);
        const p: Piece = {
            g,
            to,
            toRot: new Euler(...rot),
            from,
            spin: opts.spin ?? 2.4,
            when: opts.when ?? ((_has, n) => n >= 1),
            target: 0,
            prog: 0,
            wait: 0
        };
        m.pieces.push(p);
        return p;
    }
    const plate = (m: Mod, w: number, d: number, x = 0, when?: When) =>
        add(m, box(w, 0.02, d), x, 0.01, 0, [0, 0, 0], { when });

    const n2: When = (_h, n) => n >= 2;
    const n3: When = (_h, n) => n >= 3;
    const n4: When = (_h, n) => n >= 4;

    // 01 Dashboard panel. Extra panels join as more problems are picked.
    const ops = make('ops');
    plate(ops, 0.6, 0.28);
    add(ops, box(0.05, 0.26, 0.05), 0, 0.15, 0);
    add(ops, box(1.0, 0.62, 0.03), 0, 0.53, 0);
    add(ops, box(0.92, 0.06, 0.012), 0, 0.75, 0.02);
    [0.12, 0.22, 0.17, 0.3].forEach((h, i) =>
        add(ops, box(0.08, h, 0.02), -0.38 + i * 0.12, 0.29 + h / 2, 0.03)
    );
    add(ops, new TorusGeometry(0.13, 0.014, 6, 20), 0.3, 0.5, 0.025);
    add(ops, box(0.3, 0.03, 0.012), 0.3, 0.68, 0.02, [0, 0, 0], { amber: true });
    add(ops, box(0.5, 0.4, 0.03), 0.8, 0.36, -0.05, [0, -0.3, 0], { when: n2 });
    [0.1, 0.18, 0.14].forEach((h, i) =>
        add(ops, box(0.07, h, 0.02), 0.66 + i * 0.13, 0.22 + h / 2, -0.02, [0, -0.3, 0], { when: n2 })
    );
    add(ops, box(0.5, 0.4, 0.03), -0.8, 0.36, -0.05, [0, 0.3, 0], { when: n3 });
    [0.3, 0.22, 0.14].forEach((w, i) =>
        add(ops, box(w, 0.04, 0.02), -0.8 - (0.3 - w) / 2 + 0.05, 0.5 - i * 0.1, -0.02, [0, 0.3, 0], {
            when: n3,
            amber: i === 0
        })
    );
    add(ops, box(0.36, 0.22, 0.03), 0, 0.14, 0.45, [-0.4, 0, 0], { when: n4 });
    [0.2, 0.14, 0.17].forEach((w, i) =>
        add(ops, box(w, 0.025, 0.012), -0.04 + (w - 0.2) / 2, 0.19 - i * 0.05, 0.47, [-0.4, 0, 0], {
            when: n4,
            amber: i === 0
        })
    );

    // 02 Phone. A shop card joins with 2 picks, a side card with 3.
    const app = make('app');
    plate(app, 0.6, 0.3);
    add(app, box(0.4, 0.78, 0.05), 0, 0.41, 0);
    add(app, box(0.34, 0.62, 0.012), 0, 0.45, 0.03);
    [0.64, 0.5, 0.36].forEach((y) => add(app, box(0.26, 0.07, 0.012), 0, y, 0.04));
    add(app, box(0.1, 0.014, 0.012), 0, 0.77, 0.03);
    add(app, new CylinderGeometry(0.028, 0.028, 0.014, 12), 0, 0.12, 0.035, [Math.PI / 2, 0, 0], {
        amber: true
    });
    add(app, box(0.5, 0.3, 0.03), 0.62, 0.28, 0, [0, -0.3, 0], { when: n2 });
    add(app, box(0.4, 0.05, 0.012), 0.62, 0.38, 0.02, [0, -0.3, 0], { when: n2 });
    add(app, new TorusGeometry(0.07, 0.012, 6, 16), 0.62, 0.26, 0.02, [0, -0.3, 0], { when: n2 });
    add(app, box(0.2, 0.03, 0.012), 0.62, 0.15, 0.02, [0, -0.3, 0], { when: n2, amber: true });
    add(app, box(0.5, 0.3, 0.03), -0.62, 0.28, 0, [0, 0.3, 0], { when: n3 });
    [0.3, 0.2, 0.26].forEach((w, i) =>
        add(app, box(w, 0.04, 0.012), -0.62 - (0.3 - w) / 2 + 0.04, 0.37 - i * 0.07, 0.02, [0, 0.3, 0], {
            when: n3,
            amber: i === 0
        })
    );

    // 03 Speed gauge. Two small gauges join with more picks.
    const soft = make('soft');
    plate(soft, 0.8, 0.3);
    add(soft, new TorusGeometry(0.38, 0.02, 6, 24, Math.PI), 0, 0.12, 0);
    for (let i = 0; i < 7; i++) {
        const a = Math.PI * (i / 6);
        add(soft, box(0.02, 0.07, 0.02), Math.cos(a) * 0.3, 0.12 + Math.sin(a) * 0.3, 0, [
            0,
            0,
            a - Math.PI / 2
        ]);
    }
    add(soft, new CylinderGeometry(0.045, 0.045, 0.03, 12), 0, 0.12, 0, [Math.PI / 2, 0, 0]);
    const needleGeo = box(0.3, 0.02, 0.02);
    needleGeo.translate(0.14, 0, 0);
    const needle = add(soft, needleGeo, 0, 0.12, 0, [0, 0, Math.PI], { amber: true });
    add(soft, new TorusGeometry(0.2, 0.014, 6, 20, Math.PI), 0.82, 0.1, 0, [0, 0, 0], { when: n2 });
    add(soft, box(0.2, 0.014, 0.02), 0.82, 0.1, 0, [0, 0, 0.5], { when: n2, amber: true });
    add(soft, box(0.5, 0.02, 0.1), 0.82, 0.015, 0, [0, 0, 0], { when: n2 });
    add(soft, new TorusGeometry(0.2, 0.014, 6, 20, Math.PI), -0.82, 0.1, 0, [0, 0, 0], { when: n3 });
    add(soft, box(0.2, 0.014, 0.02), -0.82, 0.1, 0, [0, 0, 2.6], { when: n3, amber: true });
    add(soft, box(0.5, 0.02, 0.1), -0.82, 0.015, 0, [0, 0, 0], { when: n3 });
    soft.tick = (t) => {
        if (needle.prog < 1) return;
        needle.g.rotation.z = Math.PI * (reduced ? 0.3 : 0.55 + 0.3 * Math.sin(t * 0.9)) + Math.sin(t * 9) * 0.01;
    };

    // 04 Interactive 3D object (pick 1) and a measurement chart (pick 2).
    const exp = make('exp');
    const o1: When = (h) => h('exp1');
    const o2: When = (h) => h('exp2');
    plate(exp, 0.6, 0.4, -0.35, o1);
    add(exp, new CylinderGeometry(0.12, 0.15, 0.1, 8), -0.35, 0.07, 0, [0, 0, 0], { when: o1 });
    const ico = add(exp, new IcosahedronGeometry(0.22, 0), -0.35, 0.38, 0, [0, 0, 0], { when: o1 });
    const orbit = add(exp, new TorusGeometry(0.34, 0.008, 4, 32), -0.35, 0.38, 0, [Math.PI / 2.3, 0, 0], {
        when: o1
    });
    const sat = add(exp, new OctahedronGeometry(0.05, 0), -0.05, 0.38, 0, [0, 0, 0], {
        amber: true,
        when: o1
    });
    plate(exp, 0.7, 0.4, 0.45, o2);
    add(exp, box(0.62, 0.02, 0.02), 0.45, 0.1, 0.02, [0, 0, 0], { when: o2 });
    [0.12, 0.2, 0.16, 0.3, 0.38].forEach((h, i) =>
        add(exp, box(0.07, h, 0.05), 0.27 + i * 0.09, 0.11 + h / 2, 0, [0, 0, 0], { when: o2 })
    );
    add(exp, box(0.4, 0.015, 0.015), 0.45, 0.58, 0, [0, 0, 0.35], { when: o2, amber: true });
    exp.tick = (t) => {
        if (reduced) return;
        if (ico.prog >= 1) {
            ico.g.rotation.y = t * 0.9;
            ico.g.rotation.x = t * 0.35;
            orbit.g.rotation.z = t * 0.4;
        }
        if (sat.prog >= 1) {
            const a = t * 1.5;
            sat.g.position.set(-0.35 + Math.cos(a) * 0.34, 0.38 + Math.sin(a * 0.7) * 0.07, Math.sin(a) * 0.34);
        }
    };

    let k = 0;
    function update(selected: string[]) {
        const has: Has = (id) => selected.includes(id);
        LINE_IDS.forEach((id) => {
            const m = mods[id];
            const n = CHIP_IDS[id].filter(has).length;
            m.active = n > 0;
            if (id === 'exp') {
                m.shiftTo = has('exp1') && has('exp2') ? -0.075 : has('exp1') ? 0.35 : has('exp2') ? -0.45 : 0;
            }
            // Content with side panels gets smaller so it stays in its slot.
            m.mulTo = n >= 3 ? 0.82 : n === 2 ? 0.9 : 1;
            m.slot.visible = !m.active;
            m.pieces.forEach((p) => {
                const t = p.when(has, n) ? 1 : 0;
                if (t !== p.target) {
                    p.target = t;
                    p.wait = t ? 0.05 * (k++ % 12) : 0;
                }
            });
        });
    }
    function frame(dt: number, t: number) {
        LINE_IDS.forEach((id) => {
            const m = mods[id];
            m.pieces.forEach((p) => {
                if (reduced) p.prog = p.target;
                else if (p.wait > 0) p.wait -= dt;
                else p.prog = MathUtils.clamp(p.prog + (p.target ? dt / 0.9 : -dt / 0.4), 0, 1);
                const e = ease(p.prog);
                p.g.visible = e > 0.002;
                p.g.scale.setScalar(Math.max(e, 0.0001));
                p.g.position.lerpVectors(p.from, p.to, e);
                const r = (1 - e) * p.spin;
                p.g.rotation.set(p.toRot.x + r, p.toRot.y + r * 0.6, p.toRot.z);
            });
            m.shift = reduced ? m.shiftTo : MathUtils.damp(m.shift, m.shiftTo, 6, dt);
            m.mul = reduced ? m.mulTo : MathUtils.damp(m.mul, m.mulTo, 6, dt);
            m.inner.position.x = m.shift;
            m.group.scale.setScalar(m.baseScale * m.mul);
            m.tick?.(t);
        });
    }
    return { mods, update, frame };
}
