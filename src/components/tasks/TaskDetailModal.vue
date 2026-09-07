<template>
  <Teleport to="body">
    <div v-if="isOpen && task" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="close" />

      <!-- Modal -->
      <div class="relative w-full max-w-5xl max-h-[92vh] bg-gray-900 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-700">
        <!-- Header -->
        <div class="flex items-start justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0">
          <div class="flex-1 min-w-0 mr-4">
            <div class="flex items-center flex-wrap gap-2 mb-1.5">
              <span class="px-2 py-0.5 rounded text-xs font-medium" :class="typeClass">{{ typeLabel }}</span>
              <span class="px-2 py-0.5 rounded text-xs font-medium" :class="priorityClass">{{ priorityLabel }}</span>
              <span class="px-2 py-0.5 rounded text-xs font-medium" :class="boardStatusClass">{{ boardStatusLabel }}</span>
            </div>
            <h2 class="text-lg font-bold text-white leading-snug">{{ task.title }}</h2>
          </div>
          <button @click="close" class="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-gray-800">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Left: main content -->
            <div class="lg:col-span-2 space-y-5">

              <!-- Description -->
              <div v-if="task.description" class="bg-gray-800/60 rounded-lg p-4">
                <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Descripción</h3>
                <p class="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">{{ task.description }}</p>
              </div>

              <!-- Tabs -->
              <div>
                <div class="flex border-b border-gray-700 mb-4 gap-1">
                  <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    @click="activeTab = tab.id"
                    class="px-4 py-2 text-sm font-medium transition-colors relative"
                    :class="activeTab === tab.id
                      ? 'text-purple-400 border-b-2 border-purple-400 -mb-px'
                      : 'text-gray-400 hover:text-white'"
                  >
                    {{ tab.label }}
                    <span
                      v-if="tab.count !== undefined && tab.count > 0"
                      class="ml-1.5 px-1.5 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full"
                    >{{ tab.count }}</span>
                  </button>
                </div>

                <!-- ===== Comments Tab ===== -->
                <div v-if="activeTab === 'comments'" class="space-y-4">

                  <!-- New comment form -->
                  <div class="bg-gray-800/60 rounded-lg p-4">
                    <textarea
                      v-model="newCommentText"
                      placeholder="Escribe un comentario..."
                      rows="3"
                      class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />

                    <!-- Image previews -->
                    <div v-if="commentImagePreviews.length > 0" class="flex flex-wrap gap-2 mt-3">
                      <div
                        v-for="(preview, idx) in commentImagePreviews"
                        :key="idx"
                        class="relative group"
                      >
                        <img :src="preview" class="w-20 h-20 object-cover rounded-lg border border-gray-600" />
                        <button
                          @click="removeCommentImage(idx)"
                          class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >×</button>
                      </div>
                    </div>

                    <div class="flex items-center justify-between mt-3">
                      <label class="cursor-pointer flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-400 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Imagen</span>
                        <input
                          ref="commentImageInput"
                          type="file"
                          accept="image/*"
                          multiple
                          class="hidden"
                          @change="handleCommentImageSelect"
                        />
                      </label>

                      <button
                        @click="submitComment"
                        :disabled="(!newCommentText.trim() && commentImages.length === 0) || submittingComment"
                        class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <svg v-if="submittingComment" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {{ submittingComment ? 'Enviando...' : 'Comentar' }}
                      </button>
                    </div>
                  </div>

                  <!-- Comments list -->
                  <div v-if="task.comments.length === 0" class="text-center py-10 text-gray-500 text-sm">
                    Sin comentarios aún. Sé el primero en comentar.
                  </div>

                  <div v-else class="space-y-3">
                    <div
                      v-for="comment in sortedComments"
                      :key="comment._id"
                      class="bg-gray-800/60 rounded-lg p-4"
                    >
                      <div class="flex items-center gap-2 mb-2">
                        <div class="w-7 h-7 bg-purple-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {{ getInitials(comment.author.name) }}
                        </div>
                        <span class="text-sm font-semibold text-white">{{ comment.author.name }}</span>
                        <span class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                      </div>

                      <p
                        v-if="comment.text"
                        class="text-gray-300 text-sm whitespace-pre-wrap break-words ml-9 leading-relaxed"
                        v-html="renderCommentText(comment.text)"
                      ></p>

                      <!-- Images in comment -->
                      <div v-if="comment.images && comment.images.length > 0" class="mt-2 ml-9 flex flex-wrap gap-2">
                        <img
                          v-for="(img, idx) in comment.images"
                          :key="idx"
                          :src="img.url"
                          :alt="img.name"
                          class="w-28 h-28 object-cover rounded-lg cursor-pointer border border-gray-600 hover:opacity-80 hover:border-purple-500 transition-all"
                          @click="openImagePreview(img.url)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ===== Attachments Tab ===== -->
                <div v-if="activeTab === 'attachments'" class="space-y-4">

                  <!-- Drop zone -->
                  <div
                    class="border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer"
                    :class="isDragging
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-600 hover:border-purple-500 hover:bg-gray-800/40'"
                    @click="triggerAttachmentUpload"
                    @dragover.prevent="isDragging = true"
                    @dragleave.prevent="isDragging = false"
                    @drop.prevent="handleAttachmentDrop"
                  >
                    <svg class="w-10 h-10 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p class="text-gray-400 text-sm">
                      Arrastra archivos aquí o
                      <span class="text-purple-400 font-medium">haz click para seleccionar</span>
                    </p>
                    <p class="text-gray-600 text-xs mt-1">Imágenes, documentos, ZIP, etc.</p>
                    <input
                      ref="attachmentInput"
                      type="file"
                      multiple
                      class="hidden"
                      @change="handleAttachmentSelect"
                    />
                  </div>

                  <!-- Upload progress -->
                  <div v-if="uploadingAttachment" class="flex items-center gap-3 text-sm text-gray-400">
                    <svg class="w-4 h-4 animate-spin text-purple-400" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Subiendo archivo...
                  </div>

                  <!-- Empty state -->
                  <div v-if="task.attachments.length === 0 && !uploadingAttachment" class="text-center py-6 text-gray-500 text-sm">
                    Sin adjuntos.
                  </div>

                  <!-- Attachments grid -->
                  <div v-if="task.attachments.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div
                      v-for="(att, idx) in task.attachments"
                      :key="idx"
                      class="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-500 transition-colors group"
                    >
                      <!-- Image preview -->
                      <div v-if="isImageUrl(att.url)" class="relative aspect-video overflow-hidden">
                        <img
                          :src="att.url"
                          :alt="att.name"
                          class="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                          @click="openImagePreview(att.url)"
                        />
                        <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                      <!-- File icon -->
                      <div v-else class="aspect-video flex items-center justify-center bg-gray-700/50">
                        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

                      <div class="px-3 py-2">
                        <p class="text-xs text-gray-300 truncate font-medium" :title="att.name">{{ att.name }}</p>
                        <a
                          :href="att.url"
                          target="_blank"
                          rel="noopener"
                          class="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                          @click.stop
                        >
                          Descargar
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Right: metadata sidebar -->
            <div class="space-y-4">
              <div class="bg-gray-800/60 rounded-lg p-4">
                <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Detalles</h3>

                <div class="space-y-4">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Asignado a</p>
                    <div v-if="task.assignedTo" class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {{ getInitials(task.assignedTo.name) }}
                      </div>
                      <span class="text-sm text-white">{{ task.assignedTo.name }}</span>
                    </div>
                    <span v-else class="text-sm text-gray-500">Sin asignar</span>
                  </div>

                  <div>
                    <p class="text-xs text-gray-500 mb-1">Reportado por</p>
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {{ getInitials(task.reporter.name) }}
                      </div>
                      <span class="text-sm text-white">{{ task.reporter.name }}</span>
                    </div>
                  </div>

                  <div v-if="task.sprint">
                    <p class="text-xs text-gray-500 mb-1">Sprint</p>
                    <p class="text-sm text-white">{{ task.sprint.name }}</p>
                  </div>

                  <div v-if="task.estimatedHours">
                    <p class="text-xs text-gray-500 mb-1">Horas estimadas</p>
                    <p class="text-sm text-white">{{ task.estimatedHours }}h</p>
                  </div>

                  <div v-if="task.dueDate">
                    <p class="text-xs text-gray-500 mb-1">Fecha límite</p>
                    <p class="text-sm" :class="isPastDue ? 'text-red-400' : 'text-white'">
                      {{ formatDate(task.dueDate) }}
                    </p>
                  </div>

                  <div v-if="task.tags && task.tags.length > 0">
                    <p class="text-xs text-gray-500 mb-1">Etiquetas</p>
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="tag in task.tags"
                        :key="tag"
                        class="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
                      >{{ tag }}</span>
                    </div>
                  </div>

                  <div>
                    <p class="text-xs text-gray-500 mb-1">Creado</p>
                    <p class="text-xs text-gray-400">{{ formatDate(task.createdAt) }}</p>
                  </div>

                  <div v-if="task.updatedAt">
                    <p class="text-xs text-gray-500 mb-1">Actualizado</p>
                    <p class="text-xs text-gray-400">{{ formatDate(task.updatedAt) }}</p>
                  </div>
                </div>
              </div>

              <!-- GitHub info -->
              <div v-if="task.github?.branch" class="bg-gray-800/60 rounded-lg p-4">
                <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">GitHub</h3>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
                    </svg>
                    <a v-if="task.github.branchUrl" :href="task.github.branchUrl" target="_blank" class="text-xs text-purple-400 hover:text-purple-300 truncate">
                      {{ task.github.branch }}
                    </a>
                    <span v-else class="text-xs text-gray-300 truncate">{{ task.github.branch }}</span>
                  </div>
                  <div v-if="task.github.pullRequest" class="flex items-center gap-2">
                    <span
                      class="px-2 py-0.5 rounded text-xs font-medium"
                      :class="prStatusClass"
                    >PR #{{ task.github.pullRequest.number }}</span>
                    <a :href="task.github.pullRequest.url" target="_blank" class="text-xs text-purple-400 hover:text-purple-300">Ver PR</a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <div
      v-if="previewImageUrl"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 cursor-zoom-out"
      @click="previewImageUrl = null"
    >
      <img
        :src="previewImageUrl"
        class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        @click.stop
      />
      <button
        class="absolute top-4 right-4 text-white bg-gray-800/80 hover:bg-gray-700 rounded-full w-9 h-9 flex items-center justify-center text-xl transition-colors"
        @click="previewImageUrl = null"
      >×</button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Task } from '@/stores/tasks'
import { useTasksStore } from '@/stores/tasks'

const props = defineProps<{
  isOpen: boolean
  task: Task | null
}>()

const emit = defineEmits<{
  close: []
}>()

const tasksStore = useTasksStore()

// Tabs
const activeTab = ref('comments')

const tabs = computed(() => [
  { id: 'comments', label: 'Comentarios', count: props.task?.comments.length ?? 0 },
  { id: 'attachments', label: 'Adjuntos', count: props.task?.attachments.length ?? 0 },
])

// Comment state
const newCommentText = ref('')
const commentImages = ref<File[]>([])
const commentImagePreviews = ref<string[]>([])
const submittingComment = ref(false)
const commentImageInput = ref<HTMLInputElement>()

// Attachment state
const attachmentInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const uploadingAttachment = ref(false)

// Lightbox
const previewImageUrl = ref<string | null>(null)

const sortedComments = computed(() => {
  if (!props.task) return []
  return [...props.task.comments].reverse()
})

watch(() => props.isOpen, (val) => {
  if (val) {
    newCommentText.value = ''
    commentImages.value = []
    commentImagePreviews.value = []
    activeTab.value = 'comments'
  }
})

function close() {
  emit('close')
}

function handleCommentImageSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  addCommentImages(Array.from(input.files))
  input.value = ''
}

function addCommentImages(files: File[]) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    commentImages.value.push(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      commentImagePreviews.value.push(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
}

function removeCommentImage(idx: number) {
  commentImages.value.splice(idx, 1)
  commentImagePreviews.value.splice(idx, 1)
}

async function submitComment() {
  if (!props.task) return
  if (!newCommentText.value.trim() && commentImages.value.length === 0) return
  submittingComment.value = true
  try {
    await tasksStore.addComment(props.task._id, newCommentText.value, commentImages.value.length > 0 ? commentImages.value : undefined)
    newCommentText.value = ''
    commentImages.value = []
    commentImagePreviews.value = []
  } finally {
    submittingComment.value = false
  }
}

function triggerAttachmentUpload() {
  attachmentInput.value?.click()
}

async function handleAttachmentSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || !props.task) return
  uploadingAttachment.value = true
  try {
    for (const file of Array.from(input.files)) {
      await tasksStore.uploadAttachment(props.task._id, file)
    }
  } finally {
    uploadingAttachment.value = false
    input.value = ''
  }
}

async function handleAttachmentDrop(e: DragEvent) {
  isDragging.value = false
  if (!e.dataTransfer?.files || !props.task) return
  uploadingAttachment.value = true
  try {
    for (const file of Array.from(e.dataTransfer.files)) {
      await tasksStore.uploadAttachment(props.task._id, file)
    }
  } finally {
    uploadingAttachment.value = false
  }
}

function openImagePreview(url: string) {
  previewImageUrl.value = url
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

function renderCommentText(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-purple-400 underline break-all hover:text-purple-300">$1</a>'
  )
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return ''
  try {
    return format(new Date(date), "d MMM yyyy, HH:mm", { locale: es })
  } catch {
    return ''
  }
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url)
}

const isPastDue = computed(() => {
  if (!props.task?.dueDate) return false
  return new Date(props.task.dueDate) < new Date()
})

// Style maps
const typeClass = computed(() => {
  const c: Record<string, string> = {
    task: 'bg-blue-900/50 text-blue-300',
    bug: 'bg-red-900/50 text-red-300',
    feature: 'bg-purple-900/50 text-purple-300',
    'user-story': 'bg-green-900/50 text-green-300',
    epic: 'bg-orange-900/50 text-orange-300',
  }
  return c[props.task?.type || 'task'] || c.task
})

const typeLabel = computed(() => {
  const l: Record<string, string> = {
    task: 'Tarea', bug: 'Bug', feature: 'Feature',
    'user-story': 'Historia', epic: 'Épica',
  }
  return l[props.task?.type || 'task'] || 'Tarea'
})

const priorityClass = computed(() => {
  const c: Record<string, string> = {
    low: 'bg-gray-700 text-gray-300',
    medium: 'bg-yellow-900/50 text-yellow-300',
    high: 'bg-orange-900/50 text-orange-300',
    critical: 'bg-red-900/60 text-red-300',
  }
  return c[props.task?.priority || 'medium'] || c.medium
})

const priorityLabel = computed(() => {
  const l: Record<string, string> = {
    low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica',
  }
  return l[props.task?.priority || 'medium'] || 'Media'
})

const boardStatusClass = computed(() => {
  const c: Record<string, string> = {
    backlog: 'bg-gray-700 text-gray-300',
    todo: 'bg-blue-900/50 text-blue-300',
    'in-progress': 'bg-yellow-900/50 text-yellow-300',
    review: 'bg-purple-900/50 text-purple-300',
    testing: 'bg-orange-900/50 text-orange-300',
    done: 'bg-green-900/60 text-green-300',
  }
  return c[props.task?.boardStatus || 'todo'] || c.todo
})

const boardStatusLabel = computed(() => {
  const l: Record<string, string> = {
    backlog: 'Backlog', todo: 'Por Hacer', 'in-progress': 'En Progreso',
    review: 'Revisión', testing: 'Testing', done: 'Hecho',
  }
  return l[props.task?.boardStatus || 'todo'] || 'Por Hacer'
})

const prStatusClass = computed(() => {
  const status = props.task?.github?.pullRequest?.status
  const c: Record<string, string> = {
    open: 'bg-green-900/50 text-green-300',
    closed: 'bg-gray-700 text-gray-300',
    merged: 'bg-purple-900/50 text-purple-300',
  }
  return c[status || 'open'] || c.open
})
</script>
