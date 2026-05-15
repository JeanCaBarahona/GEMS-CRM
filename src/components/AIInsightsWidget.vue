<template>
  <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">

    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
          <i class="fas fa-brain text-violet-500 text-sm"></i>
        </div>
        <div>
          <p class="text-[9px] font-black text-violet-500 uppercase tracking-widest leading-none mb-0.5">IA Personalizada</p>
          <h3 class="text-sm font-bold text-slate-800 leading-none">Insights para {{ userName }}</h3>
        </div>
      </div>
      <button
        @click="generateInsights(false)"
        :disabled="loading"
        class="w-7 h-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors disabled:opacity-40"
        title="Actualizar insights"
      >
        <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'" class="text-slate-400 text-[10px]"></i>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center gap-3 py-6">
      <i class="fas fa-brain text-violet-400 text-base animate-pulse"></i>
      <p class="text-slate-400 text-xs font-medium">Analizando tu situación...</p>
    </div>

    <!-- Content: 3 columns (auto-height based on content) -->
    <div v-else-if="insights" class="grid grid-cols-3 divide-x divide-slate-100">

      <!-- SITUACIÓN -->
      <div>
        <div class="flex items-center gap-1 px-3 pt-2.5 pb-1.5">
          <i class="fas fa-eye text-amber-500 text-[9px]"></i>
          <h4 class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Situación</h4>
        </div>
        <p class="px-3 pb-3 text-[11px] text-slate-600 leading-relaxed">{{ insights.lectura }}</p>
      </div>

      <!-- ACCIONES -->
      <div>
        <div class="flex items-center gap-1 px-3 pt-2.5 pb-1.5">
          <i class="fas fa-bullseye text-emerald-500 text-[9px]"></i>
          <h4 class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Acciones</h4>
        </div>
        <ul class="px-3 pb-3 space-y-2">
          <li v-for="(accion, i) in insights.acciones" :key="i"
            class="flex items-start gap-1.5 text-[11px] text-slate-600 leading-snug">
            <i class="fas fa-arrow-right text-emerald-400 text-[8px] mt-0.5 shrink-0"></i>
            <span>{{ accion }}</span>
          </li>
        </ul>
      </div>

      <!-- RIESGOS -->
      <div>
        <div class="flex items-center gap-1 px-3 pt-2.5 pb-1.5">
          <i class="fas fa-shield-alt text-red-400 text-[9px]"></i>
          <h4 class="text-[9px] font-black text-red-400 uppercase tracking-widest">Riesgos</h4>
        </div>
        <ul class="px-3 pb-3 space-y-2">
          <li v-for="(riesgo, i) in insights.riesgos" :key="i"
            class="flex items-start gap-1.5 text-[11px] text-slate-600 leading-snug">
            <i class="fas fa-exclamation text-red-400 text-[8px] mt-0.5 shrink-0"></i>
            <span>{{ riesgo }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex flex-col items-center justify-center gap-3 py-6">
      <i class="fas fa-exclamation-triangle text-red-400 text-xl"></i>
      <p class="text-red-500 text-xs font-medium text-center">{{ error }}</p>
      <button @click="generateInsights(false)"
        class="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors">
        <i class="fas fa-sync-alt mr-1.5 text-slate-400"></i>Reintentar
      </button>
    </div>

    <!-- Empty -->
    <div v-else class="flex flex-col items-center justify-center gap-2 py-6">
      <i class="fas fa-brain text-xl text-slate-300"></i>
      <p class="text-slate-500 text-xs font-medium text-center">Sin análisis disponible</p>
      <button @click="generateInsights(false)"
        class="px-4 py-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg text-xs font-bold text-violet-600 transition-colors">
        Generar análisis
      </button>
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
import { API_CONFIG } from '@/config/api'

interface InsightsData {
  lectura: string
  acciones: string[]
  riesgos: string[]
}

const authStore = useAuthStore()
const clientsStore = useClientsStore()
const activitiesStore = useActivitiesStore()
const issuesStore = useIssuesStore()
const teamStore = useTeamStore()

const loading = ref(false)
const insights = ref<InsightsData | null>(null)
const error = ref('')

const userName = computed(() => authStore.user?.name?.split(' ')[0] || 'ti')

const CACHE_KEY = computed(() =>
  `crm_ai_insights_v4_${authStore.user?.name}_${authStore.user?.role}`
)
const CACHE_DURATION = 30 * 60 * 1000

const getCachedInsights = (): InsightsData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY.value)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Date.now() - parsed.timestamp < CACHE_DURATION) return parsed.data
      localStorage.removeItem(CACHE_KEY.value)
    }
  } catch {}
  return null
}

const setCachedInsights = (data: InsightsData): void => {
  try {
    localStorage.setItem(CACHE_KEY.value, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {}
}

const generateInsights = async (background = false) => {
  if (!background) loading.value = true
  error.value = ''

  if (background) {
    const cached = getCachedInsights()
    if (cached) { insights.value = cached; return }
  }

  if (!background) insights.value = null

  try {
    const userNameFull = authStore.user?.name || 'Usuario'
    const firstName = userNameFull.split(' ')[0]
    const userRole = (authStore.user?.role || 'employee') as string

    const todayDate = new Date()
    const todayMidnight = new Date(todayDate)
    todayMidnight.setHours(0, 0, 0, 0)

    const clientMap = new Map(clientsStore.clients.map((c: any) => [c._id, c.name]))

    const overdueActs = activitiesStore.activities
      .filter((a: any) => {
        if (a.status === 'completed' || a.status === 'cancelled') return false
        const d = new Date(a.dueDate || a.date)
        d.setHours(0, 0, 0, 0)
        return d < todayMidnight
      })
      .slice(0, 6)

    const todayActs = activitiesStore.activities
      .filter((a: any) => {
        if (a.status === 'completed' || a.status === 'cancelled') return false
        const d = new Date(a.dueDate || a.date)
        d.setHours(0, 0, 0, 0)
        return d.getTime() === todayMidnight.getTime()
      })
      .slice(0, 5)

    const inProgressActs = activitiesStore.activities
      .filter((a: any) => a.status === 'in-progress')
      .slice(0, 4)

    const highPriorityActs = activitiesStore.activities
      .filter((a: any) =>
        (a.priority === 'high' || a.priority === 'urgent') &&
        a.status !== 'completed' && a.status !== 'cancelled'
      )
      .slice(0, 3)

    const formatAct = (a: any): string => {
      const clientName = clientMap.get(a.clientId)
      const due = new Date(a.dueDate || a.date)
      due.setHours(0, 0, 0, 0)
      const diffDays = Math.floor((todayMidnight.getTime() - due.getTime()) / 86400000)
      let str = `"${a.title}"`
      if (clientName) str += ` (cliente: ${clientName})`
      if (diffDays > 0) str += ` [${diffDays}d vencida]`
      return str
    }

    const roleContextMap: Record<string, string> = {
      admin: 'gestión estratégica, supervisión de KPIs del negocio y liderazgo del equipo completo',
      manager: 'supervisión del equipo, desbloqueo de impedimentos y cumplimiento de objetivos comerciales',
      employee: 'ejecución de actividades asignadas y seguimiento personalizado de sus clientes',
      support: 'resolución de tickets, satisfacción del cliente y reducción del tiempo de respuesta',
      development: 'entregas técnicas, resolución de bugs y gestión de la deuda técnica',
      fullstack: 'cobertura técnica y operativa, integraciones y estabilidad del sistema',
      viewer: 'monitoreo del estado operativo y generación de reportes para decisiones',
      client: 'seguimiento del estado de sus proyectos activos y comunicación con el equipo',
    }

    const todayStr = todayDate.toLocaleDateString('es', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })

    const prompt = `Eres un asistente estratégico de CRM. Responde ÚNICAMENTE en el formato indicado. Sin texto extra.
REGLA IMPORTANTE: No menciones el nombre del sistema o plataforma CRM.

PERFIL DEL USUARIO:
- Nombre: ${firstName} | Rol: ${userRole}
- Responsabilidad principal: ${roleContextMap[userRole] || 'gestión operativa'}
- Fecha actual: ${todayStr}

ACTIVIDADES VENCIDAS (${overdueActs.length} sin completar):
${overdueActs.length > 0
  ? overdueActs.map(formatAct).map(s => `  · ${s}`).join('\n')
  : '  · Ninguna vencida — buena gestión del tiempo'}

ACTIVIDADES PARA HOY (${todayActs.length}):
${todayActs.length > 0
  ? todayActs.map(formatAct).map(s => `  · ${s}`).join('\n')
  : '  · Sin actividades programadas para hoy'}

EN PROGRESO ACTIVO (${inProgressActs.length}):
${inProgressActs.length > 0
  ? inProgressActs.map(formatAct).map(s => `  · ${s}`).join('\n')
  : '  · Ninguna en progreso activo'}

ALTA PRIORIDAD (${highPriorityActs.length}):
${highPriorityActs.length > 0
  ? highPriorityActs.map(formatAct).map(s => `  · ${s}`).join('\n')
  : '  · Sin tareas de alta prioridad pendientes'}

MÉTRICAS GLOBALES:
Clientes: ${clientsStore.clients.length} | Total actividades: ${activitiesStore.activities.length} (completadas: ${activitiesStore.activities.filter((a: any) => a.status === 'completed').length}) | Casos abiertos: ${issuesStore.issues.filter((i: any) => i.status === 'open').length} | Equipo: ${teamStore.members.length} personas

FORMATO DE RESPUESTA (responde EXACTAMENTE estas 6 líneas, sin saltar líneas adicionales):
Lectura: [2-3 oraciones evaluando la situación operativa real de ${firstName} con números y tareas específicas mencionadas arriba]
Accion1: [Acción concreta que ${firstName} debe ejecutar HOY basada en las tareas vencidas o del día]
Accion2: [Segunda acción prioritaria con impacto directo en los próximos 2 días]
Accion3: [Tercera acción táctica para esta semana basada en el rol de ${firstName}]
Riesgo1: [Riesgo operativo específico detectado en los datos, con consecuencia concreta]
Riesgo2: [Segundo riesgo identificado, diferente al primero, con causa raíz clara]`

    const response = await fetch(`${API_CONFIG.BASE_URL}/ai/gemini-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || `Error de IA (${response.status})`)
    }

    const result = await response.json()
    const aiText: string = result.text || ''
    if (!aiText) throw new Error('La IA no devolvió contenido')

    const lines = aiText.split('\n').map((l: string) => l.trim()).filter(Boolean)

    const lectura = lines.find((l: string) => l.startsWith('Lectura:'))?.replace('Lectura:', '').trim() || ''
    const acciones = lines
      .filter((l: string) => /^Accion\d+:/i.test(l))
      .map((l: string) => l.substring(l.indexOf(':') + 1).trim())
      .filter((l: string) => l.length > 5)
    const riesgos = lines
      .filter((l: string) => /^Riesgo\d+:/i.test(l))
      .map((l: string) => l.substring(l.indexOf(':') + 1).trim())
      .filter((l: string) => l.length > 5)

    const finalInsights: InsightsData = {
      lectura: lectura || 'Análisis completado. Revisa las secciones de acciones y riesgos.',
      acciones: acciones.length > 0 ? acciones : ['Revisa las actividades vencidas y actualiza su estado', 'Haz seguimiento a los clientes con actividades pendientes'],
      riesgos: riesgos.length > 0 ? riesgos : ['Actividades vencidas sin atender afectan la percepción del cliente']
    }

    insights.value = finalInsights
    setCachedInsights(finalInsights)

  } catch (err: any) {
    error.value = 'No se pudo conectar con la IA en este momento'
    console.error('AI Error:', err)
  } finally {
    if (!background) loading.value = false
  }
}

onMounted(() => {
  const cached = getCachedInsights()
  if (cached) {
    insights.value = cached
  }
  generateInsights(true)
})
</script>
