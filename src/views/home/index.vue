<template>
  <el-row :gutter="15">
    <el-col :md="24" :lg="12" :xl="8">
      <JuejinTopCard></JuejinTopCard>
    </el-col>
    <el-col :md="24" :lg="12" :xl="8">
      <SegmentdefaultTopCard></SegmentdefaultTopCard>
    </el-col>
  </el-row>
  <el-divider></el-divider>
  <el-row :gutter="15">
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <el-card header="正则匹配(Regex)">
        <div><el-link href="https://rubular.com" target="_blank" title="Ruby rubular">rubular for Ruby</el-link></div>
        <div><el-link href="https://regexr.com/" target="_blank" title="regexr">regexr for Javascript</el-link></div>
        <div><el-link href="https://regex101.com/" target="_blank" title="regex101">regex101</el-link></div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <el-card header="数据比较(Data Diff)">
        <div><el-link href="https://www.diffchecker.com" target="_blank" title="diffchecker">Text Diff(diffchecker)</el-link></div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <el-card header="数据加密解密">
        <div><el-link href="https://tool.oschina.net/encrypt" target="_blank" title="oschina">Crypto-JS实现</el-link></div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <el-card header="JSON工具">
        <div><el-link href="http://jsoneditoronline.org/" target="_blank" title="json editor">Json Editor</el-link></div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <el-card header="在线绘图">
        <div><el-link href="https://www.processon.com/" target="_blank" title="ProcessOn diagrams">ProcessOn</el-link></div>
        <div>
            <el-link href="https://app.diagrams.net/" target="_blank" title="diagrams">drawio</el-link>
            (包含<el-link href="https://github.com/jgraph/drawio-desktop/releases" target="_blank">客户端</el-link>)
        </div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <el-card header="文档/图片/视频等在线转换">
        <div><el-link href="https://www.aconvert.com/cn/" target="_blank" title="aconvert.com">Aconvert</el-link></div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <el-card header="其他">
        <div><el-link href="https://crontab.guru/" target="_blank" title="crontab">Crontab(分时日月周)</el-link></div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script lang='tsx'>
import { reactive, toRefs, defineComponent } from 'vue'
import JuejinTopCard from './JuejinTopCard.vue'
import SegmentdefaultTopCard from './SegmentfaultTopCard.vue'

export default defineComponent({
  components: {
    JuejinTopCard,
    SegmentdefaultTopCard,
  },
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