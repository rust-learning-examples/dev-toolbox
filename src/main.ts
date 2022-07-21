import { createApp, render } from 'vue'

import App from './App.vue'
import store from './store'
import router from './router'

import './assets/stylesheets/application.scss'
import 'element-plus/dist/index.css'
import http from './utils/http'

function initVueApp() {
  const app = createApp(App)
  app.use(store).use(router).mount('#app')

  // 配置到全局变量中 const gv = getCurrentInstance().appContext.config.globalProperties
  app.config.globalProperties.$http = http

  app.render = (vnode, rootContainer): void => {
    if (vnode && !vnode.appContext) vnode.appContext = app._context
    render(vnode, rootContainer)
  }
}

import { appWindow } from '@tauri-apps/api/window'
import * as notification from '@tauri-apps/api/notification'
import { useDatabaseAsync } from '@/utils/hooks/useDatabase'
async function initTauri() {
  // https://tauri.studio/docs/api/js/modules/event#eventname
  appWindow.listen('tauri://close-requested', () => {
    appWindow.hide();
  })

  if (!await notification.isPermissionGranted()) {
    notification.requestPermission().then((response) => {
      if (response === "granted") {
        console.log("OK")
      } else {
        console.log("Permission is " + response);
      }
    })
  }

  await useDatabaseAsync()
}
initTauri().then(() => {
  initVueApp()
})