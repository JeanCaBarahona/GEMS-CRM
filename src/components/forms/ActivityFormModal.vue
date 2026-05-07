11  |q1|<template>
  <div class="fixed -inset-1 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300" @click="closeOnOutsideClick">
    <div class="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200/60 w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/30">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-primary-50 rounded-[1rem] flex items-center justify-center border border-primary-100 shadow-sm transition-transform hover:rotate-3">
            <i :class="isEditing ? 'fas fa-pen-nib text-primary-500' : 'fas fa-rocket text-primary-500'" class="text-xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">
              {{ isEditing ? 'Refinar Tarea' : 'Lanzar Nueva Tarea' }}
            </h2>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
              Gestión de Productividad Customer Touch
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
        >
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <form @submit.prevent="handleSubmit" class="flex flex-col h-full">
          <div class="space-y-6 flex-1">
            
            <!-- Título -->
            <div class="space-y-2">
              <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Título de la Actividad</label>
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all text-sm font-bold shadow-sm placeholder-slate-300"
                placeholder="Ej: Implementar pasarela de pagos..."
              />
            </div>

            <!-- Fila 1: Tipo, Prioridad, Fechas -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="space-y-2">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                <CustomSelect
                  v-model="form.type"
                  :options="[
                    { value: 'task', label: 'Tarea Estándar' },
                    { value: 'bug', label: 'Bug / Error' },
                    { value: 'feature', label: 'Mejora / Feature' },
                    { value: 'user-story', label: 'Historia de Usuario' }
                  ]"
                />
              </div>
              <div class="space-y-2">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Prioridad</label>
                <CustomSelect
                  v-model="form.priority"
                  :options="[
                    { value: 'low', label: 'Baja (Mantenimiento)' },
                    { value: 'medium', label: 'Media (Normal)' },
                    { value: 'high', label: 'Alta (Importante)' },
                    { value: 'urgent', label: 'Crítica (Urgente)' }
                  ]"
                />
              </div>
              <div class="space-y-2">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Inicio</label>
                <div class="relative group">
                  <i class="fas fa-calendar-alt absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-400 transition-colors"></i>
                  <input
                    v-model="form.date"
                    type="datetime-local"
                    class="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all text-xs font-bold shadow-sm"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Entrega</label>
                <div class="relative group">
                  <i class="fas fa-flag-checkered absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-400 transition-colors"></i>
                  <input
                    v-model="form.dueDate"
                    type="datetime-local"
                    class="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all text-xs font-bold shadow-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Fila 2: Cliente/Equipo y Detalles -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <!-- Columna Izquierda -->
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente / Proyecto</label>
                  <CustomSelect
                    v-model="form.clientId"
                    :options="[
                      { value: '', label: 'Interno' },
                      ...(clients || []).map(client => ({ value: client._id, label: client.name }))
                    ]"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Equipo Responsable</label>
                  <div class="bg-slate-50/50 border border-slate-200 rounded-2xl p-3 shadow-inner h-[320px] flex flex-col overflow-hidden">
                    <AssignedUsersSelector
                      v-model="form.assignedTo"
                      :teamMembers="teamMembers"
                    />
                  </div>
                </div>
              </div>

              <!-- Columna Derecha: Descripción y Tiempo -->
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Detalles y Notas</label>
                  <textarea
                    v-model="form.description"
                    rows="2"
                    class="w-full px-5 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all resize-none text-sm font-medium leading-relaxed shadow-sm custom-scrollbar"
                    placeholder="Describe los pasos, criterios de aceptación o contexto..."
                  ></textarea>
                </div>

                <!-- Tiempo Estimado y Progreso -->
                <div class="space-y-5 shrink-0">
                  <div class="space-y-2">
                    <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                    <span>Tiempo Estimado</span>
                    <button type="button" @click="form.estimatedTime = ''" class="text-primary-500 hover:text-primary-600">Limpiar</button>
                  </label>
                  <div class="grid grid-cols-4 gap-2">
                    <button
                      v-for="time in [
                        { val: '15m', label: '15m' },
                        { val: '30m', label: '30m' },
                        { val: '1h', label: '1h' },
                        { val: '2h', label: '2h' },
                        { val: '4h', label: '4h' },
                        { val: '8h', label: '8h' }
                      ]"
                      :key="time.val"
                      type="button"
                      @click="form.estimatedTime = time.val"
                      class="px-1 py-2 rounded-xl text-[11px] font-black tracking-wider uppercase transition-all border shadow-sm flex items-center justify-center gap-1"
                      :class="form.estimatedTime === time.val 
                        ? 'bg-primary-500 text-white border-primary-600 ring-2 ring-primary-500/20 shadow-primary-500/20' 
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'"
                    >
                      <i class="fas fa-clock opacity-70 hidden sm:inline-block"></i>
                      {{ time.label }}
                    </button>
                    
                    <div class="col-span-2 relative group">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-pen text-[10px] text-slate-400 group-focus-within:text-primary-500 transition-colors"></i>
                      </div>
                      <input 
                        v-model="form.estimatedTime"
                        type="text"
                        placeholder="Ej: 3.5h"
                        class="w-full h-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-[11px] font-black focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm placeholder-slate-300"
                      />
                    </div>
                    </div>
                  </div>

                  <!-- Progreso -->
                  <div class="mt-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest w-12 text-right">{{ form.completionPercentage || 0 }}%</span>
                    <input 
                      type="range" 
                      v-model.number="form.completionPercentage" 
                      min="0" max="100" step="5"
                      class="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end pt-6 border-t border-slate-100 mt-6">
            
            <div class="flex items-center gap-4">
              <button
                type="button"
                @click="$emit('close')"
                class="px-8 py-4 bg-white text-slate-500 hover:text-slate-800 border border-slate-200 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 active:scale-95 shadow-sm"
              >
                Descartar
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-12 py-5 bg-primary-500 text-white rounded-[1.5rem] hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-primary-200 flex items-center justify-center gap-4 active:scale-95 group"
              >
                <div v-if="loading" class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-paper-plane'" class="group-hover:translate-x-1 transition-transform"></i>
                {{ loading ? 'Sincronizando...' : (isEditing ? 'Guardar Cambios' : 'Lanzar Tarea') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import AssignedUsersSelector from '../AssignedUsersSelector.vue'
import CustomSelect from '../ui/CustomSelect.vue'
import { activityService } from '../../services/activityService'
import { useBoardsStore } from '../../stores/boards'
import { useTasksStore } from '../../stores/tasks'
import { useNotifications } from '../../composables/useNotifications'
import type { TeamMember, Client } from '../../types'

console.log('ActivityFormModal script setup initialized')

const boardsStore = useBoardsStore()
const tasksStore = useTasksStore()
const { showSuccess, showError } = useNotifications()

interface Props {
  activity?: any | null
  clients: Client[]
  teamMembers: TeamMember[]
  initialBoardStatus?: string
  boardId?: string
  sprints?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  activity: null,
  clients: () => [],
  teamMembers: () => [],
  initialBoardStatus: 'backlog'
})

const emit = defineEmits<{
  close: []
  saved: [activity: any]
}>()

const loading = ref(false)

const isEditing = computed(() => !!props.activity)

const form = reactive({
  title: '',
  description: '',
  clientId: '',
  assignedTo: [] as string[],
  priority: 'medium',
  status: 'pending',
  type: 'task',
  date: '',
  dueDate: '',
  estimatedTime: '',
  completionPercentage: 0
})

const populateForm = () => {
  try {
    console.log('Populating ActivityFormModal with:', props.activity)
    if (props.activity) {
      form.title = props.activity.title || ''
      form.description = props.activity.description || ''
      
      // Soporte para ambos: clientId (Activity) o client (Task)
      form.clientId = props.activity.clientId?._id || props.activity.clientId || 
                      props.activity.client?._id || props.activity.client || ''
      
      // Soporte para asignación múltiple (Activity) o única (Task)
      if (props.activity.assignedTo) {
        if (Array.isArray(props.activity.assignedTo)) {
          form.assignedTo = props.activity.assignedTo.map((u: any) => typeof u === 'object' ? (u?._id || '') : u).filter(Boolean)
        } else {
          // Es un objeto único (Task)
          const userId = typeof props.activity.assignedTo === 'object' ? props.activity.assignedTo?._id : props.activity.assignedTo
          form.assignedTo = userId ? [userId] : []
        }
      } else {
        form.assignedTo = []
      }

      form.priority = props.activity.priority || 'medium'
      form.status = props.activity.status || 'pending'
      form.type = props.activity.type || 'task'
      
      // Soporte para estimatedHours (Task) o estimatedTime (Activity)
      form.estimatedTime = props.activity.estimatedTime || (props.activity.estimatedHours ? `${props.activity.estimatedHours}h` : '')
      
      form.completionPercentage = props.activity.completionPercentage || 0
      
      const defaultDate = new Date().toISOString().slice(0, 16)
      form.date = props.activity.date ? formatDateTimeLocal(props.activity.date) : (props.activity.createdAt ? formatDateTimeLocal(props.activity.createdAt) : defaultDate)
      form.dueDate = props.activity.dueDate ? formatDateTimeLocal(props.activity.dueDate) : ''
    } else {
      // Valores por defecto para nueva tarea
      form.title = ''
      form.description = ''
      form.clientId = ''
      form.assignedTo = []
      form.priority = 'medium'
      form.status = 'pending'
      form.type = 'task'
      form.estimatedTime = ''
      form.completionPercentage = 0
      form.date = new Date().toISOString().slice(0, 16)
      form.dueDate = ''
    }
  } catch (err) {
    console.error('Error in populateForm:', err)
  }
}

const formatDateTimeLocal = (dateString: any) => {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 16)
  } catch (e) {
    return ''
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const isTask = !!props.boardId || !!props.activity?.boardId || !!props.activity?.boardStatus
    
    const taskData: any = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: form.status,
      type: form.type,
      completionPercentage: form.completionPercentage,
      dueDate: form.dueDate || undefined
    }

    // Campos específicos según el modelo
    if (isTask) {
      taskData.boardId = props.boardId || props.activity?.boardId
      taskData.boardStatus = props.initialBoardStatus || props.activity?.boardStatus
      // En Task, assignedTo es usualmente el primer elemento o manejado diferente en el backend
      taskData.assignedTo = form.assignedTo[0] || null
      taskData.client = form.clientId || undefined
      // Convertir estimatedTime (1.5h) a estimatedHours (1.5)
      const hours = parseFloat(form.estimatedTime.replace('h', ''))
      if (!isNaN(hours)) taskData.estimatedHours = hours
    } else {
      taskData.clientId = form.clientId || undefined
      taskData.assignedTo = form.assignedTo
      taskData.estimatedTime = form.estimatedTime
      taskData.date = form.date
    }

    let savedData: any
    
    if (isEditing.value && props.activity?._id) {
      if (isTask) {
        savedData = await tasksStore.updateTask(props.activity._id, taskData)
      } else {
        savedData = await activityService.update(props.activity._id, taskData)
      }
      showSuccess(isTask ? 'Tarea actualizada' : 'Actividad actualizada')
    } else {
      if (isTask) {
        savedData = await tasksStore.createTask(taskData)
      } else {
        savedData = await activityService.create(taskData)
      }
      showSuccess(isTask ? 'Tarea creada con éxito' : 'Actividad creada con éxito')
    }
    
    emit('saved', savedData)
    emit('close')
  } catch (error) {
    showError('Error al sincronizar la información')
    console.error('Submit Error:', error)
  } finally {
    loading.value = false
  }
}

const closeOnOutsideClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}


watch(() => props.activity, () => {
  populateForm()
}, { deep: true })

onMounted(() => {
  populateForm()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #CBD5E1;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoom-in-95 {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
}

@keyframes slide-in-from-top-2 {
  from { transform: translateY(-0.5rem); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-in {
  animation-fill-mode: forwards;
}
.fade-in {
  animation-name: fade-in;
}
.zoom-in-95 {
  animation-name: zoom-in-95;
}
.slide-in-from-top-2 {
  animation-name: slide-in-from-top-2;
}

/* Ocultar flecha nativa en IE/Edge */
select::-ms-expand {
  display: none;
}

/* Personalización básica para inputs de fecha */
input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  filter: invert(0.5);
  transition: opacity 0.2s;
}
input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
</style>
