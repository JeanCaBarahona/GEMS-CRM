import { API_CONFIG } from '../config/api'

// Tipos para las estadísticas
export interface DashboardStats {
  totals: {
    clients: number
    activities: number
    cases: number
    teamMembers: number
  }
  monthly: {
    newClients: number
    completedActivities: number
    newCases: number
    monthlyRevenue: number
    monthlyExpenses: number
  }
}

export interface FinancialData {
  transactions: Array<{
    _id: {
      year: number
      month: number
      day?: number
      tipo: 'ingreso' | 'egreso'
    }
    total: number
    count: number
  }>
  fixedExpenses: number
  period: string
  startDate: string
  endDate: string
}

export interface ActivityStats {
  statusDistribution: Array<{
    _id: string
    count: number
  }>
  completedByMonth: Array<{
    _id: {
      year: number
      month: number
    }
    count: number
  }>
  productivityByClient: Array<{
    _id: string
    completedActivities: number
  }>
  resolutionTime: {
    avgResolutionTime: number
    minResolutionTime: number
    maxResolutionTime: number
  } | null
}

export interface ClientStats {
  growth: Array<{
    _id: {
      year: number
      month: number
    }
    newClients: number
  }>
  topActive: Array<{
    _id: string
    clientName: string
    clientEmail: string
    totalActivities: number
    completedActivities: number
    completionRate: number
  }>
  locationDistribution: Array<{
    _id: string
    count: number
  }>
}

export interface TeamPerformance {
  performance: Array<{
    _id: string
    totalActivities: number
    completedActivities: number
    pendingActivities: number
    completionRate: number
    teamMember?: {
      nombre: string
      rol: string
      email: string
    }
  }>
  currentWorkload: Array<{
    _id: string
    activeWorkload: number
    teamMember?: {
      nombre: string
      rol: string
      email: string
    }
  }>
}

export interface ExecutiveSummary {
  kpis: {
    totalClients: number
    newClientsThisMonth: number
    newClientsLastMonth: number
    totalActivities: number
    completedThisMonth: number
    completedLastMonth: number
    revenueThisYear: number
    revenueThisMonth: number
    revenueLastMonth: number
    expensesThisMonth: number
  }
  growth: {
    clients: number
    activities: number
    revenue: number
  }
  period: {
    current: string
    previous: string
  }
}

class ReportsService {
  private baseUrl = API_CONFIG.BASE_URL
  private endpoint = '/reports'

  private buildQueryString(filters?: any) {
    if (!filters) return ''
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value))
    })
    const qs = params.toString()
    return qs ? `?${qs}` : ''
  }

  // Estadísticas del dashboard
  async getDashboardStats(filters?: any): Promise<DashboardStats> {
    const qs = this.buildQueryString(filters)
    const response = await fetch(`${this.baseUrl}${this.endpoint}/dashboard${qs}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return result.data || result
  }

  // Datos financieros por período
  async getFinancialData(period: 'month' | 'quarter' | 'year'): Promise<FinancialData> {
    const response = await fetch(`${this.baseUrl}${this.endpoint}/financial/${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return result.data || result
  }

  // Estadísticas de actividades
  async getActivityStats(filters?: any): Promise<ActivityStats> {
    const qs = this.buildQueryString(filters)
    const response = await fetch(`${this.baseUrl}${this.endpoint}/activities/stats${qs}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return result.data
  }

  // Estadísticas de clientes
  async getClientStats(filters?: any): Promise<ClientStats> {
    const qs = this.buildQueryString(filters)
    const response = await fetch(`${this.baseUrl}${this.endpoint}/clients/stats${qs}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return result.data
  }

  // Performance del equipo
  async getTeamPerformance(filters?: any): Promise<TeamPerformance> {
    const qs = this.buildQueryString(filters)
    const response = await fetch(`${this.baseUrl}${this.endpoint}/team/performance${qs}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return result.data
  }

  // Resumen ejecutivo
  async getExecutiveSummary(filters?: any): Promise<ExecutiveSummary> {
    const qs = this.buildQueryString(filters)
    const response = await fetch(`${this.baseUrl}${this.endpoint}/executive-summary${qs}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return result.data
  }

  // Métodos auxiliares para formatear datos para gráficos
  formatChartData(data: any[], xKey: string, yKey: string, labelKey?: string) {
    return {
      labels: data.map(item => labelKey ? item[labelKey] : item[xKey]),
      datasets: [{
        data: data.map(item => item[yKey]),
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(14, 165, 233, 0.8)'
        ],
        borderColor: [
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(14, 165, 233, 1)'
        ],
        borderWidth: 2
      }]
    }
  }

  formatTimeSeriesData(data: any[], valueKey: string, label: string) {
    return {
      labels: data.map(item => {
        const date = new Date(item._id.year, item._id.month - 1, item._id.day || 1)
        return date.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'short',
          ...(item._id.day && { day: 'numeric' })
        })
      }),
      datasets: [{
        label,
        data: data.map(item => item[valueKey]),
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    }
  }

  formatComparisonData(ingresos: any[], egresos: any[]) {
    // Combinar datos de ingresos y egresos por fecha
    const allDates = new Set([
      ...ingresos.map(i => `${i._id.year}-${i._id.month}`),
      ...egresos.map(e => `${e._id.year}-${e._id.month}`)
    ])

    const labels = Array.from(allDates).sort().map(date => {
      const [year, month] = date.split('-')
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short' 
      })
    })

    return {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: labels.map(label => {
            const ingreso = ingresos.find(i => {
              const date = new Date(i._id.year, i._id.month - 1).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'short' 
              })
              return date === label
            })
            return ingreso ? ingreso.total : 0
          }),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2
        },
        {
          label: 'Egresos',
          data: labels.map(label => {
            const egreso = egresos.find(e => {
              const date = new Date(e._id.year, e._id.month - 1).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'short' 
              })
              return date === label
            })
            return egreso ? egreso.total : 0
          }),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2
        }
      ]
    }
  }

  // Calcular métricas útiles
  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }
}

export const reportsService = new ReportsService()
export default reportsService

// ═══════════════════════════════════════════════════════════════════════════
// KPIs y Team Reports (Dashboard v2)
// ═══════════════════════════════════════════════════════════════════════════

export interface UserKPI {
  user: {
    _id: string
    name: string
    email: string
    role: string
    department: string
    avatar?: string
    photo?: string
  }
  totalItems: number
  totalCompleted: number
  complianceRate: number
  avgResolutionDays: number
  hoursWorked: number
  currentWorkload: number
  overdueCount: number
}

export interface TeamTotals {
  totalItems: number
  totalCompleted: number
  avgCompliance: number
  avgResolution: number
  totalWorkload: number
  totalOverdue: number
  totalHours: number
}

export interface KPIResponse {
  kpis: UserKPI[]
  teamTotals: TeamTotals
  period: string
  since: string
}

export interface TrendPoint {
  label: string
  completed: number
  activities?: number
  tasks?: number
  created?: number
}

export interface ScheduleConfig {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  dayOfWeek: number
  hour: number
  minute: number
  period: string
  recipients: string[]
  department: string | null
  lastRun: string | null
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const kpiBase = API_CONFIG.BASE_URL + '/reports'

async function kpiGet(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString()
  const url = `${kpiBase}${path}${qs ? `?${qs}` : ''}`
  const res = await fetch(url, { headers: authHeaders() })
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return (await res.json()).data
}

async function kpiPost(path: string, body: any = {}) {
  const res = await fetch(`${kpiBase}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || `POST ${path} failed`)
  return json
}

async function kpiPut(path: string, body: any = {}) {
  const res = await fetch(`${kpiBase}${path}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || `PUT ${path} failed`)
  return json.data
}

export const teamReportsService = {
  getKPIs(period = 'month', department?: string): Promise<KPIResponse> {
    const params: Record<string, string> = { period }
    if (department) params.department = department
    return kpiGet('/kpis', params)
  },

  getWeeklyTrends(department?: string): Promise<TrendPoint[]> {
    const params: Record<string, string> = {}
    if (department) params.department = department
    return kpiGet('/trends/weekly', params)
  },

  getMonthlyTrends(department?: string): Promise<TrendPoint[]> {
    const params: Record<string, string> = {}
    if (department) params.department = department
    return kpiGet('/trends/monthly', params)
  },

  getTeamSummary(period = 'week', department?: string) {
    const params: Record<string, string> = { period }
    if (department) params.department = department
    return kpiGet('/team-summary', params)
  },

  sendTeamReport(opts: { recipients?: string[]; period?: string; department?: string } = {}) {
    return kpiPost('/send-team-report', opts)
  },

  getScheduleConfig(): Promise<ScheduleConfig> {
    return kpiGet('/schedule-config')
  },

  updateScheduleConfig(config: Partial<ScheduleConfig>): Promise<ScheduleConfig> {
    return kpiPut('/schedule-config', config)
  },
}
