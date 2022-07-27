<template>
  <div class="page">
    <fragment-table ref="tableRef" v-bind="tableConfig">
      <template #searchBar="{query, fetchLoading, fetchData}">
        <div class="flex justify-between items-end">
          <fragment-form>
            <el-form inline :model="query">
              <el-form-item label="名称" clearable>
                <el-input v-model="query.name" placeholder="名称" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="fetchLoading.value" @click="fetchData">搜索</el-button>
                <el-button @click="fetchData({pageNo: 1}, false)">重置</el-button>
              </el-form-item>
            </el-form>
          </fragment-form>
          <el-form class="ops">
            <el-form-item>
              <el-button type="primary" @click="onNew">添加</el-button>
            </el-form-item>
          </el-form>
        </div>
      </template>
      <template #default="{data}">
        <el-table :data="data" default-expand-all>
          <el-table-column label="ID" prop="id" />
          <el-table-column label="名称" prop="name" />
          <el-table-column label="描述" prop="desc" />
          <el-table-column label="创建时间" prop="created_at" />
          <el-table-column label="更新时间" prop="updated_at" />
          <el-table-column label="操作">
            <template #default="{row}">
              <el-space wrap>
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
import { reactive, toRefs, defineComponent, defineAsyncComponent, createVNode, computed } from 'vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import CodeEditor from '@/components/shared/CodeEditor.vue'
import { useDatabase } from '@/utils/hooks/useDatabase'
import { useDialog } from '@/utils/hooks/useDialog'

export default defineComponent({
  components: {
    CodeEditor
  },
  setup (props, ctx) {
    const database = useDatabase()
    const dialog = useDialog()

    const state = reactive({
      databaseState: computed(() => database!.state),
      tableRef: null,
      tableConfig: {
        async fetchData(query: any) {
          const limit = query.pageSize
          const offset = (query.pageNo - 1) * query.pageSize
          let whereConditions = []
          let whereSegment = ''
          if (query.name) { whereConditions.push(`name LIKE '%${query.name}%' --case-insensitive`) }
          if (whereConditions.length) {
            whereSegment = ` WHERE ${whereConditions.join(" AND ")}`
          }
          const items = await database?.db.select<Array<any>>(`select * from languages${whereSegment} limit ${limit} offset ${offset};`)
          const counts = await database?.db.select<Array<{count: number}>>(`select COUNT(*) as count from languages${whereSegment};`)
          return {
            data: items,
            pageNo: query.pageNo,
            pageSize: query.pageSize,
            totalCount: (counts as any)[0].count,
          }
        }
      },
      async onNew() {
        const instance = dialog.create({
          title: '新增代码段',
          children: {
            default: () => createVNode(defineAsyncComponent(() => import('./Form.vue')), {
              onSubmit() {
                (state.tableRef as any)?.refreshData()
                database?.fetchAllLanguages()
                instance.close()
              }
            })
          }
        })
      },
      async onEdit(record: any) {
        const instance = dialog.create({
          title: '编辑代码段',
          children: {
            default: () => createVNode(defineAsyncComponent(() => import('./Form.vue')), {
              record,
              onSubmit() {
                (state.tableRef as any)?.refreshData()
                database?.fetchAllLanguages()
                instance.close()
              }
            })
          }
        })
      },
      async onDelete(record: any) {
        await ElMessageBox.confirm('确定删除吗?', '确认', {confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning',})
        await database?.db.execute(`DELETE FROM languages where id = $1;`, [record.id]).catch(e => {
          ElNotification({title: '错误', message: `${e}`, type: 'error',})
        });
        database?.fetchAllLanguages();
        (state.tableRef as any)?.refreshData()
      }
    })
    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
</style>