<template>
  <div>
    <fragment-table ref="tableRef" v-model:pagination="pagination" v-bind="tableConfig">
      <template #searchBar="{query, fetchLoading, fetchData}">
        <div class="flex justify-between items-end">
          <fragment-form>
            <el-form inline :model="query">
              <el-form-item label="语言">
                <el-select v-model="query.language_id" clearable placeholder="语言">
                  <template v-for="(option, idx) in dbState.languages" :key="idx">
                    <el-option :label="option.name" :value="option.id"></el-option>
                  </template>
                </el-select>
              </el-form-item>
              <el-form-item label="键">
                <el-input v-model="query.code" clearable placeholder="键" />
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
        <el-collapse v-model="activeCollapses">
          <template v-for="record in data" :key="record.id">
            <el-collapse-item :name="record.id">
              <template #title>
                <el-space>
                  <el-tag>{{ languageName(record.language_id) }}</el-tag>
                  {{ record.code }}
                  <!-- {{recordCollapesed(record)}} -->
                  <el-popover placement="top-start" title="键入" :width="300" trigger="hover">
                    <template #reference>
                      <i-ep-info-filled />
                    </template>
                    <template #default>
                      <div class="flex justify-start text-left">
                        <el-tag>{{ `~@${languageName(record.language_id)} ${record.code}?` }}</el-tag>
                      </div>
                    </template>
                  </el-popover>
                </el-space>
              </template>
              <div class="content">
                <el-descriptions title="详情" direction="vertical" border>
                  <template #extra>
                    <el-space wrap>
                      <el-button @click="onEdit(record)">编辑</el-button>
                      <el-button type="danger" @click="onDelete(record)">删除</el-button>
                    </el-space>
                  </template>
                  <el-descriptions-item label="ID">{{ record.id }}</el-descriptions-item>
                  <el-descriptions-item label="创建时间">{{ record.created_at }}</el-descriptions-item>
                  <el-descriptions-item label="更新时间">{{ record.updated_at }}</el-descriptions-item>
                  <el-descriptions-item label="描述">{{ record.desc }}</el-descriptions-item>
                  <el-descriptions-item label="内容">
                    <CodeEditor v-model="record.content" readonly></CodeEditor>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-collapse-item>
          </template>
        </el-collapse>
        <!-- <el-table :data="data">
          <el-table-column type="expand">
            <template #default="{row}">
              <CodeEditor v-model="row.content" readonly></CodeEditor>
            </template>
          </el-table-column>
          <el-table-column label="ID" prop="id" />
          <el-table-column label="语言">
            <template #default="{row}">{{ languageName(row.language_id) }}</template>
          </el-table-column>
          <el-table-column label="键" prop="code" />
          <el-table-column label="内容" prop="content" />
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
        </el-table> -->
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
      activeCollapses: [],
      // recordCollapesed: computed(() => (record: any) => (state.activeCollapses as any[]).indexOf(record.code) !== -1),
      dbState: computed(() => database!.state),
      languageName: computed(() => (languageId: number) => state.dbState.languages.find(item => item.id === languageId)?.name),
      tableRef: null,
      pagination: {pageNo: 1, pageSize: 20, totalCount: 0},
      tableConfig: {
        async fetchData(query: any) {
          const limit = query.pageSize
          const offset = (query.pageNo - 1) * query.pageSize
          let whereConditions = []
          let whereSegment = ''
          if (query.language_id) { whereConditions.push(`language_id = ${query.language_id}`) }
          if (query.code) { whereConditions.push(`code LIKE '%${query.code}%' --case-insensitive`) }
          if (whereConditions.length) {
            whereSegment = ` WHERE ${whereConditions.join(" AND ")}`
          }
          const items = await database?.db.select<Array<any>>(`select * from code_snippets${whereSegment} limit ${limit} offset ${offset};`)
          const counts = await database?.db.select<Array<{count: number}>>(`select COUNT(*) as count from code_snippets${whereSegment};`)
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
                instance.close()
              }
            })
          }
        })
      },
      async onDelete(record: any) {
        await ElMessageBox.confirm('确定删除吗?', '确认', {confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning',})
        await database?.db.execute(`DELETE FROM code_snippets where id = $1;`, [record.id]).catch(e => {
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
.item-info {
  margin-left: 30px;
}
</style>