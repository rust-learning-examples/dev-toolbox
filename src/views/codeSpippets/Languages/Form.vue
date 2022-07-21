<template>
  <fragment-form v-bind="formConfig">
    <template #default="{setFormRef, formRef, model, submitLoading, onSubmit, onCancel}">
      <el-form :ref="setFormRef" :model="model" label-width="50px">
        <el-form-item label="名称" prop="name" :rules="[{required: true, message: '必填', trigger: ['change', 'blur']}]">
          <el-input v-model="model.name" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input type="textarea" v-model="model.desc" placeholder="描述"></el-input>
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
      tables: computed(() => database!.tables),
      formConfig: {
        model: {...props.record},
        async onSubmit() {
          const model = state.formConfig.model
          const { name = '', desc = '' } = model
          let sql = `INSERT INTO languages(name, desc) values($1, $2)`
          if (props.record) {
            sql = `UPDATE languages set name = $1, desc = $2, updated_at = datetime('now', 'localtime') where id = ${props.record.id}`
          }
          const result = await database?.db.execute(sql, [name.toLowerCase(), desc]).catch(e => {
            ElNotification({title: '错误', message: `${e}`, type: 'error',})
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