<template>
  <div id="app">
    <!-- Show login page if not authenticated -->
    <router-view v-if="!authStore.isAuthenticated || $route.path === '/login'" />
    
    <!-- Show main app if authenticated -->
  <div v-else class="min-h-screen bg-slate-50">
      <!-- Navigation Sidebar -->
      <div class="fixed inset-y-0 left-0 z-50 w-56 sm:w-64 bg-white border-r border-slate-200 shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0" 
           :class="{ '-translate-x-full': !sidebarOpen && !isDesktop }">
        
        <!-- Logo -->
        <div class="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <img 
              src="https://customertouchcr.com/wp-content/uploads/2025/09/logoCT.svg" 
              alt="Customer CRM Logo" 
              class="w-8 h-8"
            />
            <h1 class="text-xl leading-none flex flex-col justify-center">
              <span class="font-black text-slate-800 tracking-tight leading-tight">Customer</span>
              <span class="font-black text-slate-800 tracking-tight leading-tight">CRM</span>
            </h1>
          </div>
        </div>

        <!-- User Info -->
        <div class="px-6 py-5 border-b border-slate-100">
          <div class="flex items-center">
            <UserAvatar
              :name="authStore.user?.name || 'Usuario'"
              :avatar="authStore.user?.avatar"
              size="md"
              :clickable="true"
              @click="router.push('/profile')"
              class="shadow-sm border border-slate-200"
            />
            <div class="ml-3">
              <p class="text-slate-800 text-sm font-bold">{{ authStore.user?.name }}</p>
              <p class="text-slate-500 text-xs font-medium">{{ getRoleDisplayName(authStore.user?.role) }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="mt-6 flex-1 px-4 overflow-y-auto max-h-[calc(100vh-210px)]">
          <div class="space-y-1.5">
            <router-link
              v-for="module in availableModules"
              :key="module.id"
              :to="module.path"
              :class="[
                'w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 text-sm font-bold',
                $route.path === module.path
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20 shadow-[0_4px_10px_rgba(82,194,239,0.2)]' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-primary-600'
              ]"
            >
              <i :class="[module.icon, 'w-5 h-5 mr-3 flex items-center justify-center opacity-80', $route.path === module.path ? 'text-white' : 'text-slate-400']"></i>
              {{ module.name }}
            </router-link>
          </div>
        </nav>

        <!-- Logout Button -->
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-white flex justify-center">
          <button
            @click="handleLogout"
            class="w-full py-2 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 font-bold rounded-xl transition-all duration-200 border border-transparent hover:border-red-100"
          >
            <i class="fas fa-sign-out-alt mr-2"></i> Cerrar Sesión
          </button>
        </div>
      </div>

      <!-- Mobile menu button -->
      <div class="lg:hidden fixed top-3 left-4 z-50">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="p-2 rounded-xl bg-white shadow-md text-slate-600 border border-slate-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      <!-- Main Content -->
      <div class="lg:ml-64 flex flex-col h-screen">
        <!-- Header -->
        <header class="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 lg:ml-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div class="flex items-center justify-between px-6 py-4">
            <div class="pl-12 lg:pl-0">
              <h2 class="text-2xl font-black text-slate-800 tracking-tight">{{ getCurrentModuleName() }}</h2>
              <p class="text-slate-500 text-sm font-medium">{{ getCurrentModuleDescription() }}</p>
            </div>
            
            <!-- Header Actions -->
            <div class="flex items-center space-x-4">
              <!-- Chat icon in header -->
              <div class="relative">
                <router-link
                  to="/chat"
                  class="relative inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                  title="Ir al chat"
                >
                  <i class="fas fa-comments text-lg"></i>
                  <span
                    v-if="chatStore.getUnreadCount > 0"
                    class="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold border-2 border-white"
                  >
                    {{ chatStore.getUnreadCount > 99 ? '99+' : chatStore.getUnreadCount }}
                  </span>
                </router-link>
              </div>
              <!-- User Menu -->
              <div class="relative">
                <button
                  @click="showUserMenu = !showUserMenu"
                  class="flex items-center space-x-2 px-2 py-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                >
                  <UserAvatar
                    :name="authStore.user?.name || 'Usuario'"
                    :avatar="authStore.user?.avatar"
                    size="sm"
                    class="shadow-sm saturate-110"
                  />
                  <i class="fas fa-chevron-down text-slate-400 text-xs ml-1"></i>
                </button>

                <!-- User Dropdown -->
                <div
                  v-if="showUserMenu"
                  class="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-16px)] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden font-medium animate-fade-in"
                >
                  <!-- Header: email -->
                  <div class="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <span class="block text-sm text-slate-800 font-bold mb-0.5">{{ authStore.user?.name }}</span>
                    <span class="block text-xs text-slate-500 truncate" :title="authStore.user?.email || ''">
                      {{ authStore.user?.email }}
                    </span>
                  </div>

                  <!-- Menu items -->
                  <div class="py-2">
                    <button 
                      @click="navigateToProfile"
                      class="w-full text-left px-5 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-colors text-sm flex items-center font-bold"
                    >
                      <i class="fas fa-user w-5"></i>
                      Mi Perfil
                    </button>
                    <button
                      class="w-full text-left px-5 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-colors text-sm flex items-center font-bold"
                    >
                      <i class="fas fa-cog w-5"></i>
                      Configuración
                    </button>
                    <div class="border-t border-slate-100 my-1"></div>
                    <button 
                      @click="handleLogout"
                      class="w-full text-left px-5 py-2.5 text-red-500 hover:bg-red-50 transition-colors text-sm flex items-center font-bold"
                    >
                      <i class="fas fa-sign-out-alt w-5"></i>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="p-6 flex-1 min-h-0 overflow-y-auto">
          <router-view class="h-full" />
        </main>
      </div>

  <!-- Mobile backdrop -->
  <div v-if="sidebarOpen" class="lg:hidden fixed inset-0 z-40 bg-black/50" @click="sidebarOpen = false"></div>

  <!-- Global toast for nuevos mensajes -->
  <NewMessageToast />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useChatStore } from './stores/chatStore'
import UserAvatar from './components/ui/UserAvatar.vue'
import NewMessageToast from './components/NewMessageToast.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

// Reactive data
const sidebarOpen = ref(true)
const showUserMenu = ref(false)
const isDesktop = ref(true)
// Removed navbar mini-popup; use NewMessageToast instead

// Computed properties
const availableModules = computed(() => authStore.getAvailableModules)

const currentModule = computed(() => {
  const current = availableModules.value.find(m => m.path === route.path)
  return current?.id || 'dashboard'
})

// Methods
const getCurrentModuleName = () => {
  return availableModules.value.find(m => m.path === route.path)?.name || 'Dashboard'
}

const getCurrentModuleDescription = () => {
  const descriptions: Record<string, string> = {
    dashboard: 'Resumen general del CRM',
    clients: 'Gestión de clientes y contactos',
    activities: 'Actividades y tareas del equipo',
    reports: 'Estadísticas y análisis de rendimiento',
    accounting: 'Transacciones, pagos y gastos fijos',
    tickets: 'Gestión de incidencias y soporte técnico',
    cases: 'Documentos, incidencias y seguimientos',
    team: 'Gestión de usuarios y equipo',
    profile: 'Configuración de perfil de usuario'
  }
  return descriptions[currentModule.value] || 'Panel de control principal'
}

const getRoleDisplayName = (role?: string) => {
  const roleNames: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    employee: 'Empleado',
    support: 'Soporte Técnico',
    client: 'Cliente',
    viewer: 'Visualizador'
  }
  return roleNames[role || ''] || role
}

const navigateToProfile = () => {
  showUserMenu.value = false
  router.push('/profile')
}

const handleLogout = async () => {
  showUserMenu.value = false
  await authStore.logout()
}

// Handle responsive sidebar
const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024
  if (isDesktop.value) {
    sidebarOpen.value = true
  } else {
    sidebarOpen.value = false
  }
}

// Close user menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (showUserMenu.value && !(event.target as Element).closest('.relative')) {
    showUserMenu.value = false
  }
}

onMounted(async () => {
  // Check authentication on app load
  await authStore.checkAuth()
  
  handleResize()
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)

  // Initialize chat in background for unread badge
  if (authStore.isAuthenticated) {
    try { await chatStore.initializeChat() } catch {}
  }
})

// Removed navbar popup listener; NewMessageToast handles notifications globally
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Custom scrollbar - Light Mode */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(241, 245, 249, 0.5); /* slate-100 */
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.5); /* slate-400 */
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.8); /* slate-500 */
}
</style>
