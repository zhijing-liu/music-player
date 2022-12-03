<template>
  <div id="controllerBoardButton" @click="visible=true">
    <img :src="controllerIcon" alt="">
  </div>
  <div id="controllerBoardMask" :class="{visible}" @click="visible=false">
    <div id="controllerBoard" v-if="visible" @click.stop>
      <div class="header">
        <div class="title">控制台</div>
        <div class="closeButton" @click.stop="visible=false">
          <img :src="closeIcon" alt="">
        </div>
      </div>
      <div class="body">
        <div class="item" v-for="(device,key) in deviceList" :key="key" @click="emits('update:controlling',key)">
<!--          <div v-if="controlled===key"></div>-->
<!--          <template v-else>-->
<!--            音乐: {{device.playing}} 播放至: {{ getTime(device.current) }} 时长: {{ getTime(device.length) }}-->
<!--          </template>-->
        {{key}}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, watch} from "vue";
import {getTime} from "../../utils.js";
import controllerIcon from '../assets/controller.svg'
import closeIcon from '../assets/close.svg'

const props=defineProps(['controlling'])
const emits=defineEmits(['update:controlling'])
import {getControllerSocketIns, getPlaySocketIns} from "../socket/index.js";
const controlled=ref()
const visible=ref(false)
const deviceList=ref({})
watch(visible,()=>{
  if (visible){
    const ins=getControllerSocketIns()
    ins.on('deviceList',(data)=>{
      Reflect.deleteProperty(data,getPlaySocketIns().id)
      deviceList.value=data
    })
    // ins.on('updateState',(data)=>{
    //   deviceList.value={...deviceList.value,...data}
    // })
    ins.emit('deviceList')
  }else{
    getControllerSocketIns().removeAllListeners('deviceList')
  }
})
</script>

<style scoped lang="stylus">
#controllerBoardButton
  position absolute
  top 20px
  right 20px
  height 40px
  width 40px
  padding 10px
  box-sizing border-box
  border-radius 10px
  cursor pointer
  &:active
    background-color #444444
  img
    width 100%
    height 100%
#controllerBoardMask
  position absolute
  top 0
  left 0
  width 100%
  height 100%
  display flex
  justify-content center
  align-items center
  pointer-events none
  opacity 0
  transition opacity 0.3s
  background-color rgba(144,144,144,.1)
  #controllerBoard
    width 60%
    max-height 80vh
    background-color #222222
    border-radius 20px
    display flex
    justify-content center
    flex-direction column
    overflow hidden
    .header
      height 60px
      display flex
      justify-content space-between
      padding 0 20px
      align-items center
      .title
        font-size 22px
        font-weight bold
        color #AAAAAA
      .closeButton
        width 40px
        height 40px
        padding 10px
        box-sizing border-box
        border-radius 10px
        cursor pointer
        img
          width 100%
          height 100%
        &:hover
          background-color #444444
          img
            color #DDDDDD
    .body
      overflow auto
      flex 1
      display flex
      flex-direction column
      .item
        flex 0 0 45px
        color #FFFFFF
#controllerBoardMask.visible
  opacity 1
  pointer-events auto
</style>