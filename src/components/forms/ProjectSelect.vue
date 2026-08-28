<template>
  <div>
    <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">
      Proyecto
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Selección normal: mismo componente CustomSelect que usa el resto de la app -->
    <transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 scale-[0.98]"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-[0.98]"
      mode="out-in"
    >
      <CustomSelect
        v-if="!creating"
        key="select"
        :model-value="modelValue ?? null"
        :options="selectOptions"
        :placeholder="!clientId ? 'Primero selecciona un cliente' : 'Sin proyecto'"
        :disabled="!clientId"
        :loading="loading"
        searchable
        @change="onSelect"
      />

      <!-- Creación rápida en línea -->
      <div v-else key="create" class="flex gap-2">
        <input
          ref="newInput"
          v-model="newName"
          @keyup.enter.prevent="confirmCreate"
          @keyup.esc="cancelCreate"
          placeholder="Nombre del nuevo proyecto"
          class="flex-1 min-w-0 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
        />
        <button
          type="button"
          @click="confirmCreate"
          :disabled="!newName.trim() || saving"
          :class="[
            'px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap',
            !newName.trim() || saving
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98]'
          ]"
        >
          <i v-if="saving" class="fas fa-spinner fa-spin text-xs"></i>
          <span>Crear</span>
        </button>
        <button
          type="button"
          @click="cancelCreate"
          class="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm whitespace-nowrap"
        >
          Cancelar
        </button>
      </div>
    </transition>

    <p v-if="error" class="text-red-500 text-[11px] font-bold mt-1.5 ml-1">
      <i class="fas fa-exclamation-triangle mr-1"></i>{{ error }}
    </p>
    <p v-else-if="clientId && !loading && !creating && activeProjects.length === 0" class="text-slate-400 text-[11px] font-medium mt-1.5 ml-1">
      Este cliente no tiene proyectos. Usa <span class="text-primary-600 font-bold">+ Crear proyecto</span> en el desplegable.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { clientService, type ProjectData } from '../../services/clientService'
import CustomSelect from '../ui/CustomSelect.vue'

const NEW_PROJECT_VALUE = '__new_project__'

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
  st === 'paused' ? 'pausado' : st === 'completed' ? 'completado' : st === 'archived' ? 'archivado' : ''

const selectOptions = computed(() => {
  const opts: Array<{ value: string | null; label: string; specialClass?: string }> = [
    { value: null, label: 'Sin proyecto' },
    ...activeProjects.value.map(p => {
      const suffix = p.status !== 'active' ? ` · ${statusLabel(p.status)}` : ''
      return { value: p._id ?? null, label: `${p.name}${suffix}`, specialClass: p.status !== 'active' ? 'font-medium text-slate-400' : 'font-medium' }
    })
  ]
  if (props.clientId) {
    opts.push({ value: NEW_PROJECT_VALUE, label: '+ Crear proyecto…', specialClass: 'font-bold text-primary-600' })
  }
  return opts
})

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
    // Al cambiar de cliente, el proyecto anterior ya no aplica — pero solo cuando
    // YA había un cliente real antes (`prev` truthy). En el montaje de un formulario
    // de edición, clientId pasa de '' (valor inicial del form) al cliente real como
    // parte de la misma hidratación, no de un cambio hecho por el usuario; tratar
    // ese caso como "cambio de cliente" borraba el proyecto ya guardado.
    if (prev && props.modelValue) emit('update:modelValue', null)
    loadProjects()
  }
}, { immediate: true })

const onSelect = (value: string | number | null) => {
  if (value === NEW_PROJECT_VALUE) {
    startCreating()
    return
  }
  emit('update:modelValue', (value as string | null) ?? null)
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
