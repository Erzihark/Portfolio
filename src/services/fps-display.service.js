import Stats from 'stats.js';

class FPSCounter {
  constructor() {
    this.stats = new Stats();

    this.stats.showPanel(0);

    document.body.appendChild(this.stats.dom);

    this.animate = this.animate.bind(this);

    requestAnimationFrame(this.animate);
  }

  animate() {
    this.stats.begin();

    this.stats.end();

    requestAnimationFrame(this.animate);
  }
}

export default FPSCounter;
