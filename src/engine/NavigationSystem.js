import emitter from '../services/emitter.service';

export default class NavigationSystem {
  constructor(world) {
    this.world = world;

    this.currentTarget = null;
    this.isMoving = false;

    this.moveSpeed = 0.05;

    this.listen();
  }

  listen() {
    emitter.on('navigate-to', (planetId) => {
      const target = this.world.planets.find((p) => p.id === planetId);

      if (target) {
        this.moveToPlanet(target);
      }
    });
  }

  moveToPlanet(planet) {
    this.currentTarget = planet;
    this.isMoving = true;
  }

  update() {
    if (!this.isMoving || !this.currentTarget) {
      return;
    }

    const player = this.world.player;

    const currentPos = player.position.clone();

    const targetPos = this.currentTarget.mesh.position.clone();

    const direction = targetPos.sub(currentPos).normalize();

    player.position.lerp(currentPos.add(direction.multiplyScalar(2)), this.moveSpeed);

    const distance = player.position.distanceTo(this.currentTarget.mesh.position);

    if (distance < 2) {
      this.isMoving = false;

      this.world.setActivePlanet(this.currentTarget);
    }
  }
}
