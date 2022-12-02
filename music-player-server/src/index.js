import express from 'express'
import {readFileSync, accessSync, readFile} from 'node:fs'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {apiRouter} from "./router.js";
import {port, host} from "./config.js";

const path = join(fileURLToPath(import.meta.url), '../../')
const publicPath=join(path,'/public')
const app = express()
app.use('/api', apiRouter)
app.get('/musicStatic/:musicName', (req, res) => {
    res.send(readFileSync(join(publicPath, './MyMusic', req.params.musicName)))
})
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

app.listen(port, host, () => {
    readFile(join(publicPath, './logo.txt'), {encoding: 'utf-8'}, (err, data) => {
        console.clear()
        console.log(data.replaceAll('{{link}}', `http://${host}${port === 80 ? '' : `:${port}`}/musicPlayer`))
    })
})