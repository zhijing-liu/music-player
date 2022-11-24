<template>
  <div id="volumeMask" :style="`opacity:${visible?1:0}`">
    <div id="volume"></div>
    <div id="volumeValue" v-if="volume!==0">{{ volume }}</div>
    <div id="volumeValue" v-else>{{ volume }}</div>
  </div>
</template>

<script setup>
import {ref} from "vue";

const visible = ref(false)
const volume = ref(0)
const t=ref()
const setVolume = (v) => {
  volume.value = v
  visible.value=true
  clearTimeout(t.value)
  t.value=setTimeout(()=>{
    visible.value=false
  },1500)
}
defineExpose({
  setVolume
})
</script>

<style scoped lang="stylus">
#volumeMask
  position absolute
  top 0
  bottom 0
  left 0
  right 0
  background-color rgba(144, 144, 144, .05)
  display flex
  justify-content center
  padding-top 10vh
  user-select none
  pointer-events none
  transition opacity 0.3s
  #volume
    height 16vh
    width 16vh
    background-color rgba(144, 144, 144, 0.3)
    box-shadow 0 0 20px #666666
    border-radius 4vh
    filter blur(3px)

  #volumeValue
    position absolute
    height 16vh
    width 16vh
    font-size 8vh
    color #AAAAAA
    display flex
    justify-content center
    align-items center
</style>