<template>
  <div class="">
    <el-form label-width="200px" style="width:50%" :model="formData" :rules="rules" ref="editFormRef">
      <el-form-item label="是否开启评论/留言板?" prop="openCommentType">
        <div>
          <el-radio-group v-model="formData.openCommentType">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </div>
      </el-form-item>
      <template v-if="formData.openCommentType == 1">
        <el-form-item label="畅言appId" prop="changyanAppId">
          <el-input :maxLength="50" v-model="formData.changyanAppId"></el-input>
        </el-form-item>
        <el-form-item label="畅言appKey" prop="changyanAppKey">
          <el-input :maxLength="50" v-model="formData.changyanAppKey"></el-input>
        </el-form-item>
      </template>
      <el-form-item label="是否开启Git Pages" prop="gitPagesType">
        <div>
          <el-radio-group v-model="formData.gitPagesType">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </div>
      </el-form-item>
      <el-form-item label="开启公安备案和ICP备案信息" prop="showIcp">
        <div>
          <el-radio-group v-model="formData.showIcp">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </div>
      </el-form-item>
      <template v-if="formData.showIcp == 1">
        <el-form-item label="ICP备案域名" prop="icpDomain">
          <el-input :maxLength="200" v-model="formData.icpDomain"></el-input>
        </el-form-item>
        <el-form-item label="ICP备案号" prop="icpNo">
          <el-input :maxLength="100" v-model="formData.icpNo"></el-input>
        </el-form-item>
        <el-form-item label="公安备案省份" prop="policeProvince">
          <el-select v-model="formData.policeProvince">
            <el-option v-for="(item, index) in provinceList" :label="item" :value="item" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="公安备案号" prop="policeNo">
          <el-input :maxLength="100" v-model="formData.policeNo"></el-input>
        </el-form-item>
      </template>
      <el-form-item label="下载静态页面">
        <a href="#">点我下载</a>
      </el-form-item>
      <el-form-item>
        <el-button @click="submitForm" color="green">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
const {proxy} = getCurrentInstance()
const store = useStore()
const formData = reactive({})
const editFormRef = ref()
const api = {
  getSysSetting: 'sysSetting/getSysSetting',
  saveSysSetting: 'sysSetting/saveSysSetting',
  crateZip: 'sysSetting/crateZip'
}
const provinceList = ["京", "津", "冀", "晋,", "蒙", "辽", "吉", "黑", "沪", "苏", "浙", "皖", "闽", "赣", "鲁", "豫", "鄂", "湘", "粤", "桂", "琼", "渝", "川", "黔", "滇", "陕", "甘", "青", "宁", "新", "台", "港", "澳"]
const rules = {
  openCommentType: [{ required: true, message: '是否开启评论不能为空' }],
  changyanAppId: [{ required: true, message: "畅言appId不能为空" }],
  changyanAppKey: [{ required: true, message: "畅言appKey不能为空" }],
  gitPagesType: [{ required: true, message: "是否开启Git Pages不能为空" }],
  showIcp: [{ required: true, message: "是否开启公安备案和ICP备案信息不能为空"}],
  icpDomain: [{ required: true, message: "ICP备案号不能为空" }],
  icpNo:[{ required: true, message: "ICP备案号不能为空"}],
  policeProvince:[{ required: true,message:'公安备案省份不能为空'}],
  policeNo:[{required: true,message:'公安备案号不能为空'}]
}
onMounted(()=>{
  getSysSetting();
})
const getSysSetting = async () => {
  let result = await proxy.request({
    url: api.getSysSetting
  })

  if(result.code==200){
    Object.assign(formData, result.data)
  }
}
const submitForm = () => {
  editFormRef.value.validate(async (valid) => {
    if (!valid) {
      return false
    }
    let params = {}
    Object.assign(params, formData)
    let result = await proxy.request({
      url: api.saveSysSetting,
      params,
    })
    if (result.code == 200) {
      ElMessage({
        type: 'success',
        message: '保存成功!'
      })
    } else {
      ElMessage({
        type: 'error',
        message: '保存失败!'
      })
    }
  })
}
const createZip=async()=>{
  let result=await proxy.request({
    url:api.createZip
  })
  if(result.code==200){
    document.location.href='/api/file/download/' + result.data + '/' + encodeURI('静态页面.zip');
  }
}

</script>
<style scoped></style>
