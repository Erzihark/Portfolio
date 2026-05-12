export default class PlanetFactory {
  constructor(scene) {
    this.scene = scene;
    this.THREE = window.AFRAME.THREE;
  }

  createPlanet({ id, position, color, size }) {
    const geometry = new this.THREE.SphereGeometry(size, 32, 32);

    const material = new this.THREE.MeshStandardMaterial({
      color,
      emissive: 0x000000,
      emissiveIntensity: 0
    });

    const mesh = new this.THREE.Mesh(geometry, material);

    mesh.position.copy(position);

    this.scene.add(mesh);

    const spriteMaterial = new this.THREE.SpriteMaterial({
      color,
      transparent: true,
      opacity: 0
    });

    const glowSprite = new this.THREE.Sprite(spriteMaterial);

    glowSprite.scale.set(size * 3, size * 3, 1);

    mesh.add(glowSprite);

    const planet = {
      id,
      mesh,
      radius: size,
      glowSprite,
      isTargetable: false,
      isActive: false
    };

    // attach reverse lookup
    mesh.userData.planet = planet;

    return planet;
  }

  createCenterPlanet() {
    return this.createPlanet({
      id: 'home',
      position: new this.THREE.Vector3(0, 0, 0),
      color: 0x4444ff,
      size: 4
    });
  }

  createProjectsPlanet() {
    return this.createPlanet({
      id: 'projects',
      position: new this.THREE.Vector3(8, 0, 0),
      color: 0xff4444,
      size: 1.5
    });
  }

  createSkillsPlanet() {
    return this.createPlanet({
      id: 'skills',
      position: new this.THREE.Vector3(-8, 0, 0),
      color: 0x44ff44,
      size: 1.5
    });
  }

  createExperiencePlanet() {
    return this.createPlanet({
      id: 'experience',
      position: new this.THREE.Vector3(0, 0, -10),
      color: 0xffff44,
      size: 1.5
    });
  }
}
