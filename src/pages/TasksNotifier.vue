<template>
  <Layout>
    <template #header>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white">Notificador Manual de Tareas</h1>
          <p class="text-gray-400 text-sm mt-1">
            Envía notificaciones personalizadas a WhatsApp sobre tareas específicas
          </p>
        </div>
        
        <!-- Enlaces de navegación -->
        <router-link 
          to="/task-reports" 
          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Ir a Configuración de Notificaciones
        </router-link>
      </div>
      
      <!-- Migas de pan -->
      <div class="flex items-center text-sm text-gray-500 mt-2">
        <router-link to="/" class="hover:text-white">Inicio</router-link>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-white">Notificador Manual de Tareas</span>
      </div>
    </template>
    
    <!-- Descripción -->
    <div class="bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-xl p-5 border border-blue-500/20 mb-6">
      <div class="flex items-start gap-4">
        <div class="p-3 rounded-lg bg-blue-700/30 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-medium text-white mb-2">Notificador Manual de Tareas</h2>
          <p class="text-gray-300 text-sm">
            Esta herramienta te permite enviar notificaciones sobre tareas específicas a través de WhatsApp.
            Usa los filtros para encontrar las tareas que deseas notificar y selecciónalas para enviarlas al grupo.
          </p>
          <ul class="mt-2 space-y-1 text-sm">
            <li class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-blue-500"></div>
              <span class="text-gray-300">Las notificaciones incluirán automáticamente menciones a los usuarios asignados</span>
            </li>
            <li class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-blue-500"></div>
              <span class="text-gray-300">Puedes filtrar por cliente, usuario asignado, estado y fecha de vencimiento</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="mb-8">
      <!-- Estado WhatsApp -->
      <div class="mb-6 p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <div 
            class="w-3 h-3 rounded-full"
            :class="whatsappStatus ? 'bg-green-500' : 'bg-red-500'"
          ></div>
          <span class="text-sm font-medium" :class="whatsappStatus ? 'text-green-400' : 'text-red-400'">
            {{ whatsappStatus ? 'WhatsApp conectado' : 'WhatsApp desconectado' }}
          </span>
        </div>
        
        <div v-if="!whatsappStatus">
          <router-link 
            to="/vincular-wpp" 
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Ir a página de vinculación
          </router-link>
        </div>
      </div>
      
      <!-- Componente TaskNotifier con tareas cargadas -->
      <div v-if="loading" class="flex items-center justify-center p-8">
        <AppLoader label="Cargando tareas…" :padded="false" />
      </div>
      
      <div v-else>
        <TaskNotifierEmbed :activities="activities" />
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import AppLoader from '@/components/ui/AppLoader.vue'
import { ref, onMounted } from 'vue'
import Layout from '../components/Layout.vue'
import TaskNotifierEmbed from '../components/notifications/TaskNotifierEmbed.vue'

interface Activity {
  _id: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  client?: {
    _id: string;
    name: string;
  };
  clientId?: string;
  assignedTo?: Array<{
    _id: string;
    name: string;
    email?: string;
  }> | string[];
  assignedToUser?: {
    _id: string;
    name: string;
    email?: string;
    role?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const activities = ref<Activity[]>([])
const loading = ref(true)
const whatsappStatus = ref(false)

// Cargar datos al montar
onMounted(async () => {
  await Promise.all([
    loadActivities(),
    checkWhatsAppStatus()
  ])
})

// Verificar estado de WhatsApp
async function checkWhatsAppStatus() {
  try {
    const response = await fetch('https://gems-crm-backend.onrender.com/api/wpp-status')
    const data = await response.json()
    whatsappStatus.value = data.ready === true
  } catch (error) {
    whatsappStatus.value = false
    console.error('Error verificando estado de WhatsApp:', error)
  }
}

// Cargar actividades
async function loadActivities() {
  loading.value = true
  try {
    const response = await fetch('https://gems-crm-backend.onrender.com/api/activities?sort=dueDate&order=asc&limit=100&page=1&status=all&relations=client,assignedTo')
    const data = await response.json()
    activities.value = data.data
  } catch (error) {
    console.error('Error cargando actividades:', error)
  } finally {
    loading.value = false
  }
}
</script>