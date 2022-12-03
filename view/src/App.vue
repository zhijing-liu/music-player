<template>
  <audio :src="playing?`/musicStatic/${playing}`:''" ref="player"
         @volumechange="volumechange"
         @timeupdate="timeupdate"
         @loadeddata="loadeddata"
         @ended="ended"></audio>
  <div id="main" @click="multipleChooserDisplay=false">
    <div id="leftTab">
      <MusicList :list="list"
                 @playMusic="(music)=>play(music,true)"
                 :playing="playing"
                 ref="musicList"
                 :mode="displayMode"
                 @stop="stop"/>
    </div>
    <div id="container" @wheel.passive="changeVolume">
      <div class="title">{{ playing || '未播放' }}</div>
      <div class="showcase" @click="showcase=(showcase==='pic'?'lyric':'pic')">
        <div v-if="showcase==='pic'" id="album" class="rotating"
             :key="playing"
             :style="`animation-play-state:${playerStatus==='pause'?'paused':'running'};`">
          <img id="albumPic" :src="musicInfo.albumPic??recordPic" alt="">
          <img id="albumBack" :src="musicInfo.albumPic??recordPic" alt="">
        </div>
        <Lyric v-else-if="showcase==='lyric'"
               :lyricList="musicInfo.lyricList??[]"
               :timeStep="timeStep"
               @setProgress="(v)=>setProgress(v,true)"/>
      </div>
      <div id="controller">
        <Progress :current="current" :length="length" @setProgress="(v)=>setProgress(v,true)"/>
        <div class="buttons">
          <div class="button" @click="setDisplayMode">
            <img :src="displayModeIconMap[displayMode]" alt="" class="icon">
          </div>
          <div class="button" @click="last">上一首</div>
          <div class="button" @click="changeState">{{ playerStatus === 'pause' ? '播放' : '暂停' }}</div>
          <div class="button" @click="next">下一首</div>
          <div class="button" @click.stop="multipleChooserDisplay=!multipleChooserDisplay">
            <div id="multipleChooser" :class="{display:multipleChooserDisplay}">
              <div class="multipleItem" v-for="m in [0.25,0.5,1,1.5,2,3]" :key="m" @click="multiple=m">{{ m }}x</div>
            </div>
            {{ multiple }}x
          </div>
          <div class="button" @click.stop="openVolumeSlider"><img :src="getVolumeIcon" alt="" class="icon"></div>
        </div>
      </div>
      <VolumeDisplay ref="volumeDisplayIns" :volume="volume"/>
      <VolumeSlider ref="volumeSliderIns" :volume="volume" @changeVolume="(v)=>setVolume(v/100)"/>
    </div>
  </div>
</template>
<script setup>
import {computed, onMounted, ref, watch} from "vue";

import MusicList from './components/list.vue'
import VolumeDisplay from './components/volumeDisplay.vue'
import Lyric from './components/lyric.vue'
import Progress from './components/progress.vue'
import VolumeSlider from './components/volumeSlider.vue'

import loopIcon from './assets/loop.svg'
import randomIcon from './assets/random.svg'
import singleLoopIcon from './assets/singleLoop.svg'
import defaultIcon from './assets/default.svg'
import recordPic from './assets/record.svg'
import highVolumeIcon from './assets/highVolume.svg'
import lowVolumeIcon from './assets/lowVolume.svg'
import muteIcon from './assets/mute.svg'

import axios from 'axios'

const displayModeIconMap = [defaultIcon, randomIcon, loopIcon, singleLoopIcon]
const getVolumeIcon = computed(() => {
  if (volume.value === 0) {
    return muteIcon
  } else if (volume.value >= 50) {
    return highVolumeIcon
  } else if (volume.value < 50) {
    return lowVolumeIcon
  }
})
const list = ref([])
axios.get('/getMusicList').then(r => {
  list.value = r.data
  const storagePlaying = localStorage.getItem('playing')
  storagePlaying && list.value.includes(storagePlaying) && play(storagePlaying)
})
const player = ref()
let playingRequest = ''
const play = (music, immediately) => {
  playingRequest = music
  axios.get(`/musicInfo/${music}`).then(({data}) => {
    if (music === playingRequest) {
      musicInfo.value = data
      playing.value = music
      if (immediately) {
        playerStatus.value = 'playing'
        player.value.load()
      }
    }
  })
}
const volumeSliderIns = ref()
const openVolumeSlider = () => {
  volumeSliderIns.value.open()
}
const last = () => {
  musicList.value.last()
}
const next = () => {
  musicList.value.next()
}
const multiple = ref(+(localStorage.getItem('multiple') ?? 1))
watch(multiple, () => {
  player.value.playbackRate = multiple.value
  localStorage.setItem('multiple', multiple.value.toString())
})
const playing = ref('')
const volumeDisplayIns = ref()
const changeVolume = (e) => {
  if (playing.value) {
    if (e.deltaY > 0) {
      setVolume(player.value.volume - 0.05 > 0 ? player.value.volume - 0.05 : 0)
    } else {
      setVolume(player.value.volume + 0.05 < 1 ? player.value.volume + 0.05 : 1)
    }
  }
}
onMounted(() => {
  player.value.volume = volume.value / 100
})
const volume = ref(+(localStorage.getItem('volume') ?? 100))
watch(volume, () => {
  volumeDisplayIns.value.setVolume(volume.value)
})

const volumechange = () => {
  volume.value = Math.round(player.value.volume * 100)
}
const setVolume = (volume) => {
  player.value.volume = Math.round(volume * 100) / 100
}
const showcase = ref('pic')
const playerStatus = ref('pause')
let playerFree= true
const stateMap = {
  continue: async () => {
    if (playerStatus.value === 'playing'||playerFree===false) {
      return
    }
    playerStatus.value = 'playing'
    if (playing.value) {
      playerFree=false
      await player.value.play()
      playerFree = true
    } else {
      musicList.value.play()
    }
  },
  pause: async () => {
    if (playerStatus.value === 'pause'||playerFree===false) {
      return
    }
    playerFree=false
    await player.value.pause()
    playerFree = true
    playerStatus.value = 'pause'
    localStorage.setItem('playValue', current.value.toString())
  }
}
const changeState = async (state) => {
  if (stateMap[state]) {
    await stateMap[state]?.()
  } else if (playerStatus.value === 'pause') {
    await stateMap.continue()
  } else {
    await stateMap.pause()
  }
}
const length = ref(0)
const current = ref(+(localStorage.getItem('playValue') ?? 0))
const timeStep = ref(0)
const timeupdate = () => {
  if (playing.value && playerStatus.value === 'playing') {
    current.value = Math.round(player.value.currentTime)
    timeStep.value = Math.round(player.value.currentTime * 1000)
  }
}
const loadeddata = () => {
  length.value = Math.round(player.value.duration)
  player.value.playbackRate = multiple.value
  player.value.currentTime = current.value
  localStorage.setItem('playValue', current.value.toString())
  if (playing.value && playerStatus.value === 'playing') {
    player.value.play()
  }
}
const musicList = ref()
const ended = () => {
  musicList.value.next()
}

let setProgressTimer
const setProgress = async (currentTime,immediately) => {
  current.value = Math.round(currentTime)
  if (immediately){
    player.value.currentTime = Math.round(currentTime)
  }else{
    await changeState('pause')
    clearTimeout(setProgressTimer)
    setProgressTimer = setTimeout(() => {
      player.value.currentTime = current.value
      changeState('continue')
    }, 600)
  }

}
const displayMode = ref(+(localStorage.getItem('displayMode') ?? 0))
const setDisplayMode = () => {
  displayMode.value = displayMode.value === 3 ? 0 : displayMode.value + 1
  localStorage.setItem('displayMode', displayMode.value.toString())
}

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
const multipleChooserDisplay = ref(false)
setInterval(() => {
  localStorage.setItem('playValue', current.value.toString())
}, 1000)
const keyupMap = {
  Space: changeState,
  PageDown: next,
  PageUp: last
}
const keydownMap = {
  ArrowLeft: () => {
    setProgress(current.value > 1 ? current.value - 1 : 0)
  },
  ArrowRight: () => {
    setProgress(current.value + 1)
  },
  ArrowUp: () => {
    volumeSliderIns.value.setVolume(volume.value + 5)
  },
  ArrowDown: () => {
    volumeSliderIns.value.setVolume(volume.value - 5)
  },
}
document.addEventListener('keyup', (e) => {
  keyupMap[e.code]?.()
  e.stopPropagation()
  e.preventDefault()
})
document.addEventListener('keydown', (e) => {
  keydownMap[e.code]?.()
  e.stopPropagation()
  e.preventDefault()
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

#main
  display flex
  height 100vh
  width 100vw
  overflow hidden
  box-sizing border-box
  background-color #222222
  user-select none

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

    #controller
      padding 3vh 5vw
      margin 2vh 5vw
      border-radius 100px
      background-color rgba(144, 144, 144, .3)
      display flex
      flex-direction column
      justify-content center
      box-shadow 0 0 25px rgba(144, 144, 144, .3)

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
          flex-direction column
          justify-content center
          position relative

          .icon
            width 20px
            height 20px

          #multipleChooser
            position absolute
            //width 100%
            border 3px solid #AAAAAA
            border-radius 12px
            background-color #333333
            opacity 0
            pointer-events none
            transition opacity 0.3s
            width max-content
            overflow hidden

            .multipleItem
              padding 0 14px
              height 40px
              text-align center
              display flex
              justify-content center
              align-items center

              .value
                flex 1

              &:hover
                background-color #555555

          #multipleChooser.display
            opacity 1
            pointer-events auto

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
</style>
