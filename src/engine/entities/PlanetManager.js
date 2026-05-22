import PlanetFactory from '../factories/PlanetFactory';

export default class PlanetManager {
  constructor(worldRoot) {
    this.worldRoot = worldRoot;

    this.planets = [];
  }

  async init() {
    const factory = new PlanetFactory(this.worldRoot);

    this.planets = await Promise.all([
      factory.createCenterPlanet(),
      factory.createProjectsPlanet(),
      factory.createSkillsPlanet(),
      factory.createExperiencePlanet(),
      factory.createContactPlanet()
    ]);

    return this.planets;
  }
}
