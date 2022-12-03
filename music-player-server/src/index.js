import express from 'express'
import {readFileSync, accessSync, readFile} from 'node:fs'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {apiRouter} from "./router.js";
import {port, host} from "./config.js";
import {createSocket} from "./socket.js";
import compression from 'compression'
// 路径
const path = join(fileURLToPath(import.meta.url), '../../')
const publicPath=join(path,'/public')
// express app
const app = express()
// gzip
app.use(compression({filter:  (req, res) =>req.headers['accept-encoding']?.includes('gzip')&&compression.filter(req, res)}))
// 接口路由
app.use('/api', apiRouter)
// 静态音乐服务
app.get('/musicStatic/:musicName', (req, res) => {
    res.sendFile(join(publicPath, './MyMusic', req.params.musicName))
})
// 前端页面服务
app.get('/musicPlayer/:path(*)', async (req, res) => {
    const staticPath = join(path, './static', req.params.path)
    try {
        accessSync(staticPath)
        res.sendFile(staticPath)
    } catch (e) {
        res.sendFile(join(path, './static', 'index.html'))
    }
})
app.get('/musicPlayer', (req, res) => {
    res.sendFile(join(path, './static', 'index.html'))
})
// 创建webSocket
createSocket(app).listen(port, host, () => {
    // readFile(join(publicPath, './logo.txt'), {encoding: 'utf-8'}, (err, data) => {
    //     console.clear()
    //     console.log(data.replaceAll('{{link}}', `http://${(host===true||host==='0.0.0.0')?'127.0.0.1':host}${port === 80 ? '' : `:${port}`}/musicPlayer`))
    // })
})