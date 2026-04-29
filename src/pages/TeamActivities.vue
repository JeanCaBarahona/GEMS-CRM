<template>
  <div class="flex flex-col h-full min-h-0 relative">
    <div class="flex-1 min-h-0 overflow-y-auto">
      
      <!-- Header -->
      <div class="mb-6 space-y-4">
        <!-- Top Row: View Mode & Export Button -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-black text-slate-800 mr-2">Actividades del Equipo</h1>
            <div class="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                @click="viewMode = 'cards'"
                :class="[
                  'px-4 py-1.5 rounded-md text-sm font-bold transition-all',
                  viewMode === 'cards' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                <i class="fas fa-th-large mr-2"></i>Tarjetas
              </button>
              <button
                @click="viewMode = 'table'"
                :class="[
                  'px-4 py-1.5 rounded-md text-sm font-bold transition-all',
                  viewMode === 'table' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                <i class="fas fa-table mr-2"></i>Tabla
              </button>
            </div>
          </div>

          <button 
            @click="copySummary"
            class="flex items-center justify-center gap-3 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-black text-sm shadow-lg shadow-emerald-200/50 group"
          >
            <i class="fas fa-file-export group-hover:translate-x-1 transition-transform"></i>
            COPIAR RESUMEN PARA WHATSAPP
          </button>
        </div>

        <!-- Bottom Row: Filters -->
        <div class="flex flex-wrap items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
          <div class="flex items-center gap-2">
            <i class="fas fa-filter text-slate-400 text-xs ml-1"></i>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtros:</span>
          </div>

          <!-- Filtro de Cliente -->
          <div class="min-w-[200px]">
            <CustomSelect
              v-model="selectedClient"
              :options="[
                { value: '', label: 'Todos los clientes' },
                ...clients.map(c => ({ value: c._id || '', label: c.name }))
              ]"
            />
          </div>

          <!-- Filtros de fecha -->
          <div class="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
            <div class="flex items-center gap-1.5 px-2">
              <span class="text-[10px] font-black text-slate-400 uppercase">Desde</span>
              <input type="date" v-model="startDate" class="text-xs border-none focus:ring-0 p-0 text-slate-600 font-bold bg-transparent" />
            </div>
            <div class="w-px h-4 bg-slate-200"></div>
            <div class="flex items-center gap-1.5 px-2">
              <span class="text-[10px] font-black text-slate-400 uppercase">Hasta</span>
              <input type="date" v-model="endDate" class="text-xs border-none focus:ring-0 p-0 text-slate-600 font-bold bg-transparent" />
            </div>
            <button 
              v-if="startDate || endDate || selectedClient" 
              @click="startDate = ''; endDate = ''; selectedClient = ''"
              class="p-1 text-slate-400 hover:text-red-500 transition-colors"
              title="Limpiar filtros"
            >
              <i class="fas fa-times-circle"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>

      <!-- Vista de tarjetas por miembro -->
      <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <div
          v-for="member in teamMembersWithActivities"
          :key="member._id"
          class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200"
        >
          <!-- Header del miembro -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-11 h-11 bg-primary-50 ring-2 ring-primary-100 rounded-full flex items-center justify-center">
              <span class="text-primary-600 font-black text-base">{{ member.name?.charAt(0)?.toUpperCase() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-slate-800 font-bold text-sm truncate">{{ member.name }}</h3>
              <p class="text-slate-500 text-xs font-medium">{{ member.role }}</p>
              <p v-if="member.department" class="text-slate-400 text-xs">{{ member.department }}</p>
            </div>
          </div>

          <!-- Estadísticas -->
          <div class="grid grid-cols-3 gap-2 mb-4">
            <div class="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
              <div class="text-lg font-black text-slate-800">{{ member.activities.length }}</div>
              <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total</div>
            </div>
            <div class="bg-amber-50 rounded-lg p-2 text-center border border-amber-100">
              <div class="text-lg font-black text-amber-600">{{ getPendingCount(member.activities) }}</div>
              <div class="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Pend.</div>
            </div>
            <div class="bg-emerald-50 rounded-lg p-2 text-center border border-emerald-100">
              <div class="text-lg font-black text-emerald-600">{{ getCompletedCount(member.activities) }}</div>
              <div class="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">Comp.</div>
            </div>
          </div>

          <!-- Lista de actividades recientes -->
          <div class="space-y-2 mb-4">
            <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Actividades Recientes</h4>
            <div v-if="member.activities.length === 0" class="text-center py-4">
              <i class="fas fa-inbox text-2xl text-slate-300 mb-2"></i>
              <p class="text-slate-400 text-xs font-medium">Sin actividades asignadas</p>
            </div>
            <div
              v-else
              v-for="activity in member.activities.slice(0, 3)"
              :key="activity._id"
              class="bg-slate-50 rounded-lg p-3 border border-slate-100 hover:border-slate-200 transition-colors"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <h5 class="text-slate-800 text-xs font-bold break-words leading-snug">{{ activity.title }}</h5>
                  <p class="text-slate-500 text-[10px] line-clamp-1 mt-0.5">{{ activity.description }}</p>
                </div>
                <span class="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0" :class="getStatusClass(activity.status)">
                  {{ getStatusLabel(activity.status) }}
                </span>
              </div>
              <div class="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-medium">
                <div class="flex items-center gap-1">
                  <i class="fas fa-calendar"></i>
                  <span>{{ formatDate(activity.date) }}</span>
                </div>
                <div v-if="activity.priority" class="flex items-center gap-1">
                  <i class="fas fa-flag" :class="getPriorityIconClass(activity.priority)"></i>
                  <span>{{ getPriorityLabel(activity.priority) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón ver todas -->
          <button
            v-if="member.activities.length > 3"
            @click="viewMemberActivities(member)"
            class="w-full px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-lg transition-colors text-xs font-bold border border-primary-100"
          >
            Ver todas ({{ member.activities.length }})
          </button>
        </div>
      </div>

      <!-- Vista de tabla -->
      <div v-else-if="viewMode === 'table'" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Actividad</th>
                <th class="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Asignado a</th>
                <th class="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Prioridad</th>
                <th class="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="activity in allActivities" :key="activity._id" class="hover:bg-slate-50 transition-colors group">
                <td class="px-6 py-3">
                  <div class="text-slate-800 font-bold text-sm group-hover:text-primary-600 transition-colors">{{ activity.title }}</div>
                  <div class="text-slate-500 text-xs line-clamp-1">{{ activity.description }}</div>
                </td>
                <td class="px-6 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-black text-xs">
                      {{ getAssignedToName(activity.assignedToUser).charAt(0) }}
                    </div>
                    <div>
                      <div class="text-slate-700 text-sm font-medium">{{ getAssignedToName(activity.assignedToUser) }}</div>
                      <div v-if="activity.assignedToUser?.role" class="text-slate-400 text-xs">{{ activity.assignedToUser.role }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-3">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold" :class="getStatusClass(activity.status)">
                    {{ getStatusLabel(activity.status) }}
                  </span>
                </td>
                <td class="px-6 py-3">
                  <span v-if="activity.priority" class="px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit" :class="getPriorityClass(activity.priority)">
                    <i class="fas fa-flag" :class="getPriorityIconClass(activity.priority)"></i>
                    {{ getPriorityLabel(activity.priority) }}
                  </span>
                  <span v-else class="text-slate-400 text-sm">—</span>
                </td>
                <td class="px-6 py-3 text-slate-600 text-sm font-medium">{{ formatDate(activity.date) }}</td>
                <td class="px-6 py-3">
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="reassignActivity(activity)" class="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors" title="Reasignar">
                      <i class="fas fa-user-edit text-xs"></i>
                    </button>
                    <button @click="editActivity(activity)" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                      <i class="fas fa-edit text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="!loading && teamMembersWithActivities.length === 0" class="text-center py-12">
        <div class="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm max-w-md mx-auto">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-users text-2xl text-slate-300"></i>
          </div>
          <h3 class="text-lg font-black text-slate-800 mb-2">No hay miembros del equipo</h3>
          <p class="text-slate-500 text-sm mb-6 font-medium">Agrega miembros al equipo para poder asignar actividades</p>
          <router-link to="/team" class="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-bold text-sm shadow-sm inline-flex items-center gap-2">
            <i class="fas fa-user-plus"></i>Gestionar Equipo
          </router-link>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <AssignActivityModal v-if="showAssignModal" :activity="selectedActivity" :team-members="teamMembers" @close="closeAssignModal" @assign="handleReassign" />
    <ActivityFormModal v-if="showEditModal" :activity="selectedActivity" :clients="clients" @close="closeEditModal" @saved="onActivitySaved" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { activityService, type ActivityData } from '../services/activityService'
import { teamService } from '../services/teamService'
import { clientService, type ClientData } from '../services/clientService'
import { useNotifications } from '../composables/useNotifications'
import type { TeamMember } from '../types'
import AssignActivityModal from '../components/modals/AssignActivityModal.vue'
import ActivityFormModal from '../components/forms/ActivityFormModal.vue'
import CustomSelect from '../components/ui/CustomSelect.vue'

// Reactive data
const loading = ref(true)
const viewMode = ref<'cards' | 'table'>('cards')
const activities = ref<ActivityData[]>([])
const teamMembers = ref<TeamMember[]>([])
const clients = ref<ClientData[]>([])

// Filtros
const startDate = ref('')
const endDate = ref('')
const selectedClient = ref('')

// Modales
const showAssignModal = ref(false)
const showEditModal = ref(false)
const selectedActivity = ref<ActivityData | null>(null)

// Composables
const { showSuccess, showError, toast } = useNotifications()

// Computed
const filteredActivities = computed(() => {
  let filtered = activities.value
  
  if (startDate.value) {
    const start = new Date(startDate.value + 'T00:00:00')
    filtered = filtered.filter(a => new Date(a.date) >= start)
  }
  
  if (endDate.value) {
    const end = new Date(endDate.value + 'T23:59:59')
    filtered = filtered.filter(a => new Date(a.date) <= end)
  }

  if (selectedClient.value) {
    filtered = filtered.filter(a => {
      const id = (typeof a.clientId === 'object' && a.clientId !== null) ? (a.clientId as any)._id : a.clientId
      return id === selectedClient.value
    })
  }
  
  return filtered
})

const teamMembersWithActivities = computed(() => {
  return teamMembers.value.map(member => ({
    ...member,
    activities: filteredActivities.value.filter(activity => {
      const assigned = activity.assignedTo
      if (Array.isArray(assigned)) {
        return assigned.some(a => (typeof a === 'object' && a !== null ? (a as any)._id : a) === member._id)
      }
      const assignedId = typeof assigned === 'object' && assigned !== null ? (assigned as any)._id : assigned
      return assignedId === member._id
    })
  }))
})

const allActivities = computed(() => {
  return filteredActivities.value.filter(activity => activity.assignedTo)
})

// Methods
const loadData = async () => {
  loading.value = true
  try {
    const [activitiesData, teamData, clientsData] = await Promise.all([
      activityService.getAll(),
      teamService.getActiveMembers(),
      clientService.getAll()
    ])
    
    // Filtrar actividades asignadas a clientes (por si acaso existen en DB)
    const filteredActivities = activitiesData.filter(activity => {
      const assignedUser = typeof activity.assignedToUser === 'object' ? activity.assignedToUser : null
      const role = assignedUser?.role?.toLowerCase() || ''
      return !role.includes('client') && !role.includes('cliente')
    })

    activities.value = filteredActivities
    teamMembers.value = teamData
    clients.value = clientsData
  } catch (error) {
    showError('Error al cargar datos', error instanceof Error ? error.message : 'Error desconocido')
  } finally {
    loading.value = false
  }
}

const getPendingCount = (activities: ActivityData[]) => {
  return activities.filter(a => a.status === 'pending').length
}

const getCompletedCount = (activities: ActivityData[]) => {
  return activities.filter(a => a.status === 'completed').length
}

const getStatusClass = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || classes.pending
}

const getStatusLabel = (status: string) => {
  const labels = {
    pending: 'Pendiente',
    completed: 'Completada',
    cancelled: 'Cancelada'
  }
  return labels[status as keyof typeof labels] || status
}

const getPriorityClass = (priority: string) => {
  const classes = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }
  return classes[priority as keyof typeof classes] || classes.medium
}

const getPriorityLabel = (priority: string) => {
  const labels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente'
  }
  return labels[priority as keyof typeof labels] || 'Media'
}

const getPriorityIconClass = (priority: string) => {
  const classes = {
    low: 'text-blue-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    urgent: 'text-red-600'
  }
  return classes[priority as keyof typeof classes] || classes.medium
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getAssignedToName = (assignedUser?: any): string => {
  if (!assignedUser) return 'Sin asignar'
  
  const extractName = (user: any): string => {
    if (!user) return ''
    if (typeof user === 'object' && user.name) return user.name
    if (typeof user === 'string') {
      const member = teamMembers.value.find(m => m._id === user)
      return member?.name || ''
    }
    return ''
  }

  if (Array.isArray(assignedUser)) {
    const names = assignedUser.map(extractName).filter(Boolean)
    return names.length > 0 ? names.join(', ') : 'Sin asignar'
  }

  const name = extractName(assignedUser)
  return name || 'Sin asignar'
}

const viewMemberActivities = (member: TeamMember & { activities: ActivityData[] }) => {
  // Implementar navegación o modal para ver todas las actividades del miembro
  console.log('Ver actividades de:', member.name)
}

const reassignActivity = (activity: ActivityData) => {
  selectedActivity.value = activity
  showAssignModal.value = true
}

const editActivity = (activity: ActivityData) => {
  selectedActivity.value = activity
  showEditModal.value = true
}

const closeAssignModal = () => {
  showAssignModal.value = false
  selectedActivity.value = null
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedActivity.value = null
}

const handleReassign = async (assigneeId: string | null) => {
  if (!selectedActivity.value?._id) return
  
  try {
    const updatedActivity = await activityService.reassignActivity(
      selectedActivity.value._id,
      assigneeId
    )
    
    // Actualizar en el estado local
    const activityIndex = activities.value.findIndex(a => a._id === selectedActivity.value!._id)
    if (activityIndex !== -1) {
      activities.value[activityIndex] = updatedActivity
    }
    
    const assigneeName = assigneeId 
      ? teamMembers.value.find(m => m._id === assigneeId)?.name || 'Usuario'
      : 'Nadie'
    
    toast(`Actividad reasignada a ${assigneeName}`, 'success')
    closeAssignModal()
  } catch (error) {
    showError('Error al reasignar actividad', error instanceof Error ? error.message : 'Error desconocido')
  }
}

const onActivitySaved = (activity: ActivityData) => {
  const index = activities.value.findIndex(a => a._id === activity._id)
  if (index !== -1) {
    activities.value[index] = activity
  }
  toast('Actividad actualizada correctamente', 'success')
  closeEditModal()
}

const copySummary = () => {
  if (teamMembersWithActivities.value.every(m => m.activities.length === 0)) {
    toast('No hay actividades para exportar en este período', 'info')
    return
  }

  let summary = `📊 *RESUMEN DE ACTIVIDADES*\n`
  if (startDate.value || endDate.value) {
    const startStr = startDate.value ? formatDate(startDate.value) : 'Inicio'
    const endStr = endDate.value ? formatDate(endDate.value) : 'Hoy'
    summary += `📅 Período: ${startStr} al ${endStr}\n`
  }
  if (selectedClient.value) {
    const client = clients.value.find(c => c._id === selectedClient.value)
    if (client) summary += `🏢 Cliente: ${client.name}\n`
  }
  summary += `----------------------------------\n\n`

  teamMembersWithActivities.value.forEach(member => {
    if (member.activities.length === 0) return

    summary += `👤 *${member.name}*\n`
    member.activities.forEach(activity => {
      const statusIcon = activity.status === 'completed' ? '✅' : activity.status === 'in-progress' ? '🔄' : '⏳'
      const percentage = activity.completionPercentage || 0
      const dateStr = formatDate(activity.date)
      const dueDateStr = activity.dueDate ? formatDate(activity.dueDate) : 'Sin fecha'
      
      summary += `${statusIcon} *${activity.title}*\n`
      summary += `📈 Progreso: ${percentage}%\n`
      summary += `🗓️ Fecha: ${dateStr} - ${dueDateStr}\n`
    })
    summary += `\n`
  })

  // Copiar al portapapeles
  const textArea = document.createElement("textarea")
  textArea.value = summary
  document.body.appendChild(textArea)
  textArea.select()
  try {
    document.execCommand('copy')
    toast('Resumen copiado al portapapeles', 'success')
  } catch (err) {
    toast('Error al copiar', 'error')
  }
  document.body.removeChild(textArea)
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
