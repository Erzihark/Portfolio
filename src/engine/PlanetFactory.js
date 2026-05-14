import * as THREE from 'three';
import ModelLoader from './loaders/ModelLoader';
import { normalizeModel } from './utils/normalize-model.util';

const BLOOM_LAYER = 1;

export default class PlanetFactory {
  constructor(scene) {
    this.scene = scene;
    this.loader = new ModelLoader();
  }

  async createPlanet({
    id,
    modelPath,
    position,
    size = 1,
    emissive = 0xffffff,
    emissiveIntensity = 1.5
  }) {
    const mesh = await this.loader.load(modelPath);

    mesh.position.copy(position);
    normalizeModel(mesh, size);

    mesh.traverse((child) => {
      if (!child.isMesh) return;

      child.layers.enable(BLOOM_LAYER);

      const materials = Array.isArray(child.material) ? child.material : [child.material];

      materials.forEach((material) => {
        if (!material) return;

        if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
          material.toneMapped = true;

          // preserve original texture/color
          material.color.multiplyScalar(1);

          // preserve original emissive if it exists
          const originalEmissive = material.emissive
            ? material.emissive.clone()
            : new THREE.Color(0x000000);

          // mix original emissive with planet glow color
          material.emissive = originalEmissive.lerp(new THREE.Color(emissive), 0.35);

          // THIS is the important part
          material.emissiveIntensity = emissiveIntensity;

          // improve HDR response
          material.envMapIntensity = 1.5;

          material.needsUpdate = true;
        }
      });
    });

    this.scene.add(mesh);

    const planet = {
      id,
      mesh,
      radius: size,
      isTargetable: false,
      isActive: false
    };

    mesh.traverse((child) => {
      if (child.isMesh) {
        child.userData.planet = planet;
      }
    });

    return planet;
  }

  async createCenterPlanet() {
    return this.createPlanet({
      id: 'home',
      modelPath: '/models/center.glb',
      position: new THREE.Vector3(0, 0, 0),
      size: 4,
      emissive: 0x4444ff
    });
  }

  async createProjectsPlanet() {
    return this.createPlanet({
      id: 'projects',
      modelPath: '/models/projects.glb',
      position: new THREE.Vector3(8, 0, 0),
      size: 1.5,
      emissive: 0xff4444
    });
  }

  async createSkillsPlanet() {
    return this.createPlanet({
      id: 'skills',
      modelPath: '/models/skills.glb',
      position: new THREE.Vector3(-8, 0, 0),
      size: 1.5,
      emissive: 0x44ff44
    });
  }

  async createExperiencePlanet() {
    return this.createPlanet({
      id: 'experience',
      modelPath: '/models/experience.glb',
      position: new THREE.Vector3(0, 0, -10),
      size: 1.5,
      emissive: 0xffff44
    });
  }
}
