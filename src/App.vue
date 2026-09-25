<template>
  <div id="app">
    <!-- Show login page if not authenticated -->
    <router-view v-if="!authStore.isAuthenticated || $route.path === '/login'" />
    
    <!-- Show main app if authenticated -->
  <div v-else class="min-h-screen bg-slate-50">
      <!-- Navigation Sidebar -->
      <div 
        class="fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 shadow-sm transition-all duration-300 ease-in-out lg:translate-x-0" 
        :class="[
          !sidebarOpen && !isDesktop ? '-translate-x-full' : 'translate-x-0',
          isSidebarMini ? 'w-20' : 'w-64'
        ]"
      >
        <!-- Toggle Button (Minimalist) -->
        <button :title="isSidebarMini ? 'Expandir menú' : 'Contraer menú'" 
          @click="isSidebarMini = !isSidebarMini"
          class="hidden lg:flex absolute -right-3 top-7 w-6 h-6 bg-white text-slate-400 rounded-md items-center justify-center shadow-sm border border-slate-200 z-[60] transition-all hover:text-primary-600 hover:border-primary-300 active:scale-95"
          :class="isSidebarMini ? 'rotate-180' : ''"
        >
          <i class="fas fa-chevron-left text-[9px]"></i>
        </button>

        <!-- Logo -->
        <div 
          class="flex items-center justify-center h-20 overflow-hidden transition-all duration-300"
          :class="isSidebarMini ? 'opacity-0 h-0 border-none' : 'opacity-100 h-20'"
        >
          <img 
            v-if="!isSidebarMini"
            :src="logoCT" 
            alt="Logo" 
            class="h-28 w-auto transition-opacity duration-300 object-contain scale-110"
          />
        </div>

        <!-- User Info -->
        <div class="px-3 py-5 border-b border-slate-100 overflow-hidden transition-all" :class="isSidebarMini ? 'flex justify-center' : 'px-6'">
          <div class="flex items-center min-w-0">
            <UserAvatar
              :name="authStore.user?.name || 'Usuario'"
              :avatar="authStore.user?.avatar"
              :photo="authStore.user?.photo || undefined"
              size="md"
              :clickable="true"
              @click="router.push('/profile')"
              class="shadow-sm border border-slate-200 flex-shrink-0"
            />
            <div v-if="!isSidebarMini" class="ml-3 min-w-0 transition-opacity duration-300">
              <p class="text-slate-800 text-sm font-black truncate">{{ authStore.user?.name }}</p>
              <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">{{ getRoleDisplayName(authStore.user?.role) }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="mt-6 flex-1 px-3 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
          <div class="space-y-1.5">
            <router-link
              v-for="module in availableModules"
              :key="module.id"
              :to="module.path"
              :class="[
                'w-full flex items-center py-3 rounded-xl transition-all duration-200 text-sm font-bold group',
                $route.path === module.path
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-primary-600',
                isSidebarMini ? 'justify-center px-0' : 'px-4'
              ]"
              :title="isSidebarMini ? module.name : ''"
              data-tooltip-placement="right"
            >
              <i :class="[module.icon, 'w-5 h-5 flex items-center justify-center opacity-80 transition-transform group-hover:scale-110', !isSidebarMini ? 'mr-3' : '', $route.path === module.path ? 'text-white' : 'text-slate-400 group-hover:text-primary-500']"></i>
              <span v-if="!isSidebarMini" class="transition-opacity duration-300 whitespace-nowrap overflow-hidden">{{ module.name }}</span>
            </router-link>
          </div>
        </nav>

        <!-- Logout Button -->
        <div class="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-slate-100 bg-white overflow-hidden transition-all" :class="isSidebarMini ? 'flex justify-center' : 'px-6'">
          <button
            @click="handleLogout"
            :title="isSidebarMini ? 'Cerrar sesión' : ''"
            data-tooltip-placement="right"
            class="flex items-center text-slate-400 hover:text-rose-500 transition-all duration-200 group"
          >
            <div class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rose-50 transition-colors" :class="!isSidebarMini ? 'mr-2' : ''">
              <i class="fas fa-power-off text-sm"></i>
            </div>
            <span v-if="!isSidebarMini" class="text-[10px] font-black uppercase tracking-[0.15em] opacity-60 group-hover:opacity-100 whitespace-nowrap overflow-hidden">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <!-- Mobile menu button -->
      <div class="lg:hidden fixed top-3 left-4 z-50">
        <button title="Abrir o cerrar el menú"
          @click="sidebarOpen = !sidebarOpen"
          class="p-2 rounded-xl bg-white shadow-md text-slate-600 border border-slate-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      <!-- Main Content -->
      <div 
        class="flex flex-col h-screen transition-all duration-300 ease-in-out"
        :class="isSidebarMini ? 'lg:ml-20' : 'lg:ml-64'"
      >
        <!-- Main Content Area -->
        <main class="p-4 pb-8 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <router-view v-slot="{ Component, route: viewRoute }">
            <!-- Cada página entra con un fade + subida suave (motion.css) -->
            <div :key="viewRoute.path" class="motion-page h-full">
              <component :is="Component" />
            </div>
          </router-view>
        </main>
      </div>

  <!-- Mobile backdrop -->
  <div v-if="sidebarOpen" class="lg:hidden fixed inset-0 z-40 bg-black/50" @click="sidebarOpen = false"></div>

  <!-- Global toast for nuevos mensajes (Hidden by user request) -->
  <!-- <NewMessageToast /> -->

  <!-- Notification Bell flotante (inferior derecha) -->
  <NotificationBell />

  <!-- Modal global "Refinar Tarea" — se abre al clickear notificaciones, etc. -->
  <ActivityFormModal
    v-if="activityModalStore.isOpen"
    :activity="activityModalStore.editingActivity"
    :clients="activityModalStore.clients"
    :team-members="activityModalStore.teamMembers"
    @close="activityModalStore.close"
    @saved="activityModalStore.close"
  />
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
import NotificationBell from './components/NotificationBell.vue'
import ActivityFormModal from './components/forms/ActivityFormModal.vue'
import { useActivityModalStore } from './stores/activityModal'
import logoCT from '@/assets/logo.png'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()
const activityModalStore = useActivityModalStore()

// Reactive data
const sidebarOpen = ref(true)
const isSidebarMini = ref(false)
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
    reports: 'Análisis de rendimiento y métricas de productividad',
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

const handleLogout = async () => {
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

onMounted(async () => {
  // Check authentication on app load
  await authStore.checkAuth()
  
  handleResize()
  window.addEventListener('resize', handleResize)

  // Initialize chat in background for unread badge (Disabled by user request)
  /* if (authStore.isAuthenticated) {
    try { await chatStore.initializeChat() } catch {}
  } */
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

/* Los estilos de scrollbar globales se gestionan en style.css para mayor consistencia */
</style>
