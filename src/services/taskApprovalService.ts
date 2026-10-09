import { API_CONFIG } from '@/config/api'

// Autorizaciones sobre actividades y tareas del tablero.
// Solo el líder del área (o un administrador) puede ampliar la fecha de entrega
// o eliminar. Cualquier otra persona genera una solicitud que aprueba el líder
// del área a la que pertenece; el backend aplica la regla en todos los casos.

export type ApprovalKind = 'due-date-extension' | 'deletion'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type ApprovalEntityType = 'activity' | 'task'
export type ApproverSource = 'department-leader' | 'supervisor' | 'admin' | 'self-approval'

export interface ApprovalUser {
  _id: string
  name: string
  email?: string
  photo?: string | null
  department?: string | null
}

export interface TaskApprovalRequest {
  _id: string
  kind: ApprovalKind
  entityType: ApprovalEntityType
  entityId: string
  entityTitle: string
  requestedBy: ApprovalUser
  department: string | null
  currentDueDate: string | null
  requestedDueDate: string | null
  reason: string
  approvers: ApprovalUser[]
  approverSource: ApproverSource
  status: ApprovalStatus
  reviewedBy: ApprovalUser | null
  reviewedAt: string | null
  reviewComment: string
  /** Hecha por alguien con autoaprobación: no se pidió permiso, solo queda la traza */
  autoApproved?: boolean
  createdAt: string
}

/** Resumen que devuelve el backend cuando la acción quedó pendiente de aprobación */
export interface PendingApprovalSummary {
  _id: string
  kind: ApprovalKind
  status: ApprovalStatus
  currentDueDate: string | null
  requestedDueDate: string | null
  approverSource: ApproverSource
  approvers: ApprovalUser[]
}

export interface EntityApprovalState {
  canManageDirectly: boolean
  /** Por qué no necesita pedir permiso (null = debe pedirlo) */
  directAccess?: 'admin' | 'leader' | 'self-approval' | null
  approverSource: ApproverSource | null
  approverIds: string[]
  pendingExtension: TaskApprovalRequest | null
  pendingDeletion: TaskApprovalRequest | null
}

/** Evento de window con el resumen nuevo (detail: ApprovalSummary) para refrescar contadores */
export const APPROVALS_CHANGED_EVENT = 'task-approvals:changed'

export interface ApprovalSummary {
  toReview: number
  waiting: number
  canReview: boolean
}

/** Resultado de eliminar una actividad o tarea */
export interface DeleteResult {
  deleted: boolean
  approvalRequest?: PendingApprovalSummary
  /** Eliminada por alguien con autoaprobación (queda la traza) */
  autoApproved?: boolean
}

export const APPROVER_SOURCE_LABELS: Record<ApproverSource, string> = {
  'department-leader': 'el líder de tu área',
  supervisor: 'tu supervisor',
  admin: 'un administrador',
  'self-approval': 'autoaprobación'
}

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada'
}

export const APPROVAL_KIND_LABELS: Record<ApprovalKind, string> = {
  'due-date-extension': 'Ampliación de plazo',
  deletion: 'Eliminación'
}

/** A quién se le envió la solicitud, corto para avisos de una línea: nombres o, si no hay, el rol */
export function describeApprovers(summary?: { approverSource?: ApproverSource; approvers?: ApprovalUser[] } | null): string {
  if (!summary) return 'el líder de tu área'
  const names = (summary.approvers || []).map(a => a.name).filter(Boolean)
  if (names.length) return names.length > 2 ? `${names.slice(0, 2).join(', ')} y otros` : names.join(' y ')
  return (summary.approverSource && APPROVER_SOURCE_LABELS[summary.approverSource]) || 'el líder de tu área'
}

/** Evento de window para pedir que la página de Autorizaciones y el menú se recarguen */
export const APPROVALS_REFRESH_EVENT = 'task-approvals:refresh'

/** Avisar que se creó una solicitud desde otra pantalla */
export function notifyApprovalsChanged() {
  window.dispatchEvent(new Event(APPROVALS_REFRESH_EVENT))
}

class TaskApprovalService {
  private baseUrl = `${API_CONFIG.BASE_URL}/task-approvals`

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, { ...options, headers: this.getHeaders() })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.error || data?.message || `Error ${response.status}`)
    }
    return data as T
  }

  list(box: 'inbox' | 'mine', status: ApprovalStatus | 'all' = 'pending', kind?: ApprovalKind) {
    const params = new URLSearchParams({ box, status })
    if (kind) params.set('kind', kind)
    return this.request<TaskApprovalRequest[]>(`?${params.toString()}`)
  }

  /** Pendientes por aprobar (toReview), mis solicitudes en espera (waiting) y si puedo aprobar */
  async summary(): Promise<ApprovalSummary> {
    const data = await this.request<{ count?: number; mine?: number; canReview?: boolean }>('/pending-count')
    return { toReview: data.count || 0, waiting: data.mine || 0, canReview: !!data.canReview }
  }

  entityState(entityType: ApprovalEntityType, entityId: string) {
    return this.request<EntityApprovalState>(`/entity/${entityType}/${entityId}`)
  }

  requestExtension(payload: { entityType: ApprovalEntityType; entityId: string; requestedDueDate: string; reason?: string }) {
    return this.request<
      { applied: true; autoApproved?: boolean; dueDate: string; status?: string } | { applied: false; request: PendingApprovalSummary }
    >('/due-date-extension', { method: 'POST', body: JSON.stringify(payload) })
  }

  approve(id: string, comment = '') {
    return this.request<TaskApprovalRequest>(`/${id}/approve`, { method: 'POST', body: JSON.stringify({ comment }) })
  }

  reject(id: string, comment = '') {
    return this.request<TaskApprovalRequest>(`/${id}/reject`, { method: 'POST', body: JSON.stringify({ comment }) })
  }

  cancel(id: string) {
    return this.request<TaskApprovalRequest>(`/${id}/cancel`, { method: 'POST' })
  }
}

export const taskApprovalService = new TaskApprovalService()
