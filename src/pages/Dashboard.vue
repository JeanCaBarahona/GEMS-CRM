<template>
  <div class="h-full flex flex-col gap-3 overflow-hidden">

    <!-- ══ Top breadcrumb bar ══════════════════════════════════════════ -->
    <div class="flex items-center justify-between pr-14">
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Dashboard Operativo</span>
        <span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
          {{ userRoleLabel }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button @click="refreshData" :disabled="isRefreshing"
          class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-colors disabled:opacity-50">
          <i class="fas fa-sync-alt text-[11px]" :class="{ 'animate-spin': isRefreshing }"></i>
        </button>
        <router-link v-if="authStore.canCreateActivities" to="/activities"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-[12px] font-semibold shadow-sm shadow-blue-500/20 transition-all">
          <i class="fas fa-plus text-[10px]"></i>
          <span>Nueva actividad</span>
        </router-link>
      </div>
    </div>

    <!-- ══ Greeting ═══════════════════════════════════════════════════ -->
    <div>
      <h1 class="text-[26px] font-bold text-slate-900 tracking-tight leading-tight">Hola, {{ firstName }}</h1>
      <p class="text-[13px] text-slate-500 mt-0.5">
        Tienes <span class="font-semibold text-slate-700">{{ criticalCount }}</span>
        {{ criticalCount === 1 ? 'actividad' : 'actividades' }} que
        {{ criticalCount === 1 ? 'requiere' : 'requieren' }} atención entre hoy y vencidas.
      </p>
    </div>

    <!-- ══ Quick actions row ══════════════════════════════════════════ -->
    <div class="grid gap-2.5" :style="`grid-template-columns: repeat(${quickActions.length}, minmax(0,1fr));`">
      <router-link v-for="qa in quickActions" :key="qa.label" :to="qa.to"
        class="flex items-center gap-3 bg-white border border-slate-200 hover:shadow-md rounded-xl px-4 py-3 transition-all group"
        :class="qa.hover">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0"
          :class="qa.iconBg">
          <i :class="['fas', qa.icon, qa.iconColor, 'text-[14px]']"></i>
        </div>
        <span class="text-[13px] font-semibold text-slate-800">{{ qa.label }}</span>
      </router-link>
    </div>

    <!-- ══ Stats row ══════════════════════════════════════════════════ -->
    <div class="grid gap-2.5" :style="`grid-template-columns: repeat(${statCards.length}, minmax(0,1fr));`">
      <div v-for="card in statCards" :key="card.label"
        class="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{{ card.label }}</div>
        <div class="flex items-end justify-between">
          <div class="flex items-baseline gap-2">
            <span class="text-[26px] font-bold text-slate-900 leading-none">{{ card.value }}</span>
            <span class="text-[11px] font-semibold" :class="card.tagColor">{{ card.tag }}</span>
          </div>
          <div class="w-9 h-9 rounded-lg flex items-center justify-center" :class="card.iconBg">
            <i :class="['fas', card.icon, card.iconColor, 'text-[13px]']"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ Main grid: 2/3 + 1/3 ═══════════════════════════════════════ -->
    <div class="grid grid-cols-3 gap-3 flex-1 min-h-0">

      <!-- ── Left: AI Insights + Agenda ─────────────────────────────── -->
      <div class="col-span-2 flex flex-col gap-3 min-h-0">

        <AIInsightsWidget />

        <!-- Agenda -->
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
            <div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Agenda</div>
              <div class="text-[13px] font-bold text-slate-900">Actividades próximas</div>
            </div>
            <router-link to="/activities"
              class="text-[12px] text-blue-500 hover:text-blue-600 font-semibold transition-colors">
              Ver todas
            </router-link>
          </div>
          <div v-if="agendaActivities.length === 0" class="flex-1 flex items-center justify-center">
            <p class="text-[12px] text-slate-400">Sin actividades próximas</p>
          </div>
          <div v-else class="flex-1 overflow-y-auto divide-y divide-slate-50">
            <div v-for="act in agendaActivities" :key="act._id"
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/60 transition-colors">
              <span class="w-2 h-2 rounded-full shrink-0"
                :class="act.priority === 'urgent' ? 'bg-red-500' : act.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'"></span>
              <div class="flex-1 min-w-0 flex items-center gap-1.5">
                <span class="text-[12px] font-semibold text-slate-800 truncate">{{ act.title }}</span>
                <span class="text-[12px] text-slate-400 truncate">· {{ clientsStore.clients.find(c => c._id === act.clientId)?.name || '—' }}</span>
              </div>
              <span :class="['shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold', agendaStatusClass(act)]">
                {{ agendaStatusLabel(act) }}
              </span>
              <span class="shrink-0 flex items-center gap-1 text-[11px] text-slate-500">
                <i class="fas fa-clock text-red-400 text-[10px]"></i>
                {{ formatDateShort(act.dueDate || act.date) }}
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- ── Right column ────────────────────────────────────────────── -->
      <div class="flex flex-col gap-3 min-h-0 overflow-y-auto">

        <!-- Ritmo del día -->
        <div class="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div class="flex items-start justify-between mb-2">
            <div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Ritmo del día</div>
              <div class="text-[13px] font-bold text-slate-900">Foco operativo</div>
            </div>
            <span class="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-full leading-none">{{ focusProgress }}%</span>
          </div>
          <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3.5">
            <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700"
              :style="{ width: focusProgress + '%' }"></div>
          </div>
          <div class="grid grid-cols-3 text-center">
            <div>
              <div class="text-xl font-bold text-red-500 leading-none">{{ overdueCount }}</div>
              <div class="text-[10px] text-slate-500 font-semibold mt-1">Vencidas</div>
            </div>
            <div>
              <div class="text-xl font-bold text-amber-500 leading-none">{{ todayCount }}</div>
              <div class="text-[10px] text-slate-500 font-semibold mt-1">Hoy</div>
            </div>
            <div>
              <div class="text-xl font-bold text-cyan-500 leading-none">{{ highPriorityCount }}</div>
              <div class="text-[10px] text-slate-500 font-semibold mt-1">Alta prioridad</div>
            </div>
          </div>
        </div>

        <!-- Pulso comercial -->
        <div class="bg-white border border-slate-200 rounded-xl px-4 py-3">
          <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Pulso comercial</div>
          <div class="text-[13px] font-bold text-slate-900 mb-3">Dónde atacar primero</div>
          <div class="flex flex-col gap-2.5">
            <div v-for="(item, i) in pulsoItems" :key="i" class="flex items-start gap-2.5">
              <i :class="['fas', item.icon, item.color, 'text-[11px] mt-0.5 shrink-0']"></i>
              <span class="text-[12px] text-slate-700 leading-snug">{{ item.text }}</span>
            </div>
          </div>
        </div>

        <!-- Nota de foco (dark) -->
        <div class="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-xl px-4 py-3 text-white">
          <div class="text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-1">Nota de foco</div>
          <p class="text-[13px] font-semibold leading-snug">
            {{ focusNote }}
          </p>
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

const firstName = computed(() => authStore.user?.name?.split(' ')[0] || 'Usuario')
const userRoleLabel = computed(() => ({
  admin: 'Administrador', manager: 'Manager', employee: 'Empleado',
  support: 'Soporte', development: 'Desarrollador', fullstack: 'Fullstack',
  viewer: 'Viewer', client: 'Cliente',
}[authStore.user?.role || ''] || authStore.user?.role || 'Usuario'))

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

const activeActivities = computed(() =>
  activitiesStore.activities.filter((a: any) => a.status !== 'completed' && a.status !== 'cancelled').length
)
const openCases = computed(() =>
  issuesStore.issues.filter((i: any) => i.status === 'open').length
)
const pendingTickets = computed(() =>
  issuesStore.issues.filter((i: any) => i.status === 'pending' || i.status === 'in-progress').length
)
const focusProgress = computed(() => {
  const total = activitiesStore.activities.length
  if (!total) return 0
  return Math.round(activitiesStore.activities.filter((a: any) => a.status === 'completed').length / total * 100)
})

// Quick actions (filtradas por permisos)
const quickActions = computed(() => {
  const all = [
    { label: 'Nuevo cliente', to: '/clients', icon: 'fa-user-plus', iconBg: 'bg-blue-50 group-hover:bg-blue-100', iconColor: 'text-blue-500', hover: 'hover:border-blue-200', can: authStore.canCreateClients },
    { label: 'Nueva actividad', to: '/activities', icon: 'fa-plus-circle', iconBg: 'bg-green-50 group-hover:bg-green-100', iconColor: 'text-green-500', hover: 'hover:border-green-200', can: authStore.canCreateActivities },
    { label: 'Revisar tickets', to: '/tickets', icon: 'fa-ticket-alt', iconBg: 'bg-slate-100 group-hover:bg-slate-200', iconColor: 'text-slate-600', hover: 'hover:border-slate-300', can: authStore.canViewCases },
    { label: 'Nuevo caso', to: '/cases', icon: 'fa-exclamation-circle', iconBg: 'bg-orange-50 group-hover:bg-orange-100', iconColor: 'text-orange-500', hover: 'hover:border-orange-200', can: authStore.canCreateCases },
    { label: 'Gestionar equipo', to: '/team', icon: 'fa-users-cog', iconBg: 'bg-purple-50 group-hover:bg-purple-100', iconColor: 'text-purple-500', hover: 'hover:border-purple-200', can: authStore.canCreateTeam },
  ]
  return all.filter(a => a.can)
})

// Stat cards (filtradas por permisos)
const statCards = computed(() => {
  const all = [
    { label: 'Clientes', value: clientsStore.clients.length, tag: 'Base', tagColor: 'text-blue-500', icon: 'fa-users', iconBg: 'bg-blue-50', iconColor: 'text-blue-500', can: authStore.canViewClients },
    { label: 'Actividades', value: activeActivities.value, tag: 'Activas', tagColor: 'text-green-500', icon: 'fa-clipboard-list', iconBg: 'bg-green-50', iconColor: 'text-green-500', can: authStore.canViewActivities },
    { label: 'Casos', value: openCases.value, tag: 'Abiertos', tagColor: 'text-red-500', icon: 'fa-exclamation-triangle', iconBg: 'bg-red-50', iconColor: 'text-red-500', can: authStore.canViewCases },
    { label: 'Tickets', value: pendingTickets.value, tag: 'Pendientes', tagColor: 'text-red-500', icon: 'fa-ticket-alt', iconBg: 'bg-slate-100', iconColor: 'text-slate-600', can: authStore.canViewCases },
    { label: 'Equipo', value: teamStore.members.length, tag: 'Activos', tagColor: 'text-purple-500', icon: 'fa-user-friends', iconBg: 'bg-purple-50', iconColor: 'text-purple-500', can: authStore.canViewTeam },
  ]
  return all.filter(s => s.can)
})

// Agenda: vencidas + hoy + próximas — máximo 6
const agendaActivities = computed(() => {
  const list = [...activitiesStore.activities]
    .filter((a: any) => a.status !== 'completed' && a.status !== 'cancelled')
    .sort((a: any, b: any) => new Date(a.dueDate || a.date).getTime() - new Date(b.dueDate || b.date).getTime())
  return list.slice(0, 20)
})

// Pulso comercial dinámico
const pulsoItems = computed(() => {
  const items: { icon: string; color: string; text: string }[] = []
  if (overdueCount.value > 0) {
    items.push({ icon: 'fa-bolt', color: 'text-amber-500', text: 'Recupera primero las actividades vencidas antes de abrir nuevos frentes.' })
  }
  if (pendingTickets.value > 0 || openCases.value > 0) {
    const n = pendingTickets.value + openCases.value
    items.push({ icon: 'fa-chart-bar', color: 'text-slate-500', text: `${n} ${n === 1 ? 'caso/ticket activo puede afectar' : 'casos/tickets activos pueden afectar'} experiencia de clientes.` })
  }
  if (highPriorityCount.value > 0) {
    items.push({ icon: 'fa-check-circle', color: 'text-emerald-500', text: 'Ataca actividades urgentes o de alta prioridad en bloque.' })
  }
  if (items.length === 0) {
    items.push({ icon: 'fa-check-circle', color: 'text-emerald-500', text: 'Todo bajo control. Aprovecha para planear la siguiente semana.' })
  }
  return items
})

const focusNote = computed(() => {
  if (criticalCount.value > 0) {
    return 'Prioriza seguimientos con fecha, casos abiertos y tickets sin resolver. El dashboard debe servir para decidir, no para decorar.'
  }
  return 'Aprovecha esta calma para revisar pipeline, planear seguimientos y consolidar relaciones con clientes clave.'
})

// Helpers
const agendaStatusLabel = (a: any) => {
  const d = new Date(a.dueDate || a.date); d.setHours(0, 0, 0, 0)
  if (d < todayMidnight) return 'Atrasada'
  if (a.status === 'in-progress') return 'En curso'
  return 'Pendiente'
}
const agendaStatusClass = (a: any) => {
  const d = new Date(a.dueDate || a.date); d.setHours(0, 0, 0, 0)
  if (d < todayMidnight) return 'bg-red-50 text-red-600'
  if (a.status === 'in-progress') return 'bg-blue-50 text-blue-600'
  return 'bg-amber-50 text-amber-600'
}

const formatDateShort = (d?: string) => {
  if (!d) return '—'
  const date = new Date(d)
  const day = date.getDate()
  const month = date.toLocaleString('es', { month: 'short' }).replace('.', '')
  const time = date.toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
  return `${day} de ${month}, ${time}`
}

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
