// Tipos para el CRM
export interface Client {
  _id?: string
  name: string
  email: string
  phone: string
  company: string
  tags?: string[]
  profile?: {
    about?: string
    address?: string
    website?: string
    industry?: string
    size?: string
    location?: string
    socials?: {
      linkedin?: string
      twitter?: string
      facebook?: string
      instagram?: string
    }
  }
  services?: Array<{
    _id?: string
    name: string
    plan?: string
    status?: 'active' | 'paused' | 'cancelled' | 'trial'
    startDate?: string
    endDate?: string
    notes?: string
  }>
  commitments?: Array<{
    _id?: string
    title: string
    description?: string
    dueDate?: string
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    owner?: string
  }>
  preferences?: Array<{ _id?: string; key: string; value: string }>
  customFields?: Array<{ _id?: string; key: string; value: any; type?: 'string' | 'number' | 'boolean' | 'date' | 'json' }>
  notes?: Array<{ _id?: string; content: string; author?: string; pinned?: boolean; createdAt?: string }>
  createdAt?: string
  updatedAt?: string
}

export interface Activity {
  _id?: string
  title: string
  description: string
  date: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'overdue'
  clientId: string
  assignedTo?: string[]
  assignedToUser?: TeamMember // Datos del usuario asignado (populated)
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  estimatedTime?: string
  createdBy?: string // ID del usuario que creó la actividad
  createdByUser?: TeamMember // Datos del usuario que creó (populated)
  linkedCases?: any[]
  linkedWikiArticles?: any[]
  createdAt?: string
  updatedAt?: string
}

export interface Payment {
  _id?: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  clientId: string
  createdAt?: string
  updatedAt?: string
}

export interface Followup {
  _id?: string
  title: string
  description: string
  date: string
  status: 'pending' | 'completed' | 'cancelled'
  clientId: string
  createdAt?: string
  updatedAt?: string
}

export interface Issue {
  _id?: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'closed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  clientId: string
  createdAt?: string
  updatedAt?: string
}

export interface Notification {
  _id?: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success' | 'payment_reminder'
  status: 'read' | 'unread'
  clientId?: string
  createdAt?: string
  updatedAt?: string
}

export interface Document {
  _id?: string
  title: string
  type: 'contract' | 'invoice' | 'proposal' | 'other'
  url: string
  status: 'active' | 'expired' | 'archived'
  clientId: string
  createdAt?: string
  updatedAt?: string
}

export interface Minute {
  _id?: string
  title: string
  content: string
  date: string
  attendees: string[]
  clientId: string
  createdAt?: string
  updatedAt?: string
}

export interface Setting {
  _id?: string
  key: string
  value: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'json'
  createdAt?: string
  updatedAt?: string
}

export interface TeamMember {
  _id?: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'employee' | 'support' | 'development' | 'fullstack' | 'viewer' | 'client'
  department?: string
  departmentRole?: 'member' | 'leader'
  supervisor?: string
  position?: string
  phone?: string
  photo?: string
  isActive: boolean
  lastLogin?: string
  permissions?: {
    dashboard: boolean
    clients: {
      view: boolean
      create: boolean
      edit: boolean
      delete: boolean
    }
    activities: {
      view: boolean
      create: boolean
      edit: boolean
      delete: boolean
    }
    reports: {
      view: boolean
      export: boolean
    }
    accounting: {
      view: boolean
      create: boolean
      edit: boolean
      delete: boolean
    }
    cases: {
      view: boolean
      create: boolean
      edit: boolean
      delete: boolean
    }
    team: {
      view: boolean
      create: boolean
      edit: boolean
      delete: boolean
    }
  }
  createdAt?: string
  updatedAt?: string
}

// Organigrama
export interface OrgChartNode {
  id: string
  title: string
  name: string
  level: number
  parentId: string | null
  userId?: string | null // compat: single assignee
  assignees?: Array<{ userId: string; name: string; email?: string }>
  description?: string
  status?: 'filled' | 'vacant'
  isTeam?: boolean
}

export interface OrgChart {
  nodes: OrgChartNode[]
  updatedAt?: string
}

// Tipos para formularios
export interface ClientForm {
  name: string
  email: string
  phone: string
  company: string
}

export interface ActivityForm {
  title: string
  description: string
  date: string
  status: Activity['status']
  clientId: string
  assignedTo?: string
  priority?: Activity['priority']
  dueDate?: string
  estimatedTime?: string
}

export interface PaymentForm {
  amount: number
  dueDate: string
  status: Payment['status']
  clientId: string
}

// Tipos para estados de los stores
export interface StoreState<T> {
  items: T[]
  loading: boolean
  error: string | null
}
