<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Información básica -->
    <div class="grid grid-cols-1 gap-6">
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Título de la Actividad *
          </label>
          <VoiceDictateButton v-model="form.title" size="xs" />
        </div>
        <input
          v-model="form.title"
          type="text"
          required
          class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-sm"
          placeholder="Ej: Reunión de seguimiento con cliente"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Cliente *
        </label>
        <select
          v-model="form.clientId"
          required
          :disabled="loadingClients"
          class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-sm"
        >
          <option value="" disabled>
            {{ loadingClients ? 'Cargando clientes...' : 'Selecciona un cliente' }}
          </option>
          <option 
            v-for="client in clients" 
            :key="client._id" 
            :value="client._id"
          >
            {{ client.name }} {{ client.company ? `- ${client.company}` : '' }}
          </option>
        </select>
        <p v-if="!loadingClients && clients.length === 0" class="text-amber-500 text-xs font-bold mt-1.5">
          <i class="fas fa-exclamation-triangle mr-1"></i> No hay clientes disponibles. Crea un cliente primero.
        </p>
      </div>

      <!-- Selección múltiple de asignados (componente reutilizable) -->
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Asignados *</label>
        <AssignedUsersSelector
          v-model="form.assignedTo"
          :teamMembers="users"
        />
      </div>
    </div>

    <!-- Descripción -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Descripción *
        </label>
        <VoiceDictateButton v-model="form.description" size="xs" />
      </div>
      <textarea
        v-model="form.description"
        rows="4"
        required
        class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none text-sm"
        placeholder="Describe los detalles de la actividad..."
      ></textarea>
    </div>

    <!-- Error message -->
    <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-600 font-bold text-sm flex items-center">
        <i class="fas fa-exclamation-circle mr-2"></i>{{ error }}
      </p>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-5 py-2 text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors font-bold text-sm"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="loading || clients.length === 0 || loadingClients"
        class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm flex items-center gap-2"
      >
        <span v-if="loading" class="flex items-center gap-2">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Guardando...
        </span>
        <span v-else class="flex items-center gap-2">
          <i class="fas fa-check"></i>
          {{ mode === 'create' ? 'Crear Actividad' : 'Actualizar Actividad' }}
        </span>
      </button>
    </div>
    <!-- Selección múltiple de asignados (Backup nativo) -->
    <div class="hidden">
      <label class="block text-xs font-bold text-slate-700 mb-2">
        Asignados (nativo) *
      </label>
      <select
        v-model="form.assignedTo"
        multiple
        required
        class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-primary-500 transition-colors"
      >
        <option v-for="user in users" :key="user._id" :value="user._id">
          {{ user.name }} ({{ user.email }})
        </option>
      </select>
      <p v-if="users.length === 0" class="text-amber-500 text-xs mt-1">
        No hay usuarios disponibles.
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import AssignedUsersSelector from '../AssignedUsersSelector.vue'
import VoiceDictateButton from '@/components/ui/VoiceDictateButton.vue'
// import eliminado: computed
// ...eliminado: helpers de chips y búsqueda, ahora en AssignedUsersSelector
import { ref, reactive, onMounted, watch } from 'vue'
import { activityService, type ActivityData } from '../../services/activityService'
import { clientService, type ClientData } from '../../services/clientService'
import { teamService } from '../../services/teamService'
import type { TeamMember } from '../../types'

const users = ref<TeamMember[]>([])
// Props
const props = defineProps<{
  activity?: ActivityData | null
}>()

// Emits
const emit = defineEmits(['save', 'cancel'])
        assignedTo: []

// Reactive data
const loading = ref(false)
const error = ref('')
const clients = ref<ClientData[]>([])
const loadingClients = ref(false)

const form = reactive<Partial<ActivityData>>({
  title: '',
  description: '',
  date: '',
  status: 'pending',
  clientId: '',
  assignedTo: [] as string[]
})

// Computed
const mode = ref<'create' | 'edit'>('create')

const loadUsers = async () => {
  try {
    users.value = await teamService.getActiveMembers()
  } catch (err) {
    console.error('Error loading users:', err)
  }
}
// Methods
const loadClients = async () => {
  try {
    loadingClients.value = true
    clients.value = await clientService.getAll()
  } catch (err) {
    console.error('Error loading clients:', err)
    error.value = 'Error al cargar la lista de clientes'
  } finally {
    loadingClients.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    // Validar que se haya seleccionado un cliente
    if (!form.clientId) {
      error.value = 'Debes seleccionar un cliente'
      return
    }

            assignedTo: Array.isArray(form.assignedTo) ? form.assignedTo : [form.assignedTo]
    // Validar que la fecha sea válida
    if (!form.date) {
      error.value = 'Debes seleccionar una fecha y hora'
      return
    }

    const assignedToClean = Array.isArray(form.assignedTo)
      ? form.assignedTo.filter(id => typeof id === 'string' && id)
      : typeof form.assignedTo === 'string' && form.assignedTo ? [form.assignedTo] : [];
    const activityData = {
      title: form.title!,
      description: form.description!,
      date: new Date(form.date!).toISOString(),
      status: form.status || 'pending',
      clientId: form.clientId!,
      assignedTo: assignedToClean
    }

    if (mode.value === 'create') {
      await activityService.create(activityData)
    } else if (props.activity?._id) {
      await activityService.update(props.activity._id, activityData)
    }

    emit('save')
  } catch (err: any) {
    error.value = err.message || 'Error al guardar la actividad'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    title: '',
    description: '',
    date: '',
  status: 'pending',
  clientId: '',
  assignedTo: []
  })
}

const loadForm = () => {
  if (props.activity) {
    mode.value = 'edit'
    Object.assign(form, {
      title: props.activity?.title || '',
      description: props.activity?.description || '',
      date: props.activity?.date ? new Date(props.activity.date).toISOString().slice(0, 16) : '',
      status: props.activity?.status || 'pending',
      clientId: typeof props.activity?.clientId === 'string' ? props.activity?.clientId : (props.activity?.clientId && typeof props.activity.clientId === 'object' ? (props.activity.clientId as any)._id : ''),
  assignedTo: props.activity && Array.isArray(props.activity.assignedTo) ? props.activity.assignedTo : props.activity && props.activity.assignedTo ? [props.activity.assignedTo] : []
    })
  } else {
    loadUsers()
    mode.value = 'create'
    resetForm()
    // Set default date to now + 1 hour
    const now = new Date()
    now.setHours(now.getHours() + 1)
    form.date = now.toISOString().slice(0, 16)
  }
}

// Load form data and clients on mount
onMounted(async () => {
  await loadClients()
  loadForm()
})

// Watch for changes in props
watch(() => props.activity, () => {
  loadForm()
})
</script>
