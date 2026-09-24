import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'
import { API_CONFIG } from '../config/api'

const API_URL = API_CONFIG.BASE_URL.replace('/api', '')

export interface BoardColumn {
  id: string
  name: string
  wipLimit?: number
  order: number
}

export interface Sprint {
  _id: string
  name: string
  goal: string
  startDate: Date
  endDate: Date
  status: 'planned' | 'active' | 'completed'
  velocity?: number
  completedStoryPoints?: number
}

export interface BoardMember {
  userId?: {
    _id: string
    name: string
    email: string
    photo?: string
  }
  // Soporte para formato alternativo
  user?: {
    _id: string
    name: string
    email: string
    photo?: string
  }
  role: 'owner' | 'admin' | 'member' | 'viewer'
  addedAt: Date
}

export interface Board {
  _id: string
  name: string
  description: string
  type: 'kanban' | 'scrum' | 'custom'
  columns: BoardColumn[]
  members: BoardMember[]
  sprints: Sprint[]
  client?: {
    _id: string
    name: string
    company?: string
    email?: string
  }
  github?: {
    repoOwner: string
    repoName: string
    webhookId?: number
    webhookSecret?: string
  }
  createdBy: {
    _id: string
    name: string
  }
  createdAt: Date
  updatedAt: Date
}

export const useBoardsStore = defineStore('boards', () => {
  const authStore = useAuthStore()
  
  const boards = ref<Board[]>([])
  const currentBoard = ref<Board | null>(null)
  const activeSprint = ref<Sprint | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const config = computed(() => ({
    headers: {
      Authorization: `Bearer ${authStore.token}`
    }
  }))

  // Computed
  const myBoards = computed(() => {
    if (!authStore.user?._id) return []
    
    return boards.value.filter(board => {
      if (!board.members || !Array.isArray(board.members)) return false
      
      return board.members.some(member => {
        // Formato backend: member.userId._id
        if (member?.userId?._id) {
          return member.userId._id === authStore.user?._id
        }
        // Formato alternativo: member.user._id
        if (member?.user?._id) {
          return member.user._id === authStore.user?._id
        }
        // Si member.userId es un string (ID sin popular)
        if (typeof member?.userId === 'string') {
          return member.userId === authStore.user?._id
        }
        // Si member.user es un string (ID sin popular)
        if (typeof member?.user === 'string') {
          return member.user === authStore.user?._id
        }
        return false
      })
    })
  })

  const currentBoardSprints = computed(() => {
    return currentBoard.value?.sprints || []
  })

  const currentActiveSprint = computed(() => {
    return currentBoard.value?.sprints.find(s => s.status === 'active') || null
  })

  // Actions
  async function fetchBoards() {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`${API_URL}/api/boards`, config.value)
      boards.value = Array.isArray(response.data) ? response.data : []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar tableros'
      console.error('Error fetching boards:', err)
      boards.value = [] // Asegurar que siempre sea un array
    } finally {
      loading.value = false
    }
  }

  async function fetchBoardById(id: string) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`${API_URL}/api/boards/${id}`, config.value)
      currentBoard.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar tablero'
      console.error('Error fetching board:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createBoard(boardData: Partial<Board>) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/api/boards`, boardData, config.value)
      boards.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear tablero'
      console.error('Error creating board:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateBoard(id: string, boardData: Partial<Board>) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.patch(`${API_URL}/api/boards/${id}`, boardData, config.value)
      const index = boards.value.findIndex(b => b._id === id)
      if (index !== -1) {
        boards.value[index] = response.data
      }
      if (currentBoard.value?._id === id) {
        currentBoard.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar tablero'
      console.error('Error updating board:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteBoard(id: string) {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`${API_URL}/api/boards/${id}`, config.value)
      boards.value = boards.value.filter(b => b._id !== id)
      if (currentBoard.value?._id === id) {
        currentBoard.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar tablero'
      console.error('Error deleting board:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addMember(boardId: string, userId: string, role: 'owner' | 'member' | 'viewer') {
    try {
      const response = await axios.post(
        `${API_URL}/api/boards/${boardId}/members`,
        { userId, role },
        config.value
      )
      const index = boards.value.findIndex(b => b._id === boardId)
      if (index !== -1) {
        boards.value[index] = response.data
      }
      if (currentBoard.value?._id === boardId) {
        currentBoard.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al agregar miembro'
      console.error('Error adding member:', err)
      throw err
    }
  }

  async function removeMember(boardId: string, userId: string) {
    try {
      const response = await axios.delete(
        `${API_URL}/api/boards/${boardId}/members/${userId}`,
        config.value
      )
      const index = boards.value.findIndex(b => b._id === boardId)
      if (index !== -1) {
        boards.value[index] = response.data
      }
      if (currentBoard.value?._id === boardId) {
        currentBoard.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar miembro'
      console.error('Error removing member:', err)
      throw err
    }
  }

  async function createSprint(boardId: string, sprintData: Partial<Sprint>) {
    try {
      const response = await axios.post(
        `${API_URL}/api/boards/${boardId}/sprints`,
        sprintData,
        config.value
      )
      const index = boards.value.findIndex(b => b._id === boardId)
      if (index !== -1) {
        boards.value[index] = response.data
      }
      if (currentBoard.value?._id === boardId) {
        currentBoard.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear sprint'
      console.error('Error creating sprint:', err)
      throw err
    }
  }

  async function fetchActiveSprint(boardId: string) {
    try {
      const response = await axios.get(
        `${API_URL}/api/boards/${boardId}/sprints/active`,
        config.value
      )
      activeSprint.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar sprint activo'
      console.error('Error fetching active sprint:', err)
      throw err
    }
  }

  async function activateSprint(boardId: string, sprintId: string) {
    try {
      const response = await axios.patch(
        `${API_URL}/api/boards/${boardId}/sprints/${sprintId}/activate`,
        {},
        config.value
      )
      const index = boards.value.findIndex(b => b._id === boardId)
      if (index !== -1) {
        boards.value[index] = response.data
      }
      if (currentBoard.value?._id === boardId) {
        currentBoard.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al activar sprint'
      console.error('Error activating sprint:', err)
      throw err
    }
  }

  async function completeSprint(boardId: string, sprintId: string) {
    try {
      const response = await axios.patch(
        `${API_URL}/api/boards/${boardId}/sprints/${sprintId}/complete`,
        {},
        config.value
      )
      const index = boards.value.findIndex(b => b._id === boardId)
      if (index !== -1) {
        boards.value[index] = response.data
      }
      if (currentBoard.value?._id === boardId) {
        currentBoard.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al completar sprint'
      console.error('Error completing sprint:', err)
      throw err
    }
  }

  async function updateSprint(boardId: string, sprintId: string, sprintData: Partial<Sprint>) {
    try {
      const response = await axios.patch(
        `${API_URL}/api/boards/${boardId}/sprints/${sprintId}`,
        sprintData,
        config.value
      )
      const index = boards.value.findIndex(b => b._id === boardId)
      if (index !== -1) {
        boards.value[index] = response.data
      }
      if (currentBoard.value?._id === boardId) {
        currentBoard.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar sprint'
      console.error('Error updating sprint:', err)
      throw err
    }
  }

  async function deleteSprint(boardId: string, sprintId: string) {
    console.log('🗑️ deleteSprint store - boardId:', boardId, 'sprintId:', sprintId)
    try {
      const response = await axios.delete(
        `${API_URL}/api/boards/${boardId}/sprints/${sprintId}`,
        config.value
      )
      console.log('✅ Sprint eliminado - Response:', response.data)
      const index = boards.value.findIndex(b => b._id === boardId)
      if (index !== -1) {
        boards.value[index] = response.data
        console.log('✅ Board actualizado en el store')
      }
      if (currentBoard.value?._id === boardId) {
        currentBoard.value = response.data
        console.log('✅ currentBoard actualizado')
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar sprint'
      console.error('❌ Error en deleteSprint:', err.response?.data || err.message)
      throw err
    }
  }

  async function connectGitHub(boardId: string, repoOwner: string, repoName: string) {
    try {
      const response = await axios.post(
        `${API_URL}/api/boards/${boardId}/github/connect`,
        { repoOwner, repoName },
        config.value
      )
      const index = boards.value.findIndex(b => b._id === boardId)
      if (index !== -1) {
        boards.value[index] = response.data
      }
      if (currentBoard.value?._id === boardId) {
        currentBoard.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al conectar con GitHub'
      console.error('Error connecting GitHub:', err)
      throw err
    }
  }

  function setCurrentBoard(board: Board | null) {
    currentBoard.value = board
  }

  function $reset() {
    boards.value = []
    currentBoard.value = null
    activeSprint.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    boards,
    currentBoard,
    activeSprint,
    loading,
    error,
    
    // Computed
    myBoards,
    currentBoardSprints,
    currentActiveSprint,
    
    // Actions
    fetchBoards,
    fetchBoardById,
    createBoard,
    updateBoard,
    deleteBoard,
    addMember,
    removeMember,
    createSprint,
    updateSprint,
    deleteSprint,
    fetchActiveSprint,
    activateSprint,
    completeSprint,
    connectGitHub,
    setCurrentBoard,
    $reset
  }
})
