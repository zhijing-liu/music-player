import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base:'/musicPlayer/',
  server:{
    host:true,
    port:8080,
    proxy:{
      '/musicStatic':'http://127.0.0.1:88/',
      '/api':{
        target:'http://127.0.0.1:88/',
        rewrite:(path)=>path.replace('/api','')
      }
    }
  }
})
