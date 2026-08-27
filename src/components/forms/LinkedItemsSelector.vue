<template>
  <div class="space-y-3">
    <!-- Chips de seleccionados -->
    <div v-if="selectedItems.length > 0" class="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
      <span
        v-for="item in selectedItems"
        :key="item._id"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm group transition-all hover:border-primary-300"
      >
        <i v-if="icon" :class="[icon, 'text-[10px] text-slate-400']"></i>
        <span class="text-xs font-bold text-slate-700 whitespace-nowrap">{{ item.label }}</span>
        <button
          type="button"
          @click="remove(item._id)"
          class="ml-1 text-slate-300 hover:text-red-500 transition-colors"
          title="Desvincular"
        >
          <i class="fas fa-times-circle text-xs"></i>
        </button>
      </span>
    </div>

    <!-- Búsqueda -->
    <div class="relative group">
      <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors text-xs"></i>
      <input
        v-model="search"
        type="text"
        :placeholder="placeholder"
        class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all text-sm font-medium"
      />
    </div>

    <!-- Lista de candidatos -->
    <div class="max-h-56 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
      <div v-if="loading" class="text-center py-6 text-slate-400 text-xs font-bold">
        <i class="fas fa-spinner fa-spin mr-1"></i> Cargando...
      </div>
      <template v-else>
        <button
          v-for="item in filteredItems"
          :key="item._id"
          type="button"
          @click="toggle(item._id)"
          class="flex items-center w-full px-3 py-2 rounded-xl transition-all border group text-left"
          :class="isSelected(item._id)
            ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-sm ring-1 ring-primary-200/50'
            : 'bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200 hover:text-slate-900'"
        >
          <i v-if="icon" :class="[icon, 'text-xs mr-2.5 flex-shrink-0', isSelected(item._id) ? 'text-primary-500' : 'text-slate-300']"></i>
          <div class="flex flex-col items-start min-w-0">
            <span class="text-sm font-bold truncate">{{ item.label }}</span>
            <span v-if="item.sublabel" class="text-[10px] text-slate-400 font-medium truncate uppercase tracking-wider">{{ item.sublabel }}</span>
          </div>
          <div class="ml-auto flex-shrink-0 pl-2">
            <div v-if="isSelected(item._id)" class="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-200">
              <i class="fas fa-check text-[10px] text-white"></i>
            </div>
            <div v-else class="w-5 h-5 border-2 border-slate-200 rounded-full group-hover:border-primary-300 transition-colors"></div>
          </div>
        </button>

        <div v-if="filteredItems.length === 0" class="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p class="text-xs text-slate-500 font-medium">{{ emptyLabel }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface LinkableItem {
  _id: string
  label: string
  sublabel?: string
}

const props = withDefaults(defineProps<{
  modelValue: string[]
  items: LinkableItem[]
  loading?: boolean
  placeholder?: string
  emptyLabel?: string
  /** Ícono FontAwesome opcional (ej: "fas fa-ticket-alt") para distinguir el tipo. */
  icon?: string
}>(), {
  loading: false,
  placeholder: 'Buscar...',
  emptyLabel: 'No se encontraron resultados',
  icon: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const search = ref('')

const isSelected = (id: string) => props.modelValue.includes(id)

const toggle = (id: string) => {
  if (isSelected(id)) {
    emit('update:modelValue', props.modelValue.filter(v => v !== id))
  } else {
    emit('update:modelValue', [...props.modelValue, id])
  }
}

const remove = (id: string) => {
  emit('update:modelValue', props.modelValue.filter(v => v !== id))
}

const filteredItems = computed(() => {
  if (!search.value.trim()) return props.items
  const q = search.value.toLowerCase()
  return props.items.filter(
    i => i.label.toLowerCase().includes(q) || (i.sublabel || '').toLowerCase().includes(q)
  )
})

const selectedItems = computed(() =>
  props.modelValue
    .map(id => props.items.find(i => i._id === id))
    .filter((i): i is LinkableItem => !!i)
)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
</style>
