<template>
  <div class="flex h-[85vh] bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
    <!-- Lista de conversaciones -->
    <div class="w-80 min-w-[280px] max-w-[340px] bg-slate-50 border-r border-slate-200 p-4 scroll-smooth overflow-y-auto">
      <div class="font-black text-slate-800 mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
          <i class="fas fa-history text-primary-600 text-xs"></i>
        </div>
        Historial IA
      </div>
      <ProspectConversationsList @select="handleSelectConversation" />
    </div>

    <!-- Área de trabajo -->
    <div class="flex-1 flex flex-col bg-white overflow-hidden">
      <template v-if="selectedConversation">
        <div class="flex-1 overflow-y-auto p-6">
          <ProspectConversationDetail :conversation="selectedConversation" @message-sent="handleMessageSent" />
        </div>
      </template>

      <template v-else>
        <!-- Header con Toggle de Modo -->
        <div class="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-200">
              <i class="fas fa-robot text-white text-lg"></i>
            </div>
            <div>
              <h1 class="text-lg font-black text-slate-800 leading-none">Consultor Estratégico IA</h1>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Soluciones B2B Senior</p>
            </div>
          </div>

          <div class="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              @click="mode = 'simple'"
              :class="mode === 'simple' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'"
              class="px-4 py-1.5 rounded-lg text-xs font-black transition-all"
            >
              Análisis Rápido
            </button>
            <button 
              @click="mode = 'architect'"
              :class="mode === 'architect' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'"
              class="px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-2"
            >
              <i class="fas fa-project-diagram"></i>
              Arquitecto Pro
            </button>
          </div>
        </div>

        <!-- Formulario de Entrada -->
        <div class="flex-1 overflow-y-auto p-8 space-y-8">
          <!-- Sección Común: Datos del Prospecto -->
          <div class="space-y-3">
            <label class="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
              <i class="fas fa-info-circle text-primary-500"></i>
              Diagnóstico del Prospecto (Empresa y Problemas)
            </label>
            <textarea 
              v-model="inputText" 
              rows="4" 
              class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 shadow-inner font-medium text-sm focus:outline-none transition-all resize-none" 
              placeholder="Describe los desafíos críticos, el sector de la empresa y lo que el comercial detectó..."
            ></textarea>
          </div>

          <!-- Sección Arquitecto: Mapa y Nodos -->
          <div v-if="mode === 'architect'" class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div class="space-y-3">
              <label class="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                <i class="fas fa-code-branch text-indigo-500"></i>
                Mapa Conceptual (JSON)
              </label>
              <textarea 
                v-model="conceptualMapJson" 
                rows="8" 
                class="w-full px-5 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-emerald-400 placeholder-slate-600 font-mono text-[11px] focus:ring-4 focus:ring-indigo-500/10 shadow-2xl focus:outline-none transition-all resize-none" 
                placeholder='{ "nodes": [...], "edges": [...] }'
              ></textarea>
            </div>
            <div class="space-y-3">
              <label class="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                <i class="fas fa-align-left text-sky-500"></i>
                Descripción de Nodos
              </label>
              <textarea 
                v-model="nodeDescriptions" 
                rows="8" 
                class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-sky-500/10 shadow-inner font-medium text-sm focus:outline-none transition-all resize-none" 
                placeholder="Explica qué hace cada cuadrito del flujo..."
              ></textarea>
            </div>
          </div>

          <!-- Imágenes y Multimedia -->
          <div class="space-y-3">
            <label class="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
              <i class="fas fa-images text-amber-500"></i>
              Evidencia Visual (Opcional)
            </label>
            <div class="relative group cursor-pointer">
              <input type="file" multiple accept="image/*" @change="handleImageUpload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div class="w-full py-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center group-hover:border-primary-400 group-hover:bg-primary-50 transition-all duration-300">
                <i class="fas fa-cloud-upload-alt text-2xl text-slate-300 group-hover:text-primary-400 mb-2"></i>
                <span class="text-xs font-bold text-slate-400 group-hover:text-primary-600 uppercase tracking-widest">Cargar Evidencia</span>
              </div>
            </div>
          </div>

          <!-- Botón de Generación -->
          <div class="flex items-center justify-center pt-4">
            <button 
              @click="analyzeProspect" 
              :disabled="loading || !inputText" 
              class="w-full max-w-md py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl hover:shadow-xl hover:shadow-primary-200 transition-all duration-300 font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <i :class="loading ? 'fas fa-circle-notch fa-spin' : 'fas fa-magic'"></i>
              {{ loading ? 'Generando Propuesta Técnica...' : 'Generar Propuesta con IA' }}
            </button>
          </div>

          <!-- Resultado en Markdown -->
          <div v-if="result" class="mt-10 animate-slide-up">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <i class="fas fa-file-contract text-emerald-500"></i>
                Propuesta Estratégica Generada
              </h2>
              <button @click="copyResult" class="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider">
                Copiar Markdown
              </button>
            </div>
            <div class="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-100 prose prose-slate max-w-none prose-sm prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-table:border prose-table:rounded-xl">
              <div class="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed">{{ result }}</div>
            </div>
          </div>

          <div v-if="error" class="p-5 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 flex items-center gap-3 animate-shake">
            <i class="fas fa-exclamation-triangle text-lg"></i>
            {{ error }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProspectConversationsList from '@/features/conversations/components/ProspectConversationsListFixed.vue'
import ProspectConversationDetail from '@/features/conversations/components/ProspectConversationDetail.vue'
import { useNotifications } from '@/composables/useNotifications'
const { showSuccess } = useNotifications()

// Estado
const mode = ref<'simple' | 'architect'>('simple')
const selectedConversation = ref(null)
const inputText = ref('')
const conceptualMapJson = ref('')
const nodeDescriptions = ref('')
const images = ref<Array<{file: File, preview: string}>>([])
const loading = ref(false)
const result = ref('')
const error = ref('')

// Configuración
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const CATALOGO_SERVICIOS = `
- Asterisk / Telefonía IP (SIP, Troncales)
- Agentes de IA (Voz y Texto)
- GEMS CRM (Gestión de clientes y casos)
- Automatización de WhatsApp (InConcert, API Cloud)
- Webhooks y Integraciones API
- Bases de Datos y Dashboard Realtime
- Control de Scope y Consultoría Técnica
`

function handleSelectConversation(conversation: any) {
  selectedConversation.value = conversation
}

function handleMessageSent(message: any) {
  if (selectedConversation.value !== null) {
    (selectedConversation.value as any).messages.push(message)
  }
}

function handleImageUpload(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  images.value = []
  for (const file of Array.from(files)) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      images.value.push({ file, preview: ev.target?.result as string })
    }
    reader.readAsDataURL(file)
  }
}

function copyResult() {
  navigator.clipboard.writeText(result.value)
  showSuccess('Propuesta copiada al portapapeles')
}

async function analyzeProspect() {
  if (!GEMINI_API_KEY) {
    error.value = 'API Key de Gemini no configurada en el entorno'
    return
  }

  loading.value = true
  error.value = ''
  result.value = ''

  try {
    let prompt = ''
    
    if (mode.value === 'architect') {
      prompt = `Actúas como un Arquitecto de Soluciones Senior y Consultor Comercial para GEMS. 
      Tu misión es transformar un mapa conceptual sencillo en una propuesta técnica y comercial sólida para un cliente.

      CATÁLOGO DE SERVICIOS:
      ${CATALOGO_SERVICIOS}

      DATOS DEL PROSPECTO (Diagnóstico):
      ${inputText.value}

      MAPA CONCEPTUAL (JSON):
      ${conceptualMapJson.value || 'No proporcionado'}

      DESCRIPCIÓN DE NODOS:
      ${nodeDescriptions.value || 'No proporcionado'}

      TAREAS A REALIZAR:
      1. ANÁLISIS DE DIAGNÓSTICO: Identifica los 3 desafíos críticos que nuestra tecnología debe resolver.
      2. VALIDACIÓN DEL FLUJO LÓGICO: Explica qué sucede en cada etapa del flujo, identifica faltas lógicas e indica requerimientos técnicos (APIs, Webhooks, DB) para los implementadores (Isaac, David o Jean Carlo).
      3. MATCH DE SERVICIOS: Selecciona las soluciones exactas del catálogo que soportan este flujo. Justifica costo/beneficio.
      4. SPEECH COMERCIAL: Redacta un texto de cierre para el comercial, enfocado en ahorro de tiempo y Scope Control.

      FORMATO REQUERIDO (Markdown):
      - Títulos jerárquicos potentes.
      - Negritas para conceptos clave.
      - TABLAS para los requerimientos técnicos.
      - Estructura lista para PDF.
      - Tono profesional, tecnológico y humano (Medellín-friendly).
      - NUNCA menciones la palabra "GEMS" en la propuesta, refiérete como "la plataforma" o "el ecosistema".`
    } else {
      prompt = `Eres un asesor comercial experto. Analiza este prospecto y genera un diagnóstico, estrategias y sugerencias de automatización.
      Prospecto: ${inputText.value}
      No menciones la palabra "GEMS".`
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    if (!response.ok) throw new Error('Fallo en la comunicación con la IA')

    const data = await response.json()
    result.value = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo generar la propuesta'

    // Generar nombre para el historial
    const namePrompt = `Sugiere un nombre corto y profesional para este prospecto basado en: ${inputText.value}. Formato: "Prospecto [Color] [Sector]"`
    const nameResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: namePrompt }] }]
      })
    })
    
    const nameData = await nameResponse.json()
    const prospectName = nameData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Prospecto Nuevo'

    // Guardar en backend
    await fetch('https://gems-crm-backend.onrender.com/api/prospects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prospectName,
        company: '',
        initialMessage: inputText.value + '\n\n' + result.value
      })
    })

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('prospect-created'))
    }

  } catch (e: any) {
    error.value = e.message || 'Error al procesar la propuesta'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
.animate-slide-up {
  animation: slideUp 0.5s ease-out;
}
.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
