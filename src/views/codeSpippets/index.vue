<template>
  <el-descriptions v-if="dbState.lastCodeSnippetUserInput" class="mb-4" border>
    <el-descriptions-item label-class-name="custom-label" label="最后输入的键:">
      <el-tag>~{{dbState.lastCodeSnippetUserInput}}?</el-tag>
    </el-descriptions-item>
  </el-descriptions>
  <el-tabs class="page flex flex-col" type="border-card" v-model="activeTab">
    <el-tab-pane name="CodeSnippets" label="代码段">
      <CodeSnippets></CodeSnippets>
    </el-tab-pane>
    <el-tab-pane name="Languages" label="语言">
      <Languages></Languages>
    </el-tab-pane>
  </el-tabs>
</template>

<script lang='tsx'>
import { reactive, toRefs, defineComponent, computed } from 'vue'
import CodeSnippets from './CodeSnippets/index.vue'
import Languages from './Languages/index.vue'
import { useDatabase } from '@/utils/hooks/useDatabase'

export default defineComponent({
  components: {
    CodeSnippets,
    Languages,
  },
  setup (props, ctx) {
    const database = useDatabase()

    const state = reactive({
      activeTab: 'CodeSnippets',
      dbState: computed(() => database!.state),
    })
    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
.el-descriptions {
  overflow: hidden;
  ::v-deep(.custom-label) {
    min-width: 100px;
    width: 100px;
  }
}
</style>