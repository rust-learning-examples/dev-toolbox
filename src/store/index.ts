// https://pinia.vuejs.org/introduction.html
import { createPinia } from 'pinia'
// https://github.com/prazdevs/pinia-plugin-persistedstate
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { useUser } from './modules/user'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export { useUser }
export default pinia