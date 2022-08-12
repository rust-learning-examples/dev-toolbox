<template>
  <div class="page">
    <fragment-table ref="tableRef" v-model:pagination="pagination" v-bind="tableConfig">
      <template #searchBar="{query, fetchLoading, fetchData}">
        <div class="flex justify-between items-end mx-4">
          <fragment-form>
            <el-form inline :model="query">
            <el-form-item label="类型" clearable>
                <el-select v-model="query.type" placeholder="类型" clearable>
                  <el-option :value="0" label="文本"></el-option>
                  <el-option :value="1" label="图片"></el-option>
                </el-select>
              </el-form-item>
              <template v-if="query.type === 0">
                <el-form-item label="内容" clearable>
                  <el-input v-model="query.keyword" placeholder="内容" clearable/>
                </el-form-item>
              </template>
              <el-form-item>
                <el-button type="primary" :loading="fetchLoading.value" @click="fetchData">搜索</el-button>
                <el-button @click="fetchData({pageNo: 1}, false)">重置</el-button>
              </el-form-item>
            </el-form>
          </fragment-form>
        </div>
      </template>
      <template #default="{data, pagination, fetchLoading, fetchData}">
        <CardList ref="cardListRef" :records="data" :pagination="pagination" :fetchLoading="fetchLoading" @copy="onCopy" @delete="onDelete" @fetchPage="(pageNo: any) => fetchData({pageNo})"></CardList>
        <!-- <el-table :data="data" default-expand-all>
          <el-table-column label="ID" prop="id" />
          <el-table-column label="类型" prop="type" />
          <el-table-column label="内容" prop="short_content" />
          <el-table-column label="real内容" prop="content" />
          <el-table-column label="图片" prop="short_image" />
          <el-table-column label="real图片" prop="image" />
          <el-table-column label="创建时间" prop="created_at" />
          <el-table-column label="更新时间" prop="updated_at" />
          <el-table-column label="操作">
            <template #default="{row}">
              <el-space wrap>
                <el-button type="danger" @click="onDelete(row)">删除</el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table> -->
      </template>
      <!-- <template #pagination="{pagination}">
        <el-pagination class="float-right mt-2" small
          :current-page="pagination.pageNo"
          @update:current-page="(pageNo) => pagination.onChange(pageNo, pagination.pageSize)"
          :page-size="pagination.pageSize"
          @update:page-size="(pageSize) => pagination.onChange(pagination.pageNo, pageSize)"
          :total="pagination.totalCount"
          :page-sizes="[10, 20, 30, 50, 100]"
          layout="total,sizes,prev,pager,next,jumper"
        ></el-pagination>
      </template> -->
    </fragment-table>
  </div>
</template>

<script lang='tsx'>
import { WebviewWindow, currentMonitor, LogicalPosition, LogicalSize } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/tauri'
import * as tauriEvent from '@tauri-apps/api/event'
import * as notification from '@tauri-apps/api/notification'
import { reactive, toRefs, defineComponent, defineAsyncComponent, createVNode, computed } from 'vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import { useDatabase } from '@/utils/hooks/useDatabase'
import CardList from './CardList.vue'
import {uniqBy} from 'lodash-es'

export default defineComponent({
  components: {
    CardList
  },
  setup (props, ctx) {
    const curWindow = WebviewWindow.getByLabel('ClipboardHistoriesWebviewWindow')
    const hideWindow = () => {
      curWindow && curWindow.hide()
    }
    // https://github.com/tauri-apps/tauri/blob/82b7f51/tooling/api/src/helpers/event.ts#L21
    curWindow?.listen('tauri://blur', async (...args) => {
      hideWindow()
      // const monitor = await currentMonitor()
      // await curWindow!.setPosition(new LogicalPosition(0, monitor!.size.height / monitor!.scaleFactor - 320));
      // await curWindow!.setSize(new LogicalSize(monitor!.size.width / monitor!.scaleFactor, 320));
    })
    document.addEventListener('keyup', async event => {
      //https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/key/Key_Values
      if (event.key === 'Escape') {
        hideWindow()
      }
    });
    const database = useDatabase()

    const state = reactive({
      databaseState: computed(() => database!.state),
      tableRef: null,
      cardListRef: null,
      tableRecords: [] as any[],
      pagination: {pageNo: 1, pageSize: 20, totalCount: 0},
      tableConfig: {
        async fetchData(query: any) {
          const limit = query.pageSize
          const offset = (query.pageNo - 1) * query.pageSize
          let whereConditions = []
          let whereSegment = ''
          if (query.type || query.type === 0) { whereConditions.push(`type = ${query.type}`) }
          if (query.type === 0 && query.keyword) { whereConditions.push(`short_content LIKE '%${query.keyword}%' --case-insensitive`) }
          if (whereConditions.length) {
            whereSegment = ` WHERE ${whereConditions.join(" AND ")}`
          }
          const items = await database?.db.select<Array<any>>(`select id, type, short_content, image_width, image_height, updated_at from clipboard_histories${whereSegment} order by updated_at desc limit ${limit} offset ${offset};`) as any[]
          const counts = await database?.db.select<Array<{count: number}>>(`select COUNT(*) as count from clipboard_histories${whereSegment};`)
          if (query.pageNo === 1) {
            state.tableRecords = items
          } else {
            state.tableRecords = uniqBy([...state.tableRecords, ...items], 'id')
          }

          return {
            data: state.tableRecords,
            pageNo: query.pageNo,
            pageSize: query.pageSize,
            totalCount: (counts as any)[0].count,
          }
        }
      },
      async onCopy(record: any) {
        const histories = await database!.db.select<Array<any>>(`select id, type, content, image, image_width, image_height from clipboard_histories where id = ${record.id} limit 1;`)
        if (histories.length) {
            const record = histories[0]
            if (record.type === 0) {
              await invoke('write_text_to_clipboard', {text: record.content})
            } else if (record.type === 1) {
              const arrayBuffer = await fetch(record.image).then(res => res.arrayBuffer())
              await invoke('write_image_to_clipboard', {
                image: {
                  bytes: [...new Uint8Array(arrayBuffer)],
                  width: record.image_width,
                  height: record.image_height,
                }
              })
            }
        }
        notification.sendNotification({title: '已拷贝'});
        (state.tableRef as any)?.refreshData()
        hideWindow()
      },
      async onDelete(record: any) {
        await ElMessageBox.confirm('确定删除吗?', '确认', {confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning',})
        await database?.db.execute(`DELETE FROM clipboard_histories where id = $1;`, [record.id]).catch(e => {
          ElNotification({title: '错误', message: `${e}`, type: 'error',})
        });
        (state.tableRef as any)?.refreshData()
      }
    })

    // 监听mainWindow传过来的新clipboard数据
    tauriEvent.listen('ClipboardHistoryUpdated', (event) => {
      const cardListRef = state.cardListRef as any;
      if (cardListRef?.scrollElRef) {
        cardListRef.scrollElRef.scrollLeft = 0
      }
      (state.tableRef as any)?.fetchData({pageNo: 1}, false)
    })

    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
.page {
  height: 320px;
  min-height: 320px;
  max-height: 320px;
  overflow: hidden;
  padding-top: 10px;

  .el-form-item {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}
</style>