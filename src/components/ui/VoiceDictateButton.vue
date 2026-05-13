<template>
  <button
    v-if="isSupported"
    type="button"
    @click="onClick"
    :class="[
      'inline-flex items-center justify-center gap-1.5 rounded-lg font-black transition-all border',
      sizeClass,
      isRecording
        ? 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse'
        : variantClass,
    ]"
    :title="isRecording ? 'Detener dictado' : 'Dictar por voz'"
  >
    <i :class="['fas', isRecording ? 'fa-stop' : 'fa-microphone', iconSize]"></i>
    <span v-if="showLabel">{{ isRecording ? 'Detener' : 'Dictar' }}</span>
  </button>
  <!-- Si no soporta, no renderiza nada -->
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useSpeechToText } from '@/composables/useSpeechToText'
import { useNotifications } from '@/composables/useNotifications'

interface Props {
  /** v-model:value — texto editable que se enriquece con la transcripción */
  modelValue: string
  /** Variante visual */
  variant?: 'subtle' | 'primary'
  /** Tamaño */
  size?: 'xs' | 'sm' | 'md'
  /** Mostrar el label "Dictar/Detener" además del icono */
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'subtle',
  size: 'sm',
  showLabel: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { showError, showInfo } = useNotifications()

const { isSupported, isRecording, toggle } = useSpeechToText({
  getInitialText: () => props.modelValue,
  onInterim: (text) => emit('update:modelValue', text),
  onFinal: (text) => emit('update:modelValue', text),
  onError: (msg) => showError(msg),
})

const onClick = () => {
  if (!isRecording.value) {
    showInfo('Habla cuando estés listo')
  }
  toggle()
}

const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'px-2 py-0.5 text-[9px]'
    case 'md': return 'px-3 py-2 text-xs'
    default:   return 'px-2.5 py-1 text-[10px]' // sm
  }
})

const iconSize = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-[9px]'
    case 'md': return 'text-xs'
    default:   return 'text-[10px]'
  }
})

const variantClass = computed(() =>
  props.variant === 'primary'
    ? 'bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200'
    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
)

// Si el componente se desmonta mientras grababa, useSpeechToText ya hace stop()
watch(isRecording, (rec) => {
  // hook por si en el futuro queremos hacer algo extra al detener
  if (!rec) {
    /* noop */
  }
})
</script>
