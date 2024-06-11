<template>
  <div class="">
    <Window @showSettings="showSettings" :buttons="windowConfig.buttons" @close="closeWindow" :show="windowConfig.show"
      @closeWindow="closeWindow" @callBack="loadDataList" ref="blogEditRef">
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
        <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons"
          @close="dialogConfig.show = false" width="500px">
          <el-form :model="blogFormData" :rules="rules" ref="settingsFormRef" label-width="100px"
            class="blog-setting-form">
            <!-- 博客分类 -->
            <el-form-item label="博客分类" prop="categoryId">
              <el-select placeholder="请选择博客分类" v-model="blogFormData.categoryId">
                <el-option v-for="item in categoryList" :value="item.categoryId" :label="item.categoryName"></el-option>
              </el-select>
            </el-form-item>
            <!-- 封面 -->
            <el-form-item label="封面" prop="cover">
              <CoverUpload v-model="blogFormData.cover" />
            </el-form-item>
            <el-form-item label="博客类型" prop="type">
              <el-radio-group v-model="blogFormData.type">
                <el-radio :label="0">原创</el-radio>
                <el-radio :label="1">转载</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="原文地址" prop="reprintUrl" v-if="blogFormData.type === 1">
              <el-input :autosize="{ minRows: 4, maxRows: 4 }" v-model="blogFormData.reprintUrl" placeholder="请输入原文链接"
                clearable>
              </el-input>
            </el-form-item>
            <el-form-item label="评论" prop="allowComment">
              <el-radio-group v-model="blogFormData.allowComment">
                <el-radio :label="1">允许</el-radio>
                <el-radio :label="0">不允许</el-radio>
              </el-radio-group>
              <el-text style="margin-left:10px;" type="info" size="small">请先在评论设置里设置好响应参数，评论才会生效</el-text>
            </el-form-item>
            <el-form-item label="博客摘要" prop="summary">
              <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 4 }" v-model="blogFormData.summary"
                placeholder="未输入摘要，则会读取原文部分内容作为摘要" size="large" clearable>
              </el-input>
            </el-form-item>
            <el-form-item label="博客标签">
              <div class="tag-input-panel">
                <el-tag closable style="margin:0 3px;" v-for="(item, index) in blogFormData.tag"
                  @close="closeTag(index)">{{
                  item }}
                </el-tag>
                <el-text style="margin-right:10px;" v-if="blogFormData.tag.length == 0" type="info"
                  size="small">添加标签更易被搜索引擎收录 </el-text>
                <el-icon style="cursor:pointer;margin-left:10px;" @click="showTagInputHandler" v-if="!showTagInput"
                  v-model="tagInputValue">
                  <Plus color="green" />
                </el-icon>
                <el-input style="margin-left:10px;" class="tag-input" v-if="showTagInput" v-model="tagInputValue"
                  @blur="tagInputResult" @keyup.enter="tagInputResult"></el-input>
              </div>
            </el-form-item>
          </el-form>
        </Dialog>
      </el-form>
    </Window>
  </div>

</template>
<script setup>
import { ref, nextTick, reactive, onMounted, getCurrentInstance, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

// 初始化相关
const { proxy } = getCurrentInstance()
const blogFormData = reactive({ tag: [] })
const blogFormRef = ref(null)
const settingsFormRef = ref(null)
const timer = ref(null)
const categoryList = ref([])
const tagList = ref([])
const showTagInput = ref(false)
const tagInputValue = ref(null)
const emit = defineEmits(['close'])
// API接口配置
const api = {
  saveblog: '/blog/saveBlog',
  loadAllCategory4Blog: '/category/loadAllCategory4Blog',
  getUserInfo: '/getUserInfo',
  getBlogDetail: '/blog/getBlogById',
  autoSave: '/blog/autoSaveBlog',
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
        showSettings()
      }
    },
  ],
})
const dialogConfig = reactive({
  show: false,
  title: '编辑设置',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: (e) => {
        submitBlog()
      }
    },
  ]
})

// 生命周期钩子
onMounted(() => {
  loadCategory()
})

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
const loadCategory = async () => {
  let result = await proxy.request({
    url: api.loadAllCategory4Blog
  })
  if (result.code == 200) {
    categoryList.value = result.data
  }
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

const submitBlog = async () => {
  const valid = await settingsFormRef.value.validate();
  // 如果验证未通过，直接返回
  if (!valid) return;

  const params = {}
  Object.assign(params, blogFormData)

  params.tag = params.tag.join('|')

  let result = await proxy.request({
    url: api.saveblog,
    params
  })
  if (result.code == 200) {
    dialogConfig.show = false
    ElMessage({ type: 'success', message: '发布博客成功!' })
    closeWindow()
    emit('callBack')
    if (timer.value !== null && windowConfig.show==false) {
      cleanTimer()
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

// 标签处理
const closeTag = (index) => {
  blogFormData.tag.splice(index, 1)
}

const showTagInputHandler = () => {
  showTagInput.value = true
}

const tagInputResult = () => {
  if (!tagInputValue.value) return // 检查空值或未定义
  showTagInput.value = false

  // 确保 tag 是数组
  if (!Array.isArray(blogFormData.tag)) {
    blogFormData.tag = []
  }

  if (blogFormData.tag.includes(tagInputValue.value)) {
    ElMessage({ type: 'error', message: '标签不能重复!' })
    return
  }

  blogFormData.tag.push(tagInputValue.value)
  tagInputValue.value = '' // 清空输入框
}

// 窗口控制
const closeWindow = () => {
  windowConfig.show = false
  emit('callBack')
  if(timer.value!=null){
    cleanTimer()
  }
  
}

const close = () => {
  windowConfig.show = false
  emit('callBack')
  cleanTimer()
}

const showSettings = () => {
  blogFormRef.value.validate(async (valid) => {
    if (!valid) return
    dialogConfig.show = true
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

 .tag-input-panel {

   .tag-input {
     width: 150px;
   }

 }
</style>
