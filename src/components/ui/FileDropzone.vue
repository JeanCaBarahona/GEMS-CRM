<template>
  <label
    :class="[
      'flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl px-6 py-8 cursor-pointer transition-all text-center',
      isDragging ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
    ]"
    @dragover.prevent
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <i :class="['fas fa-cloud-upload-alt text-2xl transition-colors', isDragging ? 'text-primary-500' : 'text-slate-400']"></i>
    <span class="text-sm font-bold" :class="isDragging ? 'text-primary-700' : 'text-slate-600'">
      <slot>{{ label }}</slot>
    </span>
    <span class="text-[11px] text-slate-400 font-medium">Arrastra y suelta, o haz clic para elegir</span>
    <input type="file" :multiple="multiple" :accept="accept" class="hidden" @change="onInputChange" />
  </label>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  label?: string
  multiple?: boolean
  accept?: string
}>(), {
  label: 'Subir archivos',
  multiple: true,
  accept: undefined
})

const emit = defineEmits<{
  (e: 'files-selected', files: File[]): void
}>()

const isDragging = ref(false)
// dragenter/dragleave se disparan también al pasar sobre elementos hijos
// (el ícono, el texto). Se cuenta para no "apagar" isDragging de más.
let dragCounter = 0

const onDragEnter = () => {
  dragCounter += 1
  isDragging.value = true
}

const onDragLeave = () => {
  dragCounter = Math.max(0, dragCounter - 1)
  if (dragCounter === 0) isDragging.value = false
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  dragCounter = 0
  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length) emit('files-selected', props.multiple ? files : [files[0]])
}

const onInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (files.length) emit('files-selected', files)
  target.value = ''
}
</script>
