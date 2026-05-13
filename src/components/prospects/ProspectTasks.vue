<template>
  <div class="space-y-4 p-5">
    <!-- Add task -->
    <div class="bg-white border border-slate-200 rounded-xl p-3 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all">
      <input
        v-model="newTitle"
        type="text"
        placeholder="Nueva tarea: 'Llamar al cliente el martes', 'Enviar caso de éxito'..."
        class="w-full bg-transparent border-none outline-none text-xs font-bold text-slate-800 placeholder-slate-400"
        @keydown.enter="addTask"
      />
      <div class="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
        <input
          v-model="newDueDate"
          type="datetime-local"
          class="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 outline-none focus:border-violet-500"
        />
        <button
          @click="addTask"
          :disabled="!newTitle.trim()"
          class="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Crear
        </button>
      </div>
    </div>

    <!-- Pending -->
    <div v-if="pendingTasks.length" class="space-y-1.5">
      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
        Pendientes ({{ pendingTasks.length }})
      </p>
      <div
        v-for="task in pendingTasks"
        :key="task.id"
        :class="[
          'flex items-start gap-3 p-3 rounded-xl border transition-all group',
          isOverdue(task.dueDate) ? 'bg-rose-50/40 border-rose-200/60' : 'bg-white border-slate-200 hover:border-slate-300',
        ]"
      >
        <button
          @click="$emit('toggle', task.id)"
          class="w-5 h-5 rounded-md border-2 border-slate-300 hover:border-emerald-500 flex-shrink-0 flex items-center justify-center transition-colors mt-0.5"
        >
        </button>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-slate-800">{{ task.title }}</p>
          <p v-if="task.dueDate" :class="['text-[10px] font-bold mt-0.5', isOverdue(task.dueDate) ? 'text-rose-600' : 'text-slate-500']">
            <i class="far fa-clock text-[9px] mr-1"></i>
            {{ formatDue(task.dueDate) }}
          </p>
        </div>
        <button
          @click="$emit('remove', task.id)"
          class="text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Eliminar"
        >
          <i class="fas fa-trash text-[10px]"></i>
        </button>
      </div>
    </div>

    <!-- Done -->
    <div v-if="doneTasks.length" class="space-y-1.5">
      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
        Completadas ({{ doneTasks.length }})
      </p>
      <div
        v-for="task in doneTasks"
        :key="task.id"
        class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 group"
      >
        <button
          @click="$emit('toggle', task.id)"
          class="w-5 h-5 rounded-md bg-emerald-500 text-white flex-shrink-0 flex items-center justify-center"
        >
          <i class="fas fa-check text-[9px]"></i>
        </button>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-slate-500 line-through truncate">{{ task.title }}</p>
        </div>
        <button
          @click="$emit('remove', task.id)"
          class="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Eliminar"
        >
          <i class="fas fa-trash text-[10px]"></i>
        </button>
      </div>
    </div>

    <div v-if="!tasks.length" class="text-center py-8">
      <i class="fas fa-list-check text-3xl text-slate-200 mb-2 block"></i>
      <p class="text-xs font-bold text-slate-400">Sin tareas aún</p>
      <p class="text-[10px] text-slate-400 mt-1">Crea recordatorios para no perder el seguimiento</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ProspectTask } from '@/types/prospect'

interface Props {
  tasks: ProspectTask[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: [payload: { title: string; dueDate?: string }]
  toggle: [id: string]
  remove: [id: string]
}>()

const newTitle = ref('')
const newDueDate = ref('')

const pendingTasks = computed(() => props.tasks.filter((t) => !t.done))
const doneTasks = computed(() => props.tasks.filter((t) => t.done))

const addTask = () => {
  if (!newTitle.value.trim()) return
  emit('add', {
    title: newTitle.value.trim(),
    dueDate: newDueDate.value || undefined,
  })
  newTitle.value = ''
  newDueDate.value = ''
}

const isOverdue = (dueDate?: string) => {
  if (!dueDate) return false
  return new Date(dueDate).getTime() < Date.now()
}

const formatDue = (dueDate: string) => {
  try {
    const d = new Date(dueDate)
    const diff = Math.abs(Date.now() - d.getTime())
    // Si es < 7 días, mostrar relativo
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(d, { addSuffix: true, locale: es })
    }
    return format(d, "d MMM, HH:mm", { locale: es })
  } catch {
    return dueDate
  }
}
</script>
