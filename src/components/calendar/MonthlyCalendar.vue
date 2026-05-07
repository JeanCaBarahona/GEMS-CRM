<template>
  <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
    <!-- Header del calendario -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        <button
          @click="previousMonth"
          class="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <i class="fas fa-chevron-left text-xs"></i>
        </button>
        
        <h2 class="text-lg font-black text-slate-800 tracking-tight">
          {{ currentMonthName }} {{ currentYear }}
        </h2>
        
        <button
          @click="nextMonth"
          class="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <i class="fas fa-chevron-right text-xs"></i>
        </button>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- Botón para ir al mes actual -->
        <button
          @click="goToCurrentMonth"
          class="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all text-xs font-bold shadow-sm flex items-center"
        >
          <i class="fas fa-calendar-day mr-2 text-[10px]"></i>
          Hoy
        </button>
        
        <!-- Botón para alternar vista -->
        <button
          @click="toggleView"
          class="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-xs font-bold shadow-sm flex items-center"
        >
          <i class="fas fa-eye mr-2 text-[10px]"></i>
          {{ showTasks ? 'Ocultar' : 'Ver' }}
        </button>
      </div>
    </div>

    <!-- Días de la semana -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div
        v-for="day in weekDays"
        :key="day"
        class="p-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendario -->
    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="min-h-[120px] border border-slate-200 rounded-lg p-2 relative transition-all duration-300"
        :class="[
          getDayClasses(day),
          (day.date.getDay() === 0 || day.date.getDay() === 6) ? 'bg-slate-50/50' : ''
        ]"
      >
        <!-- Número del día -->
        <div class="flex justify-between items-center mb-1">
          <span
            class="text-[11px]"
            :class="day.isCurrentMonth ? 'text-slate-800 font-black' : 'text-slate-300 font-bold'"
          >
            {{ day.date.getDate() }}
          </span>
          
          <div class="flex items-center gap-1.5">
            <!-- Botón agregar minimalista -->
            <button
              v-if="day.isCurrentMonth"
              @click.stop="addQuickTask(day.date)"
              class="w-5 h-5 flex items-center justify-center rounded-md text-slate-300 hover:text-primary-600 hover:bg-primary-50 transition-all opacity-0 group-hover:opacity-100"
              title="Agregar tarea"
            >
              <i class="fas fa-plus text-[8px]"></i>
            </button>

            <!-- Indicador de hoy -->
            <div
              v-if="isToday(day.date)"
              class="w-1.5 h-1.5 bg-primary-500 rounded-full"
            ></div>
          </div>
        </div>

        <!-- Tareas del día -->
        <div v-if="showTasks && day.isCurrentMonth" class="space-y-0.5">
          <div
            v-for="activity in getActivitiesForDay(day.date).slice(0, 3)"
            :key="activity._id"
            class="px-1.5 py-0.5 rounded-md text-[9px] cursor-pointer border-l-2 hover:translate-x-0.5 transition-all duration-200 group/task truncate"
            :class="getActivityClasses(activity)"
            @dblclick="viewActivity(activity)"
            :title="`${activity.title} - ${getAssignedToName(activity)} (Doble clic para abrir)`"
          >
            <span class="font-black truncate block">{{ activity.title }}</span>
          </div>
          
          <!-- Indicador de más tareas con Popover -->
          <div 
            v-if="getActivitiesForDay(day.date).length > 3"
            class="mt-1"
          >
            <button 
              @click.stop="expandedDay = day.date"
              class="text-[8px] font-black text-primary-600 hover:text-primary-700 pl-1.5 py-0.5 uppercase tracking-tighter hover:bg-primary-50 rounded transition-colors w-full text-left"
            >
              +{{ getActivitiesForDay(day.date).length - 3 }} más
            </button>
          </div>
        </div>

        <!-- Popover de "Ver más" -->
        <div 
          v-if="expandedDay && expandedDay.getTime() === day.date.getTime()"
          class="absolute inset-0 z-[60] bg-white shadow-2xl rounded-xl border border-primary-200 p-2 flex flex-col animate-in zoom-in-95 duration-200"
        >
          <div class="flex items-center justify-between mb-2 border-b border-slate-100 pb-1">
            <span class="text-[10px] font-black text-slate-800 uppercase tracking-widest">{{ day.date.getDate() }} {{ currentMonthName }}</span>
            <button @click.stop="expandedDay = null" class="text-slate-400 hover:text-rose-500 transition-colors">
              <i class="fas fa-times text-[10px]"></i>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto space-y-1 custom-scrollbar-slim pr-1">
            <div
              v-for="activity in getActivitiesForDay(day.date)"
              :key="'exp-' + activity._id"
              class="px-1.5 py-1 rounded-md text-[9px] cursor-pointer border-l-2 hover:bg-slate-50 transition-all truncate"
              :class="getActivityClasses(activity)"
              @dblclick="viewActivity(activity); expandedDay = null"
              :title="activity.title"
            >
              <span class="font-black truncate block">{{ activity.title }}</span>
            </div>
          </div>
        </div>

        <!-- Contador de tareas cuando no se muestran -->
        <div
          v-else-if="!showTasks && day.isCurrentMonth && getActivitiesForDay(day.date).length > 0"
          class="absolute bottom-2 right-2"
        >
          <span class="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            {{ getActivitiesForDay(day.date).length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Leyenda -->
    <div class="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-100">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-amber-500 rounded"></div>
        <span class="text-xs font-bold text-slate-600 tracking-wide uppercase">Pendiente</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-emerald-500 rounded"></div>
        <span class="text-xs font-bold text-slate-600 tracking-wide uppercase">Completada</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-rose-500 rounded"></div>
        <span class="text-xs font-bold text-slate-600 tracking-wide uppercase">Cancelada</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-orange-500 rounded"></div>
        <span class="text-xs font-bold text-slate-600 tracking-wide uppercase">Vencida</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Activity, TeamMember } from '../../types'

// Props
interface Props {
  activities: Activity[]
  clients: any[]
  teamMembers: TeamMember[]
}
const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  quickTask: [date: Date]
  viewActivity: [activity: Activity]
}>()

// Reactive data
const currentDate = ref(new Date())
const showTasks = ref(true)
const expandedDay = ref<Date | null>(null)

// Computed
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const currentMonthName = computed(() => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[currentMonth.value]
})

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  
  // Primer día del mes
  const firstDay = new Date(year, month, 1)
  // Último día del mes
  const lastDay = new Date(year, month + 1, 0)
  
  // Días que necesitamos mostrar del mes anterior
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  // Días que necesitamos mostrar del mes siguiente
  const endDate = new Date(lastDay)
  const remainingDays = 6 - lastDay.getDay()
  endDate.setDate(endDate.getDate() + remainingDays)
  
  const days = []
  const currentDay = new Date(startDate)
  
  while (currentDay <= endDate) {
    days.push({
      date: new Date(currentDay),
      isCurrentMonth: currentDay.getMonth() === month
    })
    currentDay.setDate(currentDay.getDate() + 1)
  }
  
  return days
})

// Methods
const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const goToCurrentMonth = () => {
  currentDate.value = new Date()
}

const toggleView = () => {
  showTasks.value = !showTasks.value
}

const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const getDayClasses = (day: any) => {
  const classes = ['group transition-all duration-300']
  
  if (!day.isCurrentMonth) {
    classes.push('opacity-30 bg-slate-50/50 border-slate-100')
  } else {
    classes.push('bg-white')
  }
  
  if (isToday(day.date)) {
    classes.push('ring-1 ring-primary-400 ring-inset border-primary-100 bg-primary-50/10')
  } else if (day.isCurrentMonth) {
    classes.push('hover:bg-slate-50/50 hover:border-slate-300')
  }
  
  return classes.join(' ')
}

const getActivitiesForDay = (date: Date): Activity[] => {
  const dayOfWeek = date.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  // Si es fin de semana, no mostramos tareas laborales
  if (isWeekend) return []

  return props.activities.filter(activity => {
    // Fecha de inicio (normalizada a las 00:00)
    const startDate = new Date(activity.date)
    startDate.setHours(0, 0, 0, 0)
    
    // Fecha de fin (si no existe, usamos la de inicio)
    const endDate = activity.dueDate ? new Date(activity.dueDate) : new Date(activity.date)
    endDate.setHours(23, 59, 59, 999)
    
    // La actividad debe estar en el rango y el día actual debe ser laborable
    return date >= startDate && date <= endDate
  })
}

const getActivityClasses = (activity: Activity) => {
  const baseClasses = 'bg-white'
  
  switch (activity.status) {
    case 'pending':
      const isOverdue = new Date(activity.dueDate || activity.date) < new Date()
      return isOverdue 
        ? `${baseClasses} border-rose-500 text-rose-700 hover:bg-rose-50`
        : `${baseClasses} border-amber-500 text-amber-700 hover:bg-amber-50`
    case 'in-progress':
      return `${baseClasses} border-blue-500 text-blue-700 hover:bg-blue-50`
    case 'completed':
      return `${baseClasses} border-emerald-500 text-emerald-700 hover:bg-emerald-50`
    case 'cancelled':
      return `${baseClasses} border-slate-300 text-slate-500 hover:bg-slate-50`
    default:
      return `${baseClasses} border-slate-400 text-slate-600 hover:bg-slate-50`
  }
}

const getClientName = (clientData: any): string => {
  if (!clientData) return 'Sin cliente'
  if (typeof clientData === 'object' && clientData.name) return clientData.name
  if (typeof clientData === 'string') {
    const client = props.clients.find(c => c._id === clientData)
    return client ? client.name : 'Cliente no encontrado'
  }
  return 'Sin cliente'
}

const getAssignedToName = (activity: Activity): string => {
  if (!activity || !activity.assignedTo || activity.assignedTo.length === 0) return 'Sin asignar'
  
  // Si assignedTo es un array
  if (Array.isArray(activity.assignedTo)) {
    const firstUser = activity.assignedTo[0]
    
    // Si es un string (ID), buscar en teamMembers
    if (typeof firstUser === 'string') {
      const member = props.teamMembers.find(m => m._id === firstUser)
      return member?.name || 'Sin asignar'
    }
    
    // Si es un objeto completo de usuario
    if (firstUser && typeof firstUser === 'object' && 'name' in firstUser) {
      return (firstUser as any).name
    }
  }
  
  return 'Sin asignar'
}

const addQuickTask = (date: Date) => {
  emit('quickTask', date)
}

const viewActivity = (activity: Activity) => {
  emit('viewActivity', activity)
}
</script>

<style scoped>
/* Animaciones suaves */
.transition-colors {
  transition: all 0.2s ease;
}

/* Hover effects para las tareas */
/* Personalización de scrollbar para el popover */
.custom-scrollbar-slim::-webkit-scrollbar {
  width: 3px;
}

.custom-scrollbar-slim::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar-slim::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 10px;
}

.custom-scrollbar-slim::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
