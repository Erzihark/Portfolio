const isLocal = window.location.hostname === 'localhost';
const PATH = isLocal ? '/src/assets/' : '/assets/';

const CONFIG = {
  assets: {
    //
    // Images Preloader & Subsequent loader
    //
    images: {
      preload: [PATH + 'logo.webp'],
      subsequent: [PATH + 'profile.webp', PATH + 'unmute.svg']
    }
  }
};

export default CONFIG;
