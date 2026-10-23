import { API_CONFIG } from '../config/api'
import type { DeleteResult } from './taskApprovalService'

export interface ActivityData {
  _id?: string
  title: string
  description: string
  date: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'overdue'
  clientId: string
  projectId?: string | null
  assignedTo?: string[]
  assignedToUser?: {
    _id: string
    name: string
    email: string
    role: string
  }
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  // Fecha de entrega pactada: una vez puesta solo la cambia el líder del área o un admin
  dueDate?: string
  // Fecha real en que se terminó (se pone sola al completar)
  endDate?: string | null
  // Etiquetas libres (sprint, etc.), en minúsculas
  tags?: string[]
  estimatedTime?: string
  taskId?: string // ✅ ID de la tarea del board asociada
  completionPercentage?: number
  timeSpent?: number
  activeSessions?: Array<{ userId: string, startTime: string }>
  createdBy?: string
  createdByUser?: {
    _id: string
    name: string
    email: string
  }
  createdAt?: string
  updatedAt?: string
  type?: ActivityType
  // Feature (otra actividad de type 'feature' del mismo proyecto) a la que pertenece
  featureId?: string | null
  acceptanceCriteria?: string
  environment?: ActivityEnvironment | null
  attachments?: ActivityAttachment[]
  // Tareas recurrentes: un registro por persona y por día ("+" diario)
  dailyLog?: Array<{ _id?: string; date: string; userId: string; at?: string }>
}

export type ActivityType = 'task' | 'bug' | 'feature' | 'user-story' | 'recurring'
export type ActivityEnvironment = 'development' | 'testing' | 'production'

export interface ActivityAttachment {
  _id: string
  // link: enlace externo; image: captura guardada en la base (url = data URL);
  // file: documento (PDF, Word, Excel) en la base si trae fileId — se descarga
  // con openAttachmentFile; sin fileId, un archivo antiguo con url al disco
  kind?: 'link' | 'image' | 'file'
  name: string
  url: string
  fileId?: string | null
  mimetype?: string
  size?: number
  uploadedBy?: { _id: string; name: string } | string
  uploadedAt?: string
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  task: 'Tarea',
  bug: 'Bug / Error',
  feature: 'Feature',
  'user-story': 'Historia de Usuario',
  recurring: 'Recurrente (diaria)'
}

// Fecha de hoy en Costa Rica (misma clave que usa el backend para el registro diario)
export function todayKeyCR(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Costa_Rica' })
}

export const ENVIRONMENT_LABELS: Record<ActivityEnvironment, string> = {
  development: 'En Desarrollo',
  testing: 'Prueba',
  production: 'Producción'
}

export interface ActivityWithClient extends ActivityData {
  client?: {
    _id: string
    name: string
    email: string
    company?: string
  }
}

class ActivityService {
  private baseUrl = API_CONFIG.BASE_URL
  private endpoint = '/activities'

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  }

  async getAll(): Promise<ActivityData[]> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching activities:', error)
      throw new Error('No se pudieron cargar las actividades')
    }
  }

  async getById(id: string): Promise<ActivityData> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching activity:', error)
      throw new Error('No se pudo cargar la actividad')
    }
  }

  async create(activityData: Omit<ActivityData, '_id' | 'createdAt' | 'updatedAt'>): Promise<ActivityData> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(activityData),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating activity:', error)
      throw new Error('No se pudo crear la actividad')
    }
  }

  // Cambiar una fecha de entrega ya pactada sin ser líder ni admin da 403.
  // Con autoaprobación la respuesta trae `dueDateAutoApproved`.
  async update(id: string, activityData: Partial<ActivityData> & { dueDateChangeReason?: string }): Promise<ActivityData & { dueDateAutoApproved?: boolean }> {
    const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(activityData),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      console.error('Error updating activity:', data)
      throw new Error(data?.error || 'No se pudo actualizar la actividad')
    }
    return data
  }

  // Solo el líder del área, un administrador o quien tiene autoaprobación puede
  // eliminar (403 para el resto). Lo eliminado queda en la papelera.
  async deleteActivity(id: string, reason?: string): Promise<DeleteResult> {
    const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify(reason ? { reason } : {}),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      console.error('Error deleting activity:', data)
      throw new Error(data?.error || 'No se pudo eliminar la actividad')
    }
    if (response.status === 202 && data?.pendingApproval) {
      return { deleted: false, approvalRequest: data.approvalRequest }
    }
    return { deleted: true, autoApproved: !!data?.autoApproved }
  }

  // Métodos específicos para asignaciones
  async getByAssignedUser(userId: string): Promise<ActivityData[]> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/assigned/${userId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching assigned activities:', error)
      throw new Error('No se pudieron cargar las actividades asignadas')
    }
  }

  async getWithFilters(filters: { assignedTo?: string, status?: string, projectId?: string, type?: ActivityType }): Promise<ActivityData[]> {
    try {
      const params = new URLSearchParams()
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo)
      if (filters.status) params.append('status', filters.status)
      if (filters.projectId) params.append('projectId', filters.projectId)
      if (filters.type) params.append('type', filters.type)

      const response = await fetch(`${this.baseUrl}${this.endpoint}?${params.toString()}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching filtered activities:', error)
      throw new Error('No se pudieron cargar las actividades filtradas')
    }
  }

  async updateStatus(id: string, status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'overdue'): Promise<ActivityData> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/status`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating activity status:', error)
      throw new Error('No se pudo actualizar el estado de la actividad')
    }
  }

  async reassignActivity(id: string, assignedTo: string | null): Promise<ActivityData> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/assign`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ assignedTo }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error reassigning activity:', error)
      throw new Error('No se pudo reasignar la actividad')
    }
  }

  async updateProgress(id: string, completionPercentage: number): Promise<ActivityData> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/progress`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ completionPercentage }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating activity progress:', error)
      throw new Error('No se pudo actualizar el progreso de la actividad')
    }
  }

  async toggleTimer(id: string, action: 'start' | 'stop' | 'add_manual', userId: string, minutes?: number): Promise<ActivityData> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/timer`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ action, userId, minutes }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error toggling activity timer:', error)
      throw new Error('No se pudo actualizar el temporizador de la actividad')
    }
  }

  async addComment(id: string, text: string, images?: File[]): Promise<any> {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('text', text)
    if (images && images.length > 0) {
      images.forEach(img => formData.append('images', img))
    }
    const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/comments`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}: ${errText}`)
    }
    return response.json()
  }

  // Features de un proyecto (para el selector "Feature" del modal y el Backlog)
  // Etiquetas ya usadas en la organización (para sugerirlas y filtrar)
  async getTags(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}${this.endpoint}/tags`, { headers: this.getHeaders() })
    if (!response.ok) throw new Error(`No se pudieron cargar las etiquetas (HTTP ${response.status})`)
    const data = await response.json()
    return Array.isArray(data) ? data : []
  }

  async getFeatures(projectId: string): Promise<ActivityData[]> {
    return this.getWithFilters({ projectId, type: 'feature' })
  }

  // Adjuntos: enlace externo o captura (data URL ya comprimida en el navegador)
  async addAttachment(
    id: string,
    attachment: { kind: 'link'; url: string; name?: string } | { kind: 'image'; dataUrl: string; name?: string }
  ): Promise<ActivityData> {
    const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/attachments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(attachment),
    })
    if (!response.ok) {
      const body = await response.json().catch(() => null)
      throw new Error(body?.error || `No se pudo agregar el adjunto (HTTP ${response.status})`)
    }
    return response.json()
  }

  // "+" del día en una tarea recurrente (pulsarlo otra vez el mismo día lo deshace)
  async dailyCheck(id: string): Promise<ActivityData> {
    const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/daily-check`, {
      method: 'POST',
      headers: this.getHeaders(),
    })
    if (!response.ok) {
      const body = await response.json().catch(() => null)
      throw new Error(body?.error || `No se pudo registrar el día (HTTP ${response.status})`)
    }
    return response.json()
  }

  // Documento PDF, Word o Excel (máx. 5 MB): se guarda en la base
  async uploadAttachmentFile(id: string, file: File): Promise<ActivityData> {
    const token = localStorage.getItem('token')
    const body = new FormData()
    body.append('file', file)
    const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/attachments/file`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body,
    })
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.error || `No se pudo subir el archivo (HTTP ${response.status})`)
    }
    return response.json()
  }

  // El documento necesita el token, así que se baja como blob y se abre en otra pestaña
  async openAttachmentFile(id: string, attachment: ActivityAttachment): Promise<void> {
    // La pestaña se abre antes del fetch para que el navegador no la bloquee
    const tab = window.open('', '_blank')
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/attachments/${attachment._id}/file`, {
        headers: this.getHeaders(),
      })
      if (!response.ok) throw new Error(`No se pudo abrir el archivo (HTTP ${response.status})`)
      const url = URL.createObjectURL(await response.blob())
      // PDF se ve en el navegador; Word y Excel se descargan con su nombre
      if (tab && (attachment.mimetype || '').includes('pdf')) {
        tab.location.href = url
      } else {
        tab?.close()
        const link = document.createElement('a')
        link.href = url
        link.download = attachment.name
        link.click()
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (error) {
      tab?.close()
      throw error
    }
  }

  async deleteAttachment(id: string, attachmentId: string): Promise<ActivityData> {
    const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    if (!response.ok) {
      const body = await response.json().catch(() => null)
      throw new Error(body?.error || `No se pudo eliminar el adjunto (HTTP ${response.status})`)
    }
    return response.json()
  }
}

export const activityService = new ActivityService()
