<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <!-- Modal content -->
    <div class="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl border border-blue-500/20 shadow-2xl relative z-10 animate-fadeIn">
      <!-- Header -->
      <div class="flex items-center justify-between p-5 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-blue-700/30">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-white">Notificador de Tareas</h2>
        </div>
        <button title="Cerrar" 
          @click="$emit('close')"
          class="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-5">
        <!-- Incrustar componente de notificador -->
        <TaskNotifierEmbed :activities="activities" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted, onUnmounted, defineEmits, watch } from 'vue'
import TaskNotifierEmbed from '../notifications/TaskNotifierEmbed.vue'
import axios from 'axios'

// Props para actividades o función para cargarlas
const props = defineProps({
  preloadedActivities: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])
const activities = ref(props.preloadedActivities || [])

// Cargar actividades al montar el componente
onMounted(async () => {
  document.body.style.overflow = 'hidden' // Prevent scrolling behind modal
  await loadActivities()
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

// Cargar actividades si no se proporcionaron
async function loadActivities() {
  if (activities.value.length === 0) {
    try {
      const response = await axios.get('/api/activities')
      activities.value = response.data.activities || []
    } catch (error) {
      console.error('Error cargando actividades:', error)
    }
  }
}

// Actualizar actividades si cambian las preloaded
watch(() => props.preloadedActivities, (newActivities) => {
  if (newActivities && newActivities.length > 0) {
    activities.value = newActivities
  }
})
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>