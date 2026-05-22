import * as THREE from 'three';

export default class SkyManager {
  constructor(root, input) {
    this.root = root;
    this.input = input;

    this.targetRotationY = 0;
  }

  init() {
    const textureLoader = new THREE.TextureLoader();

    const texture = textureLoader.load(`${import.meta.env.BASE_URL}images/environment.jpg`);

    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.SphereGeometry(30, 64, 64);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      toneMapped: false
    });

    this.sky = new THREE.Mesh(geometry, material);

    this.sky.material.color.setScalar(0.3);

    this.root.add(this.sky);
  }

  update() {
    if (!this.input) return;

    this.targetRotationY += this.input.rotationVelocity.y * 0.03;

    this.root.rotation.y += (this.targetRotationY - this.root.rotation.y) * 0.02;
  }
}
