import * as THREE from 'three';

export default class TransitionSystem {
  constructor(playerController) {
    this.playerController = playerController;

    this.player = playerController.player;

    this.activePlanet = null;
    this.targetPlanet = null;

    this.isTransitioning = false;
    this.playerTransitionSpeed = 1.5;

    this.playerCorrectionQuaternion = playerController.correctionQuaternion;

    this.tmpWorldPos = new THREE.Vector3();
    this.tmpDirection = new THREE.Vector3();
    this.tmpTarget = new THREE.Vector3();
  }

  setInitialPlanet(planet) {
    this.activePlanet = planet;
  }

  travelToPlanet(planet) {
    if (!planet) return;

    if (planet === this.activePlanet) return;

    this.targetPlanet = planet;

    this.isTransitioning = true;
  }

  update(delta) {
    if (!this.player) return;

    if (!this.activePlanet) return;

    if (!this.isTransitioning) {
      this.playerController.update(delta, this.activePlanet);
      return;
    }

    this.updatePlanetTransition(delta);
  }

  updatePlanetTransition(delta) {
    this.targetPlanet.mesh.getWorldPosition(this.tmpWorldPos);

    const outward = this.tmpDirection.copy(this.player.position).sub(this.tmpWorldPos).normalize();

    const targetPos = this.tmpTarget
      .copy(this.tmpWorldPos)
      .add(outward.multiplyScalar(this.targetPlanet.radius + 1.2));

    const alpha = 1 - Math.exp(-this.playerTransitionSpeed * delta);

    this.player.position.lerp(targetPos, alpha);

    const moveDirection = targetPos.clone().sub(this.player.position).normalize();

    const lookTarget = this.player.position.clone().add(moveDirection);

    this.player.lookAt(lookTarget);

    this.player.rotateZ(Math.PI / 2);
    this.player.rotateY(Math.PI / 2);

    this.player.quaternion.multiply(this.playerCorrectionQuaternion);

    const distance = this.player.position.distanceTo(targetPos);

    if (distance < 0.05) {
      this.activePlanet = this.targetPlanet;

      this.targetPlanet = null;

      this.isTransitioning = false;
    }
  }
}
