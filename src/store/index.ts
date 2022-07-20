// https://pinia.vuejs.org/introduction.html
import { createPinia } from 'pinia'
// https://github.com/prazdevs/pinia-plugin-persistedstate
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { useApp } from './modules/app'
import { useUser } from './modules/user'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export { useApp, useUser, }
export default pinia