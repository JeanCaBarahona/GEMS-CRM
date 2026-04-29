<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <div class="flex flex-col md:flex-row items-center gap-6">
        <!-- Foto de perfil -->
        <div class="relative">
          <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl">
            <img
              v-if="profileData?.photo"
              :src="profileData.photo"
              :alt="profileData.name || 'Usuario'"
              class="w-full h-full object-cover"
            >
            <div
              v-else
              class="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-bold"
            >
              {{ getInitials(profileData?.name || 'U') }}
            </div>
          </div>
          
          <!-- Botón para cambiar foto -->
          <button
            @click="triggerFileInput"
            class="absolute bottom-2 right-2 w-10 h-10 bg-yellow-600 hover:bg-yellow-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 transform hover:scale-110"
            title="Cambiar foto"
          >
            <i class="fas fa-camera text-sm"></i>
          </button>
        </div>
        
        <!-- Info básica -->
        <div class="text-center md:text-left flex-1">
          <h1 class="text-3xl font-bold text-white mb-2">{{ profileData?.name || 'Cargando...' }}</h1>
          <p class="text-purple-300 text-lg mb-2">{{ getRoleDisplayName(profileData?.role || '') }}</p>
          <p class="text-gray-400 mb-4">{{ profileData?.email || '' }}</p>
          
          <div class="flex flex-wrap gap-2 justify-center md:justify-start">
            <span class="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm">
              <i class="fas fa-check-circle mr-1"></i>
              Activo
            </span>
            <span class="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
              <i class="fas fa-calendar mr-1"></i>
              Desde {{ formatDate(profileData?.createdAt || '') }}
            </span>
          </div>
        </div>

        <!-- Botón de editar -->
        <div class="flex gap-3">
          <button
            @click="toggleEditMode"
            :class="[
              'px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105',
              isEditing 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white'
            ]"
          >
            <i :class="isEditing ? 'fas fa-times' : 'fas fa-edit'" class="mr-2"></i>
            {{ isEditing ? 'Cancelar' : 'Editar Perfil' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Información Personal -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <h2 class="text-xl font-bold text-white mb-6 flex items-center">
        <i class="fas fa-user mr-3 text-purple-400"></i>
        Información Personal
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Nombre -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-signature mr-2"></i>
            Nombre Completo
          </label>
          <div v-if="isEditing">
            <input
              v-model="editForm.name"
              type="text"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Tu nombre completo"
            />
          </div>
          <div v-else>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ profileData?.name || 'No especificado' }}</p>
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-envelope mr-2"></i>
            Correo Electrónico
          </label>
          <div v-if="isEditing">
            <input
              v-model="editForm.email"
              type="email"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>
          <div v-else>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ profileData?.email || 'No especificado' }}</p>
          </div>
        </div>

        <!-- Teléfono -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-phone mr-2"></i>
            Teléfono
          </label>
          <div v-if="isEditing">
            <input
              v-model="editForm.phone"
              type="tel"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="+57 300 000 0000"
            />
          </div>
          <div v-else>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ profileData?.phone || 'No especificado' }}</p>
          </div>
        </div>

        <!-- Departamento -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-building mr-2"></i>
            Departamento
          </label>
          <div v-if="isEditing">
            <input
              v-model="editForm.department"
              type="text"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Tu departamento"
            />
          </div>
          <div v-else>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ profileData?.department || 'No especificado' }}</p>
          </div>
        </div>

        <!-- Rol (solo lectura) -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-user-tag mr-2"></i>
            Rol
          </label>
          <div>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ getRoleDisplayName(profileData?.role || '') }}</p>
          </div>
        </div>

        <!-- Fecha de registro -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-calendar-plus mr-2"></i>
            Fecha de Registro
          </label>
          <div>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ formatDate(profileData?.createdAt || '') }}</p>
          </div>
        </div>

        <!-- Última actualización -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-clock mr-2"></i>
            Última Actualización
          </label>
          <div>
            <p class="text-white bg-gray-700 px-4 py-3 rounded-lg">{{ formatDate(profileData?.updatedAt || '') }}</p>
          </div>
        </div>
      </div>

      <!-- Botones de acción para modo edición -->
      <div v-if="isEditing" class="flex gap-4 mt-6 justify-end">
        <button
          @click="toggleEditMode"
          class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-300"
        >
          <i class="fas fa-times mr-2"></i>
          Cancelar
        </button>
        <button
          @click="updateProfile"
          :disabled="loading"
          class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
        >
          <i class="fas fa-save mr-2"></i>
          {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </div>

    <!-- Cambiar Contraseña -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <h2 class="text-xl font-bold text-white mb-6 flex items-center">
        <i class="fas fa-lock mr-3 text-purple-400"></i>
        Cambiar Contraseña
      </h2>
      
      <form @submit.prevent="updatePassword" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Contraseña Actual
            </label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Nueva Contraseña
            </label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Confirmar Contraseña
            </label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="loading || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword"
            class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
          >
            <i class="fas fa-key mr-2"></i>
            {{ loading ? 'Actualizando...' : 'Cambiar Contraseña' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Input de archivo oculto -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      class="hidden"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'

const authStore = useAuthStore()
const { toast } = useNotifications()

// State
const loading = ref(false)
const isEditing = ref(false)
const fileInput = ref<HTMLInputElement>()

const profileData = ref({
  name: '',
  email: '',
  role: '',
  phone: '',
  department: '',
  photo: '',
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
    'employee': 'Empleado'
  }
  return roles[role] || role || 'Sin rol'
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'No disponible'
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'Fecha inválida'
  }
}

const toggleEditMode = () => {
  if (!profileData.value) return
  
  if (isEditing.value) {
    // Cancelar - restaurar datos originales
    editForm.value = {
      name: profileData.value.name || '',
      email: profileData.value.email || '',
      phone: profileData.value.phone || '',
      department: profileData.value.department || ''
    }
  } else {
    // Iniciar edición - copiar datos actuales
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
    
    await userService.updateProfile(editForm.value)
    
    // Actualizar datos locales
    Object.assign(profileData.value, editForm.value)
    
    // Actualizar también el store
    if (authStore.user) {
      Object.assign(authStore.user, editForm.value)
    }
    
    isEditing.value = false
    toast('Perfil actualizado correctamente', 'success')
    
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    toast('Error al actualizar el perfil', 'error')
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
    
    // Limpiar formulario
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    toast('Contraseña actualizada correctamente', 'success')
    
  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    toast('Error al cambiar la contraseña', 'error')
  } finally {
    loading.value = false
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    loading.value = true
    
    const formData = new FormData()
    formData.append('photo', file)
    
    const response = await userService.updatePhoto(formData)
    
    // Actualizar foto
    profileData.value.photo = response.photo
    
    if (authStore.user) {
      authStore.user.photo = response.photo
    }
    
    toast('Foto actualizada correctamente', 'success')
    
  } catch (error) {
    console.error('Error al subir foto:', error)
    toast('Error al subir la foto', 'error')
  } finally {
    loading.value = false
    // Limpiar input
    if (target) target.value = ''
  }
}

const loadProfile = async () => {
  try {
    loading.value = true
    
    // Inicializar inmediatamente con datos del store si están disponibles
    if (authStore.user) {
      profileData.value = {
        name: authStore.user.name || '',
        email: authStore.user.email || '',
        role: authStore.user.role || '',
        phone: authStore.user.phone || '',
        department: authStore.user.department || '',
        photo: authStore.user.photo || '',
        createdAt: authStore.user.createdAt || '',
        updatedAt: authStore.user.updatedAt || ''
      }
    }
    
    // Intentar cargar datos actualizados del servidor
    try {
      const profile = await userService.getProfile()
      profileData.value = profile
    } catch (serverError) {
      console.error('Error al cargar perfil del servidor:', serverError)
      // Si falla la carga del servidor pero tenemos datos del store, los usamos
      if (!profileData.value.name && authStore.user) {
        profileData.value = {
          name: authStore.user.name || '',
          email: authStore.user.email || '',
          role: authStore.user.role || '',
          phone: authStore.user.phone || '',
          department: authStore.user.department || '',
          photo: authStore.user.photo || '',
          createdAt: authStore.user.createdAt || '',
          updatedAt: authStore.user.updatedAt || ''
        }
      }
    }
    
  } catch (error) {
    console.error('Error general al cargar perfil:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>
