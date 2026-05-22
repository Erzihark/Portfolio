import * as THREE from 'three';

export default class SceneManager {
  constructor(container) {
    this.container = container;

    this.createRenderer();
    this.createScene();
    this.createCamera();
    this.createRoots();
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      premultipliedAlpha: false
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    this.container.appendChild(this.renderer.domElement);
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = null;
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(0, -4, 22);
  }

  createRoots() {
    this.skyRoot = new THREE.Group();
    this.worldRoot = new THREE.Group();

    this.scene.add(this.skyRoot);
    this.scene.add(this.worldRoot);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  destroy() {
    this.renderer.dispose();
  }
}
