<template>
  <div id="lyricList" @wheel.stop.passive ref="lyricListIns">
    <div
        class="lyric"
        v-for="(lyric,index) in props.lyricList"
        :class="{light:index===step-1}"
        :key="index"
        :ref="(el)=>lyricInsList[index]=el"
    >{{ lyric.lyric }}
    </div>
  </div>
</template>

<script setup>
import {computed, reactive, ref, watch} from "vue";

const props = defineProps(['lyricList', 'timeStep'])
const lyricInsList=reactive([])
const lyricListIns=ref()
const timeStep = computed(() => props.timeStep)
const step = ref(0)
const find = () => {
  if (props.lyricList[step.value].time < timeStep.value && props.lyricList.length - 1 > step.value) {
    step.value++
    find()
  }
}
watch(timeStep, () => {
  if (props.lyricList[step.value]){
    find()
  }
})
watch(step,()=>{
  const lyric=lyricInsList[step.value-1]
  const listRect=lyricListIns.value.getBoundingClientRect()
  const rect=lyric.getBoundingClientRect()
  lyricListIns.value.scrollTo({
    top:lyricListIns.value.scrollTop+rect.top-listRect.top-listRect.height/2+rect.height/2
  })
})
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

  .lyric.light
    color #DDDDDD

  &::-webkit-scrollbar
    width 0
</style>