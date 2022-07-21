<template>
   <el-menu :default-active="defaultActiveMenu">
    <template v-for="(menuItem, idx) in menus" :key="menuItem.name">
      <el-menu-item :index="String(menuItem.name)" @click="onMenuItemClick(menuItem)">
        {{ menuItem.meta.title || menuItem.name }}
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
          router.getRoute('codeSpippets'),
        ]
      }),
      onMenuItemClick(menuItem: any) {
        router.push({name: menuItem.name})
      }
    })
    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
</style>