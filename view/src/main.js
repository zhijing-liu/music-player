import { createApp } from 'vue'
import App from './App.vue'
import './global.styl'
import axios from 'axios'
import createSocket from './socket/index.js'
axios.defaults.baseURL='/api'
createApp(App).use(createSocket).mount('#app')
