<template>
  <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200">
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider select-none',
                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                col.sortable !== false ? 'cursor-pointer hover:text-slate-800 transition-colors' : ''
              ]"
              @click="col.sortable !== false && emit('sort', col.key)"
            >
              <span class="inline-flex items-center gap-1.5">
                {{ col.label }}
                <i
                  v-if="col.sortable !== false"
                  class="fas text-[9px] transition-opacity"
                  :class="[
                    sortKey === col.key ? (sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort opacity-30'
                  ]"
                ></i>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="rowKey(item)"
            class="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors cursor-pointer"
            @click="emit('row-click', item)"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-4 py-3 align-middle',
                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
              ]"
              @click="col.editable && $event.stopPropagation()"
            >
              <slot :name="`cell-${col.key}`" :item="item">
                {{ (item as Record<string, unknown>)[col.key] ?? '—' }}
              </slot>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td :colspan="columns.length" class="px-4 py-12 text-center text-slate-400 text-sm font-medium">
              <slot name="empty">Sin resultados.</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends object">
export interface DataGridColumn {
  key: string
  label: string
  /** false = columna no ordenable (íconos/acciones). Por defecto true. */
  sortable?: boolean
  /** true = la celda contiene un control editable; evita que el click abra el detalle de la fila. */
  editable?: boolean
  align?: 'left' | 'right' | 'center'
}

defineProps<{
  columns: DataGridColumn[]
  items: T[]
  rowKey: (item: T) => string
  sortKey?: string | null
  sortDir?: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  (e: 'sort', key: string): void
  (e: 'row-click', item: T): void
}>()
</script>
