<template>
  <div class="space-y-4">
    <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
      <i class="fas fa-clock text-primary-500 mr-2"></i>
      Tiempo Estimado
    </label>
    
    <!-- Botones rápidos predefinidos -->
    <div class="grid grid-cols-4 gap-2">
      <button
        type="button"
        v-for="preset in timePresets"
        :key="preset.value"
        @click="selectPreset(preset.value)"
        class="py-2.5 px-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 border"
        :class="modelValue === preset.value 
          ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-200 scale-105' 
          : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50 hover:border-slate-200'"
      >
        <i :class="preset.icon" class="mr-1.5 opacity-70"></i>
        {{ preset.label }}
      </button>
    </div>
    
    <!-- Divisor -->
    <div class="flex items-center gap-4">
      <div class="flex-1 h-px bg-slate-100"></div>
      <span class="text-[10px] font-bold text-slate-300 uppercase tracking-tighter italic">Personalizado</span>
      <div class="flex-1 h-px bg-slate-100"></div>
    </div>
    
    <!-- Entrada personalizada -->
    <div class="flex gap-4">
      <!-- Horas -->
      <div class="flex-1">
        <label class="block text-[10px] font-black text-slate-400 mb-1.5 uppercase">Horas</label>
        <div class="relative group">
          <input
            v-model.number="customHours"
            @input="updateCustomTime"
            type="number"
            min="0"
            max="100"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-sm"
            placeholder="0"
          />
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">h</span>
        </div>
      </div>
      
      <!-- Minutos -->
      <div class="flex-1">
        <label class="block text-[10px] font-black text-slate-400 mb-1.5 uppercase">Minutos</label>
        <div class="relative group">
          <select
            v-model.number="customMinutes"
            @change="updateCustomTime"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-sm appearance-none cursor-pointer"
          >
            <option value="0">0</option>
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="45">45</option>
          </select>
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase pointer-events-none">m</span>
        </div>
      </div>
    </div>
    
    <!-- Vista previa del tiempo seleccionado -->
    <div v-if="modelValue" class="bg-primary-50/50 rounded-2xl p-4 border border-primary-100 animate-fade-in shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-primary-100 shadow-sm">
            <i class="fas fa-stopwatch text-primary-500"></i>
          </div>
          <div>
            <span class="text-[10px] font-black text-primary-400 uppercase tracking-widest block">Seleccionado</span>
            <span class="text-sm text-primary-900 font-black">{{ modelValue }}</span>
          </div>
        </div>
        <button
          type="button"
          @click="clear"
          class="w-8 h-8 flex items-center justify-center bg-white text-slate-400 hover:text-red-500 rounded-lg transition-all border border-slate-100 hover:border-red-100 shadow-sm"
          title="Limpiar"
        >
          <i class="fas fa-times text-xs"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Props
interface Props {
  modelValue?: string
}
const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Reactive data
const customHours = ref(0)
const customMinutes = ref(0)

// Computed
const timePresets = [
  { value: '15 minutos', label: '15min', icon: 'fas fa-bolt' },
  { value: '30 minutos', label: '30min', icon: 'fas fa-clock' },
  { value: '1 hora', label: '1h', icon: 'fas fa-hourglass-half' },
  { value: '2 horas', label: '2h', icon: 'fas fa-hourglass-half' },
  { value: '4 horas', label: '4h', icon: 'fas fa-hourglass' },
  { value: '1 día', label: '1 día', icon: 'fas fa-calendar-day' },
  { value: '2 días', label: '2 días', icon: 'fas fa-calendar-alt' },
  { value: '1 semana', label: '1 sem', icon: 'fas fa-calendar-week' }
]

// Methods
const selectPreset = (value: string) => {
  emit('update:modelValue', value)
  
  // Actualizar campos personalizados basados en el preset
  updateCustomFieldsFromPreset(value)
}

const updateCustomFieldsFromPreset = (preset: string) => {
  switch (preset) {
    case '15 minutos':
      customHours.value = 0
      customMinutes.value = 15
      break
    case '30 minutos':
      customHours.value = 0
      customMinutes.value = 30
      break
    case '1 hora':
      customHours.value = 1
      customMinutes.value = 0
      break
    case '2 horas':
      customHours.value = 2
      customMinutes.value = 0
      break
    case '4 horas':
      customHours.value = 4
      customMinutes.value = 0
      break
    case '1 día':
      customHours.value = 8
      customMinutes.value = 0
      break
    case '2 días':
      customHours.value = 16
      customMinutes.value = 0
      break
    case '1 semana':
      customHours.value = 40
      customMinutes.value = 0
      break
    default:
      // Para valores personalizados, intentar parsearlo
      const match = preset.match(/(\d+)\s*(horas?|h)\s*(?:(\d+)\s*(minutos?|min))?/)
      if (match) {
        customHours.value = parseInt(match[1]) || 0
        customMinutes.value = parseInt(match[3]) || 0
      }
  }
}

const updateCustomTime = () => {
  const hours = customHours.value || 0
  const minutes = customMinutes.value || 0
  
  if (hours === 0 && minutes === 0) {
    emit('update:modelValue', '')
    return
  }
  
  let timeString = ''
  
  if (hours > 0) {
    timeString += `${hours} ${hours === 1 ? 'hora' : 'horas'}`
  }
  
  if (minutes > 0) {
    if (timeString) timeString += ' '
    timeString += `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  }
  
  emit('update:modelValue', timeString)
}

const clear = () => {
  emit('update:modelValue', '')
  customHours.value = 0
  customMinutes.value = 0
}

const getProgressWidth = (): string => {
  if (!props.modelValue) return '0%'
  
  // Convertir el tiempo a minutos para calcular el porcentaje
  const totalMinutes = getTotalMinutes(props.modelValue)
  
  // Escala: 0-15min = 0-25%, 15min-1h = 25-50%, 1h-8h = 50-75%, 8h+ = 75-100%
  if (totalMinutes <= 15) {
    return `${(totalMinutes / 15) * 25}%`
  } else if (totalMinutes <= 60) {
    return `${25 + ((totalMinutes - 15) / 45) * 25}%`
  } else if (totalMinutes <= 480) { // 8 horas
    return `${50 + ((totalMinutes - 60) / 420) * 25}%`
  } else {
    return `${75 + Math.min(((totalMinutes - 480) / 1440) * 25, 25)}%` // Max 100%
  }
}

const getProgressBarClass = (): string => {
  if (!props.modelValue) return 'bg-gray-500'
  
  const totalMinutes = getTotalMinutes(props.modelValue)
  
  if (totalMinutes <= 60) {
    return 'bg-green-500' // Verde para tareas rápidas
  } else if (totalMinutes <= 480) {
    return 'bg-yellow-500' // Amarillo para tareas medianas
  } else {
    return 'bg-red-500' // Rojo para tareas largas
  }
}

const getTotalMinutes = (timeString: string): number => {
  if (!timeString) return 0
  
  let totalMinutes = 0
  
  // Buscar horas
  const hoursMatch = timeString.match(/(\d+)\s*(?:horas?|h)/)
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1]) * 60
  }
  
  // Buscar minutos
  const minutesMatch = timeString.match(/(\d+)\s*(?:minutos?|min)/)
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1])
  }
  
  // Buscar días
  const daysMatch = timeString.match(/(\d+)\s*(?:días?|día)/)
  if (daysMatch) {
    totalMinutes += parseInt(daysMatch[1]) * 8 * 60 // 8 horas por día
  }
  
  // Buscar semanas
  const weeksMatch = timeString.match(/(\d+)\s*(?:semanas?|sem)/)
  if (weeksMatch) {
    totalMinutes += parseInt(weeksMatch[1]) * 5 * 8 * 60 // 5 días x 8 horas por semana
  }
  
  return totalMinutes
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue && !timePresets.some(preset => preset.value === newValue)) {
    updateCustomFieldsFromPreset(newValue)
  }
}, { immediate: true })
</script>

<style scoped>
/* Animaciones para los botones de preset */
button {
  transform: scale(1);
}

button:active {
  transform: scale(0.95);
}

/* Animación suave para la barra de progreso */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Efectos hover para los inputs */
input:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}
</style>
