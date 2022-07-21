<script setup lang="tsx">
import { provide } from 'vue'
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
// import HelloWorld from './components/HelloWorld.vue'
import zhCn from 'element-plus/lib/locale/lang/zh-cn'
provide('elConfigProvider', { locale: zhCn, size: 'small', zIndex: 3000 })

</script>

<template>
  <el-config-provider :locale="zhCn" size="small" :zIndex="3000">
    <!-- <img alt="Vue logo" src="./assets/images/logo.png" /> -->
    <!-- <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" /> -->
    <router-view></router-view>
  </el-config-provider>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  /* color: #2c3e50; */
  /* margin-top: 60px; */
  height: 100%;
  overflow: hidden;
}
</style>
