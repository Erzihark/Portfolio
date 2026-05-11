export default class InputController {
  constructor(sceneEl, world) {
    this.sceneEl = sceneEl;
    this.world = world;

    this.THREE = window.AFRAME.THREE;

    this.isDragging = false;

    this.previousPointer = { x: 0, y: 0 };

    this.rotationVelocity = new this.THREE.Vector2();

    this.dragSensitivity = 0.00032;

    this.damping = 0.92;

    this.bindEvents();
  }

  bindEvents() {
    const canvas = this.sceneEl.canvas;

    if (!canvas) {
      console.warn('A-Frame canvas not ready');
      return;
    }

    canvas.addEventListener('pointerdown', this.onPointerDown);

    window.addEventListener('pointermove', this.onPointerMove);

    window.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerDown = (e) => {
    console.log('DOWN');

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

    // RUNNING ANIMATION PLACEHOLDER
    if (this.world?.isRunning) {
      this.world.player.rotation.z = Math.sin(performance.now() * 0.02) * 0.15;
    }
  };

  onPointerUp = () => {
    this.isDragging = false;
  };

  update() {
    if (!this.world?.object3D) return;

    const root = this.world.object3D;

    root.rotation.x += this.rotationVelocity.x;

    root.rotation.y += this.rotationVelocity.y;

    this.rotationVelocity.multiplyScalar(this.damping);
  }

  destroy() {
    const canvas = this.sceneEl.canvas;

    if (canvas) {
      canvas.removeEventListener('pointerdown', this.onPointerDown);
    }

    window.removeEventListener('pointermove', this.onPointerMove);

    window.removeEventListener('pointerup', this.onPointerUp);
  }
}
