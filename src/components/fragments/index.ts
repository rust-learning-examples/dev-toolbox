import { App } from 'vue'
import FragmentForm from './FragmentForm.vue'
import FragmentTable from './FragmentTable.vue'

export default {
  isntall(app: App) {
    app.component('FragmentForm', FragmentForm)
    app.component('FragmentTable', FragmentTable)
  }
}

