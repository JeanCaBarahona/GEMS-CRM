<template>
  <div class="h-[100dvh] max-h-[100dvh] bg-transparent text-white">
    <div class="h-[100dvh] p-4 sm:p-6">
      <div class="grid grid-cols-1 lg:grid-cols-[320px,1fr] h-full rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm overflow-hidden">
      <!-- Sidebar (desktop) -->
  <aside class="hidden lg:flex flex-col border-r border-white/10 bg-white/5 backdrop-blur-sm">
        <div class="px-4 py-3 border-b border-white/10">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">Conversaciones</h2>
            <div class="flex items-center gap-2">
              <div v-if="!chatStore.isConnected" class="text-xs text-yellow-300">Conectando…</div>
              <div v-else class="text-xs text-emerald-300">Conectado</div>
              <button @click="showCreateRoom = true" class="p-2 rounded-md border border-white/10 bg-white/5 hover:bg-white/10" title="Nuevo chat">
                <PlusIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <div v-if="chatStore.isLoading" class="py-10 text-center text-gray-400">
            Cargando…
          </div>

          <div v-else-if="chatStore.chatRooms.length === 0" class="py-10 text-center">
            <ChatBubbleLeftEllipsisIcon class="w-12 h-12 text-purple-400/70 mx-auto mb-2" />
            <p class="text-sm text-gray-300 mb-3">No hay conversaciones</p>
            <button @click="showCreateRoom = true" class="text-sm rounded-md px-3 py-1.5 bg-white/10 border border-white/10 hover:bg-white/15">Crear conversación</button>
          </div>

          <ul v-else class="space-y-2">
            <li v-for="room in chatStore.chatRooms" :key="room._id">
              <button
                @click="selectRoom(room)"
                class="w-full text-left flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors"
                :class="[
                  currentRoom?._id === room._id
                    ? 'bg-white/10 border-purple-400/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                ]"
              >
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  :class="room.type === 'direct' ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : room.type === 'team' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'"
                >
                  <UserIcon v-if="room.type === 'direct'" class="w-5 h-5" />
                  <UsersIcon v-else-if="room.type === 'team'" class="w-5 h-5" />
                  <UserGroupIcon v-else class="w-5 h-5" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <p class="font-medium truncate">{{ room.name }}</p>
                    <span class="text-xs text-gray-400">{{ formatTime(room.lastActivity) }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-xs text-gray-400 whitespace-nowrap">👥 {{ room.participants.length }} · <span :class="onlineCount(room) > 0 ? 'text-emerald-300' : 'text-gray-400'">● {{ onlineCount(room) }}</span></p>
                    <span v-if="getUnreadCount(room._id) > 0" class="text-[10px] rounded-full bg-pink-600 px-2 py-0.5 notification-pulse">{{ getUnreadCount(room._id) }}</span>
                  </div>
                </div>
                <button
                  v-if="authStore.isAdmin"
                  @click.stop="confirmDeleteRoom(room._id)"
                  class="ml-1 p-2 rounded-md hover:bg-red-500/10 text-red-300"
                  title="Eliminar chat"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </button>
            </li>
          </ul>
        </div>
      </aside>

    <!-- Main panel -->
  <section class="flex flex-col min-h-0 bg-white/0">
        <!-- Room header or empty state header -->
  <div class="px-4 sm:px-6 py-3 border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div v-if="currentRoom" class="flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                :class="currentRoom.type === 'direct' ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : currentRoom.type === 'team' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'"
              >
                <UserIcon v-if="currentRoom.type === 'direct'" class="w-6 h-6" />
                <UsersIcon v-else-if="currentRoom.type === 'team'" class="w-6 h-6" />
                <UserGroupIcon v-else class="w-6 h-6" />
              </div>
              <div class="min-w-0">
                <h3 class="font-semibold truncate">{{ currentRoom.name }}</h3>
                <div class="text-xs text-gray-400 flex items-center gap-2">
                  <span class="whitespace-nowrap">👥 {{ currentRoom.participants.length }}</span>
                  <span class="whitespace-nowrap" :class="onlineCount(currentRoom) > 0 ? 'text-emerald-300' : 'text-gray-400'">● {{ onlineCount(currentRoom) }}</span>
                  <span v-if="typingUsers.length > 0" class="ml-2 text-purple-300">✍️ {{ typingUsers.join(', ') }} escribiendo…</span>
                </div>
              </div>
            </div>
            <button class="p-2 rounded-md hover:bg-white/10" @click="showRoomInfo = true" title="Información del chat">
              <InformationCircleIcon class="w-6 h-6" />
            </button>
          </div>
          <div v-else class="flex items-center justify-between">
            <div class="text-sm text-gray-300">Selecciona una conversación</div>
            <button class="lg:hidden p-2 rounded-md hover:bg-white/10" @click="showRoomsMobile = true" title="Abrir conversaciones">
              <ChatBubbleLeftRightIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

  <!-- Messages -->
        <div
          class="relative flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar"
          ref="messagesContainer"
          @scroll="onMessagesScroll"
        >
          <div v-if="!currentRoom" class="h-full grid place-items-center">
            <div class="text-center">
              <ChatBubbleLeftEllipsisIcon class="w-16 h-16 text-purple-400/70 mx-auto mb-3" />
              <p class="text-gray-300">Elige un chat para empezar</p>
            </div>
          </div>

          <div v-else>
            <!-- Loading messages -->
            <div v-if="chatStore.isLoading" class="py-10 text-center text-gray-400">Cargando mensajes…</div>

            <!-- Empty state -->
            <div v-else-if="currentMessages.length === 0" class="py-10 text-center text-gray-300">Sin mensajes aún</div>

            <!-- Messages list -->
            <div v-else class="space-y-4">
        <div
                v-for="message in currentMessages"
                :key="message._id"
                class="flex"
                :class="isOwnMessage(message) ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[80%] rounded-xl border px-4 py-3"
          :class="isOwnMessage(message) ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-pink-500 text-white' : 'bg-slate-800 border-slate-700 text-white'"
                >
                  <div v-if="!isOwnMessage(message)" class="mb-1 text-xs text-purple-200 font-medium">
                    {{ message.sender.name }}
                  </div>
                  <div class="whitespace-pre-wrap break-words">{{ message.content }}</div>
          <div v-if="message.attachments && message.attachments.length" class="mt-3 space-y-2">
                    <a
                      v-for="a in message.attachments"
                      :key="a.filename"
                      :href="a.url"
                      target="_blank"
            class="flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-sm"
                    >
                      <DocumentIcon class="w-5 h-5" />
                      <span class="truncate">{{ a.originalname }}</span>
                      <span class="text-xs text-gray-400">{{ formatFileSize(a.size) }}</span>
                    </a>
                  </div>
                  <div class="mt-2 flex items-center gap-2 text-xs text-white/70">
                    <span :title="formatFullDateTime(message.createdAt)">🕒 {{ formatTimeShort(message.createdAt) }}</span>
                    <span v-if="message.edited" class="text-yellow-300">· editado</span>
                    <button
                      v-if="isOwnMessage(message)"
                      @click="startEdit(message)"
                      class="ml-2 opacity-70 hover:opacity-100 p-1 rounded hover:bg-white/10"
                      title="Editar"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Typing indicator -->
              <div v-if="typingUsers.length > 0" class="text-sm text-purple-300">✍️ {{ typingUsers.join(', ') }} escribiendo…</div>

              <!-- Pending optimistic -->
              <div
                v-for="p in (pendingMessages[currentRoom._id] || [])"
                :key="p.id"
                class="flex justify-end"
              >
                <div class="max-w-[80%] rounded-xl border px-4 py-3 bg-purple-600 border-purple-500 text-white">
                  <div class="whitespace-pre-wrap break-words">{{ p.content }}</div>
                  <div class="mt-1 text-xs text-white/70">🕒 {{ formatTimeShort(p.createdAt) }} · Enviando…</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Scroll edge overlays -->
          <div v-if="!atTop" class="pointer-events-none absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-purple-500/15 to-transparent"></div>
          <div v-if="!atBottom" class="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-pink-500/15 to-transparent"></div>

          <!-- Scroll to bottom -->
          <button
            v-if="!atBottom"
            @click="scrollToBottom"
            class="absolute bottom-4 right-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-sm shadow"
            title="Bajar al final"
          >
            <div class="flex items-center gap-2"><ArrowDownIcon class="w-5 h-5" /><span class="hidden sm:inline">Bajar</span></div>
          </button>
        </div>

        <!-- Input -->
  <div class="border-t border-white/10 bg-white/5 backdrop-blur-sm px-4 sm:px-6 py-3">
          <div v-if="editingMessage" class="mb-2 flex items-center justify-between rounded-md bg-yellow-500/10 border border-yellow-500/40 px-3 py-2 text-yellow-200">
            <div class="text-sm">✏️ Editando mensaje — Enter para guardar, Esc para cancelar</div>
            <button class="p-1 rounded hover:bg-yellow-500/20" @click="cancelEdit" title="Cancelar">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <div class="flex items-end gap-2">
            <!-- Emoji picker teleport -->
            <teleport to="body">
              <div
                v-if="showEmojiPicker"
                :style="{ position: 'fixed', top: emojiPos.top + 'px', left: emojiPos.left + 'px', zIndex: 50 }"
                class="rounded-md border border-white/10 bg-slate-900/95 p-2 shadow-xl flex flex-wrap gap-1 w-56"
                data-emoji-picker
              >
                <button v-for="e in emojis" :key="e" class="px-1 py-1 hover:bg-white/10 rounded" @click.prevent="insertEmoji(e)">{{ e }}</button>
              </div>
            </teleport>

            <div class="relative flex-1">
              <input
                ref="messageInput"
                v-model="newMessage"
                @keydown.enter.prevent="editingMessage ? saveEdit() : sendMessage()"
                @keydown.escape.prevent="cancelEdit"
                @input="handleTyping"
                :placeholder="editingMessage ? 'Editar mensaje…' : 'Escribe un mensaje…'"
                class="w-full rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm px-4 py-3 outline-none focus:border-purple-400"
              />
            </div>
            <button @click="toggleEmojiPicker" class="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10" title="Emojis">😊</button>
            <button
              @click="editingMessage ? saveEdit() : sendMessage()"
              :disabled="!newMessage.trim()"
              class="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 disabled:opacity-50"
            >
              <PaperAirplaneIcon v-if="!editingMessage" class="w-5 h-5" />
              <CheckIcon v-else class="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
      </div>
    </div>

    <!-- Mobile drawer for rooms -->
    <div v-if="showRoomsMobile" class="fixed inset-0 z-50 lg:hidden">
      <div class="absolute inset-0 bg-black/40" @click="showRoomsMobile = false"></div>
  <div class="absolute inset-y-0 left-0 w-[86%] max-w-sm bg-white/10 backdrop-blur-md border-r border-white/10 shadow-xl flex flex-col">
        <div class="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h2 class="font-semibold">Conversaciones</h2>
          <button class="p-2 rounded hover:bg-white/10" @click="showRoomsMobile = false" title="Cerrar">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <ul class="space-y-2">
            <li v-for="room in chatStore.chatRooms" :key="room._id">
              <button
                @click="selectRoom(room); showRoomsMobile = false"
                class="w-full text-left flex items-center gap-3 rounded-xl border px-3 py-3 bg-white/5 border-white/10 hover:bg-white/10"
              >
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  :class="room.type === 'direct' ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : room.type === 'team' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'"
                >
                  <UserIcon v-if="room.type === 'direct'" class="w-5 h-5" />
                  <UsersIcon v-else-if="room.type === 'team'" class="w-5 h-5" />
                  <UserGroupIcon v-else class="w-5 h-5" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <p class="font-medium truncate">{{ room.name }}</p>
                    <span class="text-xs text-gray-400">{{ formatTime(room.lastActivity) }}</span>
                  </div>
                  <p class="text-xs text-gray-400 truncate">👥 {{ room.participants.length }} participante{{ room.participants.length !== 1 ? 's' : '' }}</p>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Mobile FAB: create room -->
    <button
      class="lg:hidden fixed bottom-5 right-5 z-40 rounded-full p-4 shadow-xl bg-gradient-to-r from-purple-600 to-pink-600"
      title="Nuevo chat"
      @click="showCreateRoom = true"
    >
      <PlusIcon class="w-6 h-6" />
    </button>
    <!-- Create Room Modal -->
    <CreateRoomModal v-if="showCreateRoom" @close="showCreateRoom = false" @created="handleRoomCreated" />

    <!-- Room Info Modal -->
    <div v-if="showRoomInfo && currentRoom" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showRoomInfo = false"></div>
      <div class="relative bg-slate-900 rounded-xl border border-white/10 shadow-2xl w-full max-w-md mx-4">
        <div class="p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold">Información del chat</h3>
            <button @click="showRoomInfo = false" class="p-2 rounded hover:bg-white/10"><XMarkIcon class="w-6 h-6" /></button>
          </div>
          <div class="space-y-4 text-sm">
            <div>
              <div class="text-gray-400">Nombre</div>
              <div class="font-medium">{{ currentRoom.name }}</div>
            </div>
            <div v-if="currentRoom.description">
              <div class="text-gray-400">Descripción</div>
              <div>{{ currentRoom.description }}</div>
            </div>
            <div>
              <div class="text-gray-400">Participantes ({{ currentRoom.participants.length }})</div>
              <div class="mt-2 space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                <div v-for="p in currentRoom.participants" :key="p._id" class="flex items-center gap-3 rounded-md bg-white/5 border border-white/10 px-3 py-2">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span class="text-xs font-semibold">{{ p.name.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium truncate">{{ p.name }}</div>
                    <div class="text-xs text-gray-400 truncate">{{ p.position || p.role }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-xs text-gray-400">Creado: {{ new Date(currentRoom.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/auth';
import CreateRoomModal from '@/components/CreateRoomModal.vue';
import {
  PlusIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftEllipsisIcon,
  UserIcon,
  UsersIcon,
  UserGroupIcon,
  InformationCircleIcon,
  DocumentIcon,
  PencilIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  CheckIcon,
  TrashIcon,
  ArrowDownIcon
} from '@heroicons/vue/24/outline';
import type { ChatRoom, Message } from '@/services/chatService';
import { useNotifications } from '@/composables/useNotifications';

const chatStore = useChatStore();
const authStore = useAuthStore();
const { showError, confirmDelete } = useNotifications();

// State
const currentRoom = ref<ChatRoom | null>(null);
const newMessage = ref('');
const showCreateRoom = ref(false);
const showRoomInfo = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const messageInput = ref<HTMLElement | null>(null);
const editingMessage = ref<Message | null>(null);
const typingUsers = ref<string[]>([]);
const typingTimeout = ref<NodeJS.Timeout | null>(null);
const showEmojiPicker = ref(false);
const emojiPos = ref({ top: 0, left: 0 });
const emojis = ['😀','😂','😍','👍','🔥','✅','🙏','🚀','🎉','💡','❤️','😎','🤔','🙌','✨','🤝','📌','📣','🧠'];
const showRoomsMobile = ref(false);
// Optimistic pending messages per room
const pendingMessages = ref<Record<string, { id: string; content: string; createdAt: string }[]>>({});
// Track first-entry auto-scroll per room
const didInitialScroll = ref<Record<string, boolean>>({});
// Scroll position state
const atBottom = ref(true)
const atTop = ref(true)

// Lightweight send sound using Web Audio API
const playSendSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 660; // high beep
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    o.start(now);
    // quick decay
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    o.stop(now + 0.16);
  } catch {}
};

// Computed
const currentMessages = computed(() => {
  if (!currentRoom.value) return [];
  return chatStore.messages[currentRoom.value._id] || [];
});

// Methods
const selectRoom = async (room: ChatRoom) => {
  if (currentRoom.value?._id === room._id) return;

  currentRoom.value = room;
  // Update store's currentRoom and join socket room
  await chatStore.selectRoom(room);
  // Ensure messages are loaded (store.selectRoom already loads if needed)
  await chatStore.loadMessages(room._id);
  // One-time auto-scroll when entering a room first time in session
  if (!didInitialScroll.value[room._id]) {
    didInitialScroll.value[room._id] = true;
    scrollToBottom();
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentRoom.value) return;

  const content = newMessage.value.trim();
  const roomId = currentRoom.value._id;
  const tempId = `temp_${Date.now()}`;
  const createdAt = new Date().toISOString();
  newMessage.value = '';

  // Add optimistic pending bubble
  if (!pendingMessages.value[roomId]) pendingMessages.value[roomId] = [];
  pendingMessages.value[roomId].push({ id: tempId, content, createdAt });
  playSendSound();
  scrollToBottom();

  try {
    await chatStore.sendMessage(content);
  } catch (error) {
    console.error('Error sending message:', error);
    // Restore message on error
    newMessage.value = content;
  } finally {
    // Remove pending bubble
    const list = pendingMessages.value[roomId] || [];
    pendingMessages.value[roomId] = list.filter(m => m.id !== tempId);
    scrollToBottom();
  }
};

const startEdit = (message: Message) => {
  editingMessage.value = message;
  newMessage.value = message.content;
  nextTick(() => {
    if (messageInput.value) {
      (messageInput.value as HTMLInputElement).focus();
    }
  });
};

const saveEdit = async () => {
  if (!editingMessage.value || !newMessage.value.trim()) return;

  const id = editingMessage.value._id;
  const content = newMessage.value.trim();

  // Optimistic update: update local list immediately
  const roomId = currentRoom.value?._id;
  let previous: Message | null = null;
  if (roomId) {
    const list = chatStore.messages[roomId] || [];
    const idx = list.findIndex(m => m._id === id);
    if (idx !== -1) {
      previous = { ...list[idx] } as Message;
      list[idx] = { ...list[idx], content, edited: true, editedAt: new Date().toISOString() } as Message;
    }
  }

  try {
    await chatStore.editMessage(id, content);
    cancelEdit();
  } catch (error) {
    console.error('Error editing message:', error);
    // Rollback if failed
    if (roomId && previous) {
      const list = chatStore.messages[roomId] || [];
      const idx = list.findIndex(m => m._id === id);
      if (idx !== -1) list[idx] = previous;
    }
  }
};

const cancelEdit = () => {
  editingMessage.value = null;
  newMessage.value = '';
};

const handleTyping = () => {
  if (!currentRoom.value) return;

  chatStore.startTyping();

  // Clear previous timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }

  // Stop typing after 3 seconds of inactivity
  typingTimeout.value = setTimeout(() => {
    if (currentRoom.value) {
      chatStore.stopTyping();
    }
  }, 3000);
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      atBottom.value = true
      atTop.value = false
    }
  });
};

const onMessagesScroll = () => {
  const el = messagesContainer.value
  if (!el) return
  const threshold = 8
  atTop.value = el.scrollTop <= threshold
  atBottom.value = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold
}

const handleRoomCreated = (room: ChatRoom) => {
  showCreateRoom.value = false;
  selectRoom(room);
};

const computeEmojiPosition = () => {
  const input = messageInput.value as HTMLInputElement | null;
  if (!input) return;
  const rect = input.getBoundingClientRect();
  const panelHeight = 220; // approx
  const topAbove = rect.top - panelHeight - 8;
  const topBelow = rect.bottom + 8;
  const viewportHeight = window.innerHeight;
  const placeAbove = topAbove >= 0;
  const top = placeAbove ? topAbove : Math.min(topBelow, viewportHeight - panelHeight - 8);
  let left = rect.left; // align left to input
  const viewportWidth = window.innerWidth;
  const panelWidth = 224; // ~w-56
  if (left + panelWidth > viewportWidth - 8) {
    left = Math.max(8, viewportWidth - panelWidth - 8);
  }
  emojiPos.value = { top, left };
};

const onGlobalClick = (ev: MouseEvent) => {
  if (!showEmojiPicker.value) return;
  const inputEl = messageInput.value as HTMLInputElement | null;
  const target = ev.target as Node;
  // Close picker if clicking outside the input or the picker
  const pickerEl = document.elementFromPoint(emojiPos.value.left, emojiPos.value.top);
  const clickedInsideInput = !!inputEl && inputEl.contains(target as Node);
  const pickerContainer = document.querySelector('[data-emoji-picker]');
  const clickedInsidePicker = !!pickerContainer && pickerContainer.contains(target as Node);
  if (!clickedInsideInput && !clickedInsidePicker) {
    showEmojiPicker.value = false;
  }
};

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
  if (showEmojiPicker.value) {
    nextTick(() => {
      computeEmojiPosition();
      window.addEventListener('resize', computeEmojiPosition);
      window.addEventListener('scroll', computeEmojiPosition, true);
      document.addEventListener('mousedown', onGlobalClick);
      messageInput.value?.focus();
    });
  } else {
    window.removeEventListener('resize', computeEmojiPosition);
    window.removeEventListener('scroll', computeEmojiPosition, true);
    document.removeEventListener('mousedown', onGlobalClick);
  }
};

const insertEmoji = (emoji: string) => {
  const input = messageInput.value as HTMLInputElement | null;
  if (!input) {
    newMessage.value += emoji;
    return;
  }
  const start = (input.selectionStart ?? newMessage.value.length);
  const end = (input.selectionEnd ?? newMessage.value.length);
  const text = newMessage.value;
  newMessage.value = text.slice(0, start) + emoji + text.slice(end);
  nextTick(() => {
    const caret = start + emoji.length;
    input.setSelectionRange(caret, caret);
    input.focus();
  });
};

const confirmDeleteRoom = async (roomId: string) => {
  const result = await confirmDelete('¿Eliminar este chat? Esta acción no se puede deshacer.');
  if (!result.isConfirmed) return;
  try {
    await chatStore.deleteChatRoom(roomId);
  } catch (e) {
    console.error('Error deleting room', e);
    showError('No se pudo eliminar el chat.');
  }
};

const isOwnMessage = (message: Message) => {
  return message.sender._id === authStore.user?._id;
};

const getUnreadCount = (roomId: string) => {
  return chatStore.unreadByRoom[roomId] || 0
};

const onlineCount = (room: ChatRoom | null) => {
  if (!room) return 0
  const online = chatStore.onlineUsers || []
  return room.participants.filter(p => online.includes(p._id)).length
}

const formatTime = (date: string | Date) => {
  const messageDate = new Date(date);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'ahora';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  
  return messageDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  });
};

const formatTimeShort = (date: string | Date) => {
  const d = new Date(date)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const formatFullDateTime = (date: string | Date) => {
  const d = new Date(date)
  return d.toLocaleString('es-ES', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Watchers
watch(
  () => chatStore.typingUsers,
  (newTypingUsers) => {
    if (currentRoom.value) {
      typingUsers.value = chatStore.getTypingInRoom(currentRoom.value._id);
    }
  },
  { deep: true }
);

watch(currentRoom, () => {
  if (currentRoom.value) {
    typingUsers.value = chatStore.getTypingInRoom(currentRoom.value._id);
  }
});

// Keep pinned to bottom when messages of current room change
watch(
  () => chatStore.messages[currentRoom.value?._id || ''],
  () => {
    if (!currentRoom.value) return;
    // Only auto-scroll if user is already near the bottom
    const el = messagesContainer.value;
    if (!el) return;
    const threshold = 24;
    const isNearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
    if (isNearBottom) scrollToBottom();
  },
  { deep: true }
)

// Lifecycle
onMounted(async () => {
  if (!chatStore.isConnected) {
    await chatStore.initializeChat();
  }
  if (chatStore.chatRooms.length === 0) {
    await chatStore.loadChatRooms();
  }
  // Auto-select first room if available
  if (chatStore.chatRooms.length > 0 && !currentRoom.value) {
    await selectRoom(chatStore.chatRooms[0]);
  }
  onMessagesScroll()
});

onUnmounted(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
  window.removeEventListener('resize', computeEmojiPosition);
  window.removeEventListener('scroll', computeEmojiPosition, true);
  document.removeEventListener('mousedown', onGlobalClick);
});
</script>


<style scoped>
/* Custom Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out forwards;
}

/* Custom Scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(147, 51, 234, 0.5) transparent;
  scrollbar-gutter: stable both-edges; /* reserve gutter for harmony */
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgb(147, 51, 234), rgb(219, 39, 119));
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(147, 51, 234, 0.5);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgb(126, 34, 206), rgb(190, 24, 93));
  box-shadow: 0 0 15px rgba(147, 51, 234, 0.8);
}

/* Message hover effects */
.message-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* Gradient text animation */
.gradient-text {
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Enhanced button hover effects */
.btn-hover {
  position: relative;
  overflow: hidden;
}

.btn-hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-hover:hover::before {
  left: 100%;
}

/* Floating animation */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Pulse glow effect */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(147, 51, 234, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(147, 51, 234, 0.8), 0 0 30px rgba(219, 39, 119, 0.6);
  }
}

.pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}

/* Glass morphism effect */
.glass-morph {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Enhanced focus styles */
input:focus {
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.3), 0 0 20px rgba(147, 51, 234, 0.2);
}

/* Text shadow for better readability */
.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Notification dot animation */
@keyframes notificationPulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.notification-pulse {
  animation: notificationPulse 2s ease-in-out infinite;
}
</style>
