<template>
  <el-card header="掘金推荐 前端">
    <template v-for="post in posts" :key="post.article_id">
      <div><el-link :href="`https://juejin.cn/post/${post.article_id}`" target="_blank" :title="post.article_info?.title">{{ post.article_info?.title }}</el-link></div>
    </template>
  </el-card>
</template>

<script lang='tsx'>
import { reactive, toRefs, defineComponent } from 'vue'
import * as http from '@tauri-apps/api/http'

export default defineComponent({
  setup (props, ctx) {
    const state: any = reactive({
      posts: [],
      async fetchData() {
        const response: any = await http.fetch('https://api.juejin.cn/recommend_api/v1/article/recommend_cate_tag_feed', {
          method: 'POST',
          query: {
            aid: '2608',
            uuid: '6983900855586850318'
          },
          headers: {
            'Host': 'https://juejin.cn',
            'Origin': 'https://juejin.cn',
            'Content-Type': 'application/json',
          },
          responseType: http.ResponseType.JSON,
          body: http.Body.json({
            id_type: 2,
            sort_type: 200,
            cate_id: '6809637767543259144',
            cursor: '0',
            limit: 10
          })
        })
        if (response.data?.err_no === 0 && response.data?.data?.length) {
          state.posts = response.data.data
        }
      }
    })

    state.fetchData()
    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
</style>