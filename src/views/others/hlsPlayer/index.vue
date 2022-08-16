<template>
  <div class="page">
    <div>
      <el-input v-model="inputUrl"></el-input>
      <el-button @click="onPlay">播放url</el-button>
    </div>
    <hls-player ref="hlsPlayer" v-bind="hlsPlayerAttrs"></hls-player>
  </div>
</template>

<script lang='jsx'>
import { reactive, toRefs, defineComponent, onMounted } from 'vue'
import 'hls-player.js'
import { tauri } from "@tauri-apps/api"

export default defineComponent({
  components: {},
  setup (props, ctx) {
    const state = reactive({
      // https://hls-js.netlify.app/demo/
      inputUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      hlsPlayer: null,
      hlsPlayerAttrs: {
        options: {debug: false, autoplay: true, muted: true},
        events: {
          onLoadSegmentDataBuffer: async (segment, dataBuffer) => {
              // console.log(11, segment, dataBuffer);
            },
        }
      },
      onPlay() {
        state.hlsPlayer.src = state.inputUrl
      }
    })

    onMounted(async () => {
      state.hlsPlayer.shadowRoot.querySelector('video').style = 'max-width: 100%;'
      state.onPlay()
    })

    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
hls-player {
  max-width: 100%;
}
</style>