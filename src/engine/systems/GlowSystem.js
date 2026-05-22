import * as THREE from 'three';
import emitter from '@/services/emitter.service';
import { EVENTS } from '@/constants/events';

export default class GlowSystem {
  constructor(camera, planets) {
    this.camera = camera;
    this.planets = planets;

    this.tmpCameraForward = new THREE.Vector3();
    this.tmpCameraWorldPos = new THREE.Vector3();
    this.tmpHomeWorldPos = new THREE.Vector3();
    this.tmpPlanetWorldPos = new THREE.Vector3();
    this.tmpToPlanet = new THREE.Vector3();
  }

  update() {
    const camera = this.camera;

    camera.getWorldDirection(this.tmpCameraForward);
    camera.getWorldPosition(this.tmpCameraWorldPos);

    const homePlanet = this.planets[0];

    homePlanet.mesh.getWorldPosition(this.tmpHomeWorldPos);

    const homeDistance = this.tmpCameraWorldPos.distanceTo(this.tmpHomeWorldPos);

    let bestPlanet = null;
    let bestAlignment = 0.9;

    this.planets.forEach((planet) => {
      if (planet === homePlanet) {
        planet.isTargetable = true;
        return;
      }

      planet.mesh.getWorldPosition(this.tmpPlanetWorldPos);

      const distance = this.tmpCameraWorldPos.distanceTo(this.tmpPlanetWorldPos);

      if (distance >= homeDistance && planet !== homePlanet) {
        planet.isTargetable = false;
        return;
      }

      this.tmpToPlanet.copy(this.tmpPlanetWorldPos).sub(this.tmpCameraWorldPos).normalize();

      const alignment = this.tmpCameraForward.dot(this.tmpToPlanet);

      if (alignment > bestAlignment) {
        bestAlignment = alignment;
        bestPlanet = planet;
      }
    });

    this.planets.forEach((planet) => {
      const targetable = planet === bestPlanet;

      if (planet.isTargetable !== targetable && planet !== homePlanet) {
        planet.isTargetable = targetable;

        if (targetable) {
          emitter.emit(EVENTS.PLANET_TARGETABLE, planet.id);
        }
      }

      planet.mesh.scale.setScalar(targetable ? 1.5 : 1);

      if (targetable) {
        planet.mesh.rotation.y += 0.05;
      }

      planet.mesh.traverse((child) => {
        if (!child.isMesh || !child.material) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];

        materials.forEach((material) => {
          if (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) {
            return;
          }

          if (targetable) {
            material.emissive.set(0x00ffff);
            material.emissiveIntensity = 10;
          } else {
            material.emissiveIntensity = 0.1;
          }
        });
      });
    });
  }
}
