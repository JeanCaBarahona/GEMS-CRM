import { defineStore } from 'pinia'
import axios from 'axios'
import type { Issue, Notification, Document, Minute, Setting, TeamMember, OrgChart } from '../types'
import { API_CONFIG } from '@/config/api'

const API_BASE_URL = API_CONFIG.BASE_URL  // Centralized API base URL

// Export auth store
export { useAuthStore } from './auth'

// Export chat store  
export { useChatStore } from './chatStore'

// Clients Store
export const useClientsStore = defineStore('clients', {
  state: () => ({
    clients: [] as any[],
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchClients() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/clients`)
        this.clients = response.data
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error fetching clients'
      } finally {
        this.loading = false
      }
    },
    
    async createClient(clientData: any) {
      this.loading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/clients`, clientData)
        this.clients.push(response.data)
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error creating client'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// Activities Store
export const useActivitiesStore = defineStore('activities', {
  state: () => ({
    activities: [] as any[],
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchActivities() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/activities`)
        // Mapear actividades al formato esperado por el dashboard
        this.activities = response.data.map((activity: any) => ({
          _id: activity._id,
          title: activity.title,
          description: activity.description,
          date: activity.date,
          status: activity.status, // ya viene en el formato correcto (completed, pending, etc.)
          clientId: activity.clientId,
          createdAt: activity.createdAt
        }))
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error fetching activities'
      } finally {
        this.loading = false
      }
    },
    
    async createActivity(activityData: any) {
      this.loading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/activities`, activityData)
        this.activities.push(response.data)
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error creating activity'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// Payments Store
export const usePaymentsStore = defineStore('payments', {
  state: () => ({
    payments: [] as any[],
    summary: {
      ingresos: 0,
      egresos: 0,
      balance: 0,
      gastos_fijos_mensuales: 0
    },
    loading: false,
    error: null as string | null
  }),
  
  getters: {
    totalRevenue: (state) => state.summary.ingresos,
    totalExpenses: (state) => state.summary.egresos, // Ya incluye gastos fijos
    cashFlow: (state) => state.summary.balance,
    fixedExpenses: (state) => state.summary.gastos_fijos_mensuales,
    pendingPayments: (state) => state.payments.filter(p => p.status === 'pending')
  },
  
  actions: {
    async fetchPayments() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/accounting/transactions`)
        // Mapear los datos del backend al formato esperado por el dashboard
        this.payments = response.data.map((transaction: any) => ({
          _id: transaction._id,
          amount: transaction.monto,
          dueDate: transaction.proximo_pago || transaction.fecha,
          status: transaction.estado_pago === 'pendiente' ? 'pending' : 
                 transaction.estado_pago === 'pagado' ? 'paid' : 'overdue',
          concepto: transaction.concepto,
          tipo: transaction.tipo,
          fecha: transaction.fecha,
          metodo: transaction.metodo
        }))
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error fetching payments'
      } finally {
        this.loading = false
      }
    },

    async fetchSummary() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/accounting/summary`)
        this.summary = response.data
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error fetching summary'
      } finally {
        this.loading = false
      }
    },
    
    async createPayment(paymentData: any) {
      this.loading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/accounting/transactions`, paymentData)
        this.payments.push(response.data)
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error creating payment'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// Issues Store
export const useIssuesStore = defineStore('issues', {
  state: () => ({
    issues: [] as Issue[],
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchIssues() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/cases`)
        // Mapear los casos a formato de issues para el dashboard
        this.issues = response.data.cases?.map((caso: any) => ({
          _id: caso._id,
          title: caso.titulo,
          description: caso.descripcion,
          status: caso.estado === 'abierto' ? 'open' : 
                 caso.estado === 'en_progreso' ? 'in_progress' : 
                 caso.estado === 'resuelto' ? 'resolved' : 'closed',
          priority: caso.prioridad,
          type: caso.tipo,
          createdAt: caso.createdAt,
          updatedAt: caso.updatedAt
        })) || []
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error fetching issues'
      } finally {
        this.loading = false
      }
    },
    
    async createIssue(issueData: Partial<Issue>) {
      this.loading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/issues`, issueData)
        this.issues.push(response.data)
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error creating issue'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateIssue(issueId: string, issueData: Partial<Issue>) {
      this.loading = true
      try {
        const response = await axios.put(`${API_BASE_URL}/issues/${issueId}`, issueData)
        const index = this.issues.findIndex(i => i._id === issueId)
        if (index !== -1) {
          this.issues[index] = response.data
        }
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error updating issue'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteIssue(issueId: string) {
      this.loading = true
      try {
        await axios.delete(`${API_BASE_URL}/issues/${issueId}`)
        this.issues = this.issues.filter(i => i._id !== issueId)
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error deleting issue'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// Notifications Store
export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchNotifications() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/notifications`)
        this.notifications = response.data
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error fetching notifications'
      } finally {
        this.loading = false
      }
    },
    
    async createNotification(notificationData: Partial<Notification>) {
      this.loading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/notifications`, notificationData)
        this.notifications.push(response.data)
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error creating notification'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async markAsRead(notificationId: string) {
      this.loading = true
      try {
        const response = await axios.put(`${API_BASE_URL}/notifications/${notificationId}`, { status: 'read' })
        const index = this.notifications.findIndex(n => n._id === notificationId)
        if (index !== -1) {
          this.notifications[index] = response.data
        }
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error marking notification as read'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteNotification(notificationId: string) {
      this.loading = true
      try {
        await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`)
        this.notifications = this.notifications.filter(n => n._id !== notificationId)
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error deleting notification'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// Documents Store
export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    documents: [] as Document[],
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchDocuments() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/docs`)
        this.documents = response.data
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error fetching documents'
      } finally {
        this.loading = false
      }
    },
    
    async createDocument(documentData: Partial<Document>) {
      this.loading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/docs`, documentData)
        this.documents.push(response.data)
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error creating document'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateDocument(documentId: string, documentData: Partial<Document>) {
      this.loading = true
      try {
        const response = await axios.put(`${API_BASE_URL}/docs/${documentId}`, documentData)
        const index = this.documents.findIndex(d => d._id === documentId)
        if (index !== -1) {
          this.documents[index] = response.data
        }
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error updating document'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteDocument(documentId: string) {
      this.loading = true
      try {
        await axios.delete(`${API_BASE_URL}/docs/${documentId}`)
        this.documents = this.documents.filter(d => d._id !== documentId)
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error deleting document'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// Minutes Store
export const useMinutesStore = defineStore('minutes', {
  state: () => ({
    minutes: [] as Minute[],
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchMinutes() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/minutes`)
        this.minutes = response.data
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error fetching minutes'
      } finally {
        this.loading = false
      }
    },
    
    async createMinute(minuteData: Partial<Minute>) {
      this.loading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/minutes`, minuteData)
        this.minutes.push(response.data)
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error creating minute'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateMinute(minuteId: string, minuteData: Partial<Minute>) {
      this.loading = true
      try {
        const response = await axios.put(`${API_BASE_URL}/minutes/${minuteId}`, minuteData)
        const index = this.minutes.findIndex(m => m._id === minuteId)
        if (index !== -1) {
          this.minutes[index] = response.data
        }
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error updating minute'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteMinute(minuteId: string) {
      this.loading = true
      try {
        await axios.delete(`${API_BASE_URL}/minutes/${minuteId}`)
        this.minutes = this.minutes.filter(m => m._id !== minuteId)
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error deleting minute'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// Settings Store
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: [] as Setting[],
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchSettings() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/settings`)
        this.settings = response.data
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error fetching settings'
      } finally {
        this.loading = false
      }
    },
    
    async createSetting(settingData: Partial<Setting>) {
      this.loading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/settings`, settingData)
        this.settings.push(response.data)
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error creating setting'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateSetting(settingId: string, settingData: Partial<Setting>) {
      this.loading = true
      try {
        const response = await axios.put(`${API_BASE_URL}/settings/${settingId}`, settingData)
        const index = this.settings.findIndex(s => s._id === settingId)
        if (index !== -1) {
          this.settings[index] = response.data
        }
        this.error = null
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Error updating setting'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteSetting(settingId: string) {
      this.loading = true
      try {
        await axios.delete(`${API_BASE_URL}/settings/${settingId}`)
        this.settings = this.settings.filter(s => s._id !== settingId)
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Error deleting setting'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// Team Store (unified with Users)
export const useTeamStore = defineStore('team', {
  state: () => ({
    members: [] as TeamMember[],
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchTeam(page = 1, limit = 500) {
      this.loading = true
      try {
        console.log('🔄 Fetching team data...')
        console.log('📦 Token:', localStorage.getItem('token') ? 'Present' : 'Missing')
        
        const response = await axios.get(`${API_BASE_URL}/team`, {
          params: { page, limit },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        console.log('✅ Team response:', response.data)
        if (response.data.success) {
          this.members = response.data.data
          return response.data.pagination
        } else {
          this.members = []
          return null
        }
        this.error = null
      } catch (error: any) {
        console.error('❌ Error fetching team:', error.response || error)
        this.error = error.response?.data?.message || 'Error fetching team'
        console.error('Error fetching team:', error)
      } finally {
        this.loading = false
      }
    },
    
    async createMember(memberData: Partial<TeamMember>) {
      this.loading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/team`, memberData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.data.success) {
          this.members.push(response.data.data)
          this.error = null
          return response.data.data
        } else {
          throw new Error(response.data.message || 'Error creating team member')
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error creating team member'
        console.error('Error creating team member:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateMember(memberId: string, memberData: Partial<TeamMember>) {
      this.loading = true
      try {
        const response = await axios.put(`${API_BASE_URL}/team/${memberId}`, memberData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.data.success) {
          const index = this.members.findIndex(m => m._id === memberId)
          if (index !== -1) {
            this.members[index] = response.data.data
          }
          this.error = null
          return response.data.data
        } else {
          throw new Error(response.data.message || 'Error updating team member')
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error updating team member'
        console.error('Error updating team member:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateMemberPassword(memberId: string, password: string) {
      this.loading = true
      try {
        const response = await axios.patch(`${API_BASE_URL}/team/${memberId}/password`, { password }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.data.success) {
          this.error = null
          return true
        } else {
          throw new Error(response.data.message || 'Error updating password')
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error updating password'
        console.error('Error updating password:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteMember(memberId: string) {
      this.loading = true
      try {
        const response = await axios.delete(`${API_BASE_URL}/team/${memberId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.data.success) {
          const index = this.members.findIndex(m => m._id === memberId)
          if (index !== -1) {
            this.members[index] = { ...this.members[index], isActive: false }
          }
          this.error = null
        } else {
          throw new Error(response.data.message || 'Error deleting team member')
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error deleting team member'
        console.error('Error deleting team member:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async hardDeleteMember(memberId: string) {
      this.loading = true
      try {
        const response = await axios.delete(`${API_BASE_URL}/team/${memberId}/permanent`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.data.success) {
          this.members = this.members.filter(m => m._id !== memberId)
          this.error = null
          return true
        } else {
          throw new Error(response.data.message || 'Error deleting team member')
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error deleting team member'
        console.error('Error deleting team member:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async activateMember(memberId: string) {
      this.loading = true
      try {
        const response = await axios.put(`${API_BASE_URL}/team/${memberId}/activate`, {}, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.data.success) {
          const index = this.members.findIndex(m => m._id === memberId)
          if (index !== -1) {
            this.members[index] = { ...this.members[index], isActive: true }
          }
          this.error = null
          return response.data.data
        } else {
          throw new Error(response.data.message || 'Error activating team member')
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error activating team member'
        console.error('Error activating team member:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// OrgChart Store
export const useOrgChartStore = defineStore('orgchart', {
  state: () => ({
    chart: { nodes: [] } as OrgChart,
    loading: false,
    error: null as string | null
  }),
  actions: {
    async fetchChart() {
      this.loading = true
      try {
        const res = await axios.get(`${API_BASE_URL}/team/orgchart`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        if (res.data.success) this.chart = res.data.data
        this.error = null
      } catch (e: any) {
        this.error = e.response?.data?.message || e.message
      } finally {
        this.loading = false
      }
    },
    async saveChart(chart: OrgChart) {
      this.loading = true
      try {
        const res = await axios.put(`${API_BASE_URL}/team/orgchart`, chart, {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
        if (res.data.success) this.chart = res.data.data
        this.error = null
        return res.data
      } catch (e: any) {
        this.error = e.response?.data?.message || e.message
        throw e
      } finally {
        this.loading = false
      }
    }
  }
})
