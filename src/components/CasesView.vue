<template>
  <div class="min-h-screen bg-[#F8FAFC] p-8 font-['Inter',sans-serif]">
    
    <!-- Top Bar: Actions & Global Search -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Centro de Casos</h1>
        <p class="text-sm text-slate-500 font-medium">Gestión crítica, documentación wiki y seguimiento diario.</p>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="relative group">
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors"></i>
          <input 
            v-model="searchTerm"
            placeholder="Buscar casos o documentación..."
            class="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all w-64 md:w-80 shadow-sm"
          />
        </div>
        <button 
          @click="showCreateModal = true"
          class="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-violet-200 transition-all active:scale-95 flex items-center gap-2"
        >
          <i class="fas fa-plus"></i>
          Nuevo Caso
        </button>
      </div>
    </div>

    <!-- Main Grid Layout -->
    <div class="grid grid-cols-12 gap-8">
      
      <!-- Left Column: Case List & Critical Tracking -->
      <div class="col-span-12 lg:col-span-4 space-y-6">
        <div class="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-[750px]">
          <div class="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h2 class="text-xs font-black text-slate-400 uppercase tracking-widest">Cola de Casos Activos</h2>
            <div class="flex items-center gap-2">
               <span class="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-md text-[10px] font-black">{{ filteredCases.length }}</span>
            </div>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <div 
              v-for="caseItem in filteredCases" 
              :key="caseItem._id"
              @click="selectedCase = caseItem"
              :class="selectedCase?._id === caseItem._id ? 'bg-violet-50 border-violet-200 ring-2 ring-violet-500/5' : 'bg-white border-slate-100 hover:border-violet-200 hover:shadow-md'"
              class="group p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden"
            >
              <!-- Priority Indicator -->
              <div 
                class="absolute left-0 top-0 bottom-0 w-1.5"
                :class="getPriorityColor(caseItem.prioridad)"
              ></div>
              
              <div class="flex items-start justify-between mb-3">
                <span class="text-[9px] font-black uppercase tracking-widest" :class="getTypeColor(caseItem.tipo)">
                  {{ caseItem.tipo }}
                </span>
                <span class="text-[9px] font-bold text-slate-400">{{ formatDateRelative(caseItem.updatedAt) }}</span>
              </div>
              
              <h3 class="text-sm font-black text-slate-800 leading-tight mb-2 group-hover:text-violet-600 transition-colors">
                {{ caseItem.titulo }}
              </h3>
              
              <div class="flex items-center justify-between mt-4">
                <div class="flex -space-x-2">
                  <div class="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                    {{ caseItem.asignado_a || '?' }}
                  </div>
                </div>
                
                <div class="flex items-center gap-3">
                  <div v-if="caseItem.archivos?.length" class="flex items-center gap-1 text-slate-400">
                    <i class="fas fa-paperclip text-[10px]"></i>
                    <span class="text-[10px] font-bold">{{ caseItem.archivos.length }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full" :class="getStatusDot(caseItem.estado)"></div>
                    <span class="text-[9px] font-black text-slate-400 uppercase">{{ caseItem.estado }}</span>
                  </div>
                </div>
              </div>

              <!-- Mini Progress Bar for critical -->
              <div v-if="caseItem.progreso > 0" class="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-violet-500 rounded-full transition-all" :style="{ width: `${caseItem.progreso}%` }"></div>
              </div>
            </div>
            
            <div v-if="!filteredCases.length" class="flex flex-col items-center justify-center py-20 opacity-20">
               <i class="fas fa-box-open text-4xl mb-4"></i>
               <p class="text-xs font-black uppercase tracking-widest text-center">No se encontraron casos</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Case View (Wiki + Daily Logs) -->
      <div class="col-span-12 lg:col-span-8 flex flex-col gap-6 h-[750px]">
        <div v-if="selectedCase" class="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col flex-1 overflow-hidden animate-fade-in relative">
          
          <!-- View Header -->
          <div class="p-8 border-b border-slate-50 bg-white sticky top-0 z-10">
            <div class="flex items-start justify-between mb-6">
              <div class="space-y-2">
                <div class="flex items-center gap-3">
                  <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-slate-200">
                    {{ selectedCase.categoria || 'Sin Categoría' }}
                  </span>
                  <span :class="getPriorityClass(selectedCase.prioridad)" class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                    Prioridad {{ selectedCase.prioridad }}
                  </span>
                </div>
                <h2 class="text-2xl font-black text-slate-900 tracking-tight">{{ selectedCase.titulo }}</h2>
              </div>
              
              <div class="flex items-center gap-3">
                 <button class="w-10 h-10 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center text-slate-400">
                   <i class="fas fa-edit"></i>
                 </button>
                 <button class="w-10 h-10 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all flex items-center justify-center text-slate-400">
                   <i class="fas fa-trash"></i>
                 </button>
              </div>
            </div>

            <!-- Tabs Navigation -->
            <div class="flex items-center gap-8">
               <button 
                @click="activeViewTab = 'wiki'"
                :class="activeViewTab === 'wiki' ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'"
                class="relative pb-4 text-xs font-black uppercase tracking-widest transition-all"
               >
                 Wiki y Metodología
                 <div v-if="activeViewTab === 'wiki'" class="absolute bottom-0 left-0 right-0 h-1 bg-violet-600 rounded-full animate-scale-x"></div>
               </button>
               <button 
                @click="activeViewTab = 'dailies'"
                :class="activeViewTab === 'dailies' ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'"
                class="relative pb-4 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
               >
                 Seguimiento Diario
                 <span v-if="selectedCase.dailyLogs?.length" class="w-4 h-4 bg-violet-100 text-violet-700 rounded-md text-[8px] flex items-center justify-center">{{ selectedCase.dailyLogs.length }}</span>
                 <div v-if="activeViewTab === 'dailies'" class="absolute bottom-0 left-0 right-0 h-1 bg-violet-600 rounded-full animate-scale-x"></div>
               </button>
               <button 
                @click="activeViewTab = 'files'"
                :class="activeViewTab === 'files' ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'"
                class="relative pb-4 text-xs font-black uppercase tracking-widest transition-all"
               >
                 Documentos
                 <div v-if="activeViewTab === 'files'" class="absolute bottom-0 left-0 right-0 h-1 bg-violet-600 rounded-full animate-scale-x"></div>
               </button>
            </div>
          </div>

          <!-- View Content -->
          <div class="flex-1 overflow-y-auto p-10 custom-scrollbar">
             
             <!-- Tab: WIKI -->
             <div v-if="activeViewTab === 'wiki'" class="animate-content-in space-y-10">
                <section>
                  <div class="flex items-center gap-3 mb-4">
                    <i class="fas fa-book-open text-violet-500"></i>
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Documentación del Caso</h3>
                  </div>
                  <div class="bg-slate-50/50 border border-slate-100 rounded-[1.5rem] p-8">
                     <div v-if="selectedCase.wikiContent" class="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed" v-html="selectedCase.wikiContent"></div>
                     <div v-else class="flex flex-col items-center justify-center py-10 opacity-30 italic text-slate-400 text-sm">
                        <i class="fas fa-feather-alt text-3xl mb-4"></i>
                        No hay contenido wiki documentado para este caso.
                        <button @click="isEditingWiki = true" class="mt-4 text-violet-600 font-black uppercase text-[10px] hover:underline">Comenzar a documentar</button>
                     </div>
                  </div>
                </section>

                <section>
                  <div class="flex items-center gap-3 mb-4">
                    <i class="fas fa-cogs text-violet-500"></i>
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Metodología de Resolución</h3>
                  </div>
                  <div class="bg-indigo-50/30 border border-indigo-100 rounded-[1.5rem] p-8">
                     <p class="text-sm text-slate-600 leading-relaxed italic">
                        {{ selectedCase.metodologia || 'Procedimiento estándar en fase de definición.' }}
                     </p>
                  </div>
                </section>
             </div>

             <!-- Tab: DAILIES -->
             <div v-if="activeViewTab === 'dailies'" class="animate-content-in space-y-8">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <i class="fas fa-calendar-day text-violet-500"></i>
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Bitácora de Seguimiento Diario</h3>
                  </div>
                  <button 
                    @click="showAddDailyLog = true"
                    class="px-4 py-2 bg-slate-900 text-[10px] font-bold text-white rounded-xl uppercase tracking-widest hover:bg-violet-600 transition-colors shadow-lg shadow-slate-200"
                  >
                    Nueva Entrada
                  </button>
                </div>

                <!-- Daily Logs Timeline -->
                <div class="space-y-6 relative pl-8 border-l border-slate-100">
                   <div 
                    v-for="(log, idx) in selectedCase.dailyLogs" 
                    :key="idx" 
                    class="relative"
                   >
                     <!-- Timeline Dot -->
                     <div class="absolute -left-[37px] top-1 w-4 h-4 rounded-full border-4 border-[#F8FAFC] flex items-center justify-center" :class="idx === 0 ? 'bg-violet-600 ring-4 ring-violet-500/20' : 'bg-slate-300'"></div>
                     
                     <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex items-center justify-between mb-4">
                           <div class="flex items-center gap-3">
                              <span class="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{{ formatDate(log.fecha) }}</span>
                              <span class="text-xs">{{ log.sentimiento }}</span>
                           </div>
                           <span class="text-[9px] font-bold text-slate-400 uppercase">Autor: {{ log.autor?.name || 'Sistema' }}</span>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div>
                              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Actividad</p>
                              <p class="text-xs text-slate-600 leading-relaxed">{{ log.que_se_hizo }}</p>
                           </div>
                           <div>
                              <p class="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2">Bloqueos / Impedimentos</p>
                              <p class="text-xs text-slate-600 leading-relaxed">{{ log.bloqueos || 'Ninguno' }}</p>
                           </div>
                           <div>
                              <p class="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-2">Próximos Pasos</p>
                              <p class="text-xs text-slate-600 leading-relaxed">{{ log.siguientes_pasos }}</p>
                           </div>
                        </div>
                     </div>
                   </div>

                   <div v-if="!selectedCase.dailyLogs?.length" class="py-20 text-center text-slate-300 text-xs font-bold italic">
                      No hay registros en la bitácora todavía.
                   </div>
                </div>
             </div>

             <!-- Tab: FILES -->
             <div v-if="activeViewTab === 'files'" class="animate-content-in">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div v-for="file in selectedCase.archivos" :key="file.url" class="group flex flex-col p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-violet-50 hover:border-violet-200 transition-all cursor-pointer">
                      <div class="w-full aspect-square rounded-xl bg-white mb-3 flex items-center justify-center text-slate-400 group-hover:text-violet-500 transition-all shadow-sm overflow-hidden">
                         <img v-if="isImgUrl(file.url)" :src="resolveImageUrl(file.url)" class="w-full h-full object-cover">
                         <i v-else class="fas fa-file-pdf text-3xl"></i>
                      </div>
                      <p class="text-[11px] font-black text-slate-700 truncate mb-1">{{ file.nombre }}</p>
                      <p class="text-[9px] font-bold text-slate-400 uppercase">{{ formatFileSize(file.tamao) }}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <!-- Empty State View -->
        <div v-else class="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex-1 flex flex-col items-center justify-center text-center p-12 opacity-40">
           <div class="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6">
             <i class="fas fa-project-diagram text-4xl"></i>
           </div>
           <h3 class="text-xl font-black text-slate-900 mb-2">Selecciona un Caso</h3>
           <p class="text-sm text-slate-500 max-w-sm">Escoge un caso de la lista de la izquierda para ver su documentación wiki y los seguimientos diarios del equipo.</p>
        </div>
      </div>
    </div>

    <!-- Modals (Simple Implementations) -->
    <div v-if="showCreateModal" class="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
       <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showCreateModal = false"></div>
       <div class="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-scale-up">
          <div>
            <h3 class="text-2xl font-black text-slate-900 tracking-tight">Nuevo Caso Maestro</h3>
            <p class="text-sm text-slate-400 font-medium">Define los parámetros del nuevo caso crítico.</p>
          </div>
          
          <div class="space-y-4">
             <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Título del Caso</label>
                <input v-model="newCase.titulo" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all">
             </div>
             <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tipo</label>
                   <select v-model="newCase.tipo" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none">
                      <option value="seguimiento">Seguimiento</option>
                      <option value="incidencia">Incidencia</option>
                      <option value="documento">Documento / Wiki</option>
                   </select>
                </div>
                <div class="space-y-2">
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Prioridad</label>
                   <select v-model="newCase.prioridad" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none">
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                   </select>
                </div>
             </div>
          </div>

          <div class="flex gap-3">
             <button @click="showCreateModal = false" class="flex-1 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
             <button @click="handleCreateCase" class="flex-1 py-4 bg-violet-600 text-[11px] font-black text-white uppercase tracking-widest rounded-2xl shadow-lg shadow-violet-200 transition-all active:scale-95">Crear Caso</button>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { casesService, type Case } from '../services/casesService'
import { useNotifications } from '../composables/useNotifications'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { API_CONFIG } from '@/config/api'

const { showSuccess, showError, showLoading, closeLoading } = useNotifications()

const cases = ref<Case[]>([])
const selectedCase = ref<Case | null>(null)
const searchTerm = ref('')
const activeViewTab = ref<'wiki' | 'dailies' | 'files'>('wiki')
const showCreateModal = ref(false)
const showAddDailyLog = ref(false)
const isEditingWiki = ref(false)

const newCase = ref({
  titulo: '',
  tipo: 'seguimiento',
  prioridad: 'media',
  descripcion: ''
})

const filteredCases = computed(() => {
  if (!searchTerm.value) return cases.value
  const s = searchTerm.value.toLowerCase()
  return cases.value.filter(c => 
    c.titulo.toLowerCase().includes(s) || 
    c.categoria?.toLowerCase().includes(s)
  )
})

const loadCases = async () => {
  try {
    const data = await casesService.getAll()
    cases.value = data
    if (data.length && !selectedCase.value) {
      selectedCase.value = data[0]
    }
  } catch (err) {
    console.error(err)
  }
}

const handleCreateCase = async () => {
  if (!newCase.value.titulo) return
  showLoading('Abriendo nuevo caso...')
  try {
    const created = await casesService.createCase(newCase.value)
    cases.value.unshift(created)
    selectedCase.value = created
    showCreateModal.value = false
    newCase.value = { titulo: '', tipo: 'seguimiento', prioridad: 'media', descripcion: '' }
    showSuccess('¡Caso Creado!', 'El nuevo caso ha sido registrado correctamente.')
  } catch (err: any) {
    showError('Error', err.message)
  } finally {
    closeLoading()
  }
}

// Helpers
const getPriorityColor = (p: string) => {
  const colors = {
    baja: 'bg-emerald-400',
    media: 'bg-amber-400',
    alta: 'bg-orange-500',
    critica: 'bg-rose-500'
  }
  return colors[p as keyof typeof colors] || 'bg-slate-400'
}

const getPriorityClass = (p: string) => {
  const colors = {
    baja: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    media: 'bg-amber-50 text-amber-600 border border-amber-100',
    alta: 'bg-orange-50 text-orange-600 border border-orange-100',
    critica: 'bg-rose-50 text-rose-600 border border-rose-100'
  }
  return colors[p as keyof typeof colors] || 'bg-slate-50 text-slate-500'
}

const getTypeColor = (t: string) => {
  const colors = {
    seguimiento: 'text-violet-600',
    incidencia: 'text-rose-600',
    documento: 'text-blue-600'
  }
  return colors[t as keyof typeof colors] || 'text-slate-600'
}

const getStatusDot = (s: string) => {
  const colors = {
    abierto: 'bg-emerald-500',
    en_progreso: 'bg-amber-500',
    resuelto: 'bg-slate-300',
    cerrado: 'bg-slate-900'
  }
  return colors[s as keyof typeof colors] || 'bg-slate-300'
}

const formatDateRelative = (date: any) => {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}

const formatDate = (date: any) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 KB'
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + (['B', 'KB', 'MB', 'GB'][i] || 'GB')
}

const isImgUrl = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif)$/.test(url.toLowerCase())
const resolveImageUrl = (url: string) => {
  if (url.startsWith('http')) return url
  const origin = String(API_CONFIG.BASE_URL).replace(/\/?api\/?$/i, '')
  return `${origin.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

onMounted(() => {
  loadCases()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #CBD5E1;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

@keyframes content-in {
  from { opacity: 0; filter: blur(5px); transform: scale(0.98); }
  to { opacity: 1; filter: blur(0); transform: scale(1); }
}
.animate-content-in { animation: content-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

@keyframes scale-x {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
.animate-scale-x { animation: scale-x 0.4s ease-out forwards; transform-origin: left; }

@keyframes scale-up {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>