import { API_CONFIG } from '../config/api'

export interface AppNotification {
  _id: string
  userId: string
  category: 'mention' | 'assignment' | 'comment' | 'due-soon' | 'overdue' | 'info' | 'approval'
  entityType: 'activity' | 'task' | 'client' | 'other'
  entityId?: string
  title: string
  message?: string
  read: boolean
  fromUserId?: { _id: string; name: string; email: string; photo?: string } | string
  metadata?: Record<string, any>
  virtual?: boolean
  createdAt: string
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const BASE = `${API_CONFIG.BASE_URL.replace(/\/api$/, '')}/api/notifications`

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    const r = await fetch(BASE, { headers: { ...authHeaders() } })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  },

  async unreadCount(): Promise<number> {
    const r = await fetch(`${BASE}/unread-count`, { headers: { ...authHeaders() } })
    if (!r.ok) return 0
    const data = await r.json()
    return data.count || 0
  },

  async markRead(id: string): Promise<void> {
    await fetch(`${BASE}/${id}/read`, {
      method: 'PATCH',
      headers: { ...authHeaders() }
    })
  },

  async markAllRead(): Promise<void> {
    await fetch(`${BASE}/read-all`, {
      method: 'PATCH',
      headers: { ...authHeaders() }
    })
  },

  async remove(id: string): Promise<void> {
    await fetch(`${BASE}/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    })
  }
}
