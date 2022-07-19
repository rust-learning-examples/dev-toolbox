import { createApp, render } from 'vue'

import App from './App.vue'
import store from './store';
import router from './router'

import './assets/stylesheets/application.scss'
import 'element-plus/dist/index.css'
import http from './utils/http'

const app = createApp(App)
app.use(store).use(router).mount('#app')

// 配置到全局变量中 const gv = getCurrentInstance().appContext.config.globalProperties
app.config.globalProperties.$http = http

app.render = (vnode, rootContainer): void => {
  if (vnode && !vnode.appContext) vnode.appContext = app._context
  render(vnode, rootContainer)
}