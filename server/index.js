import express from 'express'
import {readdirSync, readFileSync} from 'fs'
import {join} from 'path'
import {fileURLToPath} from 'url'
import { parseFile } from 'music-metadata'

console.log(parseFile)
const path=join(fileURLToPath(import.meta.url),'../')

const app = express()

app.get('/getMusicList', (req, res) => {
    res.send(readdirSync(join(path,'./MyMusic')))
})
app.get('/musicStatic/:musicName', (req, res) => {
    res.send(readFileSync(join(path,'./MyMusic', req.params.musicName)))
})
app.get('/musicInfo/:musicName', async(req, res) => {
    const fileInfo=await parseFile(join(path,'./MyMusic', req.params.musicName))
    const lyricList=[]
    if (fileInfo.common.lyrics){
        for (const lyrics of fileInfo.common.lyrics){
            for (const item of lyrics.split('\n')){
                const timeSet=item.match(/\[(.*?)]/)[0]
                const time=timeSet.replace(/[\[\]]/g,'').split(/[:.]/)
                const lyric=item.replace(timeSet,'')
                const step=(+time[0])*60*1000+(+time[1])*1000+(+time[2])
                lyricList.push({
                    time:step,
                    lyric
                })
            }
        }
    }else{
        lyricList.push({
            time:0,
            lyric:'无歌词'
        })
    }
    const data={
        year:fileInfo.common.year,
        description:fileInfo.common.comment,
        artists:fileInfo.common.artists,
        album:fileInfo.common.album,
        lyricList,
        albumPic:`data:${fileInfo.common.picture[0].format};base64,${Buffer.from(fileInfo.common.picture[0].data, 'utf8').toString('base64')}`
    }
    res.send(data)
})
app.listen(88)