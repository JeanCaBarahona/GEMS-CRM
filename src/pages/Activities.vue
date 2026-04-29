<template>
  <div class="flex flex-col h-full min-h-0 relative">
    <!-- Search Bar -->
    <div class="mb-4 flex-shrink-0">
      <div class="relative w-full max-w-md">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i class="fas fa-search text-slate-400"></i>
        </div>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Buscar actividades..."
          class="w-full pl-10 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow shadow-sm"
        />
      </div>
    </div>

    <!-- Activities View -->
    <div class="flex-1 min-h-0 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-y-auto flex flex-col p-4">
      <ActivitiesView 
        ref="activitiesViewRef"
        :searchTerm="searchTerm"
        @create="openCreateModal"
        @edit="openEditModal"
        class="h-full flex flex-col"
      />
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-fade-in">
        <div class="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 class="text-lg font-black text-slate-800">
            {{ editingActivity ? 'Editar Actividad' : 'Nueva Actividad' }}
          </h3>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-5">
          <ActivityForm
            :activity="editingActivity"
            @save="handleSave"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>
    
    <!-- Modal de configuración de notificaciones - REMOVED -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ActivitiesView from '../components/modules/ActivitiesView.vue'
import ActivityForm from '../components/forms/ActivityForm.vue'
// import TaskReportSettingsModal from '../components/modals/TaskReportSettingsModal.vue' // REMOVED
import type { ActivityData } from '../services/activityService'

// Reactive state
const searchTerm = ref('')
const showModal = ref(false)
// const showNotificationSettings = ref(false) // REMOVED
const editingActivity = ref<ActivityData | null>(null)
const activitiesViewRef = ref()

// Methods
const openCreateModal = () => {
  editingActivity.value = null
  showModal.value = true
}

const openEditModal = (activity: ActivityData) => {
  editingActivity.value = activity
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingActivity.value = null
}

const handleSave = () => {
  closeModal()
  // Recargar las actividades después de guardar
  if (activitiesViewRef.value?.loadActivities) {
    activitiesViewRef.value.loadActivities()
  }
}
</script>
