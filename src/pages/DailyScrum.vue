<template>
  <div class="flex flex-col h-full min-h-0 relative">
    <div class="flex-1 min-h-0 overflow-y-auto space-y-12 p-1 custom-scrollbar">

      <!-- Main Content Container -->
      <div class="space-y-16 mt-6">
        
        <!-- Live Tracking Bar (Premium Glassmorphism) -->
        <div v-if="activeSessions.length > 0" class="relative group animate-in slide-in-from-top-4 duration-700">
          <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
          <div class="relative bg-white/60 backdrop-blur-xl border border-white shadow-2xl shadow-indigo-100/20 rounded-[2rem] p-6 flex items-center justify-between">
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-3 px-5 py-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
                <span class="relative flex h-2.5 w-2.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <span class="text-[11px] font-black text-white uppercase tracking-[0.2em]">Rastreo en Vivo</span>
              </div>
              
              <div class="flex -space-x-3">
                <div 
                  v-for="(session, idx) in activeSessions" 
                  :key="session.userId + idx"
                  class="relative group/avatar"
                >
                  <div class="w-12 h-12 rounded-2xl bg-slate-900 border-2 border-white shadow-xl flex items-center justify-center text-xs font-black text-white overflow-hidden transition-transform group-hover/avatar:-translate-y-1">
                    <img v-if="session.userPhoto || session.userAvatar" :src="session.userPhoto || session.userAvatar" class="w-full h-full object-cover" />
                    <span v-else>{{ session.userName?.charAt(0) || '?' }}</span>
                  </div>
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                  
                  <!-- Tooltip -->
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all whitespace-nowrap z-10 shadow-xl">
                    {{ session.userName }} - {{ session.taskTitle }}
                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              </div>
              
              <div class="hidden lg:block h-10 w-px bg-slate-200/60 mx-2"></div>
              
              <div class="hidden lg:flex flex-col">
                <span class="text-slate-800 font-black text-sm">{{ activeSessions.length }} Sesiones Activas</span>
                <span class="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Sincronización en tiempo real</span>
              </div>
            </div>
            
            <div class="hidden xl:flex items-center gap-8 pr-6">
              <div v-for="(session, idx) in activeSessions.slice(0, 2)" :key="'msg-'+idx" class="flex flex-col items-end animate-fade-in">
                <span class="text-indigo-600 font-black text-[10px] uppercase tracking-tighter">{{ session.userName }}</span>
                <span class="text-slate-500 text-xs font-medium italic truncate max-w-[200px]">"{{ session.taskTitle }}"</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Resumen Grid (Compact Executive View) -->
        <section class="space-y-8 pb-12">
          <div class="flex items-center justify-between bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div class="flex items-center gap-5">
              <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-100">
                <i class="fas fa-users-cog text-xl"></i>
              </div>
              <div class="space-y-0.5">
                <h2 class="text-2xl font-black text-slate-800 tracking-tight">Evolución del Equipo</h2>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  Monitoreo de eficiencia operativa
                </p>
              </div>
            </div>
            
            <button @click="openEmailModal" class="flex items-center gap-3 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all shadow-lg shadow-indigo-100 font-black text-[10px] uppercase tracking-widest group">
              <i class="fas fa-paper-plane group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
              Enviar Reporte
            </button>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div
              v-for="item in usersWithTasks"
              :key="item.user._id"
              class="group bg-white border border-slate-100 rounded-[2.5rem] p-2 flex flex-col shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500"
            >
              <div class="flex flex-col lg:flex-row gap-4 p-4">
                <!-- User Profile Section -->
                <div class="lg:w-[240px] flex lg:flex-col justify-between lg:justify-start gap-4">
                  <div class="flex items-center lg:items-start gap-4">
                    <div class="relative shrink-0">
                      <div class="w-14 h-14 rounded-2xl bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center text-white font-black text-lg overflow-hidden">
                        <img v-if="item.user.photo || item.user.avatar" :src="item.user.photo || item.user.avatar" class="w-full h-full object-cover" />
                        <span v-else>{{ item.user.name.charAt(0) }}</span>
                      </div>
                      <div v-if="isUserActive(item.user._id)" class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                    </div>
                    <div class="space-y-0.5 min-w-0">
                      <h3 class="text-slate-800 font-black text-sm tracking-tight truncate">{{ item.user.name }}</h3>
                      <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-black uppercase tracking-widest block w-fit">
                        {{ item.user.role || 'Consultor' }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="flex flex-col gap-2 mt-auto">
                    <div class="flex justify-between items-end">
                      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rendimiento</span>
                      <span class="text-xs font-black text-indigo-600">{{ calculateUserPerformance(item.tasks) }}%</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        class="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-1000" 
                        :style="{ width: `${calculateUserPerformance(item.tasks)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- Vertical Divider -->
                <div class="hidden lg:block w-px bg-slate-100 self-stretch my-2"></div>

                <!-- Activities Timeline Section -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-3 px-2">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Actividades del Día ({{ item.tasks.length }})</span>
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Carga: {{ formatSecondsToTime(calculateTotalTime(item.tasks)) }}</span>
                  </div>
                  
                  <div class="space-y-2 h-[130px] overflow-y-auto pr-2 custom-scrollbar-mini">
                    <div v-if="item.tasks.length === 0" class="flex flex-col items-center justify-center h-full text-slate-300">
                      <p class="text-[9px] font-black uppercase tracking-widest italic opacity-50">Sin actividad registrada</p>
                    </div>
                    
                    <div 
                      v-for="task in item.tasks" 
                      :key="task._id"
                      class="flex items-center gap-3 bg-slate-50/50 hover:bg-slate-50 p-2.5 rounded-xl border border-transparent hover:border-slate-100 transition-all group/task"
                    >
                      <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="task.activeSessions?.some((s: any) => (s.userId?._id || s.userId) === item.user._id) ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'"></div>
                      <div class="flex-1 min-w-0">
                        <h5 class="text-slate-700 text-[11px] font-bold truncate tracking-tight">{{ task.title }}</h5>
                        <div class="flex items-center gap-3 text-[9px] font-bold text-slate-400">
                           <span class="flex items-center gap-1"><i class="fas fa-clock text-[8px]"></i> {{ formatSecondsToTime(task.timeSpent || 0) }}</span>
                           <span v-if="task.completionPercentage" class="text-indigo-400">{{ task.completionPercentage }}% completo</span>
                        </div>
                      </div>
                      <div class="shrink-0 text-[10px] font-black text-slate-400 group-hover/task:text-indigo-500 transition-colors">
                        <i class="fas fa-chevron-right text-[8px]"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer Stats Row -->
              <div class="flex items-center justify-between px-6 py-3 bg-slate-50/50 border-t border-slate-100 rounded-b-[2.5rem]">
                <div class="flex items-center gap-6">
                  <div class="flex flex-col">
                    <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Actividad</span>
                    <span class="text-[10px] font-bold" :class="isUserActive(item.user._id) ? 'text-emerald-500' : 'text-slate-500'">
                      {{ isUserActive(item.user._id) ? 'Trabajando' : 'En pausa' }}
                    </span>
                  </div>
                </div>
                
                <div class="flex items-center gap-2">
                   <div v-for="n in 3" :key="n" class="w-1.5 h-1.5 rounded-full" :class="n <= Math.ceil(calculateUserPerformance(item.tasks)/33) ? 'bg-indigo-400' : 'bg-slate-200'"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>

    <!-- Modal de Envío de Reporte (Premium Redesign) -->
    <Teleport to="body">
      <div v-if="showEmailModal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-500">
        <div class="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-slate-200 relative overflow-hidden animate-in zoom-in-95 duration-500">
          <div class="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div class="text-center space-y-6 mb-10">
            <div class="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto border border-indigo-100 shadow-xl shadow-indigo-100/50">
              <i class="fas fa-paper-plane text-indigo-600 text-3xl"></i>
            </div>
            <div class="space-y-2">
              <h3 class="text-2xl font-black text-slate-800 tracking-tight">Despachar Reporte</h3>
              <p class="text-xs font-medium text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                Se enviará un sumario ejecutivo con el progreso, eficiencia y métricas clave de todo el equipo asignado.
              </p>
            </div>
          </div>
          
          <div class="space-y-8">
            <div class="group">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2 group-focus-within:text-indigo-600 transition-colors">Destinatario Principal</label>
              <div class="relative">
                <i class="fas fa-envelope absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400 transition-colors"></i>
                <input 
                  v-model="reportEmail" 
                  type="email" 
                  placeholder="admin@customertouch.pro"
                  class="w-full pl-14 pr-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-slate-800 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 shadow-inner"
                />
              </div>
            </div>
            
            <div class="flex gap-4">
              <button @click="showEmailModal = false" class="flex-1 px-6 py-5 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-100 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all">
                Cancelar
              </button>
              <button 
                @click="confirmSendReport" 
                :disabled="sendingEmail || !reportEmail"
                class="flex-[1.5] px-6 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95"
              >
                <div v-if="sendingEmail" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <i v-else class="fas fa-paper-plane text-xs"></i>
                {{ sendingEmail ? 'Procesando...' : 'Confirmar Envío' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { API_CONFIG } from '@/config/api'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'

const props = defineProps<{
  activities: any[]
}>()

const authStore = useAuthStore()
const { showSuccess, showError } = useNotifications()
const API_URL = API_CONFIG.BASE_URL.replace('/api', '')

const dailyTasks = computed(() => {
  return props.activities.filter((t: any) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const updated = new Date(t.updatedAt)
    const hasActive = t.activeSessions && t.activeSessions.length > 0
    const isInProgress = t.status === 'in-progress'
    const isTodayOrActive = updated >= today || hasActive || isInProgress
    
    // Filtrar si el asignado es un cliente
    const isAssignedToClient = Array.isArray(t.assignedTo) && t.assignedTo.some((u: any) => {
      const role = u.role?.toLowerCase() || ''
      return role.includes('client') || role.includes('cliente')
    })

    return isTodayOrActive && !isAssignedToClient
  })
})

const usersWithTasks = computed(() => {
  const grouped = new Map<string, { user: any, tasks: any[] }>()
  
  dailyTasks.value.forEach(task => {
    if (Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
      task.assignedTo.forEach(user => {
        const userId = typeof user === 'object' ? user._id : user
        if (!userId) return

        if (!grouped.has(userId)) {
          grouped.set(userId, { 
            user: typeof user === 'object' ? user : { _id: userId, name: 'Usuario' }, 
            tasks: [] 
          })
        }
        grouped.get(userId)!.tasks.push(task)
      })
    }
  })
  
  // Convert map to sorted array (by name)
  return Array.from(grouped.values()).sort((a, b) => a.user.name.localeCompare(b.user.name))
})

const activeSessions = computed(() => {
  const sessions: any[] = []
  dailyTasks.value.forEach(task => {
    if (task.activeSessions) {
      task.activeSessions.forEach((session: any) => {
        // Encontrar el usuario en la lista de asignados para obtener nombre/foto
        const userId = typeof session.userId === 'object' ? session.userId._id : session.userId
        const user = task.assignedTo?.find((u: any) => (u._id || u) === userId)
        
        sessions.push({
          ...session,
          userName: user?.name || 'Usuario',
          userPhoto: user?.photo || user?.avatar,
          taskTitle: task.title,
          taskId: task._id
        })
      })
    }
  })
  return sessions
})

const isUserActive = (userId: string) => {
  return activeSessions.value.some(s => (s.userId?._id || s.userId) === userId)
}

const sendingEmail = ref(false)
const showEmailModal = ref(false)
const reportEmail = ref('')

function openEmailModal() {
  reportEmail.value = authStore.user?.email || ''
  showEmailModal.value = true
}

async function confirmSendReport() {
  if (!reportEmail.value) return
  
  sendingEmail.value = true
  try {
    await axios.post(`${API_URL}/api/task-reports/send-daily-email`, {
      toEmail: reportEmail.value
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    showEmailModal.value = false
    showSuccess(`Reporte enviado exitosamente a ${reportEmail.value}`)
  } catch (error: any) {
    showError(error.response?.data?.error || 'Error al enviar el reporte.')
  } finally {
    sendingEmail.value = false
  }
}

const calculateUserPerformance = (tasks: any[]) => {
  if (tasks.length === 0) return 0
  const total = tasks.length
  const completedWeight = tasks.reduce((acc, t) => acc + (t.completionPercentage || 0), 0)
  return Math.round(completedWeight / total)
}

const formatSecondsToTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const calculateTotalTime = (tasks: any[]) => {
  return tasks.reduce((acc, t) => acc + (t.timeSpent || 0), 0)
}

</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.custom-scrollbar-mini::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar-mini::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar-mini::-webkit-scrollbar-thumb {
  background: #f1f5f9;
  border-radius: 10px;
}
.custom-scrollbar-mini::-webkit-scrollbar-thumb:hover {
  background: #e2e8f0;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoom-in-95 {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes slide-in-from-top-4 {
  from { transform: translateY(-1rem); opacity: 0; }
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
.slide-in-from-top-4 {
  animation-name: slide-in-from-top-4;
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
}

/* Glassmorphism utility */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
</style>
