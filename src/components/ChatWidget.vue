<template>
  <div class="fixed bottom-4 right-4 z-50">
    <!-- Chat Toggle Button -->
    <button
      v-if="!isOpen"
      @click="toggleChat"
      class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
    >
      <ChatBubbleLeftRightIcon class="w-6 h-6" />
      <span
        v-if="chatStore.getUnreadCount > 0"
        class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
      >
        {{ chatStore.getUnreadCount > 99 ? '99+' : chatStore.getUnreadCount }}
      </span>
    </button>

    <!-- Chat Widget -->
    <div
      v-if="isOpen"
      class="bg-gradient-to-br from-dark-800/95 to-dark-900/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl w-96 h-[500px] flex flex-col"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-xl flex items-center justify-between">
        <div class="flex items-center">
          <ChatBubbleLeftRightIcon class="w-6 h-6 mr-2" />
          <h3 class="font-semibold">
            {{ currentRoom ? currentRoom.name : 'Chat Interno' }}
          </h3>
        </div>
        <div class="flex items-center space-x-2">
          <button
            v-if="!currentRoom"
            @click="showCreateRoom = true"
            class="p-1 hover:bg-white/20 rounded"
            title="Crear nuevo chat"
          >
            <PlusIcon class="w-4 h-4" />
          </button>
          <button
            v-if="currentRoom"
            @click="currentRoom = null"
            class="p-1 hover:bg-white/20 rounded"
            title="Volver a lista"
          >
            <ArrowLeftIcon class="w-4 h-4" />
          </button>
          <button
            @click="toggleChat"
            class="p-1 hover:bg-white/20 rounded"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 flex flex-col min-h-0">
        <!-- Room List -->
        <div v-if="!currentRoom" class="flex-1 overflow-y-auto p-3 space-y-2">
          <div
            v-if="chatStore.isLoading"
            class="flex items-center justify-center h-full"
          >
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
          
          <div v-else-if="chatStore.chatRooms.length === 0" class="text-center text-gray-400 py-8">
            <ChatBubbleLeftRightIcon class="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay chats disponibles</p>
            <button
              @click="showCreateRoom = true"
              class="mt-2 text-purple-400 hover:text-purple-300 text-sm"
            >
              Crear el primer chat
            </button>
          </div>

          <div v-else>
            <div
              v-for="room in chatStore.chatRooms"
              :key="room._id"
              @click="selectRoom(room)"
              class="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center">
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                      :class="room.type === 'direct' ? 'bg-green-500' : room.type === 'team' ? 'bg-blue-500' : 'bg-purple-500'"
                    >
                      <UserIcon v-if="room.type === 'direct'" class="w-4 h-4 text-white" />
                      <UsersIcon v-else-if="room.type === 'team'" class="w-4 h-4 text-white" />
                      <UserGroupIcon v-else class="w-4 h-4 text-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-medium text-white truncate">{{ room.name }}</h4>
                      <p class="text-xs text-gray-400 truncate">
                        {{ room.participants.length }} miembro{{ room.participants.length !== 1 ? 's' : '' }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="text-xs text-gray-400">
                  {{ formatTime(room.lastActivity) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Messages -->
        <div v-else class="flex-1 flex flex-col min-h-0">
          <!-- Messages Container -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-3 space-y-3">
            <div
              v-if="chatStore.isLoading"
              class="flex items-center justify-center h-full"
            >
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>

            <div v-else-if="currentMessages.length === 0" class="text-center text-gray-400 py-8">
              <ChatBubbleLeftEllipsisIcon class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay mensajes aún</p>
              <p class="text-xs">¡Inicia la conversación!</p>
            </div>

            <div v-else>
              <div
                v-for="message in currentMessages"
                :key="message._id"
                class="flex"
                :class="isOwnMessage(message) ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[70%] rounded-lg p-3"
                  :class="isOwnMessage(message) 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                    : 'bg-white/10 border border-white/20 text-white'"
                >
                  <!-- Reply to message -->
                  <div
                    v-if="message.replyTo"
                    class="mb-2 p-2 rounded border-l-2"
                    :class="isOwnMessage(message) ? 'border-white/30 bg-black/20' : 'border-purple-500/50 bg-purple-500/10'"
                  >
                    <p class="text-xs opacity-75">{{ message.replyTo.sender.name }}</p>
                    <p class="text-xs">{{ message.replyTo.content }}</p>
                  </div>

                  <!-- Message content -->
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div v-if="!isOwnMessage(message)" class="flex items-center mb-1">
                        <span class="text-xs font-medium opacity-75">{{ message.sender.name }}</span>
                      </div>
                      <p class="text-sm break-words">{{ message.content }}</p>
                      
                      <!-- Attachments -->
                      <div v-if="message.attachments.length > 0" class="mt-2 space-y-1">
                        <div
                          v-for="attachment in message.attachments"
                          :key="attachment.filename"
                          class="flex items-center p-2 rounded bg-black/20 text-xs"
                        >
                          <DocumentIcon class="w-4 h-4 mr-2" />
                          <a
                            :href="attachment.url"
                            target="_blank"
                            class="hover:underline truncate"
                          >
                            {{ attachment.originalname }}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Message time and status -->
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs opacity-60">{{ formatTime(message.createdAt) }}</span>
                    <div class="flex items-center space-x-1">
                      <span v-if="message.edited" class="text-xs opacity-60">(editado)</span>
                      <!-- Message actions for own messages -->
                      <button
                        v-if="isOwnMessage(message) && !message.edited"
                        @click="startEdit(message)"
                        class="opacity-60 hover:opacity-100"
                      >
                        <PencilIcon class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Typing indicator -->
              <div v-if="typingUsers.length > 0" class="flex justify-start">
                <div class="bg-white/10 rounded-lg p-3 max-w-[70%]">
                  <div class="flex items-center space-x-2">
                    <div class="flex space-x-1">
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                    <span class="text-xs text-gray-400">
                      {{ typingUsers.join(', ') }} está{{ typingUsers.length > 1 ? 'n' : '' }} escribiendo...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="border-t border-white/10 p-3">
            <!-- Edit mode -->
            <div v-if="editingMessage" class="mb-2 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded">
              <div class="flex items-center justify-between">
                <span class="text-xs text-yellow-400">Editando mensaje</span>
                <button @click="cancelEdit" class="text-yellow-400 hover:text-yellow-300">
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="flex items-end space-x-2">
              <input
                ref="messageInput"
                v-model="newMessage"
                @keydown.enter="sendMessage"
                @keydown.escape="cancelEdit"
                @input="handleTyping"
                :placeholder="editingMessage ? 'Editar mensaje...' : 'Escribe un mensaje...'"
                class="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <button
                @click="editingMessage ? saveEdit() : sendMessage()"
                :disabled="!newMessage.trim()"
                class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                <PaperAirplaneIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Room Modal -->
    <CreateRoomModal
      v-if="showCreateRoom"
      @close="showCreateRoom = false"
      @created="handleRoomCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { onMounted, onUnmounted } from 'vue'
import { useChatStore } from '../stores/chatStore'
import { useAuthStore } from '../stores/auth'
import CreateRoomModal from './CreateRoomModal.vue'
import type { ChatRoom, Message } from '../services/chatService'
import { useNotifications } from '../composables/useNotifications'
import {
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftEllipsisIcon,
  XMarkIcon,
  PlusIcon,
  ArrowLeftIcon,
  UserIcon,
  UsersIcon,
  UserGroupIcon,
  DocumentIcon,
  PencilIcon,
  PaperAirplaneIcon
} from '@heroicons/vue/24/outline'

const chatStore = useChatStore()
const authStore = useAuthStore()
const { showError } = useNotifications()

const isOpen = ref(false)
const currentRoom = ref<ChatRoom | null>(null)
const newMessage = ref('')
const showCreateRoom = ref(false)
const editingMessage = ref<Message | null>(null)
const typingTimeout = ref<NodeJS.Timeout | null>(null)
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLInputElement>()

const currentMessages = computed(() => {
  return currentRoom.value ? chatStore.getCurrentMessages : []
})

const typingUsers = computed(() => {
  if (!currentRoom.value) return []
  return chatStore.getTypingInRoom(currentRoom.value._id).filter(name => name !== authStore.user?.name)
})

const isOwnMessage = (message: Message) => {
  return message.sender._id === authStore.user?._id
}

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value && chatStore.chatRooms.length === 0) {
    chatStore.loadChatRooms()
  }
}

const selectRoom = async (room: ChatRoom) => {
  currentRoom.value = room
  await chatStore.selectRoom(room)
  await nextTick()
  scrollToBottom()
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentRoom.value) return

  try {
    await chatStore.sendMessage(newMessage.value.trim())
    newMessage.value = ''
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
    // Show user-friendly error
    showError('Error al enviar mensaje. Intenta nuevamente.')
  }
}

const startEdit = (message: Message) => {
  editingMessage.value = message
  newMessage.value = message.content
  nextTick(() => {
    messageInput.value?.focus()
  })
}

const saveEdit = async () => {
  if (!editingMessage.value || !newMessage.value.trim()) return

  try {
    await chatStore.editMessage(editingMessage.value._id, newMessage.value.trim())
    cancelEdit()
  } catch (error) {
    console.error('Error editing message:', error)
  }
}

const cancelEdit = () => {
  editingMessage.value = null
  newMessage.value = ''
}

const handleTyping = () => {
  if (!currentRoom.value) return

  chatStore.startTyping()

  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }

  typingTimeout.value = setTimeout(() => {
    chatStore.stopTyping()
  }, 1000)
}

const handleRoomCreated = (room: ChatRoom) => {
  showCreateRoom.value = false
  selectRoom(room)
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5

  if (diffInHours < 24) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  } else if (diffInHours < 168) { // Less than a week
    return date.toLocaleDateString('es-ES', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
  }
}

// Watch for new messages to scroll to bottom
watch(currentMessages, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })

onMounted(async () => {
  await chatStore.initializeChat()
})

onUnmounted(() => {
  chatStore.disconnect()
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
})
</script>
