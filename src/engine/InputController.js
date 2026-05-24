import * as THREE from 'three';
import emitter from '../services/emitter.service';

import { EVENTS } from '@/constants/events';

export default class InputController {
  constructor(renderer, worldRoot) {
    this.renderer = renderer;
    this.worldRoot = worldRoot;

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

    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', this.onPointerDown, {
      passive: false
    });
    window.addEventListener('pointermove', this.onPointerMove, {
      passive: false
    });
    window.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerDown = (e) => {
    e.preventDefault();

    if (!e.isPrimary) return;

    this.isDragging = true;

    emitter.emit(EVENTS.IS_DRAGGING, true);

    this.previousPointer.x = e.clientX;
    this.previousPointer.y = e.clientY;

    if (this.renderer.domElement.setPointerCapture) {
      this.renderer.domElement.setPointerCapture(e.pointerId);
    }
  };

  onPointerMove = (e) => {
    if (!this.isDragging) return;

    e.preventDefault();

    const deltaX = e.clientX - this.previousPointer.x;

    this.previousPointer.x = e.clientX;
    this.previousPointer.y = e.clientY;

    const mobileMultiplier = e.pointerType === 'touch' ? 1.8 : 1;

    this.rotationVelocity.y += deltaX * this.dragSensitivity * mobileMultiplier;
  };

  onPointerUp = (e) => {
    this.isDragging = false;
    emitter.emit(EVENTS.IS_DRAGGING, false);

    if (this.renderer.domElement.releasePointerCapture) {
      this.renderer.domElement.releasePointerCapture(e.pointerId);
    }
  };

  update(delta) {
    const dt = delta * 60;

    this.worldRoot.rotation.y += this.rotationVelocity.y * dt;

    this.rotationVelocity.multiplyScalar(Math.pow(this.damping, dt));
  }

  destroy() {
    const canvas = this.renderer.domElement;

    canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
  }
}
