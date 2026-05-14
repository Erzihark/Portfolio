import emitter from '../services/emitter.service';
import PlanetFactory from './PlanetFactory';
import Bloom from './effects/Bloom';
import * as THREE from 'three';

const BLOOM_LAYER = 1;
export default class WorldEngine {
  constructor(scene, camera, worldRoot, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.worldRoot = worldRoot;

    this.clock = new THREE.Clock();

    this.planets = [];
    this.activePlanet = null;

    this.player = null;
    this.playerAngle = 0;

    this.navigation = null;
    this.input = null;

    this.time = 0;
    this.isRunning = false;
    this.isTransitioning = false;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.bloom = new Bloom(this.renderer, this.scene, this.camera);

    this.tmpCameraForward = new THREE.Vector3();
    this.tmpCameraWorldPos = new THREE.Vector3();
    this.tmpHomeWorldPos = new THREE.Vector3();
    this.tmpPlanetWorldPos = new THREE.Vector3();
    this.tmpToPlanet = new THREE.Vector3();
  }

  init({ navigation, input }) {
    this.navigation = navigation;
    this.input = input;

    this.createPlayer();
    this.createPlanets();
    this.bindPlanetSelection();
    this.setInitialPlanet();
    this.setupLighting();

    this.animate();

    emitter.emit('world-ready');
  }

  createPlayer() {
    const geometry = new THREE.CapsuleGeometry(0.3, 1.0, 4, 8);

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff
    });

    this.player = new THREE.Mesh(geometry, material);

    this.scene.add(this.player);
  }

  createPlanets() {
    const factory = new PlanetFactory(this.worldRoot);

    this.planets = [
      factory.createCenterPlanet(),

      factory.createProjectsPlanet(),

      factory.createSkillsPlanet(),

      factory.createExperiencePlanet()
    ];
  }

  setInitialPlanet() {
    this.activePlanet = this.planets[0];

    this.placePlayerOnPlanet(this.activePlanet);

    emitter.emit('planet-changed', this.activePlanet.id);
  }

  placePlayerOnPlanet(planet) {
    const worldPos = new THREE.Vector3();

    planet.mesh.getWorldPosition(worldPos);

    const offset = new THREE.Vector3(0, planet.radius + 1.2, 0);

    const finalPos = worldPos.clone().add(offset);

    this.player.position.copy(finalPos);

    this.player.lookAt(worldPos);
  }

  setupLighting() {
    this.directional = new THREE.DirectionalLight(0xffffff, 1.5);

    this.directional.position.set(5, 10, 7);

    this.scene.add(this.directional);

    this.ambient = new THREE.AmbientLight(0x404040, 2);

    this.scene.add(this.ambient);
  }

  updatePlayer() {
    if (!this.activePlanet) return;

    // Player always stays on top
    this.placePlayerOnPlanet(this.activePlanet);

    // Fake running animation
    if (this.isRunning) {
      this.player.rotation.z = Math.sin(performance.now() * 0.02) * 0.08;
    } else {
      this.player.rotation.z = 0;
    }
  }

  travelToPlanet(planet) {
    if (planet === this.activePlanet) return;

    this.isTransitioning = true;

    this.targetPlanet = planet;
  }

  updatePlanetGlow() {
    const camera = this.camera;

    const cameraForward = this.tmpCameraForward;
    const cameraWorldPos = this.tmpCameraWorldPos;
    const homeWorldPos = this.tmpHomeWorldPos;
    const planetWorldPos = this.tmpPlanetWorldPos;
    const toPlanet = this.tmpToPlanet;

    camera.getWorldDirection(cameraForward);
    camera.getWorldPosition(cameraWorldPos);

    const homePlanet = this.planets[0];

    homePlanet.mesh.getWorldPosition(homeWorldPos);

    const homeDistance = cameraWorldPos.distanceTo(homeWorldPos);

    let bestPlanet = null;
    let bestAlignment = 0.9;

    this.planets.forEach((planet) => {
      if (planet === homePlanet) {
        planet.isTargetable = false;
        return;
      }

      planet.mesh.getWorldPosition(planetWorldPos);

      const distance = cameraWorldPos.distanceTo(planetWorldPos);

      if (distance >= homeDistance) {
        planet.isTargetable = false;
        return;
      }

      toPlanet.copy(planetWorldPos).sub(cameraWorldPos).normalize();

      const alignment = cameraForward.dot(toPlanet);

      if (alignment > bestAlignment) {
        bestAlignment = alignment;
        bestPlanet = planet;
      }

      planet.isTargetable = false;
    });

    this.planets.forEach((planet) => {
      const isTargetable = planet === bestPlanet;

      planet.isTargetable = isTargetable;

      planet.mesh.scale.setScalar(isTargetable ? 1.15 : 1);

      if (isTargetable) {
        planet.mesh.material.color.set('#222222');
        planet.mesh.material.emissive.set('#00ffff');
        planet.mesh.material.emissiveIntensity = 1;

        //planet.mesh.layers.enable(BLOOM_LAYER);
      } else {
        planet.mesh.material.emissiveIntensity = 0;
        planet.mesh.material.color.set(planet.ogColor);

        //planet.mesh.layers.disable(BLOOM_LAYER);
      }
    });
  }

  updatePlanetTransition() {
    const targetPos = new THREE.Vector3();

    this.targetPlanet.mesh.getWorldPosition(targetPos);

    targetPos.y += this.targetPlanet.radius + 1.2;

    this.player.position.lerp(targetPos, 0.05);

    // rotate world so target centers
    const targetRotationY = -this.targetPlanet.mesh.position.x * 0.08;

    this.worldRoot.rotation.y += (targetRotationY - this.worldRoot.rotation.y) * 0.05;

    const distance = this.player.position.distanceTo(targetPos);

    if (distance < 0.05) {
      this.activePlanet = this.targetPlanet;

      this.isTransitioning = false;
    }
  }

  bindPlanetSelection() {
    window.addEventListener('click', this.onClick);
  }

  onClick = (event) => {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;

    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const meshes = this.planets.map((planet) => planet.mesh);

    const intersections = this.raycaster.intersectObjects(meshes);

    if (!intersections.length) return;

    const planet = intersections[0].object.userData.planet;

    if (!planet?.isTargetable) return;

    this.travelToPlanet(planet);
  };

  updateTimeOfDay() {
    this.time += this.clock.getDelta() * 0.15;

    this.directional.position.set(Math.sin(this.time) * 10, 10, Math.cos(this.time) * 10);
  }

  setActivePlanet(planet) {
    this.activePlanet = planet;

    emitter.emit('planet-changed', planet.id);
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);

    this.renderer.dispose();

    this.bloom?.composer?.dispose();

    window.removeEventListener('click', this.onClick);
  }

  animate = () => {
    this.animationFrame = requestAnimationFrame(this.animate);

    this.input?.update();

    this.navigation?.update();

    if (!this.isTransitioning) {
      this.updatePlayer();
    } else {
      this.updatePlanetTransition();
    }

    this.updatePlanetGlow();

    this.updateTimeOfDay();

    this.bloom.render();
  };
}
