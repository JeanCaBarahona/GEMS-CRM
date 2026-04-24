import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/authService'

export interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'employee' | 'support' | 'client' | 'viewer'
  department: string
  position: string
  avatar?: string
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
}

export interface LoginCredentials {
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userRole = computed(() => user.value?.role || null)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() => user.value?.role === 'manager' || user.value?.role === 'admin')
  const isSupport = computed(() => user.value?.role === 'support' || user.value?.role === 'admin')
  const isClient = computed(() => user.value?.role === 'client')
  
  // Helper function to safely access permissions
  const getUserPermission = (module: keyof NonNullable<User['permissions']>, action: string) => {
    if (user.value?.role === 'admin') return true
    
    const permissions = user.value?.permissions
    if (!permissions) return false
    
    const modulePerms = permissions[module]
    if (!modulePerms || typeof modulePerms === 'boolean') return false
    
    return (modulePerms as any)[action] || false
  }
  
  const getUserModulePermission = (module: keyof NonNullable<User['permissions']>) => {
    if (user.value?.role === 'admin') return true
    return user.value?.permissions?.[module] || false
  }

  // Role-based permissions usando la estructura de permisos del backend con fallbacks
  const canViewDashboard = computed(() => getUserModulePermission('dashboard') || !!user.value)
  
  // Clientes: Admin y Manager pueden ver, Empleado NO
  const canViewClients = computed(() => {
    if (user.value?.role === 'employee') return false // Empleado NO puede ver clientes
    return getUserPermission('clients', 'view') || ['admin', 'manager'].includes(user.value?.role || '')
  })
  
  const canViewActivities = computed(() => getUserPermission('activities', 'view') || !!user.value)
  const canViewReports = computed(() => getUserPermission('reports', 'view') || ['admin', 'manager'].includes(user.value?.role || ''))
  const canViewAccounting = computed(() => getUserPermission('accounting', 'view') || ['admin', 'manager'].includes(user.value?.role || ''))
  
  const canViewCases = computed(() => {
    if (user.value?.role === 'client') return false
    return getUserPermission('cases', 'view') || ['admin', 'manager', 'employee', 'support'].includes(user.value?.role || '')
  })
  
  const canViewTickets = computed(() => {
    return ['admin', 'manager', 'support', 'employee'].includes(user.value?.role || '')
  })
  
  // Equipo: Admin, Manager y Empleado pueden ver  
  const canViewTeam = computed(() => {
    if (!user.value) return false
    const role = user.value.role?.toLowerCase() || ''
    return getUserPermission('team', 'view') || 
           ['admin', 'manager', 'employee', 'support', 'ti', 'soporte'].includes(role)
  })
  
  // Create/Edit permissions with fallbacks
  // Clientes: Solo Admin y Manager pueden crear/editar
  const canCreateClients = computed(() => getUserPermission('clients', 'create') || ['admin', 'manager'].includes(user.value?.role || ''))
  const canEditClients = computed(() => getUserPermission('clients', 'edit') || ['admin', 'manager'].includes(user.value?.role || ''))
  const canDeleteClients = computed(() => getUserPermission('clients', 'delete') || ['admin'].includes(user.value?.role || ''))
  
  // Actividades: Todos los roles internos pueden hacer todo (cualquiera que no sea cliente)
  const canCreateActivities = computed(() => {
    if (!user.value) return false
    return user.value.role?.toLowerCase() !== 'client'
  })
  const canEditActivities = computed(() => {
    if (!user.value) return false
    return user.value.role?.toLowerCase() !== 'client'
  })
  const canDeleteActivities = computed(() => {
    if (!user.value) return false
    return user.value.role?.toLowerCase() !== 'client'
  })
  
  const canViewTeamActivities = computed(() => {
    if (!user.value) return false
    return user.value.role?.toLowerCase() !== 'client'
  })

  // Leader check: En este CRM, cualquier miembro interno puede ver el resumen de equipo (política sin límites)
  const isLeader = computed(() => {
    if (!user.value) return false
    return user.value.role?.toLowerCase() !== 'client'
  })
  
  // Casos: Solo Admin y Manager pueden crear/editar, Empleado solo ve
  const canCreateCases = computed(() => getUserPermission('cases', 'create') || ['admin', 'manager'].includes(user.value?.role || ''))
  const canEditCases = computed(() => getUserPermission('cases', 'edit') || ['admin', 'manager'].includes(user.value?.role || ''))
  const canDeleteCases = computed(() => getUserPermission('cases', 'delete') || ['admin'].includes(user.value?.role || ''))
  
  // Equipo: Solo Admin y Manager pueden crear/editar, Empleado solo ve
  const canCreateTeam = computed(() => getUserPermission('team', 'create') || ['admin', 'manager'].includes(user.value?.role || ''))
  const canEditTeam = computed(() => getUserPermission('team', 'edit') || ['admin', 'manager'].includes(user.value?.role || ''))
  const canDeleteTeam = computed(() => getUserPermission('team', 'delete') || ['admin'].includes(user.value?.role || ''))
  const canManageTeam = computed(() => canCreateTeam.value || canEditTeam.value || canDeleteTeam.value)
  const canManageAccounting = computed(() => getUserPermission('accounting', 'create') || getUserPermission('accounting', 'edit') || ['admin', 'manager'].includes(user.value?.role || ''))

  // Department-based access (for more granular control)
  const canViewMarketingSection = computed(() => {
    if (!user.value) return false
    return user.value.role === 'admin' || 
           (user.value.role === 'manager' && user.value.department === 'Marketing') ||
           (user.value.department === 'Marketing')
  })
  
  const canViewSalesSection = computed(() => {
    if (!user.value) return false
    return user.value.role === 'admin' || 
           (user.value.role === 'manager' && user.value.department === 'Ventas') ||
           (user.value.department === 'Ventas')
  })

  // Actions
  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true
      error.value = null
      
      console.log('🚀 Attempting login with:', credentials.email)
      
      const response = await authService.login(credentials)
      
      if (response.success && response.user && response.token) {
        user.value = response.user
        token.value = response.token
        localStorage.setItem('token', response.token)
        // Persist user
        localStorage.setItem('user', JSON.stringify(user.value))
        
        console.log('✅ Login successful!')
        console.log('👤 User:', response.user?.name, '- Role:', response.user?.role)
        
        return { success: true }
      } else {
        console.log('❌ Login failed:', response.message)
        error.value = response.message || 'Error al iniciar sesión'
        return { success: false, message: error.value }
      }
    } catch (err: any) {
      console.log('❌ Login error:', err)
      error.value = err.message || 'Error de conexión'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await authService.logout()
      }
    } catch (err) {
      console.error('Error during logout:', err)
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  }

  const checkAuth = async () => {
    console.log('🔍 Checking auth...')
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    console.log('📦 Stored token:', !!storedToken)
    console.log('👤 Stored user:', !!storedUser)
    
    if (!storedToken || !storedUser) {
      console.log('❌ No stored credentials found')
      return false
    }

    try {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
      
      console.log('✅ Auth restored from localStorage')
      console.log('👤 User:', user.value?.name, '- Role:', user.value?.role)
      
      // Verify token is still valid
      const response = await authService.verifyToken()
      if (!response.success) {
        console.log('❌ Token verification failed')
        await logout()
        return false
      }
      
      console.log('✅ Token verified successfully')
      return true
    } catch (err) {
      console.log('❌ Error restoring auth:', err)
      await logout()
      return false
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await authService.updateProfile(profileData)
      
      if (response.success && user.value) {
        user.value = { ...user.value, ...response.user }
        localStorage.setItem('user', JSON.stringify(user.value))
        return { success: true }
      } else {
        error.value = response.message || 'Error al actualizar perfil'
        return { success: false, message: error.value }
      }
    } catch (err: any) {
      error.value = err.message || 'Error de conexión'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  
  const getAvailableModules = computed(() => {
    if (!user.value) return []
    
    // Si es CLIENTE, solo ve "Soporte" (levantar tickets)
    if (user.value.role === 'client') {
      return [
        { id: 'tickets-public', name: 'Soporte', icon: 'fas fa-headset', path: '/support', canAccess: true }
      ]
    }

    const modules = [
      { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt', path: '/', canAccess: canViewDashboard.value }
    ]
    
    if (canViewClients.value) {
      modules.push({ id: 'clients', name: 'Clientes', icon: 'fas fa-users', path: '/clients', canAccess: true })
    }
    
    if (canViewActivities.value) {
      modules.push({ id: 'activities', name: 'Actividades', icon: 'fas fa-tasks', path: '/activities', canAccess: true })
    }

    
    if (canViewReports.value) {
      modules.push({ id: 'reports', name: 'Reportes & Analytics', icon: 'fas fa-chart-bar', path: '/reports', canAccess: true })
    }
    
    if (canViewTickets.value) {
      modules.push({ id: 'tickets', name: 'Tickets', icon: 'fas fa-ticket-alt', path: '/tickets', canAccess: true })
    }
    
    if (canViewCases.value) {
      modules.push({ id: 'cases', name: 'Casos', icon: 'fas fa-folder', path: '/cases', canAccess: true })
    }
    
    if (canViewTeam.value) {
      modules.push({ id: 'team', name: 'Equipo', icon: 'fas fa-users-cog', path: '/team', canAccess: true })
    }
    
    return modules.filter(m => m.canAccess)
  })

  // Helper functions for updating user data
  const updateUserAvatar = (avatar: string) => {
    if (user.value) {
      user.value.avatar = avatar
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  const updateUserProfile = (profileData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...profileData }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userRole,
    isAdmin,
    isManager,
    
    // Permission computed properties
    canViewDashboard,
    canViewClients,
    canViewActivities,
    canViewReports,
    canViewAccounting,
    canViewCases,
    canViewTeam,
    canCreateClients,
    canEditClients,
    canDeleteClients,
    canCreateActivities,
    canEditActivities,
    canDeleteActivities,
    canCreateCases,
    canEditCases,
    canDeleteCases,
    canCreateTeam,
    canEditTeam,
    canDeleteTeam,
    canManageTeam,
    canManageAccounting,
    
    // Department access
    canViewMarketingSection,
    canViewSalesSection,
    
    // Actions
    login,
    logout,
    checkAuth,
    updateProfile,
    updateUserAvatar,
    updateUserProfile,
    getAvailableModules,
  }
})
