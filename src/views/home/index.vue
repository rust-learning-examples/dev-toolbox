<template>
  <el-row :gutter="15">
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <el-card header="正则匹配(Regex)">
        <div><a href="https://rubular.com" target="_blank" title="Ruby rubular">rubular for Ruby</a></div>
        <div><a href="https://regexr.com/" target="_blank" title="regexr">regexr for Javascript</a></div>
        <div><a href="https://regex101.com/" target="_blank" title="regex101">regex101</a></div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <el-card header="数据比较(Data Diff)">
        <div><a href="https://www.diffchecker.com" target="_blank" title="diffchecker">Text Diff(diffchecker)</a></div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <el-card header="数据加密解密">
        <div><a href="https://tool.oschina.net/encrypt" target="_blank" title="oschina">Crypto-JS实现</a></div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <el-card header="JSON工具">
        <div><a href="http://jsoneditoronline.org/" target="_blank" title="json editor">Json Editor</a></div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <el-card header="在线绘图">
        <div><a href="https://www.processon.com/" target="_blank" title="ProcessOn diagrams">ProcessOn</a></div>
        <div>
            <a href="https://app.diagrams.net/" target="_blank" title="diagrams">drawio</a>
            (包含<a href="https://github.com/jgraph/drawio-desktop/releases" target="_blank">客户端</a>)
        </div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <el-card header="文档/图片/视频等在线转换">
        <div><a href="https://www.aconvert.com/cn/" target="_blank" title="aconvert.com">Aconvert</a></div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <el-card header="其他">
        <div><a href="https://crontab.guru/" target="_blank" title="crontab">Crontab(分时日月周)</a></div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script lang='tsx'>
import { reactive, toRefs, defineComponent } from 'vue'

export default defineComponent({
  setup (props, ctx) {
    const state = reactive({})
    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
.el-col {
  margin-bottom: 15px;

  .el-card {
    height: 100%;
  }
}
</style>