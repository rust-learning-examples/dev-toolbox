<template>
  <slot name="searchBar" v-bind="{...slotData}"></slot>
  <slot v-bind="{...slotData}"></slot>
  <slot name="pagination" v-bind="{...slotData}"></slot>
</template>

<script lang='tsx'>
import { reactive, toRefs, defineComponent, computed } from 'vue'
import { useLoading } from '@/utils/hooks/useLoading'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
  inheritAttrs: false,
  props: {
    enableAutoFetchFirst: {
      type: [Boolean, Function],
      default: true,
    },
    enableUrlQuery: [Boolean],
    fetchData: [Function],
    // query: [Object],
    // data: [Object],
    // pagination: [Object],
    columns: [Array],
    enablePagination: {
      type: [Boolean, Object],
      default: () => ({
        pageNo: 'pageNo',
        pageSize: 'pageSize',
        totalCount: 'totalCount'
      })
    },
  },
  emits: ['update:query', 'update:data', 'update:pagination'],
  expose: ['refreshData', 'fetchData'],
  setup (props, ctx) {
    const router = useRouter()
    const route = useRoute()

    const state: any = reactive({
      fetchLoading: useLoading(),
      tableRef: null,
      query: ctx.attrs.query || {},
      currentQuery: computed({
        get: () => ctx.attrs.query || state.query,
        set: (nv) => {
          state.query = nv
          ctx.emit('update:query', nv)
        }
      }),
      data: ctx.attrs.data || null,
      currentData: computed({
        get: () => ctx.attrs.data || state.data,
        set: (nv) => {
          state.data = nv
          ctx.emit('update:data', state.data)
        }
      }),
      pagination: ctx.attrs.pagination || {
        [(props.enablePagination as any)?.pageNo || 'pageNo']: 1,
        [(props.enablePagination as any)?.pageSize || 'pageSize']: 10,
        [(props.enablePagination as any)?.totalCount || 'totalCount']: 0,
      },
      currentPagination: computed({
        get: () => ctx.attrs.pagination || state.pagination,
        set: (nv) => {
          state.pagination = nv
          ctx.emit('update:pagination', state.pagination)
        }
      }),
      async getRouteQuery() {
        return await new Promise(resolve => {
          try {
            const urlQuery = props.enableUrlQuery ? (route.query._q && JSON.parse((route.query as any)._q) || {}) : state.currentQuery
            resolve(urlQuery)
          } catch (e) {
            console.error(e)
            resolve({})
          }
        })
      },
      async refreshData(extraQuery = {}) {
        const query = await state.getRouteQuery()
        await state.fetchData({...(ctx.attrs.query as object), ...query, ...extraQuery})
      },
      async fetchData(query: {[index: string]: any} = {}, mergePreQuery = true) {
        const queryData = {
          ...(props.enablePagination ? {
            [(props.enablePagination as any)?.pageNo || 'pageNo']: query[(props.enablePagination as any)?.pageNo || 'pageNo'] || state.pagination[(props.enablePagination as any)?.pageNo || 'pageNo'],
            [(props.enablePagination as any)?.pageSize || 'pageSize']: query[(props.enablePagination as any)?.pageSize || 'pageSize'] || state.pagination[(props.enablePagination as any)?.pageSize || 'pageSize']
          } : {}),
          ...(mergePreQuery ? state.currentQuery : {}),
          ...query,
        }
        // pagination
        const {[(props.enablePagination as any)?.pageNo || 'pageNo']: pageNo, [(props.enablePagination as any)?.pageSize || 'pageSize']: pageSize} = queryData
        state.currentPagination = Object.assign({}, state.curPagination, {
          [(props.enablePagination as any)?.pageNo || 'pageNo']: pageNo || state.pagination[(props.enablePagination as any)?.pageNo || 'pageNo'],
          [(props.enablePagination as any)?.pageSize || 'pageSize']: pageSize || state.pagination[(props.enablePagination as any)?.pageSize || 'pageSize']
        })
        // query condition
        // for (const key in queryData) {
        //  if ([undefined, null, ''].indexOf(queryData[key]) !== -1) {
        //    delete queryData[key]
        //  }
        // }
        state.currentQuery = queryData
        // enableUrlQuery
        if (props.enableUrlQuery) {
          await router.replace({query: {_q: JSON.stringify(queryData)}})
        }
        if (typeof props.fetchData === 'function') {
          await state.fetchLoading.load(async () => {
            await (props.fetchData as any)(queryData).then((respData: any) => {
              state.currentData = respData.data
              if (props.enablePagination) {
                state.currentPagination = Object.assign({}, state.currentPagination, {
                  [(props.enablePagination as any)?.pageNo || 'pageNo']: respData[(props.enablePagination as any)?.pageNo || 'pageNo'] || state.pagination[(props.enablePagination as any)?.pageNo || 'pageNo'],
                  [(props.enablePagination as any)?.pageSize || 'pageSize']: respData[(props.enablePagination as any)?.pageSize || 'pageSize'] || state.pagination[(props.enablePagination as any)?.pageSize || 'pageSize'],
                  [(props.enablePagination as any)?.totalCount || 'totalCount']: respData[(props.enablePagination as any)?.totalCount || 'totalCount']
                })
              }
            })
          })
        }
      }
    })
    return {
      ...toRefs(state),
      slotData: computed(() => {
        return {
          tableRef: state.tableRef,
          autoFetchFirst: state.autoFetchFirst,
          query: state.currentQuery,
          data: state.currentData,
          pagination: state.currentPagination,
          columns: state.columns,
        }
      })
    }
  },
})
</script>

<style lang="scss" scoped>
</style>