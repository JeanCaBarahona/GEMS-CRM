<template>
  <div class="space-y-6">
    <!-- Header -->
    <button
      @click="showCreateForm = true"
      class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105 shadow-lg shadow-purple-500/25"
    >
      <i class="fas fa-plus"></i>
      <span>Nuevo Caso</span>
    </button>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-6 border border-blue-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-400 text-sm font-medium">Total Casos</p>
            <p class="text-2xl font-bold text-white">{{ totalCases }}</p>
          </div>
          <div class="p-3 bg-blue-500/20 rounded-full">
            <i class="fas fa-folder text-blue-400 text-xl"></i>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-2xl p-6 border border-yellow-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-yellow-400 text-sm font-medium">En Progreso</p>
            <p class="text-2xl font-bold text-white">{{ inProgressCases }}</p>
          </div>
          <div class="p-3 bg-yellow-500/20 rounded-full">
            <i class="fas fa-clock text-yellow-400 text-xl"></i>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl p-6 border border-green-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-400 text-sm font-medium">Resueltos</p>
            <p class="text-2xl font-bold text-white">{{ resolvedCases }}</p>
          </div>
          <div class="p-3 bg-green-500/20 rounded-full">
            <i class="fas fa-check-circle text-green-400 text-xl"></i>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl p-6 border border-red-500/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-red-400 text-sm font-medium">Críticos</p>
            <p class="text-2xl font-bold text-white">{{ criticalCases }}</p>
          </div>
          <div class="p-3 bg-red-500/20 rounded-full">
            <i class="fas fa-exclamation-circle text-red-400 text-xl"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-500/20">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-tag mr-2 text-purple-400"></i>Tipo
          </label>
          <select
            v-model="filters.tipo"
            @change="loadCases"
            class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          >
            <option value="">Todos los tipos</option>
            <option value="documento">Documentos</option>
            <option value="incidencia">Incidencias</option>
            <option value="seguimiento">Seguimientos</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-flag mr-2 text-purple-400"></i>Estado
          </label>
          <select
            v-model="filters.estado"
            @change="loadCases"
            class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          >
            <option value="">Todos los estados</option>
            <option value="abierto">Abierto</option>
            <option value="en_progreso">En Progreso</option>
            <option value="resuelto">Resuelto</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-star mr-2 text-purple-400"></i>Prioridad
          </label>
          <select
            v-model="filters.prioridad"
            @change="loadCases"
            class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          >
            <option value="">Todas las prioridades</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-search mr-2 text-purple-400"></i>Buscar
          </label>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar casos..."
            class="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-12 border border-purple-500/20 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
      <p class="text-gray-400">Cargando casos...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-500/20">
      <div class="bg-red-500/20 border border-red-500/50 rounded-lg p-6">
        <div class="flex items-center gap-3 mb-4">
          <i class="fas fa-exclamation-triangle text-red-400 text-xl"></i>
          <h3 class="text-red-300 font-medium text-lg">Error al cargar casos</h3>
        </div>
        <p class="text-red-400 mb-4">{{ error }}</p>
        <button 
          @click="loadCases"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>

    <!-- Cases List -->
    <div v-else class="space-y-4">
      <!-- Empty State -->
      <div v-if="filteredCases.length === 0" class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-12 border border-purple-500/20 text-center">
        <i class="fas fa-folder text-6xl text-gray-500 mb-4"></i>
        <h3 class="text-xl font-medium text-gray-300 mb-2">
          {{ searchTerm || hasActiveFilters ? 'No se encontraron casos' : 'No hay casos registrados' }}
        </h3>
        <p class="text-gray-400 mb-6">
          {{ searchTerm || hasActiveFilters ? 'Intenta ajustar los filtros de búsqueda' : 'Comienza creando tu primer caso' }}
        </p>
        <button
          v-if="!searchTerm && !hasActiveFilters"
          @click="showCreateForm = true"
          class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 mx-auto font-medium transform hover:scale-105 shadow-lg shadow-purple-500/25"
        >
          <i class="fas fa-plus"></i>
          Crear Primer Caso
        </button>
      </div>

      <!-- Cases Cards -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div 
          v-for="caseItem in filteredCases" 
          :key="caseItem._id"
          class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-500/20 hover:shadow-xl hover:border-purple-400/40 transition-all duration-300 transform hover:scale-105 cursor-pointer"
          @click="selectCase(caseItem)"
        >
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span 
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="getTypeClass(caseItem.tipo)"
                  >
                    <i :class="getTypeIcon(caseItem.tipo)" class="mr-1"></i>
                    {{ caseItem.tipo.charAt(0).toUpperCase() + caseItem.tipo.slice(1) }}
                  </span>
                  <span 
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="getPriorityClass(caseItem.prioridad)"
                  >
                    {{ caseItem.prioridad.charAt(0).toUpperCase() + caseItem.prioridad.slice(1) }}
                  </span>
                </div>
                <h3 class="text-white font-semibold text-lg mb-2">{{ caseItem.titulo }}</h3>
                <p class="text-gray-400 text-sm">{{ caseItem.descripcion || 'Sin descripción' }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span 
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="getStatusClass(caseItem.estado)"
              >
                <i :class="getStatusIcon(caseItem.estado)" class="mr-1"></i>
                {{ getStatusText(caseItem.estado) }}
              </span>
              
              <div class="flex items-center gap-2">
                <div v-if="caseItem.archivos && caseItem.archivos.length > 0" class="flex items-center gap-1 text-gray-400">
                  <i class="fas fa-paperclip text-xs"></i>
                  <span class="text-xs">{{ caseItem.archivos.length }}</span>
                </div>
                <span class="text-gray-500 text-xs">
                  {{ formatDate(caseItem.fechaCreacion) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CaseFormModal
      v-if="showCreateForm || showEditForm"
      :mode="showCreateForm ? 'create' : 'edit'"
      :case-item="selectedCase"
      @save="handleSave"
      @cancel="closeModals"
    />

    <CaseDetailModal
      v-if="showDetailModal"
      :case-item="selectedCase"
      @edit="editCase"
      @close="closeModals"
      @update="handleUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { casesService, type Case } from '../services/casesService'
import CaseFormModal from './CaseFormModal.vue'
import CaseDetailModal from './CaseDetailModal.vue'

// State
const cases = ref<Case[]>([])
const loading = ref(false)
const error = ref('')
const searchTerm = ref('')
const showCreateForm = ref(false)
const showEditForm = ref(false)
const showDetailModal = ref(false)
const selectedCase = ref<Case | null>(null)

// Filtros
const filters = ref({
  tipo: '',
  estado: '',
  prioridad: ''
})

// Computed
const filteredCases = computed(() => {
  let filtered = cases.value

  // Aplicar filtros
  if (filters.value.tipo) {
    filtered = filtered.filter(c => c.tipo === filters.value.tipo)
  }
  if (filters.value.estado) {
    filtered = filtered.filter(c => c.estado === filters.value.estado)
  }
  if (filters.value.prioridad) {
    filtered = filtered.filter(c => c.prioridad === filters.value.prioridad)
  }

  // Aplicar búsqueda
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(c =>
      c.titulo.toLowerCase().includes(search) ||
      (c.descripcion && c.descripcion.toLowerCase().includes(search))
    )
  }

  return filtered
})

const hasActiveFilters = computed(() => {
  return filters.value.tipo || filters.value.estado || filters.value.prioridad
})

const totalCases = computed(() => cases.value.length)
const resolvedCases = computed(() => cases.value.filter(c => c.estado === 'resuelto').length)
const inProgressCases = computed(() => cases.value.filter(c => c.estado === 'en_progreso').length)
const criticalCases = computed(() => cases.value.filter(c => c.prioridad === 'critica').length)

// Methods
const loadCases = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await casesService.getAllCases()
    cases.value = response.cases || []
  } catch (err) {
    error.value = 'Error al cargar los casos'
    console.error('Error loading cases:', err)
  } finally {
    loading.value = false
  }
}

const selectCase = (caseItem: Case) => {
  selectedCase.value = caseItem
  showDetailModal.value = true
}

const editCase = (caseItem: Case) => {
  selectedCase.value = caseItem
  showDetailModal.value = false
  showEditForm.value = true
}

const closeModals = () => {
  showCreateForm.value = false
  showEditForm.value = false
  showDetailModal.value = false
  selectedCase.value = null
}

const handleSave = async () => {
  await loadCases()
  closeModals()
}

const handleUpdate = async () => {
  await loadCases()
}

// Utility functions
const getTypeClass = (tipo: string) => {
  const classes: Record<string, string> = {
    documento: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    incidencia: 'bg-red-500/20 text-red-400 border border-red-500/30',
    seguimiento: 'bg-green-500/20 text-green-400 border border-green-500/30'
  }
  return classes[tipo] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
}

const getTypeIcon = (tipo: string) => {
  const icons: Record<string, string> = {
    documento: 'fas fa-file-alt',
    incidencia: 'fas fa-exclamation-triangle',
    seguimiento: 'fas fa-eye'
  }
  return icons[tipo] || 'fas fa-folder'
}

const getPriorityClass = (prioridad: string) => {
  const classes: Record<string, string> = {
    baja: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    media: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    alta: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    critica: 'bg-red-500/20 text-red-400 border border-red-500/30'
  }
  return classes[prioridad] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
}

const getStatusClass = (estado: string) => {
  const classes: Record<string, string> = {
    abierto: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    en_progreso: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    resuelto: 'bg-green-500/20 text-green-400 border border-green-500/30',
    cerrado: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
  return classes[estado] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
}

const getStatusIcon = (estado: string) => {
  const icons: Record<string, string> = {
    abierto: 'fas fa-folder-open',
    en_progreso: 'fas fa-clock',
    resuelto: 'fas fa-check-circle',
    cerrado: 'fas fa-archive'
  }
  return icons[estado] || 'fas fa-question'
}

const getStatusText = (estado: string) => {
  const texts: Record<string, string> = {
    abierto: 'Abierto',
    en_progreso: 'En Progreso',
    resuelto: 'Resuelto',
    cerrado: 'Cerrado'
  }
  return texts[estado] || estado
}

const formatDate = (date: string | Date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  loadCases()
})
</script>
