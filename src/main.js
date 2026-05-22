import { createApp } from 'vue';
import App from './App.vue';
import mitt from 'mitt';
import '@fortawesome/fontawesome-free/css/all.min.css';

const emitter = mitt();
const app = createApp(App);

app.config.globalProperties.emitter = emitter;

app.mount('#app');
