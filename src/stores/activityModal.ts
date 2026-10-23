import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { activityService, type ActivityData } from '../services/activityService'
import { clientService, type ClientData } from '../services/clientService'
import { teamService } from '../services/teamService'
import { useTasksStore } from './tasks'
import type { TeamMember } from '../types'

/**
 * Store global para abrir el modal "Refinar Tarea" desde cualquier lado
 * (notificaciones, links externos, etc.) sin tener que navegar.
 */
export const useActivityModalStore = defineStore('activityModal', () => {
  const tasksStore = useTasksStore()

  const isOpen = ref(false)
  const loading = ref(false)
  const editingActivity = ref<ActivityData | any | null>(null)
  const clients = ref<ClientData[]>([])
  const teamMembers = ref<TeamMember[]>([])
  const loaded = ref(false)
  // Ids de las actividades/tareas abiertas ahora en algún modal (el de esta
  // store o el de una página): evita abrir otro modal al leer ?openActivity
  const shownIds = ref(new Set<string>())

  function markShown(id: string) {
    shownIds.value = new Set(shownIds.value).add(id)
  }

  function unmarkShown(id: string) {
    const next = new Set(shownIds.value)
    next.delete(id)
    shownIds.value = next
  }

  async function ensureDeps() {
    if (loaded.value) return
    try {
      const [c, t] = await Promise.all([
        clientService.getAll().catch(() => []),
        teamService.getAll().catch(() => []),
      ])
      clients.value = c
      teamMembers.value = t
      loaded.value = true
    } catch (e) {
      console.warn('Error cargando clientes/equipo para modal global:', e)
    }
  }

  /** Abre el modal con una actividad o tarea por id. */
  async function open(entityId: string, entityType: 'activity' | 'task' = 'activity') {
    loading.value = true
    try {
      // Cargar deps en paralelo con la entidad
      await ensureDeps()
      let entity: any = null
      if (entityType === 'task') {
        entity = await tasksStore.fetchTaskById(entityId)
      } else {
        try {
          entity = await activityService.getById(entityId)
        } catch {
          // Si falla el endpoint individual, intentar buscar en la lista
          const all = await activityService.getAll().catch(() => [])
          entity = all.find(a => a._id === entityId) || null
        }
      }
      if (!entity) {
        console.warn(`No se encontró la entidad ${entityType}/${entityId}`)
        return
      }
      editingActivity.value = entity
      isOpen.value = true
    } finally {
      loading.value = false
    }
  }

  function openWith(entity: any) {
    editingActivity.value = entity
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    editingActivity.value = null
  }

  return {
    isOpen,
    loading,
    editingActivity,
    clients,
    teamMembers,
    open,
    openWith,
    close,
    ensureDeps,
    shownIds,
    markShown,
    unmarkShown,
  }
})
