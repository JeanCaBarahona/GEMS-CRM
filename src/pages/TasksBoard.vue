<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm p-6 border border-slate-100">
      <div class="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
        <!-- Selector de Board -->
        <div class="flex items-center gap-4">
          <div class="relative group">
            <select
              v-model="selectedBoardId"
              @change="onBoardChange"
              class="pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-black text-xs uppercase tracking-widest focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all appearance-none cursor-pointer min-w-[220px]"
            >
              <option value="">Seleccionar Tablero</option>
              <option 
                v-for="board in boards" 
                :key="board._id"
                :value="board._id"
              >
                {{ board.name }}
              </option>
            </select>
            <div class="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
              <i class="fas fa-th-large"></i>
            </div>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
              <i class="fas fa-chevron-down text-[10px]"></i>
            </div>
          </div>

          <!-- Toggle Vista -->
          <div class="flex bg-slate-100 rounded-2xl p-1.5 border border-slate-200">
            <button
              @click="currentView = 'kanban'"
              :class="currentView === 'kanban' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'"
              class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <i class="fas fa-columns"></i>
              Kanban
            </button>
            <button
              @click="currentView = 'list'"
              :class="currentView === 'list' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'"
              class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <i class="fas fa-list"></i>
              Lista
            </button>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <!-- Filtros -->
          <button
            @click="showFilters = !showFilters"
            class="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-sm"
            :class="{'border-primary-400 ring-4 ring-primary-500/10': showFilters}"
          >
            <i class="fas fa-filter text-primary-500"></i>
            Filtros
            <span v-if="activeFiltersCount > 0" class="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-[8px]">{{ activeFiltersCount }}</span>
          </button>

          <!-- Sprint Selector (only Scrum) -->
          <div v-if="currentBoard?.type === 'scrum'" class="relative">
            <select
              v-model="selectedSprintId"
              @change="loadTasks"
              class="pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-black text-xs uppercase tracking-widest focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all appearance-none cursor-pointer"
            >
              <option :value="null">Backlog Activo</option>
              <option 
                v-for="sprint in sprints" 
                :key="sprint._id"
                :value="sprint._id"
              >
                {{ sprint.name }}
              </option>
            </select>
            <div class="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
              <i class="fas fa-running"></i>
            </div>
          </div>

          <!-- Nueva Tarea -->
          <button
            @click="openTaskModal()"
            class="px-6 py-3.5 bg-primary-500 text-white rounded-[1.25rem] hover:bg-primary-600 transition-all shadow-xl shadow-primary-100 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 active:scale-95"
          >
            <i class="fas fa-plus"></i>
            Nueva Tarea
          </button>

          <!-- GitHub -->
          <button
            v-if="currentBoard?.github"
            @click="showGitHubPanel = !showGitHubPanel"
            class="w-12 h-12 flex items-center justify-center bg-slate-800 text-white rounded-2xl hover:bg-black transition-all shadow-lg"
            title="Integración GitHub"
          >
            <i class="fab fa-github text-lg"></i>
          </button>
        </div>
      </div>

      <!-- Filtros Panel -->
      <div v-if="showFilters" class="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 animate-in slide-in-from-top-4 duration-300">
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Tarea</label>
          <select v-model="filters.type" @change="loadTasks" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <option value="">Todos los tipos</option>
            <option value="task">Task</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="user-story">User Story</option>
            <option value="epic">Epic</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prioridad</label>
          <select v-model="filters.priority" @change="loadTasks" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <option value="">Cualquier prioridad</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Equipo / Depto</label>
          <select v-model="filters.department" @change="loadTasks" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <option value="">Todos los equipos</option>
            <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Responsable</label>
          <select v-model="filters.assignedTo" @change="loadTasks" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <option value="">Cualquier persona</option>
            <option :value="authStore.user?._id">Mis Tareas (Yo)</option>
            <option v-for="member in teamMembers" :key="member._id" :value="member._id">{{ member.name }}</option>
          </select>
        </div>
        <div class="flex items-end gap-2">
          <button
            @click="clearFilters"
            class="flex-1 px-4 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Reset
          </button>
          <button
            @click="saveCurrentFilters"
            class="px-4 py-3 bg-primary-50 text-primary-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-100 transition-all"
            title="Guardar filtros por defecto"
          >
            <i class="fas fa-save"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-16 h-16 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin"></div>
      <p class="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">Sincronizando Customer Touch...</p>
    </div>

    <!-- Kanban View -->
    <div v-else-if="currentView === 'kanban' && selectedBoardId" class="overflow-x-auto custom-scrollbar pb-6">
      <div class="flex space-x-6 min-w-max px-1">
        <div
          v-for="column in columns"
          :key="column.id"
          class="bg-slate-50/50 backdrop-blur-sm rounded-[2rem] p-3 border border-slate-200/60 w-96 flex-shrink-0 flex flex-col max-h-[calc(100vh-280px)]"
        >
          <!-- Column Header -->
          <div class="flex items-center justify-between mb-6 px-1">
            <div class="flex items-center gap-3">
              <div class="w-2.5 h-2.5 rounded-full" :class="getColumnColor(column.id)"></div>
              <h3 class="text-slate-800 font-black text-xs uppercase tracking-widest">{{ column.name }}</h3>
              <span class="bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-black">
                {{ getColumnTasks(column.id).length }}
              </span>
            </div>
            <button
              @click="openTaskModal(column.id)"
              class="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-primary-500 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100"
            >
              <i class="fas fa-plus text-xs"></i>
            </button>
          </div>

          <!-- Tasks List -->
          <div 
            class="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-[150px]"
            @drop="onDrop($event, column.id)"
            @dragover.prevent
            @dragenter.prevent
          >
            <div
              v-for="task in getColumnTasks(column.id)"
              :key="task._id"
              draggable="true"
              @dragstart="onDragStart($event, task)"
              @dragend="onDragEnd"
              class="bg-white rounded-[1.5rem] p-3 border border-slate-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all cursor-move group relative animate-in fade-in duration-500"
            >
              <!-- Clickable Content Wrapper -->
              <div @click.stop="openTaskDetail(task)" class="cursor-pointer">
                <!-- Task Header -->
                <div class="flex items-start justify-between gap-3 mb-3">
                  <div class="flex items-start gap-2 flex-1">
                    <div class="mt-1 w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: getTaskTypeColor(task.type) }"></div>
                    <h4 class="text-slate-700 text-sm font-bold flex-1 leading-snug group-hover:text-primary-600 transition-colors">{{ task.title }}</h4>
                  </div>
                  <span 
                    class="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider flex-shrink-0 border"
                    :class="getPriorityClass(task.priority)"
                  >
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </div>

                <!-- Metadata & Assignee -->
                <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                  <div class="flex -space-x-2">
                    <div v-if="task.assignedTo" class="group/avatar relative">
                      <div class="w-8 h-8 rounded-full border-2 border-white bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-black shadow-sm overflow-hidden">
                        <img v-if="task.assignedTo.photo" :src="task.assignedTo.photo" class="w-full h-full object-cover" />
                        <span v-else>{{ getInitials(task.assignedTo.name) }}</span>
                      </div>
                    </div>
                    <div v-else class="w-8 h-8 rounded-full border-2 border-white bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] shadow-sm">
                      <i class="fas fa-user-plus text-[8px]"></i>
                    </div>
                  </div>

                  <div class="flex items-center gap-3 text-slate-400">
                    <div v-if="task.comments?.length" class="flex items-center gap-1.5">
                      <i class="far fa-comment text-[10px]"></i>
                      <span class="text-[10px] font-bold">{{ task.comments.length }}</span>
                    </div>
                    <div class="flex items-center gap-1.5" :class="{'text-emerald-500 font-bold': task.activeSessions?.length}">
                      <i class="far fa-clock text-[10px]"></i>
                      <span class="text-[10px] font-black tracking-tighter">{{ Number(task.actualHours || 0).toFixed(1) }}h</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Timer Mini-Indicator -->
              <div v-if="task.activeSessions?.length" class="absolute -top-1 -right-1 flex gap-1">
                <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
              </div>

              <!-- Quick Edit Overlay Icon -->
              <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="w-6 h-6 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center text-[8px] shadow-sm">
                  <i class="fas fa-pen"></i>
                </div>
              </div>
            </div>

            <!-- Empty Column State (Soft) -->
            <div v-if="getColumnTasks(column.id).length === 0" class="flex flex-col items-center justify-center py-10 opacity-20 group-hover:opacity-40 transition-opacity">
              <i class="fas fa-layer-group text-3xl mb-2 text-slate-300"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else-if="currentView === 'list' && selectedBoardId" class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tarea</th>
              <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tipo</th>
              <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
              <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Prioridad</th>
              <th class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Responsable</th>
              <th class="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tiempo</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="task in tasks" 
              :key="task._id"
              @click="openTaskDetail(task)"
              class="hover:bg-slate-50/80 cursor-pointer transition-colors group"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: getTaskTypeColor(task.type) }"></div>
                  <div class="text-slate-700 font-bold text-sm group-hover:text-primary-600 transition-colors">{{ task.title }}</div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-[10px] font-black uppercase text-slate-400">{{ getTaskTypeLabel(task.type) }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider" :class="getBoardStatusClass(task.boardStatus)">
                  {{ getBoardStatusLabel(task.boardStatus) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border" :class="getPriorityClass(task.priority)">
                  {{ getPriorityLabel(task.priority) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div v-if="task.assignedTo" class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-black border border-white shadow-sm">
                    {{ getInitials(task.assignedTo.name) }}
                  </div>
                  <span class="text-slate-600 text-xs font-bold">{{ task.assignedTo.name }}</span>
                </div>
                <span v-else class="text-slate-300 text-xs italic">Sin asignar</span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="text-slate-700 font-black text-xs">{{ Number(task.actualHours || 0).toFixed(1) }}<span class="text-[10px] text-slate-400 ml-0.5">h</span></div>
                <div class="text-[9px] text-slate-400 uppercase tracking-tighter">Est: {{ task.estimatedHours || 0 }}h</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Global Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-32 text-center">
      <div class="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-100 mb-8 animate-bounce duration-[3s]">
        <i class="fas fa-rocket text-4xl text-primary-200"></i>
      </div>
      <h3 class="text-2xl font-black text-slate-800 tracking-tight mb-2">Comienza tu viaje en Customer Touch</h3>
      <p class="text-slate-400 font-medium text-sm max-w-md">
        Selecciona un tablero para visualizar el flujo de trabajo y comenzar a gestionar la productividad de tu equipo.
      </p>
    </div>

    <!-- Task Modal -->
    <ActivityFormModal
      v-if="showTaskModal"
      :activity="selectedTask"
      :clients="clients"
      :teamMembers="teamMembers"
      :sprints="currentBoard?.sprints"
      :initialBoardStatus="initialColumnId"
      :boardId="selectedBoardId"
      @close="closeTaskModal"
      @saved="onTaskSaved"
    />

    <!-- Debug Overlay -->
    <div v-if="showTaskModal" class="fixed bottom-4 right-4 bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl z-[9999] text-[10px] font-black border border-white/20 shadow-2xl">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
        ESTADO: MODAL ABIERTO
      </div>
      <div class="mt-1 text-slate-400">Tarea: {{ selectedTask?._id || 'NUEVA' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBoardsStore } from '@/stores/boards'
import { useTasksStore, type Task } from '@/stores/tasks'
import { useAuthStore } from '@/stores/auth'
import { teamService } from '@/services/teamService'
import { clientService } from '@/services/clientService'
import ActivityFormModal from '../components/forms/ActivityFormModal.vue'
import { useNotifications } from '@/composables/useNotifications'

console.log('TasksBoard initialized')

const authStore = useAuthStore()
const boardsStore = useBoardsStore()
const tasksStore = useTasksStore()
const { showSuccess, showError } = useNotifications()

const currentView = ref<'kanban' | 'list'>('kanban')
const selectedBoardId = ref<string>('')
const selectedSprintId = ref<string | null>(null)
const showFilters = ref(false)
const showGitHubPanel = ref(false)
const showTaskModal = ref(false)
const selectedTask = ref<Task | null>(null)
const initialColumnId = ref('backlog')
const teamMembers = ref<any[]>([])
const clients = ref([])
const departments = ref<string[]>(['TI', 'Comercial', 'Marketing'])

watch(showTaskModal, (val) => {
  console.log('showTaskModal changed to:', val)
})

watch(selectedTask, (val) => {
  console.log('selectedTask changed to:', val)
})

const filters = ref({
  type: '',
  priority: '',
  status: '',
  department: '',
  assignedTo: authStore.user?._id || '' // Por defecto el usuario actual
})

const boards = computed(() => boardsStore.myBoards)
const currentBoard = computed(() => boardsStore.currentBoard)
const sprints = computed(() => boardsStore.currentBoardSprints)
const tasks = computed(() => tasksStore.tasks)
const loading = computed(() => boardsStore.loading || tasksStore.loading)

const activeFiltersCount = computed(() => {
  return Object.values(filters.value).filter(v => v !== '').length
})

const columns = computed(() => {
  if (!currentBoard.value) return []
  return currentBoard.value.columns.sort((a, b) => a.order - b.order)
})

function getColumnTasks(columnId: string): Task[] {
  return tasks.value.filter(task => task.boardStatus === columnId)
}

function getColumnColor(columnId: string): string {
  const colors: Record<string, string> = {
    'backlog': 'bg-slate-300',
    'todo': 'bg-primary-400',
    'in-progress': 'bg-amber-400',
    'review': 'bg-indigo-400',
    'testing': 'bg-rose-400',
    'done': 'bg-emerald-400'
  }
  return colors[columnId] || 'bg-slate-300'
}

function getTaskTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'task': '#52c2ef',
    'bug': '#F43F5E',
    'feature': '#8B5CF6',
    'user-story': '#10B981',
    'epic': '#F59E0B'
  }
  return colors[type] || '#94A3B8'
}

function getTaskTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'task': 'Tarea',
    'bug': 'Error',
    'feature': 'Feature',
    'user-story': 'Story',
    'epic': 'Epic'
  }
  return labels[type] || type
}

function getPriorityClass(priority: string): string {
  const classes: Record<string, string> = {
    'low': 'bg-slate-50 text-slate-500 border-slate-100',
    'medium': 'bg-primary-50 text-primary-600 border-primary-100',
    'high': 'bg-amber-50 text-amber-600 border-amber-100',
    'critical': 'bg-rose-50 text-rose-600 border-rose-100',
    'urgent': 'bg-rose-50 text-rose-600 border-rose-100'
  }
  return classes[priority] || 'bg-slate-50 text-slate-500 border-slate-100'
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta',
    'critical': 'Crítica',
    'urgent': 'Crítica'
  }
  return labels[priority] || priority
}

function getBoardStatusClass(status: string): string {
  const classes: Record<string, string> = {
    'backlog': 'bg-slate-100 text-slate-500',
    'todo': 'bg-primary-50 text-primary-600',
    'in-progress': 'bg-amber-50 text-amber-600',
    'review': 'bg-indigo-50 text-indigo-600',
    'testing': 'bg-rose-50 text-rose-600',
    'done': 'bg-emerald-50 text-emerald-600'
  }
  return classes[status] || 'bg-slate-100 text-slate-500'
}

function getBoardStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'backlog': 'Backlog',
    'todo': 'Pendiente',
    'in-progress': 'Ejecución',
    'review': 'Revisión',
    'testing': 'QA',
    'done': 'Finalizado'
  }
  return labels[status] || status
}

function getInitials(name: string): string {
  if (!name) return '??'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

let draggedTask: Task | null = null

function onDragStart(event: DragEvent, task: Task) {
  draggedTask = task
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onDragEnd() {
  draggedTask = null
}

async function onDrop(event: DragEvent, targetColumnId: string) {
  event.preventDefault()
  if (draggedTask && draggedTask.boardStatus !== targetColumnId) {
    try {
      await tasksStore.moveTask(draggedTask._id, targetColumnId)
      showSuccess('Movimiento sincronizado')
    } catch (error) {
      showError('Error al mover la tarea')
    }
  }
}

async function onBoardChange() {
  if (selectedBoardId.value) {
    await boardsStore.fetchBoardById(selectedBoardId.value)
    await loadTasks()
  }
}

async function loadTasks() {
  if (!selectedBoardId.value) return
  
  const filterParams: any = {
    ...filters.value,
    sprint: selectedSprintId.value || undefined
  }
  
  Object.keys(filterParams).forEach(key => {
    if (!filterParams[key]) {
      delete filterParams[key]
    }
  })
  
  await tasksStore.fetchTasks(selectedBoardId.value, filterParams)
}

function clearFilters() {
  filters.value = { type: '', priority: '', status: '', department: '', assignedTo: '' }
  loadTasks()
}

function saveCurrentFilters() {
  localStorage.setItem('customer_touch_filters', JSON.stringify(filters.value))
  showSuccess('Filtros guardados como predeterminados')
}

function openTaskModal(columnId?: string) {
  selectedTask.value = null
  initialColumnId.value = columnId || 'backlog'
  showTaskModal.value = true
}

function openTaskDetail(task: Task) {
  console.log('openTaskDetail called with task:', task)
  selectedTask.value = task
  showTaskModal.value = true
}

function closeTaskModal() {
  showTaskModal.value = false
  selectedTask.value = null
}

async function onTaskSaved() {
  await loadTasks()
}

onMounted(async () => {
  console.log('TasksBoard onMounted started')
  try {
    // Cargar filtros guardados
    const saved = localStorage.getItem('customer_touch_filters')
    if (saved) {
      try {
        filters.value = JSON.parse(saved)
      } catch (e) {}
    }

    await boardsStore.fetchBoards()
    if (boards.value.length > 0) {
      selectedBoardId.value = boards.value[0]._id
      await boardsStore.fetchBoardById(selectedBoardId.value)
      await loadTasks()
    }

    const [team, cls] = await Promise.all([
      teamService.getActiveMembers(),
      clientService.getAll()
    ])
    teamMembers.value = team
    clients.value = cls
    console.log('TasksBoard data loaded:', { teamMembers: team.length, clients: cls.length })
  } catch (error) {
    console.error('Error in TasksBoard onMounted:', error)
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #f1f5f9;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #e2e8f0;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in-from-top-4 {
  from { transform: translateY(-1rem); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-in {
  animation-fill-mode: forwards;
}
.fade-in {
  animation-name: fade-in;
}
.slide-in-from-top-4 {
  animation-name: slide-in-from-top-4;
}
</style>
