<template>
  <div class="flex flex-col h-full min-h-0 relative bg-slate-950">
    <div class="flex-1 min-h-0 overflow-y-auto space-y-8 p-8 custom-scrollbar">
      
      <!-- Header Section with Glassmorphism -->
      <div class="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div class="relative flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <i class="fas fa-chart-line text-white text-xl"></i>
              </div>
              <h1 class="text-3xl font-black text-white tracking-tight">Daily Scrum <span class="text-indigo-500 text-sm font-bold ml-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 uppercase tracking-widest">Live</span></h1>
            </div>
            <p class="text-slate-400 text-sm font-medium ml-15">Monitoreo de pulso en tiempo real y rendimiento del equipo.</p>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <!-- Selector de Departamento -->
            <div class="relative group">
              <i class="fas fa-users absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"></i>
              <select
                v-model="selectedDepartment"
                @change="loadDailyTasks"
                class="pl-11 pr-10 py-3 bg-slate-800/50 border border-slate-700 rounded-2xl text-white font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">Todos los Equipos</option>
                <option value="TI">Equipo TI</option>
                <option value="MARKETING">Marketing</option>
                <option value="VENTAS">Ventas</option>
                <option value="SOPORTE">Soporte</option>
              </select>
            </div>

            <!-- Botón de Acción -->
            <button
              @click="sendEmailReport"
              :disabled="sendingEmail"
              class="px-8 py-3 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center gap-3 disabled:opacity-50"
            >
              <i class="fas fa-paper-plane" :class="{'fa-spinner fa-spin': sendingEmail}"></i>
              {{ sendingEmail ? 'Enviando...' : 'Exportar Reporte' }}
            </button>
          </div>
        </div>

        <!-- Mini Stats Grid -->
        <div class="relative grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800/50">
          <div v-for="stat in summaryStats" :key="stat.label" class="p-4 rounded-2xl bg-slate-950/30 border border-slate-800/50">
            <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{{ stat.label }}</div>
            <div class="text-xl font-black text-white">{{ stat.value }}<span class="text-xs text-slate-500 ml-1 font-bold">{{ stat.suffix }}</span></div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24 space-y-4">
        <div class="w-16 h-16 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
        <p class="text-slate-500 font-black text-xs uppercase tracking-[0.3em]">Sincronizando pulso...</p>
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-12">
        
        <!-- Live Tracking Section -->
        <section class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-3">
              <span class="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              En Ejecución Ahora
            </h2>
            <span class="text-[10px] font-bold text-slate-600">{{ activeTasks.length }} miembros activos</span>
          </div>
          
          <div v-if="activeTasks.length === 0" class="bg-slate-900/20 border border-dashed border-slate-800 rounded-[2rem] py-12 flex flex-col items-center justify-center text-slate-600">
            <i class="fas fa-ghost text-3xl mb-4 opacity-20"></i>
            <p class="text-sm font-bold italic">No hay timers activos en este momento.</p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div 
              v-for="task in activeTasks" 
              :key="task._id"
              class="bg-slate-900 border border-green-500/30 rounded-[2rem] p-6 shadow-2xl shadow-green-500/5 relative overflow-hidden group"
            >
              <div class="absolute top-0 right-0 p-4">
                <i class="fas fa-play-circle text-green-500 animate-pulse"></i>
              </div>
              <div class="flex items-center gap-4 mb-6">
                <div class="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <span class="text-green-500 font-black text-lg">{{ task.assignedTo?.name?.charAt(0) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-white font-black text-sm truncate">{{ task.assignedTo?.name }}</h4>
                  <p class="text-green-500/70 text-[10px] font-bold uppercase tracking-widest">{{ task.assignedTo?.department || 'TI' }}</p>
                </div>
              </div>
              <div class="space-y-2">
                <p class="text-slate-400 text-xs font-medium leading-relaxed line-clamp-2">Trabajando en: <span class="text-white font-bold">{{ task.title }}</span></p>
                <div class="pt-4 flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                  <span>Inició: {{ formatTime(task.activeSessions[0].startTime) }}</span>
                  <span class="text-green-500">Activo</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Team Grid -->
        <section class="space-y-6">
          <h2 class="text-sm font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-3">
            <i class="fas fa-layer-group text-indigo-500"></i>
            Resumen por Integrante
          </h2>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div
              v-for="(userTasks, userName) in tasksByUser"
              :key="userName"
              class="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-xl"
            >
              <div class="bg-slate-800/30 px-8 py-6 border-b border-slate-800/50 flex justify-between items-center">
                <div class="flex items-center gap-4">
                   <div class="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-sm shadow-inner">
                    {{ userName.charAt(0) }}
                  </div>
                  <div>
                    <h3 class="text-white font-black text-base">{{ userName }}</h3>
                    <p class="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{{ userTasks[0]?.assignedTo?.role || 'Developer' }}</p>
                  </div>
                </div>
                <div class="px-4 py-1.5 bg-slate-950 rounded-full border border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {{ userTasks.length }} Tareas
                </div>
              </div>
              
              <div class="p-8 space-y-6 flex-1">
                <div v-if="userTasks.length === 0" class="flex flex-col items-center justify-center py-8 text-slate-600 opacity-50">
                  <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                  <p class="text-xs font-black uppercase tracking-widest">Sin actividad hoy</p>
                </div>
                
                <div v-else class="space-y-6">
                  <div 
                    v-for="task in userTasks" 
                    :key="task._id"
                    class="group relative"
                  >
                    <div class="flex justify-between items-end mb-3">
                      <div class="space-y-1 flex-1 min-w-0 pr-4">
                        <div class="flex items-center gap-2">
                          <span 
                            class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter"
                            :class="getStatusBadgeClass(task.boardStatus)"
                          >
                            {{ task.boardStatus }}
                          </span>
                          <span class="text-slate-500 text-[9px] font-bold">#{{ task._id.slice(-4) }}</span>
                        </div>
                        <h5 class="text-white text-sm font-bold group-hover:text-indigo-400 transition-colors truncate">{{ task.title }}</h5>
                      </div>
                      <div class="text-right">
                        <span class="text-xl font-black text-white">{{ task.completionPercentage || 0 }}<span class="text-xs text-slate-500 ml-0.5">%</span></span>
                      </div>
                    </div>
                    
                    <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                      <div 
                        class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/20" 
                        :style="{ width: `${task.completionPercentage || 0}%` }"
                      ></div>
                    </div>
                    
                    <div class="mt-3 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <div class="flex items-center gap-4">
                        <span class="flex items-center gap-1"><i class="fas fa-clock text-slate-700"></i> {{ Number(task.actualHours || 0).toFixed(1) }}h Reales</span>
                        <span v-if="task.type" class="text-slate-600">{{ task.type }}</span>
                      </div>
                      <span class="group-hover:text-slate-400 transition-colors">Actualizado {{ formatRelative(task.updatedAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="px-8 py-4 bg-slate-950/50 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span class="text-slate-600">Productividad Diaria</span>
                <span class="text-indigo-500">{{ calculateUserPerformance(userTasks) }}% Eficiencia</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { API_CONFIG } from '@/config/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const API_URL = API_CONFIG.BASE_URL.replace('/api', '')

const loading = ref(true)
const sendingEmail = ref(false)
const selectedDepartment = ref('')
const dailyTasks = ref<any[]>([])

const config = computed(() => ({
  headers: {
    Authorization: `Bearer ${authStore.token}`
  }
}))

const activeTasks = computed(() => {
  return dailyTasks.value.filter(t => t.activeSessions && t.activeSessions.length > 0)
})

const summaryStats = computed(() => {
  const total = dailyTasks.value.length
  const active = activeTasks.value.length
  const avgProgress = total > 0 
    ? Math.round(dailyTasks.value.reduce((acc, t) => acc + (t.completionPercentage || 0), 0) / total) 
    : 0
  const totalHours = dailyTasks.value.reduce((acc, t) => acc + (t.actualHours || 0), 0).toFixed(1)

  return [
    { label: 'Tareas Hoy', value: total, suffix: 'items' },
    { label: 'En Ejecución', value: active, suffix: 'miembros' },
    { label: 'Progreso Promedio', value: avgProgress, suffix: '%' },
    { label: 'Inversión Tiempo', value: totalHours, suffix: 'horas' }
  ]
})

const tasksByUser = computed(() => {
  const grouped: Record<string, any[]> = {}
  
  dailyTasks.value.forEach(task => {
    const userName = task.assignedTo?.name || 'Sin Asignar'
    if (!grouped[userName]) {
      grouped[userName] = []
    }
    grouped[userName].push(task)
  })
  
  return grouped
})

async function loadDailyTasks() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (selectedDepartment.value) {
      params.append('department', selectedDepartment.value)
    }
    const response = await axios.get(`${API_URL}/api/tasks?${params.toString()}`, config.value)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    dailyTasks.value = response.data.filter((t: any) => {
      const updated = new Date(t.updatedAt)
      const hasActive = t.activeSessions && t.activeSessions.length > 0
      return updated >= today || hasActive
    })
    
  } catch (error) {
    console.error('Error loading daily tasks:', error)
  } finally {
    loading.value = false
  }
}

async function sendEmailReport() {
  const email = prompt('¿A qué correo deseas enviar este reporte?', authStore.user?.email || '')
  if (!email) return
  
  sendingEmail.value = true
  try {
    await axios.post(`${API_URL}/api/taskReports/send-daily-email`, {
      department: selectedDepartment.value,
      toEmail: email
    }, config.value)
    alert(`Reporte enviado exitosamente a ${email}`)
  } catch (error: any) {
    alert(error.response?.data?.error || 'Error al enviar el reporte.')
  } finally {
    sendingEmail.value = false
  }
}

const getStatusBadgeClass = (status: string) => {
  const classes: any = {
    'backlog': 'bg-slate-800 text-slate-400 border border-slate-700',
    'todo': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    'in-progress': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    'review': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    'done': 'bg-green-500/10 text-green-400 border border-green-500/20'
  }
  return classes[status] || classes['backlog']
}

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const formatRelative = (date: string) => {
  const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000 / 60)
  if (diff < 1) return 'ahora'
  if (diff < 60) return `hace ${diff}m`
  if (diff < 1440) return `hace ${Math.floor(diff/60)}h`
  return `hace ${Math.floor(diff/1440)}d`
}

const calculateUserPerformance = (tasks: any[]) => {
  if (tasks.length === 0) return 0
  const avgProgress = tasks.reduce((acc, t) => acc + (t.completionPercentage || 0), 0) / tasks.length
  return Math.round(avgProgress)
}

onMounted(() => {
  loadDailyTasks()
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
  background: #1e293b;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #334155;
}

.ml-15 { margin-left: 3.75rem; }

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}
</style>
