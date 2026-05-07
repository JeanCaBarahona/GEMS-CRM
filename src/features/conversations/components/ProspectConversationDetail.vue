
<template>
  <div class="flex flex-col h-full relative items-center justify-center pt-2">
    <!-- Fondo dinámico futurista pero en modo claro -->
    <div class="absolute inset-0 z-0 pointer-events-none" style="background: radial-gradient(ellipse at 60% 40%, rgba(139, 92, 246, 0.05) 0%, rgba(236, 72, 153, 0.05) 60%, rgba(255, 255, 255, 1) 100%); filter: blur(40px);"></div>
    <div class="font-black text-lg text-slate-800 mb-4 z-10 flex items-center gap-2 border-b border-slate-100 pb-2 w-full max-w-[600px]">
      <i class="fas fa-comments text-primary-500"></i>
      Conversación con {{ conversation.prospectName }}
    </div>
    <div class="flex-1 rounded-2xl p-5 overflow-y-auto flex flex-col gap-3 z-10 prospect-chat-area bg-slate-50 border border-slate-200 shadow-sm" style="max-width: 600px; min-width: 320px; width: 100%;">
      <template v-for="(msg, idx) in conversation.messages" :key="idx">
        <div class="w-full flex mb-2" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
          <div :class="msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-bl-none'"
            class="max-w-[75%] px-5 py-4 rounded-2xl text-sm font-medium whitespace-pre-line relative flex flex-col animate-fade-in prospect-chat-bubble leading-relaxed">
            <span v-if="msg.role === 'user'" class="font-bold flex items-center mb-1 drop-shadow-sm">
              <i class="fas fa-user-circle mr-1.5 opacity-80"></i> Tú
            </span>
            <span v-else class="font-black text-primary-600 flex items-center mb-1">
              <i class="fas fa-robot mr-1.5 opacity-80"></i> IA
            </span>
            <span class="block w-full whitespace-pre-line" v-html="formatMessage(msg)"></span>
            <span class="block text-[10px] font-bold mt-2 text-right" :class="msg.role === 'user' ? 'text-primary-200' : 'text-slate-400 uppercase tracking-wider'">{{ formatDate(msg.timestamp) }}</span>
          </div>
        </div>
        <!-- Separador visual entre mensajes de usuario y IA -->
        <div v-if="idx < conversation.messages.length - 1 && msg.role !== conversation.messages[idx + 1].role" class="w-full flex justify-center py-2">
          <div class="h-px w-24 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        </div>
      </template>
    </div>
    <div class="flex gap-3 mt-5 z-10 w-full max-w-[600px]">
      <input
        type="text"
        v-model="input"
        @keyup.enter="sendMessage"
        class="flex-1 bg-white text-slate-800 rounded-xl px-4 py-3 border border-slate-200 shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all text-sm font-medium"
        placeholder="Escribe un mensaje o agrega contexto..."
        :disabled="sending"
      />
      <button
        class="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors duration-150 disabled:opacity-50 shadow-sm flex items-center gap-2"
        @click="sendMessage"
        :disabled="sending"
      >
        <i v-if="sending" class="fas fa-circle-notch fa-spin"></i>
        <i v-else class="fas fa-paper-plane"></i>
        <span class="hidden sm:inline">Enviar</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
function formatMessage(msg) {
  if (msg.role === 'assistant') {
    // Separar sugerencias, diagnóstico y mensaje para WhatsApp si existen
    let content = msg.content
    content = content.replace(/(Diagnóstico de falencias y oportunidades:)/g, '<b>$1</b>')
    content = content.replace(/(Estrategias para abordarlo:)/g, '<b>$1</b>')
    content = content.replace(/(Un mensaje para WhatsApp:)/g, '<b>$1</b>')
    content = content.replace(/(Sugerencias de servicios de anuncios, redes sociales y automatización:)/g, '<b>$1</b>')
    content = content.replace(/(Ejemplos de casos de éxito similares:)/g, '<b>$1</b>')
    return content
  }
  return msg.content
}
import { ref } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
const { showError } = useNotifications()
const props = defineProps({
  conversation: Object
})
const emit = defineEmits(['message-sent'])
const input = ref('')
const sending = ref(false)
function formatDate(ts: string | number) {
  const d = new Date(ts)
  return d.toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
}
async function sendMessage() {
  if (!input.value.trim()) return
  sending.value = true
  try {
    const res = await fetch(`/api/prospects/${props.conversation._id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'user', content: input.value })
    })
    const data = await res.json()
    emit('message-sent', data.messages[data.messages.length - 1])
    input.value = ''
  } catch (e) {
    showError('Error enviando mensaje')
  }
  sending.value = false
}
</script>

<style scoped>
  .prospect-chat-area {
    margin: 0 auto;
  }
  @media (max-width: 700px) {
    .prospect-chat-area {
      max-width: 98vw;
      min-width: 0;
      padding: 1rem;
    }
  }
  .animate-fade-in {
    animation: fadeIn 0.4s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .prospect-chat-bubble {
    word-break: break-word;
  }
</style>
