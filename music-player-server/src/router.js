import {Router} from "express";
import {readdirSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {parseFile} from 'music-metadata'

const publicPath = join(fileURLToPath(import.meta.url), '../../public')
export const apiRouter = Router()
    .get('/getMusicList', (req, res) => {
        res.send(readdirSync(join(publicPath, './MyMusic')))
    })
    .get('/musicInfo/:musicName', async (req, res) => {
        const fileInfo = await parseFile(join(publicPath, './MyMusic', req.params.musicName))
        const lyricList = []
        if (fileInfo.common.lyrics) {
            for (const lyrics of fileInfo.common.lyrics) {
                for (const item of lyrics.split('\n')) {
                    const timeSet = item.match(/\[(.*?)]/)[0]
                    const time = timeSet.replace(/[\[\]]/g, '').split(/[:.]/)
                    const lyric = item.replace(timeSet, '')
                    const step = (+time[0]) * 60 * 1000 + (+time[1]) * 1000 + (+time[2])
                    lyricList.push({
                        time: step,
                        lyric
                    })
                }
            }
        } else {
            lyricList.push({
                time: 0,
                lyric: '无歌词'
            })
        }
        const data = {
            year: fileInfo.common.year,
            description: fileInfo.common.comment,
            artists: fileInfo.common.artists,
            album: fileInfo.common.album,
            lyricList,
            albumPic: `data:${fileInfo.common.picture[0].format};base64,${Buffer.from(fileInfo.common.picture[0].data, 'utf8').toString('base64')}`
        }
        res.send(data)
    })

