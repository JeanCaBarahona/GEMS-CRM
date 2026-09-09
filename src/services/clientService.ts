import { API_CONFIG } from '../config/api'

export interface ProjectExternalLink {
  _id?: string
  nombre: string
  url: string
  agregadoPor?: string
  fecha?: string
}

export interface ProjectFile {
  _id?: string
  nombre: string
  url: string
  tipo: string
  tamaño: number
  fecha_subida: string
}

export interface ProjectData {
  _id?: string
  name: string
  description?: string
  status?: 'active' | 'paused' | 'completed' | 'archived'
  color?: string
  startDate?: string
  endDate?: string
  isDefault?: boolean
  enlacesExternos?: ProjectExternalLink[]
  archivos?: ProjectFile[]
  createdAt?: string
  updatedAt?: string
}

export interface ClientData {
  _id?: string
  name: string
  email: string
  phone?: string
  company?: string
  status?: 'active' | 'inactive' | 'prospect'
  address?: string
  projects?: ProjectData[]
  createdAt?: string
  updatedAt?: string
}

class ClientService {
  private baseUrl = API_CONFIG.BASE_URL
  private endpoint = '/clients'

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }

  private async request<T>(path: string, init: RequestInit, errorMsg: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${this.endpoint}${path}`, {
      headers: this.getHeaders(),
      ...init
    })
    if (!response.ok) {
      let detail = ''
      try {
        const body = await response.json()
        detail = body?.message || ''
      } catch { /* respuesta sin cuerpo JSON */ }
      const error = new Error(detail || `${errorMsg} (HTTP ${response.status})`) as Error & { status?: number }
      error.status = response.status
      throw error
    }
    if (response.status === 204) return undefined as T
    return await response.json()
  }

  async getAll(): Promise<ClientData[]> {
    try {
      const data = await this.request<ClientData[]>('', { method: 'GET' }, 'No se pudieron cargar los clientes')
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching clients:', error)
      throw error instanceof Error ? error : new Error('No se pudieron cargar los clientes')
    }
  }

  async getById(id: string): Promise<ClientData> {
    return this.request<ClientData>(`/${id}`, { method: 'GET' }, 'No se pudo cargar el cliente')
  }

  async create(clientData: Omit<ClientData, '_id' | 'createdAt' | 'updatedAt'>): Promise<ClientData> {
    return this.request<ClientData>('', { method: 'POST', body: JSON.stringify(clientData) }, 'No se pudo crear el cliente')
  }

  async update(id: string, clientData: Partial<ClientData>): Promise<ClientData> {
    return this.request<ClientData>(`/${id}`, { method: 'PUT', body: JSON.stringify(clientData) }, 'No se pudo actualizar el cliente')
  }

  async deleteClient(id: string): Promise<void> {
    await this.request<void>(`/${id}`, { method: 'DELETE' }, 'No se pudo eliminar el cliente')
  }

  // Alternativa a borrar: conserva la trazabilidad histórica del cliente.
  async setStatus(id: string, status: 'active' | 'inactive'): Promise<ClientData> {
    return this.request<ClientData>(
      `/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, 'No se pudo actualizar el estado del cliente'
    )
  }

  async search(query: string): Promise<ClientData[]> {
    try {
      const data = await this.request<ClientData[]>(
        `/search?q=${encodeURIComponent(query)}`, { method: 'GET' }, 'No se pudo realizar la búsqueda'
      )
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error searching clients:', error)
      throw error instanceof Error ? error : new Error('No se pudo realizar la búsqueda')
    }
  }

  // ───────── Proyectos del cliente ─────────

  async getProjects(clientId: string): Promise<ProjectData[]> {
    const data = await this.request<ProjectData[]>(
      `/${clientId}/projects`, { method: 'GET' }, 'No se pudieron cargar los proyectos'
    )
    return Array.isArray(data) ? data : []
  }

  async createProject(clientId: string, project: Omit<ProjectData, '_id'>): Promise<ProjectData> {
    return this.request<ProjectData>(
      `/${clientId}/projects`, { method: 'POST', body: JSON.stringify(project) }, 'No se pudo crear el proyecto'
    )
  }

  async updateProject(clientId: string, projectId: string, project: Partial<ProjectData>): Promise<ProjectData> {
    return this.request<ProjectData>(
      `/${clientId}/projects/${projectId}`, { method: 'PUT', body: JSON.stringify(project) }, 'No se pudo actualizar el proyecto'
    )
  }

  async deleteProject(clientId: string, projectId: string): Promise<{ success: boolean; archived: boolean; message?: string }> {
    return this.request(
      `/${clientId}/projects/${projectId}`, { method: 'DELETE' }, 'No se pudo eliminar el proyecto'
    )
  }

  // ───────── Enlaces externos y adjuntos del proyecto ─────────

  async addProjectLink(clientId: string, projectId: string, link: { nombre: string; url: string }): Promise<ProjectExternalLink> {
    return this.request(
      `/${clientId}/projects/${projectId}/links`, { method: 'POST', body: JSON.stringify(link) }, 'No se pudo agregar el enlace'
    )
  }

  async removeProjectLink(clientId: string, projectId: string, linkId: string): Promise<void> {
    await this.request(
      `/${clientId}/projects/${projectId}/links/${linkId}`, { method: 'DELETE' }, 'No se pudo eliminar el enlace'
    )
  }

  async uploadProjectFiles(clientId: string, projectId: string, files: File[]): Promise<ProjectFile[]> {
    const formData = new FormData()
    files.forEach(f => formData.append('archivos', f))
    const token = localStorage.getItem('token')
    const response = await fetch(`${this.baseUrl}${this.endpoint}/${clientId}/projects/${projectId}/files`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData
    })
    if (!response.ok) throw new Error('No se pudieron subir los archivos')
    return await response.json()
  }

  async removeProjectFile(clientId: string, projectId: string, fileId: string): Promise<void> {
    await this.request(
      `/${clientId}/projects/${projectId}/files/${fileId}`, { method: 'DELETE' }, 'No se pudo eliminar el archivo'
    )
  }
}

export const clientService = new ClientService()
