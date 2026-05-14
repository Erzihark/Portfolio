import * as THREE from 'three';

export default class InputController {
  constructor(renderer, worldRoot, worldEngine) {
    this.renderer = renderer;
    this.worldRoot = worldRoot;
    this.world = worldEngine;

    this.isDragging = false;

    this.previousPointer = {
      x: 0,
      y: 0
    };

    this.rotationVelocity = new THREE.Vector2();

    this.dragSensitivity = 0.00032;
    this.damping = 0.92;

    this.bindEvents();
  }

  bindEvents() {
    const canvas = this.renderer.domElement;

    canvas.addEventListener('pointerdown', this.onPointerDown);

    window.addEventListener('pointermove', this.onPointerMove);

    window.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerDown = (e) => {
    this.isDragging = true;

    this.previousPointer.x = e.clientX;
    this.previousPointer.y = e.clientY;
  };

  onPointerMove = (e) => {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.previousPointer.x;

    const deltaY = e.clientY - this.previousPointer.y;

    this.previousPointer.x = e.clientX;
    this.previousPointer.y = e.clientY;

    this.rotationVelocity.x += deltaY * this.dragSensitivity;

    this.rotationVelocity.y += deltaX * this.dragSensitivity;

    if (this.world?.isRunning) {
      this.world.player.rotation.z = Math.sin(performance.now() * 0.02) * 0.15;
    }
  };

  onPointerUp = () => {
    this.isDragging = false;
  };

  update() {
    if (!this.worldRoot) return;

    this.worldRoot.rotation.x += this.rotationVelocity.x;

    this.worldRoot.rotation.y += this.rotationVelocity.y;

    this.rotationVelocity.multiplyScalar(this.damping);
  }

  destroy() {
    const canvas = this.renderer.domElement;

    canvas.removeEventListener('pointerdown', this.onPointerDown);

    window.removeEventListener('pointermove', this.onPointerMove);

    window.removeEventListener('pointerup', this.onPointerUp);
  }
}
