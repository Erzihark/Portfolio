"""Build Crocky (concept C "Big head"): high-poly source, low-poly web model,
baked maps, renders, .blend and GLB.

Colour and skin follow Abronia graminea, the turquoise Mexican alligator
lizard: teal plates with dark gaps, a cream lower jaw and throat, and a pale
yellow ring around each eye.

Run: blender.exe --background --python make_crocky_c.py [-- view.png ...]
Blender axes: Z is up, the character faces -Y, the feet stand on z = 0.
glTF export turns this into Y up, facing +Z.

Pipeline:
1. HIGH model (collection Crocky_High, names start with "H_"): smooth
   metaball parts and dense primitives with flat materials. Its skin gets a
   computed scale texture, for the comparison render only.
2. LOW model (collection Crocky, the web model): the same parts with very
   few triangles, the same names, hierarchy and pivots.
3. Bake. This build has no Cycles, so the script bakes in Python. For each
   texel of the low atlas it casts a ray along the low normal onto the high
   mesh (BVHTree), reads the high normal and the scale pattern there, and
   writes base colour and a tangent-space normal in the low MikkTSpace frame.
   The bake runs at 1024 px and is reduced to 256 px (4 x 4 mean).
4. Flat parts (eye white, pupil, iris, highlight, eyelid, rim, jaw, mouth)
   do not use baked texels. Their UVs point at solid colour swatches in one
   column of the atlas, so their colour edges are crisp geometry.
   The mouth (palate and jaw top) has its own matte material.
"""
import bpy
import bmesh
import math
import os
import sys
import tempfile
import numpy as np
from mathutils import Vector, Matrix, Quaternion
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view

OUT = os.path.dirname(os.path.abspath(__file__))
BG = "#07090D"
RES = 1024
BAKE = 1024          # bake size, reduced to WEB for the web maps
WEB = 256
# Triangle budget of the low model. Decimate targets are approximate.
LOW = dict(head=320, body=60, tail=44, arm=30, leg=34, jaw_n=4, eye_n=4,
           pupil_segs=16, lid_segs=16)
HIGH_TEX = 2048      # texture of the high model (comparison only)

# Only render the views named on the command line (after "--"), if any.
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []

# ------------------------------------------------------------------ colours
# name: (hex, roughness)
COLORS = {
    "skin":   ("#2AC2C6", 0.4),     # gets the scale textures
    "lid":    ("#1FA6B0", 0.4),
    "ridge":  ("#0E7C86", 0.4),
    "belly":  ("#EDE8D0", 0.5),
    "white":  ("#F7F8F2", 0.15),
    "iris":   ("#0D4A52", 0.2),
    "pupil":  ("#07090B", 0.15),
    "shine":  ("#FFFFFF", 0.3),
    "mouth":  ("#3A111B", 0.9),
}
# Colours of the computed skin (sRGB).
SKIN_BASE = "#2AC2C6"
SKIN_GAP = "#0B6A74"
SKIN_TOP = "#86F0E6"
SKIN_CREAM = "#EDE8D0"
SKIN_RING = "#F3E6A2"
# Solid colour swatches in the right column of the atlas (top down).
SWATCHES = ["white", "pupil", "iris", "shine", "lid", "ridge", "belly",
            "mouth"]
SW = 1 / 16          # swatch size in UV units (16 px at 256)
ATLAS_FIT = 0.925    # the baked islands use [0, ATLAS_FIT] in U

# ------------------------------------------------------------------ main sizes
ZM = 0.44            # mouth level at the snout tip
Y_TIP = -0.68        # front of the upper snout
JAW_C = Vector((0.0, -0.345, ZM - 0.032))  # jaw centre before deform
JAW_S = Vector((0.17, 0.255, 0.048))       # jaw half sizes
JAW_P = 2.7                                 # jaw roundness exponent
HINGE = Vector((0.0, -0.08, ZM + 0.01))
EYE_R = 0.2
EYE_C = {1: Vector((0.2, -0.12, 0.8)), -1: Vector((-0.2, -0.12, 0.8))}
LOOK_AT = Vector((0.0, -3.0, 0.74))        # both pupils look at this point
LID_BACK = math.radians(45)                 # lid cap leans back
LID_HALF = math.radians(68)                 # lid cap half angle
BLINK = 112                                 # lid angle (deg) of a full blink


def srgb(hexcol):
    h = hexcol.lstrip("#")
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]


def lin(hexcol):
    """Convert an sRGB hex colour to linear RGBA."""
    v = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4
         for x in srgb(hexcol)]
    return (*v, 1.0)


def make_material(name, hexcol, rough):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(hexcol)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Specular IOR Level"].default_value = 0.1 if rough > 0.8 else 0.45
    m.diffuse_color = lin(hexcol)
    return m


def smooth(e0, e1, x):
    t = min(max((x - e0) / (e1 - e0), 0.0), 1.0)
    return t * t * (3 - 2 * t)


def nsmooth(e0, e1, x):
    """smoothstep for numpy arrays."""
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


# ------------------------------------------------------------------ deform
# The snout and the jaw share one deform, so the lips always match.
def taper(y):
    """Width factor of the snout. 1 at the back, smaller at the tip."""
    return 1.0 - 0.14 * smooth(-0.22, Y_TIP, y)


def smile(y):
    """Lift of the mouth line along the side. It curls up at the corners."""
    return 0.08 * smooth(-0.5, -0.24, y) * (1.0 - smooth(-0.19, -0.07, y))


def lift(xf, y):
    """Total lift of the mouth line at final x and y. Corners go up."""
    front = 1.0 - smooth(-0.42, -0.28, y)
    return smile(y) + 0.09 * min((xf / 0.2) ** 2, 1.3) * front


def deform_head(p):
    x, y, z = p
    s = smooth(-0.25, Y_TIP, y)
    if z > ZM:
        z = ZM + (z - ZM) * (1.0 - 0.12 * s)  # snout top slopes to the tip
    w = 1.0 - smooth(ZM - 0.02, ZM + 0.16, z)
    xf = x * taper(y)
    return Vector((xf, y, z + lift(xf, y) * w))


def deform_jaw(p):
    x, y, z = p
    xf = x * taper(y)
    return Vector((xf, y, z + lift(xf, y)))


def inside_jaw(p, margin=0.9):
    """True when the point is inside the closed jaw."""
    x, y, z = p
    z -= lift(x, y)
    x /= taper(y)
    d = Vector((x, y, z)) - JAW_C
    return sum(abs(d[i] / JAW_S[i]) ** JAW_P for i in range(3)) < margin


# ------------------------------------------------------------------ geometry
def basis(axis):
    a = Vector(axis).normalized()
    ref = Vector((0, 0, 1)) if abs(a.z) < 0.9 else Vector((1, 0, 0))
    u = a.cross(ref).normalized()
    v = a.cross(u)
    return u, v, a


def quad_sphere(bm, center, semi, n, p=2.0, mat=0, rot=None, top_mat=None,
                bowl=0.0):
    """Rounded box or ellipsoid with clean quad topology.
    p = 2 gives an ellipsoid, a larger p gives a rounder box.
    top_mat sets the material of the top (+Z) side. bowl hollows the top."""
    for v in bm.verts:
        v.tag = True
    res = bmesh.ops.create_cube(bm, size=2.0)
    edges = {e for v in res["verts"] for e in v.link_edges}
    if n > 1:
        bmesh.ops.subdivide_edges(bm, edges=list(edges), cuts=n - 1,
                                  use_grid_fill=True)
    verts = [v for v in bm.verts if not v.tag]
    faces = {f for v in verts for f in v.link_faces}
    for f in faces:
        f.material_index = mat
        if top_mat is not None and f.calc_center_median().z > 0.999:
            f.material_index = top_mat
    m = rot.to_matrix() if rot else Matrix.Identity(3)
    for v in verts:
        c = v.co.copy()
        # Equal-angle spread of the grid points.
        k = [math.tan(c[i] * math.pi / 4) if abs(abs(c[i]) - 1) > 1e-6
             else c[i] for i in range(3)]
        d = Vector(k).normalized()
        r = (abs(d.x) ** p + abs(d.y) ** p + abs(d.z) ** p) ** (1 / p)
        q = d / r
        if bowl and c.z > 0.999:
            edge = max(abs(c.x), abs(c.y))
            q.z -= bowl * (1 - edge ** 4)
        q = Vector((q.x * semi[0], q.y * semi[1], q.z * semi[2]))
        v.co = Vector(center) + m @ q
    return verts


def revolve(bm, center, axis, profile, segs, mats):
    """Surface of revolution around axis. profile = [(radius, angle)].
    Angle 0 makes a pole. mats[i] is the material of band i."""
    u, v, a = basis(axis)
    c = Vector(center)
    rings = []
    for R, ang in profile:
        if abs(ang) < 1e-9:
            rings.append([bm.verts.new(c + a * R)])
            continue
        ring = []
        for j in range(segs):
            ph = 2 * math.pi * j / segs
            d = math.sin(ang) * (math.cos(ph) * u + math.sin(ph) * v) \
                + math.cos(ang) * a
            ring.append(bm.verts.new(c + d * R))
        rings.append(ring)
    for i in range(len(rings) - 1):
        r0, r1 = rings[i], rings[i + 1]
        for j in range(segs):
            j1 = (j + 1) % segs
            if len(r0) == 1:
                vs = (r0[0], r1[j], r1[j1])
            elif len(r1) == 1:
                vs = (r0[j], r1[0], r0[j1])
            else:
                vs = (r0[j], r1[j], r1[j1], r0[j1])
            f = bm.faces.new(vs)
            f.material_index = mats[i]


def revolve_var(bm, center, axis, profile, mats):
    """Like revolve, but each ring has its own segment count.
    profile = [(radius, angle, segs)]. Angle 0 makes a pole.
    Two rings are stitched with triangles in order of angle."""
    u, v, a = basis(axis)
    c = Vector(center)
    rings = []
    for R, ang, segs in profile:
        if abs(ang) < 1e-9:
            rings.append([bm.verts.new(c + a * R)])
            continue
        ring = []
        for j in range(segs):
            ph = 2 * math.pi * j / segs
            d = math.sin(ang) * (math.cos(ph) * u + math.sin(ph) * v) \
                + math.cos(ang) * a
            ring.append(bm.verts.new(c + d * R))
        rings.append(ring)
    for i in range(len(rings) - 1):
        r0, r1 = rings[i], rings[i + 1]
        n0, n1 = len(r0), len(r1)
        if n0 == 1 or n1 == 1:
            n = max(n0, n1)
            for j in range(n):
                vs = (r0[0], r1[j], r1[(j + 1) % n]) if n0 == 1 else \
                    (r0[j], r1[0], r0[(j + 1) % n])
                bm.faces.new(vs).material_index = mats[i]
            continue
        a0 = b0 = 0
        while a0 < n0 or b0 < n1:
            # Advance the ring whose next vertex has the smaller angle.
            ta = (a0 + 1) / n0
            tb = (b0 + 1) / n1
            if b0 >= n1 or (a0 < n0 and ta <= tb):
                vs = (r0[a0 % n0], r1[b0 % n1], r0[(a0 + 1) % n0])
                a0 += 1
            else:
                vs = (r0[a0 % n0], r1[b0 % n1], r1[(b0 + 1) % n1])
                b0 += 1
            bm.faces.new(vs).material_index = mats[i]


DENSE = {}


def dense_metaball(name, elems, res, post=None):
    """Blend metaball elements into one dense triangle mesh (cached).
    elems = [(type, centre, half sizes, [round])]. Sizes are surface sizes."""
    if name in DENSE:
        return DENSE[name]
    mb = bpy.data.metaballs.new(name)
    mb.resolution = res
    mb.render_resolution = res
    mb.threshold = 0.6
    for kind, co, semi, *extra in elems:
        el = mb.elements.new(type=kind)
        el.co = co
        el.stiffness = 2.0
        if kind == "CUBE":
            # A cube element is a box (size) with a round edge (0.575 * radius).
            rnd = extra[0]
            el.radius = rnd / 0.575
            el.size_x, el.size_y, el.size_z = [s - rnd for s in semi]
        else:
            big = max(semi)
            el.radius = big / 0.575
            el.size_x, el.size_y, el.size_z = [s / big for s in semi]
    ob = bpy.data.objects.new(name, mb)
    bpy.context.scene.collection.objects.link(ob)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    bpy.data.objects.remove(ob)
    bpy.data.metaballs.remove(mb)
    if post:
        for v in me.vertices:
            v.co = post(v.co)
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-5)
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    bm.to_mesh(me)
    bm.free()
    DENSE[name] = me
    return me


def reduced(dense, target_tris):
    """Smooth the dense mesh a little and reduce it to about target_tris."""
    me = dense.copy()
    tmp = bpy.data.objects.new("tmp_reduce", me)
    bpy.context.scene.collection.objects.link(tmp)
    sm = tmp.modifiers.new("smooth", "SMOOTH")
    sm.factor = 0.5
    sm.iterations = 2
    md = tmp.modifiers.new("dec", "DECIMATE")
    md.ratio = min(1.0, target_tris / max(len(me.polygons), 1))
    dg = bpy.context.evaluated_depsgraph_get()
    out = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
    bpy.data.objects.remove(tmp)
    bpy.data.meshes.remove(me)
    return out


def lod_name(base, lod):
    return base if lod == "low" else "H_" + base


class Part:
    """One named object. Collects geometry in world space in a bmesh.
    mats are colour keys (high) or swatch keys / "skin" (low)."""

    def __init__(self, name, pivot, mats, pattern=None, lod="high"):
        self.name = name
        self.pivot = Vector(pivot)
        self.mats = mats
        self.pattern = pattern      # scale pattern of the "skin" faces
        self.lod = lod
        self.bm = bmesh.new()

    def m(self, key):
        return self.mats.index(key)

    def add_mesh(self, me, mat_of_face=None, mat="skin"):
        tmp = bmesh.new()
        tmp.from_mesh(me)
        for f in tmp.faces:
            f.material_index = self.m(mat)
            if mat_of_face:
                key = mat_of_face(f)
                if key:
                    f.material_index = self.m(key)
        me2 = bpy.data.meshes.new("tmp")
        tmp.to_mesh(me2)
        tmp.free()
        self.bm.from_mesh(me2)
        bpy.data.meshes.remove(me2)

    def ell(self, mat, c, semi, n=4, rot=None):
        quad_sphere(self.bm, c, semi, n, 2.0, self.m(mat), rot)

    def drop_faces(self, test):
        """Delete faces whose vertices all pass test(co)."""
        gone = [f for f in self.bm.faces if all(test(v.co) for v in f.verts)]
        bmesh.ops.delete(self.bm, geom=gone, context="FACES")

    def finish(self, coll):
        bm = self.bm
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        if self.lod == "low":
            bmesh.ops.triangulate(bm, faces=bm.faces[:])
        bmesh.ops.translate(bm, verts=bm.verts[:], vec=-self.pivot)
        me = bpy.data.meshes.new(self.name)
        bm.to_mesh(me)
        bm.free()
        me.shade_smooth()
        ob = bpy.data.objects.new(self.name, me)
        coll.objects.link(ob)
        ob.location = self.pivot
        ob["keys"] = ",".join(self.mats)
        return ob


def keel_plate(P, c, length, width, height, pitch=0.0):
    """Low keeled plate along the spine (dark teal)."""
    rot = Quaternion((1, 0, 0), pitch)
    P.ell("ridge", c, (width, length, height), 3, rot)


def not_in_eye(co, margin=0.004):
    return min((co - c).length for c in EYE_C.values()) < EYE_R - margin


# ------------------------------------------------------------------ parts
def build_head(lod):
    hi = lod == "high"
    P = Part(lod_name("Head", lod), (0, 0.02, 0.34),
             ["skin", "ridge", "mouth", "pupil"] if hi else ["skin", "mouth"],
             "head", lod)
    y0 = -0.185
    sy = (y0 - Y_TIP) / 2
    elems = [
        ("ELLIPSOID", (0, 0.0, 0.56), (0.35, 0.31, 0.27)),               # skull
        ("CUBE", (0, y0 - sy, ZM + 0.11), (0.245, sy, 0.11), 0.085),       # snout
        ("ELLIPSOID", (0.18, -0.1, 0.72), (0.17, 0.16, 0.12)),           # mounds
        ("ELLIPSOID", (-0.18, -0.1, 0.72), (0.17, 0.16, 0.12)),
        # One wide nose mound. Two mounds made an "M" crease between them.
        ("ELLIPSOID", (0, -0.6, ZM + 0.2), (0.12, 0.055, 0.04)),
    ]
    dense = dense_metaball("MBHead", elems, 0.011, deform_head)
    me = reduced(dense, 3300 if hi else LOW["head"])

    def palate(f):
        # Faces hidden inside the closed jaw form the inside of the mouth.
        return "mouth" if inside_jaw(f.calc_center_median()) else None

    # Low: the palate uses the mouth swatch, so it needs no baked texels.
    P.add_mesh(me, palate)
    bpy.data.meshes.remove(me)
    # Low: remove faces that the eyes hide. The high head stays closed, so
    # bake rays cannot pass through it.
    if not hi:
        P.drop_faces(not_in_eye)
    if hi:
        for s in (-1, 1):      # nostril holes
            c = deform_head(Vector((s * 0.075, -0.615, ZM + 0.238)))
            P.ell("pupil", c, (0.02, 0.024, 0.011), 2)
        for y, k in ((0.13, 1.0), (0.21, 0.92), (0.28, 0.82)):  # keels
            z = 0.56 + 0.27 * math.sqrt(max(1 - (y / 0.31) ** 2, 0.0))
            pitch = math.atan2(0.27 * (y / 0.31), 0.31 * math.sqrt(
                max(1 - (y / 0.31) ** 2, 0.02)))
            keel_plate(P, (0, y, z - 0.012), 0.04 * k, 0.026 * k, 0.022 * k,
                       pitch)
    return P


def build_jaw(lod):
    hi = lod == "high"
    P = Part(lod_name("Jaw", lod), HINGE, ["belly", "mouth"], None, lod)
    quad_sphere(P.bm, JAW_C, JAW_S, 8 if hi else LOW["jaw_n"], JAW_P,
                P.m("belly"), top_mat=P.m("mouth"), bowl=0.5)
    for v in P.bm.verts:
        v.co = deform_jaw(v.co)
    return P


def look_dir(side):
    return (LOOK_AT - EYE_C[side]).normalized()


def lid_profile(lod):
    """Profile of the eyelid cap: outer shell, round rim, inner shell."""
    # The low lid sits further out: its flat chords must clear the pupil.
    ro, ri = (EYE_R * 1.04, EYE_R * 1.008) if lod == "high" else         (EYE_R * 1.075, EYE_R * 1.047)
    th = LID_HALF
    if lod == "high":
        prof = [(ro, th * k / 6) for k in range(7)]
        steps = 4
    else:
        prof = [(ro, 0.0), (ro, th / 3), (ro, th * 2 / 3), (ro, th)]
        steps = 2
    rm, rh = (ro + ri) / 2, (ro - ri) / 2
    for k in range(1, steps):
        ph = math.pi * k / steps
        prof.append((rm + rh * math.cos(ph), th + 0.9 * rh / rm * math.sin(ph)))
    prof.append((ri, th))
    prof += [(ri, th * 0.5), (ri, 0.0)] if lod == "high" else [(ri, 0.0)]
    outer = 6 if lod == "high" else 3
    mats = [0] * outer + [1] * steps + [0] * 3
    return prof, mats[:len(prof) - 1]


def build_eye(side, lod, head_bvh=None):
    hi = lod == "high"
    tag = "L" if side == 1 else "R"
    c = EYE_C[side]
    eye = Part(lod_name("Eye_" + tag, lod), c, ["white"], None, lod)
    quad_sphere(eye.bm, c, (EYE_R,) * 3, 9 if hi else LOW["eye_n"], 2.0, 0)
    if head_bvh:
        # Drop the back of the eyeball that sits inside the head.
        def inside(co):
            hit = head_bvh.find_nearest(co)
            return hit[0] is not None and (co - hit[0]).dot(hit[1]) < -0.012
        eye.drop_faces(inside)
    # Pupil part: iris ring, pupil, one highlight. Pivot at the eye centre.
    pup = Part(lod_name("Pupil_" + tag, lod), c, ["iris", "pupil", "shine"],
               None, lod)
    a = look_dir(side)
    # Highlight up and to the viewer's left, same side for both eyes.
    off = Vector((-0.55, -0.05, 0.83)).normalized()
    off = (off - a * off.dot(a)).normalized()
    ha = a * math.cos(math.radians(14)) + off * math.sin(math.radians(14))
    if hi:
        n = 36
        lr = (1.008, 1.012, 1.016)     # layer radii: iris, pupil, highlight
        iris = [(EYE_R * lr[0], math.radians(t)) for t in (29, 33, 37)]
        revolve(pup.bm, c, a, iris, n, [0, 0])
        pupil = [(EYE_R * lr[1], math.radians(t))
                 for t in (0, 7.5, 15, 22.5, 30)]
        revolve(pup.bm, c, a, pupil, n, [1] * 4)
        hl = [(EYE_R * lr[2], math.radians(t)) for t in (0, 4, 7.5)]
        revolve(pup.bm, c, ha, hl, 16, [2, 2])
    else:
        # One cap: black pupil (8 then 16 segments) and an iris band.
        # The radius clears the eye chords under the flat pupil triangles.
        n = LOW["pupil_segs"]
        rp = EYE_R * 1.02
        prof = [(rp, 0.0, 1), (rp, math.radians(15), n // 2),
                (rp, math.radians(30), n), (rp, math.radians(37), n)]
        revolve_var(pup.bm, c, a, prof, [1, 1, 0])
        hl = [(EYE_R * 1.03, 0.0, 1), (EYE_R * 1.03, math.radians(7.5), 10)]
        revolve_var(pup.bm, c, ha, hl, [2])
    # Eyelid: a thin cap on the top-back of the eye with a darker rim.
    lid = Part(lod_name("Eyelid_" + tag, lod), c, ["lid", "ridge"], None, lod)
    tilt = math.radians(6) * side      # outer corner a little lower
    axis = Vector((math.sin(tilt), math.sin(LID_BACK),
                   math.cos(LID_BACK))).normalized()
    if hi:
        prof, mats = lid_profile(lod)
        revolve(lid.bm, c, axis, prof, 40, mats)
    else:
        # One shell (the material is double sided), dark band at the edge.
        # Its chords stay outside the pupil and highlight at full blink.
        n = LOW["lid_segs"]
        ro, th = EYE_R * 1.075, LID_HALF
        prof = [(ro, 0.0, 1), (ro, th * 0.38, n // 2), (ro, th * 0.74, n),
                (ro, th * 0.89, n), (ro, th, n)]
        revolve_var(lid.bm, c, axis, prof, [0, 0, 0, 1])
    return eye, pup, lid


def build_body(lod):
    hi = lod == "high"
    P = Part(lod_name("Body", lod), (0, 0.03, 0.12),
             ["skin", "belly", "ridge"] if hi else ["skin"], "body", lod)
    elems = [
        ("ELLIPSOID", (0, 0.03, 0.22), (0.165, 0.15, 0.17)),
        ("ELLIPSOID", (0, 0.02, 0.15), (0.185, 0.16, 0.1)),
    ]
    me = reduced(dense_metaball("MBBody", elems, 0.01),
                 520 if hi else LOW["body"])
    P.add_mesh(me)
    bpy.data.meshes.remove(me)
    if hi:
        # Cream belly patch: an ellipsoid that comes out of the front.
        P.ell("belly", (0, -0.06, 0.17), (0.115, 0.125, 0.125), 4)
        for z, k in ((0.31, 1.0), (0.24, 0.9)):
            keel_plate(P, (0, 0.165 + (0.31 - z) * 0.2, z), 0.034 * k,
                       0.022 * k, 0.02 * k, math.radians(60))
    return P


def build_arm(side, lod):
    tag = "L" if side == 1 else "R"
    sh = Vector((side * 0.145, -0.02, 0.295))
    hand = Vector((side * 0.235, -0.1, 0.17))
    P = Part(lod_name("Arm_" + tag, lod), sh, ["skin"], "limb", lod)
    elems = []
    for i in range(5):
        t = i / 4
        r = 0.042 - 0.006 * t
        elems.append(("BALL", tuple(sh.lerp(hand, t * 0.82)), (r, r, r)))
    elems.append(("ELLIPSOID", tuple(hand), (0.05, 0.046, 0.056)))
    thumb = hand + Vector((-side * 0.03, -0.038, 0.022))
    elems.append(("ELLIPSOID", tuple(thumb), (0.022, 0.024, 0.024)))
    dense = dense_metaball("MBArm" + tag, elems, 0.006)
    me = reduced(dense, 330 if lod == "high" else LOW["arm"])
    P.add_mesh(me)
    bpy.data.meshes.remove(me)
    return P


def build_leg(side, lod):
    tag = "L" if side == 1 else "R"
    hip = Vector((side * 0.085, 0.02, 0.13))
    P = Part(lod_name("Leg_" + tag, lod), hip, ["skin"], "limb", lod)
    ank = Vector((side * 0.095, -0.01, 0.05))
    elems = []
    for i in range(4):
        elems.append(("BALL", tuple(hip.lerp(ank, i / 3)), (0.058,) * 3))
    elems.append(("ELLIPSOID", (side * 0.1, -0.06, 0.04), (0.075, 0.1, 0.048)))
    for dx in (-0.035, 0.0, 0.035):
        elems.append(("BALL", (side * 0.1 + dx, -0.145, 0.032), (0.03,) * 3))

    def flat(p):
        # Flat sole on the ground.
        return Vector((p.x, p.y, max(p.z, 0.0)))

    dense = dense_metaball("MBLeg" + tag, elems, 0.006, flat)
    me = reduced(dense, 380 if lod == "high" else LOW["leg"])
    P.add_mesh(me)
    bpy.data.meshes.remove(me)
    return P


def tail_point(t):
    """Centre line of the tail. It goes back, then curls to the left side."""
    return Vector((0.26 * t ** 2.4, 0.1 + 0.5 * t - 0.16 * t ** 3,
                   0.15 - 0.13 * t + 0.03 * t ** 3))


def tail_radius(t):
    return 0.088 * (1 - t) ** 1.1 + 0.018 * t


def build_tail(lod):
    hi = lod == "high"
    P = Part(lod_name("Tail", lod), tail_point(0),
             ["skin", "ridge"] if hi else ["skin"], "tail", lod)
    elems = []
    for i in range(22):
        t = i / 21
        r = tail_radius(t)
        elems.append(("BALL", tuple(tail_point(t)), (r, r, r)))
    dense = dense_metaball("MBTail", elems, 0.006)
    me = reduced(dense, 560 if hi else LOW["tail"])
    P.add_mesh(me)
    bpy.data.meshes.remove(me)
    if hi:
        for t, k in ((0.22, 1.0), (0.4, 0.85), (0.58, 0.7)):
            c = tail_point(t) + Vector((0, 0, tail_radius(t) * 0.86))
            d = tail_point(t + 0.01) - tail_point(t)
            pitch = math.atan2(d.z, d.length)
            keel_plate(P, c, 0.034 * k, 0.02 * k, 0.018 * k, -pitch)
    return P


def build_all(lod, head_bvh=None):
    parts = [build_head(lod), build_jaw(lod), build_body(lod), build_tail(lod),
             build_arm(1, lod), build_arm(-1, lod), build_leg(1, lod),
             build_leg(-1, lod)]
    for side in (1, -1):
        parts += list(build_eye(side, lod, head_bvh))
    return parts


# ------------------------------------------------------------------ pattern
def hash3(c):
    """Pseudo random numbers in [0, 1) for integer cells, shape (n, 3)."""
    c = c.astype(np.int64)
    h = (c[..., 0] * 73856093) ^ (c[..., 1] * 19349663) ^ (c[..., 2] * 83492791)
    out = []
    for k in (1, 2, 3):
        x = (h * (k * 2654435761 + 1)) & 0xFFFFFF
        x = (x ^ (x >> 7)) * 1103515245 & 0xFFFFFF
        out.append((x & 0xFFFF) / 65536.0)
    return np.stack(out, -1)


def voronoi(q, jitter=0.45):
    """Edge distance and cell id of a jittered 3D grid. q in cell units."""
    base = np.floor(q)
    d1 = np.full(len(q), 9.0)
    d2 = np.full(len(q), 9.0)
    f1 = np.zeros_like(q)
    f2 = np.zeros_like(q)
    for ox in (-1, 0, 1):
        for oy in (-1, 0, 1):
            for oz in (-1, 0, 1):
                c = base + np.array((ox, oy, oz))
                f = c + 0.5 + jitter * (hash3(c) - 0.5)
                d = np.linalg.norm(q - f, axis=1)
                closer = d < d1
                mid = (~closer) & (d < d2)
                d2 = np.where(closer, d1, np.where(mid, d, d2))
                f2 = np.where(closer[:, None], f1, np.where(mid[:, None], f, f2))
                d1 = np.where(closer, d, d1)
                f1 = np.where(closer[:, None], f, f1)
    # Distance to the bisector plane between the two nearest points.
    m = (f1 + f2) / 2
    n = f2 - f1
    n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-9
    edge = np.abs(np.sum((m - q) * n, axis=1))
    return edge, d1, hash3(np.floor(f1 * 7.0))[:, 0]


def bricks(s, a, row, col):
    """Rows of keeled plates. s runs along the body, a runs around it."""
    r = s / row
    ri = np.floor(r)
    c = a / col + 0.5 * (ri % 2)
    fr, fc = r - ri, c - np.floor(c)
    edge = np.minimum(np.minimum(fr, 1 - fr),
                      np.minimum(fc, 1 - fc) * col / row) * row
    keel = 1 - nsmooth(0.0, 0.3, np.abs(fc - 0.5))
    cid = hash3(np.stack((ri, np.floor(c), ri * 0), -1))[:, 0]
    return edge, keel, cid, fr


def tail_frame():
    ts = np.linspace(0, 1, 241)
    pts = np.array([tail_point(t) for t in ts])
    rad = np.array([max(tail_radius(t), 0.045) for t in ts])
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    # Ring coordinate grows faster where the tail is thin.
    u = np.concatenate(([0], np.cumsum(seg / (0.5 * (rad[1:] + rad[:-1])))))
    tan = np.gradient(pts, axis=0)
    tan /= np.linalg.norm(tan, axis=1, keepdims=True)
    side = np.cross(tan, np.array((0, 0, 1.0)))
    side /= np.linalg.norm(side, axis=1, keepdims=True)
    up = np.cross(side, tan)
    return pts, rad, u, tan, side, up


TAIL = None
GAP = 0.096     # world size that maps to edge = 1 (gaps ~2 texels at 256)


def skin_pattern(kind, p):
    """Return height (world units) and colour (sRGB) for points p (n, 3)."""
    global TAIL
    if TAIL is None:
        TAIL = tail_frame()
    n = len(p)
    base = np.array(srgb(SKIN_BASE))
    gap = np.array(srgb(SKIN_GAP))
    top = np.array(srgb(SKIN_TOP))
    keel = np.zeros(n)
    slope = np.zeros(n)
    amp = 0.0032
    if kind == "head":
        # Large, tidy plates, mirrored left to right like a real head.
        # A smooth |x| has no kink, so the midline shows no crease.
        cell = 0.12
        mx = np.sqrt(p[:, 0] ** 2 + 0.03 ** 2)
        q = np.column_stack((mx, p[:, 1], p[:, 2])) / cell
        edge, d1, cid = voronoi(q, 0.22)
        edge = edge * cell / GAP
        dome = 1 - np.clip(d1 / 0.8, 0, 1)
        # Plain nose pad at the snout tip, no gap lines between the nostrils.
        nose = nsmooth(-0.53, -0.6, p[:, 1]) \
            * nsmooth(ZM + 0.11, ZM + 0.17, p[:, 2])
        edge = np.maximum(edge, nose)
        dome = dome * (1 - nose)
        amp = 0.0024
    elif kind == "limb":
        # Plain skin: plates on the small limbs turn to mush at 256 px.
        edge = np.ones(n)
        dome = np.zeros(n)
        cid = np.full(n, 0.5)
    elif kind == "body":
        rel = p[:, :2] - np.array((0.0, 0.03))
        ang = np.arctan2(rel[:, 0], rel[:, 1])          # seam at the front
        edge, keel, cid, slope = bricks(p[:, 2], ang * 0.17, 0.07, 0.065)
        edge = edge / GAP
        dome = keel
    else:  # tail
        pts, rad, u, tan, side, up = TAIL
        best = np.zeros(n, dtype=int)
        bd = np.full(n, 9.0)
        for i in range(len(pts)):
            d = np.sum((p - pts[i]) ** 2, axis=1)
            take = d < bd
            bd = np.where(take, d, bd)
            best = np.where(take, i, best)
        rel = p - pts[best]
        ang = np.arctan2(np.sum(rel * side[best], 1), np.sum(rel * up[best], 1))
        s = u[best] + np.sum(rel * tan[best], 1) / rad[best]
        edge, keel, cid, slope = bricks(s, ang, 0.75, 2 * math.pi / 9)
        edge = edge * 0.075 / GAP
        dome = keel
    edge = np.clip(edge, 0, 1)
    plate = nsmooth(0.02, 0.16, edge)
    h = 0.6 * plate + 0.25 * dome * plate + 0.25 * keel * plate \
        + 0.15 * slope * plate
    vary = (cid - 0.5) * 0.07
    col = gap + (base - gap) * nsmooth(0.05, 0.15, edge)[:, None]
    col = col + (top - col) * (0.42 * dome * plate)[:, None]
    col = col * (1 + vary)[:, None]
    flat = np.zeros(n)
    if kind == "head":
        sm = np.array([lift(x, y) for x, y in p[:, :2]])
        dz = p[:, 2] - (ZM + sm)
        # Dark mouth line on the lowest edge of the upper lip.
        line = (1 - nsmooth(0.01, 0.018, dz)) * (1 - nsmooth(-0.2, -0.1,
                                                              p[:, 1]))
        col = col + (gap * 0.75 - col) * line[:, None]
        flat = np.maximum(flat, line)
        # Cream cheeks and throat below the mouth line, behind the jaw.
        cream = (1 - nsmooth(-0.024, -0.014, dz))
        cream *= 1 - nsmooth(0.08, 0.14, p[:, 1])
        col = col + (np.array(srgb(SKIN_CREAM)) - col) * cream[:, None]
        flat = np.maximum(flat, cream * 0.85)
        # Pale yellow ring where each eye meets the head.
        for c in EYE_C.values():
            d = np.linalg.norm(p - np.array(c), axis=1) - EYE_R
            ring = 1 - nsmooth(0.013, 0.02, d)
            col = col + (np.array(srgb(SKIN_RING)) - col) * ring[:, None]
            flat = np.maximum(flat, ring)
    h = h * (1 - flat) + 0.6 * flat
    return h * amp, np.clip(col, 0, 1)


# ------------------------------------------------------------------ UVs
def edit_objects(objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.mode_set(mode="EDIT")


def uv_unwrap(objs, only_skin, weights=None):
    """Smart UV project into one atlas. weights scale the texel share."""
    sc = bpy.context.scene
    sc.tool_settings.use_uv_select_sync = True
    edit_objects(objs)
    for o in objs:
        bm = bmesh.from_edit_mesh(o.data)
        keys = o["keys"].split(",")
        for f in bm.faces:
            f.select = (keys[f.material_index] == "skin") if only_skin else True
        bmesh.update_edit_mesh(o.data)
    bpy.ops.uv.smart_project(angle_limit=math.radians(80), island_margin=0.0,
                             area_weight=0.0, correct_aspect=True,
                             scale_to_bounds=False)
    if weights:
        bpy.ops.object.mode_set(mode="OBJECT")
        for o in objs:
            k = math.sqrt(weights.get(o.name, 1.0))
            for d in o.data.uv_layers.active.data:
                d.uv = d.uv * k
        bpy.ops.object.mode_set(mode="EDIT")
    kw = dict(rotate=True, scale=True, margin=0.0)
    props = bpy.ops.uv.pack_islands.get_rna_type().properties.keys()
    if "margin_method" in props:
        kw["margin_method"] = "FRACTION"
        kw["margin"] = 3 / WEB           # about 6 px between islands at 256
    if "shape_method" in props:
        kw["shape_method"] = "CONCAVE"
    bpy.ops.uv.pack_islands(**kw)
    bpy.ops.object.mode_set(mode="OBJECT")


def swatch_uv(key):
    i = SWATCHES.index(key)
    return Vector((1 - SW / 2, 1 - SW * (i + 0.5)))


def set_swatch_uvs(ob, keep_skin=False):
    """Point every face of ob at the swatch of its colour key.
    keep_skin keeps the unwrapped UVs of the "skin" faces."""
    me = ob.data
    if not me.uv_layers:
        me.uv_layers.new(name="UVMap")
    keys = ob["keys"].split(",")
    uvl = me.uv_layers.active.data
    for p in me.polygons:
        if keep_skin and keys[p.material_index] == "skin":
            continue
        uv = swatch_uv(keys[p.material_index])
        for li in p.loop_indices:
            uvl[li].uv = uv


# ------------------------------------------------------------------ bake
def rasterize(ob, W, only_skin):
    """Texels covered by the triangles of ob: pixel, position, normal,
    tangent and bitangent sign (world space, MikkTSpace frame)."""
    me = ob.data
    mw = ob.matrix_world
    rot = mw.to_3x3()
    me.calc_tangents(uvmap=me.uv_layers.active.name)
    keys = ob["keys"].split(",")
    co = np.array([mw @ v.co for v in me.vertices])
    cn = np.array([(rot @ Vector(n.vector)).normalized()
                   for n in me.corner_normals])
    ct = np.array([(rot @ l.tangent) for l in me.loops])
    cs = np.array([l.bitangent_sign for l in me.loops])
    uvl = me.uv_layers.active.data
    out = [[], [], [], [], []]
    me.calc_loop_triangles()
    for lt in me.loop_triangles:
        if only_skin and keys[lt.material_index] != "skin":
            continue
        li = list(lt.loops)
        uv = np.array([uvl[i].uv[:] for i in li]) * W - 0.5
        d1, d2 = uv[1] - uv[0], uv[2] - uv[0]
        det = d1[0] * d2[1] - d2[0] * d1[1]
        if abs(det) < 1e-12:
            continue
        x0, y0 = np.floor(uv.min(0)).astype(int) - 1
        x1, y1 = np.ceil(uv.max(0)).astype(int) + 1
        xs, ys = np.meshgrid(np.arange(max(x0, 0), min(x1, W - 1) + 1),
                             np.arange(max(y0, 0), min(y1, W - 1) + 1))
        xs, ys = xs.ravel(), ys.ravel()
        px = np.stack((xs, ys), 1) - uv[0]
        l1 = (px[:, 0] * d2[1] - d2[0] * px[:, 1]) / det
        l2 = (d1[0] * px[:, 1] - px[:, 0] * d1[1]) / det
        l0 = 1 - l1 - l2
        ok = (l0 > -0.02) & (l1 > -0.02) & (l2 > -0.02)
        if not ok.any():
            continue
        bw = np.clip(np.stack((l0[ok], l1[ok], l2[ok]), 1), 0, 1)
        bw /= bw.sum(1, keepdims=True)
        out[0].append(ys[ok] * W + xs[ok])
        out[1].append(bw @ co[list(lt.vertices)])
        out[2].append(bw @ cn[li])
        out[3].append(bw @ ct[li])
        out[4].append(np.full(ok.sum(), cs[li[0]]))
    return [np.concatenate(a) for a in out]


class HighSet:
    """Triangles of one or more high objects in world space, with a BVH."""

    def __init__(self, objs):
        V, Tr, VN, mat, kind = [], [], [], [], []
        off = 0
        for ob in objs:
            me = ob.data
            mw = ob.matrix_world
            rot = mw.to_3x3()
            me.calc_loop_triangles()
            keys = ob["keys"].split(",")
            V.append(np.array([mw @ v.co for v in me.vertices]))
            VN.append(np.array([(rot @ v.normal).normalized()
                                for v in me.vertices]))
            Tr.append(np.array([lt.vertices[:] for lt in me.loop_triangles])
                      + off)
            for lt in me.loop_triangles:
                k = keys[lt.material_index]
                mat.append(k)
                kind.append(ob.get("pattern", "") if k == "skin" else "")
            off += len(me.vertices)
        self.V, self.Tr = np.concatenate(V), np.concatenate(Tr)
        self.VN = np.concatenate(VN)
        self.mat, self.kind = np.array(mat), np.array(kind)
        self.bvh = BVHTree.FromPolygons(self.V.tolist(), self.Tr.tolist())


def project(hs, P, N, cage):
    """Outermost high surface along the low normal, inside the cage.
    The ray starts outside the low surface and travels inward."""
    loc = np.zeros_like(P)
    tri = np.zeros(len(P), dtype=int)
    bvh = hs.bvh
    for i in range(len(P)):
        p, n = Vector(P[i]), Vector(N[i]).normalized()
        hit = bvh.ray_cast(p + n * cage, -n, 2 * cage)
        if hit[0] is None or hit[1].dot(n) < 0.0:
            # No hit, or the back of a surface: take the nearest point.
            hit = bvh.find_nearest(p)
        loc[i] = hit[0]
        tri[i] = hit[2]
    return loc, tri


def high_normal(hs, loc, tri):
    """Smooth high normal at the hit points (barycentric interpolation)."""
    t = hs.Tr[tri]
    a, b, c = hs.V[t[:, 0]], hs.V[t[:, 1]], hs.V[t[:, 2]]
    v0, v1, v2 = b - a, c - a, loc - a
    d00 = np.sum(v0 * v0, 1)
    d01 = np.sum(v0 * v1, 1)
    d11 = np.sum(v1 * v1, 1)
    d20 = np.sum(v2 * v0, 1)
    d21 = np.sum(v2 * v1, 1)
    den = d00 * d11 - d01 * d01 + 1e-20
    w1 = (d11 * d20 - d01 * d21) / den
    w2 = (d00 * d21 - d01 * d20) / den
    w0 = 1 - w1 - w2
    n = (w0[:, None] * hs.VN[t[:, 0]] + w1[:, None] * hs.VN[t[:, 1]]
         + w2[:, None] * hs.VN[t[:, 2]])
    return n / (np.linalg.norm(n, axis=1, keepdims=True) + 1e-12)


def shade(hs, loc, tri, nh):
    """Colour and bumped world normal at the high hit points."""
    col = np.zeros((len(loc), 3))
    nrm = nh.copy()
    keys = hs.mat[tri]
    kinds = hs.kind[tri]
    for k in set(keys.tolist()):
        if k != "skin":
            col[keys == k] = srgb(COLORS[k][0])
    for kind in set(kinds.tolist()) - {""}:
        sel = np.nonzero(kinds == kind)[0]
        for i in range(0, len(sel), 150000):
            s = sel[i:i + 150000]
            p, n = loc[s], nh[s]
            ref = np.where(np.abs(n[:, 2:3]) < 0.9, [[0, 0, 1.0]], [[1.0, 0, 0]])
            t1 = np.cross(n, ref)
            t1 /= np.linalg.norm(t1, axis=1, keepdims=True)
            t2 = np.cross(n, t1)
            eps = 0.0012
            h0, c0 = skin_pattern(kind, p)
            h1, _ = skin_pattern(kind, p + t1 * eps)
            h2, _ = skin_pattern(kind, p + t2 * eps)
            g = ((h1 - h0) / eps)[:, None] * t1 + ((h2 - h0) / eps)[:, None] * t2
            nb = n - g
            nrm[s] = nb / np.linalg.norm(nb, axis=1, keepdims=True)
            col[s] = c0
    return col, nrm


def to_tangent(nw, N, T, sign):
    N = N / (np.linalg.norm(N, axis=1, keepdims=True) + 1e-12)
    T = T - N * np.sum(T * N, 1, keepdims=True)
    T /= np.linalg.norm(T, axis=1, keepdims=True) + 1e-12
    B = np.cross(N, T) * sign[:, None]
    t = np.stack((np.sum(nw * T, 1), np.sum(nw * B, 1), np.sum(nw * N, 1)), 1)
    return t / (np.linalg.norm(t, axis=1, keepdims=True) + 1e-12)


def dilate(col, nrm, filled, steps):
    """Grow the islands so filtering and mip maps find no seams."""
    fm = filled.copy()
    for _ in range(steps):
        acc_c = np.zeros_like(col)
        acc_n = np.zeros_like(nrm)
        cnt = np.zeros(fm.shape)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            sh = np.roll(fm, (dy, dx), (0, 1))
            acc_c += np.roll(col, (dy, dx), (0, 1)) * sh[..., None]
            acc_n += np.roll(nrm, (dy, dx), (0, 1)) * sh[..., None]
            cnt += sh
        grow = (~fm) & (cnt > 0)
        col[grow] = acc_c[grow] / cnt[grow][:, None]
        nrm[grow] = acc_n[grow] / cnt[grow][:, None]
        fm |= grow
    return fm


def bake_low(lows, highs, W):
    """Bake colour and tangent normals of the low skin parts from high."""
    col = np.zeros((W * W, 3))
    nrm = np.zeros((W * W, 3))
    nrm[:] = (0, 0, 1)
    filled = np.zeros(W * W, bool)
    for ob in lows:
        hs = HighSet(highs[ob.name])
        pix, P, N, T, S = rasterize(ob, W, True)
        cage = 0.05 if ob.name == "Body" else 0.035
        loc, tri = project(hs, P, N, cage)
        nh = high_normal(hs, loc, tri)
        c, nw = shade(hs, loc, tri, nh)
        col[pix] = c
        nrm[pix] = to_tangent(nw, N, T, S)
        filled[pix] = True
        print("BAKED", ob.name, len(pix))
    col = col.reshape(W, W, 3)
    nrm = nrm.reshape(W, W, 3)
    # Fill the empty atlas so filtering and mip maps find no seams.
    fm = dilate(col, nrm, filled.reshape(W, W), 96)
    col[~fm] = srgb(SKIN_BASE)
    nrm[~fm] = (0, 0, 1)
    # Solid swatches for the flat parts (right column, top down).
    s = int(round(SW * W))
    for i, key in enumerate(SWATCHES):
        y1 = W - i * s
        col[y1 - s:y1, W - s:] = srgb(COLORS[key][0])
        nrm[y1 - s:y1, W - s:] = (0, 0, 1)
    return col, nrm


def downsample(img, k):
    W = img.shape[0] // k
    return img.reshape(W, k, W, k, -1).mean((1, 3))


def bake_high_skin(objs, W):
    """Computed scale texture for the high model (no ray casts needed)."""
    col = np.zeros((W * W, 3))
    nrm = np.zeros((W * W, 3))
    nrm[:] = (0, 0, 1)
    filled = np.zeros(W * W, bool)
    for ob in objs:
        pix, P, N, T, S = rasterize(ob, W, True)
        _, nw = shade_plain(ob["pattern"], P, N)
        _, c = skin_pattern(ob["pattern"], P)
        col[pix] = c
        nrm[pix] = to_tangent(nw, N, T, S)
        filled[pix] = True
    col = col.reshape(W, W, 3)
    nrm = nrm.reshape(W, W, 3)
    fm = dilate(col, nrm, filled.reshape(W, W), 12)
    col[~fm] = srgb(SKIN_BASE)
    return col, nrm


def shade_plain(kind, P, N):
    N = N / np.linalg.norm(N, axis=1, keepdims=True)
    ref = np.where(np.abs(N[:, 2:3]) < 0.9, [[0, 0, 1.0]], [[1.0, 0, 0]])
    t1 = np.cross(N, ref)
    t1 /= np.linalg.norm(t1, axis=1, keepdims=True)
    t2 = np.cross(N, t1)
    eps = 0.0012
    h0, _ = skin_pattern(kind, P)
    h1, _ = skin_pattern(kind, P + t1 * eps)
    h2, _ = skin_pattern(kind, P + t2 * eps)
    g = ((h1 - h0) / eps)[:, None] * t1 + ((h2 - h0) / eps)[:, None] * t2
    nb = N - g
    return None, nb / np.linalg.norm(nb, axis=1, keepdims=True)


def make_image(name, data, non_color, path=None, fmt="PNG", quality=90):
    """Write an image file and load it back packed into the .blend."""
    W = data.shape[0]
    img = bpy.data.images.new(name + "_tmp", W, W, alpha=False)
    if non_color:
        img.colorspace_settings.name = "Non-Color"
    rgba = np.concatenate((np.clip(data, 0, 1), np.ones((W, W, 1))), 2)
    img.pixels.foreach_set(rgba.astype(np.float32).ravel())
    if path is None:
        path = os.path.join(tempfile.gettempdir(), name + ".png")
    img.filepath_raw = path
    img.file_format = fmt
    try:
        img.save(filepath=path, quality=quality)
    except TypeError:
        img.save()
    bpy.data.images.remove(img)
    out = bpy.data.images.load(path)
    out.name = name
    if non_color:
        out.colorspace_settings.name = "Non-Color"
    out.pack()
    return out


def textured_material(name, col_img, nrm_img, rough):
    m = make_material(name, SKIN_BASE, rough)
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexImage")
    tc.image = col_img
    tc.location = (-500, 300)
    nt.links.new(tc.outputs["Color"], b.inputs["Base Color"])
    tn = nt.nodes.new("ShaderNodeTexImage")
    tn.image = nrm_img
    tn.location = (-500, -100)
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.location = (-200, -100)
    nm.space = "TANGENT"
    nm.uv_map = "UVMap"
    nt.links.new(tn.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])
    return m


# ------------------------------------------------------------------ scene
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.resolution_x = RES
    sc.render.resolution_y = RES
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.render.dither_intensity = 0.0
    sc.render.film_transparent = False
    w = bpy.data.worlds.new("World")
    sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = lin(BG)
    bg.inputs["Strength"].default_value = 1.0
    sc.render.engine = "BLENDER_EEVEE"
    ev = sc.eevee
    for attr, val in (("taa_render_samples", 128), ("use_shadows", True),
                      ("use_raytracing", False), ("shadow_ray_count", 3),
                      ("shadow_step_count", 12)):
        if hasattr(ev, attr):
            setattr(ev, attr, val)
    return sc


def make_lights(cam_dir, target, size):
    """Light rig that turns with the camera. Mint rim light from behind."""
    for ob in [o for o in bpy.data.objects if o.type == "LIGHT"]:
        bpy.data.objects.remove(ob)
    f = Vector(cam_dir).normalized()          # from target toward camera
    f.z = 0
    f.normalize()
    r = Vector((0, 0, 1)).cross(f)            # camera left
    up = Vector((0, 0, 1))
    specs = [  # name, (left, toward camera, up), colour, W per m^2, size
        ("Key", (1.3, 1.7, 1.5), "#FFF3E2", 9.0, 1.6),
        ("Fill", (-1.8, 1.2, 0.2), "#D6ECF0", 2.8, 1.8),
        ("Rim", (-1.4, -1.6, 1.0), "#4ADE9B", 55.0, 0.9),
        ("Rim2", (1.6, -1.4, 0.5), "#4ADE9B", 25.0, 0.8),
        ("Top", (0.0, 0.2, 2.2), "#FFFFFF", 2.5, 1.5),
    ]
    t = Vector(target)
    for name, (a, b, c), col, k, sz in specs:
        off = (r * a + f * b + up * c) * size * 1.5
        ld = bpy.data.lights.new(name, "AREA")
        ld.shape = "DISK"
        ld.size = sz * size
        ld.color = lin(col)[:3]
        ld.energy = k * off.length ** 2
        ob = bpy.data.objects.new(name, ld)
        bpy.context.scene.collection.objects.link(ob)
        ob.location = t + off
        ob.rotation_euler = (-off).to_track_quat("-Z", "Y").to_euler()


def place_camera(cam, target, direction, dist):
    d = Vector(direction).normalized()
    cam.location = Vector(target) + d * dist
    cam.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler()
    bpy.context.view_layer.update()


def world_points(objs):
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for ob in objs:
        mw = ob.matrix_world
        me = ob.evaluated_get(dg).data
        pts += [mw @ v.co for v in me.vertices]
    return pts


def fit_camera(cam, objs, direction, frac, aspect=1.0):
    """Place the camera so the objects fill frac of the frame."""
    sc = bpy.context.scene
    pts = world_points(objs)
    lo = Vector([min(p[i] for p in pts) for i in range(3)])
    hi = Vector([max(p[i] for p in pts) for i in range(3)])
    target = (lo + hi) / 2
    dist = 6.0
    tan_half = math.tan(cam.data.angle / 2)
    for _ in range(10):
        place_camera(cam, target, direction, dist)
        nd = [world_to_camera_view(sc, cam, p) for p in pts]
        x0, x1 = min(n.x for n in nd), max(n.x for n in nd)
        y0, y1 = min(n.y for n in nd), max(n.y for n in nd)
        size = max(x1 - x0, y1 - y0)
        fw = 2 * dist * tan_half
        right = cam.matrix_world.to_3x3() @ Vector((1, 0, 0))
        upv = cam.matrix_world.to_3x3() @ Vector((0, 1, 0))
        target = target + right * ((x0 + x1) / 2 - .5) * fw \
            + upv * ((y0 + y1) / 2 - .5) * fw / aspect
        dist *= size / frac
    place_camera(cam, target, direction, dist)
    return target, max(hi - lo)


def tri_count(objs):
    n = 0
    for ob in objs:
        ob.data.calc_loop_triangles()
        n += len(ob.data.loop_triangles)
    return n


def render(name):
    sc = bpy.context.scene
    sc.render.filepath = os.path.join(OUT, name)
    bpy.ops.render.render(write_still=True)
    print("RENDERED", name)


def view_dir(azim_deg, elev_deg):
    """Direction from the character to the camera. Azimuth 0 = front."""
    a, e = math.radians(azim_deg), math.radians(elev_deg)
    return Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e),
                   math.sin(e)))


def want(name):
    return not ARGS or name in ARGS


def assemble(obs, root, prefix):
    """Hierarchy: legs and body under the root, the face under the head."""
    p = lambda n: prefix + n
    parent_of = {p("Body"): root, p("Leg_L"): root, p("Leg_R"): root,
                 p("Head"): p("Body"), p("Arm_L"): p("Body"),
                 p("Arm_R"): p("Body"), p("Tail"): p("Body")}
    for name in obs:
        if name[len(prefix):].startswith(("Jaw", "Eye", "Pupil")):
            parent_of[name] = p("Head")
    for name, par in parent_of.items():
        ob = obs[name]
        par = obs[par] if isinstance(par, str) else par
        wl = ob.location.copy()
        ob.parent = par
        ob.location = wl - par.matrix_world.translation
        bpy.context.view_layer.update()


# ------------------------------------------------------------------ main
def main():
    sc = reset_scene()

    # 1. High model.
    hcoll = bpy.data.collections.new("Crocky_High")
    sc.collection.children.link(hcoll)
    hroot = bpy.data.objects.new("Crocky_High", None)
    hcoll.objects.link(hroot)
    hparts = build_all("high")
    hobs = {P.name: P.finish(hcoll) for P in hparts}
    for P in hparts:
        if P.pattern:
            hobs[P.name]["pattern"] = P.pattern
    bpy.context.view_layer.update()

    # 2. Low model. The eye backs inside the high head are dropped.
    hh = HighSet([hobs["H_Head"]])
    lcoll = bpy.data.collections.new("Crocky")
    sc.collection.children.link(lcoll)
    root = bpy.data.objects.new("Crocky", None)
    root.empty_display_type = "PLAIN_AXES"
    root.empty_display_size = 0.3
    lcoll.objects.link(root)
    lparts = build_all("low", hh.bvh)
    lobs = {P.name: P.finish(lcoll) for P in lparts}
    bpy.context.view_layer.update()

    # 3. High skin texture (comparison only).
    hskin = [hobs[P.name] for P in hparts if P.pattern]
    uv_unwrap(hskin, True)
    hc, hn = bake_high_skin(hskin, HIGH_TEX)
    hmat = {k: make_material("H_M_" + k, *v) for k, v in COLORS.items()}
    hmat["skin"] = textured_material(
        "H_M_skin", make_image("crocky-high-color", hc, False),
        make_image("crocky-high-normal", hn * 0.5 + 0.5, True), 0.4)
    for ob in hobs.values():
        for k in ob["keys"].split(","):
            ob.data.materials.append(hmat[k])

    # 4. Low atlas: baked skin parts, then swatch parts.
    lskin = [lobs[P.name] for P in lparts if P.pattern]
    # The face gets the most texels; small or low parts get fewer.
    weights = {"Head": 1.5, "Body": 0.9, "Tail": 0.7, "Arm_L": 0.7,
               "Arm_R": 0.7, "Leg_L": 0.6, "Leg_R": 0.6}
    uv_unwrap(lskin, True, weights)
    # Free the right column for the swatches. Only U shrinks (by 7.5 %),
    # so the islands keep the full height of the atlas.
    for ob in lskin:
        for d in ob.data.uv_layers.active.data:
            d.uv = Vector((d.uv.x * ATLAS_FIT, d.uv.y))
    for ob in lobs.values():
        set_swatch_uvs(ob, keep_skin=ob in lskin)
    highs = {ob.name: [hobs["H_" + ob.name]] for ob in lskin}
    col, nrm = bake_low(lskin, highs, BAKE)
    col = downsample(col, BAKE // WEB)
    nrm = downsample(nrm, BAKE // WEB)
    nrm /= np.linalg.norm(nrm, axis=2, keepdims=True)
    cimg = make_image("crocky-color", col, False,
                      os.path.join(OUT, "crocky-color.jpg"), "JPEG", 92)
    nimg = make_image("crocky-normal", nrm * 0.5 + 0.5, True,
                      os.path.join(OUT, "crocky-normal.png"), "PNG")
    m_body = textured_material("M_crocky", cimg, nimg, 0.42)
    m_eye = textured_material("M_eye", cimg, nimg, 0.12)
    # Matte mouth: no glossy rim light reflection inside the mouth.
    m_mouth = make_material("M_mouth", *COLORS["mouth"])
    m_mouth.node_tree.nodes["Principled BSDF"].inputs[
        "Specular IOR Level"].default_value = 0.0
    for ob in lobs.values():
        me = ob.data
        keys = ob["keys"].split(",")
        mouth = [keys[p.material_index] == "mouth" for p in me.polygons]
        me.materials.clear()
        eye = ob.name.startswith(("Eye_", "Pupil"))   # not the eyelids
        me.materials.append(m_eye if eye else m_body)
        if any(mouth):
            me.materials.append(m_mouth)
        for p, mo in zip(me.polygons, mouth):
            p.material_index = 1 if mo else 0
        del ob["keys"]
    for ob in hobs.values():
        del ob["keys"]
        if "pattern" in ob:
            del ob["pattern"]

    assemble(hobs, hroot, "H_")
    assemble(lobs, root, "")
    lows = list(lobs.values())
    highs_all = list(hobs.values())
    print("TRIS_LOW", tri_count(lows), {o.name: tri_count([o]) for o in lows})
    print("TRIS_HIGH", tri_count(highs_all))

    cdata = bpy.data.cameras.new("Cam")
    cdata.lens = 70
    cam = bpy.data.objects.new("Cam", cdata)
    sc.collection.objects.link(cam)
    sc.camera = cam

    def show(low=True, high=False):
        lcoll.hide_render = not low
        hcoll.hide_render = not high

    def shot(name, objs, az, el, frac=0.78):
        bpy.context.view_layer.update()
        d = view_dir(az, el)
        target, size = fit_camera(cam, objs, d, frac)
        make_lights(d, target, size)
        render(name)

    show(True, False)
    for name, az, el in [("crocky-34.png", 35, 12), ("crocky-front.png", 0, 8),
                         ("crocky-side.png", 90, 6),
                         ("crocky-back-34.png", 145, 16)]:
        if want(name):
            shot(name, lows, az, el)

    # Pivot tests: open jaw with a wink, and a full blink.
    if want("crocky-jaw-open.png"):
        lobs["Jaw"].rotation_euler.x = math.radians(25)
        lobs["Eyelid_R"].rotation_euler.x = math.radians(BLINK * 0.5)
        shot("crocky-jaw-open.png", lows, 35, 12)
    if want("crocky-blink.png"):
        lobs["Jaw"].rotation_euler.x = 0
        for s in ("L", "R"):
            lobs["Eyelid_" + s].rotation_euler.x = math.radians(BLINK)
        shot("crocky-blink.png", lows, 25, 10)
    for n in ("Jaw", "Eyelid_L", "Eyelid_R"):
        lobs[n].rotation_euler.x = 0
    bpy.context.view_layer.update()

    if want("crocky-icon.png"):
        head = [lobs[n] for n in lobs if n.startswith(
            ("Head", "Jaw", "Eye", "Pupil"))]
        hidden = [o for o in lows if o not in head]
        for o in hidden:
            o.hide_render = True
        sc.render.resolution_x = sc.render.resolution_y = 256
        shot("crocky-icon.png", head, 30, 10, 0.9)
        sc.render.resolution_x = sc.render.resolution_y = RES
        for o in hidden:
            o.hide_render = False

    # Wireframe: the real triangle density of the low model.
    if want("crocky-wire.png"):
        wmat = make_material("M_wire", "#04161A", 0.6)
        wires = []
        for ob in lows:
            w = bpy.data.objects.new(ob.name + "_wire", ob.data)
            lcoll.objects.link(w)
            w.parent = ob.parent
            w.matrix_world = ob.matrix_world.copy()
            md = w.modifiers.new("wire", "WIREFRAME")
            md.thickness = 0.0016
            md.use_even_offset = True
            md.offset = 1.0
            for slot in w.material_slots:
                slot.link = "OBJECT"
                slot.material = wmat
            wires.append(w)
        shot("crocky-wire.png", lows, 35, 12)
        for w in wires:
            bpy.data.objects.remove(w)

    # High and low side by side, same camera and light.
    if want("crocky-compare.png"):
        show(True, True)
        hroot.location.x = -0.62
        root.location.x = 0.62
        bpy.context.view_layer.update()
        sc.render.resolution_x = 2048
        d = view_dir(35, 12)
        target, size = fit_camera(cam, lows + highs_all, d, 0.8, 2.0)
        make_lights(d, target, size * 0.6)
        render("crocky-compare.png")
        sc.render.resolution_x = RES
        hroot.location.x = 0
        root.location.x = 0
        show(True, False)
        bpy.context.view_layer.update()

    # Save with a clean three-quarter camera; the high set hidden.
    d = view_dir(35, 12)
    target, size = fit_camera(cam, lows, d, 0.78)
    make_lights(d, target, size)
    hcoll.hide_viewport = True
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "crocky.blend"))
    hcoll.hide_viewport = False

    # Export only the low character hierarchy.
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for o in lows:
        o.select_set(True)
    bpy.context.view_layer.objects.active = root
    props = bpy.ops.export_scene.gltf.get_rna_type().properties.keys()
    kw = dict(filepath=os.path.join(OUT, "crocky.glb"), export_format="GLB",
              use_selection=True, export_apply=True, export_cameras=False,
              export_lights=False, export_yup=True, export_tangents=True,
              export_image_format="AUTO")
    kw = {k: v for k, v in kw.items() if k in props or k == "filepath"}
    bpy.ops.export_scene.gltf(**kw)
    print("EXPORTED", os.path.getsize(kw["filepath"]))
    print("DONE")


main()
