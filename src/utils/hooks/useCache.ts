import { reactive, computed } from 'vue'

class Cache {
  storage: any;
  constructor() {
    this.storage = reactive({})
  }
  async setValue(cacheKey: string, dataLoader: any, options: any) {
    this.storage[cacheKey] = {
      expiresAtSecs: Math.floor((new Date).getTime() / 1000) + options.expiresInSecs,
      loaded: false,
      value: options.defaultValue,
    }
    const value = await dataLoader()
    Object.assign(this.storage[cacheKey], {
      loaded: true,
      value: value,
    })
  }
  getValue(cacheKey: string, dataLoader: any, options: any) {
    let now = Math.floor((new Date).getTime() / 1000);
    if (!this.storage.hasOwnProperty(cacheKey) || options.forceReload || this.storage[cacheKey].expiresAtSecs < now) {
      this.setValue(cacheKey, dataLoader, options)
    }
    return computed(() => ({
      value: this.storage[cacheKey].value,
      reset: () => {
        this.setValue(cacheKey, dataLoader, options)
      }
    }))
  }
}

const cache = new Cache()

export function useCache(cacheKey: string, dataLoader: () => any, options?: any) {
  options = { forceReload: false, defaultValue: null, expiresInSecs: 3600, ...options }
  console.assert(typeof dataLoader === 'function', 'dataLoader must be a function')
  return cache.getValue(cacheKey, dataLoader, options)
}

export const CACHE_ENUMS = Object.freeze({
  DB_LANGUAGES: 'DB_LANGUAGES',
})
export const useDbLanguages = () => useCache(CACHE_ENUMS.DB_LANGUAGES, async () => {

})