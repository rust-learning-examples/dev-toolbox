<template>
   <el-menu :default-active="defaultActiveMenu">
    <template v-for="(menu, idx) in menus" :key="menu.name">
      <el-menu-item :index="String(menu.name)">
        {{ menu.meta.title || menu.name }}
      </el-menu-item>
    </template>
   </el-menu>
</template>

<script lang='tsx'>
import { reactive, toRefs, defineComponent, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
  setup (props, ctx) {
    const router = useRouter()
    const route = useRoute()

    const state = reactive({
      defaultActiveMenu: computed(() => String(route.name)),
      menus: computed(() => {
        return [
          router.getRoute('home'),
        ]
      })
    })
    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
</style>