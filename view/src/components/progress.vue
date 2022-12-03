<template>
  <div class="progress"
       @click.stop="clickProgress"
       ref="progress"
       @mousedown="mousedown">
    <div class="info current">{{ getTime(props.current) }}</div>
    <div class="info length">{{ getTime(props.length) }}</div>
    <div class="enabled" :style="`width:${props.length?`${Math.ceil(props.current/props.length*10000)/100}%`:0}`"></div>
  </div>
</template>

<script setup>
import {ref} from "vue";
import {getTime} from "../../utils.js";

const props=defineProps(['current','length'])
const emits=defineEmits(['setProgress'])
// const getTime = (length) => {
//   const second = length % 60
//   const minute = Math.floor(length / 60)
//   if (minute > 0) {
//     return `${minute}m ${second}s`
//   } else {
//     return `${second}s`
//   }
// }
const progress=ref()
const clickProgress=(e)=>{
  emits('setProgress',props.length*(e.x-progress.value.getBoundingClientRect().x)/progress.value.getBoundingClientRect().width)
}
const mousedown = (e) => {
  document.body.addEventListener('mousemove', clickProgress)
  document.body.addEventListener('mouseleave', mouseup)
  document.body.addEventListener('mouseup', mouseup)
}
const mouseup = (e) => {
  document.body.removeEventListener('mousemove', clickProgress)
  document.body.removeEventListener('mouseleave', mouseup)
  document.body.removeEventListener('mouseup', mouseup)
}
</script>

<style scoped lang="stylus">
.progress
  width inherit
  height 10px
  border-radius 5px
  background-color #333333
  border 3px solid #AAAAAA
  display flex
  margin-top 36px
  position relative
  cursor pointer
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


</style>