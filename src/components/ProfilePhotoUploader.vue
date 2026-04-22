<template>
  <div class="space-y-6">
    <input 
      type="file"
      ref="fileInput"
      class="hidden"
      accept="image/*"
      @change="handleFileChange"
    />
    
    <!-- Image Preview and Controls -->
    <div class="space-y-6">
      <!-- Preview -->
      <div v-if="previewUrl" class="relative mx-auto w-32 h-32 animate__animated animate__zoomIn">
        <div class="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-primary-50">
          <img
            :src="previewUrl"
            alt="Vista previa"
            class="w-full h-full object-cover"
          />
        </div>
        
        <!-- Cancel Button -->
        <button
          @click="cancelUpload"
          class="absolute -top-1 -right-1 bg-white hover:bg-rose-50 text-rose-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg border border-rose-100 transition-colors"
          title="Cancelar"
        >
          <i class="fas fa-times text-xs"></i>
        </button>
      </div>
      
      <!-- Uploading Status -->
      <div v-if="uploading" class="flex flex-col items-center justify-center py-4 text-primary-500">
        <i class="fas fa-circle-notch fa-spin text-3xl mb-3"></i>
        <p class="text-[11px] font-black uppercase tracking-widest">Subiendo imagen...</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-3">
        <button
          v-if="!previewUrl && !uploading"
          @click="triggerFileInput"
          class="w-full px-6 py-4 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all border border-primary-100"
        >
          <i class="fas fa-camera text-lg"></i>
          Seleccionar Imagen
        </button>
        
        <button
          v-if="previewUrl && !uploading"
          @click="uploadPhoto"
          class="w-full px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary-200"
        >
          <i class="fas fa-cloud-upload-alt text-lg"></i>
          Confirmar y Subir
        </button>
        
        <button
          v-if="currentPhoto && !uploading && !previewUrl"
          @click="removePhoto"
          class="w-full px-6 py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all border border-rose-100"
        >
          <i class="fas fa-trash-alt text-lg"></i>
          Eliminar Foto Actual
        </button>
      </div>
      
      <!-- Helper Messages -->
      <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center" v-if="!previewUrl && !uploading">
        <p class="text-slate-500 text-[11px] font-bold leading-relaxed">
          <i class="fas fa-info-circle mr-1"></i>
          Sube una foto cuadrada para mejores resultados.<br>
          Formato JPG, PNG o WebP (Máx. 2MB).
        </p>
      </div>
      
      <!-- Errors -->
      <div v-if="errorMessage" class="p-3 bg-rose-50 border border-rose-100 rounded-xl text-center text-rose-600 text-xs font-bold animate__animated animate__shakeX">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue'
import { AvatarService } from '@/services/avatarService'
import { useNotifications } from '@/composables/useNotifications'

const props = defineProps<{
  currentPhoto?: string | null
}>()

const emit = defineEmits<{
  (e: 'update', data: { photo: string | null, avatar: string | null }): void
}>()

const { showSuccess, showError } = useNotifications()

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const errorMessage = ref('')

// Methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  
  if (files && files.length > 0) {
    const file = files[0]
    
    if (!file.type.match('image.*')) {
      errorMessage.value = 'Por favor selecciona una imagen válida'
      return
    }
    
    if (file.size > 2 * 1024 * 1024) {
      errorMessage.value = 'La imagen debe ser menor a 2MB'
      return
    }
    
    errorMessage.value = ''
    previewUrl.value = URL.createObjectURL(file)
    selectedFile.value = file
  }
}

const uploadPhoto = async () => {
  if (!selectedFile.value) return
  
  try {
    uploading.value = true
    errorMessage.value = ''
    
    const response = await AvatarService.uploadProfilePhoto(selectedFile.value)
    
    if (response.success) {
      showSuccess('Foto de perfil actualizada correctamente')
      emit('update', {
        photo: response.data?.photo || null,
        avatar: null
      })
      cleanup()
    } else {
      errorMessage.value = response.message || 'Error al subir la imagen'
      showError(errorMessage.value)
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al subir la imagen'
    showError(errorMessage.value)
  } finally {
    uploading.value = false
  }
}

const removePhoto = async () => {
  try {
    uploading.value = true
    errorMessage.value = ''
    
    const response = await AvatarService.removeProfilePhoto()
    
    if (response.success) {
      showSuccess('Foto de perfil eliminada correctamente')
      emit('update', {
        photo: null,
        avatar: null
      })
    } else {
      errorMessage.value = response.message || 'Error al eliminar la imagen'
      showError(errorMessage.value)
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al eliminar la imagen'
    showError(errorMessage.value)
  } finally {
    uploading.value = false
  }
}

const cancelUpload = () => {
  cleanup()
}

const cleanup = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = ''
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>