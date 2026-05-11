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
        <!-- User Info Row -->
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

        <!-- Category -->
        <div class="space-y-3">
          <label class="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">¿Qué tipo de ayuda necesitas?</label>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              @click="selectCategory(cat.id)"
              :class="[
                'p-4 rounded-2xl border-2 transition-all text-left',
                formData.category === cat.id
                  ? 'border-primary-500 bg-primary-50/50 shadow-md'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300',
              ]"
            >
              <i :class="['fas', cat.icon, 'text-base mb-2 block', formData.category === cat.id ? 'text-primary-600' : 'text-slate-400']"></i>
              <p :class="['text-[11px] font-black uppercase tracking-wider', formData.category === cat.id ? 'text-slate-900' : 'text-slate-600']">
                {{ cat.label }}
              </p>
            </button>
          </div>
        </div>

        <!-- Soporte Técnico: Sub-categoría dinámica -->
        <div v-if="formData.category === 'technical'" class="space-y-3 animate-fade-in">
          <label class="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
            Especifica el tipo de incidencia <span class="text-rose-500">*</span>
          </label>
          <div class="space-y-2">
            <button
              v-for="sub in technicalSubcategories"
              :key="sub.id"
              type="button"
              @click="selectSubcategory(sub.id)"
              :class="[
                'w-full p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-3',
                formData.subcategory === sub.id
                  ? 'border-primary-500 bg-primary-50/30 shadow-sm'
                  : 'border-slate-200 bg-slate-50/30 hover:border-slate-300',
              ]"
            >
              <div :class="[
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                formData.subcategory === sub.id ? 'bg-primary-500 text-white' : 'bg-white text-slate-400 border border-slate-200',
              ]">
                <i :class="['fas', sub.icon, 'text-xs']"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p :class="['text-[12px] font-black mb-0.5', formData.subcategory === sub.id ? 'text-slate-900' : 'text-slate-700']">
                  {{ sub.label }}
                </p>
                <p class="text-[10px] text-slate-500 font-medium leading-relaxed">{{ sub.hint }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Deflexión: Pasos sugeridos de la Wiki -->
        <transition name="expand">
          <div
            v-if="showDeflection"
            class="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/30 overflow-hidden animate-fade-in"
          >
            <div class="px-5 py-4 border-b border-amber-200/50 bg-white/40 flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md">
                <i class="fas fa-lightbulb text-sm"></i>
              </div>
              <div class="flex-1">
                <p class="text-[11px] font-black text-amber-900 uppercase tracking-wider">Antes de levantar el ticket</p>
                <p class="text-[10px] text-amber-700 font-bold">Prueba estos pasos primero — pueden resolver tu problema en segundos</p>
              </div>
            </div>

            <div class="p-4 space-y-2">
              <div v-if="loadingSuggestions" class="text-center py-6">
                <i class="fas fa-circle-notch fa-spin text-amber-500 text-lg mb-2"></i>
                <p class="text-[10px] font-bold text-amber-700">Buscando soluciones documentadas...</p>
              </div>

              <div v-else-if="suggestions.length === 0" class="text-center py-6">
                <i class="fas fa-folder-open text-amber-400 text-lg mb-2"></i>
                <p class="text-[11px] font-bold text-amber-800">No hay procedimientos documentados para esta categoría todavía.</p>
                <p class="text-[10px] text-amber-600 mt-1">Puedes levantar el ticket directamente.</p>
              </div>

              <div v-else class="space-y-2">
                <button
                  v-for="(s, idx) in suggestions"
                  :key="s._id || idx"
                  type="button"
                  @click="toggleSuggestion(idx)"
                  class="w-full bg-white rounded-xl border border-amber-200 overflow-hidden text-left transition-all hover:shadow-sm"
                >
                  <div class="px-4 py-3 flex items-center gap-3">
                    <span class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black text-[11px] flex-shrink-0">
                      {{ idx + 1 }}
                    </span>
                    <div class="flex-1 min-w-0">
                      <p class="text-[12px] font-black text-slate-800 truncate">{{ s.titulo }}</p>
                      <p v-if="s.descripcion" class="text-[10px] text-slate-500 font-medium truncate">{{ s.descripcion }}</p>
                    </div>
                    <i :class="['fas text-slate-400 transition-transform text-xs', expandedSuggestion === idx ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                  </div>
                  <div v-if="expandedSuggestion === idx" class="px-4 pb-4 pt-1 border-t border-amber-100">
                    <WikiContent :content="s.contenido" />
                  </div>
                </button>
              </div>

              <!-- Confirmation buttons -->
              <div v-if="!loadingSuggestions" class="pt-3 mt-2 border-t border-amber-200/50 flex flex-col sm:flex-row gap-2">
                <button
                  v-if="suggestions.length > 0"
                  type="button"
                  @click="markResolved"
                  class="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                >
                  <i class="fas fa-check"></i>
                  ¡Funcionó! No necesito ticket
                </button>
                <button
                  type="button"
                  @click="acknowledgeDeflection"
                  :class="[
                    'flex-1 py-3 px-4 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 border-2',
                    deflectionAcknowledged
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400',
                  ]"
                >
                  <i :class="['fas', deflectionAcknowledged ? 'fa-check-circle' : 'fa-circle']"></i>
                  Los pasos no funcionaron
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- "He resuelto mi problema" state -->
        <div v-if="resolved" class="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-6 text-center animate-fade-in">
          <i class="fas fa-circle-check text-3xl text-emerald-500 mb-2"></i>
          <p class="text-sm font-black text-emerald-800 mb-1">¡Excelente! Nos alegra que se haya resuelto.</p>
          <p class="text-[11px] text-emerald-600 font-bold">No es necesario levantar un ticket.</p>
          <button
            type="button"
            @click="resolved = false"
            class="mt-4 text-[10px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-wider"
          >
            ¿Volvió a fallar? Levantar ticket de todos modos
          </button>
        </div>

        <!-- Subject + Priority + Description (only when can submit) -->
        <div v-if="canShowFullForm" class="space-y-8 animate-fade-in">
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

          <!-- Priority -->
          <div class="space-y-3">
            <label class="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Prioridad</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 bg-slate-100/50 border border-slate-200 rounded-2xl shadow-inner">
              <button
                type="button"
                v-for="p in priorities"
                :key="p.id"
                @click="formData.priority = p.id"
                class="py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300"
                :class="formData.priority === p.id ? p.activeClass : 'text-slate-400 hover:text-slate-600'"
              >
                {{ p.label }}
              </button>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-3">
            <label class="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Descripción</label>
            <textarea
              v-model="formData.description"
              required
              rows="5"
              placeholder="Cuéntanos qué pasa, qué intentaste y cuándo empezó..."
              class="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all shadow-sm resize-none"
            ></textarea>
          </div>

          <!-- Attachments -->
          <div class="space-y-3">
            <label class="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Evidencias (Imágenes/Docs)</label>
            <div
              @click="($refs.fileInput as HTMLInputElement)?.click()"
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
                  <p class="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">JPG, PNG, PDF (Máx. 5)</p>
                </div>
              </div>
              <input type="file" ref="fileInput" multiple class="hidden" @change="handleFileChange" />

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
        </div>

        <!-- Submit -->
        <div class="pt-4">
          <button
            type="submit"
            :disabled="loading || !canSubmit"
            :class="[
              'w-full py-5 font-black text-xs uppercase tracking-[0.3em] rounded-2xl transition-all flex items-center justify-center gap-4',
              canSubmit
                ? 'bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200 hover:shadow-slate-300 hover:-translate-y-1 active:translate-y-0'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed',
            ]"
          >
            <template v-if="loading">
              <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Subiendo...</span>
            </template>
            <template v-else-if="!formData.category">
              <span>Selecciona una categoría primero</span>
            </template>
            <template v-else-if="formData.category === 'technical' && !formData.subcategory">
              <span>Selecciona el tipo de incidencia</span>
            </template>
            <template v-else-if="needsDeflection">
              <i class="fas fa-lock text-[10px]"></i>
              <span>Confirma que los pasos no funcionaron</span>
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

    <!-- Success State -->
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
         Hemos asignado a <strong class="text-slate-800">{{ assignedAgentName }}</strong> para atender tu solicitud. Recibirás actualizaciones en tiempo real vía email.
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
import { ref, computed, onMounted, watch } from 'vue'
import { ticketService } from '../../services/ticketService'
import { wikiService, type WikiArticle } from '../../services/wikiService'
import { useNotifications } from '../../composables/useNotifications'
import { useAuthStore } from '../../stores/auth'
import WikiContent from '../wiki/WikiContent.vue'

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
  subcategory: '' as '' | 'app' | 'credenciales' | 'inconcert' | 'otros',
  priority: 'medium',
})

const categories = [
  { id: 'technical', label: 'Soporte Técnico', icon: 'fa-headset' },
  { id: 'billing', label: 'Facturación', icon: 'fa-receipt' },
  { id: 'sales', label: 'Comercial', icon: 'fa-handshake' },
  { id: 'other', label: 'Otros', icon: 'fa-circle-question' },
]

const technicalSubcategories = [
  {
    id: 'app' as const,
    label: 'Falla de una aplicación',
    hint: 'Una app no abre, se cierra sola, lanza errores o muestra pantallas en blanco',
    icon: 'fa-triangle-exclamation',
    tags: ['app', 'aplicacion', 'fallo', 'error', 'crash'],
  },
  {
    id: 'credenciales' as const,
    label: 'Credenciales incorrectas / datos no entran a la BD',
    hint: 'No puedes iniciar sesión, los datos del formulario no se guardan en la base de datos',
    icon: 'fa-key',
    tags: ['credenciales', 'login', 'acceso', 'password', 'bd', 'database', 'datos'],
  },
  {
    id: 'inconcert' as const,
    label: 'InConcert / Bot no funciona',
    hint: 'Un bot de WhatsApp o agente automatizado dejó de responder o responde mal',
    icon: 'fa-robot',
    tags: ['inconcert', 'bot', 'whatsapp', 'agente', 'automatizacion'],
  },
  {
    id: 'otros' as const,
    label: 'Otros',
    hint: 'Mi problema no encaja en ninguna de las categorías anteriores',
    icon: 'fa-comment-dots',
    tags: [],
  },
]

const priorities = [
  { id: 'low', label: 'P4 · Baja', activeClass: 'bg-blue-500 text-white shadow-lg shadow-blue-200' },
  { id: 'medium', label: 'P3 · Media', activeClass: 'bg-amber-400 text-white shadow-lg shadow-amber-200' },
  { id: 'high', label: 'P2 · Alta', activeClass: 'bg-orange-500 text-white shadow-lg shadow-orange-200' },
  { id: 'urgent', label: 'P1 · Crítica', activeClass: 'bg-rose-500 text-white shadow-lg shadow-rose-200' },
]

// Deflection state
const suggestions = ref<WikiArticle[]>([])
const loadingSuggestions = ref(false)
const expandedSuggestion = ref<number | null>(null)
const deflectionAcknowledged = ref(false)
const resolved = ref(false)

const currentSubcategory = computed(() =>
  technicalSubcategories.find((s) => s.id === formData.value.subcategory)
)

const showDeflection = computed(
  () => formData.value.category === 'technical' && formData.value.subcategory && formData.value.subcategory !== 'otros' && !resolved.value
)

const needsDeflection = computed(() => {
  if (formData.value.category !== 'technical') return false
  if (!formData.value.subcategory) return true
  if (formData.value.subcategory === 'otros') return false
  if (loadingSuggestions.value) return true
  // Si no hay sugerencias documentadas, no requerimos confirmación
  if (suggestions.value.length === 0) return false
  return !deflectionAcknowledged.value
})

const canShowFullForm = computed(() => {
  if (resolved.value) return false
  if (formData.value.category !== 'technical') return true
  if (!formData.value.subcategory) return false
  if (formData.value.subcategory === 'otros') return true
  if (loadingSuggestions.value) return false
  if (suggestions.value.length === 0) return true
  return deflectionAcknowledged.value
})

const canSubmit = computed(() => {
  if (loading.value || resolved.value) return false
  if (!formData.value.category) return false
  if (formData.value.category === 'technical' && !formData.value.subcategory) return false
  if (needsDeflection.value) return false
  return !!formData.value.subject.trim() && !!formData.value.description.trim()
})

onMounted(() => {
  if (authStore.isAuthenticated && authStore.user) {
    formData.value.name = authStore.user.name
    formData.value.email = authStore.user.email
  }
})

const selectCategory = (id: string) => {
  formData.value.category = id
  formData.value.subcategory = ''
  resetDeflection()
}

const selectSubcategory = async (id: 'app' | 'credenciales' | 'inconcert' | 'otros') => {
  formData.value.subcategory = id
  resetDeflection()
  if (id === 'otros') return
  await loadSuggestions()
}

const resetDeflection = () => {
  suggestions.value = []
  expandedSuggestion.value = null
  deflectionAcknowledged.value = false
  resolved.value = false
}

const loadSuggestions = async () => {
  const sub = currentSubcategory.value
  if (!sub || !sub.tags.length) return
  loadingSuggestions.value = true
  try {
    // Buscamos por cada tag y combinamos resultados
    const seen = new Set<string>()
    const results: WikiArticle[] = []
    for (const tag of sub.tags) {
      try {
        const articles = await wikiService.getAll({ search: tag })
        articles.forEach((a) => {
          if (a._id && !seen.has(a._id)) {
            seen.add(a._id)
            results.push(a)
          }
        })
        if (results.length >= 4) break
      } catch {
        /* ignora errores parciales */
      }
    }
    suggestions.value = results.slice(0, 4)
  } catch {
    suggestions.value = []
  } finally {
    loadingSuggestions.value = false
  }
}

const toggleSuggestion = (idx: number) => {
  expandedSuggestion.value = expandedSuggestion.value === idx ? null : idx
}

const acknowledgeDeflection = () => {
  deflectionAcknowledged.value = !deflectionAcknowledged.value
}

const markResolved = () => {
  resolved.value = true
  deflectionAcknowledged.value = false
}

// Auto-acknowledge si no hay sugerencias
watch(suggestions, (val) => {
  if (formData.value.subcategory && formData.value.subcategory !== 'otros' && val.length === 0 && !loadingSuggestions.value) {
    deflectionAcknowledged.value = true
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

const buildDescription = () => {
  const sub = currentSubcategory.value
  const prefix = sub ? `[Subcategoría: ${sub.label}]\n\n` : ''
  return prefix + formData.value.description
}

const handleSubmit = async () => {
  if (!canSubmit.value) return
  loading.value = true
  try {
    const description = buildDescription()
    const hasFiles = selectedFiles.value.length > 0
    let submissionData: any

    if (hasFiles) {
      const form = new FormData()
      form.append('subject', formData.value.subject)
      form.append('description', description)
      form.append('category', formData.value.category)
      form.append('priority', formData.value.priority)
      form.append('name', formData.value.name)
      form.append('email', formData.value.email)
      if (authStore.user?._id) form.append('userId', authStore.user._id)
      selectedFiles.value.forEach((file) => form.append('files', file))
      submissionData = form
    } else {
      submissionData = {
        ...formData.value,
        description,
        userId: authStore.user?._id,
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
    subcategory: '',
    priority: 'medium',
  }
  selectedFiles.value = []
  submitted.value = false
  resetDeflection()
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
.animate-fade-in { animation: fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-slide-in { animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

.expand-enter-active, .expand-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
.expand-enter-to, .expand-leave-from {
  opacity: 1;
  max-height: 1200px;
  transform: translateY(0);
}
</style>
