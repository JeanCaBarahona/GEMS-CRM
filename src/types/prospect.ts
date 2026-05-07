export type ProspectStatus =
  | 'nuevo'
  | 'calificado'
  | 'propuesta'
  | 'seguimiento'
  | 'ganado'
  | 'perdido'

export interface ProspectMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string | number
  hasImages?: boolean
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
  source?: string
  messages: ProspectMessage[]
  lastUpdated?: string | number
  createdAt?: string | number
}

export const PROSPECT_STATUSES: { value: ProspectStatus; label: string; color: string; icon: string }[] = [
  { value: 'nuevo', label: 'Nuevo', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'fa-sparkles' },
  { value: 'calificado', label: 'Calificado', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: 'fa-fire' },
  { value: 'propuesta', label: 'Propuesta', color: 'bg-violet-100 text-violet-700 border-violet-200', icon: 'fa-paper-plane' },
  { value: 'seguimiento', label: 'Seguimiento', color: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: 'fa-comments' },
  { value: 'ganado', label: 'Ganado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: 'fa-trophy' },
  { value: 'perdido', label: 'Perdido', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: 'fa-circle-xmark' },
]
