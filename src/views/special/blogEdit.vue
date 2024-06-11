<template>
  <div class="">
    <Window @showSettings="showSettings" :buttons="windowConfig.buttons" @close="closeWindow" :show="windowConfig.show" @closeWindow="closeWindow"
      @callBack="loadDataList" ref="blogEditRef">
      <el-form :model="blogFormData" ref="blogFormRef" :rules="rules">
        <el-form-item prop="title">
          <div class="title-input">
            <el-input v-model="blogFormData.title" style="font-size:17px; " size="large"
              placeholder="请输入博客标题"></el-input>
          </div>
        </el-form-item>
        <el-form-item prop="content">
          <div style="width:100%;">
            <MarkDown v-if="blogFormData.editorType === 1" v-model="blogFormData.markdownContent"
              @htmlContent="setHtmlContent" />
            <EditorHtml v-else v-model="blogFormData.content">
            </EditorHtml>
          </div>
        </el-form-item>
      </el-form>
    </Window>
  </div>

</template>
<script setup>
import { ref, nextTick, reactive, onMounted, getCurrentInstance, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

// 初始化相关
const { proxy } = getCurrentInstance()
const blogFormData = reactive({})
const blogFormRef = ref(null)

const timer = ref(null)
const categoryList = ref([])
const tagList = ref([])

const emit = defineEmits(['close'])
// API接口配置
const api = {
  saveblog: '/blog/saveBlog4Special',
  getUserInfo: '/getUserInfo',
  getBlogDetail: '/blog/getBlogById',
  autoSave: '/blog/autoSaveBlog4Special',
}
// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入标题' }],
  content: [{ required: true, message: '请输入内容' }],
  categoryId: [{ required: true, message: '请选择博客分类' }],
  type: [{ required: true, message: '请选择博客分类' }],
  allowComment: [{ required: true, message: '请选择是否允许评论' }],
  reprintUrl: [{ required: true, message: '请输入原文地址' }],
}
//窗口配置
const windowConfig = reactive({
  show: false,
  title: '标题',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: (e) => {
        submitBlog()
      }
    },
  ],
})
// 生命周期钩子
onUnmounted(() => {
  cleanTimer()
})
//初始化函数
const init = (type, data) => {
  windowConfig.show = true;
 
  nextTick(() => {
    startTimer()
    Object.assign(blogFormData, {
      title: '',
      content: '',
      markdownContent: '',
      categoryId: '',
      cover: '',
      type: null, // Assuming 0 is a default value
      reprintUrl: '',
      allowComment: null, // Assuming 1 is a default value
      summary: '',
      tag: [],
    })
    blogFormData.categoryId = data.categoryId
    blogFormData.pBlogId=data.blogId
    // blogFormData.value={categoryId:data.categoryId,pBlogId:data.blogId}
    if (type === "add") {
      getUserInfo()
    } else {
      getBlogDetail(data.blogId)
    }
  })
}
// 数据加载和保存
const setHtmlContent = (htmlContent) => {
  blogFormData.content = htmlContent
}

const getUserInfo = async () => {
  let result = await proxy.request({
    url: api.getUserInfo,
  })
  if (result.code == 200) {
    blogFormData.editorType = result.data.editorType
  }
}

const getBlogDetail = async (blogId) => {
  let result = await proxy.request({
    url: api.getBlogDetail,
    params: { blogId }
  })
  if (result.code == 200) {
    Object.assign(blogFormData, result.data)
    if (result.data.tag) {
      blogFormData.tag = result.data.tag.split('|')
    }
  }
}


// 自动保存
const autoSave = async () => {
  if (blogFormData.title === '' && blogFormData.content === '' || timer.value == null) return
  const params = {}
  Object.assign(params, blogFormData)
  let result = await proxy.request({
    url: api.autoSave,
    showLoading: false,
    params: params
  })

  if (result.code == 200) {
    blogFormData.blogId = result.data
  }
}

// 定时器
const startTimer = () => {
  timer.value = setInterval(() => {
    autoSave()
  }, 10000)
}

const cleanTimer = () => {
  if (timer.value !== null) {
    clearInterval(timer.value)
    timer.value = null
  }
}


// 窗口控制
const closeWindow = () => {
  windowConfig.show = false
  emit('callback')
  if (timer.value != null) {
    cleanTimer()
  }

}
const close = () => {
  windowConfig.show = false
  emit('callback')
  cleanTimer()
}
const submitBlog=()=>{
  blogFormRef.value.validate(async (valid) => {
    if (!valid) return
    let params=Object.assign({},blogFormData)
    let result=await proxy.request({
      url:api.saveblog,
      params
    })

    if(result.code==200){
      ElMessage({
        type:'success',
        message:'新增文章成功!'
      })
      closeWindow()
    }
  })

}

defineExpose({ init })
</script>
<style scoped lang="scss">
 .title {
   height: 30px;
   display: flex;
   align-items: center;
   padding-left: 10px;

   .icon-back {
     cursor: pointer;
   }
 }

 .title-input {
   border-bottom: 1px solid #ddd;
   width: 100%;

   :deep(.el-input__wrapper) {
     box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
     cursor: default;
   }

 }

</style>
