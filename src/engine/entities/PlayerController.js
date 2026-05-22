import * as THREE from 'three';
import ModelLoader from '../loaders/ModelLoader';

export default class PlayerController {
  constructor(scene) {
    this.scene = scene;

    this.modelLoader = new ModelLoader();

    this.floatTime = 0;

    this.tmpUp = new THREE.Vector3();
    this.tmpForward = new THREE.Vector3();

    this.correctionQuaternion = new THREE.Quaternion();
  }

  async init() {
    const gltf = await this.modelLoader.load('/models/ship.glb');

    this.player = gltf.scene;

    this.player.scale.setScalar(0.8);

    this.correctionQuaternion.setFromEuler(new THREE.Euler(0, Math.PI / 2, Math.PI / 2));

    this.player.traverse((child) => {
      if (!child.isMesh) return;

      child.layers.disable(1);

      if (child.material) {
        child.material.emissiveIntensity = 0;
      }
    });

    this.mixer = new THREE.AnimationMixer(this.player);

    gltf.animations.forEach((clip) => {
      this.mixer.clipAction(clip).play();
    });

    this.scene.add(this.player);
  }

  update(delta, activePlanet) {
    if (!activePlanet) return;

    this.placeOnPlanet(activePlanet);

    if (this.mixer) {
      this.mixer.update(delta);
    }
  }

  placeOnPlanet(planet) {
    const worldPos = new THREE.Vector3();

    planet.mesh.getWorldPosition(worldPos);

    this.floatTime += 0.03;

    const hoverOffset = Math.sin(this.floatTime) * 0.15;

    const up = this.tmpUp.copy(this.player.position).sub(worldPos).normalize();

    if (up.lengthSq() === 0) {
      up.set(0, 1, 0);
    }

    const finalPos = worldPos.clone().add(up.multiplyScalar(planet.radius + 1.2 + hoverOffset));

    this.player.position.copy(finalPos);

    const outward = this.tmpForward.copy(finalPos).sub(worldPos).normalize();

    const target = finalPos.clone().add(outward);

    this.player.lookAt(target);

    this.player.quaternion.multiply(this.correctionQuaternion);
  }
}
