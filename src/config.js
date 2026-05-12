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
    },

    videos: {
      preload: ['/videos/space.mp4'],
      subsequent: []
    }
  },

  //
  // Settings for our app
  //
  settings: {
    video: {
      type: 'video', // can be: 'video' or 'playlist',
      size: {
        // set the size directly with css
        width: '100%',
        height: '100%'
      },
      props: {
        autoplay: true,
        controls: false,
        muted: true,
        loop: true,
        playbackRate: 0.5
      },
      video: {
        id: 'video',
        src: '/videos/space.mp4'
      }
    },
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
