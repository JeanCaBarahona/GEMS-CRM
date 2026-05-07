<template>
  <div class="min-h-screen flex bg-[#f8f9fa] font-['Inter',sans-serif] overflow-hidden">
    
    <!-- Left Side: Embedded Services Page -->
    <div class="hidden lg:flex w-[60%] relative overflow-hidden bg-slate-900 border-r border-slate-100">
      <!-- Iframe Container with Auto-Scroll -->
      <div class="absolute inset-0 w-full h-[300%] animate-slow-scroll opacity-80">
        <iframe 
          src="https://customertouchcr.com/#servicios" 
          class="w-full h-full border-none pointer-events-none saturate-125"
          scrolling="no"
        ></iframe>
      </div>
      
      <!-- Overlay for Branding & Integration -->
      <div class="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/30 to-transparent z-10"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(15,23,42,0.6)_100%)] z-11"></div>
      
      <!-- Bottom Branding Overlay -->
      <div class="absolute bottom-12 left-12 z-30 flex flex-col gap-5 animate-fade-in">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-0.5 bg-primary-500"></div>
            <span class="text-white/80 text-[10px] font-black uppercase tracking-[0.4em]">Explora nuestros servicios</span>
          </div>
          <h2 class="text-white text-4xl font-black max-w-lg leading-[1.1] tracking-tight">
            Soluciones digitales diseñadas para tu crecimiento.
          </h2>
        </div>
        
        <a 
          href="https://customertouchcr.com/#servicios" 
          target="_blank"
          class="group flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3.5 rounded-2xl w-fit transition-all duration-300 active:scale-95"
        >
          <span class="text-xs font-black uppercase tracking-widest">Ver Servicios Completos</span>
          <i class="fas fa-external-link-alt text-[10px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
        </a>
      </div>

      <!-- Legal Footer -->
      <div class="absolute bottom-8 right-8 z-30 text-white/30 text-[9px] font-medium uppercase tracking-[0.2em]">
        © {{ currentYear }} Customer Touch.
      </div>
    </div>

    <!-- Right Side: Login Form -->
    <div class="w-full lg:w-[40%] flex items-center justify-center p-6 lg:p-12 relative z-40 bg-white lg:bg-transparent">
      <div class="w-full max-w-[420px] animate-fade-in">
        
        <!-- Login Card -->
        <div class="bg-white p-10 lg:p-14 rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)] border border-slate-50 relative overflow-hidden">
          <!-- Decorative Glow -->
          <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/5 blur-2xl rounded-full"></div>
          
          <!-- Logo & Header -->
          <div class="flex flex-col items-center mb-14 relative z-10">
            <div class="flex items-center justify-center h-20 overflow-hidden mb-4">
              <img :src="logoCT" alt="CRM Logo" class="h-32 w-auto object-contain scale-110" />
            </div>
            <div class="flex items-center gap-3">
              <div class="h-px w-6 bg-slate-100"></div>
              <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Portal de Acceso</p>
              <div class="h-px w-6 bg-slate-100"></div>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="error" class="mb-10 p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4 animate-shake relative z-10">
            <i class="fas fa-circle-exclamation text-rose-500 shrink-0 mt-1 text-base"></i>
            <p class="text-xs font-bold text-rose-600 leading-normal">{{ error }}</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleLogin" class="space-y-7 relative z-10">
            <!-- Email -->
            <div class="space-y-2">
              <div class="relative group">
                <div class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-all duration-300">
                  <i class="far fa-envelope text-base"></i>
                </div>
                <input
                  v-model="credentials.email"
                  type="email"
                  required
                  placeholder="usuario@email.com"
                  class="w-full bg-slate-50/50 border border-slate-100 rounded-[1.5rem] py-5 pl-16 pr-6 text-sm font-semibold focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 focus:bg-white outline-none transition-all duration-300 text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <div class="relative group">
                <div class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-all duration-300">
                  <i class="far fa-lock text-base"></i>
                </div>
                <input
                  v-model="credentials.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="••••••••••"
                  class="w-full bg-slate-50/50 border border-slate-100 rounded-[1.5rem] py-5 pl-16 pr-16 text-sm font-semibold focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 focus:bg-white outline-none transition-all duration-300 text-slate-800 placeholder:text-slate-300 placeholder:font-medium"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-all duration-300 p-2"
                >
                  <i :class="showPassword ? 'far fa-eye-slash' : 'far fa-eye'" class="text-sm"></i>
                </button>
              </div>
            </div>

            <!-- Options -->
            <div class="flex items-center justify-between px-2">
              <label class="flex items-center cursor-pointer group select-none">
                <div class="relative">
                  <input
                    type="checkbox"
                    v-model="rememberMe"
                    class="peer appearance-none w-5 h-5 rounded-lg border-2 border-slate-100 checked:bg-primary-500 checked:border-primary-500 transition-all duration-300 cursor-pointer"
                  />
                  <i class="fas fa-check absolute inset-0 flex items-center justify-center text-[10px] text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></i>
                </div>
                <span class="ml-3 text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Recordarme</span>
              </label>
              <button
                type="button"
                @click="showForgotPassword = true"
                class="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-black rounded-2xl transition-all duration-300 shadow-[0_12px_24px_-8px_rgba(82,194,239,0.5)] hover:shadow-[0_16px_32px_-8px_rgba(82,194,239,0.6)] active:scale-[0.97] flex items-center justify-center gap-4 disabled:opacity-70 disabled:pointer-events-none mt-6 text-sm uppercase tracking-widest"
            >
              <template v-if="isLoading">
                <i class="fas fa-circle-notch fa-spin text-lg"></i>
              </template>
              <template v-else>
                Acceder al Sistema
              </template>
            </button>
          </form>
        </div> <!-- End Card -->
        
        <!-- Mobile Footer -->
        <div class="lg:hidden mt-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
          © {{ currentYear }} Customer CRM.
        </div>
      </div> <!-- End Form Container -->
    </div> <!-- End Right Side -->
    
    <!-- Modals and other logic remains... -->

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
import loginSideImg from '@/assets/login-side.png'

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
