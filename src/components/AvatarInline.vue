<template>
  <div class="flex items-center gap-2 min-w-0">
    <div
      class="flex-shrink-0 w-5 h-5 rounded-full overflow-hidden border border-gray-600 bg-gray-700 text-[10px] flex items-center justify-center text-white"
      :title="name"
    >
      <!-- Avatar de gema -->
      <img
        v-if="resolvedAvatar"
        :src="resolvedAvatar.path"
        :alt="resolvedAvatar.name"
        class="w-full h-full object-cover"
      />
      <!-- Imagen de perfil -->
      <img
        v-else-if="photoUrl"
        :src="resolvedUrl"
        alt="avatar"
        class="w-full h-full object-cover"
        @error="onError"
      />
      <!-- Iniciales como fallback -->
      <span v-else>{{ initials }}</span>
    </div>
    <span v-if="!hideName" class="text-xs text-gray-300 truncate">{{ name || 'Sin asignar' }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { API_CONFIG } from '@/config/api'
import { getAvatarById, getDefaultAvatar } from '@/utils/avatarConfig'

const props = withDefaults(defineProps<{
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

const errored = ref(false)
const photoUrl = computed(() => (!props.photo || errored.value) ? '' : props.photo)

const resolvedUrl = computed(() => {
  const url = photoUrl.value
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  const origin = String(API_CONFIG.BASE_URL).replace(/\/?api\/?$/i, '')
  return `${origin.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
})

const resolvedAvatar = computed(() => {
  if (!props.avatar) return null
  return getAvatarById(props.avatar) || getDefaultAvatar()
})

const initials = computed(() => {
  const n = props.name?.trim() || ''
  if (!n) return 'U'
  return n.split(' ').map(s => s[0]).join('').toUpperCase().slice(0,2)
})

const onError = () => { errored.value = true }

watchEffect(() => {
  // reset error when photo changes
  errored.value = false
})
</script>

<style scoped>
</style>
