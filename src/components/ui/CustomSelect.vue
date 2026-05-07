<template>
  <div class="relative" ref="selectContainer">
    <!-- Select Button -->
    <button
      type="button"
      @click="toggle"
      :class="[
        'w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm flex items-center justify-between group',
        size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm',
        { 'ring-4 ring-primary-500/10 border-primary-500 bg-white': isOpen }
      ]"
    >
      <div class="flex items-center gap-2 truncate">
        <span v-if="selectedOption?.icon" v-html="selectedOption.icon" class="text-slate-400"></span>
        <span :class="selectedOption?.specialClass || 'font-medium truncate'">
          {{ selectedOption?.label || placeholder }}
        </span>
      </div>
      <i 
        class="fas fa-chevron-down text-[10px] text-slate-400 transition-transform duration-300"
        :class="{ 'rotate-180 text-primary-500': isOpen }"
      ></i>
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden shadow-slate-200/50"
      >
        <ul class="max-h-60 overflow-y-auto p-1 custom-scrollbar">
          <li
            v-for="option in options"
            :key="String(option.value)"
            @click="selectOption(option)"
            :class="[
              'rounded-xl cursor-pointer transition-colors flex items-center justify-between group/item',
              size === 'sm' ? 'px-2 py-1.5' : 'px-3 py-2.5',
              option.value === modelValue 
                ? 'bg-primary-50 text-primary-700' 
                : 'hover:bg-slate-50 text-slate-700'
            ]"
          >
            <div class="flex items-center gap-2 truncate">
              <span v-if="option.icon" v-html="option.icon" :class="option.value === modelValue ? 'text-primary-500' : 'text-slate-400 group-hover/item:text-slate-600'"></span>
              <span :class="[
                option.specialClass || 'font-medium',
                size === 'sm' ? 'text-xs' : 'text-sm'
              ]">{{ option.label }}</span>
            </div>
            
            <i 
              v-if="option.value === modelValue" 
              class="fas fa-check text-xs text-primary-500"
            ></i>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface SelectOption {
  value: string | number | null
  label: string
  icon?: string
  specialClass?: string
}

const props = withDefaults(defineProps<{
  modelValue: string | number | null
  options: SelectOption[]
  placeholder?: string
  size?: 'sm' | 'md'
}>(), {
  placeholder: 'Seleccionar...',
  size: 'md'
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const selectContainer = ref<HTMLElement | null>(null)

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)
})

const toggle = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (option: SelectOption) => {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

// Close on outside click
const handleClickOutside = (event: MouseEvent) => {
  if (selectContainer.value && !selectContainer.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #CBD5E1;
}
</style>
