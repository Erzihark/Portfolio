import * as THREE from 'three';

import emitter from '@/services/emitter.service';

import { EVENTS } from '@/constants/events';

import RenderLoop from './RenderLoop';

import Bloom from '../effects/Bloom';

import PlanetManager from '../entities/PlanetManager';
import PlayerController from '../entities/PlayerController';
import SkyManager from '../entities/SkyManager';

import CameraController from '../systems/CameraController';
import GlowSystem from '../systems/GlowSystem';
import PlanetInteractionSystem from '../systems/PlanetInteractionSystem';
import TransitionSystem from '../systems/TransitionSystem';

export default class WorldEngine {
  constructor({ scene, camera, renderer, worldRoot, skyRoot, input }) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.worldRoot = worldRoot;
    this.skyRoot = skyRoot;
    this.input = input;

    this.bloom = new Bloom(renderer, scene, camera);

    this.renderLoop = new RenderLoop(this.update);

    this.activePlanet = null;

    this.setupLighting();

    this.bindEvents();
  }

  async init() {
    this.planetManager = new PlanetManager(this.worldRoot);

    this.planets = await this.planetManager.init();

    this.playerController = new PlayerController(this.scene);

    await this.playerController.init();

    this.skyManager = new SkyManager(this.skyRoot, this.input);

    this.skyManager.init();

    this.cameraController = new CameraController(this.camera, this.planets);

    this.glowSystem = new GlowSystem(this.camera, this.planets);

    this.interactionSystem = new PlanetInteractionSystem(this.camera, this.planets);

    this.activePlanet = this.planets[0];

    this.playerController.placeOnPlanet(this.activePlanet);

    this.worldRoot.rotation.x += 0.6;

    this.transitionSystem = new TransitionSystem(this.playerController);

    this.transitionSystem.setInitialPlanet(this.planets[0]);

    emitter.emit(EVENTS.PLANET_CHANGED, this.activePlanet.id);

    emitter.emit(EVENTS.WORLD_READY);

    this.renderLoop.start();
  }

  bindEvents() {
    emitter.on(EVENTS.CLOSE_PLANET_VIEW, () => {
      this.cameraController.returnCamera();
    });

    emitter.on(EVENTS.NAVIGATE_TO, ({ event, id }) => {
      this.onPlanetClick(event, id);
    });

    window.addEventListener('click', this.onPlanetClick);
  }

  onPlanetClick = (event, id = null) => {
    if (this.cameraController.transition.active) {
      return;
    }

    let planet = null;

    if (id) {
      planet = this.planets.find((p) => p.id === id);
    } else {
      this.interactionSystem.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;

      this.interactionSystem.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      planet = this.interactionSystem.getIntersectedPlanet();
    }

    if (!planet) return;

    this.activePlanet = planet;

    this.transitionSystem.travelToPlanet(planet);

    emitter.emit(EVENTS.PLANET_CHANGED, planet.id);

    this.cameraController.focusPlanet(planet);
  };

  setupLighting() {
    this.directional = new THREE.DirectionalLight(0xffffff, 1.5);

    this.directional.position.set(5, 10, 7);

    this.scene.add(this.directional);

    this.ambient = new THREE.AmbientLight(0x404040, 2);

    this.scene.add(this.ambient);
  }

  update = (delta) => {
    this.input?.update();

    this.transitionSystem.update(delta);

    this.glowSystem.update();

    this.skyManager.update();

    this.cameraController.update(delta);

    this.bloom.render();
  };

  destroy() {
    this.renderLoop.destroy();

    this.renderer.dispose();

    this.interactionSystem.destroy();

    window.removeEventListener('click', this.onPlanetClick);
  }
}
