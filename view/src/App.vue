<template>
  <audio :src="`/musicStatic/${playing}`" v-if="playing" ref="player" @volumechange="volumechange"
         @timeupdate="timeupdate" @loadeddata="loadeddata" @ended="ended" @play="afterPlay"></audio>
  <div id="main">
    <div id="leftTab">
      <MusicList :list="list" @playMusic="(music)=>play(music,true)" :playing="playing" ref="musicList" :mode="displayMode" @stop="stop"/>
    </div>
    <div id="container" @wheel.passive="changeVolume">
      <div class="title">{{ playing || '未播放' }}</div>
      <div class="showcase" @click="showcase=showcase==='pic'?'lyric':'pic'">
        <div v-if="showcase==='pic'" id="album" :class="albumPicAnimationName"
             :style="`animation-play-state:${playerStatus==='pause'?'paused':'running'};`">
          <img id="albumPic" :src="musicInfo.albumPic??recordPic" alt="">
          <img id="albumBack" :src="musicInfo.albumPic??recordPic" alt="">
        </div>
        <Lyric v-else-if="showcase==='lyric'" :lyricList="musicInfo.lyricList??[]" :timeStep="timeStep"/>
      </div>
      <div class="progress">
        <div class="info current">{{ getTime(current) }}</div>
        <div class="info length">{{ getTime(length) }}</div>
        <div class="enabled" :style="`width:${length?`${Math.ceil(current/length*10000)/100}%`:0}`"></div>
      </div>
      <div class="buttons">
        <div class="button" @click="setDisplayMode">
          <img :src="iconMap[displayMode]" alt="" class="icon">
        </div>
        <div class="button" @click="last">上一首</div>
        <div class="button" @click="pause">{{ playerStatus === 'pause' ? '播放' : '暂停' }}</div>
        <div class="button" @click="next">下一首</div>
      </div>
      <VolumeDisplay ref="volumeDisplay"/>
    </div>
  </div>
</template>
<script setup>
import {ref, watch} from "vue";
import MusicList from './components/list.vue'
import VolumeDisplay from './components/volumeDisplay.vue'
import Lyric from './components/lyric.vue'
import recordPic from './assets/record.svg'

import loopIcon from './assets/loop.svg'
import randomIcon from './assets/random.svg'
import singleLoopIcon from './assets/singleLoop.svg'
import defaultIcon from './assets/default.svg'

import axios from 'axios'

const iconMap = [defaultIcon, randomIcon, loopIcon, singleLoopIcon]

const list = ref([])
axios.get('/getMusicList').then(r => {
  list.value = r.data
  const storagePlaying = localStorage.getItem('playing')
  storagePlaying && list.value.includes(storagePlaying) && play(storagePlaying)
})
const player = ref()
let playingRequest = ''
const play = (music,immediately) => {
  if (music) {
    playingRequest = music
    if (immediately){
      playerStatus.value = 'playing'
    }
    axios.get(`/musicInfo/${music}`).then(({data}) => {
      if (music === playingRequest) {
        musicInfo.value = data
        playing.value = music
      }
    })
  }
}
const afterPlay = () => {
  albumPicAnimationName.value = albumPicAnimationName.value === 'rotating' ? 'rotating2' : 'rotating'
}
const last = () => {
  musicList.value.last()
}
const next = () => {
  musicList.value.next()
}
const playing = ref('')
const getTime = (length) => {
  const second = length % 60
  const minute = Math.floor(length / 60)
  if (minute > 0) {
    return `${minute}m ${second}s`
  } else {
    return `${second}s`
  }
}
const volumeDisplay = ref()
const changeVolume = (e) => {
  if (playing.value) {
    if (e.deltaY > 0) {
      player.value.volume = player.value.volume - 0.05 > 0 ? player.value.volume - 0.05 : 0
    } else {
      player.value.volume = player.value.volume + 0.05 < 1 ? player.value.volume + 0.05 : 1
    }
  }
}
const volumechange = () => {
  volumeDisplay.value.setVolume(Math.round(player.value.volume * 100))
}
const showcase = ref('pic')
const playerStatus = ref('pause')
const pause = () => {
  if (playerStatus.value === 'pause') {
    playerStatus.value = 'playing'
    if (playing.value) {
      player.value.play()
    } else {
      musicList.value.play()
    }
  } else {
    player.value.pause()
    playerStatus.value = 'pause'
  }
}
const length = ref(0)
const current = ref(0)
const timeStep = ref(0)
const timeupdate = () => {
  current.value = Math.round(player.value.currentTime)
  timeStep.value = Math.round(player.value.currentTime * 1000)
}
const loadeddata = () => {
  length.value = Math.round(player.value.duration)
  if (playerStatus.value === 'playing') {
    player.value.play()
  }
}
const musicList = ref()
const ended = () => {
  musicList.value.next()
}
const displayMode = ref(+(localStorage.getItem('displayMode') ?? 0))
const setDisplayMode = () => {
  displayMode.value = displayMode.value === 3 ? 0 : displayMode.value + 1
  localStorage.setItem('displayMode', displayMode.value.toString())
}
const albumPicAnimationName = ref('rotating')
const musicInfo = ref({})
const stop = () => {
  length.value = 0
  current.value = 0
  timeStep.value = 0
  musicInfo.value = {}
  playing.value = ''
  playerStatus.value = 'pause'
}
watch(playing, () => {
  localStorage.setItem('playing', playing.value)
})
</script>
<style scoped lang="stylus">
@-webkit-keyframes rotating {
  0% {
    transform: rotate(0deg)
  }
  50% {
    transform: rotate(180deg)
  }
  100% {
    transform: rotate(360deg)
  }
}

@-webkit-keyframes rotating2 {
  0% {
    transform: rotate(0deg)
  }
  50% {
    transform: rotate(180deg)
  }
  100% {
    transform: rotate(360deg)
  }
}

#main
  display flex
  height 100vh
  width 100vw
  overflow hidden
  box-sizing border-box
  background-color #222222

  #leftTab
    width 400px
    display flex
    background-color #222222
    transition width 0.6s
    flex-direction column
    padding 20px 0

  #container
    display flex
    justify-content center
    align-items center
    flex-direction column
    background-color #555555
    flex 1
    position relative

    .title
      font-size 28px
      color #CCCCCC
      font-weight bold
      margin-bottom 30px

    .progress
      width 60%
      height 10px
      border-radius 5px
      background-color #333333
      border 3px solid #AAAAAA
      display flex
      margin-top 60px
      position relative

      .info
        position absolute
        font-size 14px
        font-weight bold
        top -25px
        color #AAAAAA

      .length
        right 10px

      .current
        left 10px

      .enabled
        background-color #888888

    .buttons
      margin 20px 0
      display flex

      .button
        height 40px
        padding 0 14px
        border 3px solid #AAAAAA
        background-color #333333
        cursor pointer
        color #EEEEEE
        border-radius 12px
        display flex
        align-items center
        margin 0 10px
        user-select none

        .icon
          width 20px
          height 20px

    .showcase
      height 40vh
      width 100%
      display flex
      justify-content center
      align-items center
      padding 5vh 0
      position relative

      #album
        width 45vh
        height 45vh
        position relative
        display flex
        justify-content center
        align-items center

        #albumBack
          position absolute
          top 0
          bottom 0
          left 0
          right 0
          width 100%
          height 100%
          z-index 0
          filter blur(14px)
          border-radius 50%

        #albumPic
          width 30vh
          height 30vh
          margin 5vh 0
          border-radius 50%
          position absolute
          z-index 1
          box-shadow 0 0 10px rgba(215, 215, 215, .1)

      #album.rotating
        animation rotating 120s linear infinite

      #album.rotating2
        animation rotating2 120s linear infinite
</style>
