<template>
  <div class="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 lg:p-5 animate-fade-in animation-delay-1800">
    <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
      <h3 class="text-xs font-black text-slate-800 flex items-center tracking-tight uppercase">
        <div class="w-6 h-6 rounded bg-purple-50 flex items-center justify-center mr-2">
          <i class="fas fa-brain text-purple-500 text-[10px]"></i>
        </div>
        Insights IA
      </h3>
      <div class="flex items-center gap-2">
        <span class="text-[9px] bg-gradient-to-r from-purple-100 to-primary-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200 font-bold uppercase tracking-wider">
          Activo
        </span>
        <button
          @click="generateInsights(false)"
          :disabled="loading"
          class="w-6 h-6 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-all duration-200 disabled:opacity-50 text-slate-500 hover:text-primary-500"
          title="Actualizar insights"
        >
          <i :class="loading ? 'fas fa-spinner fa-spin text-[10px]' : 'fas fa-sync-alt text-[10px]'"></i>
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="relative mb-6 mx-auto w-16 h-16 flex items-center justify-center">
          <i class="fas fa-brain text-purple-500 text-3xl animate-bounce relative z-10"></i>
          <div class="absolute inset-0 bg-purple-100 rounded-full animate-pulse"></div>
        </div>
        <p class="text-slate-500 font-medium mb-3">Analizando datos con IA colaborativa...</p>
        <div class="flex justify-center space-x-1.5">
          <div class="w-2.5 h-2.5 bg-purple-400 rounded-full animate-pulse"></div>
          <div class="w-2.5 h-2.5 bg-primary-400 rounded-full animate-pulse animation-delay-300"></div>
          <div class="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse animation-delay-600"></div>
        </div>
      </div>
    </div>

    <div v-else-if="insights" class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
      
      <!-- Visión Creativa -->
      <div class="px-4 py-2 hover:bg-slate-50/50 transition-colors">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-5 h-5 rounded bg-amber-50 text-amber-500 flex items-center justify-center">
            <i class="fas fa-lightbulb text-[10px]"></i>
          </div>
          <h4 class="text-slate-800 font-bold text-[10px] uppercase tracking-wider">Visión</h4>
        </div>
        <p class="text-slate-500 text-[10px] font-medium leading-relaxed">{{ insights.summary }}</p>
      </div>

      <!-- Recomendaciones -->
      <div class="px-4 py-2 hover:bg-slate-50/50 transition-colors">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <i class="fas fa-bullseye text-[10px]"></i>
          </div>
          <h4 class="text-slate-800 font-bold text-[10px] uppercase tracking-wider">Recomendaciones</h4>
        </div>
        <div v-if="insights.recommendations && insights.recommendations.length > 0">
          <ul class="space-y-1">
            <li v-for="rec in insights.recommendations" :key="rec" class="text-slate-500 text-[10px] flex items-start font-medium leading-tight">
              <span class="text-emerald-400 mr-2 mt-[2px]"><i class="fas fa-circle text-[4px]"></i></span>
              <span>{{ rec }}</span>
            </li>
          </ul>
        </div>
        <div v-else class="text-slate-400 text-[10px] italic">
          Generando...
        </div>
      </div>

      <!-- Tendencias -->
      <div class="px-4 py-2 hover:bg-slate-50/50 transition-colors">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-5 h-5 rounded bg-sky-50 text-sky-500 flex items-center justify-center">
            <i class="fas fa-chart-line text-[10px]"></i>
          </div>
          <h4 class="text-slate-800 font-bold text-[10px] uppercase tracking-wider">Tendencias</h4>
        </div>
        <div v-if="insights.trends && insights.trends.length > 0">
          <ul class="space-y-1">
            <li v-for="trend in insights.trends" :key="trend" class="text-slate-500 text-[10px] flex items-start font-medium leading-tight">
              <span class="text-sky-400 mr-2 mt-[2px]"><i class="fas fa-circle text-[4px]"></i></span>
              <span>{{ trend }}</span>
            </li>
          </ul>
        </div>
        <div v-else class="text-slate-400 text-[10px] italic">
          Analizando...
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-10 bg-red-50 rounded-2xl border border-red-100">
      <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-red-500">
        <i class="fas fa-exclamation-triangle text-2xl"></i>
      </div>
      <p class="text-slate-700 font-bold mb-1">Inconveniente detectado</p>
      <p class="text-red-500 text-sm font-medium">{{ error }}</p>
      <button
        @click="generateInsights(false)"
        class="mt-5 px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-slate-700 font-bold transition-all duration-200 active:scale-[0.98]"
      >
        <i class="fas fa-sync-alt mr-2 text-slate-400"></i>Reintentar Análisis
      </button>
    </div>

    <div v-else class="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
      <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
        <i class="fas fa-brain text-2xl"></i>
      </div>
      <p class="font-medium">Inicia un análisis con IA para revelar el potencial de tus datos</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import {
  useClientsStore,
  useActivitiesStore,
  usePaymentsStore,
  useIssuesStore,
  useTeamStore
} from '../stores'

interface InsightsData {
  summary: string
  recommendations: string[]
  trends: string[]
}

const clientsStore = useClientsStore()
const activitiesStore = useActivitiesStore()
const paymentsStore = usePaymentsStore()
const issuesStore = useIssuesStore()
const teamStore = useTeamStore()

const loading = ref(false)
const insights = ref<InsightsData | null>(null)
const error = ref('')

// Datos por defecto para mostrar inmediatamente
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

// API Key desde variables de entorno
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const authStore = useAuthStore()

// Cache key for localStorage
const CACHE_KEY = 'crm_ai_insights_cache'
const CACHE_DURATION = 2 * 60 * 60 * 1000 // 2 hours (more fresh for Gemini)

// Cache functions
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
  
  // Verificar API key
  if (!API_KEY) {
    error.value = 'Gemini API Key no configurada'
    if (!background) loading.value = false
    return
  }
  
  // Check cache first (solo si no es manual)
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
    // Datos del usuario para contexto
    const userRole = authStore.user?.role || 'Miembro'
    const userDept = authStore.user?.department || 'General'
    const userName = authStore.user?.name || 'Usuario'

    // Preparar datos para el análisis
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
    IMPORTANTE: No menciones la palabra "GEMS" en ninguna parte de tu respuesta. 
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

    TAREA:
    Genera un análisis específico para este ROL y DEPARTAMENTO enfocado en la escalabilidad y eficiencia técnica.
    
    FORMATO DE RESPUESTA (Estricto):
    Resumen: [1 frase potente y motivadora de visión]
    Rec1: [Recomendación táctica 1]
    Rec2: [Recomendación táctica 2]
    Rec3: [Recomendación táctica 3]
    Trend1: [Tendencia detectada 1]
    Trend2: [Tendencia detectada 2]
    
    Evita introducciones, ve directo al formato.`

    let response
    let errorDetail = null

    try {
      // Intento 1: Gemini 2.5 Flash (El estándar actual en 2026)
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      })

      if (!response.ok) {
        errorDetail = await response.json().catch(() => ({}))
        console.warn('Fallo con 2.5 Flash, intentando con 3.1 Lite...', errorDetail)
        
        // Intento 2: Gemini 3.1 Flash Lite (Fallback de ultra-baja latencia)
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        })
      }
    } catch (e) {
      console.error('Error de red inicial:', e)
      throw new Error('Error de conexión con la IA')
    }

    if (!response.ok) {
      const finalError = await response.json().catch(() => ({}))
      console.error('Gemini API Error FINAL:', finalError)
      throw new Error(`Error de API: ${response.status}`)
    }

    const result = await response.json()
    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    if (!aiText) throw new Error('Gemini no devolvió contenido')

    // Parsing simple pero efectivo
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


// Generar insights automáticamente al montar el componente
onMounted(() => {
  // Revisar cache inmediatamente
  const cached = getCachedInsights()
  if (cached) {
    insights.value = cached
  } else {
    // Mostrar datos por defecto si no hay cache
    insights.value = defaultInsights
  }
  
  // Generar insights reales en background inmediatamente
  generateInsights(true) // true indica que es background
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

.animation-delay-1800 {
  animation-delay: 1.8s;
}
</style>