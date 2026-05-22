export default class RenderLoop {
  constructor(callback) {
    this.callback = callback;
    this.animationFrame = null;
    this.clock = performance;
    this.previousTime = 0;
  }

  start() {
    this.previousTime = performance.now();
    this.loop();
  }

  loop = () => {
    this.animationFrame = requestAnimationFrame(this.loop);

    const currentTime = performance.now();
    const delta = (currentTime - this.previousTime) / 1000;

    this.previousTime = currentTime;

    this.callback(delta);
  };

  destroy() {
    cancelAnimationFrame(this.animationFrame);
  }
}
