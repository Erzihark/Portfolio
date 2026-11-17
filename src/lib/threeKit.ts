// Small three.js helpers shared by the hero and the "Arma tu sistema" stage.
import {
    GridHelper,
    BoxGeometry,
    EdgesGeometry,
    Mesh,
    LineSegments,
    Group,
    MeshBasicMaterial,
    LineBasicMaterial,
    MathUtils,
    Vector3,
    type Scene,
    type PerspectiveCamera
} from 'three';

export interface Mats {
    faceMat: MeshBasicMaterial;
    lineMat: LineBasicMaterial;
    accentMat: LineBasicMaterial;
    slotMat: LineBasicMaterial;
}

export const ease = (t: number): number => 1 - Math.pow(1 - MathUtils.clamp(t, 0, 1), 3);

export function createMats(): Mats {
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
        slotMat: new LineBasicMaterial({
            color: 0x4ade9b,
            transparent: true,
            opacity: 0.28,
            toneMapped: false
        })
    };
}

// Holographic bench: slab, edges and grid.
export function createBench(scene: Scene, w: number, d: number, mats: Mats): Group {
    const bench = new Group();
    const slab = new BoxGeometry(w, 0.04, d);
    const slabMesh = new Mesh(slab, mats.faceMat);
    slabMesh.position.y = -0.021;
    const slabEdges = new LineSegments(new EdgesGeometry(slab), mats.lineMat);
    slabEdges.position.y = -0.021;
    const grid = new GridHelper(w, Math.round(w * 5), 0x4ade9b, 0x4ade9b);
    const gm = grid.material as LineBasicMaterial;
    gm.transparent = true;
    gm.opacity = 0.2;
    gm.toneMapped = false;
    grid.scale.z = d / w;
    grid.position.y = 0.002;
    bench.add(slabMesh, slabEdges, grid);
    scene.add(bench);
    return bench;
}

// Screen position (px, relative to the canvas) of a world point.
export function project(
    camera: PerspectiveCamera,
    v: Vector3,
    w: number,
    h: number
): { x: number; y: number } {
    camera.updateMatrixWorld();
    const p = v.clone().project(camera);
    return { x: (p.x * 0.5 + 0.5) * w, y: (-p.y * 0.5 + 0.5) * h };
}

// Camera distance so a given world width fits the canvas.
export function fitDist(camera: PerspectiveCamera, width: number, w: number, h: number, min = 3.6): number {
    const half = Math.tan(MathUtils.degToRad(camera.fov / 2));
    return Math.max(min, width / (w / h) / (2 * half));
}
