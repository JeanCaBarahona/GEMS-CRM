<template>
  <div class="grid grid-cols-12 gap-3 h-full">
    <!-- Main pane -->
    <div class="col-span-12 lg:col-span-9 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden min-h-0">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
              {{ initials }}
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="text-sm font-black text-slate-900 truncate">{{ prospect.prospectName }}</h2>
              <p v-if="prospect.company" class="text-xs font-bold text-slate-500 truncate mt-0.5">
                <i class="fas fa-building text-[10px] mr-1 opacity-60"></i>{{ prospect.company }}
              </p>
            </div>
          </div>
          <button
            @click="$emit('delete', prospect)"
            class="w-8 h-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors flex items-center justify-center"
            title="Eliminar prospecto"
          >
            <i class="fas fa-trash text-xs"></i>
          </button>
        </div>

        <!-- Pipeline Progress -->
        <div class="mb-2">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pipeline</span>
            <span class="text-[10px] font-black text-slate-600">{{ currentProb }}% probabilidad</span>
          </div>
          <div class="flex gap-1">
            <button
              v-for="(stage, i) in pipelineStages"
              :key="stage.value"
              @click="updateStatus(stage.value)"
              :class="[
                'flex-1 h-2 rounded-full transition-all relative group',
                isStageActive(stage.value, i) ? activeColorFor(stage.value) : 'bg-slate-200 hover:bg-slate-300',
              ]"
              :title="`${stage.label} · ${stage.probability}%`"
            >
              <span :class="[
                'absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap',
                isStageActive(stage.value, i) ? 'text-slate-900' : 'text-slate-500',
              ]">
                {{ stage.label }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="px-5 py-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto custom-scrollbar bg-white">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap mr-1">Atacar:</span>
        <button @click="openOutreach('email')" class="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg text-[10px] font-black flex items-center gap-1.5 whitespace-nowrap transition-all">
          <i class="fas fa-envelope text-[10px]"></i>Email
        </button>
        <button @click="openOutreach('whatsapp')" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black flex items-center gap-1.5 whitespace-nowrap transition-all">
          <i class="fab fa-whatsapp text-[12px]"></i>WhatsApp
        </button>
        <button @click="openOutreach('call')" class="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg text-[10px] font-black flex items-center gap-1.5 whitespace-nowrap transition-all">
          <i class="fas fa-phone text-[10px]"></i>Script llamada
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

      <!-- Tabs -->
      <div class="px-5 py-2 border-b border-slate-100 bg-slate-50/50 flex gap-1 overflow-x-auto custom-scrollbar">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-all whitespace-nowrap',
            activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          ]"
        >
          <i :class="['fas', tab.icon, 'text-[10px]']"></i>
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="text-[9px] font-bold opacity-60">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
        <!-- Resumen -->
        <ProspectSummary
          v-if="activeTab === 'summary'"
          :prospect="prospect"
          :tasks="extras.tasks"
          @generated="refreshExtras"
        />

        <!-- Conversación (chat con IA) -->
        <ProspectConversation
          v-else-if="activeTab === 'conversation'"
          :prospect="prospect"
          @updated="$emit('updated', $event)"
        />

        <!-- Notas -->
        <ProspectNotes
          v-else-if="activeTab === 'notes'"
          :notes="extras.notes"
          @add="onAddNote"
          @remove="onRemoveNote"
        />

        <!-- Tareas -->
        <ProspectTasks
          v-else-if="activeTab === 'tasks'"
          :tasks="extras.tasks"
          @add="onAddTask"
          @toggle="onToggleTask"
          @remove="onRemoveTask"
        />

        <!-- Timeline -->
        <ProspectTimeline
          v-else-if="activeTab === 'timeline'"
          :timeline="extras.timeline"
        />
      </div>
    </div>

    <!-- Sidebar -->
    <div class="col-span-12 lg:col-span-3 min-h-0 hidden lg:block">
      <ProspectSidebar
        :prospect="prospect"
        :tasks="extras.tasks"
        @updated="$emit('updated', $event)"
      />
    </div>

    <!-- Outreach Modal -->
    <ProspectOutreachModal
      v-if="outreachOpen"
      :is-open="outreachOpen"
      :prospect="prospect"
      :channel="outreachChannel"
      @close="outreachOpen = false"
      @updated="onOutreachUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { prospectService } from '@/services/prospectService'
import { clientService } from '@/services/clientService'
import type { Prospect, ProspectStatus, ProspectNote, ProspectTask, ProspectTimelineEntry } from '@/types/prospect'
import { PROSPECT_STATUSES } from '@/types/prospect'
import { useNotifications } from '@/composables/useNotifications'
import type { OutreachChannel } from '@/services/prospectOutreach'
import ProspectOutreachModal from './ProspectOutreachModal.vue'
import ProspectSummary from './ProspectSummary.vue'
import ProspectConversation from './ProspectConversation.vue'
import ProspectNotes from './ProspectNotes.vue'
import ProspectTasks from './ProspectTasks.vue'
import ProspectTimeline from './ProspectTimeline.vue'
import ProspectSidebar from './ProspectSidebar.vue'

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

const activeTab = ref<'summary' | 'conversation' | 'notes' | 'tasks' | 'timeline'>('summary')
const outreachOpen = ref(false)
const outreachChannel = ref<OutreachChannel>('email')
const converting = ref(false)

interface ProspectExtras {
  notes: ProspectNote[]
  tasks: ProspectTask[]
  timeline: ProspectTimelineEntry[]
}

const extras = ref<ProspectExtras>({ notes: [], tasks: [], timeline: [] })

const loadExtras = () => {
  extras.value = {
    notes: prospectService.getNotes(props.prospect._id),
    tasks: prospectService.getTasks(props.prospect._id),
    timeline: prospectService.getTimeline(props.prospect._id),
  }
}

const refreshExtras = () => loadExtras()

watch(
  () => props.prospect._id,
  () => loadExtras(),
  { immediate: true }
)

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

// Pipeline stages (sin perdido en la barra, perdido se setea desde otro lado)
const pipelineStages = PROSPECT_STATUSES.filter((s) => s.value !== 'perdido')

const currentProb = computed(() => {
  return PROSPECT_STATUSES.find((s) => s.value === (props.prospect.status || 'nuevo'))?.probability || 0
})

const isStageActive = (stage: ProspectStatus, idx: number) => {
  const order = ['nuevo', 'calificado', 'propuesta', 'seguimiento', 'ganado']
  const currentIdx = order.indexOf(props.prospect.status || 'nuevo')
  return idx <= currentIdx && props.prospect.status !== 'perdido'
}

const activeColorFor = (stage: ProspectStatus) => {
  if (props.prospect.status === 'perdido') return 'bg-rose-400'
  if (stage === 'ganado') return 'bg-emerald-500'
  return 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
}

const tabs = computed(() => [
  { id: 'summary' as const,      label: 'Resumen',     icon: 'fa-wand-magic-sparkles', count: undefined },
  { id: 'conversation' as const, label: 'Conversación', icon: 'fa-comments', count: props.prospect.messages?.length },
  { id: 'notes' as const,        label: 'Notas',       icon: 'fa-note-sticky', count: extras.value.notes.length },
  { id: 'tasks' as const,        label: 'Tareas',      icon: 'fa-list-check', count: extras.value.tasks.filter((t) => !t.done).length },
  { id: 'timeline' as const,     label: 'Actividad',   icon: 'fa-clock-rotate-left', count: extras.value.timeline.length },
])

// ─── Status actions ───
const updateStatus = (status: ProspectStatus) => {
  prospectService.setStatus(props.prospect._id, status)
  emit('updated', { ...props.prospect, status })
  showSuccess(`Estado: ${PROSPECT_STATUSES.find((s) => s.value === status)?.label}`)
  loadExtras()
}

// ─── Outreach ───
const openOutreach = (channel: OutreachChannel) => {
  outreachChannel.value = channel
  outreachOpen.value = true
}

const onOutreachUpdated = (updated: Prospect) => {
  // Registrar evento en timeline
  const eventType = outreachChannel.value === 'email' ? 'outreach_email'
    : outreachChannel.value === 'whatsapp' ? 'outreach_whatsapp' : 'outreach_call'
  prospectService.addTimelineEntry(updated._id, {
    type: eventType,
    description: outreachChannel.value === 'email' ? 'Email enviado' : outreachChannel.value === 'whatsapp' ? 'WhatsApp enviado' : 'Script de llamada generado',
  })
  loadExtras()
  emit('updated', updated)
}

// ─── Notes ───
const onAddNote = (content: string) => {
  prospectService.addNote(props.prospect._id, content)
  loadExtras()
}
const onRemoveNote = (id: string) => {
  prospectService.deleteNote(props.prospect._id, id)
  loadExtras()
}

// ─── Tasks ───
const onAddTask = (payload: { title: string; dueDate?: string }) => {
  prospectService.addTask(props.prospect._id, payload)
  loadExtras()
}
const onToggleTask = (id: string) => {
  prospectService.toggleTask(props.prospect._id, id)
  loadExtras()
}
const onRemoveTask = (id: string) => {
  prospectService.deleteTask(props.prospect._id, id)
  loadExtras()
}

// ─── Convert to client ───
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

    prospectService.addTimelineEntry(props.prospect._id, {
      type: 'converted',
      description: `Convertido a cliente — ficha creada`,
      meta: { clientId: (created as any)._id },
    })
    loadExtras()

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
