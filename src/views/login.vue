<template>
  <div class="login-body">
    <div class="login-form">
      <!-- el-form 组件绑定模型数据和校验规则，并引用一个表单实例 -->
      <el-form :model="formData" :rules="rules" ref="formDataRef">
        <h2>用户登录</h2>
        <!-- 账号输入框 -->
        <el-form-item prop="account">
          <el-input v-model="formData.account" placeholder="请输入账号" size="large" clearable>
            <template #prefix>
              <span class="iconfont icon-account"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 密码输入框 -->
        <el-form-item prop="password">
          <el-input v-model="formData.password" placeholder="请输入密码" size="large" type="password" clearable>
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 验证码输入框 -->
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <el-input v-model="formData.checkCode" class="input-panel" size="large" @keyup.enter.native="login"
              placeholder="请输入验证码" clearable />
            <img :src="checkCodeUrl" @click="changeCheckCode" class="check-code">
          </div>
        </el-form-item>
        <!-- 记住我 复选框 -->
        <el-form-item label="">
          <el-checkbox v-model="formData.rememberMe" :label="true">记住我</el-checkbox>
        </el-form-item>
        <!-- 登录按钮 -->
        <el-form-item>
          <el-button type="primary" style="width:100%" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref, reactive, onMounted } from 'vue'
import {useRouter} from 'vue-router'
import md5 from 'js-md5'
import { ElMessage } from 'element-plus';


onMounted(() => {
  init();
})

const router=useRouter()
// 定义API接口
const api = {
  checkCode: "api/checkCode",
  login: "login"
}

// 验证码URL
const checkCodeUrl = ref(api.checkCode)

// 更改验证码URL以防止缓存
const changeCheckCode = () => {
  checkCodeUrl.value = api.checkCode + '?' + new Date().getTime()
}

// 表单数据
const formData = reactive({})
const formDataRef = ref(null)

// 获取当前实例
const { proxy } = getCurrentInstance()

// 定义表单校验规则
const rules = {
  account: [{
    required: true,
    message: "请输入用户名",
  }],
  password: [{
    required: true,
    message: "请输入密码",
  }],
  checkCode: [{
    required: true,
    message: "请输入验证码",
  }]
}

const init = () => {
  const loginInfo = proxy.VueCookies.get('loginInfo');
  if (!loginInfo) {
    return
  }
  Object.assign(formData, loginInfo)
  //键盘检测事件 回车提交
}
// 登录方法
const login = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let cookieLoginInfo = proxy.VueCookies.get('loginInfo')
    let cookiePassword = cookieLoginInfo == null ? null : cookieLoginInfo.password

    if (formData.password !== cookiePassword) {
      formData.password = md5(formData.password)
    }

    let params = {
      account: formData.account,
      password: formData.password,
      checkCode: formData.checkCode,
      rememberMe: formData.rememberMe,
    }
    // 发起登录请求
    let result = await proxy.request({
      url: api.login,
      params: params,
      errorCallback: () => {
        changeCheckCode() // 请求失败时更换验证码
      }
    })
    if(!result){
      ElMessage({
        type: 'error',
        message: '登录失败!'
      })
      return
    }
    ElMessage({
      type: 'success',
      message: '登录成功!'
    })

    setTimeout(() => {
      router.push('/')
    }, 1000);

    //保存账号密码
    const loginInfo = {
      account: params.account,
      password: params.password,
      rememberMe: params.rememberMe,
    }

    proxy.VueCookies.set("userInfo", result.data, 0)

    if (formData.rememberMe) {
      proxy.VueCookies.set("loginInfo", loginInfo, "7d")
    }
    
  })
}
</script>

<style scoped lang="scss">
/* 登录页面样式 */
.login-body {
  width: 100%;
  height: 100vh;
  background: url(../assets/login-background.jpg) no-repeat center;
  background-size: cover;

  .login-form {
    float: right;
    margin: 200px 100px;
    padding: 20px;
    width: 350px;
    background: rgba(255, 255, 255, .7);
    border-radius: 5px;
    box-shadow: 2px 2px 10px #ddd;

    h2 {
      font-size: 20px;
      margin-bottom: 20px;
      font-weight: bold;
    }

    .check-code-panel {
      width: 100%;
      display: flex;
      align-items: center;

      .input-panel {
        flex: 1;
        margin-right: 5px;
      }

      img {
        height: 35px;
        cursor: pointer
      }
    }
  }
}
</style>
