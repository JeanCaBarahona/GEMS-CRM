<template>
  <div class="p-6">
    <!-- Header with Tabs -->
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Equipo y Accesos
          </h1>
          <p class="text-gray-600 mt-2">Gestiona los miembros de tu equipo y sus permisos</p>
        </div>
        <button
          v-if="activeTab === 'miembros'"
          @click="openCreateForm"
          class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
        >
          <i class="fas fa-plus"></i>
          Agregar Miembro
        </button>
      </div>

      <!-- Tabs Navigation -->
      <div class="flex space-x-1 border-b border-gray-700">
        <button
          @click="activeTab = 'miembros'"
          :class="['px-6 py-3 text-sm font-medium transition-colors border-b-2', activeTab === 'miembros' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500']"
        >
          <i class="fas fa-users mr-2"></i> Miembros del Equipo
        </button>
        <button
          @click="activeTab = 'roles'"
          :class="['px-6 py-3 text-sm font-medium transition-colors border-b-2', activeTab === 'roles' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500']"
        >
          <i class="fas fa-id-badge mr-2"></i> Roles y Perfiles
        </button>
      </div>
    </div>

    <!-- Miembros Tab Content -->
    <div v-if="activeTab === 'miembros'">
    <!-- Filters and Search -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-purple-500/20">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar por nombre, rol o email..."
            class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          >
        </div>
        <select
          v-model="roleFilter"
          class="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
        >
          <option value="" class="bg-gray-700">Todos los roles</option>
          <option v-for="role in allAvailableRoles" :key="role._id || role.name" :value="role.name" class="bg-gray-700">
            {{ role.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Team Grid -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      <p class="mt-2 text-gray-300">Cargando miembros del equipo...</p>
    </div>

    <div v-else-if="filteredMembers.length === 0" class="text-center py-12">
      <i class="fas fa-users text-4xl text-gray-500 mb-4"></i>
      <p class="text-gray-400 text-lg">No se encontraron miembros del equipo</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="member in filteredMembers"
        :key="member._id"
        class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-purple-500/20 hover:border-purple-400 transform hover:-translate-y-1"
      >
        <!-- Member Avatar -->
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {{ getInitials(member.name) }}
          </div>
          <div class="ml-4 flex-1">
            <h3 class="font-bold text-white text-lg">{{ member.name }}</h3>
            <p class="text-purple-400 font-medium">{{ member.role }}</p>
          </div>
        </div>

        <!-- Member Info -->
        <div class="space-y-3 mb-4">
          <div class="flex items-center text-gray-300">
            <i class="fas fa-envelope w-4 mr-3 text-purple-400"></i>
            <span class="text-sm">{{ member.email }}</span>
          </div>
          <div class="flex items-center text-gray-300">
            <i class="fas fa-calendar w-4 mr-3 text-purple-400"></i>
            <span class="text-sm">Desde {{ formatDate(member.createdAt) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-4 border-t border-gray-700">
          <button
            @click="editMember(member)"
            class="flex-1 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-medium border border-blue-500/30"
          >
            <i class="fas fa-edit mr-2"></i>
            Editar
          </button>
          <button
            @click="confirmDelete(member)"
            class="flex-1 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium border border-red-500/30"
          >
            <i class="fas fa-trash mr-2"></i>
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Roles Tab Content -->
    <div v-else-if="activeTab === 'roles'">
      <RolesManager />
    </div>

    <!-- Team Form Modal -->
    <TeamForm 
      v-if="showTeamForm"
      :member="editingMember"
      @close="closeTeamForm"
      @memberSaved="handleTeamSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { teamService, type TeamMember } from '../services/teamService'
import TeamForm from './TeamForm.vue'
import RolesManager from './RolesManager.vue'
import { rolesService, type Role } from '../services/rolesService'
import { useNotifications } from '../composables/useNotifications'

// Composables
const { showSuccess, showError, confirmDelete: confirmDeleteNotification, showLoading, closeLoading } = useNotifications()

const activeTab = ref<'miembros' | 'roles'>('miembros')
const members = ref<TeamMember[]>([])
const roles = ref<Role[]>([])
const baseRolesNames = ['admin', 'manager', 'support', 'development', 'fullstack', 'employee', 'viewer', 'client']

const allAvailableRoles = computed(() => {
  const combined = [...roles.value]
  baseRolesNames.forEach(name => {
    if (!combined.some(r => r.name.toLowerCase() === name.toLowerCase())) {
      combined.push({
        name: name,
        isSystem: true,
        permissions: {} as any
      })
    }
  })
  return combined
})

const loading = ref(false)
const searchTerm = ref('')
const roleFilter = ref('')

// Team Form Modal state
const showTeamForm = ref(false)
const editingMember = ref<TeamMember | null>(null)

// No emits needed - modal is handled internally

const filteredMembers = computed(() => {
  return members.value.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchesRole = !roleFilter.value || member.role === roleFilter.value
    return matchesSearch && matchesRole
  })
})

const loadMembers = async () => {
  try {
    loading.value = true
    members.value = await teamService.getAll()
  } catch (error) {
    console.error('Error loading team members:', error)
  } finally {
    loading.value = false
  }
}

const openCreateForm = () => {
  editingMember.value = null
  showTeamForm.value = true
}

const editMember = (member: TeamMember) => {
  editingMember.value = member
  showTeamForm.value = true
}

const closeTeamForm = () => {
  showTeamForm.value = false
  editingMember.value = null
}

const handleTeamSave = () => {
  closeTeamForm()
  loadMembers() // Reload the list
  showSuccess('¡Miembro guardado!', 'El miembro del equipo ha sido guardado exitosamente')
}

const confirmDelete = async (member: TeamMember) => {
  const result = await confirmDeleteNotification(member.nombre, 'miembro del equipo')
  
  if (result.isConfirmed) {
    await deleteMember(member)
  }
}

const deleteMember = async (member: TeamMember) => {
  try {
    showLoading('Eliminando miembro del equipo...')
    await teamService.delete(member._id!)
    members.value = members.value.filter(m => m._id !== member._id)
    closeLoading()
    showSuccess('¡Miembro eliminado!', 'El miembro del equipo ha sido eliminado exitosamente')
  } catch (error) {
    closeLoading()
    showError('Error al eliminar miembro', error instanceof Error ? error.message : 'Error desconocido')
  }
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(async () => {
  loadMembers()
  try {
    roles.value = await rolesService.getAll()
  } catch (error) {
    console.error('Error loading roles:', error)
  }
})

defineExpose({
  loadMembers
})
</script>
