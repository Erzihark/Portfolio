export function forEachMaterial(object, callback) {
  object.traverse((child) => {
    if (!child.isMesh || !child.material) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];

    materials.forEach(callback);
  });
}
