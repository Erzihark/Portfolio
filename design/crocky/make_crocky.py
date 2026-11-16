"""Build three Crocky mascot concepts in Blender, render them, save the .blend.

Run: blender.exe --background --python make_crocky.py
Front of every character looks toward -Y. Z is up.
"""
import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix, Euler
from bpy_extras.object_utils import world_to_camera_view

OUT = os.path.dirname(os.path.abspath(__file__))
BG = "#07090D"
RES = 1024
TURN = math.radians(-35)  # three-quarter turn of each character

COLORS = {
    "body":   ("#3FBF7F", 0.75),
    "ridge":  ("#2A8F5C", 0.8),
    "belly":  ("#D8F5C8", 0.8),
    "white":  ("#FFFFFF", 0.25),
    "pupil":  ("#06080A", 0.2),
    "hilite": ("#FFFFFF", 0.3),
    "amber":  ("#FFB454", 0.6),
    "mouth":  ("#0C2218", 0.9),
    "tooth":  ("#FFFFFF", 0.6),
}


def lin(hexcol):
    """Convert an sRGB hex colour to linear RGBA."""
    h = hexcol.lstrip("#")
    v = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    v = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in v]
    return (*v, 1.0)


def make_material(name, hexcol, rough, emit=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(hexcol)
    b.inputs["Roughness"].default_value = rough
    if emit:
        b.inputs["Emission Color"].default_value = lin(hexcol)
        b.inputs["Emission Strength"].default_value = emit
    m.diffuse_color = lin(hexcol)
    return m


class Part:
    """Collect primitives per material, then make one mesh per material."""

    def __init__(self, name, coll, parent):
        self.name, self.coll, self.parent = name, coll, parent
        self.bms = {}
        self.objs = []

    def bm(self, mat):
        return self.bms.setdefault(mat, bmesh.new())

    def ell(self, mat, c, r, seg=8, ring=6, rot=(0, 0, 0)):
        """Ellipsoid from a UV sphere."""
        m = (Matrix.Translation(c) @ Euler(rot).to_matrix().to_4x4()
             @ Matrix.Diagonal((r[0], r[1], r[2], 1)))
        bmesh.ops.create_uvsphere(self.bm(mat), u_segments=seg,
                                  v_segments=ring, radius=1.0, matrix=m)

    def box_m(self, mat, m, size, taper=(1, 1)):
        """Box with matrix m. Front (-Y) end can taper in X and Z."""
        res = bmesh.ops.create_cube(self.bm(mat), size=1.0)
        for v in res["verts"]:
            x, y, z = v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]
            if v.co.y < 0:
                x *= taper[0]
                z *= taper[1]
            v.co = m @ Vector((x, y, z))

    def box(self, mat, c, size, rot=(0, 0, 0), taper=(1, 1)):
        m = Matrix.Translation(c) @ Euler(rot).to_matrix().to_4x4()
        self.box_m(mat, m, size, taper)

    def seg(self, mat, p0, p1, th):
        """Thin box that joins two points."""
        p0, p1 = Vector(p0), Vector(p1)
        d = p1 - p0
        q = Vector((0, 1, 0)).rotation_difference(d.normalized())
        m = Matrix.Translation((p0 + p1) / 2) @ q.to_matrix().to_4x4()
        self.box_m(mat, m, (th, d.length + th * 0.6, th))

    def limb(self, mat, p0, p1, r0, r1, seg=7):
        """Tapered cylinder from p0 (radius r0) to p1 (radius r1)."""
        p0, p1 = Vector(p0), Vector(p1)
        d = p1 - p0
        q = Vector((0, 0, 1)).rotation_difference(d.normalized())
        m = Matrix.Translation((p0 + p1) / 2) @ q.to_matrix().to_4x4()
        bmesh.ops.create_cone(self.bm(mat), cap_ends=True, cap_tris=False,
                              segments=seg, radius1=r0, radius2=r1,
                              depth=d.length, matrix=m)

    def finish(self, mats):
        for key, bm in self.bms.items():
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
            me = bpy.data.meshes.new(f"{self.name}_{key}")
            bm.to_mesh(me)
            bm.free()
            for p in me.polygons:
                p.use_smooth = False
            me.materials.append(mats[key])
            ob = bpy.data.objects.new(f"{self.name}_{key}", me)
            self.coll.objects.link(ob)
            ob.parent = self.parent
            self.objs.append(ob)
        return self.objs


# ---------------------------------------------------------------- shared bits
def eye(P, c, r, side, lz, ang, look=(0.0, 0.0)):
    """Big eye. lz = lid height (fraction of r). ang = outer tilt of the lid."""
    c = Vector(c)
    P.ell("white", c, (r, r * 0.95, r), 10, 6)
    rot = (look[1], 0, look[0])
    mr = Euler(rot).to_matrix().to_4x4()
    pc = c + mr @ Vector((0, -0.80 * r, 0))
    P.ell("pupil", pc, (0.46 * r, 0.24 * r, 0.5 * r), 8, 5, rot)
    hc = pc + mr @ Vector((0.17 * r, -0.2 * r, 0.2 * r))
    P.ell("hilite", hc, (0.15 * r, 0.08 * r, 0.15 * r), 5, 3, rot)
    # Lid: a slightly larger sphere, cut by a plane, keeps the top part.
    bm = P.bm("body")
    res = bmesh.ops.create_uvsphere(
        bm, u_segments=10, v_segments=6, radius=1.0,
        matrix=Matrix.Translation(c) @ Matrix.Diagonal(
            (1.07 * r, 1.06 * r, 1.07 * r, 1)))
    vs = res["verts"]
    es = {e for v in vs for e in v.link_edges}
    fs = {f for v in vs for f in v.link_faces}
    n = Vector((side * math.tan(ang), 0, 1)).normalized()
    cut = bmesh.ops.bisect_plane(
        bm, geom=list(vs) + list(es) + list(fs), dist=1e-5,
        plane_co=c + Vector((0, 0, lz * r)), plane_no=n, clear_inner=True)
    edges = [g for g in cut["geom_cut"] if isinstance(g, bmesh.types.BMEdge)]
    try:
        bmesh.ops.holes_fill(bm, edges=edges, sides=0)
    except Exception:
        pass


def snout(P, y0, y1, w0, w1, zm, hu, hl, k, teeth=0, buck=True):
    """Snout with two jaws, mouth line, smile, nostrils and teeth.
    y0 = start (inside head), y1 = tip (more negative). w = half width."""
    L = abs(y1 - y0)
    yc = (y0 + y1) / 2
    tx = w1 / w0

    def w(y):  # half width of upper jaw at y
        return w0 + (w1 - w0) * (y0 - y) / L

    P.box("body", (0, yc, zm + hu / 2), (2 * w0, L, hu), taper=(tx, 0.8))
    P.box("belly", (0, yc, zm - hl / 2), (1.9 * w0, L * 0.97, hl),
          taper=(tx, 0.85))
    th = 0.035
    off = 0.012
    # Mouth line: front arc and both sides, with smile curl at the front.
    wf = w1 + off
    n = 6
    arc = []
    for i in range(n + 1):
        t = -1 + 2 * i / n
        arc.append((t * wf, y1 - 0.008, zm + k * t * t))
    for a, b in zip(arc, arc[1:]):
        P.seg("mouth", a, b, th)
    for s in (-1, 1):
        front = (s * wf, y1 - 0.008, zm + k)
        mid = (s * (w(y1 + L * 0.3) + off), y1 + L * 0.3, zm + 0.0)
        back = (s * (w(y0 - 0.0) + off), y0, zm)
        # curl: a short step up near the front
        curl = (s * (w(y1 + L * 0.12) + off), y1 + L * 0.12, zm + k * 0.35)
        P.seg("mouth", front, curl, th)
        P.seg("mouth", curl, mid, th)
        P.seg("mouth", mid, back, th)
    # Nostrils.
    for s in (-1, 1):
        P.box("mouth", (s * w1 * 0.42, y1 + 0.1, zm + hu * 0.8 + 0.01),
              (0.07, 0.08, 0.04))
    # Small blunt buck teeth at the front.
    if buck:
        for s in (-1, 1):
            P.box("tooth", (s * 0.035, y1 - 0.004, zm - 0.03),
                  (0.06, 0.04, 0.07))
    # Side teeth, upper hang down, lower point up.
    for i in range(teeth):
        y = y1 + 0.12 + (L - 0.3) * i / max(teeth - 1, 1)
        for s in (-1, 1):
            xs = s * (w(y) + 0.004)
            P.limb("tooth", (xs, y, zm - 0.075), (xs, y, zm + 0.01),
                   0.002, 0.034, 4)
            y2 = y + 0.5 * (L - 0.3) / max(teeth - 1, 1)
            if y2 < y0 - 0.15:
                xs2 = s * (w(y2) + 0.004)
                P.limb("tooth", (xs2, y2, zm + 0.075), (xs2, y2, zm - 0.01),
                       0.002, 0.03, 4)


def scute(P, mat, base, size=0.17, r=0.08):
    b = Vector(base)
    P.limb(mat, b, b + Vector((0, 0.05, size)), r, 0.0, 4)


# ---------------------------------------------------------------- concept A
def build_a(P):
    # legs and feet
    for s in (-1, 1):
        P.limb("body", (s * .2, 0, .45), (s * .2, 0, .06), .17, .15, 7)
        P.box("body", (s * .2, -.15, .07), (.3, .46, .14), taper=(.8, .8))
    # body and belly
    P.ell("body", (0, .02, .88), (.5, .42, .55), 8, 6)
    P.ell("belly", (0, -.13, .84), (.4, .3, .46), 8, 6)
    # head
    P.ell("body", (0, -.1, 1.5), (.66, .58, .46), 10, 6)
    snout(P, -.35, -1.05, .34, .27, 1.31, .2, .14, k=0.07, teeth=0)
    # eyes: curious (left lid lower, right lid raised)
    eye(P, (-.3, -.27, 1.92), .27, -1, lz=.55, ang=math.radians(-12),
        look=(0.15, 0.1))
    eye(P, (.3, -.27, 1.92), .27, 1, lz=.78, ang=math.radians(4),
        look=(0.15, 0.1))
    # arms: left hangs, right points forward and up
    P.limb("body", (.44, -.02, 1.05), (.7, -.18, .72), .13, .1, 6)
    P.ell("body", (.72, -.2, .7), (.13, .12, .12), 6, 4)
    P.limb("body", (-.44, -.05, 1.05), (-.78, -.5, 1.3), .13, .1, 6)
    P.ell("body", (-.8, -.55, 1.33), (.13, .12, .12), 6, 4)
    # tail
    P.limb("body", (0, .3, .62), (0, 1.0, .3), .26, .06, 7)
    # scutes and bow tie
    for p in [(0, .3, 1.88), (0, .41, 1.22), (0, .45, .96), (0, .42, .72)]:
        scute(P, "ridge", p)
    for p in [(0, .55, .55), (0, .78, .42)]:
        scute(P, "ridge", p, .13, .07)
    for s in (-1, 1):
        P.limb("amber", (0, -.38, 1.1), (s * .17, -.38, 1.1), 0.0, .1, 4)
    P.box("amber", (0, -.4, 1.1), (.07, .06, .07))


# ---------------------------------------------------------------- concept B
def build_b(P):
    # body and belly
    P.ell("body", (0, .1, .5), (.5, 1.05, .36), 8, 6)
    P.ell("belly", (0, 0, .36), (.42, .9, .26), 8, 6)
    # head and snout
    P.ell("body", (0, -1.0, .6), (.46, .5, .34), 8, 6)
    snout(P, -1.25, -2.3, .36, .26, .5, .17, .12, k=0.045, teeth=4,
          buck=False)
    # eyes: happy (outer lids low)
    eye(P, (-.31, -1.05, 1.0), .28, -1, lz=.62, ang=math.radians(-6),
        look=(0.0, 0.05))
    eye(P, (.31, -1.05, 1.0), .28, 1, lz=.62, ang=math.radians(-6),
        look=(0.0, 0.05))
    # nostril bumps
    for s in (-1, 1):
        P.ell("body", (s * .1, -2.2, .72), (.07, .08, .05), 5, 3)
    # legs and feet
    for y in (-.55, .8):
        for s in (-1, 1):
            P.limb("body", (s * .4, y, .45), (s * .62, y, .1), .17, .14, 6)
            P.box("body", (s * .66, y - .1, .06), (.3, .42, .12),
                  taper=(.8, .8))
    # tail
    pts = [((0, 1.0, .46), .34), ((0, 1.8, .4), .25), ((0, 2.5, .33), .17),
           ((0, 3.1, .3), .07)]
    for (a, ra), (b, rb) in zip(pts, pts[1:]):
        P.limb("body", a, b, ra, rb, 6)
    P.limb("belly", (0, 1.0, .3), (0, 1.8, .3), .2, .17, 4)
    # scutes along back and tail
    for y in (-.5, -.1, .3, .7):
        z = .5 + .36 * math.sqrt(max(0, 1 - ((y - .1) / 1.05) ** 2))
        scute(P, "ridge", (0, y, z - .03), .17, .08)
    for (a, ra), i in zip(pts[:3], range(3)):
        scute(P, "ridge" if i < 2 else "amber", (0, a[1] + .35, a[2] + ra * .75),
              .15, .07)
    scute(P, "amber", (0, 2.95, .3 + .08), .12, .06)


# ---------------------------------------------------------------- concept C
def build_c(P):
    # tiny body, feet, arms, tail
    P.ell("body", (0, .02, .42), (.38, .34, .36), 8, 6)
    P.ell("belly", (0, -.12, .38), (.3, .22, .28), 8, 5)
    for s in (-1, 1):
        P.box("body", (s * .2, -.2, .06), (.3, .42, .12), taper=(.8, .8))
        P.limb("body", (s * .2, -.02, .28), (s * .2, -.05, .1), .14, .12, 6)
        P.limb("body", (s * .36, -.05, .55), (s * .56, -.15, .38), .09, .07, 5)
        P.ell("body", (s * .58, -.17, .36), (.09, .09, .09), 5, 4)
    P.limb("body", (0, .25, .4), (0, .8, .3), .17, .05, 6)
    # big head
    P.ell("body", (0, -.12, 1.15), (.8, .72, .62), 10, 6)
    snout(P, -.5, -1.6, .55, .45, .95, .3, .2, k=0.1, teeth=0)
    # eyes: eager (wide, looking up, light lids)
    eye(P, (-.42, -.35, 1.7), .46, -1, lz=.74, ang=math.radians(-6),
        look=(0.1, 0.22))
    eye(P, (.42, -.35, 1.7), .46, 1, lz=.74, ang=math.radians(-6),
        look=(0.1, 0.22))
    # scutes
    for p in [(0, .3, 1.7), (0, .5, 1.3), (0, .48, .6)]:
        scute(P, "ridge", p, .18, .09)
    scute(P, "amber", (0, .55, .36), .13, .07)
    scute(P, "amber", (0, .72, .32), .1, .06)


# ---------------------------------------------------------------- scene setup
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.resolution_x = RES
    sc.render.resolution_y = RES
    sc.render.image_settings.file_format = "PNG"
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.render.dither_intensity = 0.0
    w = bpy.data.worlds.new("World")
    sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = lin(BG)
    bg.inputs["Strength"].default_value = 1.0
    sc.render.engine = "BLENDER_EEVEE"
    ev = sc.eevee
    for attr, val in (("taa_render_samples", 192), ("use_shadows", True),
                      ("use_raytracing", False)):
        try:
            setattr(ev, attr, val)
        except Exception:
            pass
    return sc


def make_lights(center, size):
    """Key light, mint rim light, amber kicker. Sized by character size."""
    for ob in [o for o in bpy.data.objects if o.type == "LIGHT"]:
        bpy.data.objects.remove(ob)
    c = Vector(center)
    specs = [
        ("Key", (-1.3, -1.9, 1.7), "#FFF4E6", 11, 1.4),
        ("Fill", (2.0, -1.6, 0.6), "#BFEFD8", 3.5, 1.6),
        ("Rim", (1.5, 1.8, 1.2), "#4ADE9B", 22, 1.0),
        ("Kicker", (-2.0, 1.5, 0.4), "#FFB454", 3, 0.8),
    ]
    for name, off, col, k, sz in specs:
        off = Vector(off) * size * 1.6
        ld = bpy.data.lights.new(name, "AREA")
        ld.shape = "SQUARE"
        ld.size = sz * size
        ld.color = lin(col)[:3]
        ld.energy = k * off.length ** 2
        ob = bpy.data.objects.new(name, ld)
        bpy.context.scene.collection.objects.link(ob)
        ob.location = c + off
        ob.rotation_euler = (-off).to_track_quat("-Z", "Y").to_euler()


def place_camera(cam, target, direction, dist):
    d = Vector(direction).normalized()
    cam.location = Vector(target) + d * dist
    cam.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler()
    bpy.context.view_layer.update()


def world_points(objs):
    pts = []
    for ob in objs:
        mw = ob.matrix_world
        pts += [mw @ v.co for v in ob.data.vertices]
    return pts


def fit_camera(cam, objs, direction, frac):
    """Place the camera so the character fills frac of the frame."""
    sc = bpy.context.scene
    pts = world_points(objs)
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts),
                 min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts),
                 max(p.z for p in pts)))
    target = (lo + hi) / 2
    dist = 8.0
    tan_half = math.tan(cam.data.angle / 2)
    for _ in range(8):
        place_camera(cam, target, direction, dist)
        nd = [world_to_camera_view(sc, cam, p) for p in pts]
        x0, x1 = min(n.x for n in nd), max(n.x for n in nd)
        y0, y1 = min(n.y for n in nd), max(n.y for n in nd)
        size = max(x1 - x0, y1 - y0)
        fw = 2 * dist * tan_half
        right = cam.matrix_world.to_3x3() @ Vector((1, 0, 0))
        up = cam.matrix_world.to_3x3() @ Vector((0, 1, 0))
        target = target + right * ((x0 + x1) / 2 - .5) * fw \
            + up * ((y0 + y1) / 2 - .5) * fw
        dist *= size / frac
    place_camera(cam, target, direction, dist)
    return target, max((hi - lo).x, (hi - lo).y, (hi - lo).z)


def tri_count(objs):
    n = 0
    for ob in objs:
        ob.data.calc_loop_triangles()
        n += len(ob.data.loop_triangles)
    return n


def render(path):
    sc = bpy.context.scene
    sc.render.filepath = os.path.join(OUT, path)
    bpy.ops.render.render(write_still=True)
    print("RENDERED", path)


def main():
    sc = reset_scene()
    mats = {k: make_material("M_" + k, c, r) for k, (c, r) in COLORS.items()}
    mats["mint"] = make_material("M_mint", "#4ADE9B", 0.5, emit=4.0)
    specs = [("A", "Upright_helper", build_a, -3.7),
             ("B", "Classic_croc", build_b, 0.0),
             ("C", "Big_head", build_c, 3.7)]
    colls, empties, objs, tris = {}, {}, {}, {}
    for key, nm, fn, xoff in specs:
        coll = bpy.data.collections.new(f"Concept_{key}_{nm}")
        sc.collection.children.link(coll)
        em = bpy.data.objects.new(f"Crocky_{key}_root", None)
        em.location = (xoff, 0, 0)
        coll.objects.link(em)
        P = Part(f"Crocky_{key}", coll, em)
        fn(P)
        objs[key] = P.finish(mats)
        tris[key] = tri_count(objs[key])
        colls[key], empties[key] = coll, em
    # Labels for the sheet.
    lab = bpy.data.collections.new("Labels")
    sc.collection.children.link(lab)
    for key, nm, fn, xoff in specs:
        cu = bpy.data.curves.new(f"Label_{key}", "FONT")
        cu.body = key
        cu.align_x = "CENTER"
        cu.size = 0.6
        cu.extrude = 0.02
        ob = bpy.data.objects.new(f"Label_{key}", cu)
        ob.rotation_euler = (math.radians(90), 0, 0)
        ob.location = (xoff, 0, -0.9)
        ob.data.materials.append(mats["mint"])
        lab.objects.link(ob)
    cdata = bpy.data.cameras.new("Cam")
    cdata.lens = 60
    cam = bpy.data.objects.new("Cam", cdata)
    sc.collection.objects.link(cam)
    sc.camera = cam
    print("TRIS", tris)

    def show(keys, labels=False):
        for k, c in colls.items():
            c.hide_render = k not in keys
            c.hide_viewport = k not in keys
        lab.hide_render = not labels
        lab.hide_viewport = not labels

    elev = math.radians(12)
    direction = (0, -math.cos(elev), math.sin(elev))
    for key in ("A", "B", "C"):
        show([key])
        for views, rot, suffix in (("3q", TURN, ""), ("front", 0.0, "-front")):
            for e in empties.values():
                e.rotation_euler = (0, 0, rot)
            bpy.context.view_layer.update()
            cdata.type = "PERSP"
            cdata.lens = 60
            target, size = fit_camera(cam, objs[key], direction, 0.72)
            make_lights(target, size)
            render(f"concept-{key.lower()}{suffix}.png")

    # Sheet: all three together, orthographic.
    show(["A", "B", "C"], labels=True)
    for e in empties.values():
        e.rotation_euler = (0, 0, TURN)
    bpy.context.view_layer.update()
    sc.render.resolution_x, sc.render.resolution_y = 1800, 800
    cdata.type = "ORTHO"
    cdata.ortho_scale = 11.6
    target = Vector((-0.2, -0.3, 0.55))
    place_camera(cam, target, (0, -math.cos(math.radians(8)),
                               math.sin(math.radians(8))), 40)
    make_lights(target, 3.4)
    render("concepts-sheet.png")
    sc.render.resolution_x = sc.render.resolution_y = RES

    # Leave the .blend with everything visible and a clean pose.
    show(["A", "B", "C"], labels=True)
    for e in empties.values():
        e.rotation_euler = (0, 0, 0)
    bpy.ops.wm.save_as_mainfile(
        filepath=os.path.join(OUT, "crocky-concepts.blend"))
    print("DONE")


main()
