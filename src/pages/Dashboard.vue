<template>
  <div class="h-full flex flex-col gap-3 overflow-hidden">

    <!-- ── Header ─────────────────────────────────────────────────────── -->
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

    <!-- ── Main grid 3 cols ─────────────────────────────────────────── -->
    <!-- Col 1: AI Insights (1fr) | Col 2: Por atender (1fr) | Col 3: Stats + Agenda (260px) -->
    <div class="flex-1 min-h-0 grid gap-3" style="grid-template-columns: 1fr 1fr 260px;">

      <!-- ── Col 1: AI Insights ────────────────────────────────────── -->
      <AIInsightsWidget />

      <!-- ── Col 2: Por atender (tabs Vencidas / Hoy / Prioridad) ─── -->
      <div v-if="authStore.canViewActivities"
        class="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">

        <!-- Panel header + tabs -->
        <div class="px-3.5 pt-3 pb-0 border-b border-slate-100 shrink-0">
          <div class="flex items-center justify-between mb-2.5">
            <div class="flex items-center gap-1.5">
              <i class="fas fa-tasks text-blue-500 text-[10px]"></i>
              <span class="text-xs font-bold text-slate-700">Por atender</span>
            </div>
            <router-link to="/activities" class="text-[10px] text-blue-500 hover:text-blue-600 font-bold">Ver todo →</router-link>
          </div>
          <!-- Tab bar -->
          <div class="flex gap-0.5">
            <button
              v-for="tab in tabs" :key="tab.key"
              @click="activeTab = tab.key"
              :class="[
                'flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-t-lg transition-colors border-b-2',
                activeTab === tab.key
                  ? 'border-b-blue-500 text-blue-600 bg-blue-50/60'
                  : 'border-b-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              ]"
            >
              <span>{{ tab.label }}</span>
              <span :class="[
                'px-1 py-0.5 rounded-full text-[8px] font-black',
                activeTab === tab.key ? tab.activeBadge : 'bg-slate-100 text-slate-400'
              ]">{{ tab.count }}</span>
            </button>
          </div>
        </div>

        <!-- Tab content -->
        <div class="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-50">

          <!-- Vencidas -->
          <template v-if="activeTab === 'overdue'">
            <div v-if="overdueActivities.length === 0" class="h-full flex items-center justify-center">
              <div class="text-center py-6">
                <i class="fas fa-check-circle text-emerald-400 text-xl mb-2 block"></i>
                <p class="text-[10px] text-slate-400">Sin actividades vencidas</p>
              </div>
            </div>
            <div v-for="act in overdueActivities" :key="act._id"
              class="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-red-50/30 transition-colors">
              <div class="shrink-0 w-8 text-center">
                <div class="text-[10px] font-black text-red-500 leading-none">{{ daysOverdue(act) }}d</div>
                <div class="text-[8px] text-red-300 font-semibold">vcda</div>
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
          </template>

          <!-- Hoy -->
          <template v-if="activeTab === 'today'">
            <div v-if="todayActivities.length === 0" class="h-full flex items-center justify-center">
              <div class="text-center py-6">
                <i class="fas fa-sun text-amber-300 text-xl mb-2 block"></i>
                <p class="text-[10px] text-slate-400">Nada programado para hoy</p>
              </div>
            </div>
            <div v-for="act in todayActivities" :key="act._id"
              class="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-blue-50/30 transition-colors">
              <div class="shrink-0 w-8 text-center">
                <div class="w-5 h-5 mx-auto rounded-md flex items-center justify-center"
                  :class="act.priority === 'urgent' ? 'bg-red-50' : act.priority === 'high' ? 'bg-orange-50' : 'bg-blue-50'">
                  <i class="fas fa-circle text-[6px]"
                    :class="act.priority === 'urgent' ? 'text-red-400' : act.priority === 'high' ? 'text-orange-400' : 'text-blue-400'"></i>
                </div>
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
          </template>

          <!-- Alta prioridad -->
          <template v-if="activeTab === 'priority'">
            <div v-if="highPriorityActivities.length === 0" class="h-full flex items-center justify-center">
              <div class="text-center py-6">
                <i class="fas fa-shield-alt text-slate-300 text-xl mb-2 block"></i>
                <p class="text-[10px] text-slate-400">Sin actividades de alta prioridad</p>
              </div>
            </div>
            <div v-for="act in highPriorityActivities" :key="act._id"
              class="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-orange-50/30 transition-colors">
              <div class="shrink-0 w-8 text-center">
                <span class="text-[9px] font-black uppercase"
                  :class="act.priority === 'urgent' ? 'text-red-500' : 'text-orange-500'">
                  {{ act.priority === 'urgent' ? 'URG' : 'ALTA' }}
                </span>
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
          </template>

        </div>
      </div>

      <!-- ── Col 3: Stats + Ritmo + Agenda ─────────────────────────── -->
      <div class="flex flex-col gap-3 min-h-0">

        <!-- Métricas 2×2 -->
        <div class="grid grid-cols-2 gap-2 shrink-0">
          <div v-if="authStore.canViewClients"
            class="bg-white border border-slate-200 rounded-xl px-3 py-2.5 hover:shadow-sm transition-all">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Clientes</span>
              <div class="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center">
                <i class="fas fa-users text-blue-400 text-[8px]"></i>
              </div>
            </div>
            <div class="text-xl font-black text-slate-900 leading-none">{{ stats.clients }}</div>
          </div>

          <div v-if="authStore.canViewActivities"
            class="bg-white border border-slate-200 rounded-xl px-3 py-2.5 hover:shadow-sm transition-all">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Activ.</span>
              <div class="w-5 h-5 bg-green-50 rounded-md flex items-center justify-center">
                <i class="fas fa-clipboard-list text-green-400 text-[8px]"></i>
              </div>
            </div>
            <div class="text-xl font-black text-slate-900 leading-none">{{ stats.activities }}</div>
          </div>

          <div v-if="authStore.canViewCases"
            class="bg-white border border-slate-200 rounded-xl px-3 py-2.5 hover:shadow-sm transition-all">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Casos</span>
              <div class="w-5 h-5 bg-orange-50 rounded-md flex items-center justify-center">
                <i class="fas fa-exclamation-circle text-orange-400 text-[8px]"></i>
              </div>
            </div>
            <div class="text-xl font-black text-slate-900 leading-none">{{ stats.openIssues }}</div>
          </div>

          <div v-if="authStore.canViewTeam"
            class="bg-white border border-slate-200 rounded-xl px-3 py-2.5 hover:shadow-sm transition-all">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Equipo</span>
              <div class="w-5 h-5 bg-indigo-50 rounded-md flex items-center justify-center">
                <i class="fas fa-user-friends text-indigo-400 text-[8px]"></i>
              </div>
            </div>
            <div class="text-xl font-black text-slate-900 leading-none">{{ stats.teamMembers }}</div>
          </div>
        </div>

        <!-- Ritmo del día -->
        <div v-if="authStore.canViewActivities" class="bg-white border border-slate-200 rounded-xl px-3.5 py-3 shrink-0">
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

        <!-- Agenda: llena el espacio restante -->
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

const tabs = computed(() => [
  { key: 'overdue' as const, label: 'Vencidas', count: overdueCount.value, activeBadge: 'bg-red-100 text-red-500' },
  { key: 'today' as const, label: 'Hoy', count: todayCount.value, activeBadge: 'bg-blue-100 text-blue-600' },
  { key: 'priority' as const, label: 'Prioridad', count: highPriorityCount.value, activeBadge: 'bg-orange-100 text-orange-500' },
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
