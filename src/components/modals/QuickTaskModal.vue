<template>
  <div class="fixed -inset-1 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300" @click.self="$emit('close')">
    <div class="bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-md animate-in zoom-in-95 duration-300 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center border border-indigo-200 shadow-sm transition-transform hover:scale-105">
            <i class="fas fa-bolt text-indigo-600"></i>
          </div>
          <div>
            <h3 class="text-lg font-black text-slate-900 tracking-tight">Tarea Rápida</h3>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Creación instantánea</p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-8">
        <div class="space-y-6">
          <!-- Título -->
          <div class="group">
            <label class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-3 group-focus-within:text-primary-600 transition-colors">
              ¿Qué necesitas hacer? <span class="text-primary-500">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              ref="titleInput"
              class="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-bold shadow-sm"
              placeholder="Ej: Llamar a cliente nuevo"
              required
            />
          </div>

          <!-- Descripción (opcional) -->
          <div class="group">
            <label class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-3">
              Contexto adicional <span class="text-slate-400 font-bold lowercase tracking-normal">(opcional)</span>
            </label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none text-sm font-medium leading-relaxed shadow-sm"
              placeholder="Detalles sobre esta tarea..."
            ></textarea>
          </div>

          <!-- Información automática -->
          <div class="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 shadow-inner">
            <h4 class="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i class="fas fa-magic text-indigo-400"></i>
              Pre-configuración inteligente
            </h4>
            <div class="space-y-3">
              <div class="flex justify-between items-center bg-white/60 p-2 rounded-lg border border-white">
                <span class="text-[11px] font-bold text-slate-500 flex items-center gap-2"><i class="fas fa-calendar-day text-indigo-300"></i> Fecha ejecución:</span>
                <span class="text-xs font-black text-slate-800 uppercase tracking-tighter">{{ formatDate(selectedDate) }}</span>
              </div>
              <div class="flex justify-between items-center bg-white/60 p-2 rounded-lg border border-white">
                <span class="text-[11px] font-bold text-slate-500 flex items-center gap-2"><i class="fas fa-hourglass-end text-orange-300"></i> Fecha Límite:</span>
                <span class="text-xs font-black text-slate-800 uppercase tracking-tighter">{{ formatDate(dueDate) }}</span>
              </div>
              <div class="flex justify-between items-center bg-white/60 p-2 rounded-lg border border-white">
                <span class="text-[11px] font-bold text-slate-500 flex items-center gap-2"><i class="fas fa-user-circle text-indigo-300"></i> Responsable:</span>
                <span class="text-xs font-black text-slate-800 uppercase tracking-tighter">{{ currentUser?.name || 'Propietario' }}</span>
              </div>
            </div>
          </div>

          <!-- Prioridad rápida -->
          <div>
            <label class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-3">Prioridad</label>
            <div class="flex gap-2">
              <button
                type="button"
                v-for="priority in priorities"
                :key="priority.value"
                @click="form.priority = priority.value as 'low' | 'medium' | 'high' | 'urgent'"
                class="flex-1 py-3 px-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border"
                :class="form.priority === priority.value 
                  ? priority.activeClass + ' ring-4 ring-offset-1 shadow-md' 
                  : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'"
              >
                {{ priority.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex items-center gap-4 mt-10 pt-6 border-t border-slate-100">
          <button
            @click="$emit('close')"
            class="flex-1 px-6 py-4 bg-white text-slate-500 hover:text-slate-900 border border-slate-100 rounded-2xl transition-all font-black text-xs uppercase tracking-widest hover:bg-slate-50 active:scale-95"
          >
            Cerrar
          </button>
          
          <button
            type="submit"
            :disabled="!form.title.trim() || loading"
            class="flex-[1.5] px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95"
          >
            <div v-if="loading" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <i v-else class="fas fa-bolt text-sm"></i>
            {{ loading ? 'Sincronizando...' : 'Crear Actividad' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

// Props
interface Props {
  selectedDate: Date
}
const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  create: [taskData: any]
}>()

// Composables
const authStore = useAuthStore()

// Reactive data
const loading = ref(false)
const titleInput = ref<HTMLInputElement>()

const form = ref({
  title: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
})

// Computed
const currentUser = computed(() => authStore.user)

const dueDate = computed(() => {
  const date = new Date(props.selectedDate)
  date.setDate(date.getDate() + 2) // 2 días después
  return date
})

const priorities = [
  { value: 'low', label: 'Baja', activeClass: 'bg-emerald-500 text-white border-emerald-500 ring-emerald-500/20' },
  { value: 'medium', label: 'Media', activeClass: 'bg-blue-500 text-white border-blue-500 ring-blue-500/20' },
  { value: 'high', label: 'Alta', activeClass: 'bg-orange-600 text-white border-orange-600 ring-orange-500/20' },
  { value: 'urgent', label: 'Urgente', activeClass: 'bg-red-600 text-white border-red-600 ring-red-500/20' }
]

// Methods
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleSubmit = async () => {
  if (!form.value.title.trim()) return

  loading.value = true
  
  try {
    const taskData = {
      title: form.value.title.trim(),
      description: form.value.description.trim() || `Tarea creada rápidamente para ${formatDate(props.selectedDate)}`,
      date: props.selectedDate.toISOString(),
      dueDate: dueDate.value.toISOString(),
      status: 'pending',
      priority: form.value.priority,
      assignedTo: currentUser.value?._id || null,
      clientId: null, // Se asignará después
      estimatedTime: '2 horas', // Tiempo por defecto
      createdBy: currentUser.value?._id || null
    }
    
    emit('create', taskData)
  } catch (error) {
    console.error('Error creating quick task:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  titleInput.value?.focus()
})
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoom-in-95 {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
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
</style>
