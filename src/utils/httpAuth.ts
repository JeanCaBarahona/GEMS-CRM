import axios from 'axios'
import { API_CONFIG } from '@/config/api'

/**
 * Adjunta el token de sesión a todas las peticiones dirigidas al API.
 *
 * El backend exige `Authorization: Bearer <token>` en todo /api/*, pero varios
 * servicios y componentes hacen fetch o axios sin esa cabecera, lo que produce
 * "Token de acceso requerido". En lugar de parchear cada llamada, se interceptan
 * fetch y axios una sola vez al arrancar la app.
 *
 * El token se agrega SOLO a peticiones hacia el API, nunca a terceros, y jamás
 * sobrescribe una cabecera Authorization ya presente.
 */

const getToken = (): string | null => {
  try {
    return localStorage.getItem('token')
  } catch {
    return null
  }
}

const isApiUrl = (url: string): boolean => {
  if (!url) return false
  if (url.startsWith(API_CONFIG.BASE_URL)) return true
  // Rutas relativas servidas por el proxy de Vite en desarrollo.
  if (url.startsWith('/api/') || url === '/api') return true
  if (url.startsWith('/uploads/')) return true
  return false
}

const installFetchInterceptor = (): void => {
  const original = window.fetch.bind(window)

  window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url

    if (!isApiUrl(url)) return original(input as any, init)

    const token = getToken()
    if (!token) return original(input as any, init)

    // Un objeto Request trae sus cabeceras dentro; se reconstruye para no perderlas.
    if (input instanceof Request && !init) {
      if (input.headers.get('Authorization')) return original(input)
      const headers = new Headers(input.headers)
      headers.set('Authorization', `Bearer ${token}`)
      return original(new Request(input, { headers }))
    }

    const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined))
    if (!headers.get('Authorization')) headers.set('Authorization', `Bearer ${token}`)

    return original(input as any, { ...init, headers })
  }
}

const installAxiosInterceptor = (): void => {
  axios.interceptors.request.use((config) => {
    const url = config.url || ''
    const full = config.baseURL && !url.startsWith('http') ? `${config.baseURL}${url}` : url
    if (!isApiUrl(full)) return config

    const token = getToken()
    if (!token) return config

    config.headers = config.headers || {}
    if (!(config.headers as Record<string, unknown>).Authorization) {
      ;(config.headers as Record<string, unknown>).Authorization = `Bearer ${token}`
    }
    return config
  })
}

export const installHttpAuth = (): void => {
  installFetchInterceptor()
  installAxiosInterceptor()
}
