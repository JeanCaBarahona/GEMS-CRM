<template>
  <!-- Avatar de una persona: su foto de perfil si tiene (y carga), si no sus
       iniciales. El tamaño, colores y borde los pone quien lo usa vía `class`,
       así reemplaza a los círculos de iniciales sin cambiar su aspecto. -->
  <span
    class="relative inline-flex items-center justify-center overflow-hidden shrink-0 select-none"
    :title="title ?? name ?? undefined"
  >
    <img
      v-if="src"
      :src="src"
      :alt="name || ''"
      class="absolute inset-0 w-full h-full object-cover"
      loading="lazy"
      @error="failed = src"
    />
    <template v-else>{{ initials }}</template>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getFullPhotoUrl } from '@/utils/photoUtils'

const props = withDefaults(defineProps<{
  name?: string | null
  photo?: string | null
  /** 1 = solo la primera letra; 2 = iniciales de nombre y apellido */
  letters?: 1 | 2
  title?: string
}>(), {
  name: '',
  photo: '',
  letters: 2,
  title: undefined
})

// Guarda la URL que falló (no un booleano) para reintentar si cambia la foto.
const failed = ref('')

const src = computed(() => {
  const url = getFullPhotoUrl(props.photo || '')
  return url && url !== failed.value ? url : ''
})

const initials = computed(() => {
  const words = String(props.name || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  if (props.letters === 1 || words.length === 1) return words[0].charAt(0).toUpperCase()
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
})
</script>
