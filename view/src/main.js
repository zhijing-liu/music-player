import { createApp } from 'vue'
import App from './App.vue'
import './global.styl'
import axios from 'axios'
axios.defaults.baseURL='/api'
createApp(App).mount('#app')
