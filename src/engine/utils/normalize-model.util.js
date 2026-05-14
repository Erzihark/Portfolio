import * as THREE from 'three';

export function normalizeModel(model, targetSize = 1) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();

  box.getSize(size);

  const maxAxis = Math.max(size.x, size.y, size.z);

  const scale = targetSize / maxAxis;

  model.scale.multiplyScalar(scale);
}
