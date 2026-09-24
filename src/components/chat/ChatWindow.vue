<template>
  <div class="flex flex-col h-full">
    <!-- Chat Header -->
    <div class="p-3 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Chat Avatar -->
        <div class="relative">
          <img
            v-if="chatAvatar"
            :src="chatAvatar"
            :alt="chatName"
            class="w-8 h-8 rounded-full object-cover"
          >
          <div
            v-else
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            :class="avatarClass"
          >
            {{ chatInitials }}
          </div>
          
          <!-- Online indicator -->
          <span
            v-if="chat.type === 'direct' && isUserOnline"
            class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"
          ></span>
        </div>
        
        <div>
          <h4 class="text-white font-medium text-sm">{{ chatName }}</h4>
          <p class="text-gray-400 text-xs">
            {{ getStatusText }}
          </p>
        </div>
      </div>
      
      <button title="Cerrar chat"
        @click="$emit('close')"
        class="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700/50"
      >
        <i class="fas fa-times text-sm"></i>
      </button>
    </div>

    <!-- Messages Area -->
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-900/20"
      @scroll="handleScroll"
    >
      <!-- Loading more messages -->
      <div 
        v-if="loadingMore" 
        class="text-center py-2"
      >
        <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
      </div>

      <!-- Messages -->
      <div
        v-for="message in messages"
        :key="message._id"
        class="flex"
        :class="message.senderId === currentUserId ? 'justify-end' : 'justify-start'"
      >
        <div 
          class="max-w-[70%] group"
          :class="message.senderId === currentUserId ? 'items-end' : 'items-start'"
        >
          <!-- Message bubble -->
          <div
            class="relative px-4 py-2 rounded-2xl break-words"
            :class="getMessageBubbleClass(message)"
          >
            <!-- Reply indicator -->
            <div
              v-if="message.replyTo"
              class="mb-2 p-2 rounded-lg bg-black/20 border-l-2 border-purple-400 text-xs"
            >
              <p class="text-gray-300 font-medium">Respondiendo a:</p>
              <p class="text-gray-400">{{ getReplyContent(message.replyTo) }}</p>
            </div>
            
            <!-- Sender name (only for group chats and if not current user) -->
            <p
              v-if="showSenderName(message)"
              class="text-xs font-medium mb-1"
              :class="message.senderId === currentUserId ? 'text-purple-200' : 'text-gray-300'"
            >
              {{ message.senderName }}
            </p>
            
            <!-- Message content -->
            <p 
              class="text-sm"
              :class="message.senderId === currentUserId ? 'text-white' : 'text-gray-100'"
            >
              {{ message.content }}
            </p>
            
            <!-- Message timestamp -->
            <div 
              class="text-xs mt-1 opacity-70"
              :class="message.senderId === currentUserId ? 'text-purple-200' : 'text-gray-400'"
            >
              {{ formatMessageTime(message.timestamp) }}
              <i 
                v-if="message.senderId === currentUserId && message.isRead"
                class="fas fa-check-double ml-1 text-blue-400"
                title="Leído"
              ></i>
              <i 
                v-else-if="message.senderId === currentUserId"
                class="fas fa-check ml-1"
                title="Enviado"
              ></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Typing indicators -->
      <div v-if="typingUsers.length > 0" class="flex justify-start">
        <div class="bg-gray-700 rounded-2xl px-4 py-2 max-w-[70%]">
          <div class="flex items-center gap-2">
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
            <span class="text-xs text-gray-400">
              {{ getTypingText }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="p-3 bg-gray-800/50 border-t border-gray-700">
      <!-- Reply indicator -->
      <div
        v-if="replyingTo"
        class="mb-2 p-2 bg-gray-700/50 rounded-lg flex items-center justify-between"
      >
        <div class="text-xs">
          <p class="text-purple-400 font-medium">Respondiendo a {{ getReplyingToName }}</p>
          <p class="text-gray-400">{{ getReplyContent(replyingTo) }}</p>
        </div>
        <button title="Cancelar respuesta"
          @click="replyingTo = null"
          class="text-gray-400 hover:text-white transition-colors p-1"
        >
          <i class="fas fa-times text-xs"></i>
        </button>
      </div>

      <!-- Input area -->
      <div class="flex items-end gap-2">
        <!-- Emoji button -->
        <button
          @click="showEmojiPicker = !showEmojiPicker"
          class="text-gray-400 hover:text-purple-400 transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
          title="Emojis"
        >
          <i class="fas fa-smile"></i>
        </button>

        <!-- Text input -->
        <div class="flex-1 relative">
          <textarea
            v-model="newMessage"
            @keydown="handleKeydown"
            @input="handleInput"
            placeholder="Escribe un mensaje..."
            class="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            rows="1"
            ref="messageInput"
          ></textarea>
        </div>

        <!-- Send button -->
        <button title="Enviar mensaje"
          @click="sendMessage"
          :disabled="!newMessage.trim()"
          class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white p-2 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { getFullPhotoUrl, getUserInitials } from '../../utils/photoUtils'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Chat, ChatMessage, TypingStatus } from '../../types/chat'

interface Props {
  chat: Chat
  messages: ChatMessage[]
  typingUsers: TypingStatus[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  sendMessage: [content: string, replyTo?: string]
  startTyping: []
  stopTyping: []
  close: []
}>()

const authStore = useAuthStore()
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLTextAreaElement>()
const newMessage = ref('')
const replyingTo = ref<string | null>(null)
const showEmojiPicker = ref(false)
const loadingMore = ref(false)
const typingTimeout = ref<NodeJS.Timeout>()

const currentUserId = computed(() => authStore.user?._id)

const chatName = computed(() => {
  if (props.chat.type === 'general') return 'General'
  if (props.chat.type === 'team') return props.chat.name || 'Equipo'
  if (props.chat.type === 'group') return props.chat.name || 'Grupo'
  if (props.chat.type === 'direct') {
    const otherUser = props.chat.participants.find(p => p._id !== currentUserId.value)
    return otherUser?.name || 'Usuario'
  }
  return 'Chat'
})

const chatAvatar = computed(() => {
  if (props.chat.type === 'direct') {
    const otherUser = props.chat.participants.find(p => p._id !== currentUserId.value)
    return otherUser?.photo ? getFullPhotoUrl(otherUser.photo) : null
  }
  return null
})

const chatInitials = computed(() => {
  if (props.chat.type === 'general') return 'G'
  if (props.chat.type === 'team') return 'T'
  if (props.chat.type === 'group') return 'G'
  if (props.chat.type === 'direct') {
    const otherUser = props.chat.participants.find(p => p._id !== currentUserId.value)
    return getUserInitials(otherUser?.name || 'U')
  }
  return 'C'
})

const avatarClass = computed(() => {
  switch (props.chat.type) {
    case 'general':
      return 'bg-gradient-to-r from-blue-500 to-blue-600'
    case 'team':
      return 'bg-gradient-to-r from-green-500 to-green-600'
    case 'group':
      return 'bg-gradient-to-r from-orange-500 to-orange-600'
    case 'direct':
      return 'bg-gradient-to-r from-purple-500 to-pink-500'
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-600'
  }
})

const isUserOnline = computed(() => {
  if (props.chat.type !== 'direct') return false
  const otherUser = props.chat.participants.find(p => p._id !== currentUserId.value)
  return otherUser?.isOnline || false
})

const getStatusText = computed(() => {
  if (props.chat.type === 'direct') {
    const otherUser = props.chat.participants.find(p => p._id !== currentUserId.value)
    if (otherUser?.isOnline) return 'En línea'
    if (otherUser?.lastSeen) {
      return `Visto ${formatDistanceToNow(new Date(otherUser.lastSeen), { locale: es, addSuffix: true })}`
    }
    return 'Desconectado'
  }
  
  if (props.chat.type === 'group' || props.chat.type === 'team') {
    const onlineCount = props.chat.participants.filter(p => p.isOnline).length
    return `${onlineCount} en línea`
  }
  
  return 'Chat general'
})

const getTypingText = computed(() => {
  const names = props.typingUsers.map(t => t.userName)
  if (names.length === 1) {
    return `${names[0]} está escribiendo...`
  } else if (names.length === 2) {
    return `${names[0]} y ${names[1]} están escribiendo...`
  } else if (names.length > 2) {
    return `Varios usuarios están escribiendo...`
  }
  return ''
})

const getReplyingToName = computed(() => {
  if (!replyingTo.value) return ''
  const message = props.messages.find(m => m._id === replyingTo.value)
  return message?.senderName || 'Usuario'
})

const showSenderName = (message: ChatMessage) => {
  return (props.chat.type === 'group' || props.chat.type === 'team' || props.chat.type === 'general') && 
         message.senderId !== currentUserId.value
}

const getMessageBubbleClass = (message: ChatMessage) => {
  const isOwn = message.senderId === currentUserId.value
  const baseClass = isOwn 
    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
    : 'bg-gray-700 text-gray-100'
  
  return `${baseClass} ${isOwn ? 'rounded-bl-lg' : 'rounded-br-lg'}`
}

const getReplyContent = (messageId: string) => {
  const message = props.messages.find(m => m._id === messageId)
  return message ? (message.content.length > 50 ? message.content.substring(0, 50) + '...' : message.content) : 'Mensaje no encontrado'
}

const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return format(date, 'HH:mm', { locale: es })
  } else if (diffInHours < 24 * 7) {
    return format(date, 'EEE HH:mm', { locale: es })
  } else {
    return format(date, 'dd/MM HH:mm', { locale: es })
  }
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  emit('sendMessage', newMessage.value.trim(), replyingTo.value || undefined)
  newMessage.value = ''
  replyingTo.value = null
  
  // Auto-resize textarea
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const handleInput = () => {
  // Auto-resize textarea
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    messageInput.value.style.height = messageInput.value.scrollHeight + 'px'
  }
  
  // Typing indicator
  emit('startTyping')
  
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
  
  typingTimeout.value = setTimeout(() => {
    emit('stopTyping')
  }, 1000)
}

const handleScroll = () => {
  if (!messagesContainer.value) return
  
  const { scrollTop } = messagesContainer.value
  
  // Load more messages when scrolled to top
  if (scrollTop === 0 && !loadingMore.value) {
    loadingMore.value = true
    // TODO: Implement load more messages
    setTimeout(() => {
      loadingMore.value = false
    }, 1000)
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Watch for new messages and scroll to bottom
watch(() => props.messages.length, () => {
  scrollToBottom()
}, { immediate: true })

// Focus input when chat is opened
watch(() => props.chat._id, () => {
  nextTick(() => {
    messageInput.value?.focus()
  })
}, { immediate: true })
</script>
