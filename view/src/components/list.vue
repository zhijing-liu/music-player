<template>
  <div id="musicList" @scroll="scroll" ref="musicList">
    <div class="item" v-for="music in props.list" @click="()=>emits('playMusic',music)"
         :class="{selected:playing===music}">{{ music }}
    </div>
  </div>
</template>

<script setup>

const props = defineProps(['list', 'playing'])
const emits = defineEmits(['playMusic'])
const next = () => {
  const index = props.list.indexOf(props.playing)
  if (index < props.list.length - 1) {
    emits('playMusic',props.list[index+1])
  }else{
    emits('playMusic',props.list[0])
  }
}
const last = () => {
  const index = props.list.indexOf(props.playing)
  if (index ===0) {
    emits('playMusic',props.list[props.list.length-1])
  }else{
    emits('playMusic',props.list[index-1])
  }
}
const play=()=>{
  emits('playMusic',props.list[0])
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
    flex 1 0 60px
    box-sizing border-box
    padding-left 15px
    margin 6px 0
    border 3px solid #888888
    background-color #444444
    border-radius 12px
    white-space nowrap
    overflow-x hidden
    overflow-y auto
    text-overflow ellipsis
    display flex
    justify-content flex-start
    align-items center
    color #EEEEEE
    font-size 18px
    font-weight bold
    cursor pointer

  .item.selected
    background-color #888888
</style>