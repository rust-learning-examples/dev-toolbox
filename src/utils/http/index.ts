import axios, {AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import supportMetaCancelKey from './supportMetaCancelKey'
import NProgress from 'nprogress'

// 创建 api 实例
const apiAxios = new Proxy(axios.create({
  // https://cn.vitejs.dev/guide/env-and-mode.html
  baseURL: import.meta.env.VITE_APP_API_BASE_URL || '/',
  timeout: 1000 * 60,
  meta: {
    // 请求重试
    retry: 0/*times*/, retryDelay: 100/*ms*/, curRetry: 0/*times*/,
    withProgressBar: false,
  }
  // paramsSerializer: (params) => qs.stringify(params, { indices: false }),
}), {
  get(target, ...args) {
    return Reflect.get(target, ...args) || Reflect.get(axios, ...args)
  }
})

// 设置 post 请求头
apiAxios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

supportMetaCancelKey(apiAxios)

// 请求拦截
apiAxios.interceptors.request.use((config: AxiosRequestConfig) => {
  if (config.meta?.withProgressBar) { NProgress.start() }
  return config
})

// 响应拦截
apiAxios.interceptors.response.use((response: AxiosResponse<any>) => {
  if (response.config.meta?.withProgressBar) { NProgress.done() }
  return response
}, (error: AxiosError) => {
  if (error.response?.config.meta?.withProgressBar) { NProgress.done() }
  // 请求失败
  const config: AxiosRequestConfig = error.config
  if (axios.isCancel(error)) { // 是否主动取消
    return console.error('主动取消')
  } else if (config.meta.curRetry < config.meta.retry) { // 是否需要重试
    config.meta.curRetry++
    return new Promise(resolve => {
      setTimeout(() => {
        console.warn(`${config.url},请求重试: ${config.meta.curRetry}次`)
        resolve(apiAxios(config))
      }, config.meta.retryDelay)
    })
  }

  return Promise.reject(error)
})

export default apiAxios