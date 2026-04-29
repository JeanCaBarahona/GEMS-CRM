import { API_CONFIG, ENDPOINTS } from '../config/api'
import type { TeamMember } from '../types'

class TeamService {
  private baseUrl = `${API_CONFIG.BASE_URL}${ENDPOINTS.TEAM}`

  async getAll(): Promise<TeamMember[]> {
    try {
      const token = localStorage.getItem('token')
      console.log('🔄 Haciendo petición a:', this.baseUrl)
      console.log('🔑 Token presente:', !!token)
      
      const response = await fetch(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('📦 Response data:', result)
      
      // El backend devuelve { success: true, data: [...] }
      const members = result.success && Array.isArray(result.data) ? result.data : []
      console.log('👥 Team members parsed:', members)
      return members
    } catch (error) {
      console.error('❌ Error fetching team members:', error)
      throw new Error('No se pudieron cargar los miembros del equipo')
    }
  }

  async getActiveMembers(): Promise<TeamMember[]> {
    try {
      const allMembers = await this.getAll()
      return allMembers.filter(member => {
        const isClient = member.role?.toLowerCase().includes('client') || 
                        member.role?.toLowerCase().includes('cliente')
        return member.isActive && !isClient
      })
    } catch (error) {
      console.error('Error fetching active team members:', error)
      throw new Error('No se pudieron cargar los miembros activos del equipo')
    }
  }

  async getById(id: string): Promise<TeamMember> {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const result = await response.json()
      return result.success ? result.data : result
    } catch (error) {
      console.error('Error fetching team member:', error)
      throw new Error('No se pudo cargar el miembro del equipo')
    }
  }

  async create(member: Omit<TeamMember, '_id' | 'createdAt' | 'updatedAt'>): Promise<TeamMember> {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(member),
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const result = await response.json()
      return result.success ? result.data : result
    } catch (error) {
      console.error('Error creating team member:', error)
      throw error
    }
  }

  async update(id: string, member: Partial<TeamMember>): Promise<TeamMember> {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(member),
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const result = await response.json()
      return result.success ? result.data : result
    } catch (error) {
      console.error('Error updating team member:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error deleting team member:', error)
      throw error
    }
  }
}

export const teamService = new TeamService()
