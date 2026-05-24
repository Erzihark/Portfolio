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
    const scale = 0.7;

    const renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth * scale,
      window.innerHeight * scale,
      {
        format: THREE.RGBAFormat,
        //type: THREE.HalfFloatType,
        depthBuffer: true,
        stencilBuffer: false
      }
    );

    this.composer = new EffectComposer(this.renderer, renderTarget);

    const renderPass = new RenderPass(this.scene, this.camera);

    this.composer.addPass(renderPass);

    const bloomStrength = 1.3;
    const bloomRadius = 2.5;
    const bloomThreshold = 0.1;

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth * scale, window.innerHeight * scale),
      bloomStrength,
      bloomRadius,
      bloomThreshold
    );

    this.composer.addPass(this.bloomPass);
  }

  render() {
    this.composer.render();
  }

  resize(width, height) {
    const scale = 0.5;

    this.composer.setSize(width * scale, height * scale);

    this.bloomPass.setSize(width * scale, height * scale);
  }
}
