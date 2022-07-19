import { AxiosStatic, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
export default function supportMetaCancelKey(axios: any): void {
    const EXECUTOR_MAP: any = {}
    const createCancelToken = (config: AxiosRequestConfig): void => {
        const requestKey = config.meta!.requestKey
        if (requestKey) {
            config.cancelToken = new axios.CancelToken((cancelExecutor: any) => {
                if (EXECUTOR_MAP[requestKey]) {
                    EXECUTOR_MAP[requestKey]('cancel request with requestKey') // 取消掉之前的请求
                }
                EXECUTOR_MAP[requestKey] = cancelExecutor
            })
        }
    }
    const clearCancelToken = (config: AxiosRequestConfig) => {
        const requestKey = config.meta!.requestKey
        if (requestKey) {
            EXECUTOR_MAP[requestKey] = null
        }
    }

    // 请求拦截
    (axios as AxiosStatic).interceptors.request.use((config: AxiosRequestConfig) => {
        if (config.meta!.requestKey && /get/i.test(config.method || 'get')) {
            createCancelToken(config)
        }
        return config
    }, error => {
        return Promise.reject(error)
    })

    // 响应拦截
    axios.interceptors.response.use((resp: AxiosResponse) => {
        // 请求成功
        if (resp.config?.meta?.requestKey) {
            clearCancelToken(resp.config)
        }
        return Promise.resolve(resp)
    }, (error: AxiosError) => {
        // 请求失败
        if (error.config?.meta?.requestKey) {
            clearCancelToken(error.config)
        }
        return Promise.reject(error)
    })
}