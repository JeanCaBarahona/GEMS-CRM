<template>
  <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
    <div v-if="!submitted" class="p-6 md:p-10 space-y-8 animate-fade-in">
      
      <!-- Premium Header Context -->
      <div v-if="!authStore.isAuthenticated" class="text-center space-y-2 mb-10">
        <h3 class="text-2xl font-black text-slate-800 tracking-tight">Centro de Soporte</h3>
        <p class="text-slate-400 text-sm font-medium">Estamos aquí para ayudarte a crecer con Customer CRM</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- User Info Row - Always visible for clarity -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
          <div class="space-y-3">
            <label class="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tu Nombre</label>
            <input 
              v-model="formData.name"
              required 
              type="text" 
              placeholder="Ej. Sebastian Pulgarin"
              class="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all"
            />
          </div>

          <div class="space-y-3">
            <label class="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email de Contacto</label>
            <input 
              v-model="formData.email"
              required 
              type="email" 
              placeholder="tu@empresa.com"
              class="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        <!-- Subject -->
        <div class="space-y-3">
          <label class="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Asunto de la Incidencia</label>
          <input 
            v-model="formData.subject"
            required 
            type="text" 
            placeholder="¿En qué podemos ayudarte hoy?"
            class="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-base font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all placeholder:text-slate-300"
          />
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-3">
            <label class="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Categoría</label>
            <div class="relative">
              <select 
                v-model="formData.category"
                class="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22m6%208%204%204%204-4%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center] bg-no-repeat transition-all"
              >
                <option value="technical">Soporte Técnico</option>
                <option value="billing">Facturación</option>
                <option value="sales">Comercial</option>
                <option value="other">Otros</option>
              </select>
            </div>
          </div>

          <div class="space-y-3">
            <label class="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Prioridad</label>
            <div class="flex gap-2 p-1.5 bg-slate-100/50 border border-slate-200 rounded-2xl shadow-inner">
               <button 
                type="button"
                v-for="p in priorities" 
                :key="p.id"
                @click="formData.priority = p.id"
                class="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300"
                :class="formData.priority === p.id 
                  ? p.activeClass 
                  : 'text-slate-400 hover:text-slate-600'"
               >
                 {{ p.label }}
               </button>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-3">
          <label class="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Descripción</label>
          <textarea 
            v-model="formData.description"
            required 
            rows="5" 
            placeholder="Cuéntanos más detalles para darte una solución rápida..."
            class="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all shadow-sm resize-none"
          ></textarea>
        </div>

        <!-- Attachment Zone (Premium) -->
        <div class="space-y-3">
          <label class="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Evidencias (Imágenes/Docs)</label>
          <div 
            @click="$refs.fileInput.click()"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="handleDrop"
            class="relative group cursor-pointer"
          >
            <div 
              class="border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-3"
              :class="dragOver ? 'border-primary-500 bg-primary-50/30' : 'border-slate-200 bg-slate-50/30 hover:border-slate-300 hover:bg-slate-50'"
            >
              <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors">
                <i class="fas fa-cloud-upload-alt text-xl"></i>
              </div>
              <div class="text-center">
                <p class="text-xs font-bold text-slate-700">Haz clic o arrastra archivos aquí</p>
                <p class="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Soporta JPG, PNG, PDF (Máx. 5 archivos)</p>
              </div>
            </div>
            <input 
              type="file" 
              ref="fileInput" 
              multiple 
              class="hidden" 
              @change="handleFileChange"
            />

            <!-- Preview List -->
            <div v-if="selectedFiles.length > 0" class="mt-4 flex flex-wrap gap-2">
              <div v-for="(file, index) in selectedFiles" :key="index" class="relative group/file bg-white border border-slate-200 p-2 rounded-xl flex items-center gap-3 animate-slide-in">
                <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-primary-500 overflow-hidden">
                  <img v-if="isImage(file)" :src="getFilePreview(file)" class="w-full h-full object-cover" />
                  <i v-else class="fas fa-file-alt"></i>
                </div>
                <div class="pr-6">
                  <p class="text-[10px] font-black text-slate-700 truncate max-w-[120px]">{{ file.name }}</p>
                  <p class="text-[9px] text-slate-400 uppercase font-black">{{ formatSize(file.size) }}</p>
                </div>
                <button 
                  @click.stop="removeFile(index)" 
                  class="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm opacity-0 group-hover/file:opacity-100 transition-opacity"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button (Sticky-ready) -->
        <div class="pt-4">
          <button 
            type="submit" 
            :disabled="loading"
            class="w-full py-5 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-slate-200 hover:shadow-slate-300 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
          >
            <template v-if="loading">
              <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Subiendo...</span>
            </template>
            <template v-else>
              <span>Levantar Ticket</span>
              <i class="fas fa-arrow-right text-[10px] opacity-50"></i>
            </template>
          </button>
          
          <p class="text-[10px] text-center text-slate-300 font-bold uppercase tracking-[0.2em] mt-6 leading-relaxed">
            Customer CRM Support &middot; Centro de Soluciones Digitales
          </p>
        </div>
      </form>
    </div>

    <!-- Minimal Success State -->
    <div v-else class="p-16 text-center animate-fade-in flex flex-col items-center">
       <div class="w-20 h-20 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-200 mb-8 overflow-hidden relative group">
         <div class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
         <i class="fas fa-check text-2xl"></i>
       </div>
       
       <p class="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">Misión cumplida</p>
       <h2 class="text-4xl font-black text-slate-800 tracking-tighter mb-4">Ticket Notificado</h2>
       <p class="text-sm text-slate-500 font-bold mb-10 bg-slate-50 px-6 py-2 rounded-full border border-slate-100">
         ID: <span class="text-primary-600 font-mono ml-1">#{{ ticketId }}</span>
       </p>
       
       <p class="text-base text-slate-500 font-medium max-w-sm mx-auto leading-relaxed mb-8">
         Hemos asignado a <strong class="text-slate-800">{{ assignedAgentName }}</strong> para atender tu solicitud. Recibirás actualizaciones en tiempo real via email.
       </p>

       <div class="flex flex-col sm:flex-row gap-4 w-full max-w-sm pb-8">
         <button @click="resetForm" class="flex-1 px-8 py-4 bg-white text-slate-800 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all">
           Nuevo Reporte
         </button>
         <router-link v-if="authStore.isAuthenticated" to="/support" class="flex-1 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200">
           Ver Mis Tickets
         </router-link>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ticketService } from '../../services/ticketService'
import { useNotifications } from '../../composables/useNotifications'
import { useAuthStore } from '../../stores/auth'

const { showError, showSuccess } = useNotifications()
const authStore = useAuthStore()

const loading = ref(false)
const submitted = ref(false)
const ticketId = ref('')
const assignedAgentName = ref('un experto')
const dragOver = ref(false)
const selectedFiles = ref<File[]>([])

const formData = ref({
  name: '',
  email: '',
  subject: '',
  description: '',
  category: 'technical',
  priority: 'medium'
})

const priorities = [
  { id: 'low', label: 'Baja', activeClass: 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' },
  { id: 'medium', label: 'Media', activeClass: 'bg-amber-400 text-white shadow-lg shadow-amber-200' },
  { id: 'high', label: 'Alta', activeClass: 'bg-orange-500 text-white shadow-lg shadow-orange-200' },
  { id: 'urgent', label: 'Crítica', activeClass: 'bg-rose-500 text-white shadow-lg shadow-rose-200' }
]

onMounted(() => {
  if (authStore.isAuthenticated && authStore.user) {
    formData.value.name = authStore.user.name
    formData.value.email = authStore.user.email
  }
})

const handleFileChange = (e: any) => {
  const files = Array.from(e.target.files) as File[]
  addFiles(files)
}

const handleDrop = (e: DragEvent) => {
  dragOver.value = false
  if (e.dataTransfer?.files) {
    const files = Array.from(e.dataTransfer.files) as File[]
    addFiles(files)
  }
}

const addFiles = (files: File[]) => {
  if (selectedFiles.value.length + files.length > 5) {
    showError('Máximo 5 archivos permitidos')
    return
  }
  selectedFiles.value = [...selectedFiles.value, ...files]
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const isImage = (file: File) => file.type.startsWith('image/')
const getFilePreview = (file: File) => URL.createObjectURL(file)
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const hasFiles = selectedFiles.value.length > 0
    let submissionData: any

    if (hasFiles) {
      const form = new FormData()
      form.append('subject', formData.value.subject)
      form.append('description', formData.value.description)
      form.append('category', formData.value.category)
      form.append('priority', formData.value.priority)
      form.append('name', formData.value.name)
      form.append('email', formData.value.email)
      
      if (authStore.user?._id) form.append('userId', authStore.user._id)
      
      selectedFiles.value.forEach(file => {
        form.append('files', file)
      })
      submissionData = form
    } else {
      submissionData = {
        ...formData.value,
        userId: authStore.user?._id
      }
    }
    
    const response = await ticketService.createPublic(submissionData)
    if (response.success && response.data) {
      ticketId.value = response.data.ticketNumber
      
      if (response.data.assignedTo && typeof response.data.assignedTo === 'object') {
        assignedAgentName.value = response.data.assignedTo.name || 'un experto'
      } else {
        assignedAgentName.value = 'un experto'
      }

      submitted.value = true
      showSuccess('Ticket levantado con éxito')
    } else {
      showError(response.error || 'Error al procesar la solicitud')
    }
  } catch (err: any) {
    showError(err.message)
  } finally {
    loading.value = false
  }
}


const resetForm = () => {
  formData.value = {
    name: authStore.user?.name || '',
    email: authStore.user?.email || '',
    subject: '',
    description: '',
    category: 'technical',
    priority: 'medium'
  }
  selectedFiles.value = []
  submitted.value = false
}
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-slide-in { animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
