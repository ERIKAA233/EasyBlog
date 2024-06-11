<template>
  <div class="">
    <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="100px">
      <el-row :gutter="10">
        <el-col :span="8">
          <el-form-item label="头像" prop="avatar">
            <CoverUpload v-model="formData.avatar" @callback="saveAvatar" />
          </el-form-item>
          <el-form-item label="昵称" prop="nickName">
            <el-input style="width: 300px" v-model="formData.nickName" placeholder="请输入昵称" clearable>
            </el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input style="width: 300px" v-model="formData.phone" placeholder="请输入手机号" clearable>
            </el-input>
          </el-form-item>
          <el-form-item label="密码">
            <a href="#" @click="showUpdatePassword">修改密码</a>
          </el-form-item>
          <el-form-item label="默认编辑器" prop="editorType">
            <el-radio-group v-model="formData.editorType">
              <el-radio label="富文本编辑器" :value="0"></el-radio>
              <el-radio label="Markdown编辑器" :value="1"></el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="职业" prop="profession">
            <el-input style="width: 300px" v-model="formData.profession" placeholder="请输入职业" clearable>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button color="green" @click="saveMy">提交</el-button>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="简介" prop="introduction">
            <EditorHtml v-model="formData.introduction"></EditorHtml>
            <!-- <MarkDown v-model="formData.introduction"></MarkDown> -->
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons"
      @close="dialogConfig.show = false" width="400px">
      <el-form :model="passwordFormData" :rules="rules" ref="passwordFormRef" label-width="100px">
        <!-- 密码输入框 -->
        <el-form-item prop="password" label="密码" type="password">
          <el-input v-model="passwordFormData.password" placeholder="请输入密码" size="large" clearable>
          </el-input>
        </el-form-item>
        <el-form-item prop="rePassword" label="重复密码" type="password">
          <el-input v-model="passwordFormData.rePassword" placeholder="请再次输入密码" size="large" clearable>
          </el-input>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>
<script setup>
import {ref,reactive,getCurrentInstance,onMounted,nextTick} from 'vue'
import {ElMessage} from 'element-plus'
import { useStore } from 'vuex'
const store=useStore()
const formData = ref({})
const {proxy}=getCurrentInstance()
const api = {
  getUserInfo:'getUserInfo',
  saveMyInfo:'saveMyInfo',
  updateMyPassword:'updateMyPassword',
  saveAvatar:'saveAvatar'
}
const validatePass = (role, value, callback) => {
  if (value !== passwordFormData.value.password) {
    callback(new Error(rules.message))
  } else {
    callback()
  }
}
const rules = {
  avatar: [{ required: true, message: '请上传头像' }],
  nickName: [{ required: true, message: '请上传昵称' }],
  editorType: [{ required: true, message: '请选择默认编辑器' }],
  password:[{required:true,message:'请输入密码'},
    {
      validator:proxy.verify.password,
      message:'密码最少8位，只能数字/字母/特殊字符'
    },
  ],
  rePassword: [{ required: true, message: '请再次输入密码' },
    {
      validator:validatePass,
      message:'两次输入的密码不一致'
    }
  ],
  phone: [{ required: true, message: '请输入手机号' },
    {
      validator: proxy.verify.phone,
      trigger:'blur',
      message: '请输入正确的手机号'
    }
  ],
}
onMounted(()=>{
  getUserInfo()
})

const getUserInfo=async()=>{
  let result=await proxy.request({
    url:api.getUserInfo
  })
  if(result.code==200){
    formData.value=result.data
  }
}
const formDataRef=ref()
const saveMy=async()=>{
  formDataRef.value.validate(async(valid)=>{
    if(!valid) return
    let result = await proxy.request({
      url: api.saveMyInfo,
      params: {
        avatar: formData.value.avatar,
        nickName: formData.value.nickName,
        phone: formData.value.phone,
        editorType: formData.value.editorType,
        profession: formData.value.profession,
        introduction: formData.value.introduction
      }
    })
    if (result.code == 200) {
      ElMessage({
        type: 'success',
        message: '个人信息提交成功!',
      })
      //无感刷新
      store.commit('updateUserInfo', {
        nickName: formData.value.nickName,
        avatar: formData.value.avatar
      })
    }
  })
}
const passwordFormData=ref({})
const passwordFormRef=ref()
const dialogConfig = reactive({
  show: false,
  title: '修改密码',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: (e) => {
        submitPass();
      }
    },
  ]
})
const showUpdatePassword=()=>{
  dialogConfig.show=true
  nextTick(()=>{
    passwordFormRef.value.resetFields()
  })
}
const submitPass = () => {
  passwordFormRef.value.validate(async (valid) => {
    if (!valid) return
    let result = await proxy.request({
      url: api.updateMyPassword,
      params:{
        password:passwordFormData.value.password
      }
    })
    if (result.code == 200) {
      dialogConfig.show = false
      ElMessage({
        type: 'success',
        message: '修改密码成功!'
      })
    } else {
      ElMessage({
        type: 'error',
        message: '修改密码失败!'
      })
    }
  })
}
const saveAvatar=async(avatar)=>{
    let result = await proxy.request({
  url: api.saveAvatar,
  params: {
        avatar: avatar
      }
    })
    if (result.code == 200) {
      dialogConfig.show = false
      ElMessage({
        type: 'success',
        message: '修改头像成功!'
      })
      store.commit('updateUserInfo', {
        nickName: formData.value.nickName,
        avatar: avatar
      })
    } else {
      ElMessage({
        type: 'error',
        message: '修改头像失败!'
      })
    }
}
</script>
<style scoped>
a {
  text-decoration: none;
  color: green;
}
</style>
