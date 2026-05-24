import * as THREE from 'three';
import emitter from '@/services/emitter.service';
import { EVENTS } from '@/constants/events';
import { forEachMaterial } from '../utils/material.util';

export default class CameraController {
  constructor(camera, planets) {
    this.camera = camera;
    this.planets = planets;

    this.planetOpacityChangeSpeed = 5;
    this.transition = {
      active: false,
      returning: false,
      progress: 0,
      duration: 1.5,

      startPosition: new THREE.Vector3(),
      targetPosition: new THREE.Vector3(),

      startQuaternion: new THREE.Quaternion(),
      targetQuaternion: new THREE.Quaternion(),

      savedPosition: new THREE.Vector3(),
      savedQuaternion: new THREE.Quaternion()
    };

    this.lookMatrix = new THREE.Matrix4();
  }

  focusPlanet(planet) {
    if (this.transition.active) return;

    this.fadeOtherPlanets(planet);

    const t = this.transition;

    t.active = true;
    t.returning = false;
    t.progress = 0;

    emitter.emit(EVENTS.PLANET_TRANSITION_START, planet.id);

    t.savedPosition.copy(this.camera.position);
    t.savedQuaternion.copy(this.camera.quaternion);

    t.startPosition.copy(this.camera.position);
    t.startQuaternion.copy(this.camera.quaternion);

    const planetPos = new THREE.Vector3();

    planet.mesh.getWorldPosition(planetPos);

    const forward = new THREE.Vector3();

    this.camera.getWorldDirection(forward);

    const up = new THREE.Vector3(0, 1, 0);

    const right = new THREE.Vector3().crossVectors(forward, up).normalize();

    const isMobile = window.innerWidth < 768;

    const distance = isMobile ? 8 : 9;
    const horizontalOffset = isMobile ? 0 : -3.5;
    const verticalOffset = isMobile ? 0.5 : 1.2;

    const targetPos = planetPos
      .clone()
      .add(forward.clone().multiplyScalar(-distance))
      .add(right.clone().multiplyScalar(horizontalOffset))
      .add(up.clone().multiplyScalar(verticalOffset));

    t.targetPosition.copy(targetPos);

    this.lookMatrix.lookAt(targetPos, planetPos, up);

    t.targetQuaternion.setFromRotationMatrix(this.lookMatrix);
  }

  returnCamera() {
    const t = this.transition;

    if (!t.active) return;

    emitter.emit(EVENTS.PLANET_TRANSITION_START, null);

    this.restorePlanetVisibility();

    t.returning = true;
    t.progress = 0;

    t.startPosition.copy(this.camera.position);
    t.startQuaternion.copy(this.camera.quaternion);

    t.targetPosition.copy(t.savedPosition);
    t.targetQuaternion.copy(t.savedQuaternion);
  }

  update(delta) {
    const t = this.transition;

    this.planets.forEach((planet) => {
      const alpha = 1 - Math.exp(-this.planetOpacityChangeSpeed * delta);

      planet.currentOpacity = THREE.MathUtils.lerp(
        planet.currentOpacity,
        planet.targetOpacity,
        alpha
      );

      forEachMaterial(planet.mesh, (material) => {
        material.opacity = planet.currentOpacity;
        material.depthWrite = planet.currentOpacity > 0.5;
      });
    });

    if (!t.active) return;

    t.progress += delta / t.duration;

    const progress = Math.min(t.progress, 1);

    const eased = 1 - Math.pow(1 - progress, 3);

    this.camera.position.lerpVectors(t.startPosition, t.targetPosition, eased);

    this.camera.quaternion.copy(t.startQuaternion).slerp(t.targetQuaternion, eased);

    if (progress >= 1) {
      if (t.returning) {
        t.active = false;
        t.returning = false;
      }

      emitter.emit(EVENTS.PLANET_FOCUS_COMPLETE);
    }
  }

  fadeOtherPlanets(focusedPlanet) {
    this.planets.forEach((planet) => {
      const focused = planet === focusedPlanet;

      planet.targetOpacity = focused ? 1 : 0.08;
    });
  }

  restorePlanetVisibility() {
    this.planets.forEach((planet) => {
      planet.targetOpacity = 1;
    });
  }
}
