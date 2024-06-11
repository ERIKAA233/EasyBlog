import { createRouter, createWebHistory } from 'vue-router'
import VueCookies from 'vue-cookies'
const routes = [
  {
    name: '首页',
    path: '/login',
    component: () => import('../views/login.vue'),
  },
  {
    name: '框架页',
    path: '/',
    component: () => import('../views/framework.vue'),
    redirect: '/blog/list',
    children: [
      {
        path: '/blog/list',
        name: '博客管理',
        component: () => import('../views/blog/blogger.vue')
      },
      {
        path: '/blog/category',
        name: '分类管理',
        component: () => import('../views/blog/category.vue')
      },
      {
        path: '/special/list',
        name: '专题管理',
        component: () => import('../views/special/specialList.vue')
      },
      {
        path: '/settings/my',
        name: '个人信息',
        component: () => import('../views/settings/myInfo.vue')
      }
      ,
      {
        path: '/settings/user',
        name: '博客成员',
        component: () => import('../views/settings/teamUser.vue')
      },
      {
        path: '/settings/sysInfo',
        name: '系统设置',
        component: () => import('../views/settings/sysInfo.vue')
      },
      {
        path: '/recovery/list',
        name: '回收站',
        component: () => import('../views/recovery/recoveryList.vue')
      }
    ]
  },

];

//这里不是通过new来创建，通过createRouter 方法创建，使用的模式不是通过mode来定义
const router = createRouter({
  routes,
  history: createWebHistory(),
})
//前置守卫
router.beforeEach((to, from, next) => {
  //获取用户信息
  const userInfo = VueCookies.get('userInfo')
  if (!userInfo && to.path != "/login") {
    //无用户信息 访问login
    router.push('/login')
  }
  //放行
  next()
})

export default router