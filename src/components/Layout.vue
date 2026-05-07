<template>
  <div class="min-h-screen bg-slate-50 text-slate-800">
    <!-- Sidebar -->
    <div 
      class="fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out group/sidebar"
      :class="isSidebarCollapsed ? 'w-20' : 'w-64'"
    >
      <!-- Collapse Toggle Button -->
      <button 
        @click="isSidebarCollapsed = !isSidebarCollapsed"
        class="absolute -right-4 top-8 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-xl z-[100] transition-all hover:bg-primary-700 active:scale-95 border-2 border-white"
        :class="isSidebarCollapsed ? 'rotate-180' : ''"
      >
        <i class="fas fa-chevron-left text-xs"></i>
      </button>

      <!-- Logo -->
      <div class="flex items-center justify-center h-20 transition-all duration-300 overflow-hidden">
        <img 
          :src="logoCT" 
          alt="Customer Logo" 
          class="h-28 w-auto transition-all object-contain scale-110"
          :class="isSidebarCollapsed ? 'scale-75' : ''"
        />
      </div>
      
      <!-- Navigation -->
      <nav class="flex-1 px-3 py-6 space-y-2 flex flex-col justify-between h-[calc(100vh-160px)]">
        <div class="space-y-1">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.path"
            class="flex items-center rounded-xl text-sm font-medium transition-all group outline-none h-12"
            :class="[
              $route.path === item.path 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
              isSidebarCollapsed ? 'justify-center px-0' : 'px-4'
            ]"
            :title="isSidebarCollapsed ? item.name : ''"
          >
            <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <i v-if="item.icon === 'logo'" class="fas fa-th-large text-lg"></i>
              <component v-else :is="item.icon" class="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span 
              v-show="!isSidebarCollapsed" 
              class="ml-3 transition-opacity duration-300 whitespace-nowrap overflow-hidden font-bold"
            >
              {{ item.name }}
            </span>
          </router-link>
        </div>

        <!-- Motivational Quote -->
        <div v-if="!isSidebarCollapsed" class="px-6 py-8 mt-4 border-t border-slate-50">
          <div class="relative">
            <i class="fas fa-quote-left text-primary-200 text-xl absolute -top-4 -left-2 opacity-50"></i>
            <p class="text-[10px] font-bold text-slate-400 italic leading-relaxed text-center relative z-10">
              "El éxito es la suma de pequeños esfuerzos repetidos día tras día."
            </p>
            <p class="text-[8px] font-black text-primary-400 uppercase tracking-widest text-center mt-2">
              — Robert Collier
            </p>
          </div>
        </div>

        <!-- Logout / User Profile Section -->
        <div class="border-t border-slate-100 pt-4 mt-auto">
          <div 
            class="flex items-center group transition-all"
            :class="isSidebarCollapsed ? 'justify-center' : 'px-1'"
          >
            <div class="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-slate-100 border border-slate-200 group-hover:border-primary-300 transition-all flex-shrink-0">
              <img 
                v-if="user?.photo"
                :src="resolveImageUrl(user.photo)"
                alt="Foto" 
                class="w-full h-full object-cover transition-transform group-hover:scale-110"
                @error="onAvatarError"
              />
              <img 
                v-else-if="user?.avatar && getAvatarById(user.avatar)"
                :src="getAvatarById(user.avatar)?.path"
                class="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <span v-else class="text-[10px] font-black text-slate-500 uppercase">{{ getUserInitials() }}</span>
            </div>
            <div 
              v-show="!isSidebarCollapsed"
              class="ml-3 min-w-0 transition-opacity duration-300"
            >
              <p class="text-xs font-black text-slate-800 truncate">{{ user?.name || 'Usuario' }}</p>
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{{ getRoleDisplayName() }}</p>
            </div>
          </div>

          <div 
            class="mt-4 flex gap-2"
            :class="isSidebarCollapsed ? 'flex-col items-center' : 'flex-row'"
          >
            <router-link
              to="/profile"
              class="flex items-center justify-center bg-slate-50 hover:bg-primary-50 text-slate-500 hover:text-primary-600 rounded-xl transition-all border border-slate-100 hover:border-primary-200 group"
              :class="isSidebarCollapsed ? 'w-10 h-10' : 'flex-1 h-10'"
              title="Ajustes"
            >
              <i class="fas fa-cog text-sm group-hover:rotate-90 transition-all"></i>
              <span v-show="!isSidebarCollapsed" class="ml-2 text-[10px] font-black uppercase tracking-widest">Perfil</span>
            </router-link>
            
            <button
              @click="$emit('logout')"
              class="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-slate-100 hover:border-rose-200"
              title="Salir"
            >
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </nav>
    </div>
    
    <!-- Main Content -->
    <div 
      class="transition-all duration-300 ease-in-out"
      :class="isSidebarCollapsed ? 'ml-20' : 'ml-64'"
    >
      <!-- Header -->
      <header class="min-h-[64px] bg-white/80 backdrop-blur-md border-b border-slate-200 flex flex-wrap items-center px-4 sm:px-8 justify-between sticky top-0 z-30">
        <div class="flex items-center flex-1 min-w-0">
          <!-- Menu Button (hamburger icon for mobile) -->
          <button
            class="flex-shrink-0 mr-2 sm:mr-4 p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none z-30 lg:hidden"
            @click="$emit('toggleSidebar')"
            aria-label="Abrir menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-slate-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <!-- Título y descripción -->
          <div class="flex flex-col justify-center min-w-0">
            <h1 class="text-lg font-black text-slate-800 whitespace-nowrap truncate tracking-tight">{{ pageTitle }}</h1>
            <p v-show="!isSidebarCollapsed" class="text-slate-400 text-[10px] font-bold uppercase tracking-wider truncate">{{ pageDescription }}</p>
          </div>
        </div>
        <!-- Notifications -->
        <div class="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 mt-2 sm:mt-0">
          <OnlineUsersPopover />
          
          <!-- Chat Unread Badge -->
          <router-link to="/chat" class="relative p-2 text-slate-400 hover:text-primary-600 transition-colors">
            <ChatBubbleLeftRightIcon class="w-6 h-6" />
            <span v-if="chatUnread > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {{ chatUnread > 99 ? '99+' : chatUnread }}
            </span>
          </router-link>
        </div>
      </header>
      
      <!-- Page Content -->
      <main class="p-4 sm:p-8">
        <router-view />
      </main>
    </div>
    
  <!-- Chat Widget -->
  <ChatWidget />
  <NewMessageToast />
    
    <!-- Notifications Panel - REMOVED for Azure-style task system -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chatStore'
import ChatWidget from './ChatWidget.vue'
import OnlineUsersPopover from './OnlineUsersPopover.vue'
import NewMessageToast from './NewMessageToast.vue'
import { getAvatarById } from '@/utils/avatarConfig'
import { API_CONFIG } from '@/config/api'
import logoCT from '@/assets/logo.png'
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UsersIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon,
  Squares2X2Icon,
  TicketIcon,
  PresentationChartLineIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const chatStore = useChatStore()
const authStore = useAuthStore()

const avatarError = ref(false)
const isSidebarCollapsed = ref(false)

// Acceso al usuario actual
const user = computed(() => authStore.user)

const navigation = [
  { name: 'Dashboard', path: '/', icon: 'logo' },
  { name: 'Clientes', path: '/clients', icon: UserGroupIcon },
  { name: 'Tickets', path: '/tickets', icon: TicketIcon },
  { name: 'Actividades', path: '/activities', icon: ClipboardDocumentListIcon },
  { name: 'Tableros', path: '/boards', icon: Squares2X2Icon },
  { name: 'Daily Scrum', path: '/daily-scrum', icon: PresentationChartLineIcon },
  { name: 'Actividades por Equipo', path: '/team-activities', icon: UsersIcon },
  { name: 'Contabilidad', path: '/accounting', icon: CurrencyDollarIcon },
  { name: 'Gestión de Casos', path: '/cases', icon: FolderIcon },
  { name: 'Equipo', path: '/team', icon: DocumentTextIcon },
  { name: 'Chat Interno', path: '/chat', icon: ChatBubbleLeftRightIcon },
]

const pageTitle = computed(() => {
  const current = navigation.find(item => item.path === route.path)
  return current ? current.name : 'Dashboard'
})

const pageDescription = computed(() => {
  const descriptions: Record<string, string> = {
    '/': 'Panel de control principal',
    '/boards': 'Tableros Kanban y Scrum',
    '/clients': 'Gestión de clientes',
    '/activities': 'Gestión de actividades y tareas',
    '/team-activities': 'Actividades asignadas por miembro del equipo',
    '/accounting': 'Gestión financiera unificada',
    '/cases': 'Gestión estratégica y documentación wiki',
    '/team': 'Gestión del equipo de trabajo',
    '/chat': 'Chat interno del equipo',
    '/tickets': 'Gestión de incidencias y soporte técnico'
  }
  return descriptions[route.path] || ''
})

// Unread chat messages (from Pinia getter)
const chatUnread = computed(() => chatStore.getUnreadCount)

// Resolver URL de imágenes
const resolveImageUrl = (url: string | null) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  const origin = String(API_CONFIG.BASE_URL).replace(/\/?api\/?$/i, '')
  return `${origin.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

// Obtener iniciales del usuario
const getUserInitials = () => {
  const name = user.value?.name || ''
  if (!name) return 'U'
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2)
}

// Manejar error al cargar avatar
const onAvatarError = () => {
  avatarError.value = true
}

// Mostrar nombre del rol en español
const getRoleDisplayName = () => {
  const roles: Record<string, string> = {
    'admin': 'Administrador',
    'manager': 'Gerente',
    'user': 'Usuario',
    'employee': 'Empleado',
    'viewer': 'Visualizador'
  }
  return roles[user.value?.role || ''] || user.value?.role || 'Usuario'
}

onMounted(() => {
  chatStore.initializeChat()
  chatStore.loadChatRooms()
  
  // Resetear errores
  avatarError.value = false
})
</script>
