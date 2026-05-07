import { API_CONFIG } from '@/config/api'
import type { Prospect, ProspectMessage, ProspectStatus } from '@/types/prospect'

const STATUS_KEY = 'gems-prospect-status-overrides'
const META_KEY = 'gems-prospect-meta-overrides'

interface MetaOverride {
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  estimatedValue?: number
  source?: string
}

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

/**
 * Service to interact with prospects backend.
 * Status and contact metadata are persisted locally as the backend doesn't
 * yet expose these fields — this gives the UX immediately and is forward-
 * compatible: when the backend adds them, we can remove the local cache.
 */
class ProspectService {
  private apiUrl = `${API_CONFIG.BASE_URL}/prospects`

  private hydrate(prospect: Prospect): Prospect {
    const statuses = readJson<Record<string, ProspectStatus>>(STATUS_KEY, {})
    const metas = readJson<Record<string, MetaOverride>>(META_KEY, {})
    return {
      ...prospect,
      status: prospect.status ?? statuses[prospect._id] ?? 'nuevo',
      ...(metas[prospect._id] ?? {}),
    }
  }

  async list(): Promise<Prospect[]> {
    const response = await fetch(this.apiUrl)
    if (!response.ok) throw new Error('No se pudieron cargar los prospectos')
    const data = (await response.json()) as Prospect[]
    return data.map((p) => this.hydrate(p))
  }

  async get(id: string): Promise<Prospect> {
    const response = await fetch(`${this.apiUrl}/${id}`)
    if (!response.ok) throw new Error('No se pudo cargar el prospecto')
    return this.hydrate(await response.json())
  }

  async create(payload: {
    prospectName: string
    company?: string
    initialMessage: string
  }): Promise<Prospect> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error('No se pudo crear el prospecto')
    return this.hydrate(await response.json())
  }

  async sendMessage(id: string, message: { role: 'user' | 'assistant'; content: string }): Promise<Prospect> {
    const response = await fetch(`${this.apiUrl}/${id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
    if (!response.ok) throw new Error('No se pudo enviar el mensaje')
    const data = await response.json()
    // Algunos backends devuelven {messages: [...]} otros el prospect entero
    if (data && typeof data === 'object' && '_id' in data) {
      return this.hydrate(data as Prospect)
    }
    // Si no devuelve el prospect entero, refrescamos
    return this.get(id)
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}`, { method: 'DELETE' })
    if (!response.ok && response.status !== 404) {
      throw new Error('No se pudo eliminar el prospecto')
    }
  }

  setStatus(id: string, status: ProspectStatus) {
    const all = readJson<Record<string, ProspectStatus>>(STATUS_KEY, {})
    all[id] = status
    writeJson(STATUS_KEY, all)
  }

  setMetadata(id: string, meta: MetaOverride) {
    const all = readJson<Record<string, MetaOverride>>(META_KEY, {})
    all[id] = { ...(all[id] || {}), ...meta }
    writeJson(META_KEY, all)
  }

  /**
   * Llama a Gemini con texto + (opcionalmente) imágenes y devuelve el markdown
   * generado. Maneja errores y validación de API key.
   */
  async generateWithGemini(input: {
    prompt: string
    images?: Array<{ mimeType: string; data: string }>
  }): Promise<string> {
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('Falta la variable de entorno VITE_GEMINI_API_KEY')
    }

    const parts: any[] = [{ text: input.prompt }]
    if (input.images?.length) {
      input.images.forEach((img) => {
        parts.push({ inline_data: { mime_type: img.mimeType, data: img.data } })
      })
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      throw new Error(`Error Gemini (${response.status}): ${errText.slice(0, 120)}`)
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Gemini no devolvió contenido')
    return text as string
  }
}

export const prospectService = new ProspectService()
export type { MetaOverride }
