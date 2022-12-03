<template>

</template>

<script setup>
// @volumechange="volumechange"
// @timeupdate="timeupdate"
// @loadeddata="loadeddata"
// @ended="ended"
// :src="playing?`/musicStatic/${playing}`:''"
import {onMounted, ref} from "vue";
import {getControllerSocketIns} from "../socket/index.js";
const props=defineProps(['controlling'])
const emits=defineEmits(['volumechange','timeupdate','loadeddata','ended','updateData'])
const device=ref({})
onMounted(()=>{
  const ins=getControllerSocketIns()
  ins.on('deviceList',(data)=>{
    console.log(props.controlling)
    console.log(data[props.controlling])
    emits('updateData',data[props.controlling])
    // deviceList.value=data
  })
  ins.on('updateState',(data)=>{
    console.log(data[props.controlling])
    if (data[props.controlling]){
      emits('updateData',data[props.controlling])
    }
  })
})
defineExpose({
  load:()=>{
    console.log('load')
  },
  play:()=>{
    console.log('play')
  },
  pause:()=>{
    console.log('pause')
  }
})
</script>

<style scoped>

</style>