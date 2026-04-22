import WppVinculacion from './pages/WppVinculacion.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'

// Pages
import Dashboard from './pages/Dashboard.vue'
import Login from './pages/Login.vue'
import Clients from './pages/Clients.vue'
import Activities from './pages/Activities.vue'
import ReportsView from './pages/ReportsView.vue'
import Team from './pages/Team.vue'
import TeamActivities from './pages/TeamActivities.vue'
import AccountingView from './components/AccountingView.vue'
import CasesView from './components/CasesView.vue'
import ProfileView from './pages/ProfileView.vue'
import ChatPage from './pages/ChatPage.vue'
import ClientDetail from './pages/ClientDetail.vue'
import BoardsPage from './pages/BoardsPage.vue'
import BoardView from './pages/BoardView.vue'
import TasksBoard from './pages/TasksBoard.vue'
import InternalTickets from './pages/tickets/InternalTickets.vue'
import ExternalTickets from './pages/tickets/ExternalTickets.vue'
import DailyScrum from './pages/DailyScrum.vue'

const routes = [
  {
    path: '/daily-scrum',
    name: 'DailyScrum',
    component: DailyScrum,
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['view-team', 'view-activities'] 
    }
  },
  {
    path: '/vincular-wpp',
    name: 'WppVinculacion',
    component: WppVinculacion,
    meta: { requiresAuth: true }
  },
  {
    path: '/support',
    name: 'Support',
    component: ExternalTickets
  },
  {
    path: '/tickets',
    name: 'Tickets',
    component: InternalTickets,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/clients/:id',
    name: 'ClientDetail',
    component: ClientDetail,
    meta: { requiresAuth: true, requiredPermissions: ['view-clients'] }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/clients',
    name: 'Clients',
    component: Clients,
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['view-clients']
    }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: Activities,
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['view-activities']
    }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportsView,
    meta: { 
      requiresAuth: true,
      requiredRoles: ['admin', 'manager']
    }
  },
  {
    path: '/accounting',
    name: 'Accounting',
    component: AccountingView,
    meta: { 
      requiresAuth: true,
      requiredRoles: ['admin', 'manager']
    }
  },
  {
    path: '/cases',
    name: 'Cases',
    component: CasesView,
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['view-cases']
    }
  },
  {
    path: '/team',
    name: 'Team',
    component: Team,
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['view-team']
    }
  },
  {
    path: '/team-activities',
    name: 'TeamActivities',
    component: TeamActivities,
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['view-activities', 'view-team']
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { 
      requiresAuth: true
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatPage,
    meta: { 
      requiresAuth: true
    }
  },
  {
    path: '/boards',
    name: 'Boards',
    component: BoardsPage,
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['view-activities']
    }
  },
  {
    path: '/boards/:id',
    name: 'BoardView',
    component: BoardView,
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['view-activities']
    }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: TasksBoard,
    meta: { 
      requiresAuth: true,
      requiredPermissions: ['view-activities']
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Global navigation guard
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Always allow access to login and support pages
  if (to.path === '/login' || to.path === '/support') {
    // If already authenticated and trying to access login, redirect to dashboard
    if (to.path === '/login' && authStore.isAuthenticated) {
      const redirectPath = authStore.user?.role === 'client' ? '/support' : '/';
      next(redirectPath)
      return
    }

    next()
    return
  }
  
  // For all other routes, check authentication
  if (!authStore.isAuthenticated) {
    // Try to restore session from localStorage
    const restored = await authStore.checkAuth()
    
    if (!restored) {
      next('/login')
      return
    }
  }
  
  // Check role-based permissions (legacy support)
  if (to.meta.requiredRoles && authStore.user) {
    const userRole = authStore.user.role
    const requiredRoles = to.meta.requiredRoles as string[]
    
    if (!requiredRoles.includes(userRole)) {
      // Redirect to dashboard if user doesn't have permission
      next('/')
      return
    }
  }
  
  // Check permission-based access (new system)
  if (to.meta.requiredPermissions && authStore.user) {
    const requiredPermissions = to.meta.requiredPermissions as string[]
    const hasPermission = requiredPermissions.some(permission => {
      switch (permission) {
        case 'view-clients':
          return authStore.canViewClients
        case 'view-activities':
          return authStore.canViewActivities
        case 'view-team':
          return authStore.canViewTeam
        case 'view-accounting':
          return authStore.canViewAccounting
        case 'view-reports':
          return authStore.canViewReports
        case 'view-cases':
          return authStore.canViewCases
        default:
          return false
      }
    })
    
    if (!hasPermission) {
      // If client hits unauthorized page (like /dashboard), redirect to /support
      const redirectPath = authStore.isClient ? '/support' : '/';
      next(redirectPath)
      return
    }

  }
  
  next()
})

export default router
