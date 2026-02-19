import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles.css'
import { Quasar, Notify } from 'quasar'
import 'quasar/dist/quasar.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Quasar, { plugins: { Notify } })
app.mount('#app')
