import { createApp } from 'vue';
import App from './App.vue';
import CONFIG from './config';
import mitt from 'mitt';
import 'aframe';

const parse = (val) => {
  let result = false;
  let tmp = [];
  const query = location.search.substr(1).split('&');

  query.forEach((item) => {
    tmp = item.split('=');

    if (tmp[0] === val) {
      result = decodeURIComponent(tmp[1]);
    }
  });

  return result;
};

CONFIG.settings.game.debug = parse('debug');

const emitter = mitt();
const app = createApp(App);

app.config.globalProperties.emitter = emitter;

app.mount('#app');
