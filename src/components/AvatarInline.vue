<template>
  <div class="flex items-center gap-2 min-w-0">
    <PersonAvatar
      :name="name || 'Sin asignar'"
      :photo="photo"
      class="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-black"
    />
    <span v-if="!hideName" class="text-xs text-slate-600 truncate">{{ name || 'Sin asignar' }}</span>
  </div>
</template>

<script setup lang="ts">
import PersonAvatar from '@/components/ui/PersonAvatar.vue'

// `avatar` (gemas) se acepta por compatibilidad pero ya no se muestra:
// se usa la foto de perfil y, si no hay, las iniciales.
withDefaults(defineProps<{
  name?: string
  photo?: string
  avatar?: string
  hideName?: boolean
}>(), {
  name: '',
  photo: '',
  avatar: '',
  hideName: false
})
</script>
