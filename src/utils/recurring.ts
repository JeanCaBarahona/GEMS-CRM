import { todayKeyCR } from '@/services/activityService'

export interface DailyLogEntry {
  date: string // 'YYYY-MM-DD' en hora de Costa Rica
  userId: string | { _id: string }
}

export interface RecurringStats {
  doneToday: boolean       // la persona actual ya le dio "+" hoy
  doneTodayByAnyone: boolean
  totalDays: number        // días distintos con registro (de cualquier persona)
  streak: number           // días hábiles seguidos con registro, hasta hoy (o ayer si hoy aún no)
}

const idOf = (u: DailyLogEntry['userId']) => (typeof u === 'object' ? u?._id : u)

function previousBusinessDay(key: string): string {
  const d = new Date(`${key}T12:00:00Z`)
  do {
    d.setUTCDate(d.getUTCDate() - 1)
  } while (d.getUTCDay() === 0 || d.getUTCDay() === 6)
  return d.toISOString().slice(0, 10)
}

const isWeekend = (key: string) => {
  const day = new Date(`${key}T12:00:00Z`).getUTCDay()
  return day === 0 || day === 6
}

/**
 * Estadísticas del registro diario de una tarea recurrente. La racha cuenta días
 * hábiles: un fin de semana sin registro no la corta (sí suma si alguien registró).
 */
export function recurringStats(log: DailyLogEntry[] | undefined, currentUserId?: string): RecurringStats {
  const entries = log || []
  const today = todayKeyCR()
  const dates = new Set(entries.map(e => e.date))

  let streak = 0
  // Si hoy todavía no se registró, la racha sigue viva desde el día hábil anterior
  let cursor = dates.has(today) ? today : previousBusinessDay(today)
  while (dates.has(cursor)) {
    streak++
    const prev = new Date(`${cursor}T12:00:00Z`)
    prev.setUTCDate(prev.getUTCDate() - 1)
    const prevKey = prev.toISOString().slice(0, 10)
    // Fin de semana con registro: cuenta y sigue; sin registro: se salta
    cursor = dates.has(prevKey) || !isWeekend(prevKey) ? prevKey : previousBusinessDay(cursor)
  }

  return {
    doneToday: !!currentUserId && entries.some(e => e.date === today && String(idOf(e.userId)) === String(currentUserId)),
    doneTodayByAnyone: dates.has(today),
    totalDays: dates.size,
    streak
  }
}
