import { API_CONFIG } from '../config/api'

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
  createdAt?: Date
  updatedAt?: Date
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

  async create(data: Partial<WikiArticle>): Promise<WikiArticle> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Error al crear el artículo')
    return await response.json()
  }

  async update(id: string, data: Partial<WikiArticle>): Promise<WikiArticle> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Error al actualizar el artículo')
    return await response.json()
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Error al eliminar el artículo')
  }
}

export const wikiService = new WikiService()
