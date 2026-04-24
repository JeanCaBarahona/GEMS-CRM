<template>
  <div class="flex flex-col gap-5 h-full min-h-0">

    <!-- Header -->
    <div class="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-end gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Filtros Rápidos -->
        <div class="flex flex-wrap items-center gap-2">
          <select 
            v-model="filters.department" 
            @change="loadData"
            class="bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
          >
            <option value="">Todos los Equipos</option>
            <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
          </select>

          <select 
            v-model="filters.clientId" 
            @change="loadData"
            class="bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
          >
            <option value="">Todos los Clientes</option>
            <option v-for="client in clients" :key="client._id" :value="client._id">{{ client.name }}</option>
          </select>

          <select 
            v-model="filters.assignedTo" 
            @change="loadData"
            class="bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
          >
            <option value="">Todo el Personal</option>
            <option v-for="member in availableMembers" :key="member._id" :value="member._id">{{ member.name }}</option>
          </select>
        </div>

        <div class="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

        <button
          @click="refreshData"
          :disabled="loading"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
        >
          <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'" class="text-xs"></i>
          {{ loading ? 'Actualizar' : 'Actualizar' }}
        </button>
      </div>
    </div>

    <!-- KPI Row -->
    <div class="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-3">
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between mb-3">
          <div :class="kpi.iconBg" class="w-9 h-9 rounded-xl flex items-center justify-center border">
            <i :class="[kpi.icon, kpi.iconColor]" class="text-sm"></i>
          </div>
          <span
            class="text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5"
            :class="kpi.trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'"
          >
            <i :class="kpi.trend >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'" class="text-[8px]"></i>
            {{ Math.abs(kpi.trend) }}%
          </span>
        </div>
        <div class="text-2xl font-black text-slate-800 leading-none mb-1">{{ kpi.value }}</div>
        <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ kpi.label }}</div>
      </div>
    </div>

    <!-- Charts + Tables -->
    <div class="flex-1 min-h-0 grid grid-cols-3 gap-4 overflow-hidden">

      <!-- Left: 2 charts stacked -->
      <div class="col-span-2 flex flex-col gap-4 min-h-0 overflow-y-auto">


        <!-- Activities + Clients row -->
        <div class="grid grid-cols-2 gap-4 flex-shrink-0">
          <!-- Activities Donut -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="text-sm font-black text-slate-800 mb-1">Actividades por Estado</h3>
            <p class="text-[10px] text-slate-500 font-medium mb-3">Distribución actual</p>
            <div class="h-36">
              <canvas ref="activitiesChart"></canvas>
            </div>
          </div>
          <!-- Client Growth Bar -> Workload -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="text-sm font-black text-slate-800 mb-1">Carga de Trabajo</h3>
            <p class="text-[10px] text-slate-500 font-medium mb-3">Tareas activas por miembro</p>
            <div class="h-36">
              <canvas ref="workloadChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Team Performance -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex-shrink-0">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-sm font-black text-slate-800">Rendimiento del Equipo</h3>
              <p class="text-[10px] text-slate-500 font-medium">Actividades completadas por miembro</p>
            </div>
          </div>
          <div class="space-y-2.5">
            <div v-for="member in teamMembers" :key="member.name" class="flex items-center gap-3">
              <div class="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span class="text-[10px] font-black text-primary-700">{{ member.initials }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-bold text-slate-700 truncate">{{ member.name }}</span>
                  <span class="text-xs font-black text-slate-800 ml-2">{{ member.completed }}/{{ member.total }}</span>
                </div>
                <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="member.rate >= 80 ? 'bg-emerald-500' : member.rate >= 60 ? 'bg-amber-500' : 'bg-red-400'"
                    :style="{ width: member.rate + '%' }"
                  ></div>
                </div>
              </div>
              <span
                class="text-[10px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0"
                :class="member.rate >= 80 ? 'bg-emerald-50 text-emerald-700' : member.rate >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'"
              >{{ member.rate }}%</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Right panel: exec summary + top clients -->
      <div class="flex flex-col gap-4 min-h-0 overflow-y-auto">

        <!-- Resumen ejecutivo -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex-shrink-0">
          <h3 class="text-sm font-black text-slate-800 mb-3">Resumen Ejecutivo</h3>
          <div class="space-y-2.5">
            <div v-for="row in executiveRows" :key="row.label" class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div class="flex items-center gap-2">
                <div :class="row.iconBg" class="w-6 h-6 rounded-md flex items-center justify-center">
                  <i :class="[row.icon, row.iconColor]" class="text-[10px]"></i>
                </div>
                <span class="text-xs font-medium text-slate-600">{{ row.label }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-slate-800">{{ row.value }}</span>
                <span
                  class="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  :class="row.growth >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'"
                >{{ row.growth >= 0 ? '+' : '' }}{{ row.growth }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Clientes -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex-shrink-0">
          <h3 class="text-sm font-black text-slate-800 mb-3">Clientes Más Activos</h3>
          <div class="space-y-2.5">
            <div v-for="(client, i) in topClients" :key="client.name" class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                :class="i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-600' : 'bg-orange-100 text-orange-600'"
              >{{ i + 1 }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-slate-800 truncate">{{ client.name }}</p>
                <p class="text-[10px] text-slate-400 font-medium">{{ client.activities }} actividades</p>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs font-black text-emerald-600">{{ client.rate }}%</div>
                <div class="text-[9px] text-slate-400">completadas</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tiempo resolución -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex-shrink-0">
          <h3 class="text-sm font-black text-slate-800 mb-3">Tiempo de Resolución</h3>
          <div class="grid grid-cols-3 gap-2">
            <div class="text-center p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <div class="text-lg font-black text-emerald-700">{{ resolutionTime.min }}d</div>
              <div class="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">Mínimo</div>
            </div>
            <div class="text-center p-2.5 bg-blue-50 rounded-xl border border-blue-100">
              <div class="text-lg font-black text-blue-700">{{ resolutionTime.avg }}d</div>
              <div class="text-[9px] font-bold text-blue-600 uppercase tracking-wide">Promedio</div>
            </div>
            <div class="text-center p-2.5 bg-red-50 rounded-xl border border-red-100">
              <div class="text-lg font-black text-red-700">{{ resolutionTime.max }}d</div>
              <div class="text-[9px] font-bold text-red-600 uppercase tracking-wide">Máximo</div>
            </div>
          </div>
        </div>

        <!-- Comparativa mensual -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex-shrink-0">
          <h3 class="text-sm font-black text-slate-800 mb-3">Comparativa Mensual</h3>
          <div class="space-y-3">
            <div v-for="comp in monthlyComparison" :key="comp.label">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-slate-600">{{ comp.label }}</span>
                <span class="text-xs font-black" :class="comp.growth >= 0 ? 'text-emerald-600' : 'text-red-500'">
                  {{ comp.growth >= 0 ? '+' : '' }}{{ comp.growth }}%
                </span>
              </div>
              <div class="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <span>Este mes: <strong class="text-slate-700">{{ comp.current }}</strong></span>
                <span class="text-slate-300">|</span>
                <span>Anterior: <strong class="text-slate-500">{{ comp.previous }}</strong></span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import { reportsService } from '../services/reportsService'
import { useNotifications } from '../composables/useNotifications'
import type {
  DashboardStats,
  FinancialData,
  ActivityStats,
  ClientStats,
  TeamPerformance,
  ExecutiveSummary
} from '../services/reportsService'

Chart.register(...registerables)

const { showError, showSuccess } = useNotifications()

// State
const loading = ref(false)
const selectedPeriod = ref<'month' | 'quarter' | 'year'>('month')

const filters = ref({
  department: '',
  clientId: '',
  assignedTo: ''
})

const availableMembers = ref<any[]>([])
const clients = ref<any[]>([])
const departments = computed(() => {
  const depts = new Set(availableMembers.value.map(m => m.department).filter(Boolean))
  return Array.from(depts).sort()
})

const periods = [
  { value: 'month', label: 'Mes' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Año' }
]

// API Data
const dashboardStats = ref<DashboardStats | null>(null)
const financialData = ref<FinancialData | null>(null)
const activityStats = ref<ActivityStats | null>(null)
const clientStats = ref<ClientStats | null>(null)
const teamPerformance = ref<TeamPerformance | null>(null)
const executiveSummary = ref<ExecutiveSummary | null>(null)

// Chart refs
const revenueChart = ref<HTMLCanvasElement>()
const activitiesChart = ref<HTMLCanvasElement>()
const clientGrowthChart = ref<HTMLCanvasElement>()

let revenueChartInstance: Chart | null = null
let activitiesChartInstance: Chart | null = null
let clientGrowthChartInstance: Chart | null = null

// Formatters
const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0'
  return '$' + new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

// --- Computed UI Data ---
const kpis = computed(() => [
  {
    label: 'Total Equipo',
    value: String(dashboardStats.value?.totals?.teamMembers ?? 0),
    icon: 'fas fa-id-badge',
    iconBg: 'bg-primary-50 border-primary-100',
    iconColor: 'text-primary-600',
    trend: 0
  },
  {
    label: 'Clientes Activos',
    value: String(dashboardStats.value?.totals?.clients ?? 0),
    icon: 'fas fa-users',
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600',
    trend: executiveSummary.value?.growth?.clients ?? 0
  },
  {
    label: 'Actividades',
    value: String(dashboardStats.value?.monthly?.completedActivities ?? 0),
    icon: 'fas fa-check-circle',
    iconBg: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-600',
    trend: executiveSummary.value?.growth?.activities ?? 0
  },
  {
    label: 'Casos Activos',
    value: String(dashboardStats.value?.totals?.cases ?? 0),
    icon: 'fas fa-folder-open',
    iconBg: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-600',
    trend: 0
  }
])

const executiveRows = computed(() => [
  { label: 'Nuevos clientes', value: String(executiveSummary.value?.kpis?.newClientsThisMonth ?? 0), growth: executiveSummary.value?.growth?.clients ?? 0, icon: 'fas fa-user-plus', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { label: 'Actividades completadas', value: String(executiveSummary.value?.kpis?.completedThisMonth ?? 0), growth: executiveSummary.value?.growth?.activities ?? 0, icon: 'fas fa-check', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'Total clientes', value: String(executiveSummary.value?.kpis?.totalClients ?? 0), growth: 0, icon: 'fas fa-building', iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
])

const topClients = computed(() => {
  if (clientStats.value?.topActive?.length) {
    return clientStats.value.topActive.slice(0, 5).map((c: any) => ({
      name: c.clientName,
      activities: c.totalActivities,
      rate: Math.round(c.completionRate * 100)
    }))
  }
  return []
})

const teamMembers = computed(() => {
  if (teamPerformance.value?.performance?.length) {
    return teamPerformance.value.performance.map((m: any) => {
      const name = m.teamMember?.name || `Usuario ${String(m._id).slice(-4)}`
      const parts = name.split(' ').filter(Boolean)
      const initials = parts.length >= 2 
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase()
        
      return {
        name,
        initials,
        completed: m.completedActivities,
        total: m.totalActivities,
        rate: Math.round(m.completionRate || 0)
      }
    })
  }
  return []
})

const resolutionTime = computed(() => ({
  min: activityStats.value?.resolutionTime?.minResolutionTime ? Math.round(activityStats.value.resolutionTime.minResolutionTime) : 0,
  avg: activityStats.value?.resolutionTime?.avgResolutionTime ? Math.round(activityStats.value.resolutionTime.avgResolutionTime) : 0,
  max: activityStats.value?.resolutionTime?.maxResolutionTime ? Math.round(activityStats.value.resolutionTime.maxResolutionTime) : 0,
}))

const monthlyComparison = computed(() => [
  {
    label: 'Nuevos Clientes',
    current: executiveSummary.value?.kpis?.newClientsThisMonth ?? 0,
    previous: executiveSummary.value?.kpis?.newClientsLastMonth ?? 0,
    growth: executiveSummary.value?.growth?.clients ?? 0
  },
  {
    label: 'Actividades Completadas',
    current: executiveSummary.value?.kpis?.completedThisMonth ?? 0,
    previous: executiveSummary.value?.kpis?.completedLastMonth ?? 0,
    growth: executiveSummary.value?.growth?.activities ?? 0
  },
])

// Chart colors for light mode
const CHART_COLORS = {
  primary: 'rgb(99, 102, 241)',
  primaryLight: 'rgba(99, 102, 241, 0.12)',
  emerald: 'rgb(16, 185, 129)',
  amber: 'rgb(245, 158, 11)',
  red: 'rgb(239, 68, 68)',
  slate: 'rgb(148, 163, 184)',
  gridLine: 'rgba(226, 232, 240, 0.8)',
  tickColor: 'rgb(100, 116, 139)',
}

const createRevenueChart = () => {
  if (!revenueChart.value) return
  revenueChartInstance?.destroy()
  const ctx = revenueChart.value.getContext('2d')
  if (!ctx) return

  let labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  let data = [620000, 710000, 680000, 790000, 840000, 847200, 900000, 860000, 920000, 880000, 950000, 1020000]

  if (financialData.value?.transactions?.length) {
    const monthlyData = financialData.value.transactions
      .filter((t: any) => t._id.tipo === 'ingreso')
      .sort((a: any, b: any) => a._id.month - b._id.month)
    if (monthlyData.length > 0) {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      labels = monthlyData.map((item: any) => monthNames[item._id.month - 1] || `Mes ${item._id.month}`)
      data = monthlyData.map((item: any) => item.total)
    }
  }

  revenueChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Ingresos',
        data,
        borderColor: CHART_COLORS.primary,
        backgroundColor: CHART_COLORS.primaryLight,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: CHART_COLORS.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#1e293b',
          bodyColor: '#475569',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: ctx => '$' + new Intl.NumberFormat('es-CO').format(Number(ctx.raw))
          }
        }
      },
      scales: {
        x: { ticks: { color: CHART_COLORS.tickColor, font: { size: 10, weight: 'bold' } }, grid: { color: CHART_COLORS.gridLine } },
        y: {
          beginAtZero: false,
          ticks: { color: CHART_COLORS.tickColor, font: { size: 10 }, callback: v => '$' + new Intl.NumberFormat('es-CO', { notation: 'compact' }).format(Number(v)) },
          grid: { color: CHART_COLORS.gridLine }
        }
      }
    }
  })
}

const createActivitiesChart = () => {
  if (!activitiesChart.value) return
  activitiesChartInstance?.destroy()
  const ctx = activitiesChart.value.getContext('2d')
  if (!ctx) return

  let completed = 142, inProgress = 28, pending = 34

  if (activityStats.value?.statusDistribution?.length) {
    completed = 0; inProgress = 0; pending = 0
    activityStats.value.statusDistribution.forEach((s: any) => {
      const id = (s._id || '').toLowerCase()
      if (id.includes('complet') || id.includes('finaliz')) completed = s.count
      else if (id.includes('progress') || id.includes('progreso')) inProgress = s.count
      else pending += s.count
    })
  }

  activitiesChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completadas', 'En Proceso', 'Pendientes'],
      datasets: [{
        data: [completed, inProgress, pending],
        backgroundColor: [CHART_COLORS.emerald, CHART_COLORS.primary, CHART_COLORS.amber],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: CHART_COLORS.tickColor, font: { size: 10, weight: 'bold' }, boxWidth: 10, padding: 10 }
        },
        tooltip: {
          backgroundColor: '#fff', titleColor: '#1e293b', bodyColor: '#475569',
          borderColor: '#e2e8f0', borderWidth: 1, cornerRadius: 8
        }
      }
    }
  })
}

const createWorkloadChart = () => {
  if (!workloadChart.value) return
  workloadChartInstance?.destroy()
  const ctx = workloadChart.value.getContext('2d')
  if (!ctx) return

  let labels = ['Miembro 1', 'Miembro 2', 'Miembro 3']
  let data = [5, 8, 4]

  if (teamPerformance.value?.currentWorkload?.length) {
    labels = teamPerformance.value.currentWorkload.map((m: any) => m.teamMember?.name || `U ${String(m._id).slice(-4)}`)
    data = teamPerformance.value.currentWorkload.map((m: any) => m.activeWorkload)
  }

  workloadChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Tareas Activas',
        data,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: CHART_COLORS.primary,
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff', titleColor: '#1e293b', bodyColor: '#475569',
          borderColor: '#e2e8f0', borderWidth: 1, cornerRadius: 8
        }
      },
      scales: {
        x: { ticks: { color: CHART_COLORS.tickColor, font: { size: 10 } }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { color: CHART_COLORS.tickColor, font: { size: 10 }, stepSize: 1 }, grid: { color: CHART_COLORS.gridLine } }
      }
    }
  })
}

const createCharts = () => {
  setTimeout(() => {
    createRevenueChart()
    createActivitiesChart()
    createWorkloadChart()
  }, 100)
}

import { teamService } from '../services/teamService'
import { clientService } from '../services/clientService'

const loadData = async () => {
  loading.value = true
  try {
    // Fetch filter options if empty
    if (availableMembers.value.length === 0) {
      const [membersData, clientsData] = await Promise.all([
        teamService.getAll(),
        clientService.getAll()
      ])
      availableMembers.value = membersData
      clients.value = clientsData
    }

    const query = {
      period: selectedPeriod.value,
      ...filters.value
    }

    const [dash, fin, act, cli, team, exec] = await Promise.all([
      reportsService.getDashboardStats(query).catch(() => null),
      reportsService.getFinancialData(selectedPeriod.value).catch(() => null),
      reportsService.getActivityStats(query).catch(() => null),
      reportsService.getClientStats(query).catch(() => null),
      reportsService.getTeamPerformance(query).catch(() => null),
      reportsService.getExecutiveSummary(query).catch(() => null)
    ])
    dashboardStats.value = dash
    financialData.value = fin
    activityStats.value = act
    clientStats.value = cli
    teamPerformance.value = team
    executiveSummary.value = exec
    await nextTick()
    createCharts()
  } catch (error) {
    console.error('Error loading reports:', error)
    await nextTick()
    createCharts()
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  await loadData()
  showSuccess('Reportes actualizados')
}

onMounted(() => { loadData() })
</script>
