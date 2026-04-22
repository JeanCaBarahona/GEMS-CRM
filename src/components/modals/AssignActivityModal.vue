<template>
  <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300" @click="closeOnOutsideClick">
    <div class="bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-md animate-in zoom-in-95 duration-300 overflow-hidden" @click.stop>
      <!-- Header -->
      <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center border border-primary-200 shadow-sm">
            <i class="fas fa-user-check text-primary-600"></i>
          </div>
          <div>
            <h2 class="text-lg font-black text-slate-900 tracking-tight">Asignar Actividad</h2>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Control de responsabilidades</p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="p-8">
        <!-- Información de la actividad -->
        <div class="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
              <i class="fas fa-tasks text-primary-500"></i>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-slate-900 font-black text-sm truncate mb-1">{{ activity?.title }}</h3>
              <p class="text-slate-500 text-xs line-clamp-2 leading-relaxed font-medium">{{ activity?.description }}</p>
              
              <!-- Metadata tags -->
              <div class="mt-4 flex flex-wrap gap-3">
                <div class="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                  <i class="fas fa-calendar-alt text-primary-400"></i>
                  <span>{{ formatDate(activity?.date || '') }}</span>
                </div>
                <div v-if="activity?.priority" 
                  class="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-black uppercase tracking-tighter"
                  :class="{
                    'text-emerald-600': activity.priority === 'low',
                    'text-blue-600': activity.priority === 'medium',
                    'text-orange-600': activity.priority === 'high',
                    'text-red-600': activity.priority === 'urgent'
                  }">
                  <i class="fas fa-exclamation-circle"></i>
                  <span>{{ getPriorityLabel(activity.priority) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Alerta de asignación actual -->
        <div v-if="activity?.assignedToUser" class="mb-6 p-4 bg-primary-50 border border-primary-100 rounded-2xl flex items-center gap-3">
            <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-primary-100 shadow-sm flex-shrink-0">
               <i class="fas fa-info text-primary-500 text-xs"></i>
            </div>
            <p class="text-xs text-primary-900 font-bold leading-relaxed">
              Actualmente asignada a <span class="text-primary-600 font-black">{{ activity.assignedToUser.name }}</span>
            </p>
        </div>

        <!-- Selector de miembro -->
        <div class="space-y-3">
          <label class="block text-xs font-black text-slate-700 uppercase tracking-widest">
            Seleccionar Responsable
          </label>
          <div class="relative group">
            <select
              v-model="selectedAssignee"
              class="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-bold appearance-none cursor-pointer shadow-sm"
            >
              <option value="">Sin asignar (Eliminar responsable)</option>
              <option v-for="member in teamMembers" :key="member._id" :value="member._id">
                {{ member.name }} — {{ member.role }}
              </option>
            </select>
            <div class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
              <i class="fas fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>

        <!-- Preview del miembro seleccionado -->
        <div v-if="selectedMember" class="mt-6 p-5 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
          <div class="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0 shadow-sm">
            <img v-if="selectedMember.photo || selectedMember.avatar" :src="selectedMember.photo || selectedMember.avatar" class="w-full h-full object-cover">
            <div v-else class="w-full h-full flex items-center justify-center text-primary-500 text-xl font-black">
              {{ selectedMember.name.charAt(0) }}
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-slate-900 font-black text-base truncate">{{ selectedMember.name }}</h4>
            <p class="text-slate-400 font-bold text-xs uppercase tracking-widest">{{ selectedMember.role }}</p>
            <div v-if="selectedMember.department" class="mt-1 inline-flex items-center px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-black uppercase tracking-tighter">
              {{ selectedMember.department }}
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex items-center gap-4 mt-10">
          <button
            @click="$emit('close')"
            class="flex-1 px-6 py-4 bg-white text-slate-500 hover:text-slate-900 border border-slate-100 rounded-2xl transition-all font-black text-xs uppercase tracking-widest hover:bg-slate-50 active:scale-95"
          >
            Cancelar
          </button>
          <button
            @click="handleAssign"
            :disabled="loading || !hasChanges"
            class="flex-[1.5] px-6 py-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-200 flex items-center justify-center gap-3 active:scale-95"
          >
            <div v-if="loading" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <i v-else class="fas fa-user-plus text-sm"></i>
            {{ loading ? 'Sincronizando...' : 'Confirmar Asignación' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ActivityData } from '../../services/activityService'
import type { TeamMember } from '../../types'

interface Props {
  activity: ActivityData | null
  teamMembers: TeamMember[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  assign: [assigneeId: string | null]
}>()

const loading = ref(false)
const selectedAssignee = ref('')

const selectedMember = computed(() => {
  if (!selectedAssignee.value) return null
  return props.teamMembers.find(member => member._id === selectedAssignee.value)
})

const hasChanges = computed(() => {
  const currentAssigneeId = props.activity?.assignedTo || ''
  return selectedAssignee.value !== currentAssigneeId
})

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getPriorityLabel = (priority: string) => {
  const labels = {
    low: 'Baja',
    medium: 'Media', 
    high: 'Alta',
    urgent: 'Urgente'
  }
  return labels[priority as keyof typeof labels] || 'Media'
}

const handleAssign = () => {
  if (!hasChanges.value) return
  
  loading.value = true
  emit('assign', selectedAssignee.value || null)
  
  // El loading se desactiva desde el componente padre
  setTimeout(() => {
    loading.value = false
  }, 2000)
}

const closeOnOutsideClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

onMounted(() => {
  // Establecer el valor actual de asignación
  selectedAssignee.value = props.activity?.assignedTo || ''
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

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
