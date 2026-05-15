<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Welcome Header -->
    <section class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 class="text-headline-xl font-headline-xl text-on-surface flex items-center gap-3">
          ¡Hola, {{ authStore.user?.name?.split(' ')[0] || 'Usuario' }}! <span class="text-[32px]">👋</span>
        </h2>
        <p class="text-body-lg text-on-surface-variant mt-2">
          Tienes <span class="font-bold text-primary">{{ pendingActivitiesCount }} actividades</span> críticas para hoy. El pronóstico de cierre mensual es optimista.
        </p>
      </div>
      <button 
        @click="generateNewAIPrediction"
        class="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[0.98] transition-all"
      >
        <span class="material-symbols-outlined" data-icon="auto_awesome">auto_awesome</span>
        Nueva Predicción IA
      </button>
    </section>

    <!-- Quick Action Pills -->
    <section class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <router-link 
        v-for="action in availableQuickActions" 
        :key="action.name"
        :to="action.to"
        class="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-outline-variant rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all"
      >
        <div class="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center text-primary">
          <span class="material-symbols-outlined">{{ action.iconName }}</span>
        </div>
        <span class="text-label-md">{{ action.name }}</span>
      </router-link>
    </section>

    <!-- KPI Bento Grid -->
    <section class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
      <div class="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
        <p class="text-label-md text-outline uppercase tracking-wider mb-2">Clientes</p>
        <div class="flex items-end justify-between">
          <span class="text-headline-xl font-headline-xl text-on-surface">{{ stats.clients }}</span>
          <span class="text-emerald-600 flex items-center text-label-sm font-bold bg-emerald-50 px-2 py-1 rounded-lg">
            +12% <span class="material-symbols-outlined text-[16px]">arrow_upward</span>
          </span>
        </div>
      </div>
      <div class="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
        <p class="text-label-md text-outline uppercase tracking-wider mb-2">Actividades</p>
        <div class="flex items-end justify-between">
          <span class="text-headline-xl font-headline-xl text-on-surface">{{ stats.activities }}</span>
          <span class="text-on-surface-variant text-label-sm font-bold bg-surface-container px-2 py-1 rounded-lg">Hoy</span>
        </div>
      </div>
      <div class="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
        <p class="text-label-md text-outline uppercase tracking-wider mb-2">Tickets</p>
        <div class="flex items-end justify-between">
          <span class="text-headline-xl font-headline-xl text-on-surface">5</span>
          <span class="text-primary text-label-sm font-bold bg-primary-container/10 px-2 py-1 rounded-lg">Nuevos</span>
        </div>
      </div>
      <div class="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
        <p class="text-label-md text-outline uppercase tracking-wider mb-2">Issues</p>
        <div class="flex items-end justify-between">
          <span class="text-headline-xl font-headline-xl text-error">{{ stats.openIssues }}</span>
          <span class="text-rose-600 flex items-center text-label-sm font-bold bg-rose-50 px-2 py-1 rounded-lg">Crítico</span>
        </div>
      </div>
    </section>

    <!-- AI Insights Section -->
    <AIInsightsWidget />

    <!-- Daily Insight Card: Upcoming Activities -->
    <section class="bg-white rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
      <div class="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white">
            <span class="material-symbols-outlined">event_busy</span>
          </div>
          <h3 class="text-headline-md font-headline-md text-on-surface">Actividades Próximas a Vencer</h3>
        </div>
        <router-link to="/activities" class="text-primary font-bold text-label-md hover:underline">Ver todas</router-link>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface">
              <th class="px-6 py-4 text-label-md text-outline uppercase tracking-wider">Actividad</th>
              <th class="px-6 py-4 text-label-md text-outline uppercase tracking-wider text-center">Prioridad</th>
              <th class="px-6 py-4 text-label-md text-outline uppercase tracking-wider text-center">Estado</th>
              <th class="px-6 py-4 text-label-md text-outline uppercase tracking-wider">Vencimiento</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant">
            <tr v-for="activity in upcomingActivities" :key="activity.id" class="hover:bg-surface-container-low/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-bold text-on-surface">{{ activity.title }}</span>
                  <span class="text-label-sm text-outline">Cliente: {{ activity.clientName || 'N/A' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span :class="getPriorityClass(activity.priority)">{{ activity.priority }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span :class="getStatusClass(activity.status)">{{ activity.status }}</span>
              </td>
              <td class="px-6 py-4 text-on-surface-variant font-medium">{{ formatDate(activity.dueDate) }}</td>
            </tr>
            <tr v-if="upcomingActivities.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-outline">No hay actividades pendientes para hoy.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Quote Section -->
    <section class="max-w-3xl mx-auto text-center py-12 px-6 bg-white rounded-[2rem] border border-outline-variant shadow-sm relative overflow-hidden">
      <div class="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
      <span class="material-symbols-outlined text-outline/20 text-6xl mb-4">format_quote</span>
      <p class="text-headline-md font-medium text-on-surface italic leading-snug">
        "El éxito no es el final, el fracaso no es fatal: lo que cuenta es el coraje para continuar."
      </p>
      <div class="mt-6">
        <p class="text-label-md font-bold text-primary tracking-widest uppercase">— Winston Churchill</p>
        <p class="text-label-sm text-outline mt-1">Reflexión de hoy para el equipo GEMS</p>
      </div>
    </section>

    <!-- Success Toast (SweetAlert2 Style) -->
    <div v-if="showToast" class="fixed bottom-8 right-8 z-50 animate-fade-in">
      <div class="bg-white/90 backdrop-blur-lg border-l-4 border-emerald-500 rounded-xl shadow-2xl px-6 py-4 flex items-center gap-4 transition-all hover:scale-105">
        <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <span class="material-symbols-outlined text-[20px]">check_circle</span>
        </div>
        <div>
          <p class="font-bold text-on-surface">Sincronización Completa</p>
          <p class="text-label-sm text-outline">Todos los datos están actualizados.</p>
        </div>
        <button @click="showToast = false" class="text-outline hover:text-on-surface transition-colors ml-4">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { 
  useClientsStore, 
  useActivitiesStore, 
  useIssuesStore,
  useTeamStore 
} from '../stores'
import AIInsightsWidget from '../components/AIInsightsWidget.vue'
import {
  UserPlusIcon,
  PlusCircleIcon,
  ExclamationCircleIcon,
  UsersIcon,
  TicketIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const clientsStore = useClientsStore()
const activitiesStore = useActivitiesStore()
const issuesStore = useIssuesStore()
const teamStore = useTeamStore()

const showToast = ref(false)

const stats = computed(() => ({
  clients: clientsStore.clients.length,
  activities: activitiesStore.activities.length,
  openIssues: issuesStore.issues.filter(i => i.status === 'open').length,
  teamMembers: teamStore.members.length,
}))

const pendingActivitiesCount = computed(() => {
  return activitiesStore.activities.filter(a => a.status === 'pending').length
})

const upcomingActivities = computed(() => {
  return [...activitiesStore.activities]
    .filter(a => a.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)
})

const availableQuickActions = computed(() => {
  const actions = []
  
  if (authStore.canCreateClients) {
    actions.push({
      name: 'Nuevo Cliente',
      to: '/clients',
      iconName: 'person_add'
    })
  }
  
  if (authStore.canCreateActivities) {
    actions.push({
      name: 'Nueva Actividad',
      to: '/activities',
      iconName: 'add_task'
    })
  }
  
  if (authStore.canViewCases) {
    actions.push({
      name: 'Revisar Tickets',
      to: '/tickets',
      iconName: 'checklist'
    })
  }
  
  if (authStore.canCreateCases) {
    actions.push({
      name: 'Nuevo Caso',
      to: '/cases',
      iconName: 'assignment'
    })
  }
  
  if (authStore.canCreateTeam) {
    actions.push({
      name: 'Gestionar Equipo',
      to: '/team',
      iconName: 'groups'
    })
  }
  
  return actions
})

const generateNewAIPrediction = () => {
  // Placeholder for IA prediction logic
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 5000)
}

const getPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    'P1': 'px-2 py-1 bg-rose-100 text-rose-700 text-label-sm font-bold rounded-lg',
    'P2': 'px-2 py-1 bg-orange-100 text-orange-700 text-label-sm font-bold rounded-lg',
    'P3': 'px-2 py-1 bg-amber-100 text-amber-700 text-label-sm font-bold rounded-lg',
    'P4': 'px-2 py-1 bg-blue-50 text-blue-600 text-label-sm font-bold rounded-lg'
  }
  return classes[priority] || 'px-2 py-1 bg-slate-100 text-slate-600 text-label-sm font-bold rounded-lg'
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'pending': 'px-2 py-1 bg-amber-100 text-amber-700 text-label-sm font-bold rounded-lg',
    'in-progress': 'px-2 py-1 bg-blue-100 text-blue-700 text-label-sm font-bold rounded-lg',
    'completed': 'px-2 py-1 bg-emerald-100 text-emerald-700 text-label-sm font-bold rounded-lg',
    'overdue': 'px-2 py-1 bg-rose-100 text-rose-700 text-label-sm font-bold rounded-lg'
  }
  return classes[status] || 'px-2 py-1 bg-slate-100 text-slate-600 text-label-sm font-bold rounded-lg'
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  try {
    const promises: Promise<any>[] = []
    if (authStore.canViewClients) promises.push(clientsStore.fetchClients())
    if (authStore.canViewActivities) promises.push(activitiesStore.fetchActivities())
    if (authStore.canViewCases) promises.push(issuesStore.fetchIssues())
    if (authStore.canViewTeam) promises.push(teamStore.fetchTeam())
    await Promise.all(promises)
    
    // Show sync toast on load
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  vertical-align: middle;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}

.ai-gradient-text {
  background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
