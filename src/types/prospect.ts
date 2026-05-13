export type ProspectStatus =
  | 'nuevo'
  | 'calificado'
  | 'propuesta'
  | 'seguimiento'
  | 'ganado'
  | 'perdido'

export type ProspectSource =
  | 'web'
  | 'whatsapp'
  | 'referido'
  | 'linkedin'
  | 'evento'
  | 'cold'
  | 'otro'

export interface ProspectMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string | number
  hasImages?: boolean
}

export interface ProspectNote {
  id: string
  content: string
  author?: string
  createdAt: string
}

export interface ProspectTask {
  id: string
  title: string
  dueDate?: string
  done: boolean
  createdAt: string
  doneAt?: string
}

export type TimelineEventType =
  | 'created'
  | 'status'
  | 'outreach_email'
  | 'outreach_whatsapp'
  | 'outreach_call'
  | 'note'
  | 'task_created'
  | 'task_completed'
  | 'converted'
  | 'ai_summary'
  | 'ai_action'

export interface ProspectTimelineEntry {
  id: string
  type: TimelineEventType
  description: string
  meta?: Record<string, any>
  createdAt: string
}

export interface Prospect {
  _id: string
  prospectName: string
  company?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  status?: ProspectStatus
  estimatedValue?: number
  source?: ProspectSource
  ownerId?: string
  messages: ProspectMessage[]
  lastUpdated?: string | number
  createdAt?: string | number
}

export const PROSPECT_STATUSES: { value: ProspectStatus; label: string; color: string; icon: string; probability: number }[] = [
  { value: 'nuevo',       label: 'Nuevo',       color: 'bg-blue-100 text-blue-700 border-blue-200',         icon: 'fa-sparkles',     probability: 10 },
  { value: 'calificado',  label: 'Calificado',  color: 'bg-amber-100 text-amber-700 border-amber-200',      icon: 'fa-fire',         probability: 30 },
  { value: 'propuesta',   label: 'Propuesta',   color: 'bg-violet-100 text-violet-700 border-violet-200',   icon: 'fa-paper-plane',  probability: 60 },
  { value: 'seguimiento', label: 'Seguimiento', color: 'bg-cyan-100 text-cyan-700 border-cyan-200',         icon: 'fa-comments',     probability: 75 },
  { value: 'ganado',      label: 'Ganado',      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',icon: 'fa-trophy',       probability: 100 },
  { value: 'perdido',     label: 'Perdido',     color: 'bg-rose-100 text-rose-700 border-rose-200',         icon: 'fa-circle-xmark', probability: 0 },
]

export const PROSPECT_SOURCES: { value: ProspectSource; label: string; icon: string }[] = [
  { value: 'web',       label: 'Web',       icon: 'fa-globe' },
  { value: 'whatsapp',  label: 'WhatsApp',  icon: 'fa-comment-dots' },
  { value: 'referido',  label: 'Referido',  icon: 'fa-user-plus' },
  { value: 'linkedin',  label: 'LinkedIn',  icon: 'fa-linkedin' },
  { value: 'evento',    label: 'Evento',    icon: 'fa-calendar-day' },
  { value: 'cold',      label: 'Cold call', icon: 'fa-snowflake' },
  { value: 'otro',      label: 'Otro',      icon: 'fa-circle-dot' },
]

/** Probabilidad de cierre por status (Pipedrive-style) */
export const probabilityFor = (status?: ProspectStatus): number =>
  PROSPECT_STATUSES.find((s) => s.value === status)?.probability ?? 10

/** Forecast ponderado = sum(value × probabilidad) */
export const forecastValue = (prospects: Prospect[]): number =>
  prospects.reduce((sum, p) => {
    const v = p.estimatedValue || 0
    return sum + (v * probabilityFor(p.status)) / 100
  }, 0)
