<template>
  <div ref="scrollElRef" class="card-list" v-dragScroll="{horizontal: true}">
    <template v-for="record in records" :key="record.id">
      <el-card shadow="hover" :class="{active: activeRecord === record, text: record.type === 0, image: record.type === 1}" @click="activeRecord = record" @dblclick="$emit('copy', record)" :body-style="{ padding: '0px', width: '250px', height: '190px', overflow: 'hidden' }">
        <template #header>
          <div class="card-header">
            <span class="title">{{ record.type === 0 ? `文本 (${record.content_length})` : `图片 (${record.image_width}x${record.image_height})`}}</span>
            <el-button type="danger" link @click="$emit('delete', record)">删除</el-button>
          </div>
        </template>
        <template #default>
          <div class="card-body" :style="{background: bgColor(record)}">
            <div class="text-content" v-if="record.type === 0">{{ record.short_content }}</div>
            <ImageViewer v-else :record="record"></ImageViewer>
            <div class="time">{{ record.updated_at }}</div>
          </div>
        </template>
      </el-card>
    </template>
  </div>
</template>

<script lang='jsx'>
import { reactive, toRefs, defineComponent, onMounted, onBeforeUnmount, computed } from 'vue'
import dragScroll from '@/utils/directives/dragScroll'
import ImageViewer from './components/ImageViewer'
import { regex as constRegex } from '@/utils/const'

export default defineComponent({
  components: {
    ImageViewer,
  },
  directives: {
    dragScroll
  },
  props: {
    records: [Array],
    pagination: [Object],
    fetchLoading: [Object]
  },
  // exports: ['scrollElRef'],
  emits: ['copy', 'delete', 'fetchPage'],
  setup (props, ctx) {
    const state = reactive({
      activeRecord: null,
      scrollElRef: null,
      bgColor: computed(() => record => {
        return (constRegex.color.test(record.short_content) ? record.short_content : 'inherit').replace(/^0x/i, '#')
      }),
      onScrollElWheel: (event) => {
        if (!event.deltaX) {
          event.preventDefault()
          state.scrollElRef.scrollBy({
            left: event.deltaY * 5,
          })
        }
      },
      onScroll: event => {
        const el = event.target
        // console.log(event, el.scrollLeft, el.clientWidth, el.scrollWidth)
        if (!props.fetchLoading.value && props.pagination && el.scrollLeft + el.clientWidth === el.scrollWidth) {
          props.fetchLoading.value = true
          ctx.emit('fetchPage', props.pagination.pageNo + 1)
        }
      }
    })

    onMounted(() => {
      state.scrollElRef.addEventListener('wheel', state.onScrollElWheel)
      state.scrollElRef.addEventListener('scroll', state.onScroll)
    })
    onBeforeUnmount(() => {
      state.scrollElRef.removeEventListener('wheel', state.onScrollElWheel)
      state.scrollElRef.removeEventListener('scroll', state.onScroll)
    })

    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
$boxWidth: 250px;
.card-list {
  display: flex;
  flex-wrap: nowrap;
  overflow-y: hidden;
  overflow-x: auto;
  margin: 0 10px;
  padding-bottom: 10px;
  user-select: none;

  .el-card {
    flex-shrink: 0;
    width: $boxWidth;
    height: $boxWidth;
    margin: 0 5px;

    &.active {
      border-color: #1890ff;
    }

    &.text {
      .card-body {
        padding: 10px 10px 20px;
      }
    }
    &.image {
      .card-body {
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 13px;
        color: #999;
      }
    }

    .card-body {
      position: relative;
      width: 250px;
      height: 190px;
      overflow: hidden;

      .text-content {
        height: 100%;
        box-sizing: border-box;
        font-size: 12px;
        text-overflow: ellipsis;
        white-space: pre-wrap;
        overflow: hidden;
      }

      .time {
        position: absolute;
        right: 15px; bottom: 5px;
        font-size: 12px;
        color: #999;
      }
    }
  }

}
</style>