import { API_CONFIG } from '../config/api'

export interface CaseFile {
  nombre: string
  url: string
  tipo: string
  tamaño: number
  fecha_subida: Date
}

export interface CaseComment {
  _id?: string
  autor: string
  comentario: string
  fecha: Date
  tipo: 'comentario' | 'actualizacion' | 'resolucion'
}

export interface CaseMilestone {
  nombre: string
  descripcion: string
  fecha_objetivo: Date
  fecha_completado?: Date
  completado: boolean
}

export interface CaseDailyLog {
  _id?: string
  fecha: Date
  autor: string
  que_se_hizo: string
  bloqueos: string
  siguientes_pasos: string
  sentimiento: '😊' | '😐' | '😟' | '🔥'
}

export interface Case {
  _id?: string
  titulo: string
  descripcion: string
  tipo: 'documento' | 'incidencia' | 'seguimiento'
  estado: 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado'
  prioridad: 'baja' | 'media' | 'alta' | 'critica'
  cliente_id?: string
  asignado_a?: string
  archivos: CaseFile[]
  fecha_limite?: Date
  fecha_resolucion?: Date
  comentarios: CaseComment[]
  tags: string[]
  categoria?: string
  gravedad?: 'menor' | 'moderada' | 'mayor' | 'critica'
  impacto?: 'bajo' | 'medio' | 'alto'
  progreso: number
  hitos: CaseMilestone[]
  wikiContent?: string
  metodologia?: string
  dailyLogs: CaseDailyLog[]
  createdAt: Date
  updatedAt: Date
}

export interface CaseFilters {
  tipo?: string
  estado?: string
  prioridad?: string
  cliente_id?: string
  asignado_a?: string
  categoria?: string
  page?: number
  limit?: number
}

export interface CaseStats {
  by_type: Array<{
    _id: string
    total: number
    abiertos: number
    en_progreso: number
    resueltos: number
    cerrados: number
  }>
  by_priority: Array<{
    _id: string
    count: number
  }>
}

class CasesService {
  private apiUrl = `${API_CONFIG.BASE_URL}/cases`

  // Obtener todos los casos con filtros
  async getAllCases(filters: CaseFilters = {}): Promise<{ cases: Case[], pagination: any }> {
    const queryParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString())
      }
    })
    
    const url = queryParams.toString() ? `${this.apiUrl}?${queryParams}` : this.apiUrl
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Error al obtener los casos')
    }
    return await response.json()
  }

  // Alias para compatibilidad
  async getAll(filters: CaseFilters = {}): Promise<Case[]> {
    const result = await this.getAllCases(filters)
    return result.cases || []
  }

  // Obtener caso por ID
  async getCaseById(id: string): Promise<Case> {
    const response = await fetch(`${this.apiUrl}/${id}`)
    if (!response.ok) {
      throw new Error('Error al obtener el caso')
    }
    return await response.json()
  }

  // Crear nuevo caso
  async createCase(caseData: Partial<Case>): Promise<Case> {
    const formData = new FormData()
    
    Object.entries(caseData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Si es un array (como tags), agregamos cada uno
          value.forEach(v => formData.append(`${key}[]`, v))
        } else {
          formData.append(key, value as string)
        }
      }
    })

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      body: formData,
      // No establecer Content-Type header para FormData, el navegador lo hará con el boundary correcto
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Error al crear el caso')
    }
    return await response.json()
  }

  // Actualizar caso
  async updateCase(id: string, caseData: Partial<Case>): Promise<Case> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(caseData),
    })
    
    if (!response.ok) {
      throw new Error('Error al actualizar el caso')
    }
    return await response.json()
  }

  // Eliminar caso
  async deleteCase(id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Error al eliminar el caso')
    }
  }

  // Alias para compatibilidad con el formulario
  async create(formData: FormData): Promise<Case> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error('Error al crear el caso')
    }
    return await response.json()
  }

  async update(id: string, formData: FormData): Promise<Case> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'PUT',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error('Error al actualizar el caso')
    }
    return await response.json()
  }

  // Subir archivos a un caso
  async uploadFiles(caseId: string, files: FileList): Promise<{ message: string, files: CaseFile[] }> {
    const formData = new FormData()
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }
    
    const response = await fetch(`${this.apiUrl}/${caseId}/upload`, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error('Error al subir los archivos')
    }
    return await response.json()
  }

  // Eliminar archivo de un caso
  async deleteFile(caseId: string, fileIndex: number): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${caseId}/files/${fileIndex}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Error al eliminar el archivo')
    }
  }

  // Agregar comentario
  async addComment(caseId: string, comment: Partial<CaseComment>): Promise<CaseComment> {
    const response = await fetch(`${this.apiUrl}/${caseId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comment),
    })
    
    if (!response.ok) {
      throw new Error('Error al agregar el comentario')
    }
    return await response.json()
  }

  // Actualizar progreso
  async updateProgress(caseId: string, progreso: number): Promise<Case> {
    const response = await fetch(`${this.apiUrl}/${caseId}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ progreso }),
    })
    
    if (!response.ok) {
      throw new Error('Error al actualizar el progreso')
    }
    return await response.json()
  }

  // Agregar hito
  async addMilestone(caseId: string, milestone: Partial<CaseMilestone>): Promise<Case> {
    const response = await fetch(`${this.apiUrl}/${caseId}/milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(milestone),
    })
    
    if (!response.ok) {
      throw new Error('Error al agregar el hito')
    }
    return await response.json()
  }

  // Completar hito
  async completeMilestone(caseId: string, milestoneIndex: number): Promise<Case> {
    const response = await fetch(`${this.apiUrl}/${caseId}/milestones/${milestoneIndex}/complete`, {
      method: 'PUT',
    })
    
    if (!response.ok) {
      throw new Error('Error al completar el hito')
    }
    return await response.json()
  }

  // Obtener estadísticas
  async getStats(): Promise<CaseStats> {
    const response = await fetch(`${this.apiUrl}/stats/summary`)
    if (!response.ok) {
      throw new Error('Error al obtener las estadísticas')
    }
    return await response.json()
  }

  // Utilidades
  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf': return 'fas fa-file-pdf text-red-500'
      case 'doc':
      case 'docx': return 'fas fa-file-word text-blue-500'
      case 'xls':
      case 'xlsx': return 'fas fa-file-excel text-green-500'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'fas fa-file-image text-purple-500'
      case 'zip':
      case 'rar': return 'fas fa-file-archive text-yellow-500'
      case 'txt': return 'fas fa-file-alt text-gray-500'
      default: return 'fas fa-file text-gray-400'
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  getPriorityColor(prioridad: string): string {
    switch (prioridad) {
      case 'baja': return 'text-green-600 bg-green-100'
      case 'media': return 'text-yellow-600 bg-yellow-100'
      case 'alta': return 'text-orange-600 bg-orange-100'
      case 'critica': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'abierto': return 'text-blue-600 bg-blue-100'
      case 'en_progreso': return 'text-yellow-600 bg-yellow-100'
      case 'resuelto': return 'text-green-600 bg-green-100'
      case 'cerrado': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }
}

export const casesService = new CasesService()
