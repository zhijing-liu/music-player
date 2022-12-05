import express from 'express'
import {readFile,statSync} from 'node:fs'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {apiRouter} from "./router.js";
import {port, host} from "./config.js";
import compression from 'compression'
const path = join(fileURLToPath(import.meta.url), '../../')
const publicPath=join(path,'/public')
const app = express()
app.use(compression({filter:  (req, res) =>req.headers['accept-encoding']?.includes('gzip')&&compression.filter(req, res)}))
app.use('/api', apiRouter)
app.get('/musicStatic/:musicName', (req, res) => {
    res.sendFile(join(publicPath, './MyMusic', req.params.musicName))
})
app.get('/musicPlayer/?:path(*)', async (req, res) => {
    try {
        const staticPath=join(path, './static', req.params.path)
        const stat=statSync(staticPath)
        if (stat.isFile()){
            res.sendFile(staticPath)
        }else{
            res.sendFile(join(path, './static', 'index.html'))
        }
    } catch (e) {
        res.sendFile(join(path, './static', 'index.html'))
    }
})
app.get('/',(req,res)=>{
    res.redirect('/musicPlayer')
})

app.listen(port, host, () => {
    readFile(join(publicPath, './logo.txt'), {encoding: 'utf-8'}, (err, data) => {
        console.clear()
        console.log(data.replaceAll('{{link}}', `http://${(host===true||host==='0.0.0.0')?'127.0.0.1':host}${port === 80 ? '' : `:${port}`}/musicPlayer`))
    })
})
