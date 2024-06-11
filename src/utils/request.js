// 引入axios库
import axios from 'axios'
// 引入Element Plus的Loading服务
import { ElLoading } from 'element-plus';
// 引入Vue Router
import router from '../router';


// 定义不同内容类型的常量
const contentTypeForm = 'application/x-www-form-urlencoded;charset=UTF-8'
const contentTypeJson = "application/json";
const contentTypeFile = "multipart/form-data"

// 二次封装axios请求函数
const request = (config) => {
  // 从配置中解构出url、params、dataType和showLoading
  let { url, params, dataType, showLoading } = config;
  // 设置默认的数据类型为form
  dataType = dataType ? dataType : "form";
  // 设置默认的加载显示状态为true
  showLoading = showLoading ? true : false;

  // 设置请求头的Content-Type
  let contentType = contentTypeForm
  if (dataType == 'json') {
    contentType = contentTypeJson
  } else if (dataType == 'file') {
    contentType = contentTypeFile
    // 如果数据类型是文件，使用FormData封装参数
    let param = new FormData()
    for (let key in params) {
      param.append(key, params[key])
    }
    params = param
  }

  // 创建Axios实例
  const instance = axios.create({
    baseURL: '/api', // 设置基础URL
    timeout: 10 * 1000, // 设置超时时间
    headers: {
      'Content-Type': contentType, // 设置请求头的Content-Type
      'X-Requested-With': 'XMLHttpRequest', // AJAX请求标志
    }
  })

  // 定义loading变量用于存储加载动画实例
  let loading = null;

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 如果showLoading为true，显示加载动画
      if (showLoading) {
        loading = ElLoading.service({
          lock: true,
          text: '正在加载...',
          background: 'rgba(0, 0, 0, 0.7)',
        })
      }
      return config; // 返回配置
    },
    (error) => {
      // 如果请求失败，关闭加载动画并显示错误信息
      if (showLoading && loading) {
        loading.close();
      }
      return Promise.reject("发送请求失败!") // 返回错误信息
    }
  )

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      // 如果showLoading为true，关闭加载动画
      if (showLoading && loading) {
        loading.close();
      }
      const responseData = response.data
      // 处理响应数据中的错误状态
      if (responseData.status == 'error') {
        if (config.errorCallback) {
          config.errorCallback() // 调用错误回调
        }
        return Promise.reject(responseData.info) // 返回错误信息
      } else {
        if (responseData.code == 200) {// 显示成功信息
          return responseData // 返回响应数据
        } else if (responseData.code == 901) {
          // 如果登录超时，跳转到登录页面
          setTimeout(() => {
            router.push("/login")
          }, 2000)
          return Promise.reject('登录超时!')
        }
      }
    },
    (error) => {
      console.log(error)
      // 如果响应失败，关闭加载动画并返回错误信息
      if (showLoading && loading) {
        loading.close();
      }
      return Promise.reject('网络异常!')
    }
  )

  // 发送POST请求并处理错误
  return instance.post(url, params).catch(error => {
    return null; // 返回null表示请求失败
  })
}

// 导出封装的请求函数
export default request;