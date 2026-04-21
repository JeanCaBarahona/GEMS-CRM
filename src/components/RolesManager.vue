<template>
  <div>
    <!-- Header para Roles -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-white">Roles y Perfiles</h2>
        <p class="text-gray-400 text-sm">Gestiona los permisos de los módulos</p>
      </div>
      <button
        @click="openModal()"
        class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
      >
        <i class="fas fa-plus"></i> Nuevo Rol
      </button>
    </div>

    <!-- Lista de Roles -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="role in roles" :key="role._id" class="bg-gray-800/80 rounded-xl p-5 border border-purple-500/20 shadow-lg">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-bold text-white">{{ role.name }}</h3>
            <span v-if="role.isSystem" class="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded mt-1 inline-block">Rol del Sistema</span>
            <span v-else class="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded mt-1 inline-block">Personalizado</span>
          </div>
          <div class="flex gap-2">
            <button @click="openModal(role)" class="text-blue-400 hover:text-blue-300 transition-colors">
              <i class="fas fa-edit"></i>
            </button>
            <button v-if="!role.isSystem" @click="confirmDelete(role)" class="text-red-400 hover:text-red-300 transition-colors">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <p class="text-gray-400 text-sm mb-4 line-clamp-2">{{ role.description || 'Sin descripción' }}</p>
        
        <div class="text-xs text-gray-500 border-t border-gray-700 pt-3">
          Módulos con acceso: 
          <span class="text-gray-300">{{ getAccessibleModulesCount(role) }}</span>
        </div>
      </div>
    </div>

    <!-- Modal Formulario de Rol -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-purple-500/20">
        
        <div class="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 class="text-2xl font-bold text-white">{{ editingRole ? 'Editar Rol' : 'Nuevo Rol' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-white"><i class="fas fa-times text-xl"></i></button>
        </div>

        <div class="p-6 overflow-y-auto flex-1">
          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-sm text-gray-300 mb-1">Nombre del Rol *</label>
              <input v-model="form.name" :disabled="editingRole?.isSystem" type="text" class="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white disabled:opacity-50" placeholder="Ej: Soporte Técnico" />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Descripción</label>
              <input v-model="form.description" type="text" class="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white" placeholder="Breve descripción del rol" />
            </div>
          </div>

          <h4 class="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Permisos por Módulo</h4>
          
          <div class="space-y-6">
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="form.permissions.dashboard" id="perm-dashboard" class="rounded border-gray-600 text-purple-600 focus:ring-purple-600 bg-gray-700">
              <label for="perm-dashboard" class="text-gray-200">Acceso al Dashboard</label>
            </div>

            <!-- Iterate through full modules -->
            <div v-for="module in modulesList" :key="module.key" class="bg-gray-700/30 rounded-lg p-4">
              <h5 class="text-md font-medium text-purple-300 mb-3 capitalize">{{ module.label }}</h5>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div v-if="'view' in form.permissions[module.key]" class="flex items-center gap-2">
                  <input type="checkbox" v-model="form.permissions[module.key]['view']" :id="`perm-${module.key}-view`" class="rounded border-gray-600 text-purple-600 focus:ring-purple-600">
                  <label :for="`perm-${module.key}-view`" class="text-sm text-gray-300">Ver</label>
                </div>
                <div v-if="'create' in form.permissions[module.key]" class="flex items-center gap-2">
                  <input type="checkbox" v-model="form.permissions[module.key]['create']" :id="`perm-${module.key}-create`" class="rounded border-gray-600 text-purple-600 focus:ring-purple-600">
                  <label :for="`perm-${module.key}-create`" class="text-sm text-gray-300">Crear</label>
                </div>
                <div v-if="'edit' in form.permissions[module.key]" class="flex items-center gap-2">
                  <input type="checkbox" v-model="form.permissions[module.key]['edit']" :id="`perm-${module.key}-edit`" class="rounded border-gray-600 text-purple-600 focus:ring-purple-600">
                  <label :for="`perm-${module.key}-edit`" class="text-sm text-gray-300">Editar</label>
                </div>
                <div v-if="'delete' in form.permissions[module.key]" class="flex items-center gap-2">
                  <input type="checkbox" v-model="form.permissions[module.key]['delete']" :id="`perm-${module.key}-delete`" class="rounded border-gray-600 text-purple-600 focus:ring-purple-600">
                  <label :for="`perm-${module.key}-delete`" class="text-sm text-gray-300">Eliminar</label>
                </div>
                <div v-if="'export' in form.permissions[module.key]" class="flex items-center gap-2">
                  <input type="checkbox" v-model="form.permissions[module.key]['export']" :id="`perm-${module.key}-export`" class="rounded border-gray-600 text-purple-600 focus:ring-purple-600">
                  <label :for="`perm-${module.key}-export`" class="text-sm text-gray-300">Exportar</label>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        <div class="p-6 border-t border-gray-700 flex justify-end gap-3 bg-gray-800/80">
          <button @click="closeModal" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">Cancelar</button>
          <button @click="saveRole" :disabled="saving || !form.name.trim()" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50">
            {{ saving ? 'Guardando...' : 'Guardar Perfil' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { rolesService, type Role, type RolePermissions } from '../services/rolesService'
import { useNotifications } from '../composables/useNotifications'

const { showSuccess, showError, confirmDelete: confirmDeleteNotification } = useNotifications()

const roles = ref<Role[]>([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editingRole = ref<Role | null>(null)

const modulesList = [
  { key: 'clients', label: 'Clientes' },
  { key: 'activities', label: 'Actividades' },
  { key: 'reports', label: 'Reportes' },
  { key: 'accounting', label: 'Contabilidad' },
  { key: 'cases', label: 'Casos / Soporte' },
  { key: 'team', label: 'Equipo / Usuarios' }
] as const;

const defaultPermissions: RolePermissions = {
  dashboard: false,
  clients: { view: false, create: false, edit: false, delete: false },
  activities: { view: false, create: false, edit: false, delete: false },
  reports: { view: false, export: false },
  accounting: { view: false, create: false, edit: false, delete: false },
  cases: { view: false, create: false, edit: false, delete: false },
  team: { view: false, create: false, edit: false, delete: false }
}

const form = ref({
  name: '',
  description: '',
  permissions: JSON.parse(JSON.stringify(defaultPermissions))
})

const loadRoles = async () => {
  try {
    loading.value = true
    roles.value = await rolesService.getAll()
  } catch (error) {
    showError('Error', 'No se pudieron cargar los roles')
  } finally {
    loading.value = false
  }
}

const getAccessibleModulesCount = (role: Role) => {
  let count = 0;
  if (role.permissions.dashboard) count++;
  const perms = role.permissions as any;
  for (const mod of modulesList) {
    if (perms[mod.key] && perms[mod.key].view) count++;
  }
  return count;
}

const openModal = (role?: Role) => {
  if (role) {
    editingRole.value = role
    form.value = {
      name: role.name,
      description: role.description || '',
      permissions: JSON.parse(JSON.stringify(role.permissions))
    }
    // Ensure all keys exist in case they were created before schema update
    for (const mod of modulesList) {
      if (!form.value.permissions[mod.key]) {
        form.value.permissions[mod.key] = JSON.parse(JSON.stringify(defaultPermissions[mod.key]))
      }
    }
  } else {
    editingRole.value = null
    form.value = {
      name: '',
      description: '',
      permissions: JSON.parse(JSON.stringify(defaultPermissions))
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingRole.value = null
}

const saveRole = async () => {
  if (!form.value.name.trim()) return
  try {
    saving.value = true
    if (editingRole.value?._id) {
      await rolesService.update(editingRole.value._id, form.value)
      showSuccess('Éxito', 'Rol actualizado correctamente')
    } else {
      await rolesService.create(form.value)
      showSuccess('Éxito', 'Rol creado correctamente')
    }
    closeModal()
    loadRoles()
  } catch (error: any) {
    showError('Error', error.response?.data?.message || 'Error al guardar el rol')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (role: Role) => {
  const result = await confirmDeleteNotification(role.name, 'rol')
  if (result.isConfirmed && role._id) {
    try {
      await rolesService.delete(role._id)
      showSuccess('Éxito', 'Rol eliminado')
      loadRoles()
    } catch(err: any) {
      showError('Error', err.response?.data?.message || 'Error al eliminar')
    }
  }
}

onMounted(() => {
  loadRoles()
})
</script>
