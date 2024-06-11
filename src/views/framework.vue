<template>
  <div class="layout">
    <el-container>
      <el-header class="header">
        <div class="logo">EasyBlog</div>
        <div class="user-info">
          <span>{{ getTime() }}好！欢迎回来，</span>
          <el-dropdown @command="handleCommand" @visible-change="handleVisibleChange" trigger="click">
            <span :class="{ 'nickname': true, 'active': dropdownVisible }">
              {{ userInfo.nickName }}
              <el-icon class="el-icon--right" :class="{ 'arrow-up': dropdownVisible, 'arrow-down': !dropdownVisible }">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <router-link to="../settings/my">个人信息</router-link>
                </el-dropdown-item>
                <el-dropdown-item color="green" command="logout" @click="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div class="avatar">
            <img :src="userInfo.avatar" alt="">
          </div>
        </div>
      </el-header>
    </el-container>
    <el-container class="container">
      <el-aside width="200px" class="left-aside">
        <div>
          <el-button class="post-btn" @click="createHtml">发布</el-button>
        </div>
        <el-menu class="menu-panel">
          <el-sub-menu v-for="(menu, index) in menuList" :index="`1-${index}`" :key="index">
            <template #title>
              <el-icon>
                <component :is="menu.icon" />
              </el-icon>
              <span style="font-size:15px">{{ menu.title }}</span>
            </template>
            <el-menu-item :class="['subMenu-item', activePath == subMenu.path ? 'active' : '']"
              v-for="(subMenu, subIndex) in menu.children" :index="`1-${index}-${subIndex}`" :key="subIndex"
              v-show="subMenu.roleType == null || subMenu.roleType == userInfo.roleType">
              <router-link v-show="subMenu.roleType == null || subMenu.roleType == userInfo.roleType" :to="subMenu.path">
                <span style="font-size:13px;">
                  {{ subMenu.title }}
                </span>
              </router-link>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      <el-main class="right-main">
        <router-view />
      </el-main>
    </el-container>
    <Dialog :show="progressDialog.show" :title="progressDialog.title" :buttons="progressDialog.buttons"
      @close="progressDialog.show=false" :show-close="false" :showCancel="false" width="400px">
      <div class="progress-container">
        <div class="progress-panel">
          <el-progress type="circle" :percentage="progressInfo.progress" :status="progressInfo.status"
            :color="colors"></el-progress>
        </div>
        <div class="error" v-if="progressInfo.result==0">
          <div>生成页面出错了，{{ progressInfo.errorMsg }}</div>
          <div class="info">具体错误，请查看服务器日志</div>
        </div>
        <div class="success" v-if="progressInfo.progress==100 && progressInfo.result==1">
          发布成功
        </div>
        <div class="btn-panel" v-if="progressInfo.progress == 100 || progressInfo.result == 0">
          <el-button class="btn" type="primary" @color="gray" @click="progressDialog.show=false">关闭</el-button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getTime } from '@/utils/time'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()
const route = useRoute()
const { proxy } = getCurrentInstance()
const activePath = ref(null)

onMounted(() => {
  init()
})
watch(route, (newVal, oldVal) => {
  activePath.value = newVal.path
}, { immediate: true, deep: true })
const api={
  getUserInfo:'getUserInfo',
  createHtml: 'createHtml',
  checkProgress:'checkProgress',
}
const init=async()=>{
  let result=await proxy.request({
    url:api.getUserInfo,
  })
  if(result.code==200){
    Object.assign(userInfo, result.data)
    userInfo.avatar = proxy.globalInfo.imageUrl + userInfo.avatar;
  }
}
const menuList = reactive([
  {
    title: '博客',
    icon: 'OfficeBuilding',
    open: true,
    children: [
      {
        title: '博客管理',
        path: '/blog/list',
      },
      {
        title: '分类管理',
        path: '/blog/category'
      }
    ]
  },
  {
    title: '专题',
    icon: 'Menu',
    open: true,
    children: [
      {
        title: '专题管理',
        path: '/special/list'
      }
    ]
  },
  {
    title: '设置',
    icon: 'Tools',
    open: true,
    children: [
      {
        title: '个人信息设置',
        path: '/settings/my'
      },
      {
        title: '博客成员',
        path: '/settings/user'
      },
      {
        title: '系统设置',
        path: '/settings/sysInfo',
        roleType: 1
      }
    ]
  },
  {
    title: '回收站',
    icon: 'Delete',
    open: true,
    children: [
      {
        title: '回收站',
        path: '/recovery/list'
      }
    ]
  }
])
const userInfo = reactive({
  nickName: '',
})

const dropdownVisible = ref(false);
const handleVisibleChange = (visible) => {
  dropdownVisible.value = visible;
}
const handleCommand = (command) => {
  if (command === 'logout') {
    // handle logout
  } else if (command === 'profile') {
    // handle profile
  }
}
const logout=async()=>{
  let result=await proxy.request({
    url:'http://localhost:3001/api/logout'
  },
)
  if (result.code == 200) {
    setTimeout(() => {
      router.push({path: '/login' })
    }, 1000);
    proxy.VueCookies.remove('userInfo')
  }
  
}
//发布
const colors=[
  {color:'#f56c6c',percentage:20 },
  {color:'#e6a23c',percentage:40},
  { color: '#6f7ad3', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#5cb87a', percentage: 100 },
]
const progressDialog=reactive({
  title:'发布',
  buttons:[],
  show:false
})
const progressInfo=reactive({
  progress:0
})
let checkTimer=null
const createHtml=async()=>{
  progressDialog.show=true
  progressInfo.progress=0
  progressInfo.status=undefined
  let result=await proxy.request({
    url:api.createHtml
  })
  if(result.code==200){
    checkProgress()
    checkTimer=setInterval(()=>{
      checkProgress()
    },1000)
  }
}
const checkProgress=async()=>{
  let result=await proxy.request({
    url:api.checkProgress,
    showLoading:false
  })
  if(result.code==200){
    if(result.data.result==0){
      progressInfo.status='exception'
      progressInfo.errorMsg=result.data.errorMsg
    }else{
      progressInfo.progress=result.data.progress
    }
    progressInfo.result=result.data.result
    if((result.data.progress==100||result.data.result==0)&&checkTimer!=null){
      clearInterval(checkTimer)
    }
  }
}
//
watch(() => store.state.userInfo, (newVal, oldVal) => {
  const avatar = proxy.globalInfo.imageUrl + newVal.avatar
  const nickName = newVal.nickName
  userInfo.avatar=avatar;
  userInfo.nickName=nickName
}, { immediate: true, deep: true }
)
</script>

<style scoped lang="scss">
.layout {
  .header {
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .logo {
      font-size: 30px;
    }

    .user-info {
      display: flex;
      align-items: center;
      .nickname {
        color: green;
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .avatar {
        width: 50px;
        height: 50px;
        border: solid #fff;
        border-radius: 50%;
        margin-left: 10px;

        img {
          width: 100%;
          height:100%;
          border-radius: 50%;
        }
      }

      .el-icon--right {
        transition: transform 0.3s ease;
      }

      .arrow-up {
        transform: rotate(180deg);
      }

      .arrow-down {
        transform: rotate(0deg);
      }
    }
  }

  .container {
    padding-top: 10px;
    background: #f5f6f7;
    height: calc(100vh - 60px);
    padding: 15px;

    .left-aside {
      padding: 15px;
      width: 250px;

      .post-btn {
        color: #fff;
        background: green;
        height: 40px;
        width: 100%;
      }

      .menu-panel {
        background: #f5f6f7;
        border-right: none;

        .subMenu-item {
          background: #f5f6f7;

          span {
            color: black;
          }
        }

        .active {
          background: rgba(128, 128, 128, .3);
        }

        .subMenu-item:hover {
          background: rgba(128, 128, 128, .3);

          span {
            color: green;
          }
        }

        .subMenu-item a {
          text-decoration: none;
        }
      }
    }

    .right-main {
      background:#fff;
      padding:20px 10px 10px 10px;
      position:relative
    }
  }
}
.progress-container {
  .progress-panel {
    display: flex;
    justify-content: center;
  }

  .error {
    color: red;
    margin-top: 20px;

    .info {
      font-size: 13px
    }
  }

  .success {
    margin-top: 20px;
    text-align: center;
    font-size: 16px;
    color: green;
  }

  .btn-panel {
    text-align: center;
    margin-top: 20px;

    .btn {
      margin: 0px auto
    }
  }
}

</style>
