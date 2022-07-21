<template>
  <slot v-bind="{...slotData}"></slot>
</template>

<script lang='tsx'>
import { reactive, toRefs, defineComponent, inject, computed } from 'vue'
import { useLoading } from '@/utils/hooks/useLoading'

export default defineComponent({
  inheritAttrs: false,
  setup (_props, ctx) {
    const dialogState = inject('dialogState', null)

    const state: any = reactive({
      submitLoading: useLoading(),
      formRef: null,
      formAttrs: computed(() => {
        const attrs: any = {}
        for (const key in ctx.attrs) {
          if (!/^(_|onSubmit|onCancel|onReset)/.test(key)) {
            attrs[key] = ctx.attrs[key]
          }
        }
        // onSubmit
        attrs['onSubmit'] = (...args: any[]) => {
          state.submitLoading.load(async () => {
            await state.formRef?.validate().then(async () => {
              //await new Promise(resolve => {
              //  setTimeout(() => {
              //    resolve()
              //  }, 3000)
              //})
              let onSubmit: any = ctx.attrs['onSubmit']
              if (onSubmit) {
                args = args.length ? args : [ctx.attrs.model || {}]
                await onSubmit(...args)
              }
            })
          })
        }
        // onCancel
        attrs['onCancel'] = (...args: [any]) => {
          if ((dialogState as any)?.close) { (dialogState as any).close() }
          if ((dialogState as any)?.onCancel) { (dialogState as any)?.onCancel(...args) }
        }
        // onReset
        attrs['onReset'] = (...args: [any]) => {
          state.formRef.resetFields()
          const onReset: any = ctx.attrs['onReset']
          if (onReset) { onReset(...args) }
        }

        attrs.model = attrs.model || {}
        return attrs
      }),
    })
    return {
      ...toRefs(state),
      slotData: computed(() => {
        return {
          dialogState,
          formRef: state.formRef,
          setFormRef: (el: any) => state.formRef = el,
          ...state.formAttrs,
          submitLoading: state.submitLoading,
        }
      })
    }
  },
})
</script>

<style lang="scss" scoped>
</style>