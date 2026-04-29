import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { injectSwalStyles } from './composables/useNotifications'

const app = createApp(App)
const pinia = createPinia()

// Inyectar tema premium de SweetAlert2
injectSwalStyles()

app.use(pinia)
app.use(router)
app.mount('#app')
