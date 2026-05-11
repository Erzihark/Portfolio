import ImagePreloader from 'image-preloader';

const Preloader = {
  bind
};

function preloadVideo(src) {
  const req = new XMLHttpRequest();
  req.open('GET', src, true);
  req.responseType = 'blob';

  req.onload = function () {};
  req.onerror = function () {
    console.log('couldnt load ' + src);
  };

  req.send();
}

function bind(type, assets, handlersObject) {
  if (type === 'images') {
    const preloader = new ImagePreloader();

    // preloader.onProgress = function (info) {
    //   console.log('image with source %s is loaded with status %s', info.value.src, info.status);
    // };

    preloader
      .preload(assets)
      .then(() => {
        handlersObject.complete();
      })
      .catch(() => {
        handlersObject.error();
      });
  } else if (type === 'videos') {
    assets.forEach((asset) => preloadVideo(asset));
    handlersObject.complete();
  } else {
    throw new Error(type + ' preloader not supported!');
  }
}

export default Preloader;
