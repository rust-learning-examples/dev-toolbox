<template>
  <div class="page text-xs">
    <el-space>
      <el-input-number v-model="port" :min="3000" :max="65535" :disabled="running.value" placeholder="端口号" />
      <el-button type="primary" :disabled="running.value" @click="onStart">
        {{ running.value ? '运行中' : '启动' }}
      </el-button>
    </el-space>
    <div class="intro mt-4">
      <h3>使用说明</h3>
      <div class="mt-2">
        <el-tag type="info">{{ `http:://localhost:${port}/redirect/xxxx` }}</el-tag>redirect to<el-tag type="info">xxxx</el-tag>
      </div>
      <div class="mt-2">
        <el-tag type="info">{{ `http:://localhost:${port}/reverse_proxy/xxxx` }}</el-tag>reverse proxy to<el-tag type="info">xxxx</el-tag>
      </div>
    </div>
    <div class="mt-4">
      eg:
      <p class="mt-2"><el-tag>{{ `http:://localhost:${port}/redirect/https://baidu.com?a=1` }}</el-tag> redirect to <el-tag>https://baidu.com?a=1</el-tag></p>
      <p class="mt-2"><el-tag>{{ `http:://localhost:${port}/reverse_proxy/https://baidu.com?a=1` }}</el-tag> reverse proxy to <el-tag>https://baidu.com?a=1</el-tag></p>
    </div>
  </div>
</template>

<script lang='jsx'>
import { reactive, toRefs, defineComponent } from 'vue'
import { useLoading } from '@/utils/hooks/useLoading'
import { tauri } from "@tauri-apps/api"

export default defineComponent({
  setup (props, ctx) {
    const state = reactive({
      port: 3999,
      running: useLoading(),
      async onStart() {
        state.running.load(async () => {
          await tauri.invoke('start_http_server_handler', {
            port: state.port
          })
        })
      }
    })
    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
.page {
  --el-disabled-text-color: #666;
}
</style>