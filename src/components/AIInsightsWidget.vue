<template>
  <section class="bg-white rounded-2xl border border-outline-variant overflow-hidden shadow-sm relative animate-fade-in">
    <!-- Top Badge -->
    <div class="absolute top-0 right-0 p-4">
      <span class="px-3 py-1 bg-primary-container/20 text-primary text-label-sm font-bold rounded-full border border-primary/20 flex items-center gap-1">
        <span class="material-symbols-outlined text-[14px]">bolt</span> POWERED BY GEMINI
      </span>
    </div>

    <div class="p-8">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-8">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white shadow-lg">
          <span class="material-symbols-outlined">psychology</span>
        </div>
        <div class="flex items-center gap-3">
          <h3 class="text-headline-md font-headline-md ai-gradient-text">Insights Estratégicos IA</h3>
          <button
            @click="generateInsights(false)"
            :disabled="loading"
            class="p-1.5 rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50"
            title="Actualizar análisis"
          >
            <span :class="['material-symbols-outlined text-outline', loading ? 'animate-spin' : '']">refresh</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 space-y-4">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
          <div class="relative flex items-center justify-center w-16 h-16 bg-white rounded-full border border-primary/20 shadow-sm">
            <span class="material-symbols-outlined text-primary text-3xl animate-pulse">auto_awesome</span>
          </div>
        </div>
        <p class="text-body-md text-outline font-medium">Sincronizando con Gemini Pro...</p>
      </div>

      <!-- Content State -->
      <div v-else-if="insights" class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Vision Card -->
        <div class="group">
          <div class="flex items-center gap-2 mb-4 text-primary font-bold">
            <span class="material-symbols-outlined">lightbulb</span>
            <span class="text-label-md uppercase tracking-widest">Visión</span>
          </div>
          <p class="text-body-md text-on-surface-variant leading-relaxed">
            {{ insights.summary }}
          </p>
        </div>

        <!-- Recommendations Card -->
        <div class="group">
          <div class="flex items-center gap-2 mb-4 text-secondary font-bold">
            <span class="material-symbols-outlined">task_alt</span>
            <span class="text-label-md uppercase tracking-widest">Recomendaciones</span>
          </div>
          <ul class="space-y-3">
            <li v-for="rec in insights.recommendations" :key="rec" class="flex items-start gap-2 text-body-md text-on-surface-variant">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
              {{ rec }}
            </li>
          </ul>
        </div>

        <!-- Trends Card -->
        <div class="group">
          <div class="flex items-center gap-2 mb-4 text-on-tertiary-container font-bold">
            <span class="material-symbols-outlined">trending_up</span>
            <span class="text-label-md uppercase tracking-widest">Tendencias</span>
          </div>
          <ul class="space-y-3">
            <li v-for="trend in insights.trends" :key="trend" class="flex items-start gap-2 text-body-md text-on-surface-variant">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              {{ trend }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-error-container/20 border border-error/10 rounded-xl p-6 text-center">
        <span class="material-symbols-outlined text-error text-4xl mb-2">warning</span>
        <p class="text-on-surface font-bold">Error en el análisis</p>
        <p class="text-on-surface-variant text-sm mb-4">{{ error }}</p>
        <button @click="generateInsights(false)" class="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity">
          Reintentar
        </button>
      </div>
    </div>

    <!-- Footer Info -->
    <div class="bg-surface-container-low px-8 py-4 border-t border-outline-variant flex justify-between items-center">
      <span class="text-label-sm text-outline italic">Última actualización: {{ lastUpdatedText }}</span>
      <button class="text-primary font-bold text-label-md hover:underline flex items-center gap-1">
        Ver análisis detallado <span class="material-symbols-outlined text-[16px]">chevron_right</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import {
  useClientsStore,
  useActivitiesStore,
  usePaymentsStore,
  useIssuesStore,
  useTeamStore
} from '../stores'
import { API_CONFIG } from '@/config/api'

interface InsightsData {
  summary: string
  recommendations: string[]
  trends: string[]
}

const authStore = useAuthStore()
const clientsStore = useClientsStore()
const activitiesStore = useActivitiesStore()
const paymentsStore = usePaymentsStore()
const issuesStore = useIssuesStore()
const teamStore = useTeamStore()

const loading = ref(false)
const insights = ref<InsightsData | null>(null)
const error = ref('')

const lastUpdatedText = computed(() => {
  return 'Hace pocos minutos'
})

const defaultInsights: InsightsData = {
  summary: 'Tu negocio está en constante evolución, transformando oportunidades en resultados tangibles.',
  recommendations: [
    'Optimiza el seguimiento de actividades pendientes para aumentar la productividad del equipo',
    'Implementa estrategias de retención basadas en el análisis de clientes recurrentes',
    'Explora oportunidades de cross-selling con tus clientes más valiosos'
  ],
  trends: [
    'Crecimiento sostenido en la adquisición de nuevos clientes',
    'Mejora en la resolución eficiente de casos e incidencias',
    'Tendencia positiva en la colaboración y comunicación del equipo'
  ]
}

const CACHE_KEY = 'crm_ai_insights_cache'
const CACHE_DURATION = 2 * 60 * 60 * 1000 

const getCachedInsights = (): InsightsData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      const now = Date.now()
      if (now - parsed.timestamp < CACHE_DURATION) {
        return parsed.data
      } else {
        localStorage.removeItem(CACHE_KEY)
      }
    }
  } catch (error) {
    console.warn('Error reading insights cache:', error)
  }
  return null
}

const setCachedInsights = (data: InsightsData): void => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.warn('Error caching insights:', error)
  }
}

const generateInsights = async (background = false) => {
  if (!background) {
    loading.value = true
  }
  error.value = ''

  if (background) {
    const cached = getCachedInsights()
    if (cached) {
      insights.value = cached
      return
    }
  }
  
  if (!background) {
    insights.value = null
  }

  try {
    const userRole = authStore.user?.role || 'Miembro'
    const userDept = authStore.user?.department || 'General'
    const userName = authStore.user?.name || 'Usuario'

    const data = {
      clients: clientsStore.clients.length,
      activities: {
        total: activitiesStore.activities.length,
        pending: activitiesStore.activities.filter((a: any) => a.status === 'pending').length,
        completed: activitiesStore.activities.filter((a: any) => a.status === 'completed').length,
        overdue: activitiesStore.activities.filter((a: any) => a.status === 'overdue').length
      },
      issues: {
        total: issuesStore.issues.length,
        open: issuesStore.issues.filter((i: any) => i.status === 'open').length
      },
      team: teamStore.members.length
    }

    const prompt = `Actúa como un Consultor Estratégico de Negocios de alto nivel. 
    Refiérete al sistema simplemente como "tu plataforma", "tu CRM" o "tu ecosistema de gestión".
    
    CONTEXTO DEL USUARIO:
    - Nombre: ${userName}
    - Rol: ${userRole}
    - Departamento: ${userDept}

    DATOS ACTUALES DEL CRM:
    - Clientes: ${data.clients}
    - Actividades: ${data.activities.total} (${data.activities.pending} pendientes, ${data.activities.overdue} vencidas)
    - Casos/Issues: ${data.issues.total} (${data.issues.open} abiertos)
    - Equipo: ${data.team} integrantes

    FORMATO DE RESPUESTA (Estricto):
    Resumen: [1 frase potente y motivadora de visión]
    Rec1: [Recomendación táctica 1]
    Rec2: [Recomendación táctica 2]
    Rec3: [Recomendación táctica 3]
    Trend1: [Tendencia detectada 1]
    Trend2: [Tendencia detectada 2]`

    let aiText = ''
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/ai/gemini-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        throw new Error(`Error de IA (${response.status})`)
      }

      const result = await response.json()
      aiText = result.text || ''
    } catch (e: any) {
      throw new Error(e?.message || 'Error de conexión con la IA')
    }

    if (!aiText) throw new Error('La IA no devolvió contenido')

    const lines = aiText.split('\n')
    const summaryLine = lines.find((l: string) => l.startsWith('Resumen:'))?.replace('Resumen:', '').trim()
    
    const recs = lines
      .filter((l: string) => l.includes('Rec'))
      .map((l: string) => l.substring(l.indexOf(':') + 1).trim())
      .filter((l: string) => l.length > 5)
    
    const trends = lines
      .filter((l: string) => l.includes('Trend'))
      .map((l: string) => l.substring(l.indexOf(':') + 1).trim())
      .filter((l: string) => l.length > 5)

    const finalInsights = {
      summary: summaryLine || 'Análisis completado con éxito para tu perfil.',
      recommendations: recs.length > 0 ? recs : defaultInsights.recommendations,
      trends: trends.length > 0 ? trends : defaultInsights.trends
    }

    insights.value = finalInsights
    setCachedInsights(finalInsights)

  } catch (err: any) {
    error.value = 'No se pudo conectar con la IA en este momento'
    console.error('Gemini Error:', err)
  } finally {
    if (!background) loading.value = false
  }
}

onMounted(() => {
  const cached = getCachedInsights()
  if (cached) {
    insights.value = cached
  } else {
    insights.value = defaultInsights
  }
  generateInsights(true) 
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}

.ai-gradient-text {
  background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>