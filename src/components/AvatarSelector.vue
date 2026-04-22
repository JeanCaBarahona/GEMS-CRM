<template>
  <div class="space-y-6">
    <!-- Selected Avatar Preview -->
    <div v-if="selectedAvatar" class="p-5 bg-primary-50 rounded-2xl border border-primary-100 flex items-center gap-4 animate__animated animate__fadeIn">
      <div class="relative">
        <div class="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
          <img
            :src="getSelectedAvatarData()?.path"
            :alt="getSelectedAvatarData()?.name"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
          <i class="fas fa-check text-[10px] text-white"></i>
        </div>
      </div>
      <div class="flex-1">
        <p class="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Avatar Seleccionado</p>
        <h4 class="text-slate-800 font-black text-lg tracking-tight">{{ getSelectedAvatarData()?.name }}</h4>
      </div>
    </div>

    <!-- Avatar Options Grid -->
    <div class="grid grid-cols-3 gap-4">
      <div
        v-for="avatar in IDENTITY_AVATARS"
        :key="avatar.id"
        @click="$emit('select', avatar.id)"
        class="group cursor-pointer transition-all duration-300 relative p-3 rounded-2xl border-2"
        :class="[
          selectedAvatar === avatar.id 
            ? 'bg-primary-50 border-primary-300 ring-4 ring-primary-50' 
            : 'bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200 hover:shadow-md'
        ]"
      >
        <div class="relative mx-auto w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:scale-110 transition-transform duration-300">
          <img
            :src="avatar.path"
            :alt="avatar.name"
            class="w-full h-full object-cover"
          />
        </div>
        <p class="text-[10px] font-black text-center mt-3 uppercase tracking-wider transition-colors"
           :class="selectedAvatar === avatar.id ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'">
          {{ avatar.name }}
        </p>
      </div>
    </div>

    <!-- Action Button -->
    <div class="pt-4 border-t border-slate-100 flex justify-center">
      <button
        @click="$emit('confirm')"
        :disabled="!selectedAvatar"
        class="w-full px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary-100 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
      >
        <i class="fas fa-check-circle mr-2"></i>
        Confirmar Identidad
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IDENTITY_AVATARS, getAvatarById } from '@/utils/avatarConfig'

interface Props {
  selectedAvatar?: string
}

const props = defineProps<Props>()

defineEmits<{
  select: [avatarId: string]
  confirm: []
}>()

const getSelectedAvatarData = () => {
  if (!props.selectedAvatar) return null
  return getAvatarById(props.selectedAvatar)
}
</script>

<style scoped>
.animate__fadeIn {
  animation-duration: 0.5s;
}
</style>