<template>
  <div class="flex flex-col h-full min-h-0">
    <div class="flex-1 min-h-0 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
      <!-- Encabezado -->
      <div class="px-6 pt-6 pb-5 border-b border-slate-100 space-y-5">
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
              <i class="fas fa-user-shield text-lg"></i>
            </div>
            <div>
              <h1 class="text-xl font-black text-slate-800">Autorizaciones</h1>
              <p class="text-sm text-slate-500 mt-0.5 max-w-xl">
                Ampliar el plazo o eliminar una tarea requiere la aprobación del líder del área.
                <template v-if="summary.canReview">Aquí apruebas las solicitudes de tu equipo y sigues las tuyas.</template>
                <template v-else>Aquí sigues el estado de las solicitudes que enviaste.</template>
              </p>
            </div>
          </div>
          <button
            @click="load"
            :disabled="loading"
            class="self-start inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:text-primary-600 hover:border-primary-200 transition-colors"
          >
            <i class="fas fa-rotate" :class="{ 'animate-spin': loading }"></i>
            Actualizar
          </button>
        </div>

        <!-- Resumen: qué me toca a mí y qué estoy esperando -->
        <div class="grid gap-3" :class="summary.canReview ? 'sm:grid-cols-2' : 'sm:grid-cols-1 max-w-md'">
          <button
            v-if="summary.canReview"
            @click="goTo('inbox')"
            class="text-left p-4 rounded-2xl border transition-all flex items-center gap-4"
            :class="box === 'inbox' ? 'border-amber-300 bg-amber-50/70 ring-4 ring-amber-100' : 'border-slate-200 hover:border-amber-200 hover:bg-amber-50/40'"
          >
            <div class="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 relative">
              <i class="fas fa-inbox"></i>
              <span v-if="summary.toReview > 0" class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 ring-2 ring-white animate-pulse"></span>
            </div>
            <div class="min-w-0">
              <p class="text-2xl font-black text-slate-800 leading-none">{{ summary.toReview }}</p>
              <p class="text-xs font-bold text-amber-700 mt-1">Requieren tu aprobación</p>
            </div>
          </button>
          <button
            @click="goTo('mine')"
            class="text-left p-4 rounded-2xl border transition-all flex items-center gap-4"
            :class="box === 'mine' ? 'border-sky-300 bg-sky-50/70 ring-4 ring-sky-100' : 'border-slate-200 hover:border-sky-200 hover:bg-sky-50/40'"
          >
            <div class="w-11 h-11 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <i class="fas fa-paper-plane"></i>
            </div>
            <div class="min-w-0">
              <p class="text-2xl font-black text-slate-800 leading-none">{{ summary.waiting }}</p>
              <p class="text-xs font-bold text-sky-700 mt-1">
                {{ summary.waiting === 1 ? 'Solicitud tuya en espera' : 'Solicitudes tuyas en espera' }}
              </p>
            </div>
          </button>
        </div>

        <!-- Filtros -->
        <div class="flex flex-col xl:flex-row xl:items-center gap-3">
          <div class="inline-flex flex-wrap p-1 bg-slate-100 rounded-xl max-w-full self-start">
            <button
              v-for="opt in statusOptions"
              :key="opt.value"
              @click="statusFilter = opt.value"
              class="px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all"
              :class="statusFilter === opt.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            >
              {{ opt.label }}
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="opt in kindOptions"
              :key="opt.value"
              @click="kindFilter = opt.value"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all"
              :class="kindFilter === opt.value ? opt.activeClass : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300'"
            >
              <i :class="opt.icon" class="text-[10px]"></i>
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Lista -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/40">
        <p class="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
          {{ box === 'inbox' ? 'Solicitudes de tu equipo' : 'Solicitudes que enviaste' }}
        </p>

        <div v-if="loading && requests.length === 0" class="space-y-3">
          <div v-for="n in 3" :key="n" class="h-32 rounded-2xl bg-white border border-slate-100 animate-pulse"></div>
        </div>

        <div v-else-if="error" class="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm font-medium">
          {{ error }}
        </div>

        <div v-else-if="requests.length === 0" class="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <div class="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
            :class="box === 'inbox' ? 'bg-amber-50 text-amber-300' : 'bg-sky-50 text-sky-300'">
            <i :class="box === 'inbox' ? 'fas fa-check-double' : 'fas fa-paper-plane'" class="text-2xl"></i>
          </div>
          <p class="text-sm font-black text-slate-600">{{ emptyState.title }}</p>
          <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">{{ emptyState.detail }}</p>
        </div>

        <div v-else class="space-y-3">
          <article
            v-for="req in requests"
            :key="req._id"
            class="relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:shadow-slate-200/60 transition-shadow"
          >
            <!-- Franja de estado -->
            <span class="absolute left-0 top-0 bottom-0 w-1" :class="stateOf(req).bar"></span>

            <div class="p-5 pl-6 flex flex-col lg:flex-row lg:items-start gap-5">
              <div class="flex-1 min-w-0">
                <!-- Estado contextual -->
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full" :class="stateOf(req).pill">
                    <span v-if="stateOf(req).pulse" class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                    <i v-else :class="stateOf(req).icon" class="text-[10px]"></i>
                    {{ stateOf(req).label }}
                  </span>
                  <span
                    class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                    :class="req.kind === 'deletion' ? 'bg-rose-50 text-rose-600' : 'bg-orange-50 text-orange-600'"
                  >
                    <i :class="req.kind === 'deletion' ? 'fas fa-trash-alt' : 'fas fa-calendar-plus'" class="text-[10px]"></i>
                    {{ APPROVAL_KIND_LABELS[req.kind] }}
                  </span>
                  <span class="text-[11px] font-bold text-slate-400">
                    {{ req.entityType === 'task' ? 'Tarea de tablero' : 'Actividad' }}<template v-if="req.department"> · {{ req.department }}</template>
                  </span>
                </div>

                <!-- Título -->
                <button
                  v-if="!(req.kind === 'deletion' && req.status === 'approved')"
                  @click="openEntity(req)"
                  class="block mt-2 text-left text-base font-black text-slate-800 hover:text-primary-600 transition-colors"
                >
                  {{ req.entityTitle || 'Sin título' }}
                  <i class="fas fa-arrow-up-right-from-square text-[10px] text-slate-300 ml-1"></i>
                </button>
                <p v-else class="mt-2 text-base font-black text-slate-400 line-through">{{ req.entityTitle || 'Sin título' }}</p>

                <!-- Quién lo pidió (solo en la bandeja del líder) -->
                <div v-if="box === 'inbox'" class="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <PersonAvatar :name="req.requestedBy?.name" :photo="req.requestedBy?.photo" :letters="1"
                    class="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-[10px] font-black" />
                  <span>
                    <strong class="mr-1">{{ req.requestedBy?.name || 'Alguien' }}</strong>
                    <template v-if="req.autoApproved">
                      {{ req.kind === 'deletion' ? 'la eliminó' : 'amplió el plazo' }} con
                      <span class="font-bold text-violet-700"><i class="fas fa-bolt text-[10px]"></i> autoaprobación</span>
                    </template>
                    <template v-else>{{ req.kind === 'deletion' ? 'quiere eliminarla' : 'pide más tiempo' }}</template>
                    <span class="text-slate-400">· {{ relative(req.createdAt) }}</span>
                  </span>
                </div>

                <!-- Cambio de fecha -->
                <div v-if="req.kind === 'due-date-extension'" class="mt-3 flex items-center gap-2.5 text-sm flex-wrap">
                  <span class="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-400 line-through decoration-slate-300">
                    {{ formatDate(req.currentDueDate) }}
                  </span>
                  <i class="fas fa-arrow-right text-slate-300 text-xs"></i>
                  <span class="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg font-black text-amber-700">
                    {{ formatDate(req.requestedDueDate) }}
                  </span>
                  <span v-if="extraDays(req)" class="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-black text-slate-500">{{ extraDays(req) }}</span>
                </div>

                <p v-if="req.reason" class="mt-3 text-sm text-slate-600 bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-100">
                  <i class="fas fa-quote-left text-slate-300 text-[10px] mr-1"></i> {{ req.reason }}
                </p>

                <!-- Seguimiento para quien pidió -->
                <ol v-if="box === 'mine'" class="mt-4 flex items-start gap-0 text-[11px]">
                  <li v-for="(stepItem, i) in stepsOf(req)" :key="i" class="flex-1 min-w-0">
                    <div class="flex items-center">
                      <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px]" :class="stepItem.dot">
                        <i :class="stepItem.icon"></i>
                      </span>
                      <span v-if="i < stepsOf(req).length - 1" class="flex-1 h-0.5 mx-1.5 rounded-full" :class="stepItem.line"></span>
                    </div>
                    <p class="mt-1.5 pr-2 font-black" :class="stepItem.titleClass">{{ stepItem.title }}</p>
                    <p class="pr-2 text-slate-400 font-medium leading-snug">{{ stepItem.detail }}</p>
                  </li>
                </ol>

                <!-- Resultado para el líder -->
                <p v-if="box === 'inbox' && req.autoApproved" class="mt-3 text-xs text-slate-500">
                  Aplicada de inmediato con permiso especial; no requirió tu aprobación.
                </p>
                <p v-else-if="box === 'inbox' && req.status !== 'pending'" class="mt-3 text-xs text-slate-500">
                  <template v-if="req.reviewedBy">
                    {{ req.status === 'approved' ? 'Aprobada' : 'Rechazada' }} por <strong>{{ req.reviewedBy.name }}</strong>
                    {{ req.reviewedAt ? relative(req.reviewedAt) : '' }}
                  </template>
                  <template v-else-if="req.status === 'cancelled'">{{ req.reviewComment || 'Cancelada por quien la pidió' }}</template>
                  <span v-if="req.reviewedBy && req.reviewComment">: “{{ req.reviewComment }}”</span>
                </p>
              </div>

              <!-- Acciones del líder -->
              <div v-if="req.status === 'pending' && box === 'inbox'" class="lg:w-72 shrink-0 space-y-2.5">
                <div v-if="!showComment[req._id]">
                  <button @click="showComment[req._id] = true" class="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors">
                    <i class="fas fa-comment-dots mr-1"></i> Agregar comentario
                  </button>
                </div>
                <textarea
                  v-else
                  v-model="comments[req._id]"
                  rows="2"
                  placeholder="Comentario para quien lo pidió"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 resize-none transition-all"
                ></textarea>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    @click="review(req, 'reject')"
                    :disabled="busyId === req._id"
                    class="px-3 py-2.5 bg-white border border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 rounded-xl text-sm font-black transition-colors"
                  >
                    Rechazar
                  </button>
                  <button
                    @click="review(req, 'approve')"
                    :disabled="busyId === req._id"
                    class="px-3 py-2.5 disabled:opacity-50 text-white rounded-xl text-sm font-black transition-colors shadow-sm"
                    :class="req.kind === 'deletion' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'"
                  >
                    <i v-if="busyId === req._id" class="fas fa-spinner animate-spin"></i>
                    <template v-else>{{ req.kind === 'deletion' ? 'Eliminar' : 'Aprobar' }}</template>
                  </button>
                </div>
              </div>

              <!-- Acción de quien pidió -->
              <div v-else-if="req.status === 'pending' && box === 'mine'" class="lg:w-48 shrink-0 lg:text-right">
                <button
                  @click="cancel(req)"
                  :disabled="busyId === req._id"
                  class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:text-rose-600 hover:border-rose-200 disabled:opacity-50 transition-colors"
                >
                  <i class="fas fa-xmark"></i> Retirar solicitud
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
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { format, formatDistanceToNow, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'
import PersonAvatar from '../components/ui/PersonAvatar.vue'
import { useActivityModalStore } from '../stores/activityModal'
import { useNotifications } from '../composables/useNotifications'
import {
  taskApprovalService,
  APPROVALS_CHANGED_EVENT,
  APPROVALS_REFRESH_EVENT,
  APPROVAL_KIND_LABELS,
  APPROVER_SOURCE_LABELS,
  type TaskApprovalRequest,
  type ApprovalStatus,
  type ApprovalKind,
  type ApprovalSummary
} from '../services/taskApprovalService'

type Box = 'inbox' | 'mine'

const { showSuccess, showError, confirmDelete } = useNotifications()
const activityModalStore = useActivityModalStore()

const box = ref<Box>('mine')
const statusFilter = ref<ApprovalStatus | 'all'>('pending')
const kindFilter = ref<ApprovalKind | ''>('')
const requests = ref<TaskApprovalRequest[]>([])
const summary = ref<ApprovalSummary>({ toReview: 0, waiting: 0, canReview: false })
const loading = ref(false)
const error = ref('')
const busyId = ref<string | null>(null)
const comments = reactive<Record<string, string>>({})
const showComment = reactive<Record<string, boolean>>({})
let initialized = false

// "Pendiente" significa cosas distintas según quién mira: al líder le toca
// actuar; a quien pidió le toca esperar.
const statusOptions = computed(() => [
  { value: 'pending' as const, label: box.value === 'inbox' ? 'Por resolver' : 'En espera' },
  { value: 'approved' as const, label: 'Aprobadas' },
  { value: 'rejected' as const, label: 'Rechazadas' },
  { value: 'cancelled' as const, label: box.value === 'inbox' ? 'Canceladas' : 'Retiradas' },
  { value: 'all' as const, label: 'Todas' }
])

const kindOptions = [
  { value: '' as const, label: 'Todo', icon: 'fas fa-layer-group', activeClass: 'border-slate-800 bg-slate-800 text-white' },
  { value: 'due-date-extension' as const, label: 'Ampliaciones de plazo', icon: 'fas fa-calendar-plus', activeClass: 'border-orange-500 bg-orange-500 text-white' },
  { value: 'deletion' as const, label: 'Eliminaciones', icon: 'fas fa-trash-alt', activeClass: 'border-rose-500 bg-rose-500 text-white' }
]

const emptyState = computed(() => {
  if (box.value === 'inbox') {
    return statusFilter.value === 'pending'
      ? { title: 'Estás al día', detail: 'No hay solicitudes de tu equipo esperando tu aprobación.' }
      : { title: 'No hay solicitudes con este estado', detail: 'Prueba con otro filtro.' }
  }
  return statusFilter.value === 'pending'
    ? { title: 'No tienes solicitudes en espera', detail: 'Cuando pidas ampliar un plazo o eliminar una tarea, podrás seguir aquí su aprobación.' }
    : { title: 'No hay solicitudes con este estado', detail: 'Prueba con otro filtro.' }
})

function approverNames(req: TaskApprovalRequest) {
  const names = (req.approvers || []).map(a => a.name).filter(Boolean)
  if (names.length) return names.join(', ')
  return APPROVER_SOURCE_LABELS[req.approverSource] || 'tu líder'
}

// Estado visible de una solicitud según quién la mira
function stateOf(req: TaskApprovalRequest) {
  if (req.status === 'pending') {
    return box.value === 'inbox'
      ? { label: 'Requiere tu aprobación', pill: 'bg-amber-100 text-amber-800', bar: 'bg-amber-400', icon: '', pulse: true }
      : { label: `En espera de ${approverNames(req)}`, pill: 'bg-sky-100 text-sky-800', bar: 'bg-sky-400', icon: 'fas fa-hourglass-half', pulse: false }
  }
  if (req.status === 'approved' && req.autoApproved) {
    return { label: 'Autoaprobada', pill: 'bg-violet-100 text-violet-800', bar: 'bg-violet-500', icon: 'fas fa-bolt', pulse: false }
  }
  if (req.status === 'approved') {
    return { label: 'Aprobada', pill: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-400', icon: 'fas fa-check', pulse: false }
  }
  if (req.status === 'rejected') {
    return { label: 'Rechazada', pill: 'bg-rose-100 text-rose-700', bar: 'bg-rose-400', icon: 'fas fa-xmark', pulse: false }
  }
  return { label: box.value === 'mine' ? 'Retirada' : 'Cancelada', pill: 'bg-slate-100 text-slate-500', bar: 'bg-slate-300', icon: 'fas fa-ban', pulse: false }
}

// Línea de tiempo para quien pidió: Enviada → En revisión → Resultado
function stepsOf(req: TaskApprovalRequest) {
  const done = { dot: 'bg-emerald-500 text-white', line: 'bg-emerald-300', titleClass: 'text-slate-700', icon: 'fas fa-check' }
  const current = { dot: 'bg-sky-500 text-white ring-4 ring-sky-100', line: 'bg-slate-200', titleClass: 'text-sky-700', icon: 'fas fa-hourglass-half' }
  const todo = { dot: 'bg-slate-100 text-slate-300', line: 'bg-slate-200', titleClass: 'text-slate-400', icon: 'fas fa-circle text-[6px]' }

  const sent = { ...done, title: 'Enviada', detail: relative(req.createdAt) }

  // Con autoaprobación no hubo revisión: se aplicó al momento y quedó el registro
  if (req.autoApproved) {
    return [
      { ...done, title: 'Registrada', detail: relative(req.createdAt) },
      {
        ...done,
        dot: 'bg-violet-600 text-white',
        icon: 'fas fa-bolt',
        titleClass: 'text-violet-700',
        title: 'Autoaprobada',
        detail: req.kind === 'deletion'
          ? 'Eliminada con tu permiso especial'
          : `Nueva entrega: ${formatDate(req.requestedDueDate)}`
      }
    ]
  }

  if (req.status === 'pending') {
    return [
      sent,
      { ...current, title: 'En revisión', detail: `Lo revisa ${approverNames(req)}` },
      { ...todo, title: 'Resultado', detail: 'Te avisaremos en la campana' }
    ]
  }

  const reviewer = req.reviewedBy?.name
  const when = req.reviewedAt ? relative(req.reviewedAt) : ''
  if (req.status === 'cancelled') {
    return [
      sent,
      { ...todo, dot: 'bg-slate-300 text-white', icon: 'fas fa-ban', title: 'Retirada', detail: req.reviewComment || 'La retiraste antes de que la revisaran' }
    ]
  }
  const approved = req.status === 'approved'
  const outcomeDetail = approved
    ? (req.kind === 'deletion' ? 'La tarea fue eliminada' : `Nueva entrega: ${formatDate(req.requestedDueDate)}`)
    : (req.reviewComment ? `“${req.reviewComment}”` : 'Se mantiene como estaba')
  return [
    sent,
    { ...done, title: 'Revisada', detail: reviewer ? `Por ${reviewer} ${when}` : when },
    {
      ...done,
      dot: approved ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white',
      icon: approved ? 'fas fa-check' : 'fas fa-xmark',
      titleClass: approved ? 'text-emerald-700' : 'text-rose-700',
      title: approved ? 'Aprobada' : 'Rechazada',
      detail: outcomeDetail
    }
  ]
}

function goTo(target: Box) {
  if (box.value === target) return
  box.value = target
  statusFilter.value = 'pending'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    summary.value = await taskApprovalService.summary()
    // El contador del menú lateral (App.vue) se actualiza con este evento
    window.dispatchEvent(new CustomEvent(APPROVALS_CHANGED_EVENT, { detail: summary.value }))
    // Al abrir: quien aprueba entra a su bandeja; los demás, a sus solicitudes
    if (!initialized) {
      initialized = true
      const target: Box = summary.value.canReview ? 'inbox' : 'mine'
      if (box.value !== target) {
        box.value = target // el watch vuelve a cargar la lista
        return
      }
    }
    if (!summary.value.canReview && box.value === 'inbox') box.value = 'mine'
    requests.value = await taskApprovalService.list(box.value, statusFilter.value, kindFilter.value || undefined)
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
      showSuccess('Solicitud rechazada. Le avisamos a quien la pidió')
    }
    delete comments[req._id]
    delete showComment[req._id]
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
    showSuccess('Retiraste la solicitud')
    await load()
  } catch (e) {
    showError(e instanceof Error ? e.message : 'No se pudo retirar la solicitud')
  } finally {
    busyId.value = null
  }
}

function openEntity(req: TaskApprovalRequest) {
  activityModalStore.open(String(req.entityId), req.entityType)
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

watch([box, statusFilter, kindFilter], load)
// Solicitudes creadas desde el modal de la tarea (abierto encima de esta página)
const onRefreshRequested = () => { load() }
onMounted(() => {
  load()
  window.addEventListener(APPROVALS_REFRESH_EVENT, onRefreshRequested)
})
onBeforeUnmount(() => window.removeEventListener(APPROVALS_REFRESH_EVENT, onRefreshRequested))
</script>
