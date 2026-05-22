import * as THREE from 'three';
import emitter from '@/services/emitter.service';
import { EVENTS } from '@/constants/events';

export default class PlanetInteractionSystem {
  constructor(camera, planets) {
    this.camera = camera;
    this.planets = planets;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.isHoveringPlanet = false;

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('mousemove', this.onMouseMove);
  }

  onMouseMove = (event) => {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.updateHoverStatus();
  };

  getIntersectedPlanet() {
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const meshes = this.planets.map((planet) => planet.mesh);

    const intersections = this.raycaster.intersectObjects(meshes, true);

    if (!intersections.length) {
      return null;
    }

    const planet = intersections[0].object.userData.planet;

    if (!planet?.isTargetable) {
      return null;
    }

    return planet;
  }

  updateHoverStatus() {
    const planet = this.getIntersectedPlanet();

    const hovering = !!planet;

    if (hovering !== this.isHoveringPlanet) {
      this.isHoveringPlanet = hovering;

      emitter.emit(EVENTS.PLANET_HOVER, hovering);
    }
  }

  destroy() {
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}
