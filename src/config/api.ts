// Configuración automática de API según el ambiente
const getBaseURL = (): string => {
  // Usar Render como URL por defecto
  const devURL = 'https://gems-crm-backend.onrender.com/api'
  const prodURL = 'https://gems-crm-backend.onrender.com/api'
  
  // Si estamos en localhost (desarrollo), aún podemos usar la URL de Render si el backend ya está desplegado
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return devURL
  }
  
  return prodURL
}

// Función para obtener timeout personalizado
const getTimeout = (): number => {
  return Number(import.meta.env.VITE_API_TIMEOUT) || 10000
}

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: getTimeout(),
  HEADERS: {
    'Content-Type': 'application/json',
  }
}

// Función para verificar si estamos en modo debug
export const isDebugMode = (): boolean => {
  return import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.DEV
}


if (isDebugMode()) {
  console.log('🌐 API Configuration:', {
    environment: import.meta.env.DEV ? 'development' : 'production',
    hostname: window.location.hostname,
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    mode: import.meta.env.MODE
  })
}

export const ENDPOINTS = {
  CLIENTS: '/clients',
  ACTIVITIES: '/activities',
  PAYMENTS: '/payments',
  CASES: '/cases',
  FOLLOWUPS: '/followups',
  ISSUES: '/issues',
  NOTIFICATIONS: '/notifications',
  DOCS: '/docs',
  MINUTES: '/minutes',
  SETTINGS: '/settings',
  TEAM: '/team',
  REPORTS: '/reports',
  TICKETS: '/tickets'
}
