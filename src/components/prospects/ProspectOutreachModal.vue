<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg', headerColor]">
            <i :class="['fas', headerIcon, 'text-sm']"></i>
          </div>
          <div>
            <h2 class="text-base font-black text-slate-900">{{ headerTitle }}</h2>
            <p class="text-xs text-slate-500 font-medium">Para {{ prospect.prospectName }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center justify-center">
          <i class="fas fa-xmark"></i>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex-1 flex items-center justify-center p-12">
        <div class="text-center">
          <i class="fas fa-circle-notch fa-spin text-3xl text-violet-400 mb-3 block"></i>
          <p class="text-xs font-bold text-slate-500">Generando con Gemini...</p>
        </div>
      </div>

      <!-- Result -->
      <div v-else-if="result" class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
        <!-- Subject (only email) -->
        <div v-if="channel === 'email' && result.subject">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Asunto</label>
          <input
            v-model="result.subject"
            type="text"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all"
          />
        </div>

        <!-- Body -->
        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
            {{ channel === 'call' ? 'Script' : 'Mensaje' }}
          </label>
          <textarea
            v-model="result.body"
            :rows="channel === 'call' ? 14 : 8"
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 leading-relaxed focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all resize-y font-mono"
          ></textarea>
        </div>

        <!-- Contact destination -->
        <div v-if="channel !== 'call'" class="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
            {{ channel === 'email' ? 'Email del contacto' : 'WhatsApp del contacto' }}
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model="contactInput"
              :type="channel === 'email' ? 'email' : 'tel'"
              :placeholder="channel === 'email' ? 'cliente@empresa.com' : '+57 300 123 4567'"
              class="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all"
            />
            <span v-if="contactInput && saved" class="text-[9px] font-black text-emerald-600">
              <i class="fas fa-check-circle mr-1"></i>Guardado
            </span>
          </div>
          <p class="text-[10px] text-slate-400 font-medium mt-1.5">
            Se guarda en este prospecto al enviar
          </p>
        </div>
      </div>

      <!-- Footer Actions -->
      <div v-if="result && !loading" class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
        <button
          @click="copyToClipboard"
          class="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2"
        >
          <i :class="['fas', copied ? 'fa-check' : 'fa-copy', 'text-[11px]']"></i>
          {{ copied ? 'Copiado' : 'Copiar' }}
        </button>
        <button
          v-if="channel !== 'call'"
          @click="saveToHistory"
          class="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2"
        >
          <i class="fas fa-floppy-disk text-[11px]"></i>
          Guardar en historial
        </button>
        <div class="flex-1"></div>
        <button
          v-if="channel === 'whatsapp'"
          @click="openWhatsApp"
          :disabled="!contactInput.trim()"
          class="px-5 py-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <i class="fab fa-whatsapp text-sm"></i>
          Abrir WhatsApp
        </button>
        <button
          v-if="channel === 'email'"
          @click="openMail"
          :disabled="!contactInput.trim()"
          class="px-5 py-2.5 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-xs font-black rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <i class="fas fa-paper-plane text-[11px]"></i>
          Abrir cliente de email
        </button>
        <button
          @click="regenerate"
          class="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 text-xs font-black rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2"
          title="Regenerar"
        >
          <i class="fas fa-arrows-rotate text-[11px]"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Prospect } from '@/types/prospect'
import { outreachService, type OutreachChannel, type OutreachResult } from '@/services/prospectOutreach'
import { prospectService } from '@/services/prospectService'
import { useNotifications } from '@/composables/useNotifications'

interface Props {
  isOpen: boolean
  prospect: Prospect
  channel: OutreachChannel
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updated: [prospect: Prospect]
}>()

const { showError, showSuccess } = useNotifications()

const loading = ref(false)
const result = ref<OutreachResult | null>(null)
const copied = ref(false)
const saved = ref(false)
const contactInput = ref('')

const headerConfig = computed(() => {
  if (props.channel === 'email') {
    return { title: 'Email de prospección', icon: 'fa-envelope', color: 'bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-violet-500/30' }
  }
  if (props.channel === 'whatsapp') {
    return { title: 'Mensaje de WhatsApp', icon: 'fa-comment-dots', color: 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30' }
  }
  return { title: 'Script de llamada', icon: 'fa-phone', color: 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-cyan-500/30' }
})

const headerTitle = computed(() => headerConfig.value.title)
const headerIcon = computed(() => headerConfig.value.icon)
const headerColor = computed(() => headerConfig.value.color)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      result.value = null
      copied.value = false
      saved.value = false
      contactInput.value = props.channel === 'email'
        ? props.prospect.contactEmail || ''
        : props.prospect.contactPhone || ''
      generate()
    }
  }
)

const generate = async () => {
  loading.value = true
  try {
    result.value = await outreachService.generate(props.prospect, props.channel)
  } catch (err: any) {
    showError(err?.message || 'No se pudo generar')
    emit('close')
  } finally {
    loading.value = false
  }
}

const regenerate = () => {
  result.value = null
  generate()
}

const copyToClipboard = async () => {
  if (!result.value) return
  let text = result.value.body
  if (result.value.subject) text = `Asunto: ${result.value.subject}\n\n${text}`
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    showError('No se pudo copiar')
  }
}

const persistContact = () => {
  if (!contactInput.value.trim()) return
  if (props.channel === 'email') {
    prospectService.setMetadata(props.prospect._id, { contactEmail: contactInput.value.trim() })
  } else if (props.channel === 'whatsapp') {
    prospectService.setMetadata(props.prospect._id, { contactPhone: contactInput.value.trim() })
  }
  saved.value = true
  setTimeout(() => (saved.value = false), 1500)
}

const saveToHistory = async () => {
  if (!result.value) return
  try {
    const note =
      props.channel === 'email'
        ? `📧 **Email enviado**\n**Asunto:** ${result.value.subject}\n\n${result.value.body}`
        : `💬 **WhatsApp enviado**\n${result.value.body}`
    const updated = await prospectService.sendMessage(props.prospect._id, { role: 'user', content: note })
    persistContact()
    emit('updated', updated)
    showSuccess('Guardado en el historial')
  } catch (err: any) {
    showError(err?.message || 'No se pudo guardar')
  }
}

const openWhatsApp = () => {
  if (!result.value || !contactInput.value.trim()) return
  const link = outreachService.buildWhatsAppLink(contactInput.value, result.value.body)
  window.open(link, '_blank', 'noopener,noreferrer')
  persistContact()
  saveToHistory()
}

const openMail = () => {
  if (!result.value || !contactInput.value.trim()) return
  const link = outreachService.buildMailtoLink(contactInput.value, result.value.subject || '', result.value.body)
  window.location.href = link
  persistContact()
  saveToHistory()
}
</script>
