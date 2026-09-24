import axios from 'axios'
import { API_CONFIG } from '@/config/api'

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface AvatarData {
  id: string
  name: string
  path: string
}

export interface AvatarStats {
  [key: string]: number
}

export interface AvatarResponse {
  success: boolean
  data?: {
    avatars?: string[]
    default?: string
    avatar?: string | null
    photo?: string | null
    user?: any
    stats?: AvatarStats
  }
  message?: string
}

/**
 * Servicio para gestión de avatares de usuario
 */
export class AvatarService {
  /**
   * Obtiene la lista de avatares disponibles
   */
  static async getAvailableAvatars(): Promise<string[]> {
    try {
      const response = await apiClient.get('/avatars')
      if (response.data.success && response.data.data?.avatars) {
        return response.data.data.avatars
      }
      throw new Error('Error obteniendo avatares disponibles')
    } catch (error) {
      console.error('Error getting available avatars:', error)
      throw error
    }
  }

  /**
   * Obtiene el avatar por defecto
   */
  static async getDefaultAvatar(): Promise<string> {
    try {
      const response = await apiClient.get('/avatars')
      if (response.data.success && response.data.data?.default) {
        return response.data.data.default
      }
      return 'ruby' // fallback
    } catch (error) {
      console.error('Error getting default avatar:', error)
      return 'ruby'
    }
  }

  /**
   * Obtiene el avatar actual del usuario
   */
  static async getUserAvatar(): Promise<{ avatar: string | null, photo: string | null }> {
    try {
      const response = await apiClient.get('/avatars/user')
      if (response.data.success) {
        return {
          avatar: response.data.data?.avatar || null,
          photo: response.data.data?.photo || null
        }
      }
      return { avatar: null, photo: null }
    } catch (error) {
      console.error('Error getting user avatar:', error)
      return { avatar: null, photo: null }
    }
  }

  /**
   * Actualiza el avatar del usuario
   */
  static async updateUserAvatar(avatarId: string | null): Promise<AvatarResponse> {
    try {
      const response = await apiClient.put('/avatars/user', {
        avatar: avatarId
      })
      return response.data
    } catch (error) {
      console.error('Error updating user avatar:', error)
      throw error
    }
  }

  /**
   * Remueve el avatar del usuario (vuelve al por defecto)
   */
  static async removeUserAvatar(): Promise<AvatarResponse> {
    try {
      const response = await apiClient.delete('/avatars/user')
      return response.data
    } catch (error) {
      console.error('Error removing user avatar:', error)
      throw error
    }
  }
  
  /**
   * Guarda la foto de perfil ya recortada en el editor (data URL, queda en la BD)
   */
  static async saveProfilePhoto(dataUrl: string): Promise<AvatarResponse> {
    const response = await apiClient.put('/avatars/photo', { dataUrl })
    return response.data
  }

  /**
   * Sube una foto de perfil personalizada
   */
  static async uploadProfilePhoto(file: File): Promise<AvatarResponse> {
    try {
      const formData = new FormData()
      formData.append('photo', file)
      
      const response = await apiClient.post('/avatars/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error uploading profile photo:', error)
      throw error
    }
  }
  
  /**
   * Elimina la foto de perfil personalizada del usuario
   */
  static async removeProfilePhoto(): Promise<AvatarResponse> {
    try {
      const response = await apiClient.delete('/avatars/photo')
      return response.data
    } catch (error) {
      console.error('Error removing profile photo:', error)
      throw error
    }
  }

  /**
   * Obtiene estadísticas de uso de avatares (solo admin)
   */
  static async getAvatarStats(): Promise<AvatarStats> {
    try {
      const response = await apiClient.get('/avatars/stats')
      if (response.data.success && response.data.data?.stats) {
        return response.data.data.stats
      }
      return {}
    } catch (error) {
      console.error('Error getting avatar stats:', error)
      return {}
    }
  }
}