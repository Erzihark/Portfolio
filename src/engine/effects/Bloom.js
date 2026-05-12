import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';

import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import * as THREE from 'three';
import AFRAME from 'aframe';

AFRAME.registerSystem('bloom-system', {
  init() {
    this.sceneEl.addEventListener('renderstart', () => {
      this.setupBloom();
    });
  },

  setupBloom() {
    const renderer = this.sceneEl.renderer;

    const scene = this.sceneEl.object3D;

    const camera =
      this.sceneEl.camera || this.sceneEl.querySelector('[camera]')?.getObject3D('camera');

    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    this.composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);

    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth * 0.25, window.innerHeight * 0.25),
      2.0,
      0.4,
      0.2
    );

    bloomPass.strength = 0.9;
    //bloomPass.threshold = 0.9;

    this.composer.addPass(bloomPass);

    renderer.setAnimationLoop(() => {
      this.composer.render();
    });
  }
});
