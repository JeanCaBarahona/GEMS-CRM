<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      @click="$emit('close')"
    ></div>
    
    <!-- Modal -->
    <div class="relative bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 w-full max-w-md mx-4">
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-2xl">
        <div class="flex items-center justify-between">
          <h3 class="text-white font-semibold text-lg">Nuevo Chat</h3>
          <button title="Cerrar"
            @click="$emit('close')"
            class="text-white hover:text-purple-200 transition-colors p-1 rounded hover:bg-white/10"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-4">
        <!-- Chat Type Tabs -->
        <div class="flex rounded-xl bg-gray-800/50 p-1 mb-4">
          <button
            @click="activeTab = 'direct'"
            class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            :class="activeTab === 'direct' 
              ? 'bg-purple-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
          >
            <i class="fas fa-user mr-2"></i>
            Directo
          </button>
          <button
            @click="activeTab = 'group'"
            class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            :class="activeTab === 'group' 
              ? 'bg-purple-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'"
          >
            <i class="fas fa-users mr-2"></i>
            Grupo
          </button>
        </div>
        
        <!-- Direct Chat -->
        <div v-if="activeTab === 'direct'" class="space-y-4">
          <!-- Search -->
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar usuarios..."
              class="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
          
          <!-- Users List -->
          <div class="max-h-64 overflow-y-auto space-y-2">
            <div
              v-for="user in filteredUsers"
              :key="user._id"
              @click="createDirectChat(user._id)"
              class="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-700/50 cursor-pointer transition-colors group"
            >
              <!-- User Avatar -->
              <div class="relative">
                <img
                  v-if="user.photo"
                  :src="getFullPhotoUrl(user.photo)"
                  :alt="user.name"
                  class="w-10 h-10 rounded-full object-cover"
                >
                <div
                  v-else
                  class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold"
                >
                  {{ getUserInitials(user.name) }}
                </div>
                
                <!-- Online indicator -->
                <span
                  v-if="user.isOnline"
                  class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"
                ></span>
              </div>
              
              <!-- User Info -->
              <div class="flex-1">
                <h4 class="text-white font-medium group-hover:text-purple-300 transition-colors">
                  {{ user.name }}
                </h4>
                <p class="text-gray-400 text-sm">{{ user.email }}</p>
              </div>
              
              <!-- Online status -->
              <div class="text-xs">
                <span 
                  class="px-2 py-1 rounded-full"
                  :class="user.isOnline 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'"
                >
                  {{ user.isOnline ? 'En línea' : 'Desconectado' }}
                </span>
              </div>
            </div>
            
            <!-- No users found -->
            <div v-if="filteredUsers.length === 0" class="text-center py-8">
              <i class="fas fa-user-slash text-3xl text-gray-500 mb-3"></i>
              <p class="text-gray-400">No se encontraron usuarios</p>
            </div>
          </div>
        </div>
        
        <!-- Group Chat -->
        <div v-else-if="activeTab === 'group'" class="space-y-4">
          <!-- Group Info -->
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Nombre del grupo
              </label>
              <input
                v-model="groupName"
                type="text"
                placeholder="Ej: Equipo de Marketing"
                class="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                v-model="groupDescription"
                placeholder="Describe el propósito del grupo..."
                class="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows="2"
              ></textarea>
            </div>
          </div>
          
          <!-- Search Members -->
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar usuarios para agregar..."
              class="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
          
          <!-- Selected Members -->
          <div v-if="selectedMembers.length > 0" class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              Miembros seleccionados ({{ selectedMembers.length }})
            </label>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="member in selectedMembers"
                :key="member._id"
                class="flex items-center gap-2 bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm"
              >
                <img
                  v-if="member.photo"
                  :src="getFullPhotoUrl(member.photo)"
                  :alt="member.name"
                  class="w-5 h-5 rounded-full object-cover"
                >
                <div
                  v-else
                  class="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                >
                  {{ getUserInitials(member.name).substring(0, 1) }}
                </div>
                <span>{{ member.name }}</span>
                <button title="Quitar miembro"
                  @click="removeMember(member._id)"
                  class="text-purple-300 hover:text-white transition-colors"
                >
                  <i class="fas fa-times text-xs"></i>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Available Members -->
          <div class="max-h-48 overflow-y-auto space-y-2">
            <div
              v-for="user in availableUsers"
              :key="user._id"
              @click="toggleMember(user)"
              class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
              :class="isSelected(user._id) 
                ? 'bg-purple-600/20 border border-purple-500/50' 
                : 'bg-gray-800/30 hover:bg-gray-700/50 border border-transparent'"
            >
              <!-- User Avatar -->
              <div class="relative">
                <img
                  v-if="user.photo"
                  :src="getFullPhotoUrl(user.photo)"
                  :alt="user.name"
                  class="w-8 h-8 rounded-full object-cover"
                >
                <div
                  v-else
                  class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold"
                >
                  {{ getUserInitials(user.name) }}
                </div>
                
                <!-- Online indicator -->
                <span
                  v-if="user.isOnline"
                  class="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-gray-900"
                ></span>
              </div>
              
              <!-- User Info -->
              <div class="flex-1">
                <h4 class="text-white text-sm font-medium">{{ user.name }}</h4>
                <p class="text-gray-400 text-xs">{{ user.email }}</p>
              </div>
              
              <!-- Selection indicator -->
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                :class="isSelected(user._id) 
                  ? 'border-purple-500 bg-purple-500' 
                  : 'border-gray-500'"
              >
                <i 
                  v-if="isSelected(user._id)"
                  class="fas fa-check text-white text-xs"
                ></i>
              </div>
            </div>
          </div>
          
          <!-- Create Group Button -->
          <button
            @click="createGroup"
            :disabled="!canCreateGroup"
            class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
          >
            <i class="fas fa-users mr-2"></i>
            Crear Grupo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getFullPhotoUrl, getUserInitials } from '../../utils/photoUtils'
import type { ChatUser } from '../../types/chat'

interface Props {
  users: ChatUser[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  createDirect: [userId: string]
  createGroup: [name: string, description: string, participantIds: string[]]
}>()

const activeTab = ref<'direct' | 'group'>('direct')
const searchTerm = ref('')
const groupName = ref('')
const groupDescription = ref('')
const selectedMembers = ref<ChatUser[]>([])

const filteredUsers = computed(() => {
  return props.users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

const availableUsers = computed(() => {
  return filteredUsers.value.filter(user => !isSelected(user._id))
})

const canCreateGroup = computed(() => {
  return groupName.value.trim() && selectedMembers.value.length > 0
})

const createDirectChat = (userId: string) => {
  emit('createDirect', userId)
}

const createGroup = () => {
  if (canCreateGroup.value) {
    const participantIds = selectedMembers.value.map(member => member._id)
    emit('createGroup', groupName.value.trim(), groupDescription.value.trim(), participantIds)
  }
}

const toggleMember = (user: ChatUser) => {
  const index = selectedMembers.value.findIndex(member => member._id === user._id)
  if (index === -1) {
    selectedMembers.value.push(user)
  } else {
    selectedMembers.value.splice(index, 1)
  }
}

const removeMember = (userId: string) => {
  const index = selectedMembers.value.findIndex(member => member._id === userId)
  if (index !== -1) {
    selectedMembers.value.splice(index, 1)
  }
}

const isSelected = (userId: string) => {
  return selectedMembers.value.some(member => member._id === userId)
}
</script>
