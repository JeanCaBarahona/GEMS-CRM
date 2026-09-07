<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <div v-if="loading" class="text-center py-20 text-slate-400 text-sm font-bold">
      <i class="fas fa-spinner fa-spin mr-1.5"></i>Cargando proyecto...
    </div>

    <div v-else-if="!project" class="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
      <i class="fas fa-triangle-exclamation text-3xl text-slate-300 mb-3"></i>
      <p class="text-slate-500 font-medium">No se encontró este proyecto.</p>
    </div>

    <template v-else>
      <!-- Cover -->
      <div class="h-36 md:h-44 w-full rounded-2xl overflow-hidden relative group">
        <div :class="coverGradient(project.status)" class="absolute inset-0 opacity-90"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <i class="fas fa-diagram-project text-white/20 text-7xl md:text-8xl"></i>
        </div>
        <router-link
          :to="`/clients/${clientId}`"
          class="absolute top-4 left-4 px-3 py-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-md transition-all"
        >
          <i class="fas fa-arrow-left mr-1.5"></i>{{ client?.name || 'Cliente' }}
        </router-link>
        <span :class="statusChipClass(project.status)" class="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md backdrop-blur-md">
          {{ statusLabel(project.status) }}
        </span>
      </div>

      <div>
        <h1 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{{ project.name }}</h1>
        <p v-if="project.description" class="text-slate-500 font-medium text-sm mt-1.5 max-w-2xl line-clamp-2">{{ project.description }}</p>
      </div>

      <!-- Resumen rápido -->
      <div class="grid grid-cols-3 gap-3">
        <div v-for="group in statusGroups" :key="group.key" class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="group.dot"></span>
          <div class="min-w-0">
            <p class="text-2xl font-black text-slate-800 leading-none">{{ group.items.length }}</p>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 truncate">{{ group.label }}</p>
          </div>
        </div>
      </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <!-- Tabs -->
      <div class="flex gap-2 p-3 border-b border-slate-100 bg-slate-50 overflow-x-auto scroll-smooth">
        <button
          v-for="t in tabs"
          :key="t.key"
          @click="activeTab = t.key"
          :class="[
            'px-4 py-2.5 rounded-lg whitespace-nowrap text-sm font-bold transition-colors flex items-center min-w-max',
            activeTab === t.key
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
          ]"
        >
          <i :class="[t.icon, 'mr-2', activeTab === t.key ? 'opacity-100' : 'opacity-70']"></i>{{ t.label }}
        </button>
      </div>

      <div class="p-6">
        <!-- Documentación -->
        <div v-if="activeTab === 'docs'" class="space-y-3 max-w-3xl">
          <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
          <textarea
            v-model="descriptionDraft"
            rows="10"
            class="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all resize-none text-sm font-medium leading-relaxed shadow-sm"
            placeholder="Describe el alcance, objetivos o contexto de este proyecto..."
          ></textarea>
          <div class="flex justify-end">
            <button
              type="button"
              @click="saveDescription"
              :disabled="savingDescription || descriptionDraft === (project.description || '')"
              class="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <i v-if="savingDescription" class="fas fa-spinner fa-spin mr-1.5"></i>Guardar
            </button>
          </div>
        </div>

        <!-- Enlaces y Adjuntos -->
        <div v-else-if="activeTab === 'files'" class="space-y-8 max-w-3xl">
          <div>
            <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i class="fas fa-paperclip text-slate-300"></i>Documentos Adjuntos
            </h3>
            <FileDropzone label="Subir archivos al proyecto" @files-selected="handleFilesSelected" />
            <div v-if="project.archivos?.length" class="mt-3 space-y-1.5">
              <div v-for="file in project.archivos" :key="file._id" class="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <i :class="fileIcon(file.tipo)" class="text-slate-400 text-sm shrink-0"></i>
                <a :href="fullFileUrl(file.url)" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-slate-700 hover:text-primary-600 truncate flex-1">{{ file.nombre }}</a>
                <button type="button" @click="removeFile(file._id!)" class="text-slate-300 hover:text-red-500 transition-colors shrink-0" title="Eliminar"><i class="fas fa-trash text-xs"></i></button>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i class="fas fa-link text-slate-300"></i>Enlaces Externos
            </h3>
            <div class="flex gap-2 mb-3">
              <input v-model="newLinkName" type="text" placeholder="Nombre (ej: Manual en Drive)" class="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all" />
              <input v-model="newLinkUrl" type="text" placeholder="https://..." class="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all" />
              <button type="button" @click="addLink" :disabled="!newLinkName.trim() || !newLinkUrl.trim()" class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0">Agregar</button>
            </div>
            <div v-if="project.enlacesExternos?.length" class="space-y-1.5">
              <div v-for="link in project.enlacesExternos" :key="link._id" class="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <i class="fas fa-link text-slate-400 text-xs shrink-0"></i>
                <a :href="link.url" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-primary-600 underline break-all flex-1">{{ link.nombre }}</a>
                <button type="button" @click="removeLink(link._id!)" class="text-slate-300 hover:text-red-500 transition-colors shrink-0" title="Eliminar"><i class="fas fa-trash text-xs"></i></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Actividad: tareas y actividades vinculadas — mismo modelo visual, -->
        <!-- crear/editar reutiliza el modal estándar de toda la app. -->
        <div v-else-if="activeTab === 'activity'">
          <div class="flex justify-end mb-4">
            <button
              type="button"
              @click="openCreate"
              class="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
            >
              <i class="fas fa-plus"></i>Nueva tarea
            </button>
          </div>

          <div v-if="loadingLinked" class="text-center py-10 text-slate-400 text-xs font-bold">
            <i class="fas fa-spinner fa-spin mr-1.5"></i>Cargando...
          </div>
          <div v-else-if="linkedItems.length === 0" class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <i class="fas fa-inbox text-slate-300 text-2xl mb-2"></i>
            <p class="text-xs font-bold text-slate-400">Sin tareas ni actividades vinculadas todavía</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="group in statusGroups" :key="group.key" class="space-y-2">
              <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full" :class="group.dot"></span>{{ group.label }}
                <span class="text-slate-300">· {{ group.items.length }}</span>
              </h4>
              <div v-if="group.items.length === 0" class="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p class="text-[11px] text-slate-400 font-medium">Nada aquí</p>
              </div>
              <button
                v-for="item in group.items"
                :key="item.id"
                type="button"
                @click="openEdit(item)"
                class="w-full text-left flex items-start gap-2.5 px-3 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div class="min-w-0 flex-1">
                  <span class="text-sm font-bold text-slate-700 truncate block">{{ item.title }}</span>
                  <span class="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{{ item.statusLabel }}</span>
                </div>
                <span
                  class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                  :class="item.kind === 'task' ? 'bg-indigo-50 text-indigo-500' : 'bg-amber-50 text-amber-600'"
                >
                  {{ item.kind === 'task' ? 'Tarea' : 'Actividad' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>

  <Teleport to="body">
    <ActivityFormModal
      v-if="showActivityModal"
      :activity="editingItem"
      :clients="clientsForModal"
      :team-members="teamMembers"
      :initial-client-id="clientId"
      :initial-project-id="projectId"
      @close="showActivityModal = false"
      @saved="onActivitySaved"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { clientService, type ClientData, type ProjectData } from '@/services/clientService'
import { activityService } from '@/services/activityService'
import { teamService } from '@/services/teamService'
import { API_CONFIG } from '@/config/api'
import { useNotifications } from '@/composables/useNotifications'
import FileDropzone from '@/components/ui/FileDropzone.vue'
import ActivityFormModal from '@/components/forms/ActivityFormModal.vue'
import type { TeamMember } from '@/types'

const route = useRoute()
const clientId = route.params.clientId as string
const projectId = route.params.projectId as string

const { showError } = useNotifications()

const loading = ref(true)
const client = ref<ClientData | null>(null)
const project = ref<ProjectData | null>(null)

const tabs = [
  { key: 'docs', label: 'Documentación', icon: 'fas fa-file-lines' },
  { key: 'files', label: 'Enlaces y Adjuntos', icon: 'fas fa-paperclip' },
  { key: 'activity', label: 'Actividad', icon: 'fas fa-list-check' }
] as const
const activeTab = ref<'docs' | 'files' | 'activity'>('docs')

const statusLabel = (st?: string) =>
  ({ active: 'activo', paused: 'pausado', completed: 'completado', archived: 'archivado' } as Record<string, string>)[st || ''] || 'activo'
const coverGradient = (st?: string) =>
  ({ active: 'bg-gradient-to-br from-primary-400 to-indigo-600', paused: 'bg-gradient-to-br from-amber-400 to-orange-500', completed: 'bg-gradient-to-br from-emerald-400 to-teal-600', archived: 'bg-gradient-to-br from-slate-400 to-slate-600' } as Record<string, string>)[st || ''] || 'bg-gradient-to-br from-primary-400 to-indigo-600'
const statusChipClass = (st?: string) => ({
  'bg-emerald-50/90 text-emerald-700': st === 'active',
  'bg-amber-50/90 text-amber-700': st === 'paused',
  'bg-blue-50/90 text-blue-700': st === 'completed',
  'bg-slate-100/90 text-slate-600': st === 'archived'
})

const loadProject = async () => {
  loading.value = true
  try {
    client.value = await clientService.getById(clientId)
    project.value = (client.value.projects || []).find(p => p._id === projectId) || null
    descriptionDraft.value = project.value?.description || ''
  } catch (err: any) {
    showError('Error', err.message || 'No se pudo cargar el proyecto')
  } finally {
    loading.value = false
  }
}

// ── Documentación ──
const descriptionDraft = ref('')
const savingDescription = ref(false)
const saveDescription = async () => {
  if (!project.value?._id) return
  savingDescription.value = true
  try {
    project.value = await clientService.updateProject(clientId, project.value._id, { description: descriptionDraft.value })
  } catch (err: any) {
    showError('Error', err.message || 'No se pudo guardar la descripción')
  } finally {
    savingDescription.value = false
  }
}

// ── Adjuntos ──
const fullFileUrl = (url: string) => url.startsWith('http') ? url : `${API_CONFIG.BASE_URL.replace(/\/api$/, '')}${url}`
const fileIcon = (mime: string) => {
  if (mime?.includes('pdf')) return 'fas fa-file-pdf'
  if (mime?.includes('word')) return 'fas fa-file-word'
  if (mime?.includes('sheet') || mime?.includes('excel')) return 'fas fa-file-excel'
  if (mime?.startsWith('image/')) return 'fas fa-file-image'
  return 'fas fa-file'
}
const handleFilesSelected = async (files: File[]) => {
  if (!project.value?._id || files.length === 0) return
  try {
    const archivos = await clientService.uploadProjectFiles(clientId, project.value._id, files)
    project.value = { ...project.value, archivos }
  } catch (err: any) {
    showError('Error', err.message || 'No se pudieron subir los archivos')
  }
}
const removeFile = async (fileId: string) => {
  if (!project.value?._id) return
  try {
    await clientService.removeProjectFile(clientId, project.value._id, fileId)
    project.value = { ...project.value, archivos: (project.value.archivos || []).filter(f => f._id !== fileId) }
  } catch (err: any) {
    showError('Error', err.message || 'No se pudo eliminar el archivo')
  }
}

// ── Enlaces externos ──
const newLinkName = ref('')
const newLinkUrl = ref('')
const addLink = async () => {
  if (!project.value?._id || !newLinkName.value.trim() || !newLinkUrl.value.trim()) return
  try {
    const link = await clientService.addProjectLink(clientId, project.value._id, { nombre: newLinkName.value.trim(), url: newLinkUrl.value.trim() })
    project.value = { ...project.value, enlacesExternos: [...(project.value.enlacesExternos || []), link] }
    newLinkName.value = ''
    newLinkUrl.value = ''
  } catch (err: any) {
    showError('Error', err.message || 'No se pudo agregar el enlace')
  }
}
const removeLink = async (linkId: string) => {
  if (!project.value?._id) return
  try {
    await clientService.removeProjectLink(clientId, project.value._id, linkId)
    project.value = { ...project.value, enlacesExternos: (project.value.enlacesExternos || []).filter(l => l._id !== linkId) }
  } catch (err: any) {
    showError('Error', err.message || 'No se pudo eliminar el enlace')
  }
}

// ── Tareas y actividades vinculadas ──
// Son dos modelos distintos en el backend (Task y Activity), pero para esta
// vista es la misma idea — "cosas por hacer" del proyecto — así que se listan
// juntas; crear/editar reutiliza el mismo ActivityFormModal de toda la app.
interface LinkedItem { id: string; title: string; status: string; statusLabel: string; kind: 'task' | 'activity'; raw: any }
const linkedItems = ref<LinkedItem[]>([])
const loadingLinked = ref(false)

const TASK_STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog', todo: 'Por hacer', 'in-progress': 'En progreso', review: 'Revisión', testing: 'Pruebas', done: 'Completada'
}
const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', 'in-progress': 'En proceso', completed: 'Completada', cancelled: 'Cancelada', overdue: 'Vencida'
}
const isDone = (item: LinkedItem) => ['done', 'completed'].includes(item.status)
const isInProgress = (item: LinkedItem) => ['in-progress', 'review', 'testing'].includes(item.status)

const statusGroups = computed(() => [
  { key: 'pending', label: 'Pendiente', dot: 'bg-slate-300', items: linkedItems.value.filter(i => !isDone(i) && !isInProgress(i)) },
  { key: 'progress', label: 'En progreso', dot: 'bg-blue-500', items: linkedItems.value.filter(isInProgress) },
  { key: 'done', label: 'Completada', dot: 'bg-emerald-500', items: linkedItems.value.filter(isDone) }
])

const loadLinkedItems = async () => {
  if (!project.value?._id) return
  loadingLinked.value = true
  try {
    const [tasksRes, activities] = await Promise.all([
      fetch(`${API_CONFIG.BASE_URL}/tasks`).then(r => r.ok ? r.json() : []),
      activityService.getAll()
    ])
    const tasks = Array.isArray(tasksRes) ? tasksRes : []
    const items: LinkedItem[] = []
    tasks.filter((t: any) => t.projectId === project.value!._id).forEach((t: any) => {
      items.push({ id: t._id, title: t.title, status: t.boardStatus, statusLabel: TASK_STATUS_LABELS[t.boardStatus] || t.boardStatus, kind: 'task', raw: t })
    })
    activities.filter(a => a.projectId === project.value!._id).forEach(a => {
      items.push({ id: a._id!, title: a.title, status: a.status, statusLabel: ACTIVITY_STATUS_LABELS[a.status] || a.status, kind: 'activity', raw: a })
    })
    linkedItems.value = items
  } catch {
    linkedItems.value = []
  } finally {
    loadingLinked.value = false
  }
}

// ── Crear/editar (modal estándar) ──
const clients = ref<ClientData[]>([])
const teamMembers = ref<TeamMember[]>([])
const clientsForModal = computed(() => clients.value as any)
const showActivityModal = ref(false)
const editingItem = ref<any | null>(null)

const openCreate = () => {
  editingItem.value = null
  showActivityModal.value = true
}
const openEdit = (item: LinkedItem) => {
  editingItem.value = item.raw
  showActivityModal.value = true
}
const onActivitySaved = () => {
  showActivityModal.value = false
  loadLinkedItems()
}

onMounted(async () => {
  await loadProject()
  await Promise.all([
    loadLinkedItems(),
    clientService.getAll().then(c => { clients.value = c }),
    teamService.getActiveMembers().then(m => { teamMembers.value = m })
  ])
})
</script>
