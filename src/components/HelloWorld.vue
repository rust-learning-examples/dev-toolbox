<script setup lang="tsx">
import { useUser } from '@/store'
import { useDialog } from '@/utils/hooks/useDialog'

defineProps<{ msg: string }>()

const userStore = useUser()
const onTestSetAuthInfo = () => {
  userStore.setAuthInfo({token: 'test001'})
}

const dialog = useDialog()
const onTestDialog = () => {
  dialog.create({
    title: 'test001',
    children: {
      default: () => <div>hello</div>,
    }
  })
}

</script>

<template>
  <h1 class="text-gray-600 text-center">{{ msg }}</h1>
  <el-space>
    <el-button @click="onTestSetAuthInfo">testSetAuthInfo</el-button>
    <el-button @click="onTestDialog">testDialog</el-button>
  </el-space>
</template>

<style scoped>
</style>
