<template>
  <!-- h-full fills the router-view container, overflow-hidden prevents page scroll -->
  <div class="h-full flex flex-col gap-2 overflow-hidden">

    <!-- ── Header row ───────────────────────────────────────────────── -->
    <div class="flex items-center gap-3 flex-none flex-wrap">
      <!-- Left: greeting + message -->
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-base font-black text-slate-900 leading-none">Hola, {{ firstName }}</span>
            <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-wider shrink-0">
              {{ userRoleLabel }}
            </span>
          </div>
          <p class="text-xs text-slate-400 leading-none mt-0.5">
            <span v-if="criticalCount > 0" class="text-red-500 font-semibold">{{ criticalCount }} actividades críticas</span>
            <span v-else class="text-emerald-600 font-semibold">Todo en orden</span>
            <span class="text-slate-300 mx-1">·</span>
            Dashboard operativo
          </p>
        </div>
      </div>

      <!-- Center: quick actions -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <router-link v-if="authStore.canCreateClients" to="/clients"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all group text-xs font-semibold text-slate-600">
          <i class="fas fa-user-plus text-blue-400 group-hover:text-blue-500 text-[10px]"></i>
          <span class="hidden sm:inline">Cliente</span>
        </router-link>
        <router-link v-if="authStore.canCreateActivities" to="/activities"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-green-300 hover:bg-green-50 transition-all group text-xs font-semibold text-slate-600">
          <i class="fas fa-plus-circle text-green-400 group-hover:text-green-500 text-[10px]"></i>
          <span class="hidden sm:inline">Actividad</span>
        </router-link>
        <router-link v-if="authStore.canViewCases" to="/tickets"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50 transition-all group text-xs font-semibold text-slate-600">
          <i class="fas fa-ticket-alt text-sky-400 group-hover:text-sky-500 text-[10px]"></i>
          <span class="hidden sm:inline">Tickets</span>
        </router-link>
        <router-link v-if="authStore.canCreateCases" to="/cases"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50 transition-all group text-xs font-semibold text-slate-600">
          <i class="fas fa-exclamation-circle text-orange-400 group-hover:text-orange-500 text-[10px]"></i>
          <span class="hidden sm:inline">Caso</span>
        </router-link>
        <router-link v-if="authStore.canCreateTeam" to="/team"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-all group text-xs font-semibold text-slate-600">
          <i class="fas fa-users-cog text-indigo-400 group-hover:text-indigo-500 text-[10px]"></i>
          <span class="hidden sm:inline">Equipo</span>
        </router-link>
      </div>

      <!-- Right: refresh + avatar -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="refreshData"
          :disabled="isRefreshing"
          class="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all"
          title="Actualizar"
        >
          <i class="fas fa-sync-alt text-[10px]" :class="{ 'animate-spin': isRefreshing }"></i>
        </button>
        <div class="w-7 h-7 rounded-lg bg-slate-800 text-white text-[10px] font-black flex items-center justify-center shrink-0 select-none">
          {{ userInitials }}
        </div>
      </div>
    </div>

    <!-- ── Main grid ─────────────────────────────────────────────────── -->
    <div class="flex-1 min-h-0 grid gap-2" style="grid-template-columns: 1fr 272px">

      <!-- LEFT: AI (auto-height) + panel crítico (fills rest) -->
      <div class="flex flex-col gap-2 min-h-0">
        <!-- AI Insights: solo ocupa lo que necesita -->
        <AIInsightsWidget />

        <!-- Actividades críticas: llena el espacio restante -->
        <PermissionGuard :permissions="['view-activities']" :fallback="false">
          <div class="bg-white border border-slate-200 rounded-xl flex flex-col flex-1 min-h-0 overflow-hidden">
            <div class="flex items-center justify-between px-3 py-2 border-b border-slate-100 flex-none">
              <div class="flex items-center gap-1.5">
                <i class="fas fa-fire text-red-400 text-[10px]"></i>
                <span class="text-xs font-bold text-slate-700">Críticas</span>
                <span v-if="criticalActivities.length" class="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-black rounded-full">
                  {{ criticalActivities.length }}
                </span>
              </div>
              <router-link to="/activities" class="text-[10px] text-blue-500 hover:text-blue-600 font-bold">Ver todo →</router-link>
            </div>
            <div v-if="criticalActivities.length === 0" class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <i class="fas fa-check-circle text-emerald-400 text-xl mb-1"></i>
                <p class="text-xs text-slate-400 font-medium">Sin actividades críticas</p>
              </div>
            </div>
            <div v-else class="flex-1 overflow-y-auto divide-y divide-slate-50">
              <div
                v-for="activity in criticalActivities"
                :key="activity._id"
                class="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors"
              >
                <div class="shrink-0 w-8 text-center">
                  <div class="text-xs font-black text-slate-800 leading-none">{{ formatDay(activity.dueDate || activity.date) }}</div>
                  <div class="text-[9px] text-slate-400 font-semibold uppercase">{{ formatMonth(activity.dueDate || activity.date) }}</div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-semibold text-slate-700 truncate">{{ activity.title }}</div>
                  <div class="text-[10px] text-slate-400 truncate">
                    {{ clientsStore.clients.find(c => c._id === activity.clientId)?.name || '—' }}
                  </div>
                </div>
                <div class="flex flex-col items-end gap-0.5 shrink-0">
                  <span :class="['px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide', statusClass(activity.status)]">
                    {{ statusLabel(activity.status) }}
                  </span>
                  <span v-if="daysOverdue(activity) > 0" class="text-[9px] text-red-400 font-semibold">
                    {{ daysOverdue(activity) }}d vencida
                  </span>
                </div>
              </div>
            </div>
          </div>
        </PermissionGuard>
      </div>

      <!-- RIGHT: stacked panels -->
      <div class="flex flex-col gap-2 min-h-0">

        <!-- Metrics 2x2 -->
        <div class="grid grid-cols-2 gap-2 flex-none">
          <PermissionGuard :permissions="['view-clients']" :fallback="false">
            <div class="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2.5 hover:shadow-sm transition-all">
              <div class="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <i class="fas fa-users text-blue-500 text-[10px]"></i>
              </div>
              <div class="min-w-0">
                <div class="text-lg font-black text-slate-900 leading-none">{{ stats.clients }}</div>
                <div class="text-[9px] text-slate-400 font-semibold uppercase tracking-wide truncate">Clientes</div>
              </div>
            </div>
          </PermissionGuard>

          <PermissionGuard :permissions="['view-activities']" :fallback="false">
            <div class="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2.5 hover:shadow-sm transition-all">
              <div class="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                <i class="fas fa-clipboard-list text-green-500 text-[10px]"></i>
              </div>
              <div class="min-w-0">
                <div class="text-lg font-black text-slate-900 leading-none">{{ stats.activities }}</div>
                <div class="text-[9px] text-slate-400 font-semibold uppercase tracking-wide truncate">Actividades</div>
              </div>
            </div>
          </PermissionGuard>

          <PermissionGuard :permissions="['view-cases']" :fallback="false">
            <div class="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2.5 hover:shadow-sm transition-all">
              <div class="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                <i class="fas fa-exclamation-circle text-orange-500 text-[10px]"></i>
              </div>
              <div class="min-w-0">
                <div class="text-lg font-black text-slate-900 leading-none">{{ stats.openIssues }}</div>
                <div class="text-[9px] text-slate-400 font-semibold uppercase tracking-wide truncate">Casos</div>
              </div>
            </div>
          </PermissionGuard>

          <PermissionGuard :permissions="['view-team']" :fallback="false">
            <div class="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2.5 hover:shadow-sm transition-all">
              <div class="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                <i class="fas fa-user-friends text-indigo-500 text-[10px]"></i>
              </div>
              <div class="min-w-0">
                <div class="text-lg font-black text-slate-900 leading-none">{{ stats.teamMembers }}</div>
                <div class="text-[9px] text-slate-400 font-semibold uppercase tracking-wide truncate">Equipo</div>
              </div>
            </div>
          </PermissionGuard>
        </div>

        <!-- Ritmo del día -->
        <PermissionGuard :permissions="['view-activities']" :fallback="false">
          <div class="bg-white border border-slate-200 rounded-xl p-3 flex-none">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-1.5">
                <i class="fas fa-bolt text-yellow-400 text-[10px]"></i>
                <span class="text-xs font-bold text-slate-700">Ritmo del día</span>
              </div>
              <span class="text-xs font-black text-slate-500">{{ focusProgress }}%</span>
            </div>
            <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
              <div
                class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700"
                :style="{ width: focusProgress + '%' }"
              ></div>
            </div>
            <div class="grid grid-cols-3 gap-1 text-center">
              <div class="bg-red-50 rounded-lg py-1.5">
                <div class="text-sm font-black text-red-500 leading-none">{{ overdueCount }}</div>
                <div class="text-[9px] text-red-400 font-semibold mt-0.5">Vencidas</div>
              </div>
              <div class="bg-blue-50 rounded-lg py-1.5">
                <div class="text-sm font-black text-blue-500 leading-none">{{ todayCount }}</div>
                <div class="text-[9px] text-blue-400 font-semibold mt-0.5">Hoy</div>
              </div>
              <div class="bg-orange-50 rounded-lg py-1.5">
                <div class="text-sm font-black text-orange-500 leading-none">{{ highPriorityCount }}</div>
                <div class="text-[9px] text-orange-400 font-semibold mt-0.5">Prioridad</div>
              </div>
            </div>
          </div>
        </PermissionGuard>

        <!-- Agenda: fills remaining space -->
        <PermissionGuard :permissions="['view-activities']" :fallback="false">
          <div class="bg-white border border-slate-200 rounded-xl flex flex-col flex-1 min-h-0 overflow-hidden">
            <div class="flex items-center justify-between px-3 py-2 border-b border-slate-100 flex-none">
              <div class="flex items-center gap-1.5">
                <i class="fas fa-calendar-day text-blue-500 text-[10px]"></i>
                <span class="text-xs font-bold text-slate-700">Agenda</span>
              </div>
              <router-link to="/activities" class="text-[10px] text-blue-500 hover:text-blue-600 font-bold">Ver todo →</router-link>
            </div>
            <div v-if="upcomingActivities.length === 0" class="flex-1 flex items-center justify-center">
              <p class="text-xs text-slate-400 text-center">Sin actividades próximas</p>
            </div>
            <div v-else class="flex-1 overflow-y-auto divide-y divide-slate-50">
              <div
                v-for="activity in upcomingActivities"
                :key="activity._id"
                class="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors"
              >
                <div class="shrink-0 w-8 text-center">
                  <div class="text-xs font-black text-slate-800 leading-none">{{ formatDay(activity.dueDate || activity.date) }}</div>
                  <div class="text-[9px] text-slate-400 font-semibold uppercase">{{ formatMonth(activity.dueDate || activity.date) }}</div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-semibold text-slate-700 truncate">{{ activity.title }}</div>
                  <div class="text-[10px] text-slate-400 truncate">
                    {{ clientsStore.clients.find(c => c._id === activity.clientId)?.name || '—' }}
                  </div>
                </div>
                <span :class="['px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide shrink-0', statusClass(activity.status)]">
                  {{ statusLabel(activity.status) }}
                </span>
              </div>
            </div>
          </div>
        </PermissionGuard>

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

const firstName = computed(() => authStore.user?.name?.split(' ')[0] || 'Usuario')
const userInitials = computed(() => {
  const name = authStore.user?.name || ''
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
})
const userRoleLabel = computed(() => {
  const roleMap: Record<string, string> = {
    admin: 'Admin', manager: 'Manager', employee: 'Empleado',
    support: 'Soporte', development: 'Dev', fullstack: 'Fullstack',
    viewer: 'Viewer', client: 'Cliente',
  }
  return roleMap[authStore.user?.role || ''] || authStore.user?.role || 'Usuario'
})

const stats = computed(() => ({
  clients: clientsStore.clients.length,
  activities: activitiesStore.activities.length,
  openIssues: issuesStore.issues.filter((i: any) => i.status === 'open').length,
  teamMembers: teamStore.members.length,
}))

const todayMidnight = new Date()
todayMidnight.setHours(0, 0, 0, 0)

const overdueCount = computed(() =>
  activitiesStore.activities.filter((a: any) => {
    if (a.status === 'completed' || a.status === 'cancelled') return false
    const d = new Date(a.dueDate || a.date)
    d.setHours(0, 0, 0, 0)
    return d < todayMidnight
  }).length
)

const todayCount = computed(() =>
  activitiesStore.activities.filter((a: any) => {
    if (a.status === 'completed' || a.status === 'cancelled') return false
    const d = new Date(a.dueDate || a.date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === todayMidnight.getTime()
  }).length
)

const highPriorityCount = computed(() =>
  activitiesStore.activities.filter((a: any) =>
    (a.priority === 'high' || a.priority === 'urgent') &&
    a.status !== 'completed' && a.status !== 'cancelled'
  ).length
)

const criticalCount = computed(() => overdueCount.value + todayCount.value)

// Overdue + today, sorted: most overdue first, then today
const criticalActivities = computed(() => {
  const now = todayMidnight.getTime()
  return [...activitiesStore.activities]
    .filter((a: any) => {
      if (a.status === 'completed' || a.status === 'cancelled') return false
      const d = new Date(a.dueDate || a.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() <= now
    })
    .sort((a: any, b: any) => {
      const da = new Date(a.dueDate || a.date).getTime()
      const db = new Date(b.dueDate || b.date).getTime()
      return da - db // oldest due date first
    })
})

const daysOverdue = (a: any): number => {
  const due = new Date(a.dueDate || a.date)
  due.setHours(0, 0, 0, 0)
  const diff = Math.floor((todayMidnight.getTime() - due.getTime()) / 86400000)
  return diff > 0 ? diff : 0
}

const focusProgress = computed(() => {
  const total = activitiesStore.activities.length
  if (!total) return 0
  const done = activitiesStore.activities.filter((a: any) => a.status === 'completed').length
  return Math.round((done / total) * 100)
})

const upcomingActivities = computed(() =>
  [...activitiesStore.activities]
    .filter((a: any) => a.status !== 'completed' && a.status !== 'cancelled')
    .sort((a: any, b: any) => {
      const da = new Date(a.dueDate || a.date).getTime()
      const db = new Date(b.dueDate || b.date).getTime()
      return da - db
    })
    .slice(0, 12)
)

const formatDay = (d?: string) => d ? new Date(d).getDate() : '—'
const formatMonth = (d?: string) => d ? new Date(d).toLocaleString('es', { month: 'short' }) : ''

const statusLabel = (s?: string) => ({
  pending: 'Pendiente', 'in-progress': 'En curso',
  completed: 'Hecha', cancelled: 'Cancelada', overdue: 'Vencida',
}[s || ''] || s || '—')

const statusClass = (s?: string) => ({
  pending: 'bg-slate-100 text-slate-500',
  'in-progress': 'bg-blue-100 text-blue-600',
  completed: 'bg-green-100 text-green-600',
  cancelled: 'bg-slate-100 text-slate-400',
  overdue: 'bg-red-100 text-red-500',
}[s || ''] || 'bg-slate-100 text-slate-400')

const refreshData = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    const ps: Promise<any>[] = []
    if (authStore.canViewClients) ps.push(clientsStore.fetchClients())
    if (authStore.canViewActivities) ps.push(activitiesStore.fetchActivities())
    if (authStore.canViewCases) ps.push(issuesStore.fetchIssues())
    if (authStore.canViewTeam) ps.push(teamStore.fetchTeam())
    await Promise.all(ps)
  } catch (e) {
    console.error('Error refreshing:', e)
  } finally {
    isRefreshing.value = false
  }
}

onMounted(async () => {
  try {
    const ps: Promise<any>[] = []
    if (authStore.canViewClients) ps.push(clientsStore.fetchClients())
    if (authStore.canViewActivities) ps.push(activitiesStore.fetchActivities())
    if (authStore.canViewCases) ps.push(issuesStore.fetchIssues())
    if (authStore.canViewTeam) ps.push(teamStore.fetchTeam())
    await Promise.all(ps)
  } catch (e) {
    console.error('Error loading dashboard:', e)
  }
})
</script>
