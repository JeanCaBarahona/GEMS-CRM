<template>
  <div class="h-full flex flex-col gap-2.5 overflow-hidden">

    <!-- ══ Header ════════════════════════════════════════════════════════ -->
    <header class="flex-none flex items-center gap-3 pr-14">

      <!-- Saludo + contexto -->
      <div>
        <p class="text-[10px] font-medium text-slate-400 leading-none mb-0.5">{{ timeGreeting }}</p>
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-slate-800 tracking-tight">{{ firstName }}</span>
          <span class="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-md uppercase tracking-wide">
            {{ userRoleLabel }}
          </span>
          <span class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full shrink-0"
              :class="criticalCount > 0 ? 'bg-red-400' : 'bg-emerald-400'"></span>
            <span class="text-[10px] font-medium"
              :class="criticalCount > 0 ? 'text-red-500' : 'text-slate-400'">
              {{ criticalCount > 0 ? `${criticalCount} críticas` : 'Al día' }}
            </span>
          </span>
        </div>
      </div>

      <div class="flex-1"></div>

      <!-- Acciones rápidas -->
      <nav class="flex items-center gap-0.5">
        <router-link v-if="authStore.canCreateClients" to="/clients"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <i class="fas fa-user-plus text-[10px]"></i><span class="hidden sm:inline">Cliente</span>
        </router-link>
        <router-link v-if="authStore.canCreateActivities" to="/activities"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <i class="fas fa-plus text-[10px]"></i><span class="hidden sm:inline">Actividad</span>
        </router-link>
        <router-link v-if="authStore.canViewCases" to="/tickets"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <i class="fas fa-ticket-alt text-[10px]"></i><span class="hidden sm:inline">Tickets</span>
        </router-link>
        <router-link v-if="authStore.canCreateCases" to="/cases"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <i class="fas fa-exclamation-circle text-[10px]"></i><span class="hidden sm:inline">Casos</span>
        </router-link>
        <router-link v-if="authStore.canCreateTeam" to="/team"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <i class="fas fa-users-cog text-[10px]"></i><span class="hidden sm:inline">Equipo</span>
        </router-link>
      </nav>

      <div class="w-px h-4 bg-slate-200 shrink-0"></div>

      <button @click="refreshData" :disabled="isRefreshing"
        class="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40">
        <i class="fas fa-sync-alt text-[9px]" :class="{ 'animate-spin': isRefreshing }"></i>
      </button>
    </header>

    <!-- ══ Grid principal  1fr | 1fr | 210px ════════════════════════════ -->
    <div class="flex-1 min-h-0 grid gap-2.5" style="grid-template-columns: 1fr 1fr 210px;">

      <!-- ── Col 1: AI Insights ──────────────────────────────────────── -->
      <AIInsightsWidget />

      <!-- ── Col 2: Por atender ──────────────────────────────────────── -->
      <div v-if="authStore.canViewActivities"
        class="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">

        <!-- Cabecera + tabs -->
        <div class="px-3 pt-2.5 border-b border-slate-100 shrink-0">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <i class="fas fa-tasks text-slate-400 text-[10px]"></i>
              <span class="text-[11px] font-bold text-slate-700">Por atender</span>
            </div>
            <router-link to="/activities"
              class="text-[10px] text-slate-400 hover:text-blue-500 font-semibold transition-colors">
              Ver todo →
            </router-link>
          </div>
          <!-- Tabs -->
          <div class="flex gap-0.5">
            <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
              :class="[
                'flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-t-lg border-b-2 transition-colors',
                activeTab === tab.key
                  ? tab.activeClass + ' border-b-current'
                  : 'text-slate-400 border-b-transparent hover:text-slate-600 hover:bg-slate-50'
              ]">
              {{ tab.label }}
              <span :class="['px-1 py-0.5 rounded text-[8px] font-black', activeTab === tab.key ? tab.badgeClass : 'bg-slate-100 text-slate-400']">
                {{ tab.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Lista -->
        <div class="flex-1 min-h-0 overflow-y-auto">

          <template v-if="activeTab === 'overdue'">
            <div v-if="overdueActivities.length === 0"
              class="h-full flex flex-col items-center justify-center gap-2 p-4">
              <i class="fas fa-check-circle text-emerald-400 text-lg"></i>
              <p class="text-[10px] text-slate-400">Sin actividades vencidas</p>
            </div>
            <div v-for="act in overdueActivities" :key="act._id"
              class="flex items-center gap-2 px-3 py-2 border-b border-slate-50 hover:bg-red-50/40 transition-colors">
              <span class="shrink-0 text-[9px] font-black text-red-500 w-7 text-right">
                {{ daysOverdue(act) }}d
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-[11px] font-semibold text-slate-700 truncate">{{ act.title }}</p>
                <p class="text-[10px] text-slate-400 truncate">
                  {{ clientsStore.clients.find(c => c._id === act.clientId)?.name || '—' }}
                </p>
              </div>
              <span :class="['shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase', statusClass(act.status)]">
                {{ statusLabel(act.status) }}
              </span>
            </div>
          </template>

          <template v-if="activeTab === 'today'">
            <div v-if="todayActivities.length === 0"
              class="h-full flex flex-col items-center justify-center gap-2 p-4">
              <i class="fas fa-sun text-amber-300 text-lg"></i>
              <p class="text-[10px] text-slate-400">Nada programado para hoy</p>
            </div>
            <div v-for="act in todayActivities" :key="act._id"
              class="flex items-center gap-2 px-3 py-2 border-b border-slate-50 hover:bg-blue-50/40 transition-colors">
              <span class="shrink-0 w-7 flex justify-center">
                <span class="w-1.5 h-1.5 rounded-full mt-1"
                  :class="act.priority === 'urgent' ? 'bg-red-400' : act.priority === 'high' ? 'bg-orange-400' : 'bg-blue-400'"></span>
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-[11px] font-semibold text-slate-700 truncate">{{ act.title }}</p>
                <p class="text-[10px] text-slate-400 truncate">
                  {{ clientsStore.clients.find(c => c._id === act.clientId)?.name || '—' }}
                </p>
              </div>
              <span :class="['shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase', statusClass(act.status)]">
                {{ statusLabel(act.status) }}
              </span>
            </div>
          </template>

          <template v-if="activeTab === 'priority'">
            <div v-if="highPriorityActivities.length === 0"
              class="h-full flex flex-col items-center justify-center gap-2 p-4">
              <i class="fas fa-shield-alt text-slate-300 text-lg"></i>
              <p class="text-[10px] text-slate-400">Sin alta prioridad</p>
            </div>
            <div v-for="act in highPriorityActivities" :key="act._id"
              class="flex items-center gap-2 px-3 py-2 border-b border-slate-50 hover:bg-orange-50/40 transition-colors">
              <span class="shrink-0 text-[8px] font-black uppercase w-7 text-right"
                :class="act.priority === 'urgent' ? 'text-red-500' : 'text-orange-500'">
                {{ act.priority === 'urgent' ? 'URG' : 'ALTA' }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-[11px] font-semibold text-slate-700 truncate">{{ act.title }}</p>
                <p class="text-[10px] text-slate-400 truncate">
                  {{ clientsStore.clients.find(c => c._id === act.clientId)?.name || '—' }}
                </p>
              </div>
              <span :class="['shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase', statusClass(act.status)]">
                {{ statusLabel(act.status) }}
              </span>
            </div>
          </template>

        </div>
      </div>

      <!-- ── Col 3: Métricas + Ritmo + Agenda ───────────────────────── -->
      <div class="flex flex-col gap-2.5 min-h-0">

        <!-- Métricas 2×2 -->
        <div class="grid grid-cols-2 gap-1.5 shrink-0">
          <div v-if="authStore.canViewClients"
            class="bg-white border border-slate-200 rounded-lg px-2.5 py-2 hover:shadow-sm transition-all">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[8px] font-black text-slate-400 uppercase tracking-wider">Clientes</span>
              <i class="fas fa-users text-blue-300 text-[8px]"></i>
            </div>
            <div class="text-lg font-black text-slate-900 leading-none">{{ stats.clients }}</div>
          </div>
          <div v-if="authStore.canViewActivities"
            class="bg-white border border-slate-200 rounded-lg px-2.5 py-2 hover:shadow-sm transition-all">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[8px] font-black text-slate-400 uppercase tracking-wider">Activ.</span>
              <i class="fas fa-clipboard-list text-green-300 text-[8px]"></i>
            </div>
            <div class="text-lg font-black text-slate-900 leading-none">{{ stats.activities }}</div>
          </div>
          <div v-if="authStore.canViewCases"
            class="bg-white border border-slate-200 rounded-lg px-2.5 py-2 hover:shadow-sm transition-all">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[8px] font-black text-slate-400 uppercase tracking-wider">Casos</span>
              <i class="fas fa-exclamation-circle text-orange-300 text-[8px]"></i>
            </div>
            <div class="text-lg font-black text-slate-900 leading-none">{{ stats.openIssues }}</div>
          </div>
          <div v-if="authStore.canViewTeam"
            class="bg-white border border-slate-200 rounded-lg px-2.5 py-2 hover:shadow-sm transition-all">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[8px] font-black text-slate-400 uppercase tracking-wider">Equipo</span>
              <i class="fas fa-user-friends text-indigo-300 text-[8px]"></i>
            </div>
            <div class="text-lg font-black text-slate-900 leading-none">{{ stats.teamMembers }}</div>
          </div>
        </div>

        <!-- Ritmo del día -->
        <div v-if="authStore.canViewActivities"
          class="bg-white border border-slate-200 rounded-lg px-3 py-2.5 shrink-0">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold text-slate-600">Ritmo del día</span>
            <span class="text-[10px] font-black text-slate-500">{{ focusProgress }}%</span>
          </div>
          <div class="h-1 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700"
              :style="{ width: focusProgress + '%' }"></div>
          </div>
          <div class="grid grid-cols-3 gap-1 text-center">
            <div class="bg-red-50 rounded py-1">
              <div class="text-xs font-black text-red-500 leading-none">{{ overdueCount }}</div>
              <div class="text-[8px] text-red-400 font-semibold mt-0.5">Vencidas</div>
            </div>
            <div class="bg-blue-50 rounded py-1">
              <div class="text-xs font-black text-blue-500 leading-none">{{ todayCount }}</div>
              <div class="text-[8px] text-blue-400 font-semibold mt-0.5">Hoy</div>
            </div>
            <div class="bg-orange-50 rounded py-1">
              <div class="text-xs font-black text-orange-500 leading-none">{{ highPriorityCount }}</div>
              <div class="text-[8px] text-orange-400 font-semibold mt-0.5">Prioridad</div>
            </div>
          </div>
        </div>

        <!-- Agenda -->
        <div class="bg-white border border-slate-200 rounded-xl flex flex-col flex-1 min-h-0 overflow-hidden">
          <div class="flex items-center justify-between px-3 py-2 border-b border-slate-100 shrink-0">
            <div class="flex items-center gap-1.5">
              <i class="fas fa-calendar-day text-blue-400 text-[9px]"></i>
              <span class="text-[11px] font-bold text-slate-700">Agenda</span>
            </div>
            <router-link to="/activities"
              class="text-[10px] text-slate-400 hover:text-blue-500 font-semibold transition-colors">
              Ver →
            </router-link>
          </div>
          <div v-if="upcomingActivities.length === 0"
            class="flex-1 flex items-center justify-center">
            <p class="text-[10px] text-slate-400">Sin próximas</p>
          </div>
          <div v-else class="flex-1 overflow-y-auto">
            <div v-for="act in upcomingActivities" :key="act._id"
              class="flex items-center gap-2 px-3 py-2 border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
              <div class="shrink-0 w-7 text-center">
                <div class="text-[11px] font-black text-slate-700 leading-none">{{ formatDay(act.dueDate || act.date) }}</div>
                <div class="text-[8px] text-slate-400 uppercase">{{ formatMonth(act.dueDate || act.date) }}</div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] font-semibold text-slate-700 truncate">{{ act.title }}</p>
                <p class="text-[9px] text-slate-400 truncate">
                  {{ clientsStore.clients.find(c => c._id === act.clientId)?.name || '—' }}
                </p>
              </div>
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
import AIInsightsWidget from '../components/AIInsightsWidget.vue'

const authStore = useAuthStore()
const clientsStore = useClientsStore()
const activitiesStore = useActivitiesStore()
const issuesStore = useIssuesStore()
const teamStore = useTeamStore()

const isRefreshing = ref(false)
const activeTab = ref<'overdue' | 'today' | 'priority'>('overdue')

const firstName = computed(() => authStore.user?.name?.split(' ')[0] || 'Usuario')
const userRoleLabel = computed(() => ({
  admin: 'Admin', manager: 'Manager', employee: 'Empleado',
  support: 'Soporte', development: 'Dev', fullstack: 'Fullstack',
  viewer: 'Viewer', client: 'Cliente',
}[authStore.user?.role || ''] || authStore.user?.role || 'Usuario'))

const timeGreeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días,'
  if (h < 18) return 'Buenas tardes,'
  return 'Buenas noches,'
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

const tabs = computed(() => [
  { key: 'overdue' as const, label: 'Vencidas', count: overdueCount.value, activeClass: 'text-red-500 bg-red-50/60', badgeClass: 'bg-red-100 text-red-500' },
  { key: 'today' as const, label: 'Hoy', count: todayCount.value, activeClass: 'text-blue-600 bg-blue-50/60', badgeClass: 'bg-blue-100 text-blue-600' },
  { key: 'priority' as const, label: 'Prioridad', count: highPriorityCount.value, activeClass: 'text-orange-500 bg-orange-50/60', badgeClass: 'bg-orange-100 text-orange-500' },
])

const overdueActivities = computed(() =>
  [...activitiesStore.activities]
    .filter((a: any) => {
      if (a.status === 'completed' || a.status === 'cancelled') return false
      const d = new Date(a.dueDate || a.date); d.setHours(0, 0, 0, 0)
      return d < todayMidnight
    })
    .sort((a: any, b: any) => new Date(a.dueDate || a.date).getTime() - new Date(b.dueDate || b.date).getTime())
)

const todayActivities = computed(() =>
  [...activitiesStore.activities]
    .filter((a: any) => {
      if (a.status === 'completed' || a.status === 'cancelled') return false
      const d = new Date(a.dueDate || a.date); d.setHours(0, 0, 0, 0)
      return d.getTime() === todayMidnight.getTime()
    })
    .sort((a: any, b: any) => {
      const o: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
      return (o[a.priority] ?? 2) - (o[b.priority] ?? 2)
    })
)

const highPriorityActivities = computed(() =>
  [...activitiesStore.activities]
    .filter((a: any) =>
      (a.priority === 'high' || a.priority === 'urgent') &&
      a.status !== 'completed' && a.status !== 'cancelled'
    )
    .sort((a: any, b: any) => {
      const o: Record<string, number> = { urgent: 0, high: 1 }
      return (o[a.priority] ?? 1) - (o[b.priority] ?? 1)
    })
)

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
