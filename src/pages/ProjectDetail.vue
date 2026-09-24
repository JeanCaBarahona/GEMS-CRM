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
          <i class="fas fa-arrow-left mr-1.5"></i>{{ client?.company || client?.name || 'Cliente' }}
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

        <!-- Backlog: Proyecto → Feature → Tarea en cascada -->
        <div v-else-if="activeTab === 'backlog'" class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-xs text-slate-400 font-medium">
              Organiza el proyecto en features y agrupa las tareas dentro de cada una.
            </p>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="openCreate"
                title="Crear una tarea suelta, sin feature"
                class="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
              >
                <i class="fas fa-plus"></i>Tarea
              </button>
              <button
                type="button"
                @click="openCreateFeature"
                title="Crear una feature para agrupar tareas"
                class="px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
              >
                <i class="fas fa-layer-group"></i>Nueva feature
              </button>
            </div>
          </div>

          <div v-if="loadingLinked" class="text-center py-10 text-slate-400 text-xs font-bold">
            <i class="fas fa-spinner fa-spin mr-1.5"></i>Cargando...
          </div>

          <div v-else-if="backlogFeatures.length === 0 && backlogLooseTasks.length === 0" class="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <i class="fas fa-sitemap text-slate-300 text-2xl mb-2"></i>
            <p class="text-sm font-bold text-slate-500">Aún no hay features en este proyecto</p>
            <p class="text-xs text-slate-400 mt-1">Crea la primera feature y agrega sus tareas dentro.</p>
          </div>

          <template v-else>
            <!-- Features con sus tareas -->
            <div
              v-for="feature in backlogFeatures"
              :key="feature.item.id"
              class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
            >
              <div class="flex items-center gap-3 px-4 py-3 bg-violet-50/40 border-b border-slate-100">
                <button
                  type="button"
                  @click="toggleFeature(feature.item.id)"
                  :title="collapsedFeatures.has(feature.item.id) ? 'Mostrar las tareas de esta feature' : 'Ocultar las tareas de esta feature'"
                  class="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-white transition-colors"
                >
                  <i class="fas fa-chevron-right text-[10px] transition-transform duration-200" :class="{ 'rotate-90': !collapsedFeatures.has(feature.item.id) }"></i>
                </button>
                <span class="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                  <i class="fas fa-layer-group text-xs"></i>
                </span>
                <button type="button" @click="openEdit(feature.item)" class="min-w-0 flex-1 text-left" title="Abrir la feature para ver o editar sus datos">
                  <span class="block text-sm font-black text-slate-800 truncate hover:text-violet-600">{{ feature.item.title }}</span>
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Feature · {{ feature.item.statusLabel }} · {{ feature.done }}/{{ feature.tasks.length }} tareas completadas
                  </span>
                </button>
                <div class="hidden sm:block w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0" :title="`${feature.progress}% de las tareas completadas`">
                  <div class="h-full bg-violet-500 rounded-full transition-all" :style="{ width: `${feature.progress}%` }"></div>
                </div>
                <button
                  type="button"
                  @click="openCreateInFeature(feature.item.id)"
                  title="Agregar una tarea dentro de esta feature"
                  class="shrink-0 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-violet-600 bg-white border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors"
                >
                  <i class="fas fa-plus mr-1"></i>Tarea
                </button>
              </div>

              <template v-if="!collapsedFeatures.has(feature.item.id)">
                <button
                  v-for="task in feature.tasks"
                  :key="task.id"
                  type="button"
                  @click="openEdit(task)"
                  class="w-full flex items-center gap-3 pl-14 pr-4 py-2.5 border-t border-slate-50 hover:bg-slate-50/70 transition-colors text-left"
                  title="Abrir la tarea para ver o editar sus datos"
                >
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="statusDot(task)"></span>
                  <span class="text-sm font-bold truncate flex-1" :class="isDone(task) ? 'text-slate-400 line-through' : 'text-slate-700'">{{ task.title }}</span>
                  <span v-if="typeBadge(task)" class="shrink-0 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">{{ typeBadge(task) }}</span>
                  <span class="shrink-0 text-[10px] font-bold text-slate-400 w-24 text-right">{{ task.statusLabel }}</span>
                </button>
                <p v-if="feature.tasks.length === 0" class="pl-14 pr-4 py-3 text-[11px] text-slate-300 font-medium border-t border-slate-50">
                  Sin tareas todavía
                </p>
              </template>
            </div>

            <!-- Tareas sin feature -->
            <div v-if="backlogLooseTasks.length" class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div class="flex items-center gap-3 px-4 py-3 bg-slate-50/60 border-b border-slate-100">
                <span class="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                  <i class="fas fa-inbox text-xs"></i>
                </span>
                <span class="text-sm font-black text-slate-600 flex-1">Sin feature</span>
                <span class="text-[10px] font-bold text-slate-400">{{ backlogLooseTasks.length }}</span>
              </div>
              <button
                v-for="task in backlogLooseTasks"
                :key="task.id"
                type="button"
                @click="openEdit(task)"
                class="w-full flex items-center gap-3 px-4 py-2.5 border-t border-slate-50 hover:bg-slate-50/70 transition-colors text-left"
                title="Abrir la tarea para ver o editar sus datos (y asignarle una feature)"
              >
                <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="statusDot(task)"></span>
                <span class="text-sm font-bold truncate flex-1" :class="isDone(task) ? 'text-slate-400 line-through' : 'text-slate-700'">{{ task.title }}</span>
                <span v-if="typeBadge(task)" class="shrink-0 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">{{ typeBadge(task) }}</span>
                <span class="shrink-0 text-[10px] font-bold text-slate-400 w-24 text-right">{{ task.statusLabel }}</span>
              </button>
            </div>

            <p v-if="hasBoardTasks" class="text-[11px] text-slate-400 font-medium">
              <i class="fas fa-circle-info mr-1"></i>Las tareas creadas desde un tablero Kanban no forman parte del Backlog; se ven en la pestaña Actividad.
            </p>
          </template>
        </div>

        <!-- Actividad: tareas y actividades vinculadas — mismo modelo visual, -->
        <!-- crear/editar reutiliza el modal estándar de toda la app. -->
        <div v-else-if="activeTab === 'activity'">
          <div class="flex items-center justify-between mb-4">
            <!-- Toggle vista: mismo componente de lista que /activities -->
            <div class="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                type="button"
                @click="linkedView = 'list'"
                :class="linkedView === 'list' ? 'bg-white text-primary-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'"
                class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              ><i class="fas fa-list mr-1.5"></i>Lista</button>
              <button
                type="button"
                @click="linkedView = 'board'"
                :class="linkedView === 'board' ? 'bg-white text-primary-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'"
                class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              ><i class="fas fa-columns mr-1.5"></i>Tablero</button>
            </div>
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

          <TaskListView
            v-else-if="linkedView === 'list'"
            :groups="linkedListGroups"
            show-kind-badge
            :can-delete="false"
            @open="openEdit"
            @toggle-complete="toggleLinkedItemDone"
            @add-task="openCreate"
          />

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
      :initial-type="createType"
      :initial-feature-id="createFeatureId"
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
import TaskListView, { type TaskListGroup } from '@/components/tasks/TaskListView.vue'
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
  { key: 'backlog', label: 'Backlog', icon: 'fas fa-sitemap' },
  { key: 'activity', label: 'Actividad', icon: 'fas fa-list-check' }
] as const
const activeTab = ref<'docs' | 'files' | 'backlog' | 'activity'>('docs')
const linkedView = ref<'list' | 'board'>('list')

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
interface LinkedItem {
  id: string; title: string; description?: string; status: string; statusLabel: string
  kind: 'task' | 'activity'; assignedTo?: any; dueDate?: string | null; priority?: string | null
  // Solo actividades: tipo (feature/task/bug/...) y feature a la que pertenecen
  type?: string; featureId?: string | null
  raw: any
}
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

// ── Vista de Lista (TaskListView, la misma que usa /activities) ──
// Task y Activity son dos modelos con formas ligeramente distintas
// (prioridad: Task usa 'critical', Activity usa 'urgent' para el tope), así
// que se normalizan acá antes de pasarlas al componente compartido.
function resolveAssignees(raw: any): { _id?: string; name: string; photo?: string; avatar?: string }[] {
  const list = Array.isArray(raw) ? raw : (raw ? [raw] : [])
  return list.filter(Boolean).map((u: any) => {
    if (typeof u === 'object' && u.name) return { _id: u._id, name: u.name, photo: u.photo, avatar: u.avatar }
    const member = teamMembers.value.find((m: any) => m._id === u)
    return { _id: typeof u === 'string' ? u : undefined, name: member?.name || 'Sin asignar', photo: (member as any)?.photo, avatar: (member as any)?.avatar }
  })
}

const PRIORITY_META: Record<string, { label: string; class: string; icon: string }> = {
  low: { label: 'Baja', class: 'bg-slate-500 text-white border-slate-400/30', icon: 'fas fa-arrow-down' },
  medium: { label: 'Media', class: 'bg-indigo-500 text-white border-indigo-400/30', icon: 'fas fa-minus' },
  high: { label: 'Alta', class: 'bg-amber-500 text-white border-amber-400/30', icon: 'fas fa-arrow-up' },
  urgent: { label: 'Urgente', class: 'bg-rose-500 text-white border-rose-400/30', icon: 'fas fa-exclamation' },
  critical: { label: 'Crítica', class: 'bg-rose-500 text-white border-rose-400/30', icon: 'fas fa-exclamation' }
}

function formatDueDate(date?: string | null): string | undefined {
  if (!date) return undefined
  return new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
}

const linkedListGroups = computed<TaskListGroup[]>(() => {
  const toRow = (item: LinkedItem) => {
    const priority = item.priority ? PRIORITY_META[item.priority] : undefined
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      done: isDone(item),
      assignees: resolveAssignees(item.assignedTo),
      dueDateLabel: formatDueDate(item.dueDate),
      overdue: !isDone(item) && !!item.dueDate && new Date(item.dueDate) < new Date(),
      priorityLabel: priority?.label,
      priorityClass: priority?.class,
      priorityIcon: priority?.icon,
      kindLabel: item.type === 'feature' ? 'Feature' : item.kind === 'task' ? 'Tarea' : 'Actividad',
      kindClass: item.type === 'feature'
        ? 'bg-violet-50 text-violet-600'
        : item.kind === 'task' ? 'bg-indigo-50 text-indigo-500' : 'bg-amber-50 text-amber-600',
      raw: item
    }
  }
  return statusGroups.value.map(g => ({ key: g.key, label: g.label, dotClass: g.dot, rows: g.items.map(toRow) }))
})

// Las Activity tienen un status simple ('completed'); las Task del tablero se
// mueven por columnas del Kanban, así que acá el check solo actúa sobre
// actividades — para una tarea de tablero, se abre el detalle en vez de
// intentar adivinar a qué columna "completada" debería pasar.
async function toggleLinkedItemDone(item: LinkedItem) {
  if (item.kind !== 'activity') { openEdit(item); return }
  try {
    await activityService.updateStatus(item.id, isDone(item) ? 'pending' : 'completed')
    await loadLinkedItems()
  } catch (err: any) {
    showError('Error', err.message || 'No se pudo actualizar el estado')
  }
}

const loadLinkedItems = async () => {
  if (!project.value?._id) return
  loadingLinked.value = true
  try {
    const [tasksRes, activities] = await Promise.all([
      // Sin el token la API responde 401 y las tareas del tablero nunca aparecían aquí
      fetch(`${API_CONFIG.BASE_URL}/tasks`, {
        headers: localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}
      }).then(r => r.ok ? r.json() : []),
      activityService.getAll()
    ])
    const tasks = Array.isArray(tasksRes) ? tasksRes : []
    const items: LinkedItem[] = []
    tasks.filter((t: any) => t.projectId === project.value!._id).forEach((t: any) => {
      items.push({
        id: t._id, title: t.title, description: t.description, status: t.boardStatus,
        statusLabel: TASK_STATUS_LABELS[t.boardStatus] || t.boardStatus, kind: 'task',
        assignedTo: t.assignedTo, dueDate: t.dueDate, priority: t.priority, raw: t
      })
    })
    activities.filter(a => a.projectId === project.value!._id).forEach(a => {
      items.push({
        id: a._id!, title: a.title, description: a.description, status: a.status,
        statusLabel: ACTIVITY_STATUS_LABELS[a.status] || a.status, kind: 'activity',
        assignedTo: a.assignedTo, dueDate: a.dueDate as any, priority: a.priority,
        type: a.type || 'task', featureId: a.featureId || null, raw: a
      })
    })
    linkedItems.value = items
  } catch {
    linkedItems.value = []
  } finally {
    loadingLinked.value = false
  }
}

// ── Backlog: Feature → Tareas ──
// Solo actividades: las tareas de un tablero Kanban tienen su propia jerarquía
// (épicas/features del tablero) y siguen apareciendo en la pestaña Actividad.
const backlogActivities = computed(() => linkedItems.value.filter(i => i.kind === 'activity'))
const hasBoardTasks = computed(() => linkedItems.value.some(i => i.kind === 'task'))

const backlogFeatures = computed(() =>
  backlogActivities.value
    .filter(i => i.type === 'feature')
    .map(item => {
      const tasks = backlogActivities.value.filter(t => t.type !== 'feature' && t.featureId === item.id)
      const done = tasks.filter(isDone).length
      return { item, tasks, done, progress: tasks.length ? Math.round((done / tasks.length) * 100) : 0 }
    })
)

// Tareas sin feature (o cuya feature ya no existe)
const backlogLooseTasks = computed(() => {
  const featureIds = new Set(backlogFeatures.value.map(f => f.item.id))
  return backlogActivities.value.filter(t => t.type !== 'feature' && (!t.featureId || !featureIds.has(t.featureId)))
})

const collapsedFeatures = ref(new Set<string>())
function toggleFeature(id: string) {
  const next = new Set(collapsedFeatures.value)
  next.has(id) ? next.delete(id) : next.add(id)
  collapsedFeatures.value = next
}

function statusDot(item: LinkedItem) {
  if (isDone(item)) return 'bg-emerald-500'
  if (isInProgress(item)) return 'bg-blue-500'
  if (item.status === 'overdue') return 'bg-red-500'
  return 'bg-slate-300'
}

const TYPE_BADGES: Record<string, string> = { bug: 'Bug', 'user-story': 'Historia' }
const typeBadge = (item: LinkedItem) => (item.type ? TYPE_BADGES[item.type] : undefined)

// ── Crear/editar (modal estándar) ──
const clients = ref<ClientData[]>([])
const teamMembers = ref<TeamMember[]>([])
const clientsForModal = computed(() => clients.value as any)
const showActivityModal = ref(false)
const editingItem = ref<any | null>(null)
// Solo al crear: tipo inicial y feature padre (desde el Backlog)
const createType = ref('task')
const createFeatureId = ref<string | null>(null)

const openCreate = () => {
  editingItem.value = null
  createType.value = 'task'
  createFeatureId.value = null
  showActivityModal.value = true
}
const openCreateFeature = () => {
  editingItem.value = null
  createType.value = 'feature'
  createFeatureId.value = null
  showActivityModal.value = true
}
const openCreateInFeature = (featureId: string) => {
  editingItem.value = null
  createType.value = 'task'
  createFeatureId.value = featureId
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
