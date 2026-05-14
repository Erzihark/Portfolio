import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class ModelLoader {
  constructor() {
    this.loader = new GLTFLoader();
    this.cache = new Map();
  }

  async load(path) {
    // Return deep clone from cache
    if (this.cache.has(path)) {
      const cached = this.cache.get(path);

      return cached.clone(true);
    }

    const gltf = await this.loader.loadAsync(path);

    const model = gltf.scene;

    model.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;

      //
      // IMPORTANT:
      // GLTF materials are often shared.
      // Always clone before modifying.
      //
      if (Array.isArray(child.material)) {
        child.material = child.material.map((material) => this.prepareMaterial(material));
      } else if (child.material) {
        child.material = this.prepareMaterial(child.material);
      }
    });

    this.cache.set(path, model);

    return model.clone(true);
  }

  prepareMaterial(material) {
    if (!material) return material;

    //
    // Clone GLTF material to avoid shared-state corruption
    //
    const cloned = material.clone();

    //
    // Safe env map intensity
    //
    if ('envMapIntensity' in cloned) {
      cloned.envMapIntensity = 1.5;
    }

    //
    // ONLY touch emissive-capable materials
    //
    if (cloned.isMeshStandardMaterial || cloned.isMeshPhysicalMaterial) {
      if (!cloned.emissive) {
        cloned.emissive = new THREE.Color(0x000000);
      }

      if (cloned.emissiveIntensity == null) {
        cloned.emissiveIntensity = 0;
      }
    }

    //
    // This is VERY important for postprocessing stability
    //
    cloned.needsUpdate = true;

    return cloned;
  }
}
