import type { App, ComponentInternalInstance } from 'vue'
import { getCurrentInstance, createVNode, defineComponent, reactive, ref, provide, inject, h, onUnmounted } from 'vue'
import { ElDialog, ElConfigProvider } from 'element-plus'

const DialogComponent = defineComponent({
  props: {
    options: {
      type: Object,
      required: true,
    },
    configProvider: [Object]
  },
  setup(props) {
    const { children, ...otherOptions }  = props.options
    const dialogState: any = reactive({
      ...otherOptions,
      'onUpdate:modelValue'(value: boolean) {
        dialogState.modelValue = value
        if (typeof otherOptions['onUpdate:modelValue'] === 'function') {
          otherOptions['onUpdate:modelValue'](...arguments)
        }
      },
    })

    provide('dialogState', new Proxy(dialogState, {
      get(target, key, ...args) {
        if (key === 'close') {
          return () => target['onUpdate:modelValue'](false)
        }
        return Reflect.get(target, key, ...args)
      }
    }))

    return { dialogState }
  },
  render() {
    const dialog = h(ElDialog, this.dialogState, this.options.children || {})
    return this.configProvider ? h(ElConfigProvider, {
      locale: this.configProvider.locale,
    }, {
      default: () => dialog
    }) : dialog
  },
})

/* usage */
// import { createVNode, defineAsyncComponent } from 'vue'
// const dialog = useDialog()
// const instance = dialog.create({
//  title: '新建仓库',
//  children: {
//    // New <=> defineAsyncComponent(() => import('./New'))
//    default: () => createVNode(New, {
//      onCancel: () => {
//        // instance.unmount() // 直接移除
//        instance.close() // 弹出框完全关闭后移除
//      }
//    })
//  }
// })

export const useDialog = (defaultOptions?: any): any => {
  const configProvider = inject('elConfigProvider', null)
  const instance = getCurrentInstance() as ComponentInternalInstance
  console.assert(!!instance, 'getCurrentInstance无法获取到实例，请检查')
  const app = instance.appContext.app as App

  return {
    create (options: any): any {
      const div = document.createElement('div')
      div.setAttribute('class', 'use-dialog-container')
      document.body.appendChild(div)

      const dialogVisible = ref(true)
      const dialogVNode = createVNode(DialogComponent, {
        options: {
          //destroyOnClose: true,
          closeOnClickModal: false,
          ...defaultOptions,
          ...options,
          modelValue: dialogVisible,
          onClosed(): void {
            app.render(null, div);
            (div.parentNode as any).removeChild(div)
            if (typeof (options as any).onClosed === 'function') {
              (options as any).onClosed()
            }
          },
        },
        configProvider
      })
      dialogVNode.appContext = instance.appContext
      app.render(dialogVNode, div)

      return {
        close () {
          dialogVisible.value = false
          // dialogVNode.component.dialogState.close()
        }
      }
    }
  }
}