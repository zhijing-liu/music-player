<template>
  <div id="lyricList" @wheel.stop.passive="wheel" ref="lyricListIns">
    <div
        class="lyric"
        v-for="(lyric,index) in props.lyricList"
        :class="{light:index===step-1}"
        :key="index"
        :ref="(el)=>lyricInsList[index]=el"
    >
      <span class="lyricValue" @click.stop="()=>clickLyric(lyric)">{{ lyric.lyric }}</span>
    </div>
  </div>
  <div class="lyricListMask"></div>
</template>

<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";

const props = defineProps(['lyricList', 'timeStep'])
const emits=defineEmits(['setProgress'])
const lyricInsList=reactive([])
const lyricListIns=ref()
const timeStep = computed(() => props.timeStep)
const step = ref(0)
let lastStep=0
const find = () => {
  if (props.lyricList[step.value].time < timeStep.value && props.lyricList.length - 1 > step.value) {
    step.value++
    find()
  }
  lastStep=props.timeStep
}
onMounted(()=>{
  find()
})
watch(timeStep, () => {
  if (props.lyricList[step.value]){
    if (lastStep>props.timeStep){
      step.value=0
    }
    find()
  }
})
const locating=()=>{
  const lyric=lyricInsList[step.value-1]
  if (allowLocating&&lyric){
    const listRect=lyricListIns.value.getBoundingClientRect()
    const rect=lyric.getBoundingClientRect()
    lyricListIns.value.scrollTo({
      top:lyricListIns.value.scrollTop+rect.top-listRect.top-listRect.height/2+rect.height/2
    })
  }
}
watch(step,()=>{
  locating()
})
const clickLyric=(lyric)=>{
  emits('setProgress',Math.ceil(lyric.time/1000))
  clearTimeout(wheelTimer)
}
let wheelTimer
let allowLocating=true
const wheel=()=>{
  allowLocating=false
  clearTimeout(wheelTimer)
  wheelTimer=setTimeout(()=>{
    allowLocating=true
    locating()
  },3000)
}
</script>

<style scoped lang="stylus">
#lyricList
  max-height 100%
  display flex
  flex-direction column
  overflow auto
  width 100%
  scroll-behavior smooth
  .lyric
    height 45px
    line-height 45px
    font-size 22px
    color #747474
    font-weight bold
    text-align center
    flex 0 0 45px
    word-wrap anywhere
    .lyricValue
      padding 5px 11px
  .lyric.light
    color #FFFFFF

  &::-webkit-scrollbar
    width 0
.lyricListMask
  position absolute
  width 100%
  height 100%
  background-image linear-gradient(to bottom, rgba(85,85,85,1), rgba(85,85,85,0), rgba(85,85,85,1));
  pointer-events none
</style>