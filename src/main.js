import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import VueCookies from 'vue-cookies'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/icon/iconfont.css'
import '@/styles/index.scss'
import request from '@/utils/request'
import verify from '@/utils/verify'
import store from '@/store/index.js'
import Table from '@/components/table/index.vue'
import Cover from '@/components/cover/index.vue'
import Dialog from '@/components/dialog/index.vue'
import Window from '@/components/window/index.vue'
import MarkDown from '@/components/markdown/index.vue'
import CoverUpload from '@/components/coverUpload/index.vue'
import EditorHtml from '@/components/editorHtml/index.vue'
import 'md-editor-v3/lib/style.css';

const app = createApp(App)

import { loadIcon } from './utils/icon'
loadIcon(app)
app.use(store)
app.use(router)
app.use(ElementPlus)
app.config.globalProperties.request = request
app.config.globalProperties.verify = verify
app.config.globalProperties.VueCookies=VueCookies
app.config.globalProperties.globalInfo = {
  imageUrl: '/api/file/getImage/'
}
app.component('Table', Table)
app.component('Cover', Cover)
app.component('Dialog', Dialog)
app.component('Window', Window)
app.component('MarkDown', MarkDown)
app.component('CoverUpload', CoverUpload)
app.component('EditorHtml', EditorHtml)
app.mount('#app')
