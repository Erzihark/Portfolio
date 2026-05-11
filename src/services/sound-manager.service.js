export default class SoundManager {
  muted = false;
  sounds = {
    background: null,

    shoot1: null,
    shoot2: null,
    shoot3: null,

    hit: null
  };
  isPlaying = false;

  constructor() {
    this.sounds.background = new Audio('/sounds/background.mp3');

    this.sounds.shoot1 = new Audio('/sounds/web-shooter_1.mp3');
    this.sounds.shoot2 = new Audio('/sounds/web-shooter_2.mp3');
    this.sounds.shoot3 = new Audio('/sounds/web-shooter_3.mp3');

    this.sounds.hit = new Audio('/sounds/hit.mp3');

    return this;
  }

  init() {
    for (const sound in this.sounds) {
      this.sounds[sound].muted = this.muted;
    }

    this.sounds.background.loop = true;
    this.sounds.background.volume = 0.5;
  }

  play(sound) {
    this.sounds[sound].currentTime = 0;
    this.sounds[sound].play();
  }

  mute() {
    this.muted = true;

    for (const sound in this.sounds) {
      this.sounds[sound].muted = this.muted;
    }
  }

  toggle() {
    this.muted = !this.muted;

    for (const sound in this.sounds) {
      this.sounds[sound].muted = this.muted;
    }
  }

  unmute() {
    this.muted = false;

    for (const sound in this.sounds) {
      this.sounds[sound].muted = this.muted;
    }
  }
}
