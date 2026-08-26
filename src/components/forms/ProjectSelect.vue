<template>
  <div>
    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
      Proyecto
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Selección normal -->
    <div v-if="!creating" class="flex gap-2">
      <select
        :value="modelValue || ''"
        @change="onSelect(($event.target as HTMLSelectElement).value)"
        :disabled="!clientId || loading"
        class="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">
          {{ !clientId ? 'Primero selecciona un cliente' : loading ? 'Cargando proyectos...' : 'Sin proyecto' }}
        </option>
        <option v-for="p in activeProjects" :key="p._id" :value="p._id">
          {{ p.name }}{{ p.status !== 'active' ? ` (${statusLabel(p.status)})` : '' }}
        </option>
        <option v-if="clientId && !loading" value="__new__">+ Crear proyecto…</option>
      </select>
      <button
        v-if="clientId && !loading"
        type="button"
        @click="startCreating"
        title="Crear proyecto rápido"
        class="px-3 py-3 rounded-xl bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-100 transition-colors"
      >
        <i class="fas fa-plus text-sm"></i>
      </button>
    </div>

    <!-- Creación rápida en línea -->
    <div v-else class="flex gap-2">
      <input
        ref="newInput"
        v-model="newName"
        @keyup.enter.prevent="confirmCreate"
        @keyup.esc="cancelCreate"
        placeholder="Nombre del nuevo proyecto"
        class="flex-1 px-4 py-3 bg-white border border-primary-300 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
      />
      <button
        type="button"
        @click="confirmCreate"
        :disabled="!newName.trim() || saving"
        class="px-4 py-3 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
        <span v-else>Crear</span>
      </button>
      <button
        type="button"
        @click="cancelCreate"
        class="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
      >
        Cancelar
      </button>
    </div>

    <p v-if="error" class="text-red-500 text-xs font-bold mt-1.5">{{ error }}</p>
    <p v-else-if="clientId && !loading && activeProjects.length === 0 && !creating" class="text-amber-500 text-xs font-bold mt-1.5">
      Este cliente no tiene proyectos. Crea uno con el botón +.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { clientService, type ProjectData } from '../../services/clientService'

const props = defineProps<{
  clientId?: string | null
  modelValue?: string | null
  required?: boolean
  /** Si el cliente tiene un proyecto por defecto, seleccionarlo automáticamente. */
  autoSelectDefault?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'created', project: ProjectData): void
}>()

const projects = ref<ProjectData[]>([])
const loading = ref(false)
const error = ref('')
const creating = ref(false)
const saving = ref(false)
const newName = ref('')
const newInput = ref<HTMLInputElement | null>(null)

// Los archivados solo se muestran si son el valor ya seleccionado.
const activeProjects = computed(() =>
  projects.value.filter(p => p.status !== 'archived' || p._id === props.modelValue)
)

const statusLabel = (st?: string) =>
  st === 'paused' ? 'pausado' : st === 'completed' ? 'completado' : st === 'archived' ? 'archivado' : 'activo'

const loadProjects = async () => {
  if (!props.clientId) {
    projects.value = []
    return
  }
  loading.value = true
  error.value = ''
  try {
    projects.value = await clientService.getProjects(props.clientId)
    if (props.autoSelectDefault && !props.modelValue) {
      const def = projects.value.find(p => p.isDefault && p.status === 'active')
      if (def?._id) emit('update:modelValue', def._id)
    }
  } catch (err: any) {
    error.value = err?.message || 'No se pudieron cargar los proyectos'
    projects.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.clientId, (next, prev) => {
  if (next !== prev) {
    creating.value = false
    newName.value = ''
    // Al cambiar de cliente, el proyecto anterior ya no aplica.
    if (props.modelValue) emit('update:modelValue', null)
    loadProjects()
  }
}, { immediate: true })

const onSelect = (value: string) => {
  if (value === '__new__') {
    startCreating()
    return
  }
  emit('update:modelValue', value || null)
}

const startCreating = async () => {
  if (!props.clientId) return
  creating.value = true
  error.value = ''
  await nextTick()
  newInput.value?.focus()
}

const cancelCreate = () => {
  creating.value = false
  newName.value = ''
  error.value = ''
}

const confirmCreate = async () => {
  const name = newName.value.trim()
  if (!name || !props.clientId) return
  saving.value = true
  error.value = ''
  try {
    const created = await clientService.createProject(props.clientId, { name, status: 'active' })
    projects.value = [...projects.value, created]
    if (created._id) emit('update:modelValue', created._id)
    emit('created', created)
    creating.value = false
    newName.value = ''
  } catch (err: any) {
    error.value = err?.message || 'No se pudo crear el proyecto'
  } finally {
    saving.value = false
  }
}
</script>
