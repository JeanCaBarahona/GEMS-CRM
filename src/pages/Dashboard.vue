<template>
  <div class="space-y-6 relative">
    <!-- Animated Light Background -->
    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute inset-0 bg-slate-50"></div>
      <div class="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-400/5 rounded-full blur-[100px] animate-pulse"></div>
      <div class="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-sky-300/5 rounded-full blur-[100px] animate-pulse animation-delay-3000"></div>
      
      <!-- Subtle grid pattern -->
      <div class="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
    </div>
    <!-- Welcome Header -->
    <div class="mb-6">
      <h1 class="text-xl lg:text-2xl font-black text-slate-800 tracking-tight animate-fade-in mb-0.5">
        ¡Hola, {{ authStore.user?.name?.split(' ')[0] || 'Usuario' }}! 👋
      </h1>
      <p class="text-slate-500 text-xs font-medium animate-fade-in animation-delay-300">
        {{ getWelcomeMessage() }}
      </p>
    </div>

    <!-- Quick Actions - Horizontal Row (Prioritized) -->
    <div v-if="availableQuickActions.length > 0" class="animate-fade-in animation-delay-300">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <router-link
          v-for="action in availableQuickActions.slice(0, 5)"
          :key="action.name"
          :to="action.to"
          :class="`
            group flex items-center justify-center lg:justify-start gap-3 py-2.5 px-4
            bg-white border border-slate-200 rounded-2xl
            transition-all duration-300 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5
          `"
        >
          <component :is="action.icon" :class="`w-5 h-5 ${action.iconColor}`" />
          <span class="text-slate-700 text-xs font-bold tracking-tight group-hover:text-primary-600 truncate">
            {{ action.name }}
          </span>
        </router-link>
      </div>
    </div>

    <!-- Stats Grid (Unified Sleek Strip) -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm animate-fade-in animation-delay-600 flex flex-nowrap overflow-x-auto divide-x divide-slate-100 w-full">
      <!-- Clientes -->
      <PermissionGuard :permissions="['view-clients']" :fallback="false" class="flex-1">
        <div class="px-4 py-3 hover:bg-slate-50 transition-colors group flex items-center justify-center gap-3 w-full min-w-[130px]">
          <div class="p-1.5 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-100 transition-colors">
            <UserGroupIcon class="w-4 h-4" />
          </div>
          <div>
            <div class="text-xl font-black text-slate-800 leading-none mb-0.5">{{ stats.clients }}</div>
            <div class="text-[9px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">Clientes</div>
          </div>
        </div>
      </PermissionGuard>
      
      <!-- Actividades -->
      <PermissionGuard :permissions="['view-activities']" :fallback="false" class="flex-1">
        <div class="px-4 py-3 hover:bg-slate-50 transition-colors group flex items-center justify-center gap-3 w-full min-w-[130px]">
          <div class="p-1.5 bg-green-50 text-green-500 rounded-lg group-hover:bg-green-100 transition-colors">
            <ClipboardDocumentListIcon class="w-4 h-4" />
          </div>
          <div>
            <div class="text-xl font-black text-slate-800 leading-none mb-0.5">{{ stats.activities }}</div>
            <div class="text-[9px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-green-600 transition-colors">Actividades</div>
          </div>
        </div>
      </PermissionGuard>

      <!-- Tickets -->
      <PermissionGuard :permissions="['view-cases']" :fallback="false" class="flex-1">
        <div class="px-4 py-3 hover:bg-slate-50 transition-colors group flex items-center justify-center gap-3 w-full min-w-[130px]">
          <div class="p-1.5 bg-sky-50 text-sky-500 rounded-lg group-hover:bg-sky-100 transition-colors relative">
            <TicketIcon class="w-4 h-4" />
            <div class="absolute top-0 right-0 w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <div class="text-xl font-black text-slate-800 leading-none mb-0.5">5</div>
            <div class="text-[9px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-sky-600 transition-colors">Nuevos Tickets</div>
          </div>
        </div>
      </PermissionGuard>

      <!-- Issues -->
      <PermissionGuard :permissions="['view-cases']" :fallback="false" class="flex-1">
        <div class="px-4 py-3 hover:bg-slate-50 transition-colors group flex items-center justify-center gap-3 w-full min-w-[130px]">
          <div class="p-1.5 bg-red-50 text-red-500 rounded-lg group-hover:bg-red-100 transition-colors">
            <ExclamationTriangleIcon class="w-4 h-4" />
          </div>
          <div>
            <div class="text-xl font-black text-slate-800 leading-none mb-0.5">{{ stats.openIssues }}</div>
            <div class="text-[9px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-red-600 transition-colors">Issues Abiertos</div>
          </div>
        </div>
      </PermissionGuard>

      <!-- Equipo -->
      <PermissionGuard :permissions="['view-team']" :fallback="false" class="flex-1">
        <div class="px-4 py-3 hover:bg-slate-50 transition-colors group flex items-center justify-center gap-3 w-full min-w-[130px]">
          <div class="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg group-hover:bg-indigo-100 transition-colors">
            <UsersIcon class="w-4 h-4" />
          </div>
          <div>
            <div class="text-xl font-black text-slate-800 leading-none mb-0.5">{{ stats.teamMembers }}</div>
            <div class="text-[9px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Equipo App</div>
          </div>
        </div>
      </PermissionGuard>
    </div>

    <!-- Core Insights Row (Full Width) -->
    <div class="mt-2">
      <AIInsightsWidget />
    </div>

    <!-- Motivational Section -->
    <div class="mt-12 mb-8 flex flex-col items-center animate-fade-in animation-delay-900">
      <div class="w-full max-w-sm bg-slate-50/50 border border-slate-100 rounded-2xl p-6 transition-all duration-300">
        <div class="flex flex-col items-center">
          <!-- Quote Text -->
          <p class="text-xs font-medium text-slate-500 text-center leading-relaxed mb-4">
            "El éxito es la suma de pequeños esfuerzos repetidos día tras día."
          </p>

          <!-- Author & Action -->
          <div class="flex items-center gap-3">
            <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">Robert Collier</span>
            <div class="w-1 h-1 bg-slate-200 rounded-full"></div>
            <button 
              @click="copyQuote" 
              class="flex items-center gap-1.5 text-slate-400 hover:text-primary-600 transition-colors"
              title="Copiar frase"
            >
              <i class="far fa-copy text-[9px]"></i>
              <span class="text-[9px] font-black uppercase tracking-wider">Copiar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { 
  useClientsStore, 
  useActivitiesStore, 
  useIssuesStore,
  useTeamStore 
} from '../stores'
import PermissionGuard from '../components/PermissionGuard.vue'
import AIInsightsWidget from '../components/AIInsightsWidget.vue'
import MotivationalWidget from '../components/MotivationalWidget.vue'
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
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

const stats = computed(() => ({
  clients: clientsStore.clients.length,
  activities: activitiesStore.activities.length,
  openIssues: issuesStore.issues.filter(i => i.status === 'open').length,
  teamMembers: teamStore.members.length,
}))

// Computed property for available quick actions
const availableQuickActions = computed(() => {
  const actions = []
  
  if (authStore.canCreateClients) {
    actions.push({
      name: 'Nuevo Cliente',
      to: '/clients',
      icon: UserPlusIcon,
      colors: 'from-blue-600/20 to-blue-700/20 border-blue-500/30 hover:from-blue-500/30 hover:to-blue-600/30',
      iconColor: 'text-blue-400 group-hover:text-blue-300'
    })
  }
  
  if (authStore.canCreateActivities) {
    actions.push({
      name: 'Nueva Actividad',
      to: '/activities',
      icon: PlusCircleIcon,
      colors: 'from-green-600/20 to-green-700/20 border-green-500/30 hover:from-green-500/30 hover:to-green-600/30',
      iconColor: 'text-green-400 group-hover:text-green-300'
    })
  }
  
  // Quick Action para revisar Tickets reemplazando el pago
  if (authStore.canViewCases) {
    actions.push({
      name: 'Revisar Tickets',
      to: '/tickets',
      icon: TicketIcon,
      colors: 'from-sky-600/20 to-sky-700/20 border-sky-500/30 hover:from-sky-500/30 hover:to-sky-600/30',
      iconColor: 'text-sky-500 group-hover:text-sky-400'
    })
  }
  
  if (authStore.canCreateCases) {
    actions.push({
      name: 'Nuevo Caso',
      to: '/cases',
      icon: ExclamationCircleIcon,
      colors: 'from-orange-600/20 to-orange-700/20 border-orange-500/30 hover:from-orange-500/30 hover:to-orange-600/30',
      iconColor: 'text-orange-400 group-hover:text-orange-300'
    })
  }
  
  if (authStore.canCreateTeam) {
    actions.push({
      name: 'Gestionar Equipo',
      to: '/team',
      icon: UsersIcon,
      colors: 'from-indigo-600/20 to-indigo-700/20 border-indigo-500/30 hover:from-indigo-500/30 hover:to-indigo-600/30',
      iconColor: 'text-indigo-400 group-hover:text-indigo-300'
    })
  }
  
  return actions
})

const getWelcomeMessage = () => {
  const hour = new Date().getHours()
  if (hour < 12) return '¡Buenos días! Comencemos con energía este día.'
  if (hour < 18) return '¡Buenas tardes! ¿Qué actividades tienes planeadas?'
  return '¡Buenas noches! Revisemos el progreso del día.'
}

const copyQuote = () => {
  const quote = '"El éxito es la suma de pequeños esfuerzos repetidos día tras día." - Robert Collier'
  navigator.clipboard.writeText(quote)
}

onMounted(async () => {
  try {
    // Only fetch data user has permission to see
    const promises: Promise<any>[] = []
    
    if (authStore.canViewClients) {
      promises.push(clientsStore.fetchClients())
    }
    
    if (authStore.canViewActivities) {
      console.log('[Dashboard] Fetching all activities (secondary onMounted)');
      promises.push(activitiesStore.fetchActivities())
    }
    
    // Contabilidad temporarily removed
    // if (authStore.canViewAccounting) {
    //   promises.push(paymentsStore.fetchPayments())
    //   promises.push(paymentsStore.fetchSummary())
    // }
    
    if (authStore.canViewCases) {
      promises.push(issuesStore.fetchIssues())
    }
    
    if (authStore.canViewTeam) {
      promises.push(teamStore.fetchTeam())
    }
    
    await Promise.all(promises)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}

.animation-delay-600 {
  animation-delay: 0.6s;
}

.animation-delay-900 {
  animation-delay: 0.9s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
