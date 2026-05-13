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

// localStorage keys (fallback / legacy)
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
 * Servicio de Prospectos.
 *
 * El backend ahora soporta: status, valor, fuente, contacto, owner, notes, tasks, timeline.
 * Si una operación contra el backend falla (red, 404, 500), caemos a localStorage
 * como fallback para no perder cambios. Esto permite que la app siga siendo usable
 * en modo offline o si un endpoint todavía no se desplegó.
 */
class ProspectService {
  private apiUrl = `${API_CONFIG.BASE_URL}/prospects`

  // ──────────── HIDRATADO ────────────
  // El backend devuelve todo lo que necesitamos. Solo aplicamos overrides
  // locales si vienen vacíos (compatibilidad con datos viejos).
  private hydrate(prospect: Prospect): Prospect {
    const statuses = readJson<Record<string, ProspectStatus>>(STATUS_KEY, {})
    const metas = readJson<Record<string, MetaOverride>>(META_KEY, {})
    const localStatus = statuses[prospect._id]
    const localMeta = metas[prospect._id] || {}

    return {
      ...prospect,
      status: prospect.status || localStatus || 'nuevo',
      estimatedValue: prospect.estimatedValue ?? localMeta.estimatedValue,
      source: prospect.source ?? localMeta.source,
      contactName: prospect.contactName ?? localMeta.contactName,
      contactEmail: prospect.contactEmail ?? localMeta.contactEmail,
      contactPhone: prospect.contactPhone ?? localMeta.contactPhone,
      ownerId: prospect.ownerId ?? localMeta.ownerId,
    }
  }

  // ──────────── CRUD básico ────────────

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
    if (data && typeof data === 'object' && '_id' in data) {
      return this.hydrate(data as Prospect)
    }
    return this.get(id)
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 404) {
        throw new Error('No se pudo eliminar el prospecto')
      }
    } finally {
      // Siempre limpia caches locales aunque el back falle
      this.clearLocalExtras(id)
    }
  }

  // ──────────── PATCH metadata (status, valor, fuente, contacto) ────────────

  private async patch(id: string, body: Record<string, any>): Promise<Prospect | null> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) return null
      return this.hydrate(await response.json())
    } catch {
      return null
    }
  }

  async setStatus(id: string, status: ProspectStatus): Promise<void> {
    // Optimista: actualiza localStorage primero (UI instantánea)
    const all = readJson<Record<string, ProspectStatus>>(STATUS_KEY, {})
    all[id] = status
    writeJson(STATUS_KEY, all)
    // Sincroniza con backend
    await this.patch(id, { status })
  }

  async setMetadata(id: string, meta: MetaOverride): Promise<void> {
    // Optimista
    const all = readJson<Record<string, MetaOverride>>(META_KEY, {})
    all[id] = { ...(all[id] || {}), ...meta }
    writeJson(META_KEY, all)
    // Backend
    await this.patch(id, meta)
  }

  getMetadata(id: string): MetaOverride {
    const all = readJson<Record<string, MetaOverride>>(META_KEY, {})
    return all[id] || {}
  }

  // ──────────── NOTAS ────────────

  getNotes(id: string): ProspectNote[] {
    const all = readJson<Record<string, ProspectNote[]>>(NOTES_KEY, {})
    return all[id] || []
  }

  async addNote(id: string, content: string, author?: string): Promise<ProspectNote> {
    const note: ProspectNote = {
      id: newId(),
      content,
      author,
      createdAt: new Date().toISOString(),
    }
    // Optimista: cache local primero
    const all = readJson<Record<string, ProspectNote[]>>(NOTES_KEY, {})
    all[id] = [note, ...(all[id] || [])]
    writeJson(NOTES_KEY, all)

    // Backend
    try {
      const response = await fetch(`${this.apiUrl}/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author }),
      })
      if (response.ok) {
        // Sincroniza la lista completa desde la respuesta
        const updated = await response.json()
        if (updated.notes) {
          all[id] = updated.notes.map((n: any) => ({
            id: n._id || n.id || newId(),
            content: n.content,
            author: n.author,
            createdAt: n.createdAt || new Date().toISOString(),
          }))
          writeJson(NOTES_KEY, all)
        }
      }
    } catch { /* offline: queda en localStorage */ }
    return note
  }

  async deleteNote(prospectId: string, noteId: string): Promise<void> {
    // Optimista
    const all = readJson<Record<string, ProspectNote[]>>(NOTES_KEY, {})
    all[prospectId] = (all[prospectId] || []).filter((n) => n.id !== noteId)
    writeJson(NOTES_KEY, all)
    // Backend
    try {
      await fetch(`${this.apiUrl}/${prospectId}/notes/${noteId}`, { method: 'DELETE' })
    } catch { /* offline */ }
  }

  // ──────────── TAREAS ────────────

  getTasks(id: string): ProspectTask[] {
    const all = readJson<Record<string, ProspectTask[]>>(TASKS_KEY, {})
    return (all[id] || []).slice().sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
      return da - db
    })
  }

  async addTask(id: string, payload: { title: string; dueDate?: string }): Promise<ProspectTask> {
    const task: ProspectTask = {
      id: newId(),
      title: payload.title,
      dueDate: payload.dueDate,
      done: false,
      createdAt: new Date().toISOString(),
    }
    const all = readJson<Record<string, ProspectTask[]>>(TASKS_KEY, {})
    all[id] = [task, ...(all[id] || [])]
    writeJson(TASKS_KEY, all)

    try {
      const response = await fetch(`${this.apiUrl}/${id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        const updated = await response.json()
        if (updated.tasks) {
          all[id] = this.normalizeTasks(updated.tasks)
          writeJson(TASKS_KEY, all)
        }
      }
    } catch { /* offline */ }
    return task
  }

  async toggleTask(prospectId: string, taskId: string): Promise<void> {
    const all = readJson<Record<string, ProspectTask[]>>(TASKS_KEY, {})
    const list = all[prospectId] || []
    const task = list.find((t) => t.id === taskId)
    if (task) {
      task.done = !task.done
      task.doneAt = task.done ? new Date().toISOString() : undefined
      writeJson(TASKS_KEY, all)
    }
    try {
      const response = await fetch(`${this.apiUrl}/${prospectId}/tasks/${taskId}/toggle`, { method: 'PATCH' })
      if (response.ok) {
        const updated = await response.json()
        if (updated.tasks) {
          all[prospectId] = this.normalizeTasks(updated.tasks)
          writeJson(TASKS_KEY, all)
        }
      }
    } catch { /* offline */ }
  }

  async deleteTask(prospectId: string, taskId: string): Promise<void> {
    const all = readJson<Record<string, ProspectTask[]>>(TASKS_KEY, {})
    all[prospectId] = (all[prospectId] || []).filter((t) => t.id !== taskId)
    writeJson(TASKS_KEY, all)
    try {
      await fetch(`${this.apiUrl}/${prospectId}/tasks/${taskId}`, { method: 'DELETE' })
    } catch { /* offline */ }
  }

  private normalizeTasks(tasks: any[]): ProspectTask[] {
    return tasks.map((t) => ({
      id: t._id || t.id,
      title: t.title,
      dueDate: t.dueDate,
      done: !!t.done,
      doneAt: t.doneAt,
      createdAt: t.createdAt || new Date().toISOString(),
    }))
  }

  // ──────────── TIMELINE ────────────

  getTimeline(id: string): ProspectTimelineEntry[] {
    const all = readJson<Record<string, ProspectTimelineEntry[]>>(TIMELINE_KEY, {})
    return all[id] || []
  }

  async addTimelineEntry(id: string, partial: { type: TimelineEventType; description: string; meta?: Record<string, any> }): Promise<void> {
    const entry: ProspectTimelineEntry = {
      id: newId(),
      ...partial,
      createdAt: new Date().toISOString(),
    }
    const all = readJson<Record<string, ProspectTimelineEntry[]>>(TIMELINE_KEY, {})
    all[id] = [entry, ...(all[id] || [])].slice(0, 200)
    writeJson(TIMELINE_KEY, all)

    try {
      await fetch(`${this.apiUrl}/${id}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      })
    } catch { /* offline */ }
  }

  /** Sincroniza notes/tasks/timeline desde el backend (al cargar el detail) */
  async syncExtras(prospect: Prospect): Promise<{
    notes: ProspectNote[]
    tasks: ProspectTask[]
    timeline: ProspectTimelineEntry[]
  }> {
    try {
      const fresh = await this.get(prospect._id)
      const anyFresh = fresh as any
      const notes = (anyFresh.notes || []).map((n: any) => ({
        id: n._id || n.id,
        content: n.content,
        author: n.author,
        createdAt: n.createdAt,
      }))
      const tasks = this.normalizeTasks(anyFresh.tasks || [])
      const timeline = (anyFresh.timeline || []).map((t: any) => ({
        id: t._id || t.id,
        type: t.type,
        description: t.description,
        meta: t.meta,
        createdAt: t.createdAt,
      }))
      // Hidratar caches locales
      const allNotes = readJson<Record<string, ProspectNote[]>>(NOTES_KEY, {})
      allNotes[prospect._id] = notes
      writeJson(NOTES_KEY, allNotes)

      const allTasks = readJson<Record<string, ProspectTask[]>>(TASKS_KEY, {})
      allTasks[prospect._id] = tasks
      writeJson(TASKS_KEY, allTasks)

      const allTL = readJson<Record<string, ProspectTimelineEntry[]>>(TIMELINE_KEY, {})
      allTL[prospect._id] = timeline
      writeJson(TIMELINE_KEY, allTL)

      return { notes, tasks, timeline }
    } catch {
      // Si falla, devolvemos lo que haya en local
      return {
        notes: this.getNotes(prospect._id),
        tasks: this.getTasks(prospect._id),
        timeline: this.getTimeline(prospect._id),
      }
    }
  }

  // ──────────── Limpieza ────────────
  private clearLocalExtras(id: string) {
    ;[STATUS_KEY, META_KEY, NOTES_KEY, TASKS_KEY, TIMELINE_KEY].forEach((key) => {
      const all = readJson<Record<string, any>>(key, {})
      if (all[id] !== undefined) {
        delete all[id]
        writeJson(key, all)
      }
    })
  }

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

  // ──────────── AI Helpers ────────────
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
    await this.addTimelineEntry(prospect._id, {
      type: 'ai_summary',
      description: 'TL;DR generado con IA',
    })
    return result.trim()
  }

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
    await this.addTimelineEntry(prospect._id, {
      type: 'ai_action',
      description: 'Next Best Action sugerida por IA',
    })
    return result.trim()
  }

  // ──────────── Computed helpers ────────────
  computeLeadScore(prospect: Prospect, tasks: ProspectTask[] = []): number {
    let score = 0
    const msgCount = (prospect.messages?.length || 0)
    score += Math.min(msgCount * 4, 40)

    const val = prospect.estimatedValue || 0
    if (val >= 50000) score += 25
    else if (val >= 10000) score += 18
    else if (val >= 1000) score += 10
    else if (val > 0) score += 5

    const prob = prospect.status === 'ganado' ? 100 : prospect.status === 'perdido' ? 0
      : prospect.status === 'seguimiento' ? 75
      : prospect.status === 'propuesta' ? 60
      : prospect.status === 'calificado' ? 30
      : 10
    score += Math.round((prob / 100) * 25)

    const last = prospect.lastUpdated || prospect.createdAt
    if (last) {
      const daysAgo = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24)
      if (daysAgo < 1) score += 10
      else if (daysAgo < 3) score += 7
      else if (daysAgo < 7) score += 4
      else if (daysAgo < 14) score += 2
    }

    const pendingTasks = tasks.filter((t) => !t.done).length
    if (pendingTasks > 0) score += Math.min(pendingTasks * 2, 6)

    return Math.min(Math.round(score), 100)
  }

  computeTemperature(prospect: Prospect, score: number): 'hot' | 'warm' | 'cold' {
    if (prospect.status === 'perdido') return 'cold'
    if (score >= 70) return 'hot'
    if (score >= 40) return 'warm'
    return 'cold'
  }
}

export const prospectService = new ProspectService()
export type { MetaOverride }
