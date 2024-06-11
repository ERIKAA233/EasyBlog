<template>
  <div class="">
    <Window :show="windowConfig.show" :buttons="windowConfig.buttons" @closeWindow="closeWindow" :showCancel='false'>
      <el-row :gutter="10">
        <el-col :span="10">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>专题文章</span>
              </div>
            </template>
            <div class="special-blog-tree">
              <el-tree class="tree-panel" ref="refTree" :data="blogList" defaultExpandAll node-key="blogId"
                :expand-on-click-node="false" :props="treeProps" :highlight-current="true" @node-click="treeNodeClick">
                <template #default="{ node, data }">
                  <span class="custom-node-style">
                    <span class="node-title">{{ data.title }}
                      <span v-if="data.status == 0" style="color:red">
                        草稿
                      </span>
                    </span>
                  </span>
                </template>
              </el-tree>
            </div>
          </el-card>
        </el-col>
        <el-col :span="14">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>文章详情</span>
              </div>
            </template>
            <div v-if="blog.title">
              <div class="my-title" style="margin-bottom:20px;font-weight:bold;font-size:20px;"> {{ blog.title }}</div>
            </div>
            <div v-else style="text-align:center;color:#bbb;font-size:13px;">请选择专题文章，查看详情。</div>
            <div class="blog-detail" v-html="blog.content" style="white-space:pre-wrap"></div>
          </el-card>
        </el-col>
      </el-row>

    </Window>
  </div>
</template>
<script setup>
import { reactive, ref, getCurrentInstance, nextTick } from 'vue'
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-light.css';

const { proxy } = getCurrentInstance()
const refTree=ref()
const currentBlogId = ref()
const api = {
  getBlogDetail: '/blog/getBlogById',
  getSpecialInfo: 'blog/getSpecialInfo',
}
const blog = ref({})
const showDetail = async (data) => {
  windowConfig.show = true
  currentBlogId.value=data.blogId
  //获取所有文章树
  getSpecialInfo(data.categoryId)
  //获取文章详情
  showBlogDetail(data.blogId)
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
const blogList = ref([])
const loadBlogList = async () => {
  let result = await proxy.request({
    url: api.getSpecialInfo,
    params: {
      categoryId: currentCategoryId.value,
      showType: '1',
    }
  })
  if (result.code == 200) {
    blogList.value = result.data
  }
}
const treeProps = {
  childern: 'children',
  label: 'title',
  value: 'blogId'
}
const treeNodeClick=(data)=>{
  if(data.blogId=='0'){
    blog.value={}
    return
  }
  showBlogDetail(data.blogId)
}
const getSpecialInfo = async (categoryId) => {
  let result = await proxy.request({
    url: api.getSpecialInfo,
    params: {
      categoryId: categoryId,
      showType: '1',
    }
  })
  if (result.code == 200) {
    blogList.value = result.data
    nextTick(() => {
      refTree.value.setCurrentKey(currentBlogId.value)
    })
  }
}
const showBlogDetail=async(blogId)=>{
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
//高亮显示
defineExpose({ showDetail })
</script>
<style lang="scss" scoped>
.blog-detail {
  code {
    padding: 5px;
    background: #DDD;
  }

  blockquote {
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
  }

  img {
    max-width: 80%;
  }
}
</style>