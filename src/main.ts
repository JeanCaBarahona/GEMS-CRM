import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import './styles/motion.css'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import { injectSwalStyles } from './composables/useNotifications'
import { installHttpAuth } from './utils/httpAuth'
import { installTooltips } from './utils/tooltips'

// Debe instalarse antes de montar: el backend exige Authorization en todo /api/*
installHttpAuth()

const app = createApp(App)
const pinia = createPinia()

// Inyectar tema premium de SweetAlert2
injectSwalStyles()

app.use(pinia)
app.use(router)
// Listas que se animan solas al agregar, quitar o reordenar (v-auto-animate)
app.use(autoAnimatePlugin)
app.mount('#app')

// Todos los `title` de la app se muestran como tooltips con estilo
installTooltips()
