<template>
  <div class="h-full flex flex-col gap-3 overflow-hidden">

    <!-- ── Header ──────────────────────────────────────────────────── -->
    <div class="flex items-center gap-3 flex-none flex-wrap pr-12">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <span class="text-base font-black text-slate-900">Hola, {{ firstName }}</span>
        <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-wider">
          {{ userRoleLabel }}
        </span>
        <span class="text-slate-300 hidden sm:inline">·</span>
        <span class="text-xs hidden sm:inline font-medium" :class="criticalCount > 0 ? 'text-red-500' : 'text-emerald-600'">
          {{ criticalCount > 0 ? `${criticalCount} actividades críticas` : 'Todo en orden' }}
        </span>
      </div>

      <div class="flex items-center gap-1.5">
        <router-link v-if="authStore.canCreateClients" to="/clients"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50 transition-all text-xs font-semibold text-slate-600 group">
          <i class="fas fa-user-plus text-blue-400 group-hover:text-blue-500 text-[10px]"></i>
          <span class="hidden sm:inline">Cliente</span>
        </router-link>
        <router-link v-if="authStore.canCreateActivities" to="/activities"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-green-200 hover:bg-green-50 transition-all text-xs font-semibold text-slate-600 group">
          <i class="fas fa-plus-circle text-green-400 group-hover:text-green-500 text-[10px]"></i>
          <span class="hidden sm:inline">Actividad</span>
        </router-link>
        <router-link v-if="authStore.canViewCases" to="/tickets"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50 transition-all text-xs font-semibold text-slate-600 group">
          <i class="fas fa-ticket-alt text-sky-400 group-hover:text-sky-500 text-[10px]"></i>
          <span class="hidden sm:inline">Tickets</span>
        </router-link>
        <router-link v-if="authStore.canCreateCases" to="/cases"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50 transition-all text-xs font-semibold text-slate-600 group">
          <i class="fas fa-exclamation-circle text-orange-400 group-hover:text-orange-500 text-[10px]"></i>
          <span class="hidden sm:inline">Caso</span>
        </router-link>
        <router-link v-if="authStore.canCreateTeam" to="/team"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50 transition-all text-xs font-semibold text-slate-600 group">
          <i class="fas fa-users-cog text-indigo-400 group-hover:text-indigo-500 text-[10px]"></i>
          <span class="hidden sm:inline">Equipo</span>
        </router-link>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button @click="refreshData" :disabled="isRefreshing"
          class="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all">
          <i class="fas fa-sync-alt text-[10px]" :class="{ 'animate-spin': isRefreshing }"></i>
        </button>
        <div class="w-7 h-7 rounded-lg bg-slate-800 text-white text-[10px] font-black flex items-center justify-center select-none">
          {{ userInitials }}
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════════
         GRID 2 × 2
         Col 1 (1fr): izquierda — Col 2 (290px): derecha
         Fila 1 (auto): AI insights | Métricas + Ritmo del día
         Fila 2 (1fr):  Vencidas + Urgentes | Agenda
         ════════════════════════════════════════════════════════════════ -->
    <div
      class="flex-1 min-h-0"
      style="display:grid; grid-template-columns:1fr 290px; grid-template-rows:auto 1fr; gap:12px;"
    >

      <!-- ─── [Fila 1 · Col 1] AI Insights ─────────────────────────── -->
      <AIInsightsWidget class="self-start" />

      <!-- ─── [Fila 1+2 · Col 2] Columna derecha — abarca ambas filas ── -->
      <div class="flex flex-col gap-3 min-h-0" style="grid-row: 1 / 3">

        <!-- Métricas 2×2 -->
        <div class="grid grid-cols-2 gap-2">
          <div v-if="authStore.canViewClients"
            class="bg-white border border-slate-200 rounded-xl px-3.5 py-3 hover:shadow-sm transition-all">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Clientes</span>
              <div class="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center">
                <i class="fas fa-users text-blue-400 text-[8px]"></i>
              </div>
            </div>
            <div class="text-xl font-black text-slate-900 leading-none">{{ stats.clients }}</div>
          </div>

          <div v-if="authStore.canViewActivities"
            class="bg-white border border-slate-200 rounded-xl px-3.5 py-3 hover:shadow-sm transition-all">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Activ.</span>
              <div class="w-5 h-5 bg-green-50 rounded-md flex items-center justify-center">
                <i class="fas fa-clipboard-list text-green-400 text-[8px]"></i>
              </div>
            </div>
            <div class="text-xl font-black text-slate-900 leading-none">{{ stats.activities }}</div>
          </div>

          <div v-if="authStore.canViewCases"
            class="bg-white border border-slate-200 rounded-xl px-3.5 py-3 hover:shadow-sm transition-all">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Casos</span>
              <div class="w-5 h-5 bg-orange-50 rounded-md flex items-center justify-center">
                <i class="fas fa-exclamation-circle text-orange-400 text-[8px]"></i>
              </div>
            </div>
            <div class="text-xl font-black text-slate-900 leading-none">{{ stats.openIssues }}</div>
          </div>

          <div v-if="authStore.canViewTeam"
            class="bg-white border border-slate-200 rounded-xl px-3.5 py-3 hover:shadow-sm transition-all">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Equipo</span>
              <div class="w-5 h-5 bg-indigo-50 rounded-md flex items-center justify-center">
                <i class="fas fa-user-friends text-indigo-400 text-[8px]"></i>
              </div>
            </div>
            <div class="text-xl font-black text-slate-900 leading-none">{{ stats.teamMembers }}</div>
          </div>
        </div>

        <!-- Ritmo del día -->
        <div v-if="authStore.canViewActivities" class="bg-white border border-slate-200 rounded-xl px-3.5 py-3">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <i class="fas fa-bolt text-yellow-400 text-[9px]"></i>
              <span class="text-xs font-bold text-slate-700">Ritmo del día</span>
            </div>
            <span class="text-xs font-black text-slate-500">{{ focusProgress }}%</span>
          </div>
          <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2.5">
            <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700"
              :style="{ width: focusProgress + '%' }"></div>
          </div>
          <div class="grid grid-cols-3 gap-1.5 text-center">
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

        <!-- Agenda: llena el espacio restante de la columna derecha -->
        <div class="bg-white border border-slate-200 rounded-xl flex flex-col flex-1 min-h-0 overflow-hidden">
          <div class="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 shrink-0">
            <div class="flex items-center gap-1.5">
              <i class="fas fa-calendar-day text-blue-500 text-[10px]"></i>
              <span class="text-xs font-bold text-slate-700">Agenda</span>
            </div>
            <router-link to="/activities" class="text-[10px] text-blue-500 hover:text-blue-600 font-bold">Ver todo →</router-link>
          </div>
          <div v-if="upcomingActivities.length === 0" class="flex-1 flex items-center justify-center">
            <p class="text-[10px] text-slate-400">Sin actividades próximas</p>
          </div>
          <div v-else class="flex-1 overflow-y-auto divide-y divide-slate-50">
            <div v-for="act in upcomingActivities" :key="act._id"
              class="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-50 transition-colors">
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

      </div>

      <!-- ─── [Fila 2 · Col 1] Vencidas | Hoy & Prioridad ──────────── -->
      <div class="grid grid-cols-2 gap-3 min-h-0 overflow-hidden">

        <!-- Vencidas -->
        <div class="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 shrink-0">
            <div class="flex items-center gap-1.5">
              <div class="w-5 h-5 bg-red-50 rounded-md flex items-center justify-center">
                <i class="fas fa-clock text-red-400 text-[9px]"></i>
              </div>
              <span class="text-xs font-bold text-slate-700">Vencidas</span>
              <span v-if="overdueActivities.length"
                class="text-[9px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                {{ overdueActivities.length }}
              </span>
            </div>
            <router-link to="/activities" class="text-[10px] text-slate-400 hover:text-blue-500 font-semibold">Ver →</router-link>
          </div>
          <div v-if="overdueActivities.length === 0" class="flex-1 flex items-center justify-center">
            <div class="text-center py-3">
              <i class="fas fa-check-circle text-emerald-400 text-base mb-1 block"></i>
              <p class="text-[10px] text-slate-400">Sin actividades vencidas</p>
            </div>
          </div>
          <div v-else class="flex-1 overflow-y-auto divide-y divide-slate-50">
            <div v-for="act in overdueActivities" :key="act._id"
              class="flex items-center gap-2 px-3.5 py-2 hover:bg-red-50/30 transition-colors">
              <span class="text-[10px] font-black text-red-400 shrink-0 w-7">{{ daysOverdue(act) }}d</span>
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

        <!-- Hoy & Prioridad -->
        <div class="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 shrink-0">
            <div class="flex items-center gap-1.5">
              <div class="w-5 h-5 bg-amber-50 rounded-md flex items-center justify-center">
                <i class="fas fa-bolt text-amber-400 text-[9px]"></i>
              </div>
              <span class="text-xs font-bold text-slate-700">Hoy & Prioridad</span>
              <span v-if="urgentActivities.length"
                class="text-[9px] font-black text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full">
                {{ urgentActivities.length }}
              </span>
            </div>
            <router-link to="/activities" class="text-[10px] text-slate-400 hover:text-blue-500 font-semibold">Ver →</router-link>
          </div>
          <div v-if="urgentActivities.length === 0" class="flex-1 flex items-center justify-center">
            <div class="text-center py-3">
              <i class="fas fa-sun text-amber-300 text-base mb-1 block"></i>
              <p class="text-[10px] text-slate-400">Sin pendientes urgentes</p>
            </div>
          </div>
          <div v-else class="flex-1 overflow-y-auto divide-y divide-slate-50">
            <div v-for="act in urgentActivities" :key="act._id"
              class="flex items-center gap-2 px-3.5 py-2 hover:bg-amber-50/30 transition-colors">
              <span class="shrink-0 w-7 text-[9px] font-black uppercase"
                :class="act.priority === 'urgent' ? 'text-red-500' : act.priority === 'high' ? 'text-orange-500' : 'text-blue-400'">
                {{ act.priority === 'urgent' ? 'URG' : act.priority === 'high' ? 'ALTA' : 'HOY' }}
              </span>
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
const userRoleLabel = computed(() => ({
  admin: 'Admin', manager: 'Manager', employee: 'Empleado',
  support: 'Soporte', development: 'Dev', fullstack: 'Fullstack',
  viewer: 'Viewer', client: 'Cliente',
}[authStore.user?.role || ''] || authStore.user?.role || 'Usuario'))

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

// Vencidas: más antigua primero
const overdueActivities = computed(() =>
  [...activitiesStore.activities]
    .filter((a: any) => {
      if (a.status === 'completed' || a.status === 'cancelled') return false
      const d = new Date(a.dueDate || a.date); d.setHours(0, 0, 0, 0)
      return d < todayMidnight
    })
    .sort((a: any, b: any) => new Date(a.dueDate || a.date).getTime() - new Date(b.dueDate || b.date).getTime())
)

// Hoy + alta prioridad (no vencidas), urgentes primero
const urgentActivities = computed(() =>
  [...activitiesStore.activities]
    .filter((a: any) => {
      if (a.status === 'completed' || a.status === 'cancelled') return false
      const d = new Date(a.dueDate || a.date); d.setHours(0, 0, 0, 0)
      const isToday = d.getTime() === todayMidnight.getTime()
      const isHighP = a.priority === 'high' || a.priority === 'urgent'
      return (isToday || isHighP) && d >= todayMidnight
    })
    .sort((a: any, b: any) => {
      const o: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
      return (o[a.priority] ?? 2) - (o[b.priority] ?? 2)
    })
)

// Agenda: próximas (> hoy), máx 12
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

const daysOverdue = (a: any) =>
  Math.max(0, Math.floor((todayMidnight.getTime() - new Date(a.dueDate || a.date).setHours(0,0,0,0)) / 86400000))

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
  } finally { isRefreshing.value = false }
}

onMounted(async () => {
  try {
    const ps: Promise<any>[] = []
    if (authStore.canViewClients) ps.push(clientsStore.fetchClients())
    if (authStore.canViewActivities) ps.push(activitiesStore.fetchActivities())
    if (authStore.canViewCases) ps.push(issuesStore.fetchIssues())
    if (authStore.canViewTeam) ps.push(teamStore.fetchTeam())
    await Promise.all(ps)
  } catch (e) { console.error('Error loading dashboard:', e) }
})
</script>
