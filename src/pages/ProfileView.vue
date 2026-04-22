<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-slate-200/60 shadow-sm transition-all duration-300">
      <div class="flex flex-col md:flex-row items-center gap-8">
        <!-- Profile Avatar -->
        <div class="relative group">
          <div class="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-primary-100/50 relative">
            <!-- Personalized photo -->
            <img
              v-if="profileData.photo"
              :src="resolvedPhotoUrl"
              :alt="profileData.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              @error="onPhotoError"
            >
            <!-- Predefined avatar -->
            <img
              v-else-if="selectedAvatarData"
              :src="selectedAvatarData.path"
              :alt="selectedAvatarData.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            >
            <!-- Fallback initials -->
            <div
              v-else
              class="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-4xl font-bold"
            >
              {{ getInitials(profileData?.name || 'U') }}
            </div>
          </div>

          <!-- Action buttons for managing avatar/photo -->
          <div class="absolute -bottom-2 -right-2 flex gap-2">
            <!-- Button to upload personalized photo -->
            <button
              @click="togglePhotoUploader"
              class="w-10 h-10 bg-white hover:bg-slate-50 text-primary-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border border-slate-100"
              title="Subir foto personalizada"
            >
              <i class="fas fa-camera text-sm"></i>
            </button>
            
            <!-- Button to choose predefined gem -->
            <button
              @click="openAvatarSelector"
              class="w-10 h-10 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform hover:scale-110"
              title="Elegir Gema"
            >
              <i class="fas fa-gem text-sm"></i>
            </button>
          </div>
        </div>
        
        <!-- Basic Info -->
        <div class="text-center md:text-left flex-1">
          <div class="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <h1 class="text-3xl font-black text-slate-800 tracking-tight">{{ profileData?.name || 'Cargando...' }}</h1>
            <span class="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-black uppercase tracking-widest border border-primary-100/50">
              {{ getRoleDisplayName(profileData?.role || '') }}
            </span>
          </div>
          <p class="text-slate-500 font-medium mb-4">{{ profileData?.email || '' }}</p>
          
          <div class="flex flex-wrap gap-3 justify-center md:justify-start">
            <span class="inline-flex items-center px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-bold border border-emerald-100">
              <i class="fas fa-check-circle mr-2"></i>
              Activo
            </span>
            <span class="inline-flex items-center px-4 py-1.5 bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold border border-slate-100">
              <i class="fas fa-calendar-alt mr-2"></i>
              Miembro desde {{ formatDate(profileData?.createdAt || '') }}
            </span>
          </div>
        </div>

        <!-- Edit Button -->
        <div class="flex gap-3">
          <button
            @click="toggleEditMode"
            :class="[
              'px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-sm',
              isEditing 
                ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100' 
                : 'bg-primary-500 text-white hover:bg-primary-600 shadow-primary-200 shadow-lg hover:-translate-y-0.5'
            ]"
          >
            <i :class="isEditing ? 'fas fa-times' : 'fas fa-pen-nib'" class="mr-2"></i>
            {{ isEditing ? 'Cancelar' : 'Editar Perfil' }}
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Personal Information (Left Column) -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-slate-200/60 shadow-sm h-full">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-xl font-black text-slate-800 flex items-center">
              <div class="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mr-4">
                <i class="fas fa-id-card text-primary-500"></i>
              </div>
              Información Personal
            </h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <!-- Name -->
            <div class="space-y-2">
              <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Nombre Completo
              </label>
              <div v-if="isEditing" class="relative group">
                <i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors"></i>
                <input
                  v-model="editForm.name"
                  type="text"
                  class="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all outline-none"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div v-else class="px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <p class="text-slate-700 font-bold">{{ profileData?.name || 'No especificado' }}</p>
              </div>
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Correo Electrónico
              </label>
              <div v-if="isEditing" class="relative group">
                <i class="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors"></i>
                <input
                  v-model="editForm.email"
                  type="email"
                  class="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all outline-none"
                  placeholder="tu@email.com"
                />
              </div>
              <div v-else class="px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <p class="text-slate-700 font-bold">{{ profileData?.email || 'No especificado' }}</p>
              </div>
            </div>

            <!-- Phone -->
            <div class="space-y-2">
              <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Teléfono
              </label>
              <div v-if="isEditing" class="relative group">
                <i class="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors"></i>
                <input
                  v-model="editForm.phone"
                  type="tel"
                  class="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all outline-none"
                  placeholder="+57 300 000 0000"
                />
              </div>
              <div v-else class="px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <p class="text-slate-700 font-bold">{{ profileData?.phone || 'No especificado' }}</p>
              </div>
            </div>

            <!-- Department -->
            <div class="space-y-2">
              <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Departamento
              </label>
              <div v-if="isEditing" class="relative group">
                <i class="fas fa-building absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors"></i>
                <input
                  v-model="editForm.department"
                  type="text"
                  class="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all outline-none"
                  placeholder="Tu departamento"
                />
              </div>
              <div v-else class="px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <p class="text-slate-700 font-bold">{{ profileData?.department || 'No especificado' }}</p>
              </div>
            </div>

            <!-- Metadata (Read Only) -->
            <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 mt-2">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <i class="fas fa-calendar-plus"></i>
                </div>
                <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registrado el</p>
                  <p class="text-slate-700 font-bold text-sm">{{ formatDate(profileData?.createdAt || '') }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <i class="fas fa-history"></i>
                </div>
                <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Última actualización</p>
                  <p class="text-slate-700 font-bold text-sm">{{ formatDate(profileData?.updatedAt || '') }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Edit Action Buttons -->
          <div v-if="isEditing" class="flex gap-4 mt-10 justify-end pt-6 border-t border-slate-100">
            <button
              @click="toggleEditMode"
              class="px-6 py-3 text-slate-500 hover:text-slate-700 font-black text-xs uppercase tracking-widest transition-all"
            >
              Cancelar
            </button>
            <button
              @click="updateProfile"
              :disabled="loading"
              class="px-8 py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary-200 disabled:opacity-50"
            >
              <i class="fas fa-save mr-2"></i>
              {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Security / Password (Right Column) -->
      <div class="space-y-6">
        <div class="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-slate-200/60 shadow-sm">
          <h2 class="text-xl font-black text-slate-800 mb-8 flex items-center">
            <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mr-4">
              <i class="fas fa-shield-alt text-amber-500"></i>
            </div>
            Seguridad
          </h2>
          
          <form @submit.prevent="updatePassword" class="space-y-5">
            <div class="space-y-2">
              <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Contraseña Actual
              </label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                class="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div class="space-y-2">
              <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Nueva Contraseña
              </label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                class="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div class="space-y-2">
              <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Confirmar Nueva Contraseña
              </label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                class="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              :disabled="loading || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword"
              class="w-full mt-4 px-6 py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg disabled:opacity-50"
            >
              <i class="fas fa-key mr-2"></i>
              {{ loading ? 'Actualizando...' : 'Actualizar Contraseña' }}
            </button>
          </form>
        </div>

        <!-- Help Box -->
        <div class="bg-primary-50 rounded-3xl p-6 border border-primary-100">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
              <i class="fas fa-lightbulb text-primary-500"></i>
            </div>
            <div>
              <h4 class="font-black text-primary-900 text-sm uppercase tracking-tight mb-1">Dato curioso</h4>
              <p class="text-primary-700/80 text-xs leading-relaxed font-medium">
                Tu avatar representa tu identidad en Customer Touch. Puedes cambiarlo en cualquier momento para reflejar tu enfoque de trabajo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Avatar Selector Modal -->
    <div v-if="showAvatarSelector" class="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-white/50 animate__animated animate__zoomIn animate__faster">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-xl font-black text-slate-800 uppercase tracking-tight">Elige tu Gema</h3>
          <button
            @click="showAvatarSelector = false"
            class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <AvatarSelector
          :selected-avatar="tempSelectedAvatar || profileData.avatar || getDefaultAvatar().id"
          @select="selectAvatar"
          @confirm="confirmAvatarSelection"
        />
      </div>
    </div>
    
    <!-- Photo Uploader Modal -->
    <div v-if="showPhotoUploader" class="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-white/50 animate__animated animate__zoomIn animate__faster">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-xl font-black text-slate-800 uppercase tracking-tight">Foto de Perfil</h3>
          <button
            @click="showPhotoUploader = false"
            class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <ProfilePhotoUploader
          :current-photo="profileData.photo"
          @update="handlePhotoUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/userService'
import { AvatarService } from '@/services/avatarService'
import { useNotifications } from '@/composables/useNotifications'
import AvatarSelector from '@/components/AvatarSelector.vue'
import ProfilePhotoUploader from '@/components/ProfilePhotoUploader.vue'
import { getAvatarById, getDefaultAvatar } from '@/utils/avatarConfig'
import { API_CONFIG } from '@/config/api'

const authStore = useAuthStore()
const { showSuccess, showError } = useNotifications()

// State
const loading = ref(false)
const isEditing = ref(false)
const showAvatarSelector = ref(false)
const showPhotoUploader = ref(false)
const tempSelectedAvatar = ref<string>('')
const photoErrored = ref(false)

const profileData = ref({
  name: '',
  email: '',
  role: '',
  phone: '',
  department: '',
  avatar: null as string | null,
  photo: null as string | null,
  createdAt: '',
  updatedAt: ''
})

const editForm = ref({
  name: '',
  email: '',
  phone: '',
  department: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Computed
const selectedAvatarData = computed(() => {
  const avatarId = profileData.value?.avatar
  return avatarId ? getAvatarById(avatarId) : null
})

const resolvedPhotoUrl = computed(() => {
  const url = profileData.value.photo
  if (!url || photoErrored.value) return ''
  if (/^https?:\/\//i.test(url)) return url
  const origin = String(API_CONFIG.BASE_URL).replace(/\/?api\/?$/i, '')
  return `${origin.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
})

// Methods
const getInitials = (name: string) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2)
}

const getRoleDisplayName = (role: string) => {
  const roles: { [key: string]: string } = {
    'admin': 'Administrador',
    'manager': 'Gerente',
    'user': 'Usuario',
    'employee': 'Empleado',
    'support': 'Soporte',
    'client': 'Cliente'
  }
  return roles[role] || role || 'Miembro'
}

const onPhotoError = () => {
  photoErrored.value = true
}

const togglePhotoUploader = () => {
  showPhotoUploader.value = !showPhotoUploader.value
  if (showPhotoUploader.value) showAvatarSelector.value = false
}

const handlePhotoUpdate = (data: { photo: string | null, avatar: string | null }) => {
  profileData.value.photo = data.photo
  profileData.value.avatar = data.avatar
  
  if (authStore.user) {
    authStore.user.photo = data.photo
    authStore.user.avatar = data.avatar
    localStorage.setItem('user', JSON.stringify(authStore.user))
  }
  
  showPhotoUploader.value = false
  photoErrored.value = false
  showSuccess('Foto actualizada correctamente')
}

const formatDate = (dateString: string) => {
  if (!dateString) return '...'
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return '---'
  }
}

const selectAvatar = (avatarId: string) => {
  tempSelectedAvatar.value = avatarId
}

const openAvatarSelector = () => {
  tempSelectedAvatar.value = profileData.value.avatar || getDefaultAvatar().id
  showAvatarSelector.value = true
}

const confirmAvatarSelection = async () => {
  if (!tempSelectedAvatar.value) return

  try {
    loading.value = true
    const result = await AvatarService.updateUserAvatar(tempSelectedAvatar.value)

    if (result.success) {
      profileData.value.avatar = tempSelectedAvatar.value
      profileData.value.photo = null

      if (authStore.user) {
        (authStore.user as any).avatar = tempSelectedAvatar.value
        (authStore.user as any).photo = null
        localStorage.setItem('user', JSON.stringify(authStore.user))
      }

      showAvatarSelector.value = false
      tempSelectedAvatar.value = ''
      showSuccess('Avatar actualizado correctamente')
    } else {
      showError(result.message || 'Error al actualizar el avatar')
    }
  } catch (error) {
    showError('Error al actualizar el avatar')
  } finally {
    loading.value = false
  }
}

const toggleEditMode = () => {
  if (!profileData.value) return
  
  if (isEditing.value) {
    editForm.value = {
      name: profileData.value.name || '',
      email: profileData.value.email || '',
      phone: profileData.value.phone || '',
      department: profileData.value.department || ''
    }
  } else {
    editForm.value = {
      name: profileData.value.name || '',
      email: profileData.value.email || '',
      phone: profileData.value.phone || '',
      department: profileData.value.department || ''
    }
  }
  isEditing.value = !isEditing.value
}

const updateProfile = async () => {
  try {
    loading.value = true
    const result = await authStore.updateProfile(editForm.value)
    
    if (result.success) {
      Object.assign(profileData.value, editForm.value)
      isEditing.value = false
      showSuccess('Perfil actualizado correctamente')
    } else {
      showError(result.message || 'Error al actualizar el perfil')
    }
  } catch (error) {
    showError('Error al actualizar el perfil')
  } finally {
    loading.value = false
  }
}

const updatePassword = async () => {
  try {
    loading.value = true
    await userService.updatePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    showSuccess('Contraseña actualizada correctamente')
  } catch (error) {
    showError('Error al cambiar la contraseña')
  } finally {
    loading.value = false
  }
}

const loadProfile = async () => {
  try {
    loading.value = true
    
    if (authStore.user) {
      profileData.value = {
        name: authStore.user.name || '',
        email: authStore.user.email || '',
        role: authStore.user.role || '',
        phone: (authStore.user as any).phone || '',
        department: authStore.user.department || '',
        avatar: (authStore.user as any).avatar || null,
        photo: (authStore.user as any).photo || null,
        createdAt: (authStore.user as any).createdAt || '',
        updatedAt: (authStore.user as any).updatedAt || ''
      }
    }
    
    try {
      const profile = await userService.getProfile()
      profileData.value = {
        name: profile.name || '',
        email: profile.email || '',
        role: profile.role || '',
        phone: profile.phone || '',
        department: profile.department || '',
        avatar: profile.avatar || null,
        photo: profile.photo || null,
        createdAt: profile.createdAt || '',
        updatedAt: profile.updatedAt || ''
      }
      photoErrored.value = false
    } catch (serverError) {
      // Fallback already set from store
    }
    
    try {
      const avatarInfo = await AvatarService.getUserAvatar()
      if (avatarInfo) {
        profileData.value.avatar = avatarInfo.avatar
        profileData.value.photo = avatarInfo.photo
        if (authStore.user) {
          (authStore.user as any).avatar = avatarInfo.avatar
          (authStore.user as any).photo = avatarInfo.photo
          localStorage.setItem('user', JSON.stringify(authStore.user))
        }
      }
    } catch (avatarError) {
      // Silent fail
    }
    
  } catch (error) {
    showError('Error al cargar el perfil')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.animate__faster {
  --animate-duration: 0.3s;
}
</style>
