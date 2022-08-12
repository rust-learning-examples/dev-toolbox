<template>
  <fragment-form v-bind="formConfig">
    <template #default="{setFormRef, formRef, model, submitLoading, onSubmit, onCancel}">
      <el-form :ref="setFormRef" :model="model" label-width="50px">
        <el-form-item label="标题" prop="title" :rules="[{required: true, message: '必填', trigger: ['change', 'blur']}]">
          <el-input v-model="model.title" placeholder="标题"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address_rule" :rules="[{required: true, message: '必填', trigger: ['change', 'blur']}]">
          <el-input v-model="model.address_rule" placeholder="地址(支持正则)"></el-input>
        </el-form-item>
        <el-form-item label="目标地址" prop="target_address" :rules="[{required: true, message: '必填', trigger: ['change', 'blur']}]">
          <el-input v-model="model.target_address" placeholder="目标地址"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="model.remark" placeholder="备注"></el-input>
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
import { useDatabase } from '@/utils/hooks/useDatabase'

export default defineComponent({
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
          const { title, address_rule, target_address, remark = '' } = model
          let sql = `INSERT INTO http_proxy_rules(title, address_rule, target_address, remark) values($1, $2, $3, $4)`
          if (props.record) {
            sql = `UPDATE http_proxy_rules set title = $1, address_rule = $2, target_address = $3, remark = $4, updated_at = datetime('now', 'localtime') where id = ${props.record.id}`
          }
          const result = await database?.db.execute(sql, [title, address_rule, target_address, remark]).catch(e => {
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