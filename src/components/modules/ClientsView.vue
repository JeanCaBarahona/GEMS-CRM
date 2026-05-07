<template>
  <div class="space-y-6">
    <!-- Header con controles -->
    <div class="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight">Gestión de Clientes</h1>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Administra tu cartera de clientes</p>
      </div>
      
      <div class="flex items-center gap-4 pr-20">
        <!-- Botón de vista -->
        <div class="flex bg-gray-800 rounded-lg p-1">
          <button
            @click="viewMode = 'grid'"
            :class="[
              'px-3 py-1.5 text-xs font-bold rounded-md transition-all',
              viewMode === 'grid' 
                ? 'bg-white text-primary-600 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-700'
            ]"
          >
            <i class="fas fa-th mr-2"></i>
            Grid
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-md transition-colors',
              viewMode === 'list' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            ]"
          >
            <i class="fas fa-list mr-2"></i>
            Lista
          </button>
        </div>

        <!-- Filtros -->
        <select 
          v-model="statusFilter" 
          class="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="prospect">Prospecto</option>
        </select>

        <!-- Botón crear -->
        <button
          @click="$emit('create')"
          class="px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-200 flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-200"
        >
          <i class="fas fa-plus text-[10px]"></i>
          Nuevo Cliente
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <i class="fas fa-exclamation-triangle text-red-400"></i>
        <div>
          <h3 class="text-red-300 font-medium">Error al cargar clientes</h3>
          <p class="text-red-400 text-sm">{{ error }}</p>
        </div>
      </div>
      <button 
        @click="loadClients"
        class="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
      >
        Reintentar
      </button>
    </div>

    <!-- Vista Grid -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="client in filteredClients"
        :key="client._id"
        class="bg-white rounded-2xl p-6 border border-slate-100 hover:border-primary-200 transition-all duration-300 hover:shadow-xl shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] group"
      >
        <!-- Header del cliente -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-lg">
                {{ getInitials(client.name) }}
              </span>
            </div>
            <div>
              <h3 class="text-slate-800 font-black text-lg group-hover:text-primary-600 transition-colors">
                {{ client.name }}
              </h3>
              <p class="text-slate-400 font-bold text-xs uppercase tracking-wider">{{ client.company || 'Sin empresa' }}</p>
            </div>
          </div>
          
          <!-- Status badge -->
          <span 
            :class="getStatusColor(client.status || 'prospect')"
            class="px-2 py-1 rounded-full text-xs font-medium"
          >
            {{ getStatusText(client.status || 'prospect') }}
          </span>
        </div>

        <!-- Información de contacto -->
        <div class="space-y-2 mb-4">
          <div class="flex items-center gap-2 text-slate-500">
            <i class="fas fa-envelope w-4 text-primary-400"></i>
            <span class="text-xs font-medium">{{ client.email }}</span>
          </div>
          <div v-if="client.phone" class="flex items-center gap-2 text-slate-500">
            <i class="fas fa-phone w-4 text-primary-400"></i>
            <span class="text-xs font-medium">{{ client.phone }}</span>
          </div>
          <div v-if="client.address" class="flex items-center gap-2 text-slate-500">
            <i class="fas fa-map-marker-alt w-4 text-primary-400"></i>
            <span class="text-xs font-medium">{{ client.address }}</span>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-50">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            {{ formatDate(client.createdAt) }}
          </span>
          <div class="flex items-center gap-2">
            <button
              @click="$emit('edit', client)"
              class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              @click="deleteClient(client._id!)"
              class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Lista -->
    <div v-else-if="viewMode === 'list'" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
              <th class="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
              <th class="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa</th>
              <th class="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
              <th class="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
              <th class="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="client in filteredClients"
              :key="client._id"
              class="hover:bg-gray-700/30 transition-colors duration-200"
            >
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-50 border border-primary-100 rounded-xl flex items-center justify-center">
                    <span class="text-primary-600 font-black text-sm">
                      {{ getInitials(client.name) }}
                    </span>
                  </div>
                  <div>
                    <div class="text-slate-800 font-black text-sm">{{ client.name }}</div>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6">
                <div class="text-slate-600 text-xs font-bold">{{ client.email }}</div>
                <div v-if="client.phone" class="text-slate-400 text-[10px] font-medium">{{ client.phone }}</div>
              </td>
              <td class="py-4 px-6">
                <span class="text-slate-500 text-xs font-bold uppercase tracking-tight">{{ client.company || '-' }}</span>
              </td>
              <td class="py-4 px-6">
                <span 
                  :class="getStatusColor(client.status || 'prospect')"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusText(client.status || 'prospect') }}
                </span>
              </td>
              <td class="py-4 px-6">
                <span class="text-gray-300 text-sm">{{ formatDate(client.createdAt) }}</span>
              </td>
              <td class="py-4 px-6">
                <div class="flex items-center gap-2">
                  <button
                    @click="$emit('edit', client)"
                    class="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all duration-200"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="deleteClient(client._id!)"
                    class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else-if="!loading && filteredClients.length === 0" class="text-center py-12">
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
        <i class="fas fa-users text-6xl text-gray-600 mb-4"></i>
        <h3 class="text-xl font-bold text-white mb-2">No hay clientes</h3>
        <p class="text-gray-400 mb-6">
          {{ searchTerm ? 'No se encontraron clientes que coincidan con tu búsqueda' : 'Comienza agregando tu primer cliente' }}
        </p>
        <button
          @click="$emit('create')"
          class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
        >
          <i class="fas fa-plus mr-2"></i>
          Crear Primer Cliente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { clientService, type ClientData } from '../../services/clientService'
import { useNotifications } from '../../composables/useNotifications'

// Composables
const { showSuccess, showError, confirmDelete, showLoading, closeLoading } = useNotifications()

// Props
interface Props {
  searchTerm?: string
}
const props = withDefaults(defineProps<Props>(), {
  searchTerm: ''
})

// Emits
defineEmits<{
  create: []
  edit: [client: ClientData]
}>()

// Reactive data
const clients = ref<ClientData[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')
const statusFilter = ref<string>('')

// Computed
const filteredClients = computed(() => {
  let filtered = clients.value

  // Filtrar por búsqueda
  if (props.searchTerm) {
    const searchLower = props.searchTerm.toLowerCase()
    filtered = filtered.filter(client =>
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      (client.company && client.company.toLowerCase().includes(searchLower))
    )
  }

  // Filtrar por estado
  if (statusFilter.value) {
    filtered = filtered.filter(client => client.status === statusFilter.value)
  }

  return filtered
})

// Methods
const loadClients = async () => {
  try {
    loading.value = true
    error.value = null
    clients.value = await clientService.getAll()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    clients.value = []
  } finally {
    loading.value = false
  }
}

const deleteClient = async (id: string) => {
  const client = clients.value.find(c => c._id === id)
  const clientName = client?.name || 'este cliente'
  
  const result = await confirmDelete(clientName, 'cliente')
  
  if (!result.isConfirmed) {
    return
  }

  // Show loading state for the specific client being deleted
  const clientIndex = clients.value.findIndex(client => client._id === id)
  if (clientIndex === -1) return

  try {
    showLoading('Eliminando cliente...')
    await clientService.deleteClient(id)
    // Remove from local array immediately for better UX
    clients.value = clients.value.filter(client => client._id !== id)
    closeLoading()
    showSuccess('¡Cliente eliminado!', 'El cliente ha sido eliminado exitosamente')
  } catch (err) {
    closeLoading()
    showError('Error al eliminar cliente', err instanceof Error ? err.message : 'Error desconocido')
    // Reload clients to ensure consistency
    loadClients()
  }
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    case 'inactive':
      return 'bg-rose-50 text-rose-600 border-rose-100'
    case 'prospect':
      return 'bg-amber-50 text-amber-600 border-amber-100'
    default:
      return 'bg-slate-50 text-slate-500 border-slate-100'
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Activo'
    case 'inactive':
      return 'Inactivo'
    case 'prospect':
      return 'Prospecto'
    default:
      return 'Desconocido'
  }
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  loadClients()
})

// Watchers
watch(() => props.searchTerm, () => {
  // La búsqueda se maneja en el computed filteredClients
})

// Expose methods for parent component
defineExpose({
  loadClients
})
</script>
