<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <!-- Modal content -->
    <div class="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl border border-purple-500/20 shadow-2xl relative z-10 animate-fadeIn">
      <!-- Header -->
      <div class="flex items-center justify-between p-5 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-purple-700/30">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-white">Configuración de Notificaciones</h2>
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
        <!-- Incrustar componente de configuración -->
        <TaskReportSettings />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, onMounted, onUnmounted } from 'vue'
import TaskReportSettings from '../admin/TaskReportSettings.vue'

const emit = defineEmits(['close'])

// Prevent scrolling when modal is open
onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
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