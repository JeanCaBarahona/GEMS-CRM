<template>
  <div class="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">

    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
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
        title="Actualizar"
      >
        <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'" class="text-slate-400 text-[10px]"></i>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center gap-3">
      <i class="fas fa-brain text-violet-400 text-lg animate-pulse"></i>
      <p class="text-slate-400 text-xs font-medium">Analizando tu situación...</p>
    </div>

    <!-- Content: 3 columnas que llenan la altura disponible -->
    <div v-else-if="insights" class="flex-1 min-h-0 grid grid-cols-3 divide-x divide-slate-100 overflow-hidden">

      <div class="flex flex-col overflow-hidden">
        <div class="flex items-center gap-1.5 px-4 pt-3 pb-2 shrink-0">
          <i class="fas fa-eye text-amber-500 text-[9px]"></i>
          <h4 class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Situación</h4>
        </div>
        <p class="px-4 pb-4 text-[11px] text-slate-600 leading-relaxed overflow-y-auto flex-1">{{ insights.lectura }}</p>
      </div>

      <div class="flex flex-col overflow-hidden">
        <div class="flex items-center gap-1.5 px-4 pt-3 pb-2 shrink-0">
          <i class="fas fa-bullseye text-emerald-500 text-[9px]"></i>
          <h4 class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Acciones</h4>
        </div>
        <ul class="px-4 pb-4 space-y-2.5 overflow-y-auto flex-1">
          <li v-for="(accion, i) in insights.acciones" :key="i"
            class="flex items-start gap-1.5 text-[11px] text-slate-600 leading-snug">
            <i class="fas fa-arrow-right text-emerald-400 text-[8px] mt-0.5 shrink-0"></i>
            <span>{{ accion }}</span>
          </li>
        </ul>
      </div>

      <div class="flex flex-col overflow-hidden">
        <div class="flex items-center gap-1.5 px-4 pt-3 pb-2 shrink-0">
          <i class="fas fa-shield-alt text-red-400 text-[9px]"></i>
          <h4 class="text-[9px] font-black text-red-400 uppercase tracking-widest">Riesgos</h4>
        </div>
        <ul class="px-4 pb-4 space-y-2.5 overflow-y-auto flex-1">
          <li v-for="(riesgo, i) in insights.riesgos" :key="i"
            class="flex items-start gap-1.5 text-[11px] text-slate-600 leading-snug">
            <i class="fas fa-exclamation text-red-400 text-[8px] mt-0.5 shrink-0"></i>
            <span>{{ riesgo }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center gap-3 p-6">
      <i class="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
      <p class="text-red-500 text-xs font-medium text-center">{{ error }}</p>
      <button @click="generateInsights(false)"
        class="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors">
        <i class="fas fa-sync-alt mr-1.5 text-slate-400"></i>Reintentar
      </button>
    </div>

    <!-- Empty -->
    <div v-else class="flex-1 flex flex-col items-center justify-center gap-2 p-6">
      <i class="fas fa-brain text-2xl text-slate-200"></i>
      <p class="text-slate-400 text-xs font-medium">Sin análisis disponible</p>
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
import { useClientsStore, useActivitiesStore, useIssuesStore, useTeamStore } from '../stores'
import { API_CONFIG } from '@/config/api'

interface InsightsData { lectura: string; acciones: string[]; riesgos: string[] }

const authStore = useAuthStore()
const clientsStore = useClientsStore()
const activitiesStore = useActivitiesStore()
const issuesStore = useIssuesStore()
const teamStore = useTeamStore()

const loading = ref(false)
const insights = ref<InsightsData | null>(null)
const error = ref('')

const userName = computed(() => authStore.user?.name?.split(' ')[0] || 'ti')
const CACHE_KEY = computed(() => `crm_ai_insights_v4_${authStore.user?.name}_${authStore.user?.role}`)
const CACHE_DURATION = 30 * 60 * 1000

const getCached = (): InsightsData | null => {
  try {
    const c = localStorage.getItem(CACHE_KEY.value)
    if (c) { const p = JSON.parse(c); if (Date.now() - p.timestamp < CACHE_DURATION) return p.data; localStorage.removeItem(CACHE_KEY.value) }
  } catch {}; return null
}
const setCache = (d: InsightsData) => { try { localStorage.setItem(CACHE_KEY.value, JSON.stringify({ data: d, timestamp: Date.now() })) } catch {} }

const generateInsights = async (background = false) => {
  if (!background) loading.value = true
  error.value = ''
  if (background) { const c = getCached(); if (c) { insights.value = c; return } }
  if (!background) insights.value = null
  try {
    const firstName = authStore.user?.name?.split(' ')[0] || 'Usuario'
    const userRole = (authStore.user?.role || 'employee') as string
    const todayDate = new Date(); const tm = new Date(todayDate); tm.setHours(0,0,0,0)
    const clientMap = new Map(clientsStore.clients.map((c: any) => [c._id, c.name]))
    const overdueActs = activitiesStore.activities.filter((a: any) => { if (a.status==='completed'||a.status==='cancelled') return false; const d=new Date(a.dueDate||a.date);d.setHours(0,0,0,0);return d<tm }).slice(0,6)
    const todayActs = activitiesStore.activities.filter((a: any) => { if (a.status==='completed'||a.status==='cancelled') return false; const d=new Date(a.dueDate||a.date);d.setHours(0,0,0,0);return d.getTime()===tm.getTime() }).slice(0,5)
    const inProgressActs = activitiesStore.activities.filter((a: any) => a.status==='in-progress').slice(0,4)
    const highPriorityActs = activitiesStore.activities.filter((a: any) => (a.priority==='high'||a.priority==='urgent')&&a.status!=='completed'&&a.status!=='cancelled').slice(0,3)
    const fmt = (a: any) => { const cn=clientMap.get(a.clientId); const d=new Date(a.dueDate||a.date);d.setHours(0,0,0,0); const diff=Math.floor((tm.getTime()-d.getTime())/86400000); return `"${a.title}"${cn?` (${cn})`:''}${diff>0?` [${diff}d vencida]`:''}` }
    const roleCtx: Record<string,string> = { admin:'gestión estratégica y supervisión de KPIs', manager:'supervisión del equipo y cumplimiento de objetivos', employee:'ejecución de actividades y seguimiento de clientes', support:'resolución de tickets y satisfacción del cliente', development:'entregas técnicas y resolución de bugs', fullstack:'cobertura técnica y operativa', viewer:'monitoreo y reportes', client:'seguimiento de proyectos activos' }
    const todayStr = todayDate.toLocaleDateString('es', {weekday:'long',day:'numeric',month:'long',year:'numeric'})
    const prompt = `Eres un asistente estratégico de CRM. Responde ÚNICAMENTE en el formato indicado. No menciones el nombre del sistema.
PERFIL: ${firstName} | Rol: ${userRole} | Responsabilidad: ${roleCtx[userRole]||'gestión operativa'} | Fecha: ${todayStr}
VENCIDAS (${overdueActs.length}): ${overdueActs.length>0?overdueActs.map(fmt).map(s=>`· ${s}`).join(' | '):'Ninguna'}
HOY (${todayActs.length}): ${todayActs.length>0?todayActs.map(fmt).map(s=>`· ${s}`).join(' | '):'Ninguna'}
EN PROGRESO (${inProgressActs.length}): ${inProgressActs.length>0?inProgressActs.map(fmt).map(s=>`· ${s}`).join(' | '):'Ninguna'}
ALTA PRIORIDAD (${highPriorityActs.length}): ${highPriorityActs.length>0?highPriorityActs.map(fmt).map(s=>`· ${s}`).join(' | '):'Ninguna'}
MÉTRICAS: Clientes:${clientsStore.clients.length} | Activ:${activitiesStore.activities.length}(comp:${activitiesStore.activities.filter((a:any)=>a.status==='completed').length}) | Casos abiertos:${issuesStore.issues.filter((i:any)=>i.status==='open').length} | Equipo:${teamStore.members.length}
RESPONDE EXACTAMENTE (6 líneas, sin texto extra):
Lectura: [evaluación concreta de ${firstName} con datos específicos]
Accion1: [acción inmediata para HOY]
Accion2: [segunda acción prioritaria]
Accion3: [tercera acción táctica]
Riesgo1: [riesgo específico con consecuencia]
Riesgo2: [segundo riesgo diferente]`
    const response = await fetch(`${API_CONFIG.BASE_URL}/ai/gemini-generate`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({prompt}) })
    if (!response.ok) { const e=await response.json().catch(()=>({})); throw new Error(e.error||`Error ${response.status}`) }
    const result = await response.json(); const aiText: string = result.text||''; if (!aiText) throw new Error('Sin contenido')
    const lines = aiText.split('\n').map((l:string)=>l.trim()).filter(Boolean)
    const lectura = lines.find((l:string)=>l.startsWith('Lectura:'))?.replace('Lectura:','').trim()||''
    const acciones = lines.filter((l:string)=>/^Accion\d+:/i.test(l)).map((l:string)=>l.substring(l.indexOf(':')+1).trim()).filter((l:string)=>l.length>5)
    const riesgos = lines.filter((l:string)=>/^Riesgo\d+:/i.test(l)).map((l:string)=>l.substring(l.indexOf(':')+1).trim()).filter((l:string)=>l.length>5)
    const final: InsightsData = { lectura:lectura||'Análisis completado.', acciones:acciones.length>0?acciones:['Revisa las actividades vencidas'], riesgos:riesgos.length>0?riesgos:['Actividades sin atender afectan la percepción del cliente'] }
    insights.value = final; setCache(final)
  } catch(err:any) { error.value='No se pudo conectar con la IA'; console.error('AI Error:',err) } finally { if (!background) loading.value=false }
}

onMounted(() => { const c=getCached(); if(c) insights.value=c; generateInsights(true) })
</script>
