<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-gray-900 rounded-xl border border-purple-500/30 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-700">
        <div>
          <h2 class="text-2xl font-bold text-white">{{ caseItem.titulo }}</h2>
          <div class="flex items-center space-x-4 mt-2">
            <span 
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="getTypeColor(caseItem.tipo)"
            >
              <i :class="getTypeIcon(caseItem.tipo)" class="mr-1"></i>
              {{ formatType(caseItem.tipo) }}
            </span>
            <span 
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="casesService.getStatusColor(caseItem.estado)"
            >
              {{ formatStatus(caseItem.estado) }}
            </span>
            <span 
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="casesService.getPriorityColor(caseItem.prioridad)"
            >
              {{ formatPriority(caseItem.prioridad) }}
            </span>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-white transition-colors"
        >
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        <!-- Información principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Descripción -->
          <div class="bg-gray-800/50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-white mb-3">Descripción</h3>
            <p class="text-gray-300">{{ caseItem.descripcion }}</p>
          </div>

          <!-- Progreso para seguimientos -->
          <div v-if="caseItem.tipo === 'seguimiento'" class="bg-gray-800/50 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-lg font-semibold text-white">Progreso</h3>
              <span class="text-purple-300 font-medium">{{ caseItem.progreso }}%</span>
            </div>
            <div class="bg-gray-700 rounded-full h-3">
              <div 
                class="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${caseItem.progreso}%` }"
              ></div>
            </div>
            
            <!-- Botones de progreso rápido -->
            <div class="flex space-x-2 mt-3">
              <button
                v-for="progress in [25, 50, 75, 100]"
                :key="progress"
                @click="updateProgress(progress)"
                :class="[
                  'px-3 py-1 rounded text-xs transition-colors',
                  caseItem.progreso >= progress
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                ]"
              >
                {{ progress }}%
              </button>
            </div>
          </div>

          <!-- Hitos para seguimientos -->
          <div v-if="caseItem.tipo === 'seguimiento'" class="bg-gray-800/50 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-lg font-semibold text-white">Hitos</h3>
              <button
                @click="showMilestoneForm = true"
                class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                <i class="fas fa-plus mr-1"></i>
                Agregar
              </button>
            </div>
            
            <div v-if="caseItem.hitos.length === 0" class="text-gray-400 text-center py-4">
              No hay hitos definidos
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="(hito, index) in caseItem.hitos"
                :key="index"
                class="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
              >
                <div class="flex items-center space-x-3">
                  <button
                    @click="toggleMilestone(index)"
                    :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      hito.completado
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-400 hover:border-purple-400'
                    ]"
                  >
                    <i v-if="hito.completado" class="fas fa-check text-white text-xs"></i>
                  </button>
                  <div>
                    <p :class="['font-medium', hito.completado ? 'text-green-400 line-through' : 'text-white']">
                      {{ hito.nombre }}
                    </p>
                    <p class="text-gray-400 text-sm">{{ hito.descripcion }}</p>
                    <p class="text-gray-500 text-xs">
                      Objetivo: {{ formatDate(hito.fecha_objetivo) }}
                      <span v-if="hito.fecha_completado">
                        | Completado: {{ formatDate(hito.fecha_completado) }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Archivos -->
          <div class="bg-gray-800/50 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-lg font-semibold text-white">Archivos</h3>
              <button
                @click="$refs.fileInput.click()"
                class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                <i class="fas fa-upload mr-1"></i>
                Subir
              </button>
            </div>
            
            <input
              ref="fileInput"
              type="file"
              multiple
              @change="handleFileUpload"
              class="hidden"
            >
            
            <div v-if="caseItem.archivos.length === 0" class="text-gray-400 text-center py-4">
              No hay archivos adjuntos
            </div>
            
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="(archivo, index) in caseItem.archivos"
                :key="index"
                class="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
              >
                <div class="flex items-center space-x-3">
                  <i :class="casesService.getFileIcon(archivo.nombre)" class="text-lg"></i>
                  <div>
                    <p class="text-white text-sm font-medium">{{ archivo.nombre }}</p>
                    <p class="text-gray-400 text-xs">
                      {{ casesService.formatFileSize(archivo.tamaño) }} | 
                      {{ formatDate(archivo.fecha_subida) }}
                    </p>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <a
                    :href="getFileUrl(archivo.url)"
                    target="_blank"
                    class="text-purple-400 hover:text-purple-300 transition-colors"
                    title="Descargar"
                  >
                    <i class="fas fa-download"></i>
                  </a>
                  <button
                    @click="deleteFile(index)"
                    class="text-red-400 hover:text-red-300 transition-colors"
                    title="Eliminar"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Comentarios -->
          <div class="bg-gray-800/50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-white mb-3">Comentarios</h3>
            
            <!-- Nuevo comentario -->
            <div class="mb-4">
              <div class="flex space-x-3">
                <textarea
                  v-model="newComment"
                  placeholder="Agregar un comentario..."
                  rows="3"
                  class="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
                <div class="flex flex-col space-y-2">
                  <select
                    v-model="commentType"
                    class="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="comentario">Comentario</option>
                    <option value="actualizacion">Actualización</option>
                    <option value="resolucion">Resolución</option>
                  </select>
                  <button
                    @click="addComment"
                    :disabled="!newComment.trim()"
                    class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Lista de comentarios -->
            <div v-if="caseItem.comentarios.length === 0" class="text-gray-400 text-center py-4">
              No hay comentarios
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="comentario in caseItem.comentarios"
                :key="comentario._id"
                class="bg-gray-700/50 rounded-lg p-3"
              >
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <i class="fas fa-user text-white text-sm"></i>
                    </div>
                    <div>
                      <p class="text-white font-medium text-sm">Usuario</p>
                      <p class="text-gray-400 text-xs">{{ formatDate(comentario.fecha) }}</p>
                    </div>
                  </div>
                  <span 
                    class="px-2 py-1 rounded text-xs"
                    :class="getCommentTypeColor(comentario.tipo)"
                  >
                    {{ formatCommentType(comentario.tipo) }}
                  </span>
                </div>
                <p class="text-gray-300 text-sm">{{ comentario.comentario }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Información general -->
          <div class="bg-gray-800/50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-white mb-3">Información</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm text-gray-400">ID</label>
                <p class="text-white text-sm font-mono">{{ caseItem._id }}</p>
              </div>
              
              <div>
                <label class="block text-sm text-gray-400">Creado</label>
                <p class="text-white text-sm">{{ formatDate(caseItem.createdAt) }}</p>
              </div>
              
              <div>
                <label class="block text-sm text-gray-400">Actualizado</label>
                <p class="text-white text-sm">{{ formatDate(caseItem.updatedAt) }}</p>
              </div>
              
              <div v-if="caseItem.fecha_limite">
                <label class="block text-sm text-gray-400">Fecha límite</label>
                <p class="text-white text-sm">{{ formatDate(caseItem.fecha_limite) }}</p>
              </div>
              
              <div v-if="caseItem.fecha_resolucion">
                <label class="block text-sm text-gray-400">Fecha resolución</label>
                <p class="text-white text-sm">{{ formatDate(caseItem.fecha_resolucion) }}</p>
              </div>
            </div>
          </div>

          <!-- Campos específicos para incidencias -->
          <div v-if="caseItem.tipo === 'incidencia'" class="bg-gray-800/50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-white mb-3">Detalles de Incidencia</h3>
            <div class="space-y-3">
              <div v-if="caseItem.gravedad">
                <label class="block text-sm text-gray-400">Gravedad</label>
                <span 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getSeverityColor(caseItem.gravedad)"
                >
                  {{ formatSeverity(caseItem.gravedad) }}
                </span>
              </div>
              
              <div v-if="caseItem.impacto">
                <label class="block text-sm text-gray-400">Impacto</label>
                <span 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getImpactColor(caseItem.impacto)"
                >
                  {{ formatImpact(caseItem.impacto) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Categoría y Tags -->
          <div class="bg-gray-800/50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-white mb-3">Categorización</h3>
            <div class="space-y-3">
              <div v-if="caseItem.categoria">
                <label class="block text-sm text-gray-400">Categoría</label>
                <p class="text-white text-sm">{{ caseItem.categoria }}</p>
              </div>
              
              <div v-if="caseItem.tags.length > 0">
                <label class="block text-sm text-gray-400 mb-2">Tags</label>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in caseItem.tags"
                    :key="tag"
                    class="bg-purple-600 text-white px-2 py-1 rounded-full text-xs"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="bg-gray-800/50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-white mb-3">Acciones</h3>
            <div class="space-y-2">
              <button
                @click="changeStatus('en_progreso')"
                :disabled="caseItem.estado === 'en_progreso'"
                class="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm transition-colors disabled:opacity-50"
              >
                Marcar en progreso
              </button>
              
              <button
                @click="changeStatus('resuelto')"
                :disabled="caseItem.estado === 'resuelto' || caseItem.estado === 'cerrado'"
                class="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors disabled:opacity-50"
              >
                Marcar como resuelto
              </button>
              
              <button
                @click="changeStatus('cerrado')"
                :disabled="caseItem.estado === 'cerrado'"
                class="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition-colors disabled:opacity-50"
              >
                Cerrar caso
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar hito -->
    <div v-if="showMilestoneForm" class="fixed inset-0 bg-black/75 flex items-center justify-center z-60">
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-white mb-4">Nuevo Hito</h3>
        <form @submit.prevent="addMilestone" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
            <input
              v-model="milestoneForm.nombre"
              type="text"
              required
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
            <textarea
              v-model="milestoneForm.descripcion"
              rows="3"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Fecha objetivo</label>
            <input
              v-model="milestoneForm.fecha_objetivo"
              type="date"
              required
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
          </div>
          
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showMilestoneForm = false"
              class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { casesService, type Case } from '../services/casesService'
import { API_CONFIG } from '../config/api'
import { useNotifications } from '../composables/useNotifications'

const { confirmDelete } = useNotifications()

// Props
const props = defineProps<{
  caseItem: Case
}>()

// Emits
const emit = defineEmits<{
  close: []
  updated: []
}>()

// State
const newComment = ref('')
const commentType = ref<'comentario' | 'actualizacion' | 'resolucion'>('comentario')
const showMilestoneForm = ref(false)

const milestoneForm = reactive({
  nombre: '',
  descripcion: '',
  fecha_objetivo: ''
})

// Methods
const updateProgress = async (progress: number) => {
  try {
    await casesService.updateProgress(props.caseItem._id!, progress)
    emit('updated')
  } catch (error) {
    console.error('Error updating progress:', error)
  }
}

const addComment = async () => {
  if (!newComment.value.trim()) return
  
  try {
    await casesService.addComment(props.caseItem._id!, {
      autor: 'current-user-id', // Aquí deberías obtener el ID del usuario actual
      comentario: newComment.value,
      tipo: commentType.value
    })
    
    newComment.value = ''
    commentType.value = 'comentario'
    emit('updated')
  } catch (error) {
    console.error('Error adding comment:', error)
  }
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    try {
      await casesService.uploadFiles(props.caseItem._id!, target.files)
      emit('updated')
    } catch (error) {
      console.error('Error uploading files:', error)
    }
  }
}

const deleteFile = async (fileIndex: number) => {
  const result = await confirmDelete('¿Eliminar este archivo?')
  if (!result.isConfirmed) return
  try {
    await casesService.deleteFile(props.caseItem._id!, fileIndex)
    emit('updated')
  } catch (error) {
    console.error('Error deleting file:', error)
  }
}

const addMilestone = async () => {
  try {
    await casesService.addMilestone(props.caseItem._id!, milestoneForm)
    
    // Reset form
    milestoneForm.nombre = ''
    milestoneForm.descripcion = ''
    milestoneForm.fecha_objetivo = ''
    showMilestoneForm.value = false
    
    emit('updated')
  } catch (error) {
    console.error('Error adding milestone:', error)
  }
}

const toggleMilestone = async (milestoneIndex: number) => {
  try {
    await casesService.completeMilestone(props.caseItem._id!, milestoneIndex)
    emit('updated')
  } catch (error) {
    console.error('Error toggling milestone:', error)
  }
}

const changeStatus = async (newStatus: Case['estado']) => {
  try {
    const updateData: Partial<Case> = { estado: newStatus }
    if (newStatus === 'resuelto' || newStatus === 'cerrado') {
      updateData.fecha_resolucion = new Date()
    }
    
    await casesService.updateCase(props.caseItem._id!, updateData)
    emit('updated')
  } catch (error) {
    console.error('Error changing status:', error)
  }
}

// Función para obtener la URL completa del archivo
const getFileUrl = (fileUrl: string): string => {
  // Si la URL ya es absoluta, devolverla tal cual
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl
  }
  
  // Si es una URL relativa que comienza con /uploads, construir la URL completa
  if (fileUrl.startsWith('/uploads')) {
    // Remover la /api del final de BASE_URL si existe, y agregar la ruta del archivo
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '')
    return `${baseUrl}${fileUrl}`
  }
  
  // Para otros casos, devolver la URL relativa (aunque no debería pasar)
  return fileUrl
}

// Formatters
const formatType = (tipo: string) => {
  const types: Record<string, string> = {
    documento: 'Documento',
    incidencia: 'Incidencia',
    seguimiento: 'Seguimiento'
  }
  return types[tipo] || tipo
}

const formatStatus = (estado: string) => {
  const statuses: Record<string, string> = {
    abierto: 'Abierto',
    en_progreso: 'En Progreso',
    resuelto: 'Resuelto',
    cerrado: 'Cerrado'
  }
  return statuses[estado] || estado
}

const formatPriority = (prioridad: string) => {
  const priorities: Record<string, string> = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    critica: 'Crítica'
  }
  return priorities[prioridad] || prioridad
}

const formatSeverity = (gravedad: string) => {
  const severities: Record<string, string> = {
    menor: 'Menor',
    moderada: 'Moderada',
    mayor: 'Mayor',
    critica: 'Crítica'
  }
  return severities[gravedad] || gravedad
}

const formatImpact = (impacto: string) => {
  const impacts: Record<string, string> = {
    bajo: 'Bajo',
    medio: 'Medio',
    alto: 'Alto'
  }
  return impacts[impacto] || impacto
}

const formatCommentType = (tipo: string) => {
  const types: Record<string, string> = {
    comentario: 'Comentario',
    actualizacion: 'Actualización',
    resolucion: 'Resolución'
  }
  return types[tipo] || tipo
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTypeColor = (tipo: string) => {
  switch (tipo) {
    case 'documento': return 'text-blue-600 bg-blue-100'
    case 'incidencia': return 'text-red-600 bg-red-100'
    case 'seguimiento': return 'text-green-600 bg-green-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

const getTypeIcon = (tipo: string) => {
  switch (tipo) {
    case 'documento': return 'fas fa-file-alt'
    case 'incidencia': return 'fas fa-exclamation-triangle'
    case 'seguimiento': return 'fas fa-tasks'
    default: return 'fas fa-folder'
  }
}

const getSeverityColor = (gravedad: string) => {
  switch (gravedad) {
    case 'menor': return 'text-green-600 bg-green-100'
    case 'moderada': return 'text-yellow-600 bg-yellow-100'
    case 'mayor': return 'text-orange-600 bg-orange-100'
    case 'critica': return 'text-red-600 bg-red-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

const getImpactColor = (impacto: string) => {
  switch (impacto) {
    case 'bajo': return 'text-green-600 bg-green-100'
    case 'medio': return 'text-yellow-600 bg-yellow-100'
    case 'alto': return 'text-red-600 bg-red-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

const getCommentTypeColor = (tipo: string) => {
  switch (tipo) {
    case 'comentario': return 'text-blue-600 bg-blue-100'
    case 'actualizacion': return 'text-yellow-600 bg-yellow-100'
    case 'resolucion': return 'text-green-600 bg-green-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}
</script>
