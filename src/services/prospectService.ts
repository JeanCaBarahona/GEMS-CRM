import { API_CONFIG } from '@/config/api'
import type {
  Prospect,
  ProspectMessage,
  ProspectStatus,
  ProspectSource,
  ProspectNote,
  ProspectTask,
  ProspectTimelineEntry,
  TimelineEventType,
} from '@/types/prospect'

const STATUS_KEY = 'gems-prospect-status-overrides'
const META_KEY = 'gems-prospect-meta-overrides'
const NOTES_KEY = 'gems-prospect-notes'
const TASKS_KEY = 'gems-prospect-tasks'
const TIMELINE_KEY = 'gems-prospect-timeline'

interface MetaOverride {
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  estimatedValue?: number
  source?: ProspectSource
  ownerId?: string
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

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

/**
 * Service to interact with prospects backend.
 * Status, contact metadata, notes, tasks and timeline are persisted locally
 * (per-user, in localStorage). Cuando el backend exponga estos campos podemos
 * migrar quitando la capa local sin tocar la UI.
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
    const created = this.hydrate(await response.json())
    this.addTimelineEntry(created._id, {
      type: 'created',
      description: `Prospecto creado: ${created.prospectName}`,
    })
    return created
  }

  async sendMessage(id: string, message: { role: 'user' | 'assistant'; content: string }): Promise<Prospect> {
    const response = await fetch(`${this.apiUrl}/${id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
    if (!response.ok) throw new Error('No se pudo enviar el mensaje')
    const data = await response.json()
    if (data && typeof data === 'object' && '_id' in data) {
      return this.hydrate(data as Prospect)
    }
    return this.get(id)
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}`, { method: 'DELETE' })
    if (!response.ok && response.status !== 404) {
      throw new Error('No se pudo eliminar el prospecto')
    }
    // Limpia las extensiones locales
    this.clearLocalExtras(id)
  }

  // ───────── Status ─────────
  setStatus(id: string, status: ProspectStatus) {
    const all = readJson<Record<string, ProspectStatus>>(STATUS_KEY, {})
    const previous = all[id]
    all[id] = status
    writeJson(STATUS_KEY, all)
    if (previous !== status) {
      this.addTimelineEntry(id, {
        type: 'status',
        description: `Estado cambiado a "${status}"`,
        meta: { previous, current: status },
      })
    }
  }

  // ───────── Metadata ─────────
  setMetadata(id: string, meta: MetaOverride) {
    const all = readJson<Record<string, MetaOverride>>(META_KEY, {})
    all[id] = { ...(all[id] || {}), ...meta }
    writeJson(META_KEY, all)
  }

  getMetadata(id: string): MetaOverride {
    const all = readJson<Record<string, MetaOverride>>(META_KEY, {})
    return all[id] || {}
  }

  // ───────── Notes ─────────
  getNotes(id: string): ProspectNote[] {
    const all = readJson<Record<string, ProspectNote[]>>(NOTES_KEY, {})
    return all[id] || []
  }

  addNote(id: string, content: string, author?: string): ProspectNote {
    const all = readJson<Record<string, ProspectNote[]>>(NOTES_KEY, {})
    const note: ProspectNote = {
      id: newId(),
      content,
      author,
      createdAt: new Date().toISOString(),
    }
    all[id] = [note, ...(all[id] || [])]
    writeJson(NOTES_KEY, all)
    this.addTimelineEntry(id, {
      type: 'note',
      description: content.slice(0, 80) + (content.length > 80 ? '…' : ''),
    })
    return note
  }

  deleteNote(prospectId: string, noteId: string) {
    const all = readJson<Record<string, ProspectNote[]>>(NOTES_KEY, {})
    all[prospectId] = (all[prospectId] || []).filter((n) => n.id !== noteId)
    writeJson(NOTES_KEY, all)
  }

  // ───────── Tasks ─────────
  getTasks(id: string): ProspectTask[] {
    const all = readJson<Record<string, ProspectTask[]>>(TASKS_KEY, {})
    return (all[id] || []).slice().sort((a, b) => {
      // pending arriba, luego por fecha
      if (a.done !== b.done) return a.done ? 1 : -1
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
      return da - db
    })
  }

  addTask(id: string, payload: { title: string; dueDate?: string }): ProspectTask {
    const all = readJson<Record<string, ProspectTask[]>>(TASKS_KEY, {})
    const task: ProspectTask = {
      id: newId(),
      title: payload.title,
      dueDate: payload.dueDate,
      done: false,
      createdAt: new Date().toISOString(),
    }
    all[id] = [task, ...(all[id] || [])]
    writeJson(TASKS_KEY, all)
    this.addTimelineEntry(id, {
      type: 'task_created',
      description: `Tarea: "${payload.title}"`,
      meta: { dueDate: payload.dueDate },
    })
    return task
  }

  toggleTask(prospectId: string, taskId: string): ProspectTask | null {
    const all = readJson<Record<string, ProspectTask[]>>(TASKS_KEY, {})
    const list = all[prospectId] || []
    const task = list.find((t) => t.id === taskId)
    if (!task) return null
    task.done = !task.done
    task.doneAt = task.done ? new Date().toISOString() : undefined
    writeJson(TASKS_KEY, all)
    if (task.done) {
      this.addTimelineEntry(prospectId, {
        type: 'task_completed',
        description: `Tarea completada: "${task.title}"`,
      })
    }
    return task
  }

  deleteTask(prospectId: string, taskId: string) {
    const all = readJson<Record<string, ProspectTask[]>>(TASKS_KEY, {})
    all[prospectId] = (all[prospectId] || []).filter((t) => t.id !== taskId)
    writeJson(TASKS_KEY, all)
  }

  // ───────── Timeline ─────────
  getTimeline(id: string): ProspectTimelineEntry[] {
    const all = readJson<Record<string, ProspectTimelineEntry[]>>(TIMELINE_KEY, {})
    return all[id] || []
  }

  addTimelineEntry(id: string, partial: { type: TimelineEventType; description: string; meta?: Record<string, any> }) {
    const all = readJson<Record<string, ProspectTimelineEntry[]>>(TIMELINE_KEY, {})
    const entry: ProspectTimelineEntry = {
      id: newId(),
      ...partial,
      createdAt: new Date().toISOString(),
    }
    all[id] = [entry, ...(all[id] || [])].slice(0, 200) // cap a 200 eventos
    writeJson(TIMELINE_KEY, all)
  }

  // ───────── Clear all extras (al eliminar) ─────────
  private clearLocalExtras(id: string) {
    ;[STATUS_KEY, META_KEY, NOTES_KEY, TASKS_KEY, TIMELINE_KEY].forEach((key) => {
      const all = readJson<Record<string, any>>(key, {})
      if (all[id] !== undefined) {
        delete all[id]
        writeJson(key, all)
      }
    })
  }

  // ───────── Hidratar prospect con extras locales ─────────
  hydrateFull(prospect: Prospect): Prospect & {
    notes: ProspectNote[]
    tasks: ProspectTask[]
    timeline: ProspectTimelineEntry[]
  } {
    return {
      ...this.hydrate(prospect),
      notes: this.getNotes(prospect._id),
      tasks: this.getTasks(prospect._id),
      timeline: this.getTimeline(prospect._id),
    }
  }

  // ───────── AI Helpers ─────────
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

  /** TL;DR: resume el prospect en 3 bullets accionables */
  async summarize(prospect: Prospect): Promise<string> {
    const history = (prospect.messages || [])
      .slice(-10)
      .map((m) => `${m.role === 'user' ? 'Asesor' : 'IA'}: ${m.content}`)
      .join('\n\n')
      .slice(0, 3500)

    const prompt = `Resume este prospecto comercial en 3 bullets accionables en Markdown.

PROSPECTO: ${prospect.prospectName}
EMPRESA: ${prospect.company || '(sin especificar)'}
ESTADO: ${prospect.status || 'nuevo'}

HISTORIAL:
${history}

ESTRUCTURA REQUERIDA (3 bullets exactos):
- **Qué quiere:** (en una frase)
- **Dolor principal:** (en una frase)
- **Próximo paso recomendado:** (acción concreta en una frase)

Tono: directo, sin relleno. Solo los 3 bullets, nada más.`

    const result = await this.generateWithGemini({ prompt })
    this.addTimelineEntry(prospect._id, {
      type: 'ai_summary',
      description: 'TL;DR generado con IA',
    })
    return result.trim()
  }

  /** Next Best Action: recomienda QUÉ hacer hoy con este prospect */
  async nextBestAction(prospect: Prospect, tasks: ProspectTask[]): Promise<string> {
    const history = (prospect.messages || [])
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'Asesor' : 'IA'}: ${m.content}`)
      .join('\n\n')
      .slice(0, 2500)
    const pendingTasks = tasks
      .filter((t) => !t.done)
      .map((t) => `- ${t.title}${t.dueDate ? ` (vence ${t.dueDate})` : ''}`)
      .join('\n')

    const prompt = `Eres coach de un comercial de GEMS. Recomienda LA acción siguiente más impactante para mover este prospecto.

PROSPECTO: ${prospect.prospectName}
ESTADO: ${prospect.status || 'nuevo'}
ÚLTIMA ACTIVIDAD: ${prospect.lastUpdated || prospect.createdAt}

HISTORIAL:
${history}

TAREAS PENDIENTES:
${pendingTasks || '(ninguna)'}

DEVUELVE EN MARKDOWN (NADA MÁS):
**Acción:** (1 frase imperativa: "Llamar...", "Enviar...", "Esperar...")
**Por qué:** (1 frase justificando)
**Cuándo:** (hoy / esta semana / día específico)`

    const result = await this.generateWithGemini({ prompt })
    this.addTimelineEntry(prospect._id, {
      type: 'ai_action',
      description: 'Next Best Action sugerida por IA',
    })
    return result.trim()
  }

  // ───────── Computed helpers ─────────

  /**
   * Lead score 0-100 basado en:
   * - Engagement (mensajes + outreach): hasta 40 pts
   * - Valor estimado: hasta 25 pts
   * - Probabilidad por status: hasta 25 pts
   * - Recencia de actividad: hasta 10 pts
   */
  computeLeadScore(prospect: Prospect, tasks: ProspectTask[] = []): number {
    let score = 0

    // Engagement
    const msgCount = (prospect.messages?.length || 0)
    score += Math.min(msgCount * 4, 40)

    // Valor
    const val = prospect.estimatedValue || 0
    if (val >= 50000) score += 25
    else if (val >= 10000) score += 18
    else if (val >= 1000) score += 10
    else if (val > 0) score += 5

    // Probability por status
    const prob = prospect.status === 'ganado' ? 100 : prospect.status === 'perdido' ? 0
      : prospect.status === 'seguimiento' ? 75
      : prospect.status === 'propuesta' ? 60
      : prospect.status === 'calificado' ? 30
      : 10
    score += Math.round((prob / 100) * 25)

    // Recencia
    const last = prospect.lastUpdated || prospect.createdAt
    if (last) {
      const daysAgo = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24)
      if (daysAgo < 1) score += 10
      else if (daysAgo < 3) score += 7
      else if (daysAgo < 7) score += 4
      else if (daysAgo < 14) score += 2
    }

    // Bono por tareas pendientes (engagement futuro)
    const pendingTasks = tasks.filter((t) => !t.done).length
    if (pendingTasks > 0) score += Math.min(pendingTasks * 2, 6)

    return Math.min(Math.round(score), 100)
  }

  /**
   * Temperatura del prospect basada en lead score y status.
   * - hot: score >= 70 y no perdido
   * - warm: score 40-69
   * - cold: score < 40 o sin actividad reciente
   */
  computeTemperature(prospect: Prospect, score: number): 'hot' | 'warm' | 'cold' {
    if (prospect.status === 'perdido') return 'cold'
    if (score >= 70) return 'hot'
    if (score >= 40) return 'warm'
    return 'cold'
  }
}

export const prospectService = new ProspectService()
export type { MetaOverride }
