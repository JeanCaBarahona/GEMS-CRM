import { API_CONFIG } from '../config/api'

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
  dueDate?: string
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
  // file: archivos subidos al disco antes de pasar a solo enlaces/capturas
  kind?: 'link' | 'image' | 'file'
  name: string
  url: string
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

  async update(id: string, activityData: Partial<ActivityData>): Promise<ActivityData> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(activityData),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating activity:', error)
      throw new Error('No se pudo actualizar la actividad')
    }
  }

  async deleteActivity(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error deleting activity:', error)
      throw new Error('No se pudo eliminar la actividad')
    }
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
