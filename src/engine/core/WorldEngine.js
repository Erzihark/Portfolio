import emitter from '../services/emitter.service';
import PlanetFactory from './factories/PlanetFactory';
import Bloom from './effects/Bloom';
import ModelLoader from './loaders/ModelLoader';
import * as THREE from 'three';

export default class WorldEngine {
  constructor(scene, camera, worldRoot, skyRoot, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.worldRoot = worldRoot;
    this.skyRoot = skyRoot;

    this.clock = new THREE.Clock();

    this.planets = [];
    this.activePlanet = null;

    this.player = null;
    this.playerAngle = 0;
    this.playerFloatTime = 0;
    this.tmpUp = new THREE.Vector3();
    this.tmpForward = new THREE.Vector3();
    this.playerCorrectionQuaternion = new THREE.Quaternion();

    this.input = null;

    this.time = 0;
    this.isTransitioning = false;

    this.cameraTransition = {
      active: false,
      returning: false,
      progress: 0,
      duration: 1.5,

      startPosition: new THREE.Vector3(),
      startQuaternion: new THREE.Quaternion(),

      targetPosition: new THREE.Vector3(),
      targetQuaternion: new THREE.Quaternion(),

      savedPosition: new THREE.Vector3(),
      savedQuaternion: new THREE.Quaternion(),

      focusedPlanet: null
    };

    this.tmpLookMatrix = new THREE.Matrix4();

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.bloom = new Bloom(this.renderer, this.scene, this.camera);

    this.tmpCameraForward = new THREE.Vector3();
    this.tmpCameraWorldPos = new THREE.Vector3();
    this.tmpHomeWorldPos = new THREE.Vector3();
    this.tmpPlanetWorldPos = new THREE.Vector3();
    this.tmpToPlanet = new THREE.Vector3();

    this.modelLoader = new ModelLoader();

    this.isMobile = window.innerWidth < 768;
  }

  async init({ input }) {
    this.input = input;

    this.createBackground();
    await this.createPlayer();
    await this.createPlanets();
    this.bindPlanetSelection();
    this.setInitialPlanet();
    this.setupLighting();
    this.addEventListeners();

    this.animate();

    this.worldRoot.rotation.x += 0.3;

    emitter.emit('world-ready');
  }

  addEventListeners() {
    emitter.on('close-planet-view', () => {
      this.restorePlanetVisibility();
      this.returnCamera();
    });
    emitter.on('navigate-to', ({ event, id }) => {
      this.onClick(event, id);
    });
  }

  createBackground() {
    const textureLoader = new THREE.TextureLoader();

    const skyTexture = textureLoader.load('/images/environment.jpg');

    skyTexture.colorSpace = THREE.SRGBColorSpace;

    const skyGeometry = new THREE.SphereGeometry(30, 64, 64);

    const skyMaterial = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
      toneMapped: false
    });

    this.sky = new THREE.Mesh(skyGeometry, skyMaterial);

    // darker
    this.sky.material.color.setScalar(0.3);

    this.skyRoot.add(this.sky);

    this.skyTargetRotationY = 0;
  }

  async createPlayer() {
    const gltf = await this.modelLoader.loader.loadAsync('/models/ship.glb');

    this.player = gltf.scene;

    this.player.scale.setScalar(0.8);

    this.playerCorrectionQuaternion.setFromEuler(new THREE.Euler(0, Math.PI / 2, Math.PI / 2));

    this.player.traverse((child) => {
      if (!child.isMesh) return;

      child.layers.disable(1);

      if (child.material) {
        child.material.emissiveIntensity = 0;
      }
    });

    // animation setup
    this.playerMixer = new THREE.AnimationMixer(this.player);

    if (gltf.animations.length) {
      gltf.animations.forEach((clip) => {
        const action = this.playerMixer.clipAction(clip);

        action.play();
      });
    }

    this.scene.add(this.player);
  }

  async createPlanets() {
    const factory = new PlanetFactory(this.worldRoot);

    this.planets = await Promise.all([
      factory.createCenterPlanet(),
      factory.createProjectsPlanet(),
      factory.createSkillsPlanet(),
      factory.createExperiencePlanet(),
      factory.createContactPlanet()
    ]);
  }

  setInitialPlanet() {
    this.activePlanet = this.planets[0];

    this.placePlayerOnPlanet(this.activePlanet);

    emitter.emit('planet-changed', this.activePlanet.id);
  }

  placePlayerOnPlanet(planet) {
    const worldPos = new THREE.Vector3();
    planet.mesh.getWorldPosition(worldPos);

    this.playerFloatTime += 0.03;

    const hoverOffset = Math.sin(this.playerFloatTime) * 0.15;

    // Direction from planet center outward
    const up = this.tmpUp.copy(this.player.position).sub(worldPos).normalize();

    // If player starts at center, fallback
    if (up.lengthSq() === 0) {
      up.set(0, 1, 0);
    }

    // Position player above planet surface
    const finalPos = worldPos.clone().add(up.multiplyScalar(planet.radius + 1.2 + hoverOffset));

    this.player.position.copy(finalPos);

    // Make ship face away from planet
    const outward = this.tmpForward.copy(finalPos).sub(worldPos).normalize();

    const target = finalPos.clone().add(outward);

    this.player.lookAt(target);

    // Apply model correction
    this.player.quaternion.multiply(this.playerCorrectionQuaternion);
  }

  getIntersectedPlanet() {
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const meshes = this.planets.map((planet) => planet.mesh);

    const intersections = this.raycaster.intersectObjects(meshes, true);

    if (!intersections.length) {
      return null;
    }

    const planet = intersections[0].object.userData.planet;

    if (!planet?.isTargetable) {
      return null;
    }

    return planet;
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
  }

  updateSky() {
    if (!this.input) return;

    // tiny horizontal movement only
    this.skyTargetRotationY += this.input.rotationVelocity.y * 0.03;

    // smooth lag
    this.skyRoot.rotation.y += (this.skyTargetRotationY - this.skyRoot.rotation.y) * 0.02;
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

      if (isTargetable) {
        planet.mesh.rotation.y += 0.05;
      }

      planet.isTargetable = isTargetable;

      planet.mesh.scale.setScalar(isTargetable ? 1.15 : 1);

      planet.mesh.traverse((child) => {
        if (!child.isMesh || !child.material) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];

        materials.forEach((material) => {
          if (!material) return;

          const supportsEmissive =
            material.isMeshStandardMaterial || material.isMeshPhysicalMaterial;

          if (!supportsEmissive) return;

          if (!material.emissive) {
            material.emissive = new THREE.Color(0x000000);
          }

          if (isTargetable) {
            material.emissive.set(0x00ffff);
            material.emissiveIntensity = 10;
          } else {
            material.emissiveIntensity = 0.1;
          }

          material.needsUpdate = true;
        });
      });
    });
  }

  updatePlanetTransition() {
    const targetWorldPos = new THREE.Vector3();

    this.targetPlanet.mesh.getWorldPosition(targetWorldPos);

    // Direction from target planet outward
    const outward = this.player.position.clone().sub(targetWorldPos).normalize();

    const targetPos = targetWorldPos
      .clone()
      .add(outward.multiplyScalar(this.targetPlanet.radius + 1.2));

    // Smooth movement
    this.player.position.lerp(targetPos, 0.05);

    // FACE MOVEMENT DIRECTION
    const moveDirection = targetPos.clone().sub(this.player.position).normalize();

    const lookTarget = this.player.position.clone().add(moveDirection);

    this.player.lookAt(lookTarget);

    this.player.rotateZ(Math.PI / 2);
    this.player.rotateY(Math.PI / 2);

    // Apply correction
    this.player.quaternion.multiply(this.playerCorrectionQuaternion);

    const distance = this.player.position.distanceTo(targetPos);

    if (distance < 0.05) {
      this.activePlanet = this.targetPlanet;
      this.isTransitioning = false;
    }
  }

  updateHoverStatus() {
    const planet = this.getIntersectedPlanet();

    const isHovering = !!planet;

    if (this.isHoveringPlanet !== isHovering) {
      this.isHoveringPlanet = isHovering;

      emitter.emit('planet-hover', isHovering);
    }
  }

  updateCameraTransition(delta) {
    const transition = this.cameraTransition;

    if (!transition.active) return;

    transition.progress += delta / transition.duration;

    const t = Math.min(transition.progress, 1);

    // Smooth easing
    const eased = 1 - Math.pow(1 - t, 3);

    this.camera.position.lerpVectors(transition.startPosition, transition.targetPosition, eased);

    this.camera.quaternion
      .copy(transition.startQuaternion)
      .slerp(transition.targetQuaternion, eased);

    if (t >= 1) {
      if (transition.returning) {
        transition.active = false;
        transition.returning = false;
        transition.focusedPlanet = null;
      } else {
        emitter.emit('planet-focus-complete');
      }
    }
  }

  bindPlanetSelection() {
    window.addEventListener('click', this.onClick);
    window.addEventListener('mousemove', this.onMouseMove);
  }

  onClick = (event, id = null) => {
    if (this.isTransitioning || this.cameraTransition.active) {
      return;
    }

    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const planet =
      id === null ? this.getIntersectedPlanet() : this.planets.find((planet) => planet.id === id);

    emitter.emit('planet-hover', !!planet);

    if (!planet) return;

    this.travelToPlanet(planet);
    this.focusPlanet(planet);
  };

  onMouseMove = (event) => {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.updateHoverStatus();
  };

  focusPlanet(planet) {
    if (this.cameraTransition.active) return;

    this.fadeOtherPlanets(planet);

    const transition = this.cameraTransition;

    transition.active = true;
    transition.returning = false;
    transition.progress = 0;
    transition.focusedPlanet = planet;

    emitter.emit('planet-transition-start', planet.id);

    transition.savedPosition.copy(this.camera.position);
    transition.savedQuaternion.copy(this.camera.quaternion);

    transition.startPosition.copy(this.camera.position);
    transition.startQuaternion.copy(this.camera.quaternion);

    // -----------------------------
    // PLANET POSITION
    // -----------------------------

    const planetPos = new THREE.Vector3();
    planet.mesh.getWorldPosition(planetPos);

    // -----------------------------
    // CAMERA BASIS
    // -----------------------------

    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);

    const up = new THREE.Vector3(0, 1, 0);

    const right = new THREE.Vector3().crossVectors(forward, up).normalize();

    // -----------------------------
    // CONSISTENT FRAMING
    // -----------------------------

    const isMobile = window.innerWidth < 768;

    // how far camera sits from planet
    const distance = isMobile ? 8 : 9;

    // screen composition offsets
    const horizontalOffset = isMobile ? 0 : -3.5;
    const verticalOffset = isMobile ? 0.5 : 1.2;

    // camera position
    const targetPos = planetPos
      .clone()
      .add(forward.clone().multiplyScalar(-distance))
      .add(right.clone().multiplyScalar(horizontalOffset))
      .add(up.clone().multiplyScalar(verticalOffset));

    transition.targetPosition.copy(targetPos);

    // -----------------------------
    // LOOK AT PLANET
    // -----------------------------

    this.tmpLookMatrix.lookAt(targetPos, planetPos, up);

    transition.targetQuaternion.setFromRotationMatrix(this.tmpLookMatrix);
  }

  fadeOtherPlanets(focusedPlanet) {
    this.planets.forEach((planet) => {
      const isFocused = planet === focusedPlanet;

      planet.mesh.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];

        materials.forEach((material) => {
          if (!material) return;

          material.transparent = true;

          if (isFocused) {
            material.opacity = 1.0;
            material.depthWrite = true;
          } else {
            material.opacity = 0.08;
            material.depthWrite = false;
          }

          material.needsUpdate = true;
        });
      });
    });
  }

  restorePlanetVisibility() {
    this.planets.forEach((planet) => {
      planet.mesh.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];

        materials.forEach((material) => {
          if (!material) return;

          material.opacity = 1.0;
          material.transparent = false;
          material.depthWrite = true;
          material.needsUpdate = true;
        });
      });
    });
  }

  setActivePlanet(planet) {
    this.activePlanet = planet;

    emitter.emit('planet-changed', planet.id);
  }

  returnCamera() {
    const transition = this.cameraTransition;

    if (!transition.active) return;

    transition.returning = true;
    transition.progress = 0;

    transition.startPosition.copy(this.camera.position);
    transition.startQuaternion.copy(this.camera.quaternion);

    transition.targetPosition.copy(transition.savedPosition);

    transition.targetQuaternion.copy(transition.savedQuaternion);
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

    if (!this.isTransitioning) {
      this.updatePlayer();
    } else {
      this.updatePlanetTransition();
    }

    this.updateHoverStatus();
    this.updatePlanetGlow();
    this.updateSky();

    const delta = this.clock.getDelta();

    this.updateCameraTransition(delta);

    if (this.playerMixer) {
      this.playerMixer.update(delta);
    }

    this.bloom.render();
  };
}
