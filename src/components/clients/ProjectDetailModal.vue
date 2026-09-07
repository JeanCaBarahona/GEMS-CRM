<template>
  <div class="fixed -inset-1 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300" @click="$emit('close')">
    <div
      class="bg-white rounded-[2rem] shadow-2xl border border-slate-200/60 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/30 shrink-0">
        <div class="flex items-center gap-4 min-w-0">
          <div class="w-11 h-11 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100 shrink-0">
            <i class="fas fa-diagram-project text-primary-500 text-lg"></i>
          </div>
          <div class="min-w-0">
            <h2 class="text-xl font-black text-slate-800 tracking-tight truncate">{{ project.name }}</h2>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
              {{ statusLabel(project.status) }}
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shrink-0"
        >
          <i class="fas fa-times text-lg"></i>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 shrink-0">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2"
          :class="activeTab === tab.key
            ? 'text-primary-600 border-primary-500'
            : 'text-slate-400 border-transparent hover:text-slate-600'"
        >
          <i :class="tab.icon" class="mr-1.5 text-[11px]"></i>{{ tab.label }}
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <!-- Documentación -->
        <div v-if="activeTab === 'docs'" class="space-y-4">
          <div class="space-y-2">
            <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
            <textarea
              v-model="descriptionDraft"
              rows="8"
              class="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all resize-none text-sm font-medium leading-relaxed shadow-sm custom-scrollbar"
              placeholder="Describe el alcance, objetivos o contexto de este proyecto..."
            ></textarea>
            <div class="flex justify-end">
              <button
                type="button"
                @click="saveDescription"
                :disabled="savingDescription || descriptionDraft === (project.description || '')"
                class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i v-if="savingDescription" class="fas fa-spinner fa-spin mr-1.5"></i>Guardar
              </button>
            </div>
          </div>
        </div>

        <!-- Enlaces y Adjuntos -->
        <div v-else-if="activeTab === 'files'" class="space-y-8">
          <div>
            <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i class="fas fa-paperclip text-slate-300"></i>Documentos Adjuntos
            </h3>
            <FileDropzone label="Subir archivos al proyecto" @files-selected="handleFilesSelected" />
            <div v-if="project.archivos?.length" class="mt-3 space-y-1.5">
              <div
                v-for="file in project.archivos"
                :key="file._id"
                class="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100"
              >
                <i :class="fileIcon(file.tipo)" class="text-slate-400 text-sm shrink-0"></i>
                <a :href="fullFileUrl(file.url)" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-slate-700 hover:text-primary-600 truncate flex-1">
                  {{ file.nombre }}
                </a>
                <button type="button" @click="removeFile(file._id!)" class="text-slate-300 hover:text-red-500 transition-colors shrink-0" title="Eliminar">
                  <i class="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i class="fas fa-link text-slate-300"></i>Enlaces Externos
            </h3>
            <div class="flex gap-2 mb-3">
              <input
                v-model="newLinkName"
                type="text"
                placeholder="Nombre (ej: Manual en Drive)"
                class="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
              />
              <input
                v-model="newLinkUrl"
                type="text"
                placeholder="https://..."
                class="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all"
              />
              <button
                type="button"
                @click="addLink"
                :disabled="!newLinkName.trim() || !newLinkUrl.trim()"
                class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                Agregar
              </button>
            </div>
            <div v-if="project.enlacesExternos?.length" class="space-y-1.5">
              <div
                v-for="link in project.enlacesExternos"
                :key="link._id"
                class="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100"
              >
                <i class="fas fa-link text-slate-400 text-xs shrink-0"></i>
                <a :href="link.url" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-primary-600 underline break-all flex-1">
                  {{ link.nombre }}
                </a>
                <button type="button" @click="removeLink(link._id!)" class="text-slate-300 hover:text-red-500 transition-colors shrink-0" title="Eliminar">
                  <i class="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Actividades (tareas y actividades vinculadas — misma vista, es lo mismo) -->
        <div v-else-if="activeTab === 'activity'">
          <div v-if="loadingLinked" class="text-center py-10 text-slate-400 text-xs font-bold">
            <i class="fas fa-spinner fa-spin mr-1.5"></i>Cargando...
          </div>
          <div v-else-if="linkedItems.length === 0" class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <i class="fas fa-inbox text-slate-300 text-2xl mb-2"></i>
            <p class="text-xs font-bold text-slate-400">Sin tareas ni actividades vinculadas a este proyecto</p>
          </div>
          <div v-else class="space-y-1.5">
            <div
              v-for="item in linkedItems"
              :key="item.id"
              class="flex items-center gap-3 px-3 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm"
            >
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="statusDotClass(item.status)"
              ></span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { clientService, type ProjectData } from '../../services/clientService'
import { activityService } from '../../services/activityService'
import { API_CONFIG } from '../../config/api'
import { useNotifications } from '../../composables/useNotifications'
import FileDropzone from '../ui/FileDropzone.vue'

const props = defineProps<{
  clientId: string
  project: ProjectData
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated', project: ProjectData): void
}>()

const { showError } = useNotifications()

const tabs = [
  { key: 'docs', label: 'Documentación', icon: 'fas fa-file-lines' },
  { key: 'files', label: 'Enlaces y Adjuntos', icon: 'fas fa-paperclip' },
  { key: 'activity', label: 'Actividad', icon: 'fas fa-list-check' }
] as const
const activeTab = ref<'docs' | 'files' | 'activity'>('docs')

const statusLabel = (st?: string) =>
  ({ active: 'activo', paused: 'pausado', completed: 'completado', archived: 'archivado' } as Record<string, string>)[st || ''] || 'activo'

// ── Documentación ──
const descriptionDraft = ref(props.project.description || '')
const savingDescription = ref(false)
const saveDescription = async () => {
  if (!props.project._id) return
  savingDescription.value = true
  try {
    const updated = await clientService.updateProject(props.clientId, props.project._id, { description: descriptionDraft.value })
    emit('updated', updated)
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
  if (!props.project._id || files.length === 0) return
  try {
    const archivos = await clientService.uploadProjectFiles(props.clientId, props.project._id, files)
    emit('updated', { ...props.project, archivos })
  } catch (err: any) {
    showError('Error', err.message || 'No se pudieron subir los archivos')
  }
}
const removeFile = async (fileId: string) => {
  if (!props.project._id) return
  try {
    await clientService.removeProjectFile(props.clientId, props.project._id, fileId)
    emit('updated', { ...props.project, archivos: (props.project.archivos || []).filter(f => f._id !== fileId) })
  } catch (err: any) {
    showError('Error', err.message || 'No se pudo eliminar el archivo')
  }
}

// ── Enlaces externos ──
const newLinkName = ref('')
const newLinkUrl = ref('')
const addLink = async () => {
  if (!props.project._id || !newLinkName.value.trim() || !newLinkUrl.value.trim()) return
  try {
    const link = await clientService.addProjectLink(props.clientId, props.project._id, { nombre: newLinkName.value.trim(), url: newLinkUrl.value.trim() })
    emit('updated', { ...props.project, enlacesExternos: [...(props.project.enlacesExternos || []), link] })
    newLinkName.value = ''
    newLinkUrl.value = ''
  } catch (err: any) {
    showError('Error', err.message || 'No se pudo agregar el enlace')
  }
}
const removeLink = async (linkId: string) => {
  if (!props.project._id) return
  try {
    await clientService.removeProjectLink(props.clientId, props.project._id, linkId)
    emit('updated', { ...props.project, enlacesExternos: (props.project.enlacesExternos || []).filter(l => l._id !== linkId) })
  } catch (err: any) {
    showError('Error', err.message || 'No se pudo eliminar el enlace')
  }
}

// ── Tareas y actividades vinculadas ──
// Técnicamente son dos modelos distintos (Task y Activity), pero para quien usa
// el proyecto es la misma idea — "cosas por hacer" — así que se muestran juntas
// en una sola lista; la distinción es solo una etiqueta, no dos vistas separadas.
interface LinkedItem { id: string; title: string; status: string; statusLabel: string; kind: 'task' | 'activity' }
const linkedItems = ref<LinkedItem[]>([])
const loadingLinked = ref(false)

const TASK_STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog', todo: 'Por hacer', 'in-progress': 'En progreso', review: 'Revisión', testing: 'Pruebas', done: 'Completada'
}
const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', 'in-progress': 'En proceso', completed: 'Completada', cancelled: 'Cancelada', overdue: 'Vencida'
}
const statusDotClass = (status: string) => {
  if (['done', 'completed'].includes(status)) return 'bg-emerald-500'
  if (['in-progress'].includes(status)) return 'bg-blue-500'
  if (['overdue', 'cancelled'].includes(status)) return 'bg-rose-500'
  return 'bg-slate-300'
}

const loadLinkedItems = async () => {
  if (!props.project._id) return
  loadingLinked.value = true
  try {
    const [tasksRes, activities] = await Promise.all([
      fetch(`${API_CONFIG.BASE_URL}/tasks`).then(r => r.ok ? r.json() : []),
      activityService.getAll()
    ])
    const tasks = Array.isArray(tasksRes) ? tasksRes : []
    const items: LinkedItem[] = []
    tasks.filter((t: any) => t.projectId === props.project._id).forEach((t: any) => {
      items.push({ id: t._id, title: t.title, status: t.boardStatus, statusLabel: TASK_STATUS_LABELS[t.boardStatus] || t.boardStatus, kind: 'task' })
    })
    activities.filter(a => a.projectId === props.project._id).forEach(a => {
      items.push({ id: a._id!, title: a.title, status: a.status, statusLabel: ACTIVITY_STATUS_LABELS[a.status] || a.status, kind: 'activity' })
    })
    linkedItems.value = items
  } catch {
    linkedItems.value = []
  } finally {
    loadingLinked.value = false
  }
}

onMounted(loadLinkedItems)
</script>
