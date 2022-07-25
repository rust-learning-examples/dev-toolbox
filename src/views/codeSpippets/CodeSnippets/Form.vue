<template>
  <fragment-form v-bind="formConfig">
    <template #default="{setFormRef, formRef, model, submitLoading, onSubmit, onCancel}">
      <el-form :ref="setFormRef" :model="model" label-width="50px">
        <el-form-item label="语言" prop="language_id" :rules="[{required: true, message: '必填', trigger: ['change', 'blur']}]">
          <el-select v-model="model.language_id" placeholder="语言">
            <template v-for="(option, idx) in dbState.languages" :key="idx">
              <el-option :label="option.name" :value="option.id"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="键" prop="code" :rules="[{required: true, message: '必填', trigger: ['change', 'blur']}]">
          <el-input v-model="model.code" placeholder="键"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input type="textarea" v-model="model.desc" placeholder="描述"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content" :rules="[{required: true, message: '必填', trigger: ['change', 'blur']}]">
          <CodeEditor v-model="model.content" style="min-height: 200px"></CodeEditor>
        </el-form-item>
        <el-form-item class="text-right">
          <el-button type="primary" :loading="submitLoading.value" @click="onSubmit">保存</el-button>
          <el-button @click="onCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </template>
  </fragment-form>
</template>

<script lang='tsx'>
import { reactive, toRefs, defineComponent, computed } from 'vue'
import { ElNotification } from 'element-plus'
import CodeEditor from '@/components/shared/CodeEditor.vue'
import { useDatabase } from '@/utils/hooks/useDatabase'

export default defineComponent({
  components: {
    CodeEditor,
  },
  props: {
    record: [Object],
  },
  emits: ['submit'],
  setup (props, ctx) {
    const database = useDatabase()
    const state: any = reactive({
      dbState: computed(() => database!.state),
      formConfig: {
        model: {...props.record},
        async onSubmit() {
          const model = state.formConfig.model
          const { language_id, code = '', content = '', desc = '' } = model
          let sql = `INSERT INTO code_snippets(language_id, code, content, desc) values($1, $2, $3, $4)`
          if (props.record) {
            sql = `UPDATE code_snippets set language_id = $1, code = $2, content = $3, desc = $4, updated_at = datetime('now', 'localtime') where id = ${props.record.id}`
          }
          const result = await database?.db.execute(sql, [language_id, code.toLowerCase(), content, desc]).catch(e => {
            ElNotification({title: '错误', message: `${e}`, type: 'error',})
            throw(e)
          })
          ctx.emit('submit')
          // await new Promise(resolve => {
          //   setTimeout(resolve, 3000)
          // })
        }
      }
    })
    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
</style>