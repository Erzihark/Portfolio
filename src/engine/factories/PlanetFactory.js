import * as THREE from 'three';
import ModelLoader from '../loaders/ModelLoader';
import { normalizeModel } from '../utils/normalize-model.util';

const BLOOM_LAYER = 1;

export default class PlanetFactory {
  constructor(scene) {
    this.scene = scene;
    this.loader = new ModelLoader();
  }

  async createPlanet({ id, modelPath, position, size, glowColor }) {
    const gltf = await this.loader.load(modelPath);
    const mesh = gltf.scene;

    normalizeModel(mesh, size);
    mesh.position.copy(position);
    mesh.scale.multiplyScalar(size);

    mesh.traverse((child) => {
      if (!child.isMesh || !child.material) return;

      child.layers.enable(BLOOM_LAYER);

      const originalMaterials = Array.isArray(child.material) ? child.material : [child.material];

      const convertedMaterials = originalMaterials.map((material) => {
        if (!material) return material;

        if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
          material.transparent = true;
          material.opacity = 1;
          material.depthWrite = true;

          material.toneMapped = true;
          material.envMapIntensity = 1.5;

          return material;
        }

        const converted = new THREE.MeshStandardMaterial({
          map: material.map || null,
          color: material.color || new THREE.Color(0xffffff),
          transparent: material.transparent || false,
          opacity: material.opacity ?? 1
        });

        converted.toneMapped = true;
        converted.emissive = glowColor;
        converted.emissiveIntensity = 3;
        converted.envMapIntensity = 1.5;
        converted.transparent = true;
        converted.opacity = 1;
        converted.depthWrite = true;

        return converted;
      });

      if (!Array.isArray(child.material)) {
        child.material = convertedMaterials[0];
      } else {
        child.material = convertedMaterials;
      }
    });

    this.scene.add(mesh);

    const planet = {
      id,
      mesh,
      radius: size,
      baseScale: size,
      isTargetable: false,
      glowColor,
      currentOpacity: 1,
      targetOpacity: 1
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
      modelPath: `${import.meta.env.BASE_URL}models/center.glb`,
      position: new THREE.Vector3(0, 0, 0),
      size: 1.4,
      glowColor: new THREE.Color(0x6cbcff)
    });
  }

  async createContactPlanet() {
    return this.createPlanet({
      id: 'contact',
      modelPath: `${import.meta.env.BASE_URL}models/contact.glb`,
      position: new THREE.Vector3(0, 0, 10),
      size: 0.9,
      glowColor: new THREE.Color(0xdedede)
    });
  }

  async createProjectsPlanet() {
    return this.createPlanet({
      id: 'projects',
      modelPath: `${import.meta.env.BASE_URL}models/projects.glb`,
      position: new THREE.Vector3(8, 0, 0),
      size: 1,
      glowColor: new THREE.Color(0xffb347)
    });
  }

  async createSkillsPlanet() {
    return this.createPlanet({
      id: 'skills',
      modelPath: `${import.meta.env.BASE_URL}models/skills.glb`,
      position: new THREE.Vector3(-8, 0, 0),
      size: 1.1,
      glowColor: new THREE.Color(0x5cff95)
    });
  }

  async createExperiencePlanet() {
    return this.createPlanet({
      id: 'experience',
      modelPath: `${import.meta.env.BASE_URL}models/experience.glb`,
      position: new THREE.Vector3(0, 0, -10),
      size: 1.1,
      glowColor: new THREE.Color(0xff6b6b)
    });
  }
}
