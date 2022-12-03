import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import compressPlugin from "vite-plugin-compression"

console.log(compressPlugin)
export default defineConfig({
    plugins: [
        vue(),
        compressPlugin({ //gzip静态资源压缩
            verbose: true,    // 默认即可
            disable: false,  //开启压缩(不禁用)，默认即可
            deleteOriginFile: false, //删除源文件
            threshold: 10240, //压缩前最小文件大小
            algorithm: 'gzip',  //压缩算法
            ext: '.gz', //文件类型
        })
    ],
    base: '/musicPlayer/',
    server: {
        host: true,
        port: 8080,
        proxy: {
            '/musicStatic': 'http://127.0.0.1/',
            '/api': 'http://127.0.0.1/',
            '/socket.io':'http://127.0.0.1/'
        }
    },
    build: {
        // 清除console和debugger
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        minify: 'terser',
        //警报门槛，限制大文件大小
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            output: {
                //对静态文件进行打包处理（文件分类）
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name].[ext]',
            }
        },
    }
})
