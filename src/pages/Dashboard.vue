<template>
  <div class="min-h-screen bg-slate-50 p-4 lg:p-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 class="text-xl font-bold text-slate-900 tracking-tight">Dashboard Operativo</h1>
          <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wide">
            {{ userRoleLabel }}
          </span>
        </div>
        <p class="text-2xl font-black text-slate-800 mb-0.5">
          Hola, {{ firstName }} 👋
        </p>
        <p class="text-sm text-slate-500">
          <span v-if="criticalCount > 0">
            Tienes <span class="font-semibold text-red-500">{{ criticalCount }} actividades críticas</span> que requieren atención hoy
          </span>
          <span v-else>Todo en orden — buen trabajo manteniendo el ritmo</span>
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="refreshData"
          :disabled="isRefreshing"
          class="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
          title="Actualizar datos"
        >
          <i class="fas fa-sync-alt text-sm" :class="{ 'animate-spin': isRefreshing }"></i>
        </button>
        <PermissionGuard :permissions="['create-activities']" :fallback="false">
          <router-link
            to="/activities"
            class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-600/20"
          >
            <i class="fas fa-plus text-xs"></i>
            Nueva actividad
          </router-link>
        </PermissionGuard>
        <div class="w-9 h-9 rounded-xl bg-slate-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {{ userInitials }}
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div v-if="availableQuickActions.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      <router-link
        v-for="action in availableQuickActions.slice(0, 5)"
        :key="action.name"
        :to="action.to"
        :class="[
          'group flex items-center gap-3 px-4 py-3 bg-white border rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5',
          action.borderClass
        ]"
      >
        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center transition-colors', action.iconBg, action.iconBgHover]">
          <i :class="['text-sm', action.faIcon, action.iconColor]"></i>
        </div>
        <span class="text-slate-700 text-xs font-semibold truncate group-hover:text-slate-900">{{ action.name }}</span>
      </router-link>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <PermissionGuard :permissions="['view-clients']" :fallback="false">
        <div class="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-all">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clientes</span>
            <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <i class="fas fa-users text-blue-500 text-xs"></i>
            </div>
          </div>
          <div class="text-2xl font-black text-slate-900">{{ stats.clients }}</div>
          <div class="text-xs text-slate-400 mt-1">Total activos</div>
        </div>
      </PermissionGuard>

      <PermissionGuard :permissions="['view-activities']" :fallback="false">
        <div class="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-all">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actividades</span>
            <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <i class="fas fa-clipboard-list text-green-500 text-xs"></i>
            </div>
          </div>
          <div class="text-2xl font-black text-slate-900">{{ stats.activities }}</div>
          <div class="text-xs text-slate-400 mt-1">En seguimiento</div>
        </div>
      </PermissionGuard>

      <PermissionGuard :permissions="['view-cases']" :fallback="false">
        <div class="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-all">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Casos</span>
            <div class="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <i class="fas fa-exclamation-circle text-orange-500 text-xs"></i>
            </div>
          </div>
          <div class="text-2xl font-black text-slate-900">{{ stats.openIssues }}</div>
          <div class="text-xs text-slate-400 mt-1">Abiertos</div>
        </div>
      </PermissionGuard>

      <PermissionGuard :permissions="['view-team']" :fallback="false">
        <div class="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-all">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Equipo</span>
            <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <i class="fas fa-user-friends text-indigo-500 text-xs"></i>
            </div>
          </div>
          <div class="text-2xl font-black text-slate-900">{{ stats.teamMembers }}</div>
          <div class="text-xs text-slate-400 mt-1">Miembros</div>
        </div>
      </PermissionGuard>
    </div>

    <!-- Main Content Grid -->
    <div class="grid lg:grid-cols-3 gap-6">

      <!-- Left Column (2/3) -->
      <div class="lg:col-span-2 space-y-6">

        <!-- AI Insights -->
        <AIInsightsWidget />

        <!-- Agenda -->
        <PermissionGuard :permissions="['view-activities']" :fallback="false">
          <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <i class="fas fa-calendar-alt text-blue-500 text-sm"></i>
                <h3 class="text-sm font-bold text-slate-800">Agenda próxima</h3>
              </div>
              <router-link to="/activities" class="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                Ver todas →
              </router-link>
            </div>
            <div v-if="upcomingActivities.length === 0" class="px-5 py-8 text-center text-slate-400 text-sm">
              No hay actividades próximas
            </div>
            <div v-else class="divide-y divide-slate-50">
              <div
                v-for="activity in upcomingActivities"
                :key="activity._id"
                class="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors"
              >
                <div class="shrink-0 w-10 text-center">
                  <div class="text-xs font-black text-slate-900 leading-none">
                    {{ formatDay(activity.dueDate || activity.date) }}
                  </div>
                  <div class="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                    {{ formatMonth(activity.dueDate || activity.date) }}
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold text-slate-800 truncate">{{ activity.title }}</div>
                  <div class="text-xs text-slate-400 truncate">
                    {{ clientsStore.clients.find(c => c._id === activity.clientId)?.name || '—' }}
                  </div>
                </div>
                <span :class="['px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0', statusClass(activity.status)]">
                  {{ statusLabel(activity.status) }}
                </span>
              </div>
            </div>
          </div>
        </PermissionGuard>

      </div>

      <!-- Right Column (1/3) -->
      <div class="space-y-4">

        <!-- Ritmo del día -->
        <PermissionGuard :permissions="['view-activities']" :fallback="false">
          <div class="bg-white border border-slate-200 rounded-xl p-5">
            <div class="flex items-center gap-2 mb-4">
              <i class="fas fa-bolt text-yellow-400 text-sm"></i>
              <h3 class="text-sm font-bold text-slate-800">Ritmo del día</h3>
            </div>
            <div class="mb-4">
              <div class="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Progreso</span>
                <span class="font-semibold text-slate-700">{{ focusProgress }}%</span>
              </div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
                  :style="{ width: focusProgress + '%' }"
                ></div>
              </div>
            </div>
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span class="text-xs text-slate-600">Vencidas</span>
                </div>
                <span class="text-xs font-bold text-red-500">{{ overdueCount }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span class="text-xs text-slate-600">Para hoy</span>
                </div>
                <span class="text-xs font-bold text-blue-500">{{ todayCount }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span class="text-xs text-slate-600">Alta prioridad</span>
                </div>
                <span class="text-xs font-bold text-orange-500">{{ highPriorityCount }}</span>
              </div>
            </div>
          </div>
        </PermissionGuard>

        <!-- Pulso comercial -->
        <PermissionGuard :permissions="['view-activities']" :fallback="false">
          <div class="bg-white border border-slate-200 rounded-xl p-5">
            <div class="flex items-center gap-2 mb-4">
              <i class="fas fa-chart-line text-green-500 text-sm"></i>
              <h3 class="text-sm font-bold text-slate-800">Pulso comercial</h3>
            </div>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <i class="fas fa-check text-green-600 text-[8px]"></i>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  <span class="font-semibold text-slate-800">{{ completedThisWeek }}</span> actividades completadas esta semana
                </p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <i class="fas fa-users text-blue-600 text-[8px]"></i>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  <span class="font-semibold text-slate-800">{{ activeClients }}</span> clientes con actividad reciente
                </p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                  <i class="fas fa-exclamation text-orange-600 text-[8px]"></i>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  <span class="font-semibold text-slate-800">{{ stats.openIssues }}</span> casos abiertos pendientes de resolución
                </p>
              </div>
            </div>
          </div>
        </PermissionGuard>

        <!-- Nota de foco -->
        <div class="bg-slate-900 rounded-xl p-5">
          <div class="flex items-center gap-2 mb-3">
            <i class="fas fa-star text-yellow-400 text-sm"></i>
            <h3 class="text-sm font-bold text-white">Nota de foco</h3>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed mb-4">
            "El éxito es la suma de pequeños esfuerzos repetidos día tras día."
          </p>
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Robert Collier</span>
            <button
              @click="copyQuote"
              class="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors"
            >
              <i class="far fa-copy text-[10px]"></i>
              <span class="text-[10px] font-semibold uppercase tracking-wide">Copiar</span>
            </button>
          </div>
        </div>

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
import PermissionGuard from '../components/PermissionGuard.vue'
import AIInsightsWidget from '../components/AIInsightsWidget.vue'

const authStore = useAuthStore()
const clientsStore = useClientsStore()
const activitiesStore = useActivitiesStore()
const issuesStore = useIssuesStore()
const teamStore = useTeamStore()

const isRefreshing = ref(false)

// User display helpers
const firstName = computed(() => authStore.user?.name?.split(' ')[0] || 'Usuario')
const userInitials = computed(() => {
  const name = authStore.user?.name || ''
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
})
const userRoleLabel = computed(() => {
  const roleMap: Record<string, string> = {
    admin: 'Admin',
    manager: 'Manager',
    employee: 'Empleado',
    support: 'Soporte',
    development: 'Dev',
    fullstack: 'Fullstack',
    viewer: 'Viewer',
    client: 'Cliente',
  }
  return roleMap[authStore.user?.role || ''] || authStore.user?.role || 'Usuario'
})

// Stats
const stats = computed(() => ({
  clients: clientsStore.clients.length,
  activities: activitiesStore.activities.length,
  openIssues: issuesStore.issues.filter(i => i.status === 'open').length,
  teamMembers: teamStore.members.length,
}))

// Activity breakdowns
const today = new Date()
today.setHours(0, 0, 0, 0)

const overdueCount = computed(() =>
  activitiesStore.activities.filter(a => {
    if (a.status === 'completed' || a.status === 'cancelled') return false
    const due = new Date(a.dueDate || a.date || '')
    due.setHours(0, 0, 0, 0)
    return due < today
  }).length
)

const todayCount = computed(() =>
  activitiesStore.activities.filter(a => {
    if (a.status === 'completed' || a.status === 'cancelled') return false
    const due = new Date(a.dueDate || a.date || '')
    due.setHours(0, 0, 0, 0)
    return due.getTime() === today.getTime()
  }).length
)

const highPriorityCount = computed(() =>
  activitiesStore.activities.filter(a =>
    (a.priority === 'high' || a.priority === 'urgent') &&
    a.status !== 'completed' && a.status !== 'cancelled'
  ).length
)

const criticalCount = computed(() => overdueCount.value + todayCount.value)

const completedThisWeek = computed(() => {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return activitiesStore.activities.filter(a => {
    if (a.status !== 'completed') return false
    const updated = new Date(a.updatedAt || a.date || '')
    return updated >= weekAgo
  }).length
})

const activeClients = computed(() => {
  const recentClientIds = new Set(
    activitiesStore.activities
      .filter(a => {
        const d = new Date(a.updatedAt || a.date || '')
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return d >= weekAgo
      })
      .map(a => a.clientId)
      .filter(Boolean)
  )
  return recentClientIds.size
})

const focusProgress = computed(() => {
  const total = activitiesStore.activities.length
  if (!total) return 0
  const done = activitiesStore.activities.filter(a => a.status === 'completed').length
  return Math.round((done / total) * 100)
})

// Upcoming activities (next 6 non-completed, sorted by date)
const upcomingActivities = computed(() => {
  return [...activitiesStore.activities]
    .filter(a => a.status !== 'completed' && a.status !== 'cancelled')
    .sort((a, b) => {
      const da = new Date(a.dueDate || a.date || '').getTime()
      const db = new Date(b.dueDate || b.date || '').getTime()
      return da - db
    })
    .slice(0, 6)
})

// Quick Actions
const availableQuickActions = computed(() => {
  const actions = []

  if (authStore.canCreateClients) {
    actions.push({
      name: 'Nuevo Cliente',
      to: '/clients',
      faIcon: 'fas fa-user-plus',
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
      iconBgHover: 'group-hover:bg-blue-100',
      borderClass: 'border-slate-200 hover:border-blue-200',
    })
  }

  if (authStore.canCreateActivities) {
    actions.push({
      name: 'Nueva Actividad',
      to: '/activities',
      faIcon: 'fas fa-plus-circle',
      iconColor: 'text-green-500',
      iconBg: 'bg-green-50',
      iconBgHover: 'group-hover:bg-green-100',
      borderClass: 'border-slate-200 hover:border-green-200',
    })
  }

  if (authStore.canViewCases) {
    actions.push({
      name: 'Revisar Tickets',
      to: '/tickets',
      faIcon: 'fas fa-ticket-alt',
      iconColor: 'text-sky-500',
      iconBg: 'bg-sky-50',
      iconBgHover: 'group-hover:bg-sky-100',
      borderClass: 'border-slate-200 hover:border-sky-200',
    })
  }

  if (authStore.canCreateCases) {
    actions.push({
      name: 'Nuevo Caso',
      to: '/cases',
      faIcon: 'fas fa-exclamation-circle',
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-50',
      iconBgHover: 'group-hover:bg-orange-100',
      borderClass: 'border-slate-200 hover:border-orange-200',
    })
  }

  if (authStore.canCreateTeam) {
    actions.push({
      name: 'Gestionar Equipo',
      to: '/team',
      faIcon: 'fas fa-users-cog',
      iconColor: 'text-indigo-500',
      iconBg: 'bg-indigo-50',
      iconBgHover: 'group-hover:bg-indigo-100',
      borderClass: 'border-slate-200 hover:border-indigo-200',
    })
  }

  return actions
})

// Date helpers for agenda
const formatDay = (dateStr?: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).getDate()
}
const formatMonth = (dateStr?: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('es', { month: 'short' })
}

const statusLabel = (status?: string) => {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    'in-progress': 'En curso',
    completed: 'Completada',
    cancelled: 'Cancelada',
    overdue: 'Vencida',
  }
  return map[status || ''] || status || '—'
}

const statusClass = (status?: string) => {
  const map: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-600',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-slate-100 text-slate-400',
    overdue: 'bg-red-100 text-red-600',
  }
  return map[status || ''] || 'bg-slate-100 text-slate-500'
}

const copyQuote = () => {
  navigator.clipboard.writeText('"El éxito es la suma de pequeños esfuerzos repetidos día tras día." - Robert Collier')
}

const refreshData = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    const promises: Promise<any>[] = []
    if (authStore.canViewClients) promises.push(clientsStore.fetchClients())
    if (authStore.canViewActivities) promises.push(activitiesStore.fetchActivities())
    if (authStore.canViewCases) promises.push(issuesStore.fetchIssues())
    if (authStore.canViewTeam) promises.push(teamStore.fetchTeam())
    await Promise.all(promises)
  } catch (error) {
    console.error('Error refreshing dashboard data:', error)
  } finally {
    isRefreshing.value = false
  }
}

onMounted(async () => {
  try {
    const promises: Promise<any>[] = []
    if (authStore.canViewClients) promises.push(clientsStore.fetchClients())
    if (authStore.canViewActivities) promises.push(activitiesStore.fetchActivities())
    if (authStore.canViewCases) promises.push(issuesStore.fetchIssues())
    if (authStore.canViewTeam) promises.push(teamStore.fetchTeam())
    await Promise.all(promises)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})
</script>
