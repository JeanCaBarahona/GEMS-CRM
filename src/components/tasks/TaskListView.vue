<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div v-if="loading" class="text-center py-16 text-slate-400 text-xs font-bold">
      <i class="fas fa-spinner fa-spin mr-1.5"></i>Cargando...
    </div>

    <div v-else-if="totalRows === 0" class="text-center py-16 bg-white">
      <i class="fas fa-list-check text-4xl text-slate-200 mb-3 block"></i>
      <p class="text-sm font-bold text-slate-400">Nada por aquí todavía</p>
    </div>

    <div v-else>
      <!-- Encabezado de columnas (estilo Asana: nombre + columnas fijas) -->
      <div class="hidden md:flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 text-[10px] font-black text-slate-400 uppercase tracking-wider">
        <span class="w-5 shrink-0"></span>
        <span class="flex-1 min-w-0">Nombre</span>
        <span class="w-36 shrink-0">Asignado</span>
        <span class="w-28 shrink-0">Vence</span>
        <span class="w-24 shrink-0 hidden lg:block">Prioridad</span>
        <span class="w-20 shrink-0 text-right pr-1">Acciones</span>
      </div>

      <div v-for="group in groups" :key="group.key" class="border-b border-slate-100 last:border-b-0">
        <!-- Header de sección -->
        <button
          type="button"
          @click="toggleGroup(group.key)"
          class="w-full flex items-center gap-2.5 px-4 py-3 bg-slate-50/40 hover:bg-slate-50 transition-colors text-left"
        >
          <i
            class="fas fa-chevron-right text-[10px] text-slate-400 transition-transform duration-200"
            :class="{ 'rotate-90': !collapsed.has(group.key) }"
          ></i>
          <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="group.dotClass"></span>
          <span class="text-xs font-black text-slate-600 uppercase tracking-wider">{{ group.label }}</span>
          <span class="text-[10px] font-bold text-slate-300">{{ group.rows.length }}</span>
        </button>

        <template v-if="!collapsed.has(group.key)">
          <div
            v-for="row in group.rows"
            :key="row.id"
            class="group flex items-center gap-3 px-4 py-3 border-t border-slate-50 hover:bg-slate-50/70 transition-colors"
          >
            <!-- Recurrente: no se completa, se registra cada día con "+" -->
            <span
              v-if="row.recurring"
              class="w-5 h-5 shrink-0 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center"
              title="Tarea recurrente diaria"
            >
              <i class="fas fa-repeat text-[9px]"></i>
            </span>
            <!-- Completar -->
            <button
              v-else
              type="button"
              @click.stop="emit('toggle-complete', row.raw)"
              class="w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all"
              :class="row.done
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-slate-300 hover:border-primary-400 text-transparent'"
              title="Marcar como completada"
            >
              <i class="fas fa-check text-[9px]"></i>
            </button>

            <!-- Nombre -->
            <button type="button" @click="emit('open', row.raw)" class="flex-1 min-w-0 text-left">
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="text-sm font-bold truncate"
                  :class="row.done ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-primary-600'"
                >{{ row.title }}</span>
                <span
                  v-if="showKindBadge && row.kindLabel"
                  class="shrink-0 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                  :class="row.kindClass"
                >{{ row.kindLabel }}</span>
              </div>
              <p v-if="row.description" class="text-[11px] text-slate-400 font-medium truncate mt-0.5">{{ row.description }}</p>
            </button>

            <!-- Asignado -->
            <div class="w-36 shrink-0 hidden md:flex items-center">
              <div v-if="row.assignees.length" class="flex -space-x-2">
                <AvatarInline
                  v-for="(user, i) in row.assignees.slice(0, 3)"
                  :key="user._id || i"
                  :name="user.name"
                  :photo="user.photo"
                  :avatar="user.avatar"
                  :hide-name="true"
                  class="ring-2 ring-white relative"
                  :style="{ zIndex: 10 - i }"
                />
                <span v-if="row.assignees.length > 3" class="text-[9px] font-black text-slate-500 bg-slate-100 px-1.5 rounded-full ring-2 ring-white relative z-0 flex items-center justify-center">
                  +{{ row.assignees.length - 3 }}
                </span>
              </div>
              <span v-else class="text-[11px] text-slate-300 font-medium">Sin asignar</span>
            </div>

            <!-- Vence (o el "+" del día si es recurrente) -->
            <div class="w-28 shrink-0 hidden md:block">
              <div v-if="row.recurring" class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click.stop="emit('daily-check', row.raw)"
                  class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                  :class="row.recurring.doneToday
                    ? 'bg-teal-500 text-white hover:bg-teal-600'
                    : 'bg-white text-teal-600 border border-teal-200 hover:bg-teal-50'"
                  :title="row.recurring.doneToday ? 'Ya la registraste hoy — clic para deshacer' : 'Registrar que hiciste esta tarea hoy'"
                >
                  <i :class="row.recurring.doneToday ? 'fas fa-check' : 'fas fa-plus'" class="mr-0.5"></i>Hoy
                </button>
                <span class="text-[10px] font-bold text-slate-400" :title="`${row.recurring.totalDays} días registrados · racha de ${row.recurring.streak}`">{{ row.recurring.totalDays }}d</span>
              </div>
              <span
                v-else-if="row.dueDateLabel"
                class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md"
                :class="row.overdue ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'"
              >
                <i class="far fa-calendar text-[9px]"></i>{{ row.dueDateLabel }}
              </span>
              <span v-else class="text-[11px] text-slate-300">—</span>
            </div>

            <!-- Prioridad -->
            <div class="w-24 shrink-0 hidden lg:block">
              <span
                v-if="row.priorityLabel"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black"
                :class="row.priorityClass"
              >
                <i v-if="row.priorityIcon" :class="row.priorityIcon"></i>{{ row.priorityLabel }}
              </span>
            </div>

            <!-- Acciones -->
            <div class="w-20 shrink-0 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button v-if="canEdit" type="button" @click.stop="emit('open', row.raw)" class="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Editar">
                <i class="fas fa-edit text-xs"></i>
              </button>
              <button v-if="canDelete" type="button" @click.stop="emit('delete', row.raw)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                <i class="fas fa-trash text-xs"></i>
              </button>
            </div>
          </div>

          <!-- Fila para agregar -->
          <button
            v-if="showAddRow"
            type="button"
            @click="emit('add-task', group.key)"
            class="w-full flex items-center gap-2.5 px-4 py-2.5 border-t border-slate-50 text-left text-[11px] font-bold text-slate-300 hover:text-primary-500 hover:bg-slate-50/50 transition-colors"
          >
            <i class="fas fa-plus text-[10px]"></i>Agregar tarea...
          </button>
          <div v-else-if="group.rows.length === 0" class="px-4 py-4 text-[11px] text-slate-300 font-medium border-t border-slate-50">
            Nada aquí
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AvatarInline from '@/components/AvatarInline.vue'

export interface TaskListRow {
  id: string
  title: string
  description?: string
  done: boolean
  assignees: Array<{ _id?: string; name: string; photo?: string; avatar?: string }>
  dueDateLabel?: string
  overdue?: boolean
  priorityLabel?: string
  priorityClass?: string
  priorityIcon?: string
  kindLabel?: string
  kindClass?: string
  // Solo tareas recurrentes: estado del "+" diario
  recurring?: { doneToday: boolean; totalDays: number; streak: number }
  raw: any
}

export interface TaskListGroup {
  key: string
  label: string
  dotClass: string
  rows: TaskListRow[]
}

const props = withDefaults(defineProps<{
  groups: TaskListGroup[]
  loading?: boolean
  showKindBadge?: boolean
  showAddRow?: boolean
  canEdit?: boolean
  canDelete?: boolean
}>(), {
  loading: false,
  showKindBadge: false,
  showAddRow: true,
  canEdit: true,
  canDelete: true
})

const emit = defineEmits<{
  open: [raw: any]
  'toggle-complete': [raw: any]
  delete: [raw: any]
  'add-task': [groupKey: string]
  'daily-check': [raw: any]
}>()

const totalRows = computed(() => props.groups.reduce((sum, g) => sum + g.rows.length, 0))

// Grupos colapsados por el usuario en esta sesión (todos empiezan expandidos).
const collapsed = ref(new Set<string>())
function toggleGroup(key: string) {
  const next = new Set(collapsed.value)
  next.has(key) ? next.delete(key) : next.add(key)
  collapsed.value = next
}
</script>
