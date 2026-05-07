<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-5 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
            <i class="fas fa-wand-magic-sparkles text-sm"></i>
          </div>
          <div>
            <h2 class="text-base font-black text-slate-900">Nuevo Prospecto con IA</h2>
            <p class="text-xs text-slate-500 font-medium mt-0.5">Genera propuestas comerciales en segundos</p>
          </div>
        </div>
        <!-- Mode Switcher -->
        <div class="flex bg-slate-100 rounded-xl p-1">
          <button
            @click="mode = 'simple'"
            :class="[
              'px-3 py-1.5 rounded-lg text-[11px] font-black transition-all',
              mode === 'simple' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
            ]"
          >
            <i class="fas fa-bolt mr-1.5"></i>Rápido
          </button>
          <button
            @click="mode = 'architect'"
            :class="[
              'px-3 py-1.5 rounded-lg text-[11px] font-black transition-all',
              mode === 'architect' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
            ]"
          >
            <i class="fas fa-sitemap mr-1.5"></i>Arquitecto
          </button>
        </div>
      </div>
    </div>

    <!-- Form -->
    <div class="p-6 space-y-5">
      <!-- Datos del prospecto -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Empresa</label>
          <input
            v-model="company"
            type="text"
            placeholder="Ej. Acme Corp"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all"
          />
        </div>
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Contacto (opcional)</label>
          <input
            v-model="contactName"
            type="text"
            placeholder="Nombre del contacto"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all"
          />
        </div>
      </div>

      <!-- Diagnóstico -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Diagnóstico del prospecto <span class="text-rose-500">*</span>
          </label>
          <button
            v-if="speechSupported"
            type="button"
            @click="toggleRecording"
            :class="[
              'px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-all',
              isRecording
                ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200',
            ]"
          >
            <i :class="['fas', isRecording ? 'fa-stop' : 'fa-microphone', 'text-[10px]']"></i>
            {{ isRecording ? 'Detener' : 'Dictar' }}
          </button>
        </div>
        <div class="relative">
          <textarea
            v-model="inputText"
            rows="5"
            placeholder="Describe la empresa, sector, problemas detectados, oportunidades, contexto comercial... o haz click en Dictar y habla."
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all resize-none leading-relaxed"
            :class="{ 'ring-2 ring-rose-300 border-rose-300': isRecording }"
          ></textarea>
          <div v-if="isRecording" class="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-rose-500 text-white rounded-full text-[9px] font-black">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            Grabando
          </div>
        </div>
        <div class="flex justify-between items-center mt-1.5 px-1">
          <span class="text-[10px] text-slate-400 font-bold">{{ inputText.length }} caracteres</span>
          <span v-if="inputText.length > 0 && inputText.length < 30" class="text-[10px] text-amber-600 font-bold">
            <i class="fas fa-info-circle mr-1"></i>Añade más contexto para mejor calidad
          </span>
        </div>
      </div>

      <!-- Architect-only fields -->
      <transition name="expand">
        <div v-if="mode === 'architect'" class="space-y-3 pt-1 border-t border-slate-100">
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Mapa conceptual (opcional)
            </label>
            <textarea
              v-model="conceptMap"
              rows="3"
              placeholder="Describe el flujo o pega un esquema JSON con la arquitectura propuesta..."
              class="w-full px-3.5 py-3 bg-slate-900 text-emerald-300 border border-slate-700 rounded-xl text-xs font-mono placeholder-slate-500 focus:border-violet-500 outline-none transition-all resize-none"
            ></textarea>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Notas técnicas (opcional)
            </label>
            <textarea
              v-model="techNotes"
              rows="2"
              placeholder="APIs, integraciones, restricciones técnicas..."
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all resize-none"
            ></textarea>
          </div>
        </div>
      </transition>

      <!-- Image Upload -->
      <div>
        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
          Evidencia visual (opcional, multimodal)
        </label>
        <div
          @drop.prevent="onDrop"
          @dragover.prevent
          @dragenter.prevent
          class="relative border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition-all"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            @change="onFilesSelected"
          />
          <div v-if="!images.length" class="px-4 py-6 text-center pointer-events-none">
            <i class="fas fa-cloud-arrow-up text-2xl text-slate-300 mb-2 block"></i>
            <p class="text-xs font-bold text-slate-500">Arrastra imágenes o haz click para seleccionar</p>
            <p class="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP — máx 4MB cada una</p>
          </div>
          <div v-else class="p-3 grid grid-cols-4 gap-2 pointer-events-none">
            <div
              v-for="(img, idx) in images"
              :key="idx"
              class="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white"
            >
              <img :src="img.dataUrl" class="w-full h-full object-cover" />
              <button
                type="button"
                class="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
                @click.stop="removeImage(idx)"
              >
                <i class="fas fa-xmark"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <button
        @click="generate"
        :disabled="!canGenerate || loading"
        :class="[
          'w-full py-3.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg',
          canGenerate && !loading
            ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white hover:shadow-violet-500/30 active:scale-[0.99]'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed',
        ]"
      >
        <template v-if="loading">
          <i class="fas fa-circle-notch fa-spin"></i>
          <span>Analizando con Gemini...</span>
        </template>
        <template v-else>
          <i class="fas fa-wand-magic-sparkles"></i>
          <span>Generar propuesta con IA</span>
        </template>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { prospectService } from '@/services/prospectService'
import { useNotifications } from '@/composables/useNotifications'

const emit = defineEmits<{
  created: [prospectId: string]
}>()

const { showError } = useNotifications()

type Mode = 'simple' | 'architect'

const mode = ref<Mode>('simple')
const company = ref('')
const contactName = ref('')
const inputText = ref('')
const conceptMap = ref('')
const techNotes = ref('')
const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

interface ImageItem {
  mimeType: string
  data: string // base64 sin prefijo
  dataUrl: string // con prefijo para preview
}
const images = ref<ImageItem[]>([])

const canGenerate = computed(() => inputText.value.trim().length >= 15)

// ────── Speech Recognition (Web Speech API) ──────
const SpeechRecognitionImpl =
  (typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null
const speechSupported = !!SpeechRecognitionImpl
const isRecording = ref(false)
let recognition: any = null
let recordingBaseline = ''

const startRecording = () => {
  if (!SpeechRecognitionImpl) return
  recognition = new SpeechRecognitionImpl()
  recognition.lang = 'es-CO'
  recognition.continuous = true
  recognition.interimResults = true
  recordingBaseline = inputText.value ? inputText.value.trimEnd() + ' ' : ''
  let finalTranscript = ''

  recognition.onresult = (event: any) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) finalTranscript += transcript + ' '
      else interim += transcript
    }
    inputText.value = (recordingBaseline + finalTranscript + interim).trimStart()
  }

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error)
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      showError('Permiso de micrófono denegado')
    }
    isRecording.value = false
  }

  recognition.onend = () => {
    isRecording.value = false
  }

  try {
    recognition.start()
    isRecording.value = true
  } catch (e) {
    console.warn('No se pudo iniciar grabación', e)
    isRecording.value = false
  }
}

const stopRecording = () => {
  if (recognition) {
    try {
      recognition.stop()
    } catch (e) {
      /* ignore */
    }
  }
  isRecording.value = false
}

const toggleRecording = () => {
  if (isRecording.value) stopRecording()
  else startRecording()
}

onBeforeUnmount(() => {
  stopRecording()
})

const onFilesSelected = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files) return
  addImages(Array.from(target.files))
  target.value = ''
}

const onDrop = (e: DragEvent) => {
  if (!e.dataTransfer?.files) return
  addImages(Array.from(e.dataTransfer.files))
}

const addImages = (files: File[]) => {
  files
    .filter((f) => f.type.startsWith('image/'))
    .filter((f) => f.size <= 4 * 1024 * 1024)
    .slice(0, 6 - images.value.length)
    .forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        const data = dataUrl.split(',')[1]
        images.value.push({ mimeType: file.type, data, dataUrl })
      }
      reader.readAsDataURL(file)
    })
}

const removeImage = (idx: number) => {
  images.value.splice(idx, 1)
}

// Sanitiza el input para evitar prompt injection grosero
const sanitize = (text: string) =>
  text
    .replace(/```/g, "'''")
    .replace(/<\/?(system|user|assistant|prompt)>/gi, '')
    .trim()

const buildPrompt = () => {
  const userBrief = sanitize(inputText.value)
  const userCompany = sanitize(company.value || '(empresa no especificada)')
  const userContact = sanitize(contactName.value || '(no especificado)')

  if (mode.value === 'simple') {
    return `Eres un consultor comercial senior de GEMS, una empresa de soluciones tecnológicas
(telefonía IP, agentes de IA, CRM, automatización de WhatsApp, integraciones API).

Genera una propuesta comercial breve y persuasiva en formato Markdown para este prospecto.

EMPRESA: ${userCompany}
CONTACTO: ${userContact}
DIAGNÓSTICO:
"""
${userBrief}
"""

ESTRUCTURA REQUERIDA:
1. **Resumen ejecutivo** (3 líneas, qué problema resolvemos)
2. **Dolor identificado** (lo que están sufriendo en sus palabras)
3. **Solución propuesta** (qué servicios de GEMS aplican)
4. **Beneficios clave** (3 bullets, ROI tangible)
5. **Próximos pasos** (CTA claro)

Tono: profesional, directo, en español neutral. Sin alucinar datos. Si falta info, márcala como "(a confirmar con cliente)".
Si las imágenes adjuntas muestran capturas, dashboards o diagramas, úsalas como contexto adicional.`
  }

  return `Eres un arquitecto de soluciones de GEMS (telefonía IP/Asterisk, agentes de IA voz+texto,
CRM, automatización de WhatsApp con InConcert/Cloud API, webhooks, dashboards realtime, consultoría técnica).

Genera una propuesta TÉCNICA-COMERCIAL detallada en Markdown.

EMPRESA: ${userCompany}
CONTACTO: ${userContact}

DIAGNÓSTICO DEL CLIENTE:
"""
${userBrief}
"""

${conceptMap.value ? `MAPA CONCEPTUAL PROPUESTO:\n"""\n${sanitize(conceptMap.value)}\n"""\n` : ''}
${techNotes.value ? `NOTAS TÉCNICAS:\n"""\n${sanitize(techNotes.value)}\n"""\n` : ''}

ESTRUCTURA REQUERIDA:
## 1. Diagnóstico
3 retos críticos detectados, ordenados por impacto.

## 2. Arquitectura propuesta
Componentes, integraciones (APIs, webhooks, BD), flujo de datos. Sé concreto.

## 3. Servicios GEMS aplicables
Tabla con: Servicio | Por qué | Esfuerzo estimado.

## 4. Plan de implementación
Fases con entregables y duración aproximada.

## 5. Pitch comercial
Cierre vendedor en 4-5 líneas con propuesta de valor única.

Tono: técnico pero comercial. Sin alucinar precios. Si las imágenes muestran arquitecturas, intégralas en el análisis.`
}

const generateName = async (proposalText: string): Promise<string> => {
  try {
    const namePrompt = `A partir de esta propuesta comercial, genera un nombre corto y memorable
en formato "Prospecto [Adjetivo] [Sector/Vertical]" (máx 4 palabras, sin comillas).

Propuesta:
"""
${proposalText.slice(0, 600)}
"""

Responde SOLO con el nombre, nada más.`
    const result = await prospectService.generateWithGemini({ prompt: namePrompt })
    return result.replace(/["\n]/g, '').trim().slice(0, 60) || 'Prospecto sin nombre'
  } catch {
    return company.value.trim() || 'Prospecto sin nombre'
  }
}

const generate = async () => {
  if (!canGenerate.value || loading.value) return
  loading.value = true
  try {
    const proposal = await prospectService.generateWithGemini({
      prompt: buildPrompt(),
      images: images.value.map((i) => ({ mimeType: i.mimeType, data: i.data })),
    })

    const name = await generateName(proposal)

    const created = await prospectService.create({
      prospectName: name,
      company: company.value.trim() || undefined,
      initialMessage: `**Diagnóstico inicial:**\n${inputText.value}\n\n---\n\n${proposal}`,
    })

    if (contactName.value.trim()) {
      prospectService.setMetadata(created._id, { contactName: contactName.value.trim() })
    }

    // Reset form
    company.value = ''
    contactName.value = ''
    inputText.value = ''
    conceptMap.value = ''
    techNotes.value = ''
    images.value = []

    emit('created', created._id)
  } catch (err: any) {
    showError(err?.message || 'No se pudo generar la propuesta')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
