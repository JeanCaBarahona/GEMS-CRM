<template>
  <div>
    <!-- Botón para abrir modal -->
    <button 
      @click="openModal"
      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
    >
      <i class="fas fa-bell"></i> Enviar notificación
    </button>
    
    <!-- Modal -->
    <div 
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showModal = false"
    >
      <div class="bg-gray-800 rounded-xl w-full max-w-3xl p-5 relative shadow-lg border border-blue-500/30">
        <h3 class="text-xl font-bold text-white mb-4">Notificar tareas por WhatsApp</h3>
        
        <button title="Cerrar" 
          @click="showModal = false" 
          class="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <i class="fas fa-times"></i>
        </button>
        
        <div class="space-y-4">
          <!-- Estado WhatsApp -->
          <div class="flex items-center mb-4 p-3 bg-gray-700/50 rounded-lg">
            <div 
              class="w-3 h-3 rounded-full mr-2"
              :class="whatsappStatus ? 'bg-green-500' : 'bg-red-500'"
            ></div>
            <span class="text-sm" :class="whatsappStatus ? 'text-green-400' : 'text-red-400'">
              {{ whatsappStatus ? 'WhatsApp conectado' : 'WhatsApp desconectado' }}
            </span>
          </div>
          
          <!-- Instrucciones -->
          <p class="text-sm text-gray-300">
            Selecciona las tareas que deseas notificar al grupo de WhatsApp. Esta acción enviará un reporte
            detallado de las tareas seleccionadas y mencionará a los usuarios asignados.
          </p>
          
          <!-- Filtros -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-700/30 p-3 rounded-lg">
            <!-- Búsqueda por texto -->
            <div class="col-span-1 md:col-span-2">
              <div class="relative">
                <input
                  v-model="filters.search"
                  type="text"
                  placeholder="Buscar por título o descripción..."
                  class="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div class="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Filtro por persona -->
            <div>
              <label class="block text-xs font-medium text-gray-400 mb-1">Persona asignada</label>
              <select 
                v-model="filters.assignedTo" 
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las personas</option>
                <option v-for="user in uniqueUsers" :key="user._id" :value="user._id">
                  {{ user.name }}
                </option>
              </select>
            </div>
            
            <!-- Filtro por cliente -->
            <div>
              <label class="block text-xs font-medium text-gray-400 mb-1">Cliente</label>
              <select 
                v-model="filters.clientId" 
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los clientes</option>
                <option v-for="client in uniqueClients" :key="client._id" :value="client._id">
                  {{ client.name }}
                </option>
              </select>
            </div>
            
            <!-- Filtro por estado -->
            <div>
              <label class="block text-xs font-medium text-gray-400 mb-1">Estado</label>
              <select 
                v-model="filters.status" 
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="in-progress">En progreso</option>
                <option value="completed">Completada</option>
                <option value="overdue">Vencida</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            
            <!-- Filtro por fechas -->
            <div>
              <label class="block text-xs font-medium text-gray-400 mb-1">Fecha límite</label>
              <div class="grid grid-cols-2 gap-2">
                <input
                  v-model="filters.startDate"
                  type="date"
                  class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  v-model="filters.endDate"
                  type="date"
                  class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <!-- Botones de acciones rápidas -->
            <div class="col-span-1 md:col-span-2 flex flex-wrap gap-2 mt-2">
              <button 
                @click="resetFilters"
                class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded transition-colors"
              >
                Limpiar filtros
              </button>
              <button 
                @click="selectAllFiltered"
                class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-xs text-white rounded transition-colors"
              >
                Seleccionar todas
              </button>
              <button 
                @click="deselectAll"
                class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-white rounded transition-colors"
              >
                Deseleccionar todas
              </button>
              <button 
                @click="filters.status = 'overdue'"
                class="px-3 py-1 bg-red-700 hover:bg-red-600 text-xs text-white rounded transition-colors"
              >
                Ver vencidas
              </button>
              <button 
                @click="filters.status = 'pending'"
                class="px-3 py-1 bg-yellow-700 hover:bg-yellow-600 text-xs text-white rounded transition-colors"
              >
                Ver pendientes
              </button>
            </div>
          </div>
          
          <!-- Lista de selección con detalles enriquecidos -->
          <div class="max-h-64 overflow-y-auto border border-gray-700 rounded-lg bg-gray-900/30">
            <div v-if="!filteredActivities || filteredActivities.length === 0" class="p-4 text-gray-400 text-sm text-center">
              No hay actividades que coincidan con los filtros
            </div>
            <div v-else class="divide-y divide-gray-700">
              <div 
                v-for="activity in filteredActivities" 
                :key="activity._id"
                class="p-3 hover:bg-gray-800/50"
              >
                <div class="flex items-start">
                  <div class="pt-1 flex-shrink-0">
                    <input 
                      type="checkbox" 
                      :id="'task-' + activity._id" 
                      v-model="selectedTasks" 
                      :value="activity._id"
                      class="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-600 bg-gray-700"
                    >
                  </div>
                  <label :for="'task-' + activity._id" class="ml-2 block text-sm text-gray-200 cursor-pointer w-full">
                    <div class="font-medium">{{ activity.title }}</div>
                    <div class="flex flex-wrap gap-2 mt-1 items-center text-xs">
                      <!-- Estado -->
                      <span class="px-2 py-0.5 rounded-full" :class="getStatusClass(activity.status)">
                        {{ getStatusLabel(activity.status) }}
                      </span>
                      
                      <!-- Cliente -->
                      <span v-if="activity.client" class="flex items-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {{ activity.client.name }}
                      </span>
                      
                      <!-- Persona asignada -->
                      <span v-if="getAssignedUserName(activity)" class="flex items-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {{ getAssignedUserName(activity) }}
                      </span>
                      
                      <!-- Fecha límite -->
                      <span v-if="activity.dueDate" class="flex items-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {{ formatDate(activity.dueDate) }}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Resumen y Acciones -->
          <div class="flex justify-between items-center mt-4">
            <div class="text-sm text-gray-300">
              {{ selectedTasks.length }} tarea(s) seleccionada(s) de {{ filteredActivities.length }}
            </div>
            <div class="space-x-3">
              <button 
                @click="showModal = false"
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
              >
                Cancelar
              </button>
              <button 
                @click="sendNotification"
                :disabled="sending || selectedTasks.length === 0 || !whatsappStatus"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="sending">Enviando...</span>
                <span v-else>Enviar notificación</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, computed } from 'vue'
import { taskReportService } from '../../services/taskReportService'
import { useToast } from '../../composables/useToast'

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

const props = defineProps({
  activities: {
    type: Array as () => Activity[],
    required: true
  }
})

const { toast, showError } = useToast()

// Estado
const showModal = ref(false)
const selectedTasks = ref<string[]>([])
const whatsappStatus = ref(false)
const sending = ref(false)

// Filtros
const filters = ref({
  search: '',
  assignedTo: '',
  clientId: '',
  status: '',
  startDate: '',
  endDate: ''
})

// Abrir modal
function openModal() {
  showModal.value = true
  checkWhatsAppStatus()
}

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

// Lista filtrada de actividades
const filteredActivities = computed(() => {
  if (!props.activities || !Array.isArray(props.activities)) {
    return []
  }
  
  return props.activities.filter(activity => {
    // Filtro de búsqueda por texto
    const searchMatch = !filters.value.search || 
      (activity.title?.toLowerCase().includes(filters.value.search.toLowerCase()) ||
       activity.description?.toLowerCase().includes(filters.value.search.toLowerCase()));
    
    // Filtro por usuario asignado
    let assigneeMatch = !filters.value.assignedTo;
    
    if (filters.value.assignedTo) {
      // Caso 1: Si assignedTo es un objeto único
      if (activity.assignedToUser && activity.assignedToUser._id) {
        assigneeMatch = activity.assignedToUser._id === filters.value.assignedTo;
      }
      
      // Caso 2: Si assignedTo es un array de objetos (múltiples personas)
      if (Array.isArray(activity.assignedTo)) {
        // Si los elementos son objetos
        if (activity.assignedTo.length > 0 && typeof activity.assignedTo[0] === 'object') {
          assigneeMatch = activity.assignedTo.some((user: any) => 
            user && user._id === filters.value.assignedTo
          );
        }
        // Si los elementos son IDs (strings)
        else if (activity.assignedTo.length > 0) {
          assigneeMatch = (activity.assignedTo as string[]).includes(filters.value.assignedTo);
        }
      }
    }
    
    // Filtro por cliente
    const clientMatch = !filters.value.clientId || 
      (activity.client && activity.client._id === filters.value.clientId) || 
      activity.clientId === filters.value.clientId;
    
    // Filtro por estado
    const statusMatch = !filters.value.status || 
      activity.status === filters.value.status;
    
    // Filtro por fecha de vencimiento
    let dateMatch = true;
    if (activity.dueDate) {
      const dueDate = new Date(activity.dueDate).setHours(0, 0, 0, 0);
      
      if (filters.value.startDate) {
        const startDate = new Date(filters.value.startDate).setHours(0, 0, 0, 0);
        dateMatch = dateMatch && dueDate >= startDate;
      }
      
      if (filters.value.endDate) {
        const endDate = new Date(filters.value.endDate).setHours(0, 0, 0, 0);
        dateMatch = dateMatch && dueDate <= endDate;
      }
    }
    
    return searchMatch && assigneeMatch && clientMatch && statusMatch && dateMatch;
  });
})

// Lista única de usuarios para el filtro
const uniqueUsers = computed(() => {
  if (!props.activities || !Array.isArray(props.activities)) {
    return [];
  }
  
  const users: Record<string, any> = {};
  
  props.activities.forEach(activity => {
    // Caso 1: Si assignedTo es un objeto único (asignado a una persona)
    if (activity.assignedToUser && activity.assignedToUser._id) {
      users[activity.assignedToUser._id] = activity.assignedToUser;
    }
    
    // Caso 2: Si assignedTo es un array de objetos (múltiples personas)
    if (Array.isArray(activity.assignedTo)) {
      activity.assignedTo.forEach(user => {
        // Si es un objeto de usuario
        if (typeof user === 'object' && user !== null && user._id) {
          users[user._id] = user;
        }
      });
    }
  });
  
  console.log('Unique users found:', Object.values(users));
  return Object.values(users);
})

// Lista única de clientes para el filtro
const uniqueClients = computed(() => {
  if (!props.activities || !Array.isArray(props.activities)) {
    return [];
  }
  
  const clients: Record<string, any> = {};
  props.activities.forEach(activity => {
    if (activity.client && activity.client._id) {
      clients[activity.client._id] = activity.client;
    }
  });
  
  return Object.values(clients);
})

// Obtener nombre de usuario asignado para mostrar
function getAssignedUserName(activity: Activity): string {
  // Si hay un objeto de usuario asignado directo
  if (activity.assignedToUser && activity.assignedToUser.name) {
    return activity.assignedToUser.name;
  }
  
  // Si hay un array de usuarios asignados
  if (Array.isArray(activity.assignedTo) && activity.assignedTo.length > 0) {
    // Si el primer elemento es un objeto
    if (typeof activity.assignedTo[0] === 'object' && activity.assignedTo[0] !== null) {
      // Asumimos que es un objeto con propiedad name
      const user = activity.assignedTo[0] as { name: string };
      return user.name + (activity.assignedTo.length > 1 ? ` (+${activity.assignedTo.length-1})` : '');
    }
  }
  
  return "Sin asignar";
}

// Resetear todos los filtros
function resetFilters() {
  filters.value = {
    search: '',
    assignedTo: '',
    clientId: '',
    status: '',
    startDate: '',
    endDate: ''
  }
}

// Seleccionar todas las tareas filtradas
function selectAllFiltered() {
  selectedTasks.value = filteredActivities.value.map(activity => activity._id)
}

// Deseleccionar todas las tareas
function deselectAll() {
  selectedTasks.value = []
}

// Enviar notificación
async function sendNotification() {
  if (selectedTasks.value.length === 0) {
    toast('Selecciona al menos una tarea', 'warning')
    return
  }
  
  if (!whatsappStatus.value) {
    showError('WhatsApp no conectado', 'Es necesario vincular WhatsApp para enviar notificaciones')
    return
  }
  
  sending.value = true
  try {
    await taskReportService.sendCustomReport(selectedTasks.value)
    toast('Notificación enviada correctamente', 'success')
    showModal.value = false
    selectedTasks.value = []
    resetFilters()
  } catch (error) {
    console.error('Error enviando notificación:', error)
    showError('Error al enviar notificación', error instanceof Error ? error.message : 'Error desconocido')
  } finally {
    sending.value = false
  }
}

// Formatear fecha para mostrar
function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit'
  });
}

// Utilidades para mostrar status
function getStatusClass(status: string) {
  const classes = {
    pending: 'bg-yellow-900/40 text-yellow-300',
    'in-progress': 'bg-blue-900/40 text-blue-300',
    completed: 'bg-green-900/40 text-green-300',
    overdue: 'bg-red-900/40 text-red-300',
    cancelled: 'bg-gray-900/40 text-gray-300'
  };
  return classes[status as keyof typeof classes] || 'bg-gray-900/40 text-gray-300';
}

function getStatusLabel(status: string) {
  const labels = {
    pending: 'Pendiente',
    'in-progress': 'En Progreso',
    completed: 'Completada',
    overdue: 'Vencida',
    cancelled: 'Cancelada'
  };
  return labels[status as keyof typeof labels] || status;
}
</script>

<style scoped>
/* Estilos para el scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Estilos para inputs y selects específicos de modo oscuro */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>