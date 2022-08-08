<template>
  <img v-if="blob" :src="blob" alt="">
</template>

<script lang='jsx'>
import { reactive, toRefs, defineComponent } from 'vue'
import { useDatabase } from '@/utils/hooks/useDatabase'

export default defineComponent({
  props: {
    record: [Object]
  },
  setup (props, ctx) {
    // const base64String = props.record.short_image
    const database = useDatabase()

    const state = reactive({
      blob: '',
      async createBlob() {
        const histories = await database.db.select(`select short_image from clipboard_histories where id = ${props.record.id} limit 1;`)
        if (histories.length) {
          const record = histories[0]
          state.blob = record.short_image
        }
      }
    })

    state.createBlob()

    return { ...toRefs(state) }
  },
})
</script>

<style lang="scss" scoped>
</style>