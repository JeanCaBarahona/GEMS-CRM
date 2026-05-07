<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-primary-500/20">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          {{ isEditing ? 'Editar Miembro' : 'Nuevo Miembro' }}
        </h2>
        <button
          @click="closeForm"
          class="text-gray-400 hover:text-white text-2xl"
        >
          ×
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Nombre -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
            Nombre Completo *
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Ej: Juan Pérez"
          >
        </div>

        <!-- Rol -->
        <div>
          <label for="role" class="block text-sm font-medium text-gray-300 mb-2">
            Rol *
          </label>
          <select
            id="role"
            v-model="form.role"
            required
            class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="" class="bg-gray-700">Selecciona un rol</option>
            <option v-for="role in roles" :key="role._id" :value="role.name" class="bg-gray-700">
              {{ role.name }}
            </option>
          </select>
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
            Email *
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="ejemplo@empresa.com"
          >
        </div>

        <!-- Departamento -->
        <div>
          <label for="department" class="block text-sm font-medium text-gray-300 mb-2">
            Departamento *
          </label>
          <select
            id="department"
            v-model="form.department"
            required
            class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="" class="bg-gray-700">Selecciona un departamento</option>
            <option value="TI" class="bg-gray-700">TI</option>
            <option value="MARKETING" class="bg-gray-700">Marketing</option>
            <option value="VENTAS" class="bg-gray-700">Ventas</option>
            <option value="SOPORTE" class="bg-gray-700">Soporte</option>
          </select>
        </div>

        <!-- Actions -->
        <div class="flex gap-4 pt-6">
          <button
            type="button"
            @click="closeForm"
            class="flex-1 px-6 py-3 bg-gray-600 text-gray-200 rounded-xl hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="flex-1 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            <span v-if="loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ isEditing ? 'Actualizando...' : 'Creando...' }}
            </span>
            <span v-else>
              {{ isEditing ? 'Actualizar' : 'Crear' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { teamService, type TeamMember } from '../services/teamService'
import { rolesService, type Role } from '../services/rolesService'
import { useNotifications } from '../composables/useNotifications'

// Props
interface Props {
  member?: TeamMember | null
}

const { showError } = useNotifications()
const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  memberSaved: [member: TeamMember]
}>()

// Reactive state
const loading = ref(false)
const roles = ref<Role[]>([])
const form = ref({
  name: '',
  role: '',
  email: '',
  department: ''
})

// Computed
const isEditing = computed(() => !!props.member)

const isFormValid = computed(() => {
  return form.value.name.trim() !== '' && 
         form.value.role.trim() !== '' && 
         form.value.email.trim() !== '' &&
         form.value.department.trim() !== ''
})

// Methods
const resetForm = () => {
  form.value = {
    name: '',
    role: '',
    email: '',
    department: ''
  }
}

const loadMemberData = () => {
  if (props.member) {
    form.value = {
      name: props.member.name || '',
      role: props.member.role || '',
      email: props.member.email || '',
      department: props.member.department || ''
    }
  } else {
    resetForm()
  }
}

const closeForm = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    loading.value = true

    let savedMember: TeamMember

    const payload = {
      name: form.value.name.trim(),
      role: form.value.role,
      email: form.value.email.trim(),
      department: form.value.department
    }

    if (isEditing.value && props.member?._id) {
      // Update existing member
      savedMember = await teamService.update(props.member._id, payload)
    } else {
      // Create new member
      savedMember = await teamService.create(payload)
    }

    // Emit success event
    emit('memberSaved', savedMember)
    
    // Close the form
    closeForm()
    
  } catch (error) {
    console.error('Error saving team member:', error)
    showError('Error al guardar el miembro del equipo.')
  } finally {
    loading.value = false
  }
}

// Hooks
onMounted(async () => {
  try {
    roles.value = await rolesService.getAll()
  } catch (error) {
    console.error('Error loading roles:', error)
  }
})

// Watchers
watch(() => props.member, () => {
  nextTick(() => {
    loadMemberData()
  })
}, { immediate: true })
</script>
