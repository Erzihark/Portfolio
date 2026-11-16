// @ts-nocheck (no @types/three in this project)
// THROWAWAY PROTOTYPE. Shared data, state and 3D piece builders for the build-system variants.
import { reactive } from 'vue';
import {
    GridHelper,
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
    MeshBasicMaterial,
    LineBasicMaterial,
    MathUtils
} from 'three';

// ---- Content ----
export interface Chip {
    id: string;
    label: string;
    say: string; // Crocky line
    benefit: string; // result summary line
}
export interface Line {
    id: 'ops' | 'app' | 'soft' | 'exp';
    n: string;
    title: string;
    module: string;
    chips: Chip[];
}
export const LINES: Line[] = [
    {
        id: 'ops',
        n: '01',
        title: 'Operación y datos',
        module: 'Panel de tu negocio',
        chips: [
            { id: 'ops1', label: 'Llevo mi negocio entre Excel, WhatsApp y libretas', say: 'Todo junto en un solo lugar. Qué alivio.', benefit: 'Todo tu negocio en un solo lugar, sin hojas sueltas.' },
            { id: 'ops2', label: 'Se me pierden pedidos, citas o pendientes', say: 'Que nada se te pase: te aviso a tiempo.', benefit: 'Cada pedido, cita o pendiente a la vista, con avisos para que nada se quede olvidado.' },
            { id: 'ops3', label: 'Hago a mano las mismas tareas cada semana', say: 'Eso lo puede hacer la computadora. Tú atiende a tus clientes.', benefit: 'Las tareas que se repiten se hacen solas y tú recuperas tu tiempo.' },
            { id: 'ops4', label: 'Nunca encuentro la información cuando la necesito', say: 'Todo ordenado y a un clic de distancia.', benefit: 'Cualquier dato, a un clic, justo cuando lo necesitas.' }
        ]
    },
    {
        id: 'app',
        n: '02',
        title: 'App o idea nueva',
        module: 'Tu app',
        chips: [
            { id: 'app1', label: 'Tengo una idea y no sé por dónde empezar', say: '¡Una idea! Empecemos por lo más sencillo.', benefit: 'Una primera versión sencilla para probar tu idea con personas reales, sin gastar de más.' },
            { id: 'app2', label: 'Quiero que mis clientes compren o reserven en línea', say: 'Tu negocio abierto a cualquier hora.', benefit: 'Tus clientes compran o reservan en línea, cuando ellos quieran.' },
            { id: 'app3', label: 'Quiero una app para mis clientes o mi equipo', say: 'Una app a tu medida, fácil de usar.', benefit: 'Una app hecha a la medida de tus clientes o de tu equipo, fácil de usar.' }
        ]
    },
    {
        id: 'soft',
        n: '03',
        title: 'Software existente',
        module: 'Tu sistema, mejorado',
        chips: [
            { id: 'soft1', label: 'Mi página o sistema tarda mucho en cargar', say: 'Vamos a ver dónde se atora.', benefit: 'Tu página o sistema responde más rápido y nadie se queda esperando.' },
            { id: 'soft2', label: 'Mi sistema es viejo y nadie se atreve a moverle', say: 'Se renueva por partes, sin tirar lo que ya funciona.', benefit: 'Tu sistema actual se renueva poco a poco, sin detener tu negocio.' },
            { id: 'soft3', label: 'Cada cambio pequeño tarda semanas', say: 'Un cambio pequeño no debería ser tan complicado.', benefit: 'Los cambios pequeños se hacen con rapidez y sin sustos.' }
        ]
    },
    {
        id: 'exp',
        n: '04',
        title: 'Experiencias y datos',
        module: 'Tu marca y tus clientes',
        chips: [
            { id: 'exp1', label: 'Quiero que mi marca destaque en internet', say: '¡Que te vean y se acuerden de ti!', benefit: 'Una experiencia en internet que hace que tu marca se vea distinta y se recuerde.' },
            { id: 'exp2', label: 'Quiero conocer mejor a mis clientes para vender más', say: 'Si sabes qué les gusta, vendes mejor.', benefit: 'Conocer mejor a tus clientes y ver qué es lo que más se vende y qué funciona.' }
        ]
    }
];
export const CHIPS: Chip[] = LINES.flatMap((l) => l.chips);
export const chipById = (id: string) => CHIPS.find((c) => c.id === id)!;
export const lineOfChip = (id: string) => LINES.find((l) => l.chips.some((c) => c.id === id))!;
export const GREETING = '¡Hola! Cuéntame qué te quita el sueño y lo armamos.';
export const REMOVE_LINE = 'Listo, lo quito.';

export function buildMessage(ids: string[]): string {
    if (!ids.length) return 'Hola Manuel. Me gustaría platicar sobre mi negocio.';
    return 'Hola Manuel. Me gustaría resolver esto:\n' + ids.map((i) => '- ' + chipById(i).label).join('\n');
}

// ---- Selection state ----
export function useSelection() {
    const state = reactive({
        selected: [] as string[],
        newest: null as string | null,
        toggle(id: string): boolean {
            const i = state.selected.indexOf(id);
            if (i >= 0) {
                state.selected = state.selected.filter((x) => x !== id);
                if (state.newest === id) state.newest = state.selected[state.selected.length - 1] ?? null;
                return false;
            }
            state.selected = [...state.selected, id];
            state.newest = id;
            return true;
        },
        clear() {
            state.selected = [];
            state.newest = null;
        }
    });
    return state;
}

// ---- 3D helpers ----
export const ease = (t: number) => 1 - Math.pow(1 - MathUtils.clamp(t, 0, 1), 3);

export function createMats() {
    return {
        faceMat: new MeshBasicMaterial({
            color: 0x0f131a,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1,
            toneMapped: false
        }),
        lineMat: new LineBasicMaterial({ color: 0x4ade9b, toneMapped: false }),
        accentMat: new LineBasicMaterial({ color: 0xffb454, toneMapped: false }),
        slotMat: new LineBasicMaterial({ color: 0x4ade9b, transparent: true, opacity: 0.28, toneMapped: false })
    };
}

/** Holographic bench: slab, edges and grid. */
export function createBench(scene, w: number, d: number, mats) {
    const bench = new Group();
    const slab = new BoxGeometry(w, 0.04, d);
    const slabMesh = new Mesh(slab, mats.faceMat);
    slabMesh.position.y = -0.021;
    const slabEdges = new LineSegments(new EdgesGeometry(slab), mats.lineMat);
    slabEdges.position.y = -0.021;
    const grid = new GridHelper(w, Math.round(w * 5), 0x4ade9b, 0x4ade9b);
    const gm = grid.material;
    gm.transparent = true;
    gm.opacity = 0.2;
    gm.toneMapped = false;
    grid.scale.z = d / w;
    grid.position.y = 0.002;
    bench.add(slabMesh, slabEdges, grid);
    scene.add(bench);
    return bench;
}

/** One module for each service line. Pieces show or hide with the selection. */
export function createModules(scene, mats, reduced: boolean) {
    const { faceMat, lineMat, accentMat, slotMat } = mats;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    const box = (w, h, d) => new BoxGeometry(w, h, d);
    const mods = {};

    function make(id: string) {
        const group = new Group();
        scene.add(group);
        const slot = new LineSegments(new EdgesGeometry(box(1.0, 0.01, 0.6)), slotMat);
        slot.position.y = 0.006;
        group.add(slot);
        // inner holds the pieces. It shifts sideways to centre the active content.
        const inner = new Group();
        group.add(inner);
        const m = { id, group, inner, slot, pieces: [], tick: null, active: false, shift: 0, shiftTo: 0 };
        mods[id] = m;
        return m;
    }
    // when(has, n): true if the piece must be visible. n is the count of picks in this line.
    function add(m, geo, x, y, z, rot = [0, 0, 0], opts = {}) {
        const g = new Group();
        g.add(new Mesh(geo, faceMat));
        g.add(new LineSegments(new EdgesGeometry(geo, 12), opts.amber ? accentMat : lineMat));
        const to = new Vector3(x, y, z);
        const from = new Vector3(x + rnd() * 1.1, y + 0.9 + Math.abs(rnd()) * 0.9, z + rnd() * 0.8);
        g.position.copy(from);
        g.scale.setScalar(0.0001);
        g.visible = false;
        m.inner.add(g);
        const p = {
            g,
            to,
            toRot: new Euler(...rot),
            from,
            spin: opts.spin ?? 2.4,
            when: opts.when ?? ((has, n) => n >= 1),
            target: 0,
            prog: 0,
            wait: 0
        };
        m.pieces.push(p);
        return p;
    }
    const plate = (m, w, d, x = 0, when) => add(m, box(w, 0.02, d), x, 0.01, 0, [0, 0, 0], { when });

    // 01 Dashboard panel. Extra panels join as more problems are picked.
    const ops = make('ops');
    plate(ops, 0.6, 0.28);
    add(ops, box(0.05, 0.26, 0.05), 0, 0.15, 0);
    add(ops, box(1.0, 0.62, 0.03), 0, 0.53, 0);
    add(ops, box(0.92, 0.06, 0.012), 0, 0.75, 0.02);
    [0.12, 0.22, 0.17, 0.3].forEach((h, i) => add(ops, box(0.08, h, 0.02), -0.38 + i * 0.12, 0.29 + h / 2, 0.03));
    add(ops, new TorusGeometry(0.13, 0.014, 6, 20), 0.3, 0.5, 0.025);
    add(ops, box(0.3, 0.03, 0.012), 0.3, 0.68, 0.02, [0, 0, 0], { amber: true });
    const n2 = (h, n) => n >= 2;
    const n3 = (h, n) => n >= 3;
    add(ops, box(0.5, 0.4, 0.03), 0.8, 0.36, -0.05, [0, -0.3, 0], { when: n2 });
    [0.1, 0.18, 0.14].forEach((h, i) => add(ops, box(0.07, h, 0.02), 0.66 + i * 0.13, 0.22 + h / 2, -0.02, [0, -0.3, 0], { when: n2 }));
    add(ops, box(0.5, 0.4, 0.03), -0.8, 0.36, -0.05, [0, 0.3, 0], { when: n3 });
    [0.3, 0.22, 0.14].forEach((w, i) => add(ops, box(w, 0.04, 0.02), -0.8 - (0.3 - w) / 2 + 0.05, 0.5 - i * 0.1, -0.02, [0, 0.3, 0], { when: n3, amber: i === 0 }));

    const n4 = (h, n) => n >= 4;
    add(ops, box(0.36, 0.22, 0.03), 0, 0.14, 0.45, [-0.4, 0, 0], { when: n4 });
    [0.2, 0.14, 0.17].forEach((w, i) => add(ops, box(w, 0.025, 0.012), -0.04 + (w - 0.2) / 2, 0.19 - i * 0.05, 0.47, [-0.4, 0, 0], { when: n4, amber: i === 0 }));

    // 02 Phone. A shop card joins with 2 picks, a side card with 3.
    const app = make('app');
    plate(app, 0.6, 0.3);
    add(app, box(0.4, 0.78, 0.05), 0, 0.41, 0);
    add(app, box(0.34, 0.62, 0.012), 0, 0.45, 0.03);
    [0.64, 0.5, 0.36].forEach((y) => add(app, box(0.26, 0.07, 0.012), 0, y, 0.04));
    add(app, box(0.1, 0.014, 0.012), 0, 0.77, 0.03);
    add(app, new CylinderGeometry(0.028, 0.028, 0.014, 12), 0, 0.12, 0.035, [Math.PI / 2, 0, 0], { amber: true });
    const shop = n2;
    const side = n3;
    add(app, box(0.5, 0.3, 0.03), 0.62, 0.28, 0, [0, -0.3, 0], { when: shop });
    add(app, box(0.4, 0.05, 0.012), 0.62, 0.38, 0.02, [0, -0.3, 0], { when: shop });
    add(app, new TorusGeometry(0.07, 0.012, 6, 16), 0.62, 0.26, 0.02, [0, -0.3, 0], { when: shop });
    add(app, box(0.2, 0.03, 0.012), 0.62, 0.15, 0.02, [0, -0.3, 0], { when: shop, amber: true });

    add(app, box(0.5, 0.3, 0.03), -0.62, 0.28, 0, [0, 0.3, 0], { when: side });
    [0.3, 0.2, 0.26].forEach((w, i) => add(app, box(w, 0.04, 0.012), -0.62 - (0.3 - w) / 2 + 0.04, 0.37 - i * 0.07, 0.02, [0, 0.3, 0], { when: side, amber: i === 0 }));

    // 03 Speed gauge. A second small gauge joins when both problems are picked.
    const soft = make('soft');
    plate(soft, 0.8, 0.3);
    add(soft, new TorusGeometry(0.38, 0.02, 6, 24, Math.PI), 0, 0.12, 0);
    for (let i = 0; i < 7; i++) {
        const a = Math.PI * (i / 6);
        add(soft, box(0.02, 0.07, 0.02), Math.cos(a) * 0.3, 0.12 + Math.sin(a) * 0.3, 0, [0, 0, a - Math.PI / 2]);
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
    const o1 = (h) => h('exp1');
    const o2 = (h) => h('exp2');
    plate(exp, 0.6, 0.4, -0.35, o1);
    add(exp, new CylinderGeometry(0.12, 0.15, 0.1, 8), -0.35, 0.07, 0, [0, 0, 0], { when: o1 });
    const ico = add(exp, new IcosahedronGeometry(0.22, 0), -0.35, 0.38, 0, [0, 0, 0], { when: o1 });
    const orbit = add(exp, new TorusGeometry(0.34, 0.008, 4, 32), -0.35, 0.38, 0, [Math.PI / 2.3, 0, 0], { when: o1 });
    const sat = add(exp, new OctahedronGeometry(0.05, 0), -0.05, 0.38, 0, [0, 0, 0], { amber: true, when: o1 });
    plate(exp, 0.7, 0.4, 0.45, o2);
    add(exp, box(0.62, 0.02, 0.02), 0.45, 0.1, 0.02, [0, 0, 0], { when: o2 });
    [0.12, 0.2, 0.16, 0.3, 0.38].forEach((h, i) => add(exp, box(0.07, h, 0.05), 0.27 + i * 0.09, 0.11 + h / 2, 0, [0, 0, 0], { when: o2 }));
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

    function update(selected: string[]) {
        const has = (id) => selected.includes(id);
        let k = 0;
        LINES.forEach((line) => {
            const m = mods[line.id];
            const n = line.chips.filter((c) => has(c.id)).length;
            m.active = n > 0;
            if (line.id === 'exp') m.shiftTo = has('exp1') && has('exp2') ? -0.075 : has('exp1') ? 0.35 : has('exp2') ? -0.45 : 0;
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
        Object.values(mods).forEach((m) => {
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
            m.inner.position.x = m.shift;
            m.tick?.(t);
        });
    }
    return { mods, update, frame };
}

/** Screen position (px, relative to the canvas) of a world point. */
export function project(camera, v: Vector3, w: number, h: number) {
    camera.updateMatrixWorld();
    const p = v.clone().project(camera);
    return { x: (p.x * 0.5 + 0.5) * w, y: (-p.y * 0.5 + 0.5) * h };
}

/** Camera distance so a given world width fits the canvas. */
export function fitDist(camera, width: number, w: number, h: number, min = 3.6) {
    const half = Math.tan(MathUtils.degToRad(camera.fov / 2));
    return Math.max(min, width / (w / h) / (2 * half));
}
