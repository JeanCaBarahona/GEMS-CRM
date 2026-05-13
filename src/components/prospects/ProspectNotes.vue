<template>
  <div class="space-y-4 p-5">
    <!-- Add note -->
    <div class="bg-white border border-slate-200 rounded-xl p-3 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all">
      <textarea
        v-model="newNote"
        rows="2"
        placeholder="Anota algo interno sobre este prospect (no se envía a la IA ni al cliente)..."
        class="w-full bg-transparent border-none outline-none text-xs font-medium text-slate-800 placeholder-slate-400 resize-none leading-relaxed"
      ></textarea>
      <div class="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
        <span class="text-[10px] text-slate-400 font-bold">📝 Notas internas, solo visibles aquí</span>
        <button
          @click="addNote"
          :disabled="!newNote.trim()"
          class="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Guardar nota
        </button>
      </div>
    </div>

    <!-- Notes list -->
    <div v-if="notes.length" class="space-y-2">
      <div
        v-for="note in notes"
        :key="note.id"
        class="bg-yellow-50/40 border border-yellow-200/60 rounded-xl p-3 group relative"
      >
        <p class="text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">{{ note.content }}</p>
        <div class="flex items-center justify-between mt-2 pt-2 border-t border-yellow-200/40">
          <span class="text-[10px] font-bold text-slate-500">{{ formatDate(note.createdAt) }}</span>
          <button
            @click="confirmRemove(note.id)"
            class="text-[10px] font-bold text-rose-500 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <i class="fas fa-trash text-[9px]"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <i class="fas fa-note-sticky text-3xl text-slate-200 mb-2 block"></i>
      <p class="text-xs font-bold text-slate-400">Sin notas aún</p>
      <p class="text-[10px] text-slate-400 mt-1">Anota observaciones o recordatorios internos sobre el prospect</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ProspectNote } from '@/types/prospect'

interface Props {
  notes: ProspectNote[]
}

defineProps<Props>()

const emit = defineEmits<{
  add: [content: string]
  remove: [id: string]
}>()

const newNote = ref('')

const addNote = () => {
  if (!newNote.value.trim()) return
  emit('add', newNote.value.trim())
  newNote.value = ''
}

const confirmRemove = (id: string) => emit('remove', id)

const formatDate = (iso: string) => {
  try {
    return format(new Date(iso), "d MMM, HH:mm", { locale: es })
  } catch {
    return ''
  }
}
</script>
