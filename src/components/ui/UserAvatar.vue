<template>
  <div 
    :class="[
      'relative overflow-hidden flex items-center justify-center text-white font-semibold',
      sizeClasses[size],
      bordered ? 'ring-2 ring-purple-500/50' : '',
      clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : '',
      className
    ]"
    :title="name"
    @click="handleClick"
  >
    <!-- Forzado a iniciales por solicitud de usuario (Abril 2026) -->
    <div
      :class="[
        'w-full h-full flex items-center justify-center',
        (bgGradient || finalGradient),
        textSizeClasses[size]
      ]"
    >
      {{ initials }}
    </div>
    
    <!-- Badge de estado (opcional) -->
    <div
      v-if="showStatus"
      :class="[
        'absolute bottom-0 right-0 rounded-full border-2',
        statusClasses[status],
        statusSizeClasses[size]
      ]"
    ></div>
    
    <!-- Overlay para hover (opcional) -->
    <div
      v-if="showOverlay && hovered"
      class="absolute inset-0 bg-black/50 flex items-center justify-center"
    >
      <i class="fas fa-camera text-white"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getFullPhotoUrl } from '@/utils/photoUtils'
import { getAvatarById, getDefaultAvatar } from '@/utils/avatarConfig'

interface Props {
  name: string
  photo?: string
  avatar?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  bordered?: boolean
  clickable?: boolean
  showStatus?: boolean
  status?: 'online' | 'offline' | 'busy' | 'away'
  showOverlay?: boolean
  bgGradient?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  bordered: false,
  clickable: false,
  showStatus: false,
  status: 'offline',
  showOverlay: false,
  bgGradient: '',
  className: ''
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const hovered = ref(false)

// Clases de tamaño
const sizeClasses = {
  xs: 'w-6 h-6 rounded',
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-10 h-10 rounded-lg',
  lg: 'w-12 h-12 rounded-xl',
  xl: 'w-16 h-16 rounded-xl',
  '2xl': 'w-20 h-20 rounded-2xl'
}

// Clases de tamaño de texto
const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
  '2xl': 'text-xl'
}

// Clases de tamaño para el badge de estado
const statusSizeClasses = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
  '2xl': 'w-5 h-5'
}

// Clases de estado
const statusClasses = {
  online: 'bg-green-500 border-gray-800',
  offline: 'bg-gray-500 border-gray-800',
  busy: 'bg-red-500 border-gray-800',
  away: 'bg-yellow-500 border-gray-800'
}

// Gradiente por defecto (no se usa directamente; preferimos finalGradient)
const defaultGradient = 'bg-gradient-to-br from-purple-600 to-pink-600'

// State for image error to fallback to initials
const imgError = ref(false)

// Computed
const initials = computed(() => {
  if (!props.name) return '?'
  
  const words = props.name.trim().split(' ')
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }
  
  return words.slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
})

const resolvedPhoto = computed(() => {
  if (!props.photo || imgError.value) return ''
  return getFullPhotoUrl(props.photo)
})

const resolvedAvatar = computed(() => {
  if (!props.avatar) return null
  return getAvatarById(props.avatar) || getDefaultAvatar()
})

// Methods
const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event)
  }
}

const handleImageError = () => {
  imgError.value = true
}

// Reset error when photo changes
watch(() => props.photo, () => {
  imgError.value = false
})

// Generar gradiente basado en el nombre (para consistencia)
const generateGradient = (name: string) => {
  const colors = [
    'from-purple-600 to-pink-600',
    'from-blue-600 to-indigo-600',
    'from-green-600 to-teal-600',
    'from-yellow-600 to-orange-600',
    'from-red-600 to-pink-600',
    'from-indigo-600 to-purple-600',
    'from-teal-600 to-cyan-600',
    'from-orange-600 to-red-600'
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const index = Math.abs(hash) % colors.length
  return `bg-gradient-to-br ${colors[index]}`
}

// Usar gradiente personalizado o generar uno basado en el nombre
const finalGradient = computed(() => {
  return props.bgGradient || generateGradient(props.name)
})
</script>
