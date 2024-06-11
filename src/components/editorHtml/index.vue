<template>
  <div style="border: 1px solid #ccc">
    <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
    <Editor style="overflow-y: hidden;" :style="{ height: height + 'px'}" :modelValue="modelValue"
      :defaultConfig="editorConfig" :mode="mode" @onCreated="handleCreated" @onChange="onChange" />
  </div>
</template>
<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { onBeforeUnmount, ref, shallowRef, onMounted } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const mode = ref('default')
const valueHtml=ref()
const toolbarConfig = {}
const editorRef = shallowRef()
const editorConfig = { placeholder: '请输入内容...',
  MENU_CONF:{
    uploadImage:{
      maxFileSize:3*1024*1024,
      server:'/api/file/uploadImage4WangEditor',
      customInsert(res,insertFn){
        insertFn(res.data.url,'','')
      }
    }
  }
 }
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height:{
    type:Number,
    default:500
  }
})


// 内容 HTML
const emit=defineEmits() 

// 模拟 ajax 异步获取内容

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})


const onChange=(editor)=>{
  emit('update:modelValue',editor.getHtml())
}

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}
</script>
<style scoped>



</style>
