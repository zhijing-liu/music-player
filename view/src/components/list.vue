<template>
  <div id="musicList" @scroll="scroll" ref="musicList">
    <div class="item" v-for="music in props.list" @click="()=>emits('playMusic',music)"
         :key="music"
         :class="{selected:props.playing===music}">{{ music }}
    </div>
  </div>
</template>

<script setup>
import {computed} from "vue";

const props = defineProps(['list', 'playing', 'mode'])
const emits = defineEmits(['playMusic', 'stop'])
const next = () => {
  const index = useList.value.indexOf(props.playing)
  if (index < useList.value.length - 1) {
    emits('playMusic', useList.value[index + 1])
  } else if (props.mode !== 0) {
    emits('playMusic', useList.value[0])
  } else {
    emits('stop')
  }
}
const modeMap = [
  (list) => list,
  (list) => [...list].sort(() => Math.random() - 0.5),
  (list) => list,
  () => [props.playing]
]
const useList = computed(() => {
  return modeMap[props.mode ?? 0](props.list)
})
const last = () => {
  const index = useList.value.indexOf(props.playing)
  if (index === 0) {
    emits('playMusic', useList.value[useList.value.length - 1])
  }
  if (props.mode !== 0) {
    emits('playMusic', useList.value[index - 1])
  } else {
    emits('stop')
  }
}
const play = () => {
  emits('playMusic', useList.value[0])
}
defineExpose({
  next,
  last,
  play
})
</script>

<style scoped lang="stylus">
#musicList
  height 100%
  display flex
  flex-direction column
  overflow auto
  width 100%
  align-items center

  .item
    width 90%
    flex 0 0 60px
    box-sizing border-box
    padding-left 15px
    margin 6px 0
    border 3px solid #888888
    background-color #444444
    border-radius 12px
    white-space nowrap
    overflow hidden
    text-overflow ellipsis
    color #EEEEEE
    font-size 18px
    font-weight bold
    cursor pointer
    line-height 54px

  .item.selected
    background-color #888888
</style>