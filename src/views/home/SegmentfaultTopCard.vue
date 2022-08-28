<template>
  <el-card header="Segmentdefault" :body-style="{ padding: '0px' }">
    <el-tabs type="border-card" tab-position="top" v-model="activeTab" @tabChange="onTabChange">
      <template v-for="tab in tabs" :key="tab.value">
        <el-tab-pane :label="tab.label" :name="tab.value">
          <template v-for="post in posts" :key="post.article_id">
            <div><el-link :href="`https://segmentfault.com/a/${post.id}`" target="_blank" :title="post.article_info?.title">{{ post.title }}</el-link></div>
          </template>
        </el-tab-pane>
      </template>
    </el-tabs>
  </el-card>
</template>

<script lang='tsx'>
import { reactive, toRefs, defineComponent } from 'vue'
import * as http from '@tauri-apps/api/http'

export default defineComponent({
  setup (props, ctx) {
    const state: any = reactive({
      tabs: [{
        label: '前端',
        value: 'frontend'
      }, {
        label: '后端',
        value: 'backend'
      }, {
        label: '小程序',
        value: 'miniprogram'
      }, {
        label: 'iOS',
        value: 'ios'
      }, {
        label: 'Android',
        value: 'android'
      }, {
        label: '工具',
        value: 'toolkit'
      }, {
        label: 'AI',
        value: 'ai'
      }, {
        label: '云计算',
        value: 'cloud'
      }, {
        label: '安全',
        value: 'netsec'
      }],
      activeTab: 'frontend',
      posts: [],
      async fetchData() {
        const response: any = await http.fetch('https://segmentfault.com/gateway/articles', {
          method: 'GET',
          query: {
            initialData: 'true',
            query: 'channel',
            slug: state.activeTab,
            offset: '0',
            size: '10',
            mode: 'scrollLoad',
          },
          headers: {
            'Host': 'https://segmentfault.com',
            'Content-Type': 'application/json',
          },
          responseType: http.ResponseType.JSON,
        })
        if (response.ok && response.data?.rows?.length) {
          state.posts = response.data.rows
        }
      },
      onTabChange() {
        state.fetchData()
      }
    })

    state.fetchData()
    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
</style>