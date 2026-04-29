<template>
  <div class="min-h-screen bg-slate-50 text-slate-800">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200">
      <!-- Logo -->
        <div class="flex items-center px-6 py-8">
          <img 
            :src="logoCT" 
            alt="Customer Logo" 
            class="h-12 w-auto"
          />
        </div>
      
      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2 flex flex-col justify-between h-full">
        <div>
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.path"
              class="flex items-center px-4 py-3 mb-1 rounded-lg text-sm font-medium transition-colors outline-none"
              :class="[
                $route.path === item.path 
                  ? 'bg-primary text-white shadow-lg shadow-primary-500/20' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5 mr-3" :class="$route.path === item.path ? 'text-white' : 'text-slate-400'" />
              <span>{{ item.name }}</span>
            </router-link>
          </div>
        <!-- Minimal logout icon at bottom with tooltip -->
        <div class="flex justify-center mt-8 mb-2">
          <button
            @click="$emit('logout')"
            class="p-2 rounded-lg hover:bg-dark-800/60 transition-colors group"
            aria-label="Cerrar sesión"
            style="position:relative;"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7 text-gray-300 hover:text-red-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            <span class="absolute left-1/2 top-full mt-2 -translate-x-1/2 px-2 py-1 bg-black/80 text-xs text-white rounded opacity-0 pointer-events-none group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200" style="white-space:nowrap;">Cerrar sesión</span>
          </button>
        </div>
      </nav>
      
      <!-- User Profile -->
      <div class="px-4 py-6 border-t border-slate-100 mt-auto">
        <div class="flex flex-col gap-4">
          <div class="flex items-center group">
            <!-- Profile Avatar -->
            <div class="w-10 h-10 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-slate-100 border border-slate-200 group-hover:border-primary-300 transition-colors">
              <!-- Personalized Photo -->
              <img 
                v-if="user?.photo"
                :src="resolveImageUrl(user.photo)"
                alt="Foto de perfil" 
                class="w-full h-full object-cover transition-transform group-hover:scale-110"
                @error="onAvatarError"
              />
              <!-- Predefined Avatar -->
              <img 
                v-else-if="user?.avatar && getAvatarById(user.avatar)"
                :src="getAvatarById(user.avatar)?.path"
                :alt="getAvatarById(user.avatar)?.name" 
                class="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <!-- Fallback Initials -->
              <span v-else class="text-xs font-black text-slate-500 uppercase">{{ getUserInitials() }}</span>
            </div>
            <div class="ml-3 min-w-0">
              <p class="text-sm font-black text-slate-800 truncate">{{ user?.name || 'Usuario' }}</p>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{{ getRoleDisplayName() }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Profile Config -->
            <router-link
              to="/profile"
              class="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-primary-50 text-slate-500 hover:text-primary-600 rounded-xl transition-all border border-slate-100 hover:border-primary-200 group"
              title="Configurar Perfil"
            >
              <i class="fas fa-cog text-sm group-hover:rotate-90 transition-transform duration-500"></i>
              <span class="text-[11px] font-black uppercase tracking-widest">Ajustes</span>
            </router-link>
            
            <!-- Logout -->
            <button
              @click="$emit('logout')"
              class="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-slate-100 hover:border-rose-200"
              title="Cerrar sesión"
            >
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="ml-64">
      <!-- Header -->
      <header class="min-h-[64px] bg-white border-b border-slate-200 flex flex-wrap items-center px-4 sm:px-8 justify-between relative z-30">
        <div class="flex items-center flex-1 min-w-0">
          <!-- Menu Button (hamburger icon) -->
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
            <h1 class="text-xl font-bold text-slate-800 whitespace-nowrap truncate">{{ pageTitle }}</h1>
            <p class="text-slate-500 text-xs truncate">{{ pageDescription }}</p>
          </div>
        </div>
        <!-- Notifications -->
        <div class="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 mt-2 sm:mt-0">
          <OnlineUsersPopover />
          
          <!-- Chat Unread Badge -->
          <router-link to="/chat" class="relative p-2 text-gray-400 hover:text-white transition-colors">
            <ChatBubbleLeftRightIcon class="w-6 h-6" />
            <span v-if="chatUnread > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-pink-600 text-white text-xs rounded-full flex items-center justify-center">
              {{ chatUnread > 99 ? '99+' : chatUnread }}
            </span>
          </router-link>
          
          <!-- Notifications removed - Sistema de tareas tipo Azure -->
        </div>
      </header>
      
      <!-- Page Content -->
      <main class="p-8">
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
