<template>
  <div>
    <!-- Autor de la tarea (distinto de la persona asignada) -->
    <div v-if="showCreator" :class="['flex items-start gap-2 rounded-lg px-3 py-2 mb-4 text-xs', theme.summary]">
      <UserIcon :class="['w-4 h-4 shrink-0 mt-px', theme.icon]" />
      <div class="min-w-0">
        <p class="break-words">
          <span :class="theme.muted">Creada por </span>
          <span :class="['font-semibold', theme.name]">{{ creatorName }}</span>
        </p>
        <p v-if="task?.createdAt" :class="['text-[11px] mt-0.5', theme.muted]">{{ formatDateTime(task.createdAt) }}</p>
      </div>
    </div>

    <TransitionGroup v-if="items.length > 0" tag="ol" name="timeline" appear>
      <li
        v-for="(item, idx) in items"
        :key="item.key"
        class="relative flex gap-3 pb-3 last:pb-0"
        :style="{ transitionDelay: `${Math.min(idx, 8) * 35}ms` }"
      >
        <span
          v-if="idx < items.length - 1"
          :class="['absolute left-3.5 bottom-0 w-px', theme.lineTop, theme.line]"
          aria-hidden="true"
        />
        <div :class="['relative w-7 h-7 rounded-full border flex items-center justify-center shrink-0', theme.dotOffset, theme.dot]">
          <component :is="item.icon" class="w-3.5 h-3.5" />
        </div>
        <div :class="['min-w-0 flex-1', theme.card]">
          <p :class="['text-xs leading-relaxed break-words', theme.text]">
            <span :class="['font-semibold', theme.name]">{{ item.who }}</span>
            {{ item.verb }}
          </p>
          <p v-if="item.from !== undefined" class="text-xs mt-1 break-words">
            <span :class="['line-through', theme.from]">{{ item.from }}</span>
            <span :class="theme.muted"> → </span>
            <span :class="['font-medium', theme.to]">{{ item.to }}</span>
          </p>
          <p
            v-if="item.quote"
            :class="['text-xs mt-1.5 rounded-md px-2.5 py-1.5 whitespace-pre-wrap break-words', theme.quote, item.struck ? 'line-through' : '']"
          >{{ item.quote }}</p>
          <p :class="['text-[11px] mt-1', theme.muted]">{{ formatDateTime(item.date) }}</p>
        </div>
      </li>
    </TransitionGroup>

    <!-- Solo existe la creación: registros anteriores al historial o sin cambios aún -->
    <div
      v-if="items.length <= 1"
      :class="['rounded-xl border border-dashed px-4 py-5 text-center', items.length ? 'mt-4' : '', theme.hint]"
    >
      <ClockIcon class="w-5 h-5 mx-auto mb-2 opacity-60" />
      <p class="text-xs font-semibold">Aún no hay cambios registrados</p>
      <p class="text-[11px] mt-1 leading-relaxed">
        Aquí aparecerán los cambios de estado, prioridad, fechas y responsables, y los comentarios, con quién los hizo.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  PlusCircleIcon,
  ArrowsRightLeftIcon,
  PencilSquareIcon,
  ChatBubbleLeftIcon,
  PaperClipIcon,
  TrashIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/vue/20/solid'
import type { TaskHistoryEntry } from '@/stores/tasks'

type UserRef = { _id?: string; name?: string | null }

const props = withDefaults(defineProps<{
  task: {
    history?: TaskHistoryEntry[]
    createdBy?: UserRef | string | null
    createdAt?: Date | string
  } | null
  variant?: 'dark' | 'light'
  // Ocultar el resumen "Creada por" cuando el contenedor ya lo muestra
  showCreator?: boolean
}>(), {
  variant: 'light',
  showCreator: true
})

interface TimelineItem {
  key: string
  icon: Component
  who: string
  verb: string
  from?: string
  to?: string
  quote?: string
  struck?: boolean
  date: Date | string
}

const THEMES = {
  dark: {
    summary: 'bg-gray-800/60',
    icon: 'text-purple-300',
    text: 'text-gray-300',
    name: 'text-white',
    muted: 'text-gray-500',
    line: 'bg-gray-700',
    lineTop: 'top-7',
    dot: 'bg-gray-800 border-gray-700 text-purple-300',
    dotOffset: '',
    card: 'pt-0.5',
    from: 'text-gray-500',
    to: 'text-gray-100',
    quote: 'bg-gray-800/60 text-gray-300',
    hint: 'border-gray-700 text-gray-400'
  },
  light: {
    summary: 'bg-white border border-slate-100',
    icon: 'text-primary-500',
    text: 'text-slate-600',
    name: 'text-slate-800',
    muted: 'text-slate-400',
    line: 'bg-slate-200',
    lineTop: 'top-9',
    dot: 'bg-white border-slate-200 text-primary-500 shadow-sm',
    dotOffset: 'mt-1.5',
    // Cada entrada en tarjeta para que no quede pegada al borde de la columna
    card: 'bg-white border border-slate-100 rounded-xl px-3 py-2.5 shadow-sm transition-shadow duration-200 hover:shadow-md',
    from: 'text-slate-400',
    to: 'text-slate-700',
    quote: 'bg-slate-50 text-slate-600',
    hint: 'border-slate-200 bg-white/60 text-slate-400'
  }
}

const theme = computed(() => THEMES[props.variant])

// Solo se muestran los campos con etiqueta: las entradas antiguas registraban
// también campos internos (updatedAt, __v, campos fuera del schema…).
const FIELD_LABELS: Record<string, string> = {
  title: 'el título',
  description: 'la descripción',
  type: 'el tipo',
  status: 'el estado',
  boardStatus: 'la columna',
  priority: 'la prioridad',
  assignedTo: 'la asignación',
  boardId: 'el tablero',
  sprint: 'el sprint',
  dueDate: 'la fecha límite',
  startDate: 'la fecha de inicio',
  date: 'la fecha de inicio',
  estimatedTime: 'el tiempo estimado',
  estimatedHours: 'las horas estimadas',
  actualHours: 'las horas reales',
  completionPercentage: 'el avance',
  tags: 'las etiquetas',
  labels: 'las etiquetas',
  clientId: 'el cliente',
  projectId: 'el proyecto',
  parentTask: 'la tarea padre',
  epicId: 'la épica',
  featureId: 'el feature',
  userStoryId: 'la historia de usuario',
  blockedBy: 'los bloqueos',
  relatedTasks: 'las tareas relacionadas',
  linkedCases: 'los casos vinculados',
  linkedWikiArticles: 'los artículos de wiki vinculados',
  acceptanceCriteria: 'los criterios de aceptación',
  github: 'la información de GitHub'
}

// Campos cuyo valor anterior/nuevo es legible; el resto guarda ids y solo se indica que cambió.
const VALUE_FIELDS = new Set([
  'title', 'type', 'status', 'boardStatus', 'priority', 'dueDate', 'startDate', 'date',
  'estimatedTime', 'estimatedHours', 'actualHours', 'completionPercentage', 'tags'
])

const ENUM_LABELS: Record<string, Record<string, string>> = {
  boardStatus: {
    backlog: 'Backlog', todo: 'Por Hacer', 'in-progress': 'En Progreso',
    review: 'Revisión', testing: 'Testing', done: 'Hecho'
  },
  // Estados de tareas de tablero y de actividades
  status: {
    new: 'Nueva', active: 'Activa', resolved: 'Resuelta', closed: 'Cerrada', removed: 'Eliminada',
    pending: 'Pendiente', 'in-progress': 'En progreso', completed: 'Completada',
    cancelled: 'Cancelada', overdue: 'Vencida'
  },
  priority: { low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica', urgent: 'Urgente' },
  type: {
    epic: 'Épica', feature: 'Feature', 'user-story': 'Historia',
    task: 'Tarea', bug: 'Bug', subtask: 'Subtarea'
  }
}

const DATE_FIELDS = new Set(['dueDate', 'startDate', 'date'])
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/

function userName(user: unknown, fallback = 'Usuario'): string {
  if (user && typeof user === 'object' && (user as UserRef).name) return (user as UserRef).name as string
  return fallback
}

// Registros antiguos pueden no tener autor
const creatorName = computed(() => userName(props.task?.createdBy, 'Desconocido'))

// Forma comparable de un valor, para descartar entradas antiguas que registraban
// "cambios" entre valores equivalentes (ObjectId vs string, [id] vs id, fechas).
function comparable(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return null
  if (Array.isArray(value)) {
    const items = value.map(comparable).filter(v => v !== null)
    if (items.length === 0) return null
    return items.length === 1 ? items[0] : items
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    return obj._id ? String(obj._id) : JSON.stringify(obj)
  }
  if (typeof value === 'string' && ISO_DATE.test(value)) return value.slice(0, 16)
  return String(value)
}

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(comparable(a)) === JSON.stringify(comparable(b))
}

function formatDateTime(date: Date | string | undefined): string {
  if (!date) return ''
  try {
    return format(new Date(date), "d MMM yyyy, HH:mm", { locale: es })
  } catch {
    return ''
  }
}

function formatValue(field: string, value: unknown): string {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) return '—'
  if (ENUM_LABELS[field]) return ENUM_LABELS[field][String(value)] || String(value)
  if (DATE_FIELDS.has(field)) {
    try {
      return format(new Date(value as string), 'd MMM yyyy', { locale: es })
    } catch {
      return String(value)
    }
  }
  if (field === 'estimatedHours' || field === 'actualHours') {
    return `${Number(value).toLocaleString('es', { maximumFractionDigits: 2 })}h`
  }
  if (field === 'completionPercentage') return `${value}%`
  if (Array.isArray(value)) return value.map(v => String(v)).join(', ')
  return String(value)
}

// '' si no hay nadie asignado; null si la entrada solo guarda ids (entradas antiguas).
function assigneeNames(value: unknown): string | null {
  if (value === undefined || value === null) return ''
  const list = Array.isArray(value) ? value : [value]
  if (list.length === 0) return ''
  const names = list.map(u => (u && typeof u === 'object' ? (u as UserRef).name : null) || null)
  return names.every(Boolean) ? names.join(', ') : null
}

function snippet(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

type ItemBase = Pick<TimelineItem, 'key' | 'who' | 'date'>

function describeAssignment(entry: TaskHistoryEntry, base: ItemBase): TimelineItem {
  const before = assigneeNames(entry.oldValue)
  const after = assigneeNames(entry.newValue)
  if (before === null || after === null) return { ...base, icon: UserIcon, verb: 'cambió la asignación' }
  if (!before) return { ...base, icon: UserIcon, verb: `asignó la tarea a ${after}` }
  if (!after) return { ...base, icon: UserIcon, verb: `quitó la asignación a ${before}` }
  return { ...base, icon: UserIcon, verb: 'reasignó la tarea', from: before, to: after }
}

function describeUpdate(entry: TaskHistoryEntry, base: ItemBase): TimelineItem | null {
  const field = entry.field
  if (!field || !FIELD_LABELS[field]) return null

  // Los campos pesados (descripción) se registran sin valores
  const hasValues = entry.oldValue !== undefined || entry.newValue !== undefined
  if (hasValues && sameValue(entry.oldValue, entry.newValue)) return null

  if (field === 'assignedTo') return describeAssignment(entry, base)
  if (field === 'description') return { ...base, icon: PencilSquareIcon, verb: 'actualizó la descripción' }

  const verb = `cambió ${FIELD_LABELS[field]}`
  if (VALUE_FIELDS.has(field) && hasValues) {
    return {
      ...base,
      icon: PencilSquareIcon,
      verb,
      from: formatValue(field, entry.oldValue),
      to: formatValue(field, entry.newValue)
    }
  }
  return { ...base, icon: PencilSquareIcon, verb }
}

function describe(entry: TaskHistoryEntry, index: number): TimelineItem | null {
  const base: ItemBase = {
    key: entry._id || `history-${index}`,
    who: userName(entry.changedBy),
    date: entry.changedAt
  }

  switch (entry.action) {
    case 'created':
      return { ...base, icon: PlusCircleIcon, verb: 'creó la tarea' }
    case 'moved':
      return {
        ...base,
        icon: ArrowsRightLeftIcon,
        verb: 'movió la tarea',
        from: formatValue('boardStatus', entry.oldValue),
        to: formatValue('boardStatus', entry.newValue)
      }
    case 'comment_added': {
      const quote = snippet(entry.newValue)
      return { ...base, icon: ChatBubbleLeftIcon, verb: quote ? 'comentó' : 'agregó un comentario', quote }
    }
    case 'comment_edited':
      return { ...base, icon: ChatBubbleLeftIcon, verb: 'editó un comentario', quote: snippet(entry.newValue) }
    case 'comment_deleted':
      return { ...base, icon: TrashIcon, verb: 'eliminó un comentario', quote: snippet(entry.oldValue), struck: true }
    case 'attachment_added':
      return {
        ...base,
        icon: PaperClipIcon,
        verb: entry.newValue ? `adjuntó «${entry.newValue}»` : 'adjuntó un archivo'
      }
    default:
      return describeUpdate(entry, base)
  }
}

const items = computed<TimelineItem[]>(() => {
  const history = props.task?.history || []
  const list = history
    .map(describe)
    .filter((item): item is TimelineItem => item !== null)

  // Tareas creadas antes de registrar la creación en el historial
  if (!history.some(e => e.action === 'created') && props.task?.createdAt) {
    list.push({
      key: 'created',
      icon: PlusCircleIcon,
      who: creatorName.value,
      verb: 'creó la tarea',
      date: props.task.createdAt
    })
  }

  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})
</script>

<style scoped>
/* Entrada suave de las entradas de la línea de tiempo (escalonada con transitionDelay) */
.timeline-enter-active {
  transition: opacity 300ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
.timeline-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

@media (prefers-reduced-motion: reduce) {
  .timeline-enter-active {
    transition: none;
  }
}
</style>
