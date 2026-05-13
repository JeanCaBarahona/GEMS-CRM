<template>
  <div class="p-5 space-y-4">
    <!-- TL;DR Card -->
    <div class="bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shadow-sm">
            <i class="fas fa-wand-magic-sparkles text-[10px]"></i>
          </div>
          <h3 class="text-xs font-black text-slate-900">TL;DR del prospect</h3>
        </div>
        <button
          @click="generateSummary"
          :disabled="loadingSummary"
          class="text-[10px] font-black text-violet-600 hover:text-violet-800 disabled:opacity-50 flex items-center gap-1"
        >
          <i :class="['fas text-[9px]', loadingSummary ? 'fa-circle-notch fa-spin' : summary ? 'fa-arrows-rotate' : 'fa-bolt']"></i>
          {{ loadingSummary ? 'Generando...' : summary ? 'Regenerar' : 'Generar' }}
        </button>
      </div>
      <div v-if="summary" class="prose-md text-xs font-medium text-slate-700 leading-relaxed" v-html="renderMd(summary)"></div>
      <p v-else-if="!loadingSummary" class="text-[11px] text-slate-500 font-medium">
        Pulsa "Generar" para que la IA resuma este prospect en 3 bullets accionables.
      </p>
    </div>

    <!-- Next Best Action Card -->
    <div class="bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-100 rounded-2xl p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-white flex items-center justify-center shadow-sm">
            <i class="fas fa-brain text-[10px]"></i>
          </div>
          <h3 class="text-xs font-black text-slate-900">Next Best Action</h3>
        </div>
        <button
          @click="generateAction"
          :disabled="loadingAction"
          class="text-[10px] font-black text-emerald-600 hover:text-emerald-800 disabled:opacity-50 flex items-center gap-1"
        >
          <i :class="['fas text-[9px]', loadingAction ? 'fa-circle-notch fa-spin' : action ? 'fa-arrows-rotate' : 'fa-bolt']"></i>
          {{ loadingAction ? 'Pensando...' : action ? 'Regenerar' : 'Sugerir' }}
        </button>
      </div>
      <div v-if="action" class="prose-md text-xs font-medium text-slate-700 leading-relaxed" v-html="renderMd(action)"></div>
      <p v-else-if="!loadingAction" class="text-[11px] text-slate-500 font-medium">
        Pulsa "Sugerir" para que la IA recomiende qué hacer hoy con este prospect.
      </p>
    </div>

    <!-- Quick stats -->
    <div class="grid grid-cols-3 gap-2">
      <div class="bg-white border border-slate-200 rounded-xl p-3 text-center">
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Status</p>
        <p class="text-xs font-black text-slate-800 capitalize">{{ prospect.status || 'nuevo' }}</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-3 text-center">
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Mensajes</p>
        <p class="text-xs font-black text-slate-800">{{ prospect.messages?.length || 0 }}</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-3 text-center">
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Tareas</p>
        <p class="text-xs font-black text-slate-800">
          {{ tasks.filter((t) => !t.done).length }}/{{ tasks.length }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { prospectService } from '@/services/prospectService'
import type { Prospect, ProspectTask } from '@/types/prospect'
import { useNotifications } from '@/composables/useNotifications'

interface Props {
  prospect: Prospect
  tasks: ProspectTask[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  generated: []
}>()

const { showError } = useNotifications()

const summary = ref('')
const action = ref('')
const loadingSummary = ref(false)
const loadingAction = ref(false)

marked.setOptions({ breaks: true, gfm: true })

const renderMd = (text: string) => DOMPurify.sanitize(marked.parse(text) as string)

const generateSummary = async () => {
  loadingSummary.value = true
  try {
    summary.value = await prospectService.summarize(props.prospect)
    emit('generated')
  } catch (err: any) {
    showError(err?.message || 'No se pudo generar el resumen')
  } finally {
    loadingSummary.value = false
  }
}

const generateAction = async () => {
  loadingAction.value = true
  try {
    action.value = await prospectService.nextBestAction(props.prospect, props.tasks)
    emit('generated')
  } catch (err: any) {
    showError(err?.message || 'No se pudo generar la acción')
  } finally {
    loadingAction.value = false
  }
}
</script>

<style scoped>
.prose-md :deep(p) { margin: 0.3rem 0; }
.prose-md :deep(strong) { font-weight: 800; color: #0f172a; }
.prose-md :deep(ul) { padding-left: 1.25rem; margin: 0.3rem 0; }
.prose-md :deep(li) { margin: 0.15rem 0; }
</style>
