<template>
  <div id="volumeSlider" @click.stop @mouseleave.stop="closeCountDown" :class="{visible}" @mouseenter.stop="refreshCloseCountDownTimer">
    <img
        class="volumeIcon"
        :class="{disabled:volume===100}"
        :src="highVolumeIcon"
        alt=""
        @click="()=>setVolume(volume+5)"
        @mousedown="()=>volumeIconMousedown((volume)=>volume+5)"
        @mouseup="volumeIconMouseup"
    >
    <div
        class="slider"
        :style="`background-image:linear-gradient(to top, #444444 0%,#444444 ${volume/100*20}vh,#666666 0%,#666666 100%);`"
        @click="clickSlider"
        ref="slider"
        @mousedown="mousedown"
    >
    </div>
    <img
        class="volumeIcon"
        :class="{disabled:volume===0}"
        :src="lowVolumeIcon"
        alt=""
        @click="()=>setVolume(volume-5)"
        @mousedown="()=>volumeIconMousedown((volume)=>volume-5)"
        @mouseup="volumeIconMouseup"
    >
    <img
        class="volumeIcon muteIcon"
        :class="{muted:volume===0}"
        :src="muteIcon"
        alt=""
        @click="setMute"
    >
  </div>
</template>

<script setup>
import {nextTick, ref, watch} from "vue";

import highVolumeIcon from '../assets/highVolume.svg'
import lowVolumeIcon from '../assets/lowVolume.svg'
import muteIcon from '../assets/mute.svg'

const slider = ref()

const props = defineProps(['volume'])
const emits = defineEmits(['changeVolume'])
const clickSlider = (e) => {
  const rect = slider.value.getBoundingClientRect()
  setVolume(Math.round((1 - (e.y - rect.top) / rect.height) * 100))
}
const listener = (e) => {
  if (e.buttons === 1) {
    clickSlider(e)
  }
}

const mousedown = (e) => {
  document.body.addEventListener('mousemove', clickSlider)
  document.body.addEventListener('mouseleave', mouseup)
  document.body.addEventListener('mouseup', mouseup)
}
let timer = null
const volumeIconMousedown = (action) => {
  timer = setTimeout(() => {
    timer=setInterval(() => {
      setVolume(action(props.volume))
    },100)
  }, 500)
}
const volumeIconMouseup=()=>{
  clearInterval(timer)
  clearTimeout(timer)
}
const mouseup = (e) => {
  document.body.removeEventListener('mousemove', clickSlider)
  document.body.removeEventListener('mouseleave', mouseup)
  document.body.removeEventListener('mouseup', mouseup)
}
const beforeMutedValue=ref()
const setMute=()=>{
  if (props.volume===0){
    setVolume(beforeMutedValue.value??5)
  }else{
    beforeMutedValue.value=props.volume
    setVolume(0)
  }
}
const setVolume = (v) => {
  if (v > 100) {
    emits('changeVolume', 100)
  } else if (v < 0) {
    emits('changeVolume', 0)
  } else {
    emits('changeVolume', v)
  }
}
const visible=ref(false)
let closeCountdownTimer
const closeCountDown=()=>{
  console.log('out')
  closeCountdownTimer=setTimeout(()=>{
    visible.value=false
  },2000)
}
const refreshCloseCountDownTimer=()=>{
  console.log('enter')
  clearTimeout(closeCountdownTimer)
}
defineExpose({
  open:()=>{
    visible.value=true
  }
})
const visibleListener=()=>{
  visible.value=false
}
watch(visible,()=>{
  if (visible.value){
    nextTick(()=>{
      addEventListener('click',visibleListener)
    })
  }else{
    removeEventListener('click',visibleListener)
  }
})
</script>

<style scoped lang="stylus">
#volumeSlider
  position absolute
  right 8vw
  top 50vh
  transform translateY(-50%)
  width 30px
  display flex
  flex-direction column
  align-items center
  padding 5px 3px
  border-radius 18px
  background-color rgba(144, 144, 144, .6)
  box-shadow 0 0 22px rgba(95, 95, 95, 0.8)
  overflow hidden
  user-select none
  opacity 0
  transition opacity 0.5s
  pointer-events none

  .volumeIcon
    width 24px
    height 24px
    padding 3px
    border-radius 17px
    cursor pointer
    margin 3px 0

    &:active
      background-color #888888
  .muteIcon
    background-color #888888
  .volumeIcon.muted
    background-color #444444
  .volumeIcon.disabled
    opacity 0.3
    cursor not-allowed
    &:active
      background-color transparent
  .slider
    height 20vh
    width 20px
    border-radius 10px
    margin 8px 0
    box-sizing border-box
    display flex
    flex-direction column-reverse

    .volume
      width inherit
      background-color #444444

#volumeSlider.visible
  opacity 1
  pointer-events auto
</style>