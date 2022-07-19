import { reactive, UnwrapNestedRefs } from 'vue'

export function useLoading(): UnwrapNestedRefs<any> {
    const loadingState = reactive<any>({
        value: false,
        data: null,
        async load(executor: any) {
            console.assert(!!executor, '必须传递执行器')
            try {
                loadingState.value = true
                loadingState.data = null
                if (typeof executor === 'object' && typeof executor.then === 'function') {
                    loadingState.data = await executor
                } else if (typeof executor === 'function') {
                    loadingState.data = await executor()
                } else {
                    loadingState.data = executor
                }
                return loadingState.data
            } finally {
                loadingState.value = false
            }
        }
    })
    return loadingState
}