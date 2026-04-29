<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f8f9fa] relative overflow-hidden font-['Inter',sans-serif]">
    <!-- Background Blur Glow -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none"></div>

    <div class="w-full max-w-md p-10 bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl relative z-10 animate-fade-in">
      
      <!-- Header -->
      <div class="flex items-center justify-center mb-10">
        <img :src="logoCT" alt="Customer Logo" class="h-24 w-auto" />
      </div>
      <div class="text-center mb-8">
        <p class="text-sm font-medium text-slate-500">Acceso a la plataforma centralizada</p>
      </div>

      <!-- Error message -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
        <i class="fas fa-shield-check text-red-500 shrink-0 mt-0.5" aria-hidden="true"></i>
        <p class="text-sm font-bold text-red-600 leading-tight">{{ error }}</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="space-y-4">
          
          <!-- Email -->
          <div class="relative group">
            <i class="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors z-10"></i>
            <input
              v-model="credentials.email"
              type="email"
              required
              @blur="validateEmail"
              @input="emailError = ''"
              placeholder="Correo"
              class="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-800"
              :class="{ 'border-red-400 focus:ring-red-500/20': emailError }"
            />
            <p v-if="emailError" class="absolute -bottom-5 left-2 text-red-500 text-xs">{{ emailError }}</p>
          </div>

          <!-- Password -->
          <div class="relative group mt-6">
            <i class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors z-10"></i>
            <input
              v-model="credentials.password"
              :type="showPassword ? 'text' : 'password'"
              required
              @input="passwordError = ''"
              placeholder="Contraseña"
              class="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-800"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <!-- Auth Actions -->
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center">
            <input
              id="remember"
              v-model="rememberMe"
              type="checkbox"
              class="w-4 h-4 text-primary-500 bg-slate-50 border-slate-300 rounded focus:ring-primary-400 focus:ring-2"
            />
            <label for="remember" class="ml-2 text-sm font-medium text-slate-600">
              Recordarme
            </label>
          </div>
          <button
            type="button"
            @click="showForgotPassword = true"
            class="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="w-full py-4 bg-primary-500 hover:bg-primary-400 text-white font-black rounded-2xl transition-all shadow-lg shadow-primary-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
        >
          <template v-if="isLoading">
            <i class="fas fa-spinner fa-spin"></i> Desbloqueando...
          </template>
          <template v-else>
            Desbloquear Sistema
          </template>
        </button>
      </form>
    </div>

    <!-- Background decor -->
    <div class="absolute bottom-4 text-center w-full text-slate-400 text-xs font-medium">
       © {{ currentYear }} Customer CRM. Todos los derechos reservados.
    </div>

    <!-- Modal Forgot Password -->
    <div v-if="showForgotPassword" class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div class="bg-white rounded-[2rem] shadow-2xl border border-slate-200 max-w-md w-full mx-4 p-8 animate-fade-in">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-slate-800">Restablecer Contraseña</h3>
          <button @click="showForgotPassword = false" class="text-slate-400 hover:text-slate-600 transition-colors">
            <i class="fas fa-times text-lg"></i>
          </button>
        </div>
        
        <form @submit.prevent="handleForgotPassword" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-2">
              Correo Electrónico
            </label>
            <input
              v-model="forgotPasswordEmail"
              type="email"
              required
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              placeholder="tu@email.com"
            />
          </div>
          
          <div class="flex space-x-3">
            <button
              type="button"
              @click="showForgotPassword = false"
              class="flex-1 py-3 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="forgotPasswordLoading"
              class="flex-1 py-3 px-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-400 disabled:opacity-50 transition-all shadow-md shadow-primary-500/20"
            >
              {{ forgotPasswordLoading ? 'Enviando...' : 'Enviar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import logoCT from '@/assets/logo.png'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const credentials = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)
const rememberMe = ref(false)
const emailError = ref('')
const passwordError = ref('')
const showForgotPassword = ref(false)
const forgotPasswordEmail = ref('')
const forgotPasswordLoading = ref(false)
const currentYear = new Date().getFullYear()

// Computed
const isFormValid = computed(() => {
  return credentials.value.email && 
         credentials.value.password && 
         !emailError.value && 
         !passwordError.value
})

const { isLoading, error } = authStore

// Methods
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(credentials.value.email) && credentials.value.email) {
    emailError.value = 'Correo inválido'
  } else {
    emailError.value = ''
  }
}

const handleLogin = async () => {
  if (!isFormValid.value) return

  const result = await authStore.login(credentials.value)
  
  if (result.success) {
    const redirectPath = authStore.user?.role === 'client' ? '/support' : '/';
    await router.push(redirectPath)
  }

}

const handleForgotPassword = async () => {
  if (!forgotPasswordEmail.value) return

  forgotPasswordLoading.value = true
  // Mock request
  setTimeout(() => {
    forgotPasswordLoading.value = false
    showForgotPassword.value = false
    alert('Se ha enviado un correo con las instrucciones.')
  }, 1500)
}

onMounted(async () => {
  const isAuthenticated = await authStore.checkAuth()
  if (isAuthenticated) {
    await router.push('/')
  }
})
</script>
