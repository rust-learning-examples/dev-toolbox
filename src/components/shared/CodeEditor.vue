<template>
  <div class="code-editor-container">
    <div class="code-editor" ref="codeRef"></div>
  </div>
</template>

<script>
// yarn add brace
import {defineComponent, reactive, toRefs, onMounted, nextTick, watch, computed, markRaw} from 'vue'
import ace from 'ace-builds'
import workerJavascriptUrl from "ace-builds/src-noconflict/worker-javascript?url";
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/ext-searchbox'
import "ace-builds/src-noconflict/snippets/javascript"
import 'ace-builds/src-noconflict/theme-chrome' // 默认设置的主题
import 'ace-builds/src-noconflict/mode-javascript' // 语言 javascript
// https://github.com/ajaxorg/ace/wiki/Configuring-Ace
ace.config.setModuleUrl('ace/mode/javascript_worker', workerJavascriptUrl);

export default defineComponent({
  props: {
    modelValue: {
      type: [String],
    },
    readonly: [Boolean],
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    const state = reactive({
      aceEditor: null,
      codeRef: null,
      contentLangs: [
        { label: 'css', value: 'css' },
        { label: 'html', value: 'html' },
        { label: 'java', value: 'java' },
        { label: 'javascript', value: 'javascript' },
        { label: 'json', value: 'json' },
        { label: 'json5', value: 'json5' },
        { label: 'jsx', value: 'jsx' },
        { label: 'kotlin', value: 'kotlin' },
        { label: 'less', value: 'less' },
        { label: 'nginx', value: 'nginx' },
        { label: 'php', value: 'php' },
        { label: 'protobuf', value: 'protobuf' },
        { label: 'python', value: 'python' },
        { label: 'ruby', value: 'ruby' },
        { label: 'rust', value: 'rust' },
        { label: 'scala', value: 'scala' },
        { label: 'scss', value: 'scss' },
        { label: 'sh', value: 'sh' },
        { label: 'sql', value: 'sql' },
        { label: 'svg', value: 'svg' },
        { label: 'swift', value: 'swift' },
        { label: 'text', value: 'text' },
        { label: 'tsx', value: 'tsx' },
        { label: 'typescript', value: 'typescript' },
        { label: 'xml', value: 'xml' },
      ],
      currentValue: computed({
        get() {
          return props.modelValue || ''
        },
        set(nv) {
          ctx.emit('update:modelValue', nv)
        }
      }),
      updateValue() {
        try {
          const code = state.aceEditor?.getSession().getValue()
          state.currentValue = code
        } catch (e) {
          console.log('getCodeError', e)
        }
      }
    })

    onMounted(() => {
      // https://github.com/ajaxorg/ace
      // https://ace.c9.io/#nav=howto
      const aceEditor = ace.edit(state.codeRef, {
        maxLines: 20, // 最大行数，超过会自动出现滚动条
        minLines: 10, // 最小行数，还未到最大行数时，编辑器会自动伸缩大小
        fontSize: 14,
        // wrap: true, // 换行
        // tabSize: 2 // 制表符设置为 2 个空格大小
      })
      state.aceEditor = markRaw(aceEditor)
      aceEditor.setOptions({
        enableSnippets: true,
        enableLiveAutocompletion: true,
        enableBasicAutocompletion: true
      })
      state.aceEditor.getSession().setMode('ace/mode/javascript')
      aceEditor.getSession().setTabSize(2)
      state.aceEditor.setTheme('ace/theme/chrome')
      aceEditor.setValue(state.currentValue)
      aceEditor.getSession().on('change', state.updateValue)
      aceEditor.clearSelection()
      nextTick(() => {
        setTimeout(() => {
          aceEditor.resize()
        }, 3000)
      })

      watch(() => props.readonly, (nv) => {
        aceEditor.setOption('readOnly', nv)
      }, {immediate: true})

      watch(() => props.modelValue, (nv) => {
        nv = nv || ''
        const aceValue = aceEditor?.getSession().getValue()
        if (nv !== aceValue) {
          aceEditor.setValue(nv)
        }
      }, {immediate: true})
    })

    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
.code-editor-container {
  position: relative;
  width: 100%;
  min-height: 200px;
  // .code-editor {}
}

</style>