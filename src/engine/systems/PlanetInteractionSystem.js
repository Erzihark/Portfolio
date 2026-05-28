import * as THREE from 'three';
import emitter from '@/services/emitter.service';
import { EVENTS } from '@/constants/events';

export default class PlanetInteractionSystem {
  constructor(renderer, camera, planets) {
    this.renderer = renderer;
    this.camera = camera;
    this.planets = planets;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.isHoveringPlanet = false;

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('pointermove', this.onPointerMove, {
      passive: false
    });
  }

  onPointerMove = (event) => {
    const rect = this.renderer.domElement.getBoundingClientRect();

    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;

    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

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
    window.removeEventListener('pointermove', this.onPointerMove);
  }
}
