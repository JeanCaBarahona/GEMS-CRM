import { computed, ref, type Ref } from 'vue'

export type SortDirection = 'asc' | 'desc'

interface Options<T> {
  /** Filtros combinables: cada uno es una función (item) => boolean.
   *  El valor puede ser un ref (para reactividad) o un valor plano. */
  filters?: Record<string, Ref<((item: T) => boolean) | null>>
  /** Claves ordenables. Si el valor es una función, se usa como accessor. */
  sortAccessors?: Partial<Record<string, (item: T) => string | number | Date | null | undefined>>
  /** Columna de orden por defecto. */
  defaultSortKey?: string
  defaultSortDir?: SortDirection
}

/**
 * Orden + filtro combinable sobre un array reactivo, sin dependencias.
 * Sigue el patrón ya usado en toda la app (computed que filtra un array
 * en memoria) — pensado para catálogos de decenas/cientos de filas, no miles.
 */
export function useSortableFilterableList<T>(items: Ref<T[]>, options: Options<T> = {}) {
  const sortKey = ref<string | null>(options.defaultSortKey ?? null)
  const sortDir = ref<SortDirection>(options.defaultSortDir ?? 'asc')

  const toggleSort = (key: string) => {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDir.value = 'asc'
    }
  }

  const filteredSorted = computed<T[]>(() => {
    let result = items.value

    if (options.filters) {
      for (const predicate of Object.values(options.filters)) {
        const fn = predicate.value
        if (fn) result = result.filter(fn)
      }
    }

    if (sortKey.value) {
      const key = sortKey.value
      const accessor = options.sortAccessors?.[key] ?? ((item: T) => (item as Record<string, unknown>)[key] as string | number | Date)
      const dir = sortDir.value === 'asc' ? 1 : -1
      result = [...result].sort((a, b) => {
        const av = accessor(a)
        const bv = accessor(b)
        if (av == null && bv == null) return 0
        if (av == null) return 1
        if (bv == null) return -1
        if (av instanceof Date || bv instanceof Date) {
          return (new Date(av as any).getTime() - new Date(bv as any).getTime()) * dir
        }
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
        return String(av).localeCompare(String(bv), 'es', { sensitivity: 'base' }) * dir
      })
    }

    return result
  })

  return { sortKey, sortDir, toggleSort, filteredSorted }
}
