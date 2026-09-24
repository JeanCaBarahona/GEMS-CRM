<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.name"
        class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">{{ stat.name }}</p>
            <p class="text-3xl font-bold text-white mt-2">{{ stat.value }}</p>
            <div class="flex items-center mt-2">
              <span
                :class="[
                  'text-sm font-medium',
                  stat.change > 0 ? 'text-green-400' : 'text-red-400'
                ]"
              >
                {{ stat.change > 0 ? '+' : '' }}{{ stat.change }}%
              </span>
              <span class="text-gray-500 text-sm ml-2">vs último mes</span>
            </div>
          </div>
          <div class="p-3 rounded-full bg-gradient-to-br from-purple-600 to-pink-600">
            <i :class="stat.icon" class="text-white text-xl"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Chart -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">Ingresos Mensuales</h3>
          <select class="bg-gray-700 text-white rounded-lg px-3 py-1 text-sm">
            <option>Últimos 12 meses</option>
            <option>Últimos 6 meses</option>
            <option>Último año</option>
          </select>
        </div>
        <div class="h-64 flex items-center justify-center">
          <div class="text-gray-400">
            <i class="fas fa-chart-line text-4xl mb-2"></i>
            <p>Gráfico de ingresos</p>
            <p class="text-sm">(Se integrará con Chart.js)</p>
          </div>
        </div>
      </div>

      <!-- Activity Chart -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">Actividades por Tipo</h3>
          <button class="text-purple-400 hover:text-purple-300 text-sm">Ver detalles</button>
        </div>
        <div class="h-64 flex items-center justify-center">
          <div class="text-gray-400 text-center">
            <i class="fas fa-chart-pie text-4xl mb-2"></i>
            <p>Gráfico circular de actividades</p>
            <p class="text-sm">(Se integrará con Chart.js)</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activities and Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Activities -->
      <div class="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">Actividades Recientes</h3>
          <button class="text-purple-400 hover:text-purple-300 text-sm">Ver todas</button>
        </div>
        <div class="space-y-4">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="flex items-center p-4 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition-colors"
          >
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <i :class="activity.icon" class="text-white text-sm"></i>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-white font-medium">{{ activity.title }}</p>
              <p class="text-gray-400 text-sm">{{ activity.description }}</p>
            </div>
            <div class="text-gray-500 text-sm">{{ activity.time }}</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        <h3 class="text-xl font-bold text-white mb-6">Acciones Rápidas</h3>
        <div class="space-y-3">
          <button
            v-for="action in quickActions"
            :key="action.name"
            @click="handleQuickAction(action.action)"
            class="w-full flex items-center p-4 bg-gray-900/30 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all duration-200 transform hover:scale-105 group"
          >
            <i :class="action.icon" class="text-purple-400 group-hover:text-white text-lg mr-3"></i>
            <span class="text-white group-hover:text-white">{{ action.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Upcoming Tasks and Notifications -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Upcoming Tasks -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">Próximas Tareas</h3>
          <span class="bg-purple-600 text-white px-2 py-1 rounded-full text-sm">{{ upcomingTasks.length }}</span>
        </div>
        <div class="space-y-3">
          <div
            v-for="task in upcomingTasks"
            :key="task.id"
            class="flex items-center p-3 bg-gray-900/30 rounded-lg"
          >
            <div
              class="w-3 h-3 rounded-full mr-3"
              :class="{
                'bg-red-500': task.priority === 'high',
                'bg-yellow-500': task.priority === 'medium',
                'bg-green-500': task.priority === 'low'
              }"
            ></div>
            <div class="flex-1">
              <p class="text-white font-medium">{{ task.title }}</p>
              <p class="text-gray-400 text-sm">{{ task.dueDate }}</p>
            </div>
            <button title="Ver detalle" class="text-purple-400 hover:text-purple-300">
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Notifications -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">Notificaciones</h3>
          <button class="text-purple-400 hover:text-purple-300 text-sm">Marcar como leídas</button>
        </div>
        <div class="space-y-3">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="flex items-start p-3 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition-colors"
            :class="{ 'border-l-4 border-purple-500': !notification.read }"
          >
            <div class="flex-shrink-0 mt-1">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center"
                :class="{
                  'bg-blue-500/20 text-blue-400': notification.type === 'info',
                  'bg-green-500/20 text-green-400': notification.type === 'success',
                  'bg-yellow-500/20 text-yellow-400': notification.type === 'warning',
                  'bg-red-500/20 text-red-400': notification.type === 'error'
                }"
              >
                <i :class="notification.icon" class="text-sm"></i>
              </div>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-white font-medium text-sm">{{ notification.title }}</p>
              <p class="text-gray-400 text-xs mt-1">{{ notification.message }}</p>
              <p class="text-gray-500 text-xs mt-1">{{ notification.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Stats data
const stats = ref([
  {
    name: 'Total Clientes',
    value: '2,847',
    change: 12,
    icon: 'fas fa-users'
  },
  {
    name: 'Ingresos del Mes',
    value: '$45,721',
    change: 8.2,
    icon: 'fas fa-dollar-sign'
  },
  {
    name: 'Tareas Activas',
    value: '156',
    change: -3.1,
    icon: 'fas fa-tasks'
  },
  {
    name: 'Satisfacción',
    value: '94%',
    change: 5.4,
    icon: 'fas fa-heart'
  }
])

// Recent activities
const recentActivities = ref([
  {
    id: 1,
    title: 'Nueva reunión programada',
    description: 'Reunión con cliente ABC Corp para el proyecto XYZ',
    time: 'Hace 5 min',
    icon: 'fas fa-calendar'
  },
  {
    id: 2,
    title: 'Pago recibido',
    description: 'Pago de $15,000 de Cliente Premium',
    time: 'Hace 15 min',
    icon: 'fas fa-credit-card'
  },
  {
    id: 3,
    title: 'Nuevo cliente registrado',
    description: 'Tech Solutions Inc. se ha registrado',
    time: 'Hace 1 hora',
    icon: 'fas fa-user-plus'
  },
  {
    id: 4,
    title: 'Documento cargado',
    description: 'Contrato firmado - Proyecto Alpha',
    time: 'Hace 2 horas',
    icon: 'fas fa-file-upload'
  }
])

// Quick actions
const quickActions = ref([
  { name: 'Crear Cliente', icon: 'fas fa-user-plus', action: 'createClient' },
  { name: 'Nueva Actividad', icon: 'fas fa-plus-circle', action: 'createActivity' },
  { name: 'Agendar Reunión', icon: 'fas fa-calendar-plus', action: 'createMeeting' },
  { name: 'Registrar Pago', icon: 'fas fa-credit-card', action: 'createPayment' },
  { name: 'Generar Reporte', icon: 'fas fa-chart-bar', action: 'generateReport' }
])

// Upcoming tasks
const upcomingTasks = ref([
  {
    id: 1,
    title: 'Llamar a cliente ABC',
    dueDate: 'Hoy 14:30',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Revisar propuesta XYZ',
    dueDate: 'Mañana 10:00',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Enviar informe mensual',
    dueDate: 'Viernes 16:00',
    priority: 'low'
  },
  {
    id: 4,
    title: 'Reunión de equipo',
    dueDate: 'Lunes 09:00',
    priority: 'medium'
  }
])

// Notifications
const notifications = ref([
  {
    id: 1,
    title: 'Sistema actualizado',
    message: 'Nueva versión disponible con mejoras',
    time: 'Hace 10 min',
    type: 'success',
    icon: 'fas fa-check-circle',
    read: false
  },
  {
    id: 2,
    title: 'Recordatorio de pago',
    message: 'Cliente XYZ tiene pago pendiente',
    time: 'Hace 30 min',
    type: 'warning',
    icon: 'fas fa-exclamation-triangle',
    read: false
  },
  {
    id: 3,
    title: 'Backup completado',
    message: 'Copia de seguridad realizada exitosamente',
    time: 'Hace 2 horas',
    type: 'info',
    icon: 'fas fa-info-circle',
    read: true
  }
])

// Methods
const handleQuickAction = (action: string) => {
  console.log('Quick action:', action)
  
  // Emit a custom event that the parent can listen to
  const event = new CustomEvent('quickAction', {
    detail: { action }
  })
  window.dispatchEvent(event)
}

onMounted(() => {
  // Load dashboard data
  console.log('Dashboard loaded')
  
  // Listen for quick actions
  window.addEventListener('quickAction', (event: any) => {
    const { action } = event.detail
    
    // Handle different quick actions
    switch (action) {
      case 'createClient':
        // This would trigger the parent to show client form
        break
      case 'createActivity':
        // This would trigger the parent to show activity form
        break
      // ... other actions
    }
  })
})
</script>

<style scoped>
/* Additional styles for animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
