<template>
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
import { reactive, toRefs, defineComponent } from 'vue'
import CodeSnippets from './CodeSnippets/index.vue'
import Languages from './Languages/index.vue'

export default defineComponent({
  components: {
    CodeSnippets,
    Languages,
  },
  setup (props, ctx) {
    const state = reactive({
      activeTab: 'CodeSnippets'
    })
    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
// .el-tabs {
//   ::v-deep(.el-tabs__content) {
//     flex: 1;
//   }
// }
</style>