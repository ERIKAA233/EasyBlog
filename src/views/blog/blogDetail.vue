<template>
  <div class="">
    <Window :show="windowConfig.show" :buttons="windowConfig.buttons" @closeWindow="closeWindow" :showCancel='false'>
      <div class="my-title" style="margin-bottom:10px" v-text="blog.title"></div>
      <div class="blog-detail" v-html="blog.content" style="white-space:pre-wrap"></div>
    </Window>
  </div>
</template>
<script setup>
import { reactive, ref, getCurrentInstance, nextTick } from 'vue'
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-light.css';

const { proxy } = getCurrentInstance()
const api = {
  getBlogDetail: '/blog/getBlogById',
}
const blog = ref({})
const showDetail = async (blogId) => {
  windowConfig.show = true
  let result = await proxy.request({
    url: api.getBlogDetail,
    params: {
      blogId
    }
  })
  if (result.code == 200) {
    blog.value = result.data
    nextTick(() => {
      let blocks = document.querySelectorAll("pre code")
      blocks.forEach((block) => {
        hljs.highlightBlock(block)
      })
    })
  }
}
const windowConfig = reactive({
  show: false,
  title: '标题',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: (e) => {
        windowConfig.show = false;
      }
    },
  ],
})
const emit = defineEmits()
const closeWindow = () => {
  windowConfig.show = false;
}
//高亮显示
defineExpose({ showDetail })
</script>
<style lang="scss" scoped>
.my-title{
  font-size:18px;
  font-weight:bolder;
}
.blog-detail{
  code{
    padding:5px;
    background:#DDD;
  }
  blockquote{
  padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
  }
  img{
    max-width:80%;
  }
}

</style>