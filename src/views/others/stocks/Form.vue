<template>
  <fragment-form v-bind="formConfig">
    <template #default="{setFormRef, formRef, model, submitLoading, onSubmit, onCancel}">
      <el-form :ref="setFormRef" :model="model" label-width="150px">
        <el-form-item label="代码" prop="code" :rules="[{required: true, message: '必填', trigger: ['change', 'blur']}]">
          <el-input v-model="model.code" placeholder="代码" :disabled="!!record" @blur="queryCode(model.code)"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name" :rules="[{required: true, message: '必填', trigger: ['change', 'blur']}]">
          <el-input v-model="model.name" placeholder="名称" disabled></el-input>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="model.price" :min="0" placeholder="价格" disabled style="width: 150px" :disabled="!!record"/>
        </el-form-item>
        <el-form-item label="通知低于价格" prop="notice_lower_price">
          <el-input-number v-model="model.notice_lower_price" :min="0" :step="0.01" placeholder="通知低于价格" style="width: 150px"/>
        </el-form-item>
        <el-form-item label="通知高于价格" prop="notice_higher_price">
          <el-input-number v-model="model.notice_higher_price" :min="0" :step="0.01" placeholder="通知低于价格" style="width: 150px"/>
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
import { StockService } from '@/services/StockService'

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
          const { code, name, price, notice_lower_price, notice_higher_price, remark = '' } = model
          let data = [code, name, price, notice_lower_price, notice_higher_price, remark]
          let sql = `INSERT INTO stocks(code, name, price, price_at, notice_lower_price, notice_higher_price, remark) values($1, $2, $3, datetime('now', 'localtime'), $4, $5, $6)`
          if (props.record) {
            sql = `UPDATE stocks set notice_lower_price = $1, notice_higher_price = $2, remark = $3, updated_at = datetime('now', 'localtime') where id = ${props.record.id}`
            data = [notice_lower_price, notice_higher_price, remark]
          }
          const result = await database?.db.execute(sql, data).catch(e => {
            ElNotification({title: '错误', message: `${e}`, type: 'error',})
            throw(e)
          })
          ctx.emit('submit')
          // await new Promise(resolve => {
          //   setTimeout(resolve, 3000)
          // })
        }
      },
      async queryCode(nCode: string) {
        console.log(111, nCode)
        if (nCode) {
          const remoteStock = await StockService.getDetail(nCode)
          if (remoteStock) {
            state.formConfig.model = {
              ...state.formConfig.model,
              name: remoteStock.name,
              price: Number(remoteStock.price)
            }
          }
        }
      },
    })
    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
</style>