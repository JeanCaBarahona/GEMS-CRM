<template>
  <div class="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30"
          >
            {{ initials }}
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="text-sm font-black text-slate-900 truncate">{{ prospect.prospectName }}</h2>
            <p v-if="prospect.company" class="text-xs font-bold text-slate-500 truncate mt-0.5">
              <i class="fas fa-building text-[10px] mr-1 opacity-60"></i>{{ prospect.company }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            @click="$emit('delete', prospect)"
            class="w-8 h-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors flex items-center justify-center"
            title="Eliminar prospecto"
          >
            <i class="fas fa-trash text-xs"></i>
          </button>
        </div>
      </div>

      <!-- Status Selector -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">Estado:</span>
        <button
          v-for="status in PROSPECT_STATUSES"
          :key="status.value"
          @click="updateStatus(status.value)"
          :class="[
            'px-2 py-0.5 rounded-md text-[9px] font-black border transition-all flex items-center gap-1',
            (prospect.status ?? 'nuevo') === status.value
              ? status.color + ' ring-1 ring-offset-1 ' + ringColor(status.value)
              : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50',
          ]"
        >
          <i :class="['fas', status.icon, 'text-[8px]']"></i>
          {{ status.label }}
        </button>
      </div>
    </div>

    <!-- Quick Info -->
    <div class="px-5 py-3 border-b border-slate-100 grid grid-cols-3 gap-3 bg-slate-50/50">
      <div>
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Contacto</p>
        <p class="text-[11px] font-bold text-slate-700 truncate">
          {{ prospect.contactName || '—' }}
        </p>
      </div>
      <div>
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Mensajes</p>
        <p class="text-[11px] font-bold text-slate-700">{{ prospect.messages?.length || 0 }}</p>
      </div>
      <div>
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Última actividad</p>
        <p class="text-[11px] font-bold text-slate-700 truncate">{{ lastActivity }}</p>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="px-5 py-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto custom-scrollbar bg-white">
      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap mr-1">Atacar:</span>
      <button
        @click="openOutreach('email')"
        class="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg text-[10px] font-black flex items-center gap-1.5 whitespace-nowrap transition-all"
      >
        <i class="fas fa-envelope text-[10px]"></i>
        Email
      </button>
      <button
        @click="openOutreach('whatsapp')"
        class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black flex items-center gap-1.5 whitespace-nowrap transition-all"
      >
        <i class="fab fa-whatsapp text-[12px]"></i>
        WhatsApp
      </button>
      <button
        @click="openOutreach('call')"
        class="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg text-[10px] font-black flex items-center gap-1.5 whitespace-nowrap transition-all"
      >
        <i class="fas fa-phone text-[10px]"></i>
        Script llamada
      </button>
      <div class="w-px h-5 bg-slate-200 mx-1"></div>
      <button
        @click="convertToClient"
        :disabled="converting"
        class="px-3 py-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border border-emerald-600 rounded-lg text-[10px] font-black flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm disabled:opacity-60"
      >
        <i :class="['fas', converting ? 'fa-circle-notch fa-spin' : 'fa-trophy', 'text-[10px]']"></i>
        {{ prospect.status === 'ganado' ? 'Convertir a cliente' : 'Cerrar como ganado' }}
      </button>
    </div>

    <ProspectOutreachModal
      v-if="outreachOpen"
      :is-open="outreachOpen"
      :prospect="prospect"
      :channel="outreachChannel"
      @close="outreachOpen = false"
      @updated="onOutreachUpdated"
    />

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 bg-slate-50/30">
      <div v-if="!prospect.messages?.length" class="text-center py-12">
        <i class="fas fa-comments text-3xl text-slate-200 mb-2 block"></i>
        <p class="text-xs font-bold text-slate-400">Sin mensajes aún</p>
      </div>

      <div
        v-for="(msg, idx) in prospect.messages"
        :key="idx"
        :class="['flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start']"
      >
        <div
          v-if="msg.role === 'assistant'"
          class="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-500/20"
        >
          <i class="fas fa-wand-magic-sparkles text-[11px]"></i>
        </div>

        <div
          :class="[
            'max-w-[85%] rounded-2xl px-4 py-3 shadow-sm',
            msg.role === 'user'
              ? 'bg-violet-600 text-white rounded-br-md'
              : 'bg-white text-slate-800 border border-slate-100 rounded-bl-md',
          ]"
        >
          <div
            v-if="msg.role === 'assistant'"
            class="prose-msg text-[12.5px] leading-relaxed"
            v-html="renderMarkdown(msg.content)"
          ></div>
          <p v-else class="text-[12.5px] leading-relaxed whitespace-pre-wrap font-medium">{{ msg.content }}</p>

          <div class="flex items-center justify-between gap-3 mt-2 pt-2 border-t" :class="msg.role === 'user' ? 'border-violet-500/30' : 'border-slate-100'">
            <span :class="['text-[9px] font-bold', msg.role === 'user' ? 'text-violet-200' : 'text-slate-400']">
              {{ formatTime(msg.timestamp) }}
            </span>
            <button
              v-if="msg.role === 'assistant'"
              @click="copyMessage(msg.content)"
              class="text-[9px] font-bold text-slate-400 hover:text-violet-600 transition-colors flex items-center gap-1"
              title="Copiar contenido"
            >
              <i class="fas fa-copy"></i>
              Copiar
            </button>
          </div>
        </div>

        <div
          v-if="msg.role === 'user'"
          class="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0"
        >
          <i class="fas fa-user text-[11px]"></i>
        </div>
      </div>

      <!-- AI thinking indicator -->
      <div v-if="aiThinking" class="flex gap-3 justify-start">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center flex-shrink-0">
          <i class="fas fa-wand-magic-sparkles text-[11px]"></i>
        </div>
        <div class="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
          <div class="flex gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style="animation-delay: 300ms"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="px-4 py-3 border-t border-slate-100 bg-white">
      <div class="flex items-end gap-2">
        <div class="flex-1 relative">
          <textarea
            v-model="newMessage"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.shift.enter.exact="newMessage += '\n'"
            rows="1"
            placeholder="Pregúntale a la IA o escribe una nota interna..."
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all resize-none max-h-32"
            :disabled="aiThinking"
          ></textarea>
        </div>
        <button
          @click="askAI"
          :disabled="!newMessage.trim() || aiThinking"
          class="px-3.5 py-2.5 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-xl text-[10px] font-black shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
          title="Pedir respuesta a Gemini"
        >
          <i class="fas fa-wand-magic-sparkles text-[10px]"></i>
          IA
        </button>
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim() || aiThinking"
          class="w-10 h-10 bg-slate-900 text-white rounded-xl shadow hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
          title="Guardar nota (Enter)"
        >
          <i class="fas fa-paper-plane text-[11px]"></i>
        </button>
      </div>
      <p class="text-[9px] text-slate-400 mt-1.5 px-1 font-medium">
        <kbd class="px-1 py-0.5 bg-slate-100 rounded text-[8px] font-mono">Enter</kbd> nota interna ·
        <kbd class="px-1 py-0.5 bg-slate-100 rounded text-[8px] font-mono">IA</kbd> respuesta de Gemini ·
        <kbd class="px-1 py-0.5 bg-slate-100 rounded text-[8px] font-mono">Shift+Enter</kbd> salto de línea
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { prospectService } from '@/services/prospectService'
import { clientService } from '@/services/clientService'
import type { Prospect, ProspectStatus } from '@/types/prospect'
import { PROSPECT_STATUSES } from '@/types/prospect'
import { useNotifications } from '@/composables/useNotifications'
import type { OutreachChannel } from '@/services/prospectOutreach'
import ProspectOutreachModal from './ProspectOutreachModal.vue'

interface Props {
  prospect: Prospect
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [prospect: Prospect]
  delete: [prospect: Prospect]
}>()

const { showSuccess, showError, confirmDelete } = useNotifications()
const router = useRouter()

const newMessage = ref('')
const aiThinking = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const outreachOpen = ref(false)
const outreachChannel = ref<OutreachChannel>('email')
const converting = ref(false)

marked.setOptions({ breaks: true, gfm: true })

const renderMarkdown = (text: string) => {
  if (!text) return ''
  const html = marked.parse(text) as string
  return DOMPurify.sanitize(html)
}

const initials = computed(() => {
  const source = props.prospect.company || props.prospect.prospectName || '?'
  return (
    source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() || '')
      .join('') || '?'
  )
})

const lastActivity = computed(() => {
  const date = props.prospect.lastUpdated || props.prospect.createdAt
  if (!date) return '—'
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
  } catch {
    return '—'
  }
})

const formatTime = (ts?: string | number) => {
  if (!ts) return ''
  try {
    return format(new Date(ts), "d MMM, HH:mm", { locale: es })
  } catch {
    return ''
  }
}

const ringColor = (s: ProspectStatus) => {
  const map: Record<ProspectStatus, string> = {
    nuevo: 'ring-blue-300',
    calificado: 'ring-amber-300',
    propuesta: 'ring-violet-300',
    seguimiento: 'ring-cyan-300',
    ganado: 'ring-emerald-300',
    perdido: 'ring-rose-300',
  }
  return map[s]
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(
  () => props.prospect._id,
  () => scrollToBottom(),
  { immediate: true }
)

watch(
  () => props.prospect.messages?.length,
  () => scrollToBottom()
)

const updateStatus = (status: ProspectStatus) => {
  prospectService.setStatus(props.prospect._id, status)
  emit('updated', { ...props.prospect, status })
  showSuccess(`Estado: ${PROSPECT_STATUSES.find((s) => s.value === status)?.label}`)
}

const sendMessage = async () => {
  const content = newMessage.value.trim()
  if (!content || aiThinking.value) return
  try {
    const updated = await prospectService.sendMessage(props.prospect._id, {
      role: 'user',
      content,
    })
    newMessage.value = ''
    emit('updated', updated)
  } catch (err: any) {
    showError(err?.message || 'No se pudo guardar el mensaje')
  }
}

const askAI = async () => {
  const userQuestion = newMessage.value.trim()
  if (!userQuestion || aiThinking.value) return

  aiThinking.value = true
  try {
    // Primero guarda la pregunta del usuario
    await prospectService.sendMessage(props.prospect._id, {
      role: 'user',
      content: userQuestion,
    })
    newMessage.value = ''

    // Construye contexto con los últimos mensajes
    const history = (props.prospect.messages || [])
      .slice(-8)
      .map((m) => `${m.role === 'user' ? 'Asesor' : 'IA'}: ${m.content}`)
      .join('\n\n')

    const prompt = `Eres el asistente comercial de GEMS. Estás ayudando a un asesor a cerrar a este prospecto.

PROSPECTO: ${props.prospect.prospectName}
EMPRESA: ${props.prospect.company || '(no especificada)'}

HISTORIAL RECIENTE:
${history}

NUEVA PREGUNTA DEL ASESOR:
"${userQuestion}"

Responde en Markdown, en español, breve y accionable. Si te piden recomendar pasos siguientes, da máximo 3.`

    const aiResponse = await prospectService.generateWithGemini({ prompt })
    const updated = await prospectService.sendMessage(props.prospect._id, {
      role: 'assistant',
      content: aiResponse,
    })
    emit('updated', updated)
  } catch (err: any) {
    showError(err?.message || 'No se pudo generar respuesta')
  } finally {
    aiThinking.value = false
  }
}

const copyMessage = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    showSuccess('Copiado al portapapeles')
  } catch {
    showError('No se pudo copiar')
  }
}

const openOutreach = (channel: OutreachChannel) => {
  outreachChannel.value = channel
  outreachOpen.value = true
}

const onOutreachUpdated = (updated: Prospect) => {
  emit('updated', updated)
}

const convertToClient = async () => {
  if (converting.value) return
  const result = await confirmDelete(
    `¿Convertir "${props.prospect.prospectName}" en cliente activo? El prospecto quedará marcado como "Ganado".`
  )
  if (!result.isConfirmed) return

  converting.value = true
  try {
    const fallbackEmail = `${props.prospect._id}@prospecto-pendiente.local`
    const created = await clientService.create({
      name: props.prospect.contactName?.trim() || props.prospect.prospectName,
      email: props.prospect.contactEmail?.trim() || fallbackEmail,
      phone: props.prospect.contactPhone?.trim() || '',
      company: props.prospect.company?.trim() || '',
      status: 'active',
      address: '',
    } as any)

    prospectService.setStatus(props.prospect._id, 'ganado')
    const updated = { ...props.prospect, status: 'ganado' as ProspectStatus }
    emit('updated', updated)

    // Registra la conversión en el historial del prospect
    await prospectService.sendMessage(props.prospect._id, {
      role: 'user',
      content: `🏆 **Convertido a cliente** — Ficha creada en /clients/${(created as any)._id}`,
    })

    showSuccess('Cliente creado correctamente')
    if ((created as any)._id) {
      router.push(`/clients/${(created as any)._id}`)
    }
  } catch (err: any) {
    showError(err?.message || 'No se pudo convertir a cliente')
  } finally {
    converting.value = false
  }
}
</script>

<style scoped>
.prose-msg :deep(h1),
.prose-msg :deep(h2),
.prose-msg :deep(h3) {
  font-weight: 800;
  margin: 0.75rem 0 0.4rem;
  color: #0f172a;
  line-height: 1.25;
}
.prose-msg :deep(h1) {
  font-size: 1.05rem;
}
.prose-msg :deep(h2) {
  font-size: 0.95rem;
}
.prose-msg :deep(h3) {
  font-size: 0.85rem;
}
.prose-msg :deep(p) {
  margin: 0.4rem 0;
}
.prose-msg :deep(strong) {
  font-weight: 800;
  color: #0f172a;
}
.prose-msg :deep(ul),
.prose-msg :deep(ol) {
  padding-left: 1.25rem;
  margin: 0.4rem 0;
}
.prose-msg :deep(li) {
  margin: 0.15rem 0;
}
.prose-msg :deep(code) {
  background: #f1f5f9;
  color: #be123c;
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  font-size: 0.85em;
  font-family: 'JetBrains Mono', monospace;
}
.prose-msg :deep(pre) {
  background: #0f172a;
  color: #e2e8f0;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
  overflow-x: auto;
  font-size: 11px;
  line-height: 1.5;
}
.prose-msg :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}
.prose-msg :deep(table) {
  border-collapse: collapse;
  margin: 0.5rem 0;
  width: 100%;
  font-size: 11px;
}
.prose-msg :deep(td),
.prose-msg :deep(th) {
  border: 1px solid #e2e8f0;
  padding: 0.4rem 0.5rem;
  text-align: left;
}
.prose-msg :deep(th) {
  background: #f8fafc;
  font-weight: 700;
}
.prose-msg :deep(blockquote) {
  border-left: 3px solid #a78bfa;
  padding-left: 0.75rem;
  margin: 0.5rem 0;
  color: #64748b;
  font-style: italic;
}
.prose-msg :deep(hr) {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 0.75rem 0;
}
</style>
