<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" @click.self="close">
      <div class="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
              <i class="fas fa-camera"></i>
            </div>
            <div>
              <h3 class="text-base font-black text-slate-800 leading-tight">Foto de perfil</h3>
              <p class="text-[11px] text-slate-400 font-medium">{{ src ? 'Arrastra y usa el zoom para encuadrarte' : 'Elige una foto para empezar' }}</p>
            </div>
          </div>
          <button type="button" @click="close" class="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center" title="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="onFileSelect" />

        <!-- Paso 1: elegir foto -->
        <div v-if="!src" class="p-6">
          <label
            class="flex flex-col items-center justify-center gap-3 h-72 rounded-2xl border-2 border-dashed cursor-pointer transition-all"
            :class="dragging ? 'border-primary-400 bg-primary-50/60' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'"
            @dragover.prevent="dragging = true"
            @dragleave.prevent="dragging = false"
            @drop.prevent="onDrop"
            @click.prevent="fileInput?.click()"
          >
            <div class="w-16 h-16 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center">
              <i class="fas fa-image text-2xl"></i>
            </div>
            <span class="text-sm font-black text-slate-700">Arrastra tu foto aquí o haz clic para elegirla</span>
            <span class="text-[11px] text-slate-400 font-medium">JPG, PNG o WebP · también puedes pegarla con Ctrl+V</span>
          </label>
          <div v-if="currentPhoto" class="mt-4 flex justify-center">
            <button type="button" @click="removePhoto" :disabled="saving" class="px-4 py-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors disabled:opacity-50">
              <i class="fas fa-trash-alt mr-1.5"></i>Quitar mi foto actual
            </button>
          </div>
        </div>

        <!-- Paso 2: editor -->
        <div v-else class="flex flex-col md:flex-row min-h-0 overflow-y-auto">
          <div class="flex-1 min-w-0 p-5 space-y-4">
            <div class="h-80 rounded-2xl overflow-hidden bg-slate-900">
              <Cropper
                ref="cropper"
                class="h-full"
                :src="src"
                :stencil-component="CircleStencil"
                :stencil-props="{ aspectRatio: 1, previewClass: 'cropper-preview' }"
                image-restriction="stencil"
                :default-size="defaultSize"
                :canvas="{ width: OUTPUT_SIZE, height: OUTPUT_SIZE }"
                @change="onChange"
              />
            </div>

            <!-- Zoom -->
            <div class="flex items-center gap-3">
              <button type="button" @click="zoomBy(1 / 1.2)" :class="toolBtn" title="Alejar"><i class="fas fa-magnifying-glass-minus"></i></button>
              <input
                type="range" min="1" max="4" step="0.05"
                :value="zoomLevel"
                @input="onZoomSlider"
                class="flex-1 accent-primary-500"
                aria-label="Zoom"
              />
              <button type="button" @click="zoomBy(1.2)" :class="toolBtn" title="Acercar"><i class="fas fa-magnifying-glass-plus"></i></button>
            </div>

            <!-- Herramientas -->
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" @click="cropper?.rotate(-90)" :class="toolBtn" title="Girar a la izquierda"><i class="fas fa-rotate-left"></i></button>
              <button type="button" @click="cropper?.rotate(90)" :class="toolBtn" title="Girar a la derecha"><i class="fas fa-rotate-right"></i></button>
              <button type="button" @click="cropper?.flip(true, false)" :class="toolBtn" title="Voltear horizontal"><i class="fas fa-left-right"></i></button>
              <button type="button" @click="cropper?.flip(false, true)" :class="toolBtn" title="Voltear vertical"><i class="fas fa-up-down"></i></button>
              <button type="button" @click="resetEditor" :class="toolBtn" title="Deshacer cambios"><i class="fas fa-arrows-rotate"></i></button>
              <button type="button" @click="fileInput?.click()" class="ml-auto px-3 h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                <i class="fas fa-image mr-1.5"></i>Cambiar foto
              </button>
            </div>
          </div>

          <!-- Vista previa -->
          <div class="md:w-56 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/60 p-5 flex flex-col items-center gap-4">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest self-start">Vista previa</span>
            <Preview
              v-if="result"
              class="rounded-full overflow-hidden ring-4 ring-white shadow-lg"
              :width="112" :height="112"
              :image="result.image" :coordinates="result.coordinates"
            />
            <div v-if="result" class="flex items-end gap-3">
              <Preview class="rounded-full overflow-hidden ring-2 ring-white shadow" :width="40" :height="40" :image="result.image" :coordinates="result.coordinates" />
              <Preview class="rounded-full overflow-hidden ring-2 ring-white shadow" :width="28" :height="28" :image="result.image" :coordinates="result.coordinates" />
              <Preview class="rounded-full overflow-hidden ring-2 ring-white shadow" :width="20" :height="20" :image="result.image" :coordinates="result.coordinates" />
            </div>
            <p class="text-[10px] text-slate-400 text-center leading-relaxed">Así se verá en el menú, en las tareas y en los comentarios.</p>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="src" class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-white">
          <button type="button" @click="close" class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 border border-slate-200 hover:bg-slate-50">Cancelar</button>
          <button
            type="button"
            @click="save"
            :disabled="saving || !result"
            class="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-200 disabled:opacity-50 transition-all"
          >
            <i :class="saving ? 'fas fa-circle-notch fa-spin' : 'fas fa-check'" class="mr-1.5"></i>{{ saving ? 'Guardando...' : 'Guardar foto' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Cropper, CircleStencil, Preview } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { AvatarService } from '@/services/avatarService'
import { useNotifications } from '@/composables/useNotifications'

defineProps<{ currentPhoto?: string | null }>()
const emit = defineEmits<{
  close: []
  update: [data: { photo: string | null; avatar: string | null }]
}>()

const OUTPUT_SIZE = 512
const toolBtn = 'w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-primary-50 hover:text-primary-600 flex items-center justify-center text-sm transition-colors'
// El toast de éxito lo muestra ProfileView al recibir `update`
const { showError } = useNotifications()

const fileInput = ref<HTMLInputElement | null>(null)
const cropper = ref<InstanceType<typeof Cropper> | null>(null)
const src = ref('')
const dragging = ref(false)
const saving = ref(false)
const result = ref<{ image: any; coordinates: any } | null>(null)
const zoomLevel = ref(1)

function loadFile(file?: File | null) {
  if (!file) return
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
    showError('Usa una imagen JPG, PNG o WebP')
    return
  }
  if (src.value) URL.revokeObjectURL(src.value)
  src.value = URL.createObjectURL(file)
  zoomLevel.value = 1
  result.value = null
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  loadFile(input.files?.[0])
  input.value = ''
}

function onDrop(e: DragEvent) {
  dragging.value = false
  loadFile(e.dataTransfer?.files?.[0])
}

function onPaste(e: ClipboardEvent) {
  const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'))
  if (item) loadFile(item.getAsFile())
}

// Encuadre inicial: el círculo más grande que quepa en la imagen.
function defaultSize({ imageSize }: { imageSize: { width: number; height: number } }) {
  const side = Math.min(imageSize.width, imageSize.height)
  return { width: side, height: side }
}

function onChange(payload: { image: any; coordinates: any }) {
  result.value = { image: payload.image, coordinates: payload.coordinates }
}

function zoomBy(factor: number) {
  const next = Math.min(4, Math.max(1, zoomLevel.value * factor))
  if (next === zoomLevel.value) return
  cropper.value?.zoom(next / zoomLevel.value)
  zoomLevel.value = next
}

function onZoomSlider(e: Event) {
  const next = Number((e.target as HTMLInputElement).value)
  cropper.value?.zoom(next / zoomLevel.value)
  zoomLevel.value = next
}

function resetEditor() {
  cropper.value?.reset()
  zoomLevel.value = 1
}

async function save() {
  const canvas: HTMLCanvasElement | undefined = cropper.value?.getResult()?.canvas
  if (!canvas) return
  // Fondo blanco para PNG con transparencia antes de pasar a JPEG
  const out = document.createElement('canvas')
  out.width = OUTPUT_SIZE
  out.height = OUTPUT_SIZE
  const ctx = out.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
  ctx.drawImage(canvas, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

  saving.value = true
  try {
    const res = await AvatarService.saveProfilePhoto(out.toDataURL('image/jpeg', 0.88))
    if (!res.success) throw new Error(res.message)
    emit('update', { photo: res.data?.photo || null, avatar: null })
    close()
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || 'No se pudo guardar la foto')
  } finally {
    saving.value = false
  }
}

async function removePhoto() {
  saving.value = true
  try {
    const res = await AvatarService.removeProfilePhoto()
    if (!res.success) throw new Error(res.message)
    emit('update', { photo: null, avatar: null })
    close()
  } catch (e: any) {
    showError(e?.message || 'No se pudo quitar la foto')
  } finally {
    saving.value = false
  }
}

function close() {
  if (!saving.value) emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  window.addEventListener('paste', onPaste)
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('paste', onPaste)
  window.removeEventListener('keydown', onKeydown)
  if (src.value) URL.revokeObjectURL(src.value)
})

</script>

