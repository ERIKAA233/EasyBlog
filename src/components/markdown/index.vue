<template>
  <MdEditor :modelValue="modelValue" @change="change" @onUploadImg="onUploadImg" />
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue';
import { MdEditor } from 'md-editor-v3';

const { proxy } = getCurrentInstance()
const props=defineProps({
  modelValue:{
    type:String,
    default:''
  }
})
const emit=defineEmits()
const change=(markdownContent,htmlContent)=>{
  emit('update:modelValue',markdownContent)
  emit('htmlContent',htmlContent)
}
const onUploadImg = async (files, callback) => {

const res = await Promise.all(
    files.map((file) => {
      return new Promise((rev, rej) => {
        const form = new FormData();
        form.append('file', file);

        proxy.request({
          url: 'file/uploadImage',
          dataType: 'file',
          params: {
            file: files[0],
            type: 1,
          }
        })
          .then((res) => rev(res))
          .catch((error) => rej(error));
      });
    })
  );
  // 方式一
  // callback(res.map((item) => item.data.url));

  // 方式二
  callback(
    res.map((item) => ({
      url: proxy.globalInfo.imageUrl + item.data.fileName,
      alt: 'alt',
      title: '图片'
    }))
  );
};

</script>