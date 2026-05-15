<template>
  <div class="h-full flex flex-col gap-3 overflow-hidden">

    <!-- ── Header ──────────────────────────────────────────────────── -->
    <div class="flex items-center gap-3 flex-none flex-wrap">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <span class="text-base font-black text-slate-900 leading-none">Hola, {{ firstName }}</span>
        <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-wider shrink-0">
          {{ userRoleLabel }}
        </span>
        <span class="text-slate-300 hidden sm:inline">·</span>
        <span class="text-xs hidden sm:inline" :class="criticalCount > 0 ? 'text-red-500 font-semibold' : 'text-emerald-600 font-medium'">
          {{ criticalCount > 0 ? `${criticalCount} actividades críticas` : 'Todo en orden' }}
        </span>
      </div>

      <!-- Quick actions -->
      <div class="flex items-center gap-1.5">
        <router-link v-if="authStore.canCreateClients" to="/clients"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all group text-xs font-semibold text-slate-600">
          <i class="fas fa-user-plus text-blue-400 text-[10px]"></i>
          <span class="hidden sm:inline">Cliente</span>
        </router-link>
        <router-link v-if="authStore.canCreateActivities" to="/activities"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-green-300 hover:bg-green-50 transition-all group text-xs font-semibold text-slate-600">
          <i class="fas fa-plus-circle text-green-400 text-[10px]"></i>
          <span class="hidden sm:inline">Actividad</span>
        </router-link>
        <router-link v-if="authStore.canViewCases" to="/tickets"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50 transition-all group text-xs font-semibold text-slate-600">
          <i class="fas fa-ticket-alt text-sky-400 text-[10px]"></i>
          <span class="hidden sm:inline">Tickets</span>
        </router-link>
        <router-link v-if="authStore.canCreateCases" to="/cases"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50 transition-all group text-xs font-semibold text-slate-600">
          <i class="fas fa-exclamation-circle text-orange-400 text-[10px]"></i>
          <span class="hidden sm:inline">Caso</span>
        </router-link>
        <router-link v-if="authStore.canCreateTeam" to="/team"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-all group text-xs font-semibold text-slate-600">
          <i class="fas fa-users-cog text-indigo-400 text-[10px]"></i>
          <span class="hidden sm:inline">Equipo</span>
        </router-link>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button @click="refreshData" :disabled="isRefreshing"
          class="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all">
          <i class="fas fa-sync-alt text-[10px]" :class="{ 'animate-spin': isRefreshing }"></i>
        </button>
        <div class="w-7 h-7 rounded-lg bg-slate-800 text-white text-[10px] font-black flex items-center justify-center shrink-0 select-none">
          {{ userInitials }}
        </div>
      </div>
    </div>

    <!-- ── Main grid: izquierda 1fr · derecha 296px ─────────────────── -->
    <div class="flex-1 min-h-0 grid gap-3" style="grid-template-columns: 1fr 296px">

      <!-- ═══ COLUMNA IZQUIERDA ═══ -->
      <div class="flex flex-col gap-3 min-h-0">

        <!-- AI Insights (auto-height, solo ocupa lo que necesita) -->
        <AIInsightsWidget />

        <!-- Sub-grid 2 columnas: Vencidas | Hoy & Alta prioridad -->
        <PermissionGuard :permissions="['view-activities']" :fallback="false">
          <div class="flex-1 min-h-0 grid grid-cols-2 gap-3">

            <!-- Panel: Vencidas -->
            <div class="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
              <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 shrink-0">
                <div class="flex items-center gap-2">
                  <div class="w-5 h-5 bg-red-50 rounded-md flex items-center justify-center">
                    <i class="fas fa-clock text-red-400 text-[9px]"></i>
                  </div>
                  <span class="text-xs font-bold text-slate-700">Vencidas</span>
                  <span v-if="overdueActivities.length" class="text-[10px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                    {{ overdueActivities.length }}
                  </span>
                </div>
                <router-link to="/activities" class="text-[10px] text-slate-400 hover:text-blue-500 font-semibold">Ver →</router-link>
              </div>

              <div v-if="overdueActivities.length === 0" class="flex-1 flex items-center justify-center">
                <div class="text-center py-4">
                  <i class="fas fa-check-circle text-emerald-400 text-lg mb-1 block"></i>
                  <p class="text-[11px] text-slate-400">Sin actividades vencidas</p>
                </div>
              </div>
              <div v-else class="flex-1 overflow-y-auto divide-y divide-slate-50">
                <div v-for="act in overdueActivities" :key="act._id"
                  class="flex items-start gap-2.5 px-4 py-2.5 hover:bg-red-50/40 transition-colors group">
                  <div class="shrink-0 mt-0.5">
                    <div class="text-[10px] font-black text-red-400 leading-none">{{ daysOverdue(act) }}d</div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-[11px] font-semibold text-slate-700 truncate">{{ act.title }}</div>
                    <div class="text-[10px] text-slate-400 truncate">
                      {{ clientsStore.clients.find(c => c._id === act.clientId)?.name || '—' }}
                    </div>
                  </div>
                  <span :class="['shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase', statusClass(act.status)]">
                    {{ statusLabel(act.status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Panel: Hoy & Alta prioridad -->
            <div class="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
              <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 shrink-0">
                <div class="flex items-center gap-2">
                  <div class="w-5 h-5 bg-amber-50 rounded-md flex items-center justify-center">
                    <i class="fas fa-bolt text-amber-400 text-[9px]"></i>
                  </div>
                  <span class="text-xs font-bold text-slate-700">Hoy & Prioridad</span>
                  <span v-if="urgentActivities.length" class="text-[10px] font-black text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full">
                    {{ urgentActivities.length }}
                  </span>
                </div>
                <router-link to="/activities" class="text-[10px] text-slate-400 hover:text-blue-500 font-semibold">Ver →</router-link>
              </div>

              <div v-if="urgentActivities.length === 0" class="flex-1 flex items-center justify-center">
                <div class="text-center py-4">
                  <i class="fas fa-sun text-amber-300 text-lg mb-1 block"></i>
                  <p class="text-[11px] text-slate-400">Sin pendientes urgentes</p>
                </div>
              </div>
              <div v-else class="flex-1 overflow-y-auto divide-y divide-slate-50">
                <div v-for="act in urgentActivities" :key="act._id"
                  class="flex items-start gap-2.5 px-4 py-2.5 hover:bg-amber-50/40 transition-colors">
                  <div class="shrink-0 mt-0.5">
                    <span v-if="act.priority === 'urgent'" class="text-[9px] font-black text-red-500 uppercase">URG</span>
                    <span v-else-if="act.priority === 'high'" class="text-[9px] font-black text-orange-500 uppercase">ALTA</span>
                    <span v-else class="text-[9px] font-black text-blue-400 uppercase">HOY</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-[11px] font-semibold text-slate-700 truncate">{{ act.title }}</div>
                    <div class="text-[10px] text-slate-400 truncate">
                      {{ clientsStore.clients.find(c => c._id === act.clientId)?.name || '—' }}
                    </div>
                  </div>
                  <span :class="['shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase', statusClass(act.status)]">
                    {{ statusLabel(act.status) }}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </PermissionGuard>
      </div>

      <!-- ═══ COLUMNA DERECHA ═══ -->
      <div class="flex flex-col gap-3 min-h-0">

        <!-- Métricas 2×2 -->
        <div class="grid grid-cols-2 gap-2.5 shrink-0">
          <PermissionGuard :permissions="['view-clients']" :fallback="false">
            <div class="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:shadow-sm transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Clientes</span>
                <div class="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                  <i class="fas fa-users text-blue-500 text-[9px]"></i>
                </div>
              </div>
              <div class="text-xl font-black text-slate-900">{{ stats.clients }}</div>
            </div>
          </PermissionGuard>

          <PermissionGuard :permissions="['view-activities']" :fallback="false">
            <div class="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:shadow-sm transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Actividades</span>
                <div class="w-6 h-6 bg-green-50 rounded-lg flex items-center justify-center">
                  <i class="fas fa-clipboard-list text-green-500 text-[9px]"></i>
                </div>
              </div>
              <div class="text-xl font-black text-slate-900">{{ stats.activities }}</div>
            </div>
          </PermissionGuard>

          <PermissionGuard :permissions="['view-cases']" :fallback="false">
            <div class="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:shadow-sm transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Casos</span>
                <div class="w-6 h-6 bg-orange-50 rounded-lg flex items-center justify-center">
                  <i class="fas fa-exclamation-circle text-orange-500 text-[9px]"></i>
                </div>
              </div>
              <div class="text-xl font-black text-slate-900">{{ stats.openIssues }}</div>
            </div>
          </PermissionGuard>

          <PermissionGuard :permissions="['view-team']" :fallback="false">
            <div class="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:shadow-sm transition-all">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Equipo</span>
                <div class="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <i class="fas fa-user-friends text-indigo-500 text-[9px]"></i>
                </div>
              </div>
              <div class="text-xl font-black text-slate-900">{{ stats.teamMembers }}</div>
            </div>
          </PermissionGuard>
        </div>

        <!-- Ritmo del día -->
        <PermissionGuard :permissions="['view-activities']" :fallback="false">
          <div class="bg-white border border-slate-200 rounded-xl px-4 py-3 shrink-0">
            <div class="flex items-center justify-between mb-2.5">
              <div class="flex items-center gap-1.5">
                <i class="fas fa-bolt text-yellow-400 text-[10px]"></i>
                <span class="text-xs font-bold text-slate-700">Ritmo del día</span>
              </div>
              <span class="text-xs font-black text-slate-500">{{ focusProgress }}%</span>
            </div>
            <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
              <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700"
                :style="{ width: focusProgress + '%' }"></div>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="bg-red-50 rounded-lg py-2">
                <div class="text-sm font-black text-red-500 leading-none">{{ overdueCount }}</div>
                <div class="text-[9px] text-red-400 font-semibold mt-0.5">Vencidas</div>
              </div>
              <div class="bg-blue-50 rounded-lg py-2">
                <div class="text-sm font-black text-blue-500 leading-none">{{ todayCount }}</div>
                <div class="text-[9px] text-blue-400 font-semibold mt-0.5">Hoy</div>
              </div>
              <div class="bg-orange-50 rounded-lg py-2">
                <div class="text-sm font-black text-orange-500 leading-none">{{ highPriorityCount }}</div>
                <div class="text-[9px] text-orange-400 font-semibold mt-0.5">Prioridad</div>
              </div>
            </div>
          </div>
        </PermissionGuard>

        <!-- Agenda próxima -->
        <PermissionGuard :permissions="['view-activities']" :fallback="false">
          <div class="bg-white border border-slate-200 rounded-xl flex flex-col flex-1 min-h-0 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 shrink-0">
              <div class="flex items-center gap-1.5">
                <i class="fas fa-calendar-day text-blue-500 text-[10px]"></i>
                <span class="text-xs font-bold text-slate-700">Agenda</span>
              </div>
              <router-link to="/activities" class="text-[10px] text-blue-500 hover:text-blue-600 font-bold">Ver todo →</router-link>
            </div>
            <div v-if="upcomingActivities.length === 0" class="flex-1 flex items-center justify-center">
              <p class="text-[11px] text-slate-400">Sin actividades próximas</p>
            </div>
            <div v-else class="flex-1 overflow-y-auto divide-y divide-slate-50">
              <div v-for="act in upcomingActivities" :key="act._id"
                class="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                <div class="shrink-0 w-8 text-center">
                  <div class="text-xs font-black text-slate-800 leading-none">{{ formatDay(act.dueDate || act.date) }}</div>
                  <div class="text-[9px] text-slate-400 font-semibold uppercase">{{ formatMonth(act.dueDate || act.date) }}</div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-[11px] font-semibold text-slate-700 truncate">{{ act.title }}</div>
                  <div class="text-[10px] text-slate-400 truncate">
                    {{ clientsStore.clients.find(c => c._id === act.clientId)?.name || '—' }}
                  </div>
                </div>
                <span :class="['shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase', statusClass(act.status)]">
                  {{ statusLabel(act.status) }}
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
import { useClientsStore, useActivitiesStore, useIssuesStore, useTeamStore } from '../stores'
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
  const m: Record<string, string> = {
    admin: 'Admin', manager: 'Manager', employee: 'Empleado',
    support: 'Soporte', development: 'Dev', fullstack: 'Fullstack',
    viewer: 'Viewer', client: 'Cliente',
  }
  return m[authStore.user?.role || ''] || authStore.user?.role || 'Usuario'
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
    const d = new Date(a.dueDate || a.date); d.setHours(0, 0, 0, 0)
    return d < todayMidnight
  }).length
)

const todayCount = computed(() =>
  activitiesStore.activities.filter((a: any) => {
    if (a.status === 'completed' || a.status === 'cancelled') return false
    const d = new Date(a.dueDate || a.date); d.setHours(0, 0, 0, 0)
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

const focusProgress = computed(() => {
  const total = activitiesStore.activities.length
  if (!total) return 0
  return Math.round(activitiesStore.activities.filter((a: any) => a.status === 'completed').length / total * 100)
})

// Vencidas: ordenadas de más antigua a más reciente
const overdueActivities = computed(() =>
  [...activitiesStore.activities]
    .filter((a: any) => {
      if (a.status === 'completed' || a.status === 'cancelled') return false
      const d = new Date(a.dueDate || a.date); d.setHours(0, 0, 0, 0)
      return d < todayMidnight
    })
    .sort((a: any, b: any) => new Date(a.dueDate || a.date).getTime() - new Date(b.dueDate || b.date).getTime())
)

// Hoy + alta prioridad (sin vencidas): urgentes primero, luego alta, luego hoy
const urgentActivities = computed(() =>
  [...activitiesStore.activities]
    .filter((a: any) => {
      if (a.status === 'completed' || a.status === 'cancelled') return false
      const d = new Date(a.dueDate || a.date); d.setHours(0, 0, 0, 0)
      const isToday = d.getTime() === todayMidnight.getTime()
      const isHighPriority = a.priority === 'high' || a.priority === 'urgent'
      const isOverdue = d < todayMidnight
      return (isToday || isHighPriority) && !isOverdue
    })
    .sort((a: any, b: any) => {
      const pOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
      return (pOrder[a.priority] ?? 2) - (pOrder[b.priority] ?? 2)
    })
)

// Agenda: próximas no críticas (no vencidas, no de hoy con alta prio)
const upcomingActivities = computed(() =>
  [...activitiesStore.activities]
    .filter((a: any) => {
      if (a.status === 'completed' || a.status === 'cancelled') return false
      const d = new Date(a.dueDate || a.date); d.setHours(0, 0, 0, 0)
      return d > todayMidnight
    })
    .sort((a: any, b: any) => new Date(a.dueDate || a.date).getTime() - new Date(b.dueDate || b.date).getTime())
    .slice(0, 12)
)

const daysOverdue = (a: any): number => {
  const due = new Date(a.dueDate || a.date); due.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((todayMidnight.getTime() - due.getTime()) / 86400000))
}

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
