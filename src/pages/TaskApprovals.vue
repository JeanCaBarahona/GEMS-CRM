<template>
  <div class="flex flex-col h-full min-h-0">
    <div class="flex-1 min-h-0 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
      <!-- Encabezado -->
      <div class="px-6 pt-6 pb-4 border-b border-slate-100">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-xl font-black text-slate-800">Autorizaciones</h1>
            <p class="text-sm text-slate-500 mt-1">
              Ampliar el plazo o eliminar una tarea requiere la aprobación del líder del área.
            </p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <select
              v-model="kindFilter"
              class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos los tipos</option>
              <option value="due-date-extension">Ampliación de plazo</option>
              <option value="deletion">Eliminación</option>
            </select>
            <select
              v-model="statusFilter"
              class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="cancelled">Canceladas</option>
              <option value="all">Todas</option>
            </select>
            <button
              @click="load"
              :disabled="loading"
              title="Actualizar"
              class="p-2.5 text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:text-primary-600 hover:bg-white transition-colors"
            >
              <i class="fas fa-rotate" :class="{ 'animate-spin': loading }"></i>
            </button>
          </div>
        </div>

        <!-- Pestañas -->
        <div class="flex gap-2 mt-5">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="box = tab.id"
            class="px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
            :class="box === tab.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-slate-50 text-slate-500 hover:text-slate-800'"
          >
            {{ tab.label }}
            <span
              v-if="tab.id === 'inbox' && inboxPending > 0"
              class="min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-black flex items-center justify-center"
              :class="box === 'inbox' ? 'bg-white text-primary-600' : 'bg-amber-500 text-white'"
            >{{ inboxPending }}</span>
          </button>
        </div>
      </div>

      <!-- Lista -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div v-if="loading && requests.length === 0" class="text-center text-slate-400 py-16">
          <i class="fas fa-spinner animate-spin text-2xl"></i>
        </div>

        <div v-else-if="error" class="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm font-medium">
          {{ error }}
        </div>

        <div v-else-if="requests.length === 0" class="text-center py-16">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mb-3">
            <i class="fas fa-user-shield text-2xl"></i>
          </div>
          <p class="text-sm font-bold text-slate-500">{{ emptyMessage }}</p>
        </div>

        <div v-else class="space-y-3">
          <article
            v-for="req in requests"
            :key="req._id"
            class="p-4 border rounded-2xl transition-colors"
            :class="req.kind === 'deletion' ? 'border-rose-100 hover:border-rose-200' : 'border-slate-200 hover:border-slate-300'"
          >
            <div class="flex flex-col lg:flex-row lg:items-start gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    class="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1"
                    :class="req.kind === 'deletion' ? 'bg-rose-50 text-rose-600' : 'bg-orange-50 text-orange-600'"
                  >
                    <i :class="req.kind === 'deletion' ? 'fas fa-trash-alt' : 'fas fa-calendar-plus'"></i>
                    {{ APPROVAL_KIND_LABELS[req.kind] }}
                  </span>
                  <span class="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md" :class="statusClass(req.status)">
                    {{ APPROVAL_STATUS_LABELS[req.status] }}
                  </span>
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {{ req.entityType === 'task' ? 'Tarea de tablero' : 'Actividad' }}
                  </span>
                  <span v-if="req.department" class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    · {{ req.department }}
                  </span>
                </div>

                <button
                  v-if="!(req.kind === 'deletion' && req.status === 'approved')"
                  @click="openEntity(req)"
                  class="mt-1.5 text-left text-base font-black text-slate-800 hover:text-primary-600 transition-colors"
                >
                  {{ req.entityTitle || 'Sin título' }}
                </button>
                <p v-else class="mt-1.5 text-base font-black text-slate-400 line-through">{{ req.entityTitle || 'Sin título' }}</p>

                <div class="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <PersonAvatar :name="req.requestedBy?.name" :photo="req.requestedBy?.photo" :letters="1"
                    class="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-[10px] font-black" />
                  <span>
                    <strong>{{ req.requestedBy?.name || 'Alguien' }}</strong>
                    {{ req.kind === 'deletion' ? 'pidió eliminarla' : 'pidió ampliar el plazo' }} · {{ relative(req.createdAt) }}
                  </span>
                </div>

                <div v-if="req.kind === 'due-date-extension'" class="mt-3 flex items-center gap-3 text-sm flex-wrap">
                  <span class="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-500 line-through decoration-slate-300">
                    {{ formatDate(req.currentDueDate) }}
                  </span>
                  <i class="fas fa-arrow-right text-slate-300 text-xs"></i>
                  <span class="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg font-black text-amber-700">
                    {{ formatDate(req.requestedDueDate) }}
                  </span>
                  <span v-if="extraDays(req)" class="text-xs font-bold text-slate-400">{{ extraDays(req) }}</span>
                </div>

                <p v-if="req.reason" class="mt-3 text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                  <span class="font-bold text-slate-500">Motivo:</span> {{ req.reason }}
                </p>

                <p v-if="req.status !== 'pending' && req.reviewedBy" class="mt-2 text-xs text-slate-500">
                  {{ req.status === 'approved' ? 'Aprobada' : 'Rechazada' }} por <strong>{{ req.reviewedBy.name }}</strong>
                  {{ req.reviewedAt ? relative(req.reviewedAt) : '' }}<span v-if="req.reviewComment">: “{{ req.reviewComment }}”</span>
                </p>
                <p v-else-if="req.status === 'cancelled' && req.reviewComment" class="mt-2 text-xs text-slate-500">
                  {{ req.reviewComment }}
                </p>
                <p v-else-if="req.status === 'pending' && box === 'mine'" class="mt-2 text-xs text-slate-500">
                  Esperando a {{ approverNames(req) }}
                </p>
              </div>

              <!-- Acciones -->
              <div v-if="req.status === 'pending'" class="lg:w-72 shrink-0 space-y-2">
                <template v-if="box === 'inbox'">
                  <textarea
                    v-model="comments[req._id]"
                    rows="2"
                    placeholder="Comentario (opcional)"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  ></textarea>
                  <div class="flex gap-2">
                    <button
                      @click="review(req, 'approve')"
                      :disabled="busyId === req._id"
                      class="flex-1 px-3 py-2 disabled:opacity-50 text-white rounded-xl text-sm font-black transition-colors"
                      :class="req.kind === 'deletion' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'"
                    >
                      <i class="fas fa-check mr-1"></i> {{ req.kind === 'deletion' ? 'Aprobar y eliminar' : 'Aprobar' }}
                    </button>
                    <button
                      @click="review(req, 'reject')"
                      :disabled="busyId === req._id"
                      class="flex-1 px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 rounded-xl text-sm font-black transition-colors"
                    >
                      <i class="fas fa-xmark mr-1"></i> Rechazar
                    </button>
                  </div>
                </template>
                <button
                  v-else
                  @click="cancel(req)"
                  :disabled="busyId === req._id"
                  class="w-full px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancelar solicitud
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { format, formatDistanceToNow, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'
import PersonAvatar from '../components/ui/PersonAvatar.vue'
import { useActivityModalStore } from '../stores/activityModal'
import { useNotifications } from '../composables/useNotifications'
import {
  taskApprovalService,
  APPROVAL_STATUS_LABELS,
  APPROVAL_KIND_LABELS,
  APPROVER_SOURCE_LABELS,
  type TaskApprovalRequest,
  type ApprovalStatus,
  type ApprovalKind
} from '../services/taskApprovalService'

const { showSuccess, showError, confirmDelete } = useNotifications()
const activityModalStore = useActivityModalStore()

const tabs = [
  { id: 'inbox' as const, label: 'Por aprobar' },
  { id: 'mine' as const, label: 'Mis solicitudes' }
]

const box = ref<'inbox' | 'mine'>('inbox')
const statusFilter = ref<ApprovalStatus | 'all'>('pending')
const kindFilter = ref<ApprovalKind | ''>('')
const requests = ref<TaskApprovalRequest[]>([])
const loading = ref(false)
const error = ref('')
const busyId = ref<string | null>(null)
const inboxPending = ref(0)
const comments = reactive<Record<string, string>>({})

const emptyMessage = computed(() => {
  if (box.value === 'inbox') {
    return statusFilter.value === 'pending'
      ? 'No tienes solicitudes por aprobar'
      : 'No hay solicitudes con este estado'
  }
  return 'No has hecho solicitudes con este estado'
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [list, count] = await Promise.all([
      taskApprovalService.list(box.value, statusFilter.value, kindFilter.value || undefined),
      taskApprovalService.pendingCount()
    ])
    requests.value = list
    inboxPending.value = count
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudieron cargar las solicitudes'
  } finally {
    loading.value = false
  }
}

async function review(req: TaskApprovalRequest, action: 'approve' | 'reject') {
  // Aprobar una eliminación no se puede deshacer: se confirma antes
  if (action === 'approve' && req.kind === 'deletion') {
    const confirmation = await confirmDelete(req.entityTitle || 'esta tarea')
    if (!confirmation.isConfirmed) return
  }

  busyId.value = req._id
  try {
    const comment = comments[req._id] || ''
    if (action === 'approve') {
      await taskApprovalService.approve(req._id, comment)
      showSuccess(req.kind === 'deletion'
        ? 'Eliminación aprobada: la tarea fue eliminada'
        : 'Ampliación aprobada: la nueva fecha ya quedó en la tarea')
    } else {
      await taskApprovalService.reject(req._id, comment)
      showSuccess('Solicitud rechazada')
    }
    delete comments[req._id]
    await load()
  } catch (e) {
    showError(e instanceof Error ? e.message : 'No se pudo procesar la solicitud')
  } finally {
    busyId.value = null
  }
}

async function cancel(req: TaskApprovalRequest) {
  busyId.value = req._id
  try {
    await taskApprovalService.cancel(req._id)
    showSuccess('Solicitud cancelada')
    await load()
  } catch (e) {
    showError(e instanceof Error ? e.message : 'No se pudo cancelar la solicitud')
  } finally {
    busyId.value = null
  }
}

function openEntity(req: TaskApprovalRequest) {
  activityModalStore.open(String(req.entityId), req.entityType)
}

function approverNames(req: TaskApprovalRequest) {
  const names = (req.approvers || []).map(a => a.name).filter(Boolean)
  const who = APPROVER_SOURCE_LABELS[req.approverSource] || 'tu líder'
  return names.length ? `${who}: ${names.join(', ')}` : who
}

function formatDate(date: string | null) {
  if (!date) return 'Sin fecha'
  return format(new Date(date), "d MMM yyyy, HH:mm", { locale: es })
}

function relative(date: string) {
  return formatDistanceToNow(new Date(date), { locale: es, addSuffix: true })
}

function extraDays(req: TaskApprovalRequest) {
  if (!req.currentDueDate || !req.requestedDueDate) return ''
  const days = differenceInCalendarDays(new Date(req.requestedDueDate), new Date(req.currentDueDate))
  if (days <= 0) return ''
  return days === 1 ? '+1 día' : `+${days} días`
}

function statusClass(status: ApprovalStatus) {
  switch (status) {
    case 'pending': return 'bg-amber-50 text-amber-700'
    case 'approved': return 'bg-emerald-50 text-emerald-700'
    case 'rejected': return 'bg-rose-50 text-rose-700'
    default: return 'bg-slate-100 text-slate-500'
  }
}

watch([box, statusFilter, kindFilter], load)
onMounted(load)
</script>
