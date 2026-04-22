import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'
import { API_CONFIG } from '../config/api'

const API_URL = API_CONFIG.BASE_URL.replace('/api', '')

export interface Task {
  _id: string
  title: string
  description: string
  type: 'task' | 'bug' | 'feature' | 'user-story' | 'epic'
  status: 'active' | 'completed' | 'blocked' | 'cancelled'
  boardStatus: 'backlog' | 'todo' | 'in-progress' | 'review' | 'testing' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo?: {
    _id: string
    name: string
    email: string
  }
  reporter: {
    _id: string
    name: string
    email: string
  }
  board: string
  sprint?: {
    _id: string
    name: string
  }
  client?: {
    _id: string
    name: string
  }
  estimatedHours?: number
  actualHours?: number
  remainingHours?: number
  tags: string[]
  attachments: Array<{
    name: string
    url: string
    uploadedBy: string
    uploadedAt: Date
  }>
  comments: Array<{
    _id: string
    text: string
    author: {
      _id: string
      name: string
    }
    createdAt: Date
  }>
  parentTask?: string
  epicId?: string
  featureId?: string
  userStoryId?: string
  blockedBy: string[]
  relatedTasks: string[]
  github?: {
    repoOwner?: string
    repoName?: string
    branch?: string
    branchUrl?: string
    pullRequest?: {
      number: number
      url: string
      status: 'open' | 'closed' | 'merged'
      mergedAt?: Date | string | null
    }
    commits?: Array<{
      sha: string
      message: string
      author: string
      date: Date
    }>
    pr?: string
    lastSync?: Date
  }
  dueDate?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
  activeSessions?: Array<{
    userId: { _id: string, name: string, photo: string }
    startTime: Date
  }>
  timeLogs?: Array<{
    userId: { _id: string, name: string, photo: string }
    startTime: Date
    endTime: Date
    durationHours: number
    notes?: string
  }>
  completionPercentage?: number
}

export interface TaskFilters {
  boardStatus?: string
  status?: string
  priority?: string
  assignedTo?: string
  sprint?: string
  type?: string
  tags?: string[]
  search?: string
  department?: string
}

export interface TaskStats {
  totalTasks: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  byType: Record<string, number>
  completionRate: number
  averageHoursPerTask: number
  blockedTasks: number
}

export const useTasksStore = defineStore('tasks', () => {
  const authStore = useAuthStore()
  
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<TaskFilters>({})
  const stats = ref<TaskStats | null>(null)

  const config = computed(() => ({
    headers: {
      Authorization: `Bearer ${authStore.token}`
    }
  }))

  // Computed
  const tasksByBoard = computed(() => {
    const grouped: Record<string, Task[]> = {}
    tasks.value.forEach(task => {
      if (!grouped[task.boardStatus]) {
        grouped[task.boardStatus] = []
      }
      grouped[task.boardStatus].push(task)
    })
    return grouped
  })

  const myTasks = computed(() => {
    return tasks.value.filter(task => task.assignedTo?._id === authStore.user?._id)
  })

  const backlogTasks = computed(() => {
    return tasks.value.filter(task => task.boardStatus === 'backlog')
  })

  // Actions
  async function fetchTasks(boardId?: string, customFilters?: TaskFilters) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      
      if (boardId) params.append('board', boardId)
      if (customFilters?.boardStatus) params.append('boardStatus', customFilters.boardStatus)
      if (customFilters?.status) params.append('status', customFilters.status)
      if (customFilters?.priority) params.append('priority', customFilters.priority)
      if (customFilters?.assignedTo) params.append('assignedTo', customFilters.assignedTo)
      if (customFilters?.sprint) params.append('sprint', customFilters.sprint)
      if (customFilters?.type) params.append('type', customFilters.type)
      if (customFilters?.search) params.append('search', customFilters.search)
      if (customFilters?.department) params.append('department', customFilters.department)
      
      const response = await axios.get(`${API_URL}/api/tasks?${params.toString()}`, config.value)
      tasks.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar tareas'
      console.error('Error fetching tasks:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchMyTasks() {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`${API_URL}/api/tasks/my-tasks`, config.value)
      tasks.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar mis tareas'
      console.error('Error fetching my tasks:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchTaskById(id: string) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`${API_URL}/api/tasks/${id}`, config.value)
      currentTask.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar tarea'
      console.error('Error fetching task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createTask(taskData: Partial<Task>) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/api/tasks`, taskData, config.value)
      tasks.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear tarea'
      console.error('Error creating task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTask(id: string, taskData: Partial<Task>) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.put(`${API_URL}/api/tasks/${id}`, taskData, config.value)
      const index = tasks.value.findIndex(t => t._id === id)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      if (currentTask.value?._id === id) {
        currentTask.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar tarea'
      console.error('Error updating task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function moveTask(id: string, newBoardStatus: string, newIndex?: number) {
    try {
      const response = await axios.patch(
        `${API_URL}/api/tasks/${id}/move`,
        { boardStatus: newBoardStatus, newIndex },
        config.value
      )
      const index = tasks.value.findIndex(t => t._id === id)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al mover tarea'
      console.error('Error moving task:', err)
      throw err
    }
  }

  async function deleteTask(id: string) {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`, config.value)
      tasks.value = tasks.value.filter(t => t._id !== id)
      if (currentTask.value?._id === id) {
        currentTask.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar tarea'
      console.error('Error deleting task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addComment(taskId: string, text: string) {
    try {
      const response = await axios.post(
        `${API_URL}/api/tasks/${taskId}/comments`,
        { text },
        config.value
      )
      const index = tasks.value.findIndex(t => t._id === taskId)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      if (currentTask.value?._id === taskId) {
        currentTask.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al agregar comentario'
      console.error('Error adding comment:', err)
      throw err
    }
  }

  async function uploadAttachment(taskId: string, file: File) {
    const formData = new FormData()
    formData.append('attachment', file)
    
    try {
      const response = await axios.post(
        `${API_URL}/api/tasks/${taskId}/attachments`,
        formData,
        {
          ...config.value,
          headers: {
            ...config.value.headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      const index = tasks.value.findIndex(t => t._id === taskId)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      if (currentTask.value?._id === taskId) {
        currentTask.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al subir archivo'
      console.error('Error uploading attachment:', err)
      throw err
    }
  }

  async function syncWithGitHub(taskId: string, githubData: any) {
    try {
      const response = await axios.patch(
        `${API_URL}/api/tasks/${taskId}/github`,
        githubData,
        config.value
      )
      const index = tasks.value.findIndex(t => t._id === taskId)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      if (currentTask.value?._id === taskId) {
        currentTask.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al sincronizar con GitHub'
      console.error('Error syncing with GitHub:', err)
      throw err
    }
  }

  async function startTimer(taskId: string) {
    try {
      const response = await axios.post(`${API_URL}/api/tasks/${taskId}/timer/start`, {}, config.value)
      const index = tasks.value.findIndex(t => t._id === taskId)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      if (currentTask.value?._id === taskId) {
        currentTask.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al iniciar temporizador'
      console.error('Error starting timer:', err)
      throw err
    }
  }

  async function stopTimer(taskId: string, notes?: string) {
    try {
      const response = await axios.post(`${API_URL}/api/tasks/${taskId}/timer/stop`, { notes }, config.value)
      const index = tasks.value.findIndex(t => t._id === taskId)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      if (currentTask.value?._id === taskId) {
        currentTask.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al detener temporizador'
      console.error('Error stopping timer:', err)
      throw err
    }
  }

  async function fetchStats(boardId?: string, sprintId?: string) {
    try {
      const params = new URLSearchParams()
      if (boardId) params.append('board', boardId)
      if (sprintId) params.append('sprint', sprintId)
      
      const response = await axios.get(
        `${API_URL}/api/tasks/stats/overview?${params.toString()}`,
        config.value
      )
      stats.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar estadísticas'
      console.error('Error fetching stats:', err)
      throw err
    }
  }

  function setFilters(newFilters: TaskFilters) {
    filters.value = newFilters
  }

  function clearFilters() {
    filters.value = {}
  }

  function $reset() {
    tasks.value = []
    currentTask.value = null
    loading.value = false
    error.value = null
    filters.value = {}
    stats.value = null
  }

  return {
    // State
    tasks,
    currentTask,
    loading,
    error,
    filters,
    stats,
    
    // Computed
    tasksByBoard,
    myTasks,
    backlogTasks,
    
    // Actions
    fetchTasks,
    fetchMyTasks,
    fetchTaskById,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    addComment,
    uploadAttachment,
    syncWithGitHub,
    startTimer,
    stopTimer,
    fetchStats,
    setFilters,
    clearFilters,
    $reset
  }
})
