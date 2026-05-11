const isLocal = window.location.hostname === 'localhost';
const PATH = isLocal ? '/src/assets/' : '/assets/';

const CONFIG = {
  // For favicon generator use:
  // https://favicon.io/favicon-converter/

  assets: {
    //
    // Images Preloader & Subsequent loader
    //
    images: {
      preload: [PATH + 'mobile_background.png', PATH + 'logo.png', PATH + 'allowed.png'],
      subsequent: [PATH + 'mute.svg', PATH + 'unmute.svg']
    }
  },

  //
  // Settings for our app
  //
  settings: {
    game: {
      initialPoolSize: 10,
      timer: 30,
      debug: isLocal,
      cameraPosition: {
        x: 0,
        y: 4,
        z: 5
      },
      boundaries: {
        height: 30,
        width: 30
      }
    }
  }
};

export default CONFIG;
