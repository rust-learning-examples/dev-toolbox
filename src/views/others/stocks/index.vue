<template>
  <div class="page text-xs">
    <fragment-table ref="tableRef" v-model:pagination="pagination" v-bind="tableConfig">
      <template #searchBar="{query, fetchLoading, fetchData}">
        <div class="flex justify-between items-end mx-4">
          <fragment-form>
            <el-form inline :model="query">
              <el-form-item label="代码" clearable>
                <el-input v-model="query.code" placeholder="代码" clearable/>
              </el-form-item>
              <el-form-item label="名称" clearable>
                <el-input v-model="query.name" placeholder="名称" clearable/>
              </el-form-item>
              <el-form-item label="是否启用">
                <el-select v-model="query.enabled" placeholder="是否启用" clearable>
                  <template v-for="(option, idx) in [{label: '启用', value: 1}, {label: '未启用', value: 0}]" :key="idx">
                    <el-option :label="option.label" :value="option.value"></el-option>
                  </template>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="fetchLoading.value" @click="fetchData">搜索</el-button>
                <el-button @click="fetchData({pageNo: 1}, false)">重置</el-button>
              </el-form-item>
            </el-form>
          </fragment-form>
          <el-form class="ops" inline>
            <el-form-item>
              <el-button type="primary" @click="onNew">添加</el-button>
            </el-form-item>
          </el-form>
        </div>
      </template>
      <template #default="{data, pagination, fetchLoading, fetchData}">
        <el-table :data="data" default-expand-all>
          <el-table-column label="ID" prop="id" />
          <el-table-column label="代码" prop="code">
            <template #default="{row}">
              <el-tag>{{ row.code }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="name" />
          <el-table-column label="价格" prop="price">
            <template #default="{row}">
              <el-tag>{{ row.price }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="价格更新与" prop="price_at" width="150" />
          <el-table-column label="低于价格告警" prop="notice_lower_price">
            <template #default="{row}">
              <el-tag>{{ row.notice_lower_price }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="高于价格告警" prop="notice_higher_price">
            <template #default="{row}">
              <el-tag>{{ row.notice_higher_price }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" />
          <el-table-column label="启动" prop="enabled">
            <template #default="{row}">
              <el-switch v-model="row.enabled" :active-value="1" :inactive-value="0" :loading="row.enableSwitching" inline-prompt active-text="Y" inactive-text="N" @change="(nv: any) => { updateEnableState(row, nv) }"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="created_at" width="150" />
          <el-table-column label="更新时间" prop="updated_at" width="150" />
          <el-table-column label="操作">
            <template #default="{row}">
              <el-space :wrap="false">
                <el-button @click="onEdit(row)">编辑</el-button>
                <el-button type="danger" @click="onDelete(row)">删除</el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template #pagination="{pagination}">
        <el-pagination class="float-right mt-2" small
          :current-page="pagination.pageNo"
          @update:current-page="(pageNo) => pagination.onChange(pageNo, pagination.pageSize)"
          :page-size="pagination.pageSize"
          @update:page-size="(pageSize) => pagination.onChange(pagination.pageNo, pageSize)"
          :total="pagination.totalCount"
          :page-sizes="[10, 20, 30, 50, 100]"
          layout="total,sizes,prev,pager,next,jumper"
        ></el-pagination>
      </template>
    </fragment-table>
  </div>
</template>

<script lang='tsx'>
import { tauri } from "@tauri-apps/api"
import { reactive, toRefs, defineComponent, defineAsyncComponent, createVNode } from 'vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import { useLoading } from '@/utils/hooks/useLoading'
import { useDialog } from '@/utils/hooks/useDialog'
import { useDatabase } from '@/utils/hooks/useDatabase'

export default defineComponent({
  setup (_props, _ctx) {
    const dialog = useDialog()
    const database = useDatabase()
    const state = reactive({
      tableRef: null,
      pagination: {pageNo: 1, pageSize: 100, totalCount: 0},
      tableConfig: {
        async fetchData(query: any) {
          const limit = query.pageSize
          const offset = (query.pageNo - 1) * query.pageSize
          let whereConditions = []
          let whereSegment = ''
          if (query.code) { whereConditions.push(`code = '${query.code}' --case-insensitive`) }
          if (query.name) { whereConditions.push(`name LIKE '%${query.name}%' --case-insensitive`) }
          if (query.enabled || query.enabled === 0) { whereConditions.push(`enabled = ${query.enabled}`) }
          if (whereConditions.length) {
            whereSegment = ` WHERE ${whereConditions.join(" AND ")}`
          }
          const items = await database?.db.select<Array<any>>(`select * from stocks${whereSegment} order by updated_at desc limit ${limit} offset ${offset};`) as any[]
          const counts = await database?.db.select<Array<{count: number}>>(`select COUNT(*) as count from stocks${whereSegment};`)

          return {
            data: items,
            pageNo: query.pageNo,
            pageSize: query.pageSize,
            totalCount: (counts as any)[0].count,
          }
        }
      },
      async updateEnableState(record: any, nvState: boolean) {
        record.enableSwitching = true
        const enabled = nvState ? 1 : 0
        const sql = `UPDATE stocks set enabled = $1, updated_at = datetime('now', 'localtime') where id = ${record.id}`
        const result = await database?.db.execute(sql, [enabled]).catch(e => {
          ElNotification({title: '错误', message: `${e}`, type: 'error',})
          throw(e)
        }).finally(() => {
          record.enableSwitching = false
        });
        (state.tableRef as any)?.refreshData()
      },
      async onNew() {
        const instance = dialog.create({
          title: '新增股票',
          children: {
            default: () => createVNode(defineAsyncComponent(() => import('./Form.vue')), {
              onSubmit() {
                (state.tableRef as any)?.refreshData()
                instance.close()
              }
            })
          }
        })
      },
      async onEdit(record: any) {
        const instance = dialog.create({
          title: '编辑股票',
          children: {
            default: () => createVNode(defineAsyncComponent(() => import('./Form.vue')), {
              record,
              onSubmit() {
                (state.tableRef as any)?.refreshData()
                instance.close()
              }
            })
          }
        })
      },
      async onDelete(record: any) {
        await ElMessageBox.confirm('确定删除吗?', '确认', {confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning',})
        await database?.db.execute(`DELETE FROM http_proxy_rules where id = $1;`, [record.id]).catch(e => {
          ElNotification({title: '错误', message: `${e}`, type: 'error',})
        });
        (state.tableRef as any)?.refreshData()
      }
    })
    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
.page {
  --el-disabled-text-color: #666;

  .icon-inro {
    cursor: pointer;
  }
}
</style>