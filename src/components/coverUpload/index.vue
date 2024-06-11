<template>
  <el-upload class="avatar-uploader" 
            name="file" 
            :show-file-list="false"
             accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP" 
            :mutiple="false" :http-request="uploadImage">
    <img v-if="modelValue" :src="proxy.globalInfo.imageUrl+modelValue" class="avatar" />
    <el-icon v-else class="avatar-uploader-icon">
      <Plus />
    </el-icon>
  </el-upload>
</template>
<script setup>
import { getCurrentInstance } from 'vue';

const {proxy} =getCurrentInstance()
const props=defineProps({
  modelValue:{
    type:String,
    default:null,
  }
})
const api={
  uploadUrl:'file/uploadImage'
}
const emit=defineEmits()
const uploadImage=async(file)=>{
  let result =await proxy.request({
    url:api.uploadUrl,
    dataType:'file',
    params:{
      file:file.file,
      type:0,
    }
  })
  const fileName=result.data.fileName
  emit('update:modelValue',fileName)
  emit('callback', fileName)

}


</script>
<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

</style>
