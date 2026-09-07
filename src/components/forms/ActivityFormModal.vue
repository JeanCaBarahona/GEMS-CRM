<template>
  <div class="fixed -inset-1 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300" @click="closeOnOutsideClick">
    <div
      class="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200/60 w-full max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
      :class="isEditingTask ? 'max-w-6xl' : 'max-w-3xl'"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/30">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-primary-50 rounded-[1rem] flex items-center justify-center border border-primary-100 shadow-sm transition-transform hover:rotate-3">
            <i :class="isEditing ? 'fas fa-pen-nib text-primary-500' : 'fas fa-rocket text-primary-500'" class="text-xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">
              {{ isEditing ? 'Refinar Tarea' : 'Lanzar Nueva Tarea' }}
            </h2>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
              Gestión de Productividad Customer Touch
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
        >
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="flex flex-1 overflow-hidden">
      <!-- ── Formulario ── -->
      <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <form @submit.prevent="handleSubmit" class="flex flex-col h-full">
          <div class="space-y-6 flex-1">
            
            <!-- Título -->
            <div class="space-y-2">
              <div class="flex items-center justify-between ml-1">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Título de la Actividad</label>
                <VoiceDictateButton v-model="form.title" size="xs" />
              </div>
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all text-sm font-bold shadow-sm placeholder-slate-300"
                placeholder="Ej: Implementar pasarela de pagos..."
              />
            </div>

            <!-- Fila 1: Tipo, Prioridad, Fechas -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="space-y-2">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                <CustomSelect
                  v-model="form.type"
                  :options="[
                    { value: 'task', label: 'Tarea Estándar' },
                    { value: 'bug', label: 'Bug / Error' },
                    { value: 'feature', label: 'Mejora / Feature' },
                    { value: 'user-story', label: 'Historia de Usuario' }
                  ]"
                />
              </div>
              <div class="space-y-2">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Prioridad</label>
                <CustomSelect
                  v-model="form.priority"
                  :options="[
                    { value: 'low', label: 'Baja (Mantenimiento)' },
                    { value: 'medium', label: 'Media (Normal)' },
                    { value: 'high', label: 'Alta (Importante)' },
                    { value: 'urgent', label: 'Crítica (Urgente)' }
                  ]"
                />
              </div>
              <div class="space-y-2">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Inicio</label>
                <div class="relative group">
                  <i class="fas fa-calendar-alt absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-400 transition-colors"></i>
                  <input
                    v-model="form.date"
                    type="datetime-local"
                    class="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all text-xs font-bold shadow-sm"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Entrega</label>
                <div class="relative group">
                  <i class="fas fa-flag-checkered absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-400 transition-colors"></i>
                  <input
                    v-model="form.dueDate"
                    type="datetime-local"
                    class="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all text-xs font-bold shadow-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Fila 2: Cliente/Equipo y Detalles -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <!-- Columna Izquierda -->
              <div class="space-y-4 flex flex-col h-full">
                <div class="space-y-2">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente / Proyecto</label>
                  <CustomSelect
                    v-model="form.clientId"
                    searchable
                    :options="[
                      { value: '', label: 'Interno' },
                      ...(clients || []).map(client => ({ value: client._id, label: client.name }))
                    ]"
                  />
                </div>
                <div class="space-y-2">
                  <ProjectSelect
                    v-model="form.projectId"
                    :client-id="form.clientId || null"
                    auto-select-default
                  />
                </div>
                <!-- Se estira para llenar el alto de la columna derecha (Detalles + Tiempo) -->
                <!-- y evitar el hueco vacío que quedaba antes debajo de Proyecto. -->
                <div class="space-y-2 flex-1 flex flex-col min-h-0 max-h-[280px]">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Equipo Responsable</label>
                  <div class="bg-slate-50/50 border border-slate-200 rounded-2xl p-2.5 shadow-inner flex-1 flex flex-col overflow-hidden min-h-0">
                    <AssignedUsersSelector
                      v-model="form.assignedTo"
                      :teamMembers="teamMembers"
                    />
                  </div>
                </div>
              </div>

              <!-- Columna Derecha: Descripción y Tiempo -->
              <div class="space-y-4">
                <div class="space-y-2">
                  <div class="flex items-center justify-between ml-1">
                    <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Detalles y Notas</label>
                    <VoiceDictateButton v-model="form.description" size="xs" />
                  </div>
                  <textarea
                    v-model="form.description"
                    rows="5"
                    class="w-full px-5 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all resize-none text-sm font-medium leading-relaxed shadow-sm custom-scrollbar"
                    placeholder="Describe los pasos, criterios de aceptación o contexto..."
                  ></textarea>
                </div>

                <!-- Tiempo Estimado y Progreso -->
                <div class="space-y-5 shrink-0">
                  <div class="space-y-2">
                    <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                    <span>Tiempo Estimado</span>
                    <button type="button" @click="form.estimatedTime = ''" class="text-primary-500 hover:text-primary-600">Limpiar</button>
                  </label>
                  <div class="grid grid-cols-4 gap-2">
                    <button
                      v-for="time in [
                        { val: '15m', label: '15m' },
                        { val: '30m', label: '30m' },
                        { val: '1h', label: '1h' },
                        { val: '2h', label: '2h' },
                        { val: '4h', label: '4h' },
                        { val: '8h', label: '8h' }
                      ]"
                      :key="time.val"
                      type="button"
                      @click="form.estimatedTime = time.val"
                      class="px-1 py-2 rounded-xl text-[11px] font-black tracking-wider uppercase transition-all border shadow-sm flex items-center justify-center gap-1"
                      :class="form.estimatedTime === time.val 
                        ? 'bg-primary-500 text-white border-primary-600 ring-2 ring-primary-500/20 shadow-primary-500/20' 
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'"
                    >
                      <i class="fas fa-clock opacity-70 hidden sm:inline-block"></i>
                      {{ time.label }}
                    </button>
                    
                    <div class="col-span-2 relative group">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-pen text-[10px] text-slate-400 group-focus-within:text-primary-500 transition-colors"></i>
                      </div>
                      <input 
                        v-model="form.estimatedTime"
                        type="text"
                        placeholder="Ej: 3.5h"
                        class="w-full h-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-[11px] font-black focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm placeholder-slate-300"
                      />
                    </div>
                    </div>
                  </div>

                  <!-- Progreso -->
                  <div class="mt-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest w-12 text-right">{{ form.completionPercentage || 0 }}%</span>
                    <input 
                      type="range" 
                      v-model.number="form.completionPercentage" 
                      min="0" max="100" step="5"
                      class="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end pt-6 border-t border-slate-100 mt-6">
            
            <div class="flex items-center gap-4">
              <button
                type="button"
                @click="$emit('close')"
                class="px-8 py-4 bg-white text-slate-500 hover:text-slate-800 border border-slate-200 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 active:scale-95 shadow-sm"
              >
                Descartar
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-12 py-5 bg-primary-500 text-white rounded-[1.5rem] hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-primary-200 flex items-center justify-center gap-4 active:scale-95 group"
              >
                <div v-if="loading" class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-paper-plane'" class="group-hover:translate-x-1 transition-transform"></i>
                {{ loading ? 'Sincronizando...' : (isEditing ? 'Guardar Cambios' : 'Lanzar Tarea') }}
              </button>
            </div>
          </div>
        </form>
      </div>
      <!-- ── Fin formulario ── -->

      <!-- ── Columna de Comentarios (solo al editar una tarea) ── -->
      <div
        v-if="isEditingTask"
        class="w-80 shrink-0 border-l border-slate-100 flex flex-col bg-slate-50/40"
      >
        <!-- Header comentarios -->
        <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-2 shrink-0">
          <div class="w-7 h-7 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100">
            <i class="fas fa-comments text-primary-400 text-xs"></i>
          </div>
          <span class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Comentarios</span>
          <span
            v-if="localComments.length > 0"
            class="ml-auto px-2 py-0.5 bg-primary-100 text-primary-600 text-[10px] font-black rounded-full"
          >{{ localComments.length }}</span>
        </div>

        <!-- Lista de comentarios (scrollable) -->
        <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
          <!-- Empty state -->
          <div v-if="localComments.length === 0 && !loadingComments" class="flex flex-col items-center justify-center py-10 text-center">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <i class="fas fa-comment-slash text-slate-300 text-lg"></i>
            </div>
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sin comentarios</p>
            <p class="text-[10px] text-slate-300 mt-1">Sé el primero en comentar</p>
          </div>

          <!-- Comentarios (instantáneo desde props.activity) -->
          <div
            v-for="comment in localComments"
            :key="comment._id"
            class="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 group"
          >
            <div class="flex items-center gap-2 mb-1.5">
              <div class="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-[9px] font-black shrink-0">
                {{ getInitials(commentAuthorName(comment)) }}
              </div>
              <span class="text-[11px] font-black text-slate-700 truncate">{{ commentAuthorName(comment) }}</span>
              <span class="text-[10px] text-slate-300 ml-auto shrink-0">{{ formatCommentDate(comment.createdAt) }}</span>

              <!-- Botones edit/delete (solo autor) -->
              <div v-if="canEditComment(comment)" class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                <button
                  type="button"
                  @click="startEditComment(comment)"
                  class="w-5 h-5 rounded-md text-slate-400 hover:text-primary-500 hover:bg-primary-50 flex items-center justify-center transition-all"
                  title="Editar"
                >
                  <i class="fas fa-pen text-[9px]"></i>
                </button>
                <button
                  type="button"
                  @click="deleteComment(comment)"
                  class="w-5 h-5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all"
                  title="Eliminar"
                >
                  <i class="fas fa-trash text-[9px]"></i>
                </button>
              </div>
            </div>

            <!-- Modo edición -->
            <div v-if="editingCommentId === comment._id" class="ml-8">
              <textarea
                v-model="editingCommentText"
                rows="2"
                class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none transition-all"
              />
              <div class="flex items-center gap-2 mt-1.5">
                <button
                  type="button"
                  @click="saveEditComment(comment)"
                  :disabled="!editingCommentText.trim() || savingEdit"
                  class="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all disabled:opacity-40"
                >Guardar</button>
                <button
                  type="button"
                  @click="cancelEditComment"
                  class="px-3 py-1 bg-slate-100 text-slate-500 hover:bg-slate-200 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all"
                >Cancelar</button>
              </div>
            </div>

            <!-- Texto con menciones resaltadas -->
            <p
              v-else-if="comment.text"
              class="text-[12px] text-slate-600 leading-relaxed ml-8 whitespace-pre-wrap break-words"
              v-html="renderMentions(comment.text)"
            ></p>

            <!-- Imágenes del comentario -->
            <div v-if="comment.images && comment.images.length > 0" class="mt-2 ml-8 flex flex-wrap gap-1.5">
              <img
                v-for="(img, idx) in comment.images"
                :key="idx"
                :src="img.url"
                class="w-16 h-16 object-cover rounded-xl cursor-pointer border border-slate-100 hover:opacity-80 transition-opacity"
                @click="previewUrl = img.url"
              />
            </div>
          </div>
        </div>

        <!-- Input nuevo comentario (fijo al fondo) -->
        <div class="px-4 py-3 border-t border-slate-100 bg-white shrink-0 relative">
          <!-- Dropdown de menciones @ -->
          <div
            v-if="mentionOpen && mentionMatches.length > 0"
            class="absolute bottom-full left-4 right-4 mb-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-44 overflow-y-auto z-30"
          >
            <button
              v-for="(member, idx) in mentionMatches"
              :key="member._id || member.id || idx"
              type="button"
              @mousedown.prevent="selectMention(member)"
              class="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary-50 transition-colors text-left"
              :class="idx === mentionActiveIdx ? 'bg-primary-50' : ''"
            >
              <div class="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-[9px] font-black shrink-0">
                {{ getInitials(member.name) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[11px] font-bold text-slate-700 truncate">{{ member.name }}</p>
                <p v-if="member.email" class="text-[9px] text-slate-400 truncate">{{ member.email }}</p>
              </div>
            </button>
          </div>

          <!-- Previews de imágenes a enviar -->
          <div v-if="commentImagePreviews.length > 0" class="flex flex-wrap gap-1.5 mb-2">
            <div v-for="(src, idx) in commentImagePreviews" :key="idx" class="relative group">
              <img :src="src" class="w-12 h-12 object-cover rounded-xl border border-slate-200" />
              <button
                type="button"
                @click="removeCommentImage(idx)"
                class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >×</button>
            </div>
          </div>

          <textarea
            ref="commentTextarea"
            v-model="newCommentText"
            placeholder="Escribe un comentario... usa @ para mencionar"
            rows="2"
            @input="onCommentInput"
            @keydown="onCommentKeydown"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-300 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none transition-all"
          />
          <div class="flex items-center justify-between mt-2">
            <label class="cursor-pointer flex items-center gap-1.5 text-slate-400 hover:text-primary-500 transition-colors">
              <i class="fas fa-image text-sm"></i>
              <span class="text-[10px] font-black uppercase tracking-wider">Imagen</span>
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
              type="button"
              @click="submitComment"
              :disabled="(!newCommentText.trim() && commentImages.length === 0) || submittingComment"
              class="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 shadow-sm shadow-primary-200"
            >
              <div v-if="submittingComment" class="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
              <i v-else class="fas fa-paper-plane text-[10px]"></i>
              {{ submittingComment ? '...' : 'Enviar' }}
            </button>
          </div>
        </div>
      </div>
      <!-- ── Fin columna comentarios ── -->

      </div><!-- flex row -->
    </div>
  </div>

  <!-- Lightbox imágenes -->
  <Teleport to="body">
    <div
      v-if="previewUrl"
      class="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 cursor-zoom-out"
      @click="previewUrl = null"
    >
      <img :src="previewUrl" class="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl" @click.stop />
      <button class="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white text-xl flex items-center justify-center transition-colors" @click="previewUrl = null">×</button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import axios from 'axios'
import { API_CONFIG } from '../../config/api'
import AssignedUsersSelector from '../AssignedUsersSelector.vue'
import CustomSelect from '../ui/CustomSelect.vue'
import ProjectSelect from './ProjectSelect.vue'
import VoiceDictateButton from '@/components/ui/VoiceDictateButton.vue'
import { activityService } from '../../services/activityService'
import { useBoardsStore } from '../../stores/boards'
import { useTasksStore } from '../../stores/tasks'
import { useAuthStore } from '../../stores/auth'
import { useNotifications } from '../../composables/useNotifications'
import type { TeamMember, Client } from '../../types'

console.log('ActivityFormModal script setup initialized')

const boardsStore = useBoardsStore()
const tasksStore = useTasksStore()
const authStore = useAuthStore()
const { showSuccess, showError, confirmDelete } = useNotifications()

interface Props {
  activity?: any | null
  clients: Client[]
  teamMembers: TeamMember[]
  initialBoardStatus?: string
  boardId?: string
  sprints?: any[]
  // Preseleccionan cliente/proyecto solo al crear (props.activity === null) —
  // para abrir el modal ya "anclado" a un proyecto, ej. desde su página de detalle.
  initialClientId?: string
  initialProjectId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  activity: null,
  clients: () => [],
  teamMembers: () => [],
  initialBoardStatus: 'backlog',
  initialClientId: '',
  initialProjectId: null
})

const emit = defineEmits<{
  close: []
  saved: [activity: any]
}>()

const loading = ref(false)

const isEditing = computed(() => !!props.activity)

const form = reactive({
  title: '',
  description: '',
  clientId: '',
  projectId: null as string | null,
  assignedTo: [] as string[],
  priority: 'medium',
  status: 'pending',
  type: 'task',
  date: '',
  dueDate: '',
  estimatedTime: '',
  completionPercentage: 0
})

const populateForm = () => {
  try {
    console.log('Populating ActivityFormModal with:', props.activity)
    if (props.activity) {
      form.title = props.activity.title || ''
      form.description = props.activity.description || ''
      
      // Soporte para ambos: clientId (Activity) o client (Task)
      form.clientId = props.activity.clientId?._id || props.activity.clientId || 
                      props.activity.client?._id || props.activity.client || ''
      form.projectId = props.activity.projectId?._id || props.activity.projectId || null
      
      // Soporte para asignación múltiple (Activity) o única (Task)
      if (props.activity.assignedTo) {
        if (Array.isArray(props.activity.assignedTo)) {
          form.assignedTo = props.activity.assignedTo.map((u: any) => typeof u === 'object' ? (u?._id || '') : u).filter(Boolean)
        } else {
          // Es un objeto único (Task)
          const userId = typeof props.activity.assignedTo === 'object' ? props.activity.assignedTo?._id : props.activity.assignedTo
          form.assignedTo = userId ? [userId] : []
        }
      } else {
        form.assignedTo = []
      }

      form.priority = props.activity.priority || 'medium'
      form.status = props.activity.status || 'pending'
      form.type = props.activity.type || 'task'
      
      // Soporte para estimatedHours (Task) o estimatedTime (Activity)
      form.estimatedTime = props.activity.estimatedTime || (props.activity.estimatedHours ? `${props.activity.estimatedHours}h` : '')
      
      form.completionPercentage = props.activity.completionPercentage || 0
      
      const defaultDate = new Date().toISOString().slice(0, 16)
      form.date = props.activity.date ? formatDateTimeLocal(props.activity.date) : (props.activity.createdAt ? formatDateTimeLocal(props.activity.createdAt) : defaultDate)
      form.dueDate = props.activity.dueDate ? formatDateTimeLocal(props.activity.dueDate) : ''
    } else {
      // Valores por defecto para nueva tarea
      form.title = ''
      form.description = ''
      form.clientId = props.initialClientId || ''
      form.projectId = props.initialProjectId || null
      form.assignedTo = []
      form.priority = 'medium'
      form.status = 'pending'
      form.type = 'task'
      form.estimatedTime = ''
      form.completionPercentage = 0
      form.date = new Date().toISOString().slice(0, 16)
      form.dueDate = ''
    }
  } catch (err) {
    console.error('Error in populateForm:', err)
  }
}

const formatDateTimeLocal = (dateString: any) => {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 16)
  } catch (e) {
    return ''
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const isTask = !!props.boardId || !!props.activity?.boardId || !!props.activity?.boardStatus
    
    const taskData: any = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: form.status,
      type: form.type,
      completionPercentage: form.completionPercentage,
      dueDate: form.dueDate || undefined
    }

    // Campos específicos según el modelo
    if (isTask) {
      taskData.boardId = props.boardId || props.activity?.boardId
      taskData.boardStatus = props.initialBoardStatus || props.activity?.boardStatus
      // En Task, assignedTo es usualmente el primer elemento o manejado diferente en el backend
      taskData.assignedTo = form.assignedTo[0] || null
      taskData.clientId = form.clientId || undefined
      taskData.projectId = form.projectId || null
      // Convertir estimatedTime (1.5h) a estimatedHours (1.5)
      const hours = parseFloat(form.estimatedTime.replace('h', ''))
      if (!isNaN(hours)) taskData.estimatedHours = hours
    } else {
      taskData.clientId = form.clientId || undefined
      taskData.projectId = form.projectId || null
      taskData.assignedTo = form.assignedTo
      taskData.estimatedTime = form.estimatedTime
      taskData.date = form.date
    }

    let savedData: any
    
    if (isEditing.value && props.activity?._id) {
      if (isTask) {
        savedData = await tasksStore.updateTask(props.activity._id, taskData)
      } else {
        savedData = await activityService.update(props.activity._id, taskData)
      }
      showSuccess(isTask ? 'Tarea actualizada' : 'Actividad actualizada')
    } else {
      if (isTask) {
        savedData = await tasksStore.createTask(taskData)
      } else {
        savedData = await activityService.create(taskData)
      }
      showSuccess(isTask ? 'Tarea creada con éxito' : 'Actividad creada con éxito')
    }
    
    emit('saved', savedData)
    emit('close')
  } catch (error) {
    showError('Error al sincronizar la información')
    console.error('Submit Error:', error)
  } finally {
    loading.value = false
  }
}

const closeOnOutsideClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

// ── Comentarios ────────────────────────────────────────────────────────────────

// Decidir si la entidad es una Task (board) o una Activity para elegir el endpoint correcto.
const isBoardTask = computed(() => {
  const a: any = props.activity
  return !!(a?.boardId || a?.boardStatus || props.boardId)
})

const commentEntityId = computed<string | null>(() => {
  const a: any = props.activity
  if (!a?._id) return null
  // Si es una task de board → usa ese _id contra /api/tasks
  // Si es una activity → usa ese _id contra /api/activities
  return a._id
})

// Mostrar columna de comentarios siempre que se esté editando algo con id
const isEditingTask = computed(() => isEditing.value && !!commentEntityId.value)

const localTask = ref<any>(props.activity)
const loadingComments = ref(false)

const localComments = computed(() => localTask.value?.comments || [])

const newCommentText = ref('')
const commentImages = ref<File[]>([])
const commentImagePreviews = ref<string[]>([])
const submittingComment = ref(false)
const commentImageInput = ref<HTMLInputElement>()
const previewUrl = ref<string | null>(null)

function handleCommentImageSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  for (const file of Array.from(input.files)) {
    if (!file.type.startsWith('image/')) continue
    commentImages.value.push(file)
    const reader = new FileReader()
    reader.onload = (ev) => commentImagePreviews.value.push(ev.target?.result as string)
    reader.readAsDataURL(file)
  }
  input.value = ''
}

// ── Menciones @ ───────────────────────────────────────────────────────────────
const commentTextarea = ref<HTMLTextAreaElement>()
const mentionOpen = ref(false)
const mentionQuery = ref('')
const mentionStart = ref(-1) // posición del @
const mentionActiveIdx = ref(0)

const mentionMatches = computed(() => {
  if (!mentionOpen.value) return []
  const q = mentionQuery.value.toLowerCase()
  return (props.teamMembers || [])
    .filter((m: any) => !q || (m.name || '').toLowerCase().includes(q))
    .slice(0, 6)
})

function onCommentInput(e: Event) {
  const ta = e.target as HTMLTextAreaElement
  const pos = ta.selectionStart
  const text = ta.value.substring(0, pos)
  // Buscar el último @ — acepta letras con tildes/ñ, números, guión bajo
  const match = text.match(/(?:^|\s)@([\p{L}\p{N}_]*)$/u)
  if (match) {
    mentionStart.value = pos - match[1].length - 1 // posición del @
    mentionQuery.value = match[1]
    mentionOpen.value = true
    mentionActiveIdx.value = 0
  } else {
    mentionOpen.value = false
    mentionQuery.value = ''
    mentionStart.value = -1
  }
}

function onCommentKeydown(e: KeyboardEvent) {
  if (!mentionOpen.value) return
  const matches = mentionMatches.value
  if (matches.length === 0) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    mentionActiveIdx.value = (mentionActiveIdx.value + 1) % matches.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    mentionActiveIdx.value = (mentionActiveIdx.value - 1 + matches.length) % matches.length
  } else if (e.key === 'Enter' || e.key === 'Tab') {
    e.preventDefault()
    selectMention(matches[mentionActiveIdx.value])
  } else if (e.key === 'Escape') {
    mentionOpen.value = false
  }
}

function selectMention(member: any) {
  if (mentionStart.value < 0) return
  const before = newCommentText.value.substring(0, mentionStart.value)
  const afterStart = mentionStart.value + 1 + mentionQuery.value.length
  const after = newCommentText.value.substring(afterStart)
  const insert = `@${(member.name || '').replace(/\s+/g, '')} `
  newCommentText.value = before + insert + after
  mentionOpen.value = false
  mentionQuery.value = ''
  mentionStart.value = -1
  nextTick(() => {
    const ta = commentTextarea.value
    if (ta) {
      const newPos = before.length + insert.length
      ta.focus()
      ta.setSelectionRange(newPos, newPos)
    }
  })
}

function renderMentions(text: string): string {
  // escapar HTML básico
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // Enlaces clicables — antes de menciones para no interferir con el regex de @nombre.
  const withLinks = escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary-600 underline break-all hover:text-primary-700">$1</a>'
  )
  // Resaltar menciones @nombre (acepta tildes/ñ)
  return withLinks.replace(/@([\p{L}\p{N}_]+)/gu, '<span class="text-primary-500 font-bold bg-primary-50 px-1 rounded">@$1</span>')
}

// ── Editar / eliminar comentarios ─────────────────────────────────────────────
const editingCommentId = ref<string | null>(null)
const editingCommentText = ref('')
const savingEdit = ref(false)

function canEditComment(comment: any): boolean {
  const uid = authStore.user?._id
  if (!uid) return false
  const authorId = comment?.userId?._id || comment?.userId || comment?.author?._id
  return String(authorId) === String(uid)
}

function startEditComment(comment: any) {
  editingCommentId.value = comment._id
  editingCommentText.value = comment.text || ''
}

function cancelEditComment() {
  editingCommentId.value = null
  editingCommentText.value = ''
}

async function saveEditComment(comment: any) {
  if (!editingCommentText.value.trim() || !commentEntityId.value) return
  savingEdit.value = true
  try {
    const base = API_CONFIG.BASE_URL.replace('/api', '')
    const path = isBoardTask.value
      ? `${base}/api/tasks/${commentEntityId.value}/comments/${comment._id}`
      : `${base}/api/activities/${commentEntityId.value}/comments/${comment._id}`
    const token = localStorage.getItem('token')
    const { data } = await axios.put(path, { text: editingCommentText.value }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    localTask.value = data
    cancelEditComment()
  } catch (e) {
    showError('No se pudo editar el comentario')
  } finally {
    savingEdit.value = false
  }
}

async function deleteComment(comment: any) {
  if (!commentEntityId.value) return
  const snippet = (comment.text || 'Comentario sin texto').slice(0, 60)
  const result = await confirmDelete(snippet)
  if (!result.isConfirmed) return
  try {
    const base = API_CONFIG.BASE_URL.replace('/api', '')
    const path = isBoardTask.value
      ? `${base}/api/tasks/${commentEntityId.value}/comments/${comment._id}`
      : `${base}/api/activities/${commentEntityId.value}/comments/${comment._id}`
    const token = localStorage.getItem('token')
    const { data } = await axios.delete(path, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    localTask.value = data
    showSuccess('Comentario eliminado')
  } catch (e) {
    showError('No se pudo eliminar el comentario')
  }
}

function removeCommentImage(idx: number) {
  commentImages.value.splice(idx, 1)
  commentImagePreviews.value.splice(idx, 1)
}

async function submitComment() {
  if (!commentEntityId.value) return
  if (!newCommentText.value.trim() && commentImages.value.length === 0) return
  submittingComment.value = true
  try {
    const imgs = commentImages.value.length > 0 ? commentImages.value : undefined
    const updated = isBoardTask.value
      ? await tasksStore.addComment(commentEntityId.value, newCommentText.value, imgs)
      : await activityService.addComment(commentEntityId.value, newCommentText.value, imgs)
    localTask.value = updated
    newCommentText.value = ''
    commentImages.value = []
    commentImagePreviews.value = []
  } catch (e) {
    showError('Error al enviar el comentario')
  } finally {
    submittingComment.value = false
  }
}

function getInitials(name: string): string {
  return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

function commentAuthorName(comment: any): string {
  return comment?.userId?.name || comment?.author?.name || comment?.userName || 'Usuario'
}

function formatCommentDate(date: Date | string): string {
  try {
    return format(new Date(date), "d MMM, HH:mm", { locale: es })
  } catch {
    return ''
  }
}

async function loadFullTask() {
  if (!isEditingTask.value || !commentEntityId.value) return
  loadingComments.value = true
  try {
    const full = isBoardTask.value
      ? await tasksStore.fetchTaskById(commentEntityId.value)
      : await activityService.getById(commentEntityId.value)
    localTask.value = full
  } catch (e) {
    console.warn('No se pudieron cargar comentarios:', e)
  } finally {
    loadingComments.value = false
  }
}

// ──────────────────────────────────────────────────────────────────────────────

watch(() => props.activity, (val) => {
  localTask.value = val
  populateForm()
}, { deep: true })

onMounted(() => {
  populateForm()
  loadFullTask()
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
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoom-in-95 {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
}

@keyframes slide-in-from-top-2 {
  from { transform: translateY(-0.5rem); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-in {
  animation-fill-mode: forwards;
}
.fade-in {
  animation-name: fade-in;
}
.zoom-in-95 {
  animation-name: zoom-in-95;
}
.slide-in-from-top-2 {
  animation-name: slide-in-from-top-2;
}

/* Ocultar flecha nativa en IE/Edge */
select::-ms-expand {
  display: none;
}

/* Personalización básica para inputs de fecha */
input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  filter: invert(0.5);
  transition: opacity 0.2s;
}
input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
</style>
