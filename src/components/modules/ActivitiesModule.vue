<template>
  <div class="space-y-6">
    <!-- Header with stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Total Actividades</p>
            <p class="text-2xl font-bold text-white">{{ activities.length }}</p>
          </div>
          <i class="fas fa-tasks text-purple-400 text-2xl"></i>
        </div>
      </div>
      
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Completadas</p>
            <p class="text-2xl font-bold text-white">{{ completedActivities }}</p>
          </div>
          <i class="fas fa-check-circle text-green-400 text-2xl"></i>
        </div>
      </div>
      
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Pendientes</p>
            <p class="text-2xl font-bold text-white">{{ pendingActivities }}</p>
          </div>
          <i class="fas fa-clock text-yellow-400 text-2xl"></i>
        </div>
      </div>
      
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-red-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm">Vencidas</p>
            <p class="text-2xl font-bold text-white">{{ overdueActivities }}</p>
          </div>
          <i class="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div class="flex items-center space-x-3">
        <select
          v-model="statusFilter"
          class="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
        >
          <option value="">Todos los estados</option>
          <option value="completed">Completadas</option>
          <option value="pending">Pendientes</option>
          <option value="in-progress">En Progreso</option>
        </select>
        
        <select
          v-model="typeFilter"
          class="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
        >
          <option value="">Todos los tipos</option>
          <option value="call">Llamada</option>
          <option value="meeting">Reunión</option>
          <option value="email">Email</option>
          <option value="task">Tarea</option>
        </select>
      </div>

      <button
        @click="$emit('create')"
        class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/25"
      >
        <i class="fas fa-plus mr-2"></i>
        Nueva Actividad
      </button>
    </div>

    <!-- Activities Timeline -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 overflow-hidden">
      <div class="p-6">
        <h3 class="text-xl font-bold text-white mb-6">Línea de Tiempo de Actividades</h3>
        
        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>

        <!-- Activities list -->
        <div v-else-if="filteredActivities.length > 0" class="space-y-4">
          <div
            v-for="activity in filteredActivities"
            :key="activity.id"
            class="flex items-start space-x-4 p-4 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition-colors group"
          >
            <!-- Activity icon -->
            <div class="flex-shrink-0 mt-1">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center"
                :class="{
                  'bg-green-500/20 text-green-400': activity.status === 'completed',
                  'bg-yellow-500/20 text-yellow-400': activity.status === 'pending',
                  'bg-blue-500/20 text-blue-400': activity.status === 'in-progress',
                  'bg-red-500/20 text-red-400': activity.status === 'overdue'
                }"
              >
                <i :class="getActivityIcon(activity.type)" class="text-sm"></i>
              </div>
            </div>

            <!-- Activity content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="text-white font-medium text-lg">{{ activity.title }}</h4>
                  <p class="text-gray-400 text-sm mt-1">{{ activity.description }}</p>
                  
                  <!-- Activity meta -->
                  <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span class="flex items-center">
                      <i class="fas fa-user mr-1"></i>
                      {{ activity.assignedTo || 'Sin asignar' }}
                    </span>
                    <span class="flex items-center">
                      <i class="fas fa-calendar mr-1"></i>
                      {{ formatDate(activity.dueDate) }}
                    </span>
                    <span class="flex items-center">
                      <i class="fas fa-clock mr-1"></i>
                      {{ activity.estimatedTime || 'N/A' }}
                    </span>
                  </div>
                </div>

                <!-- Activity status -->
                <div class="flex items-center space-x-2">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': activity.status === 'completed',
                      'bg-yellow-100 text-yellow-800': activity.status === 'pending',
                      'bg-blue-100 text-blue-800': activity.status === 'in-progress',
                      'bg-red-100 text-red-800': activity.status === 'overdue'
                    }"
                  >
                    {{ getStatusLabel(activity.status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Activity actions -->
            <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="flex items-center space-x-2">
                <button
                  @click="editActivity(activity)"
                  class="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                  title="Editar"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="toggleActivityStatus(activity)"
                  class="p-2 text-gray-400 hover:text-green-400 transition-colors"
                  title="Cambiar estado"
                >
                  <i class="fas fa-check"></i>
                </button>
                <button
                  @click="deleteActivity(activity)"
                  class="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-12">
          <i class="fas fa-tasks text-6xl text-gray-600 mb-4"></i>
          <h3 class="text-xl font-bold text-white mb-2">No hay actividades</h3>
          <p class="text-gray-400 mb-6">Comienza creando tu primera actividad</p>
          <button
            @click="$emit('create')"
            class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
          >
            <i class="fas fa-plus mr-2"></i>
            Crear Actividad
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotifications } from '@/composables/useNotifications'

const { confirmDelete } = useNotifications()

// Props
defineProps<{
  searchTerm: string
}>()

// Emits
defineEmits(['create', 'edit'])

// Reactive data
const loading = ref(false)
const statusFilter = ref('')
const typeFilter = ref('')

// Mock data - En producción esto vendría de un store/API
const activities = ref([
  {
    id: 1,
    title: 'Llamar a cliente ABC Corp',
    description: 'Seguimiento de propuesta enviada la semana pasada',
    type: 'call',
    status: 'pending',
    assignedTo: 'Juan Pérez',
    dueDate: '2025-09-05T14:30:00',
    estimatedTime: '30 min',
    clientId: 1
  },
  {
    id: 2,
    title: 'Reunión con equipo de desarrollo',
    description: 'Revisión del progreso del proyecto XYZ',
    type: 'meeting',
    status: 'completed',
    assignedTo: 'María García',
    dueDate: '2025-09-04T10:00:00',
    estimatedTime: '1 hora',
    clientId: 2
  },
  {
    id: 3,
    title: 'Enviar propuesta técnica',
    description: 'Preparar y enviar documentación técnica para nuevo proyecto',
    type: 'task',
    status: 'in-progress',
    assignedTo: 'Carlos López',
    dueDate: '2025-09-06T16:00:00',
    estimatedTime: '2 horas',
    clientId: 3
  }
])

// Computed properties
const filteredActivities = computed(() => {
  let filtered = activities.value

  if (statusFilter.value) {
    filtered = filtered.filter(activity => activity.status === statusFilter.value)
  }

  if (typeFilter.value) {
    filtered = filtered.filter(activity => activity.type === typeFilter.value)
  }

  return filtered
})

const completedActivities = computed(() => {
  return activities.value.filter(a => a.status === 'completed').length
})

const pendingActivities = computed(() => {
  return activities.value.filter(a => a.status === 'pending').length
})

const overdueActivities = computed(() => {
  return activities.value.filter(a => {
    return a.status !== 'completed' && new Date(a.dueDate) < new Date()
  }).length
})

// Methods
const getActivityIcon = (type: string) => {
  const icons = {
    call: 'fas fa-phone',
    meeting: 'fas fa-users',
    email: 'fas fa-envelope',
    task: 'fas fa-tasks'
  }
  return icons[type as keyof typeof icons] || 'fas fa-circle'
}

const getStatusLabel = (status: string) => {
  const labels = {
    completed: 'Completada',
    pending: 'Pendiente',
    'in-progress': 'En Progreso',
    overdue: 'Vencida'
  }
  return labels[status as keyof typeof labels] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const editActivity = (activity: any) => {
  console.log('Edit activity:', activity)
  // Emit edit event
}

const toggleActivityStatus = (activity: any) => {
  if (activity.status === 'completed') {
    activity.status = 'pending'
  } else {
    activity.status = 'completed'
  }
}

const deleteActivity = async (activity: any) => {
  const result = await confirmDelete(`¿Eliminar la actividad "${activity.title}"?`)
  if (!result.isConfirmed) return
  const index = activities.value.findIndex(a => a.id === activity.id)
  if (index !== -1) {
    activities.value.splice(index, 1)
  }
}

// Load data on mount
onMounted(() => {
  // In production, this would load from API/store
  console.log('Activities module loaded')
})
</script>
