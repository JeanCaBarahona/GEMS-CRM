<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Información básica -->
    <div class="grid grid-cols-1 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          <i class="fas fa-heading mr-2 text-purple-400"></i>Título del Caso *
        </label>
        <input
          v-model="form.titulo"
          type="text"
          required
          class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          placeholder="Ej: Actualización de documentos contractuales"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-tag mr-2 text-purple-400"></i>Tipo *
          </label>
          <select
            v-model="form.tipo"
            required
            class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          >
            <option value="" disabled>Selecciona un tipo</option>
            <option value="documento">Documento</option>
            <option value="incidencia">Incidencia</option>
            <option value="seguimiento">Seguimiento</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-flag mr-2 text-purple-400"></i>Estado
          </label>
          <select
            v-model="form.estado"
            class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          >
            <option value="abierto">Abierto</option>
            <option value="en_progreso">En Progreso</option>
            <option value="resuelto">Resuelto</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-star mr-2 text-purple-400"></i>Prioridad
          </label>
          <select
            v-model="form.prioridad"
            class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Descripción -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        <i class="fas fa-align-left mr-2 text-purple-400"></i>Descripción *
      </label>
      <textarea
        v-model="form.descripcion"
        rows="4"
        required
        class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
        placeholder="Describe los detalles del caso..."
      ></textarea>
    </div>

    <!-- Progreso (solo para casos en progreso) -->
    <div v-if="form.estado === 'en_progreso'">
      <label class="block text-sm font-medium text-gray-300 mb-2">
        <i class="fas fa-tasks mr-2 text-purple-400"></i>Progreso
      </label>
      <div class="space-y-3">
        <input
          v-model.number="form.progreso"
          type="range"
          min="0"
          max="100"
          step="5"
          class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div class="flex justify-between text-sm text-gray-400">
          <span>0%</span>
          <span class="text-purple-400 font-medium">{{ form.progreso || 0 }}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>

    <!-- Archivos adjuntos -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">
        <i class="fas fa-paperclip mr-2 text-purple-400"></i>Archivos Adjuntos
      </label>
      
      <!-- Upload area -->
      <div 
        @drop="handleDrop"
        @dragover.prevent
        @dragenter.prevent
        class="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
        :class="{ 'border-purple-500 bg-purple-500/5': isDragging }"
      >
        <input 
          ref="fileInput"
          type="file" 
          multiple 
          @change="handleFileSelect"
          class="hidden"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
        />
        
        <div @click="$refs.fileInput?.click()">
          <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-300 mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
          <p class="text-gray-500 text-sm">PDF, DOC, TXT, imágenes, ZIP hasta 10MB cada uno</p>
        </div>
      </div>

      <!-- File list -->
      <div v-if="selectedFiles.length > 0" class="mt-4 space-y-2">
        <h4 class="text-white font-medium">Archivos seleccionados:</h4>
        <div 
          v-for="(file, index) in selectedFiles" 
          :key="index"
          class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <i :class="getFileIcon(file.name)" class="text-purple-400"></i>
            <div>
              <p class="text-white text-sm">{{ file.name }}</p>
              <p class="text-gray-400 text-xs">{{ formatFileSize(file.size) }}</p>
            </div>
          </div>
          <button title="Quitar archivo" 
            @click="removeFile(index)"
            type="button"
            class="text-red-400 hover:text-red-300 transition-colors"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Existing files (for edit mode) -->
      <div v-if="existingFiles.length > 0" class="mt-4 space-y-2">
        <h4 class="text-white font-medium">Archivos actuales:</h4>
        <div 
          v-for="(file, index) in existingFiles" 
          :key="`existing-${index}`"
          class="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <i :class="getFileIcon(file.nombre)" class="text-purple-400"></i>
            <div>
              <p class="text-white text-sm">{{ file.nombre }}</p>
              <p class="text-gray-400 text-xs">{{ formatFileSize(file.tamaño) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button title="Descargar archivo" 
              @click="downloadFile(file)"
              type="button"
              class="text-purple-400 hover:text-purple-300 transition-colors"
            >
              <i class="fas fa-download"></i>
            </button>
            <button title="Quitar archivo" 
              @click="removeExistingFile(index)"
              type="button"
              class="text-red-400 hover:text-red-300 transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
      <div class="flex items-center gap-3">
        <i class="fas fa-exclamation-triangle text-red-400"></i>
        <p class="text-red-400 text-sm">{{ error }}</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-6 py-3 text-gray-400 hover:text-white transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-500/25"
      >
        <span v-if="loading" class="flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Guardando...
        </span>
        <span v-else>
          {{ mode === 'create' ? 'Crear Caso' : 'Actualizar Caso' }}
        </span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { casesService, type Case, type CaseFile } from '../../services/casesService'
import { useNotifications } from '../../composables/useNotifications'
import { API_CONFIG } from '../../config/api'

// Composables
const { showError, toast } = useNotifications()

// Props
const props = defineProps<{
  case?: Case | null
}>()

// Emits
const emit = defineEmits(['save', 'cancel'])

// Reactive data
const loading = ref(false)
const error = ref('')
const isDragging = ref(false)
const selectedFiles = ref<File[]>([])
const existingFiles = ref<CaseFile[]>([])

const form = reactive<Partial<Case>>({
  titulo: '',
  descripcion: '',
  tipo: 'documento',
  estado: 'abierto',
  prioridad: 'media',
  progreso: 0
})

// Computed
const mode = ref<'create' | 'edit'>('create')

// Methods
const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const formData = new FormData()
    
    // Add form data
    formData.append('titulo', form.titulo!)
    formData.append('descripcion', form.descripcion!)
    formData.append('tipo', form.tipo!)
    formData.append('estado', form.estado!)
    formData.append('prioridad', form.prioridad!)
    
    if (form.progreso !== undefined) {
      formData.append('progreso', form.progreso.toString())
    }

    // Add new files
    selectedFiles.value.forEach((file) => {
      formData.append('archivos', file)
    })

    // Call API service
    if (mode.value === 'create') {
      await casesService.create(formData)
    } else if (props.case?._id) {
      await casesService.update(props.case._id, formData)
    }

    emit('save')
  } catch (err: any) {
    showError('Error al guardar caso', err.message || 'Error desconocido al guardar el caso')
  } finally {
    loading.value = false
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

const addFiles = (files: File[]) => {
  const validFiles = files.filter(file => {
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showError('Archivo demasiado grande', `El archivo ${file.name} es demasiado grande (máximo 10MB)`)
      return false
    }
    
    // Check if file already exists
    if (selectedFiles.value.find(f => f.name === file.name)) {
      toast(`El archivo ${file.name} ya está seleccionado`, 'warning')
      return false
    }
    
    return true
  })
  
  selectedFiles.value.push(...validFiles)
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const removeExistingFile = (index: number) => {
  existingFiles.value.splice(index, 1)
}

const downloadFile = (file: CaseFile) => {
  try {
    // Construir URL completa para el archivo
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '') // Remover /api del final
    const fileUrl = `${baseUrl}${file.url}`
    
    console.log('Downloading file:', file.nombre, 'from URL:', fileUrl)
    
    // Crear un enlace temporal y hacer clic en él
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = file.nombre // Sugerir nombre del archivo
    link.target = '_blank'
    
    // Agregar al DOM temporalmente y hacer clic
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error downloading file:', error)
    // Fallback: abrir en nueva pestaña
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '')
    const fileUrl = `${baseUrl}${file.url}`
    window.open(fileUrl, '_blank')
  }
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return 'fas fa-file-pdf'
    case 'doc':
    case 'docx':
      return 'fas fa-file-word'
    case 'txt':
      return 'fas fa-file-alt'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'fas fa-file-image'
    case 'zip':
    case 'rar':
      return 'fas fa-file-archive'
    default:
      return 'fas fa-file'
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const resetForm = () => {
  Object.assign(form, {
    titulo: '',
    descripcion: '',
    tipo: 'documento',
    estado: 'abierto',
    prioridad: 'media',
    progreso: 0
  })
  selectedFiles.value = []
  existingFiles.value = []
}

const loadForm = () => {
  if (props.case) {
    mode.value = 'edit'
    Object.assign(form, {
      titulo: props.case.titulo || '',
      descripcion: props.case.descripcion || '',
      tipo: props.case.tipo || 'documento',
      estado: props.case.estado || 'abierto',
      prioridad: props.case.prioridad || 'media',
      progreso: props.case.progreso || 0
    })
    existingFiles.value = props.case.archivos || []
  } else {
    mode.value = 'create'
    resetForm()
  }
}

// Load form data on mount
onMounted(() => {
  loadForm()
})

// Watch for changes in props
watch(() => props.case, () => {
  loadForm()
})

// Drag and drop handlers
const handleDragEnter = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}
</script>

<style scoped>
/* Custom slider styling */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(45deg, #8b5cf6, #ec4899);
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(45deg, #8b5cf6, #ec4899);
  cursor: pointer;
  border: none;
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
}

.slider::-webkit-slider-track {
  background: #374151;
  height: 8px;
  border-radius: 4px;
}

.slider::-moz-range-track {
  background: #374151;
  height: 8px;
  border-radius: 4px;
}
</style>
