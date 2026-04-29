// Configuración automática de API según el ambiente
const getBaseURL = (): string => {
  const azureURL = 'https://crmcustomertouch.azurewebsites.net/api'
  return azureURL
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
