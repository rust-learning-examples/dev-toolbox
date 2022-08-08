
import { appWindow, WebviewWindow, LogicalPosition, getCurrent, currentMonitor, primaryMonitor } from '@tauri-apps/api/window'
import * as notification from '@tauri-apps/api/notification'
import * as globalShortcut from '@tauri-apps/api/globalShortcut'
import { useDatabaseAsync } from '@/utils/hooks/useDatabase'
async function initServices() {
  // init db
  const database = await useDatabaseAsync()
  const currentWindow = getCurrent()
  if (currentWindow.label !== 'main') {
    return
  }
  const monitor = await primaryMonitor()
  await database.fetchAllLanguages()
  await database.listenCodeSnippetEvent()
  await database.listenClipboardEvent()
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

  // init clipboard
  // globalShortcut https://tauri.studio/docs/api/js/modules/globalShortcut
  if (await globalShortcut.isRegistered('CmdOrControl+Shift+V')) {
    await globalShortcut.unregister('CmdOrControl+Shift+V')
  }
  // new window  https://github.com/tauri-apps/tauri/issues/1643
  // window options https://tauri.studio/docs/api/js/interfaces/window.WindowOptions
  const windowHeight = 320
  const webviewWindow = new WebviewWindow('ClipboardHistoriesWebviewWindow', {
    url: '/#/clipboardHistories',
    title: '剪切板记录',
    alwaysOnTop: true,
    focus: true,
    skipTaskbar: true,
    decorations: false,
    transparent: true,
    fileDropEnabled: false,
    fullscreen: false,
    maximized: false,
    resizable: false,
    center: false,
    x: 0,
    y: monitor!.size.height / monitor!.scaleFactor - windowHeight,
    width: monitor!.size.width / monitor!.scaleFactor,
    // minWidth: monitor!.size.width / monitor!.scaleFactor,
    // maxWidth: monitor!.size.width / monitor!.scaleFactor,
    height: windowHeight,
    // minHeight: windowHeight / monitor!.scaleFactor,
    // maxHeight: windowHeight / monitor!.scaleFactor,
    visible: false
  })
  await globalShortcut.register("CmdOrControl+Shift+V", async () => {
    //console.log('CmdOrControl+Shift+V', window.screen.width)
    await webviewWindow.show()
    await webviewWindow.setPosition(new LogicalPosition(0, monitor!.size.height / monitor!.scaleFactor - windowHeight))
    await webviewWindow.setFocus()
    await webviewWindow.setAlwaysOnTop(true)
    // https://tauri.studio/docs/api/js/classes/window.WebviewWindow#requestuserattention
    await webviewWindow.requestUserAttention(2)
  })
}

export { initServices }