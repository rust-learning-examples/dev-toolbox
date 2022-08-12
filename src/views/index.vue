<template>
  <el-container class="h-full">
    <el-aside class="overflow-auto bg-white" width="200px">
      <NavMenu></NavMenu>
    </el-aside>
    <el-main class="overflow-auto">
      <Breadcrumb></Breadcrumb>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script lang='tsx'>
import { reactive, toRefs, defineComponent } from 'vue'
import NavMenu from '@/components/NavMenu.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

export default defineComponent({
  components: {
    NavMenu,
    Breadcrumb,
  },
  setup (props, ctx) {
    const state = reactive({})
    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
</style>