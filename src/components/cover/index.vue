<template>
  <div class="cover">
    <img :src="proxy.globalInfo.imageUrl+cover" alt="123" v-if="cover">
    <img v-else src="@/assets/good.jpg" alt="">
  </div>
</template>
<script setup>
import { getCurrentInstance, reactive } from 'vue'
const props = defineProps({
  cover: {
    type: String,
  }
})
const { proxy } = getCurrentInstance()



</script>
<style scoped lang='scss'>
.cover{
  background:#ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  width:80px;
  height:80px;
  overflow:hidden;
  img{
    width:100%;
  }
}
</style>
