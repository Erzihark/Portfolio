import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export default class Bloom {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.setup();
  }

  setup() {
    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      depthBuffer: true,
      stencilBuffer: false
    });

    this.composer = new EffectComposer(this.renderer, renderTarget);

    const renderPass = new RenderPass(this.scene, this.camera);

    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.7,
      0.3,
      0.2
    );

    this.bloomPass.threshold = 0.15;
    this.bloomPass.strength = 0.8;
    this.bloomPass.radius = 0.4;

    this.composer.addPass(this.bloomPass);
  }

  render() {
    this.renderer.setRenderTarget(null);
    this.renderer.clearDepth();

    this.composer.render();
  }

  resize(width, height) {
    this.composer.setSize(width, height);
  }
}
