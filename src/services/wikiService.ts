import { API_CONFIG } from '../config/api'

export interface WikiExternalLink {
  _id?: string
  nombre: string
  url: string
  agregadoPor?: string
  fecha?: Date
}

export interface WikiArticle {
  _id?: string
  titulo: string
  categoria: 'proceso' | 'codigo' | 'manual' | 'otros'
  contenido: string
  descripcion: string
  tags: string[]
  autor?: {
    _id: string
    name: string
    email: string
  }
  archivos?: Array<{
    nombre: string
    url: string
    tipo: string
  }>
  vistas?: number
  linkedTickets?: any[]
  linkedTasks?: any[]
  linkedActivities?: any[]
  enlacesExternos?: WikiExternalLink[]
  spreadsheet?: unknown
  createdAt?: Date
  updatedAt?: Date
}

// Forma que aceptan create/update: igual a WikiArticle pero `archivos` también
// admite File[] (adjuntos aún no subidos, distinguidos en runtime con `instanceof File`).
export type WikiArticleInput = Partial<Omit<WikiArticle, 'archivos'>> & {
  archivos?: Array<{ nombre: string; url: string; tipo: string } | File>
}

class WikiService {
  private apiUrl = `${API_CONFIG.BASE_URL}/wiki`

  async getAll(filters: { categoria?: string, search?: string } = {}): Promise<WikiArticle[]> {
    const queryParams = new URLSearchParams()
    if (filters.categoria) queryParams.append('categoria', filters.categoria)
    if (filters.search) queryParams.append('search', filters.search)
    
    const response = await fetch(`${this.apiUrl}?${queryParams}`)
    if (!response.ok) throw new Error('Error al obtener la wiki')
    return await response.json()
  }

  async getById(id: string): Promise<WikiArticle> {
    const response = await fetch(`${this.apiUrl}/${id}`)
    if (!response.ok) throw new Error('Error al obtener el artículo')
    return await response.json()
  }

  async create(data: WikiArticleInput): Promise<WikiArticle> {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      
      if (key === 'archivos' && Array.isArray(value)) {
        value.forEach(v => {
          if (v instanceof File || v instanceof Blob) formData.append('archivos', v)
        })
      } else if (key === 'autor' && typeof value === 'object') {
        if ((value as any)._id) formData.append('autor', (value as any)._id)
      } else if (Array.isArray(value)) {
        value.forEach(v => formData.append(key, v))
      } else if (typeof value !== 'object' || value instanceof File || value instanceof Blob) {
        formData.append(key, value as any)
      }
    })

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) throw new Error('Error al crear artículo')
    return await response.json()
  }

  async update(id: string, data: WikiArticleInput): Promise<WikiArticle> {
    // Campos gestionados por el servidor o por endpoints dedicados — no se envían al actualizar
    const SKIP_FIELDS = new Set([
      '_id', 'autor', 'linkedTickets', 'linkedTasks', 'linkedActivities',
      'enlacesExternos', 'spreadsheet', 'vistas', 'createdAt', 'updatedAt'
    ])

    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      if (SKIP_FIELDS.has(key)) return

      if (key === 'archivos' && Array.isArray(value)) {
        value.forEach(v => {
          if (v instanceof File || v instanceof Blob) formData.append('archivos', v)
        })
      } else if (Array.isArray(value)) {
        value.forEach(v => {
          if (v instanceof File || v instanceof Blob) {
            formData.append(key, v)
          } else if (typeof v === 'object' && v !== null) {
            formData.append(key, (v as any)._id ?? '')
          } else {
            formData.append(key, String(v))
          }
        })
      } else if (typeof value !== 'object' || value instanceof File || value instanceof Blob) {
        formData.append(key, value as any)
      }
    })

    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'PUT',
      body: formData,
    })

    if (!response.ok) throw new Error('Error al actualizar artículo')
    return await response.json()
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Error al eliminar el artículo')
  }

  // Vincular ticket
  async linkTicket(wikiId: string, ticketId: string): Promise<WikiArticle> {
    const response = await fetch(`${this.apiUrl}/${wikiId}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId })
    })
    if (!response.ok) throw new Error('Error al vincular el ticket')
    return await response.json()
  }

  // Desvincular ticket
  async unlinkTicket(wikiId: string, ticketId: string): Promise<WikiArticle> {
    const response = await fetch(`${this.apiUrl}/${wikiId}/tickets/${ticketId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Error al desvincular el ticket')
    return await response.json()
  }

  // Vincular / desvincular tarea
  async linkTask(wikiId: string, taskId: string): Promise<WikiArticle> {
    const response = await fetch(`${this.apiUrl}/${wikiId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId })
    })
    if (!response.ok) throw new Error('Error al vincular la tarea')
    return await response.json()
  }

  async unlinkTask(wikiId: string, taskId: string): Promise<WikiArticle> {
    const response = await fetch(`${this.apiUrl}/${wikiId}/tasks/${taskId}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Error al desvincular la tarea')
    return await response.json()
  }

  // Vincular / desvincular actividad
  async linkActivity(wikiId: string, activityId: string): Promise<WikiArticle> {
    const response = await fetch(`${this.apiUrl}/${wikiId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityId })
    })
    if (!response.ok) throw new Error('Error al vincular la actividad')
    return await response.json()
  }

  async unlinkActivity(wikiId: string, activityId: string): Promise<WikiArticle> {
    const response = await fetch(`${this.apiUrl}/${wikiId}/activities/${activityId}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Error al desvincular la actividad')
    return await response.json()
  }

  // Enlaces externos (Google Drive, OneDrive, etc.)
  async addExternalLink(wikiId: string, link: { nombre: string; url: string }): Promise<WikiExternalLink> {
    const response = await fetch(`${this.apiUrl}/${wikiId}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link)
    })
    if (!response.ok) throw new Error('Error al agregar el enlace')
    return await response.json()
  }

  async removeExternalLink(wikiId: string, linkId: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${wikiId}/links/${linkId}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Error al eliminar el enlace')
  }

  // Hoja de cálculo embebida
  async getSpreadsheet(wikiId: string): Promise<unknown> {
    const response = await fetch(`${this.apiUrl}/${wikiId}/spreadsheet`)
    if (!response.ok) throw new Error('Error al obtener la hoja de cálculo')
    const data = await response.json()
    return data.spreadsheet
  }

  async saveSpreadsheet(wikiId: string, snapshot: unknown): Promise<{ success: boolean; updatedAt: string }> {
    const response = await fetch(`${this.apiUrl}/${wikiId}/spreadsheet`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshot })
    })
    if (!response.ok) throw new Error('Error al guardar la hoja de cálculo')
    return await response.json()
  }
}

export const wikiService = new WikiService()
