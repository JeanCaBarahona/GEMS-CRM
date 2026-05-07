<template>
  <div class="boards-page h-full">
    <div class="container mx-auto px-6 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white">Tableros</h1>
          <p class="mt-2 text-gray-400">Gestiona tus proyectos con tableros Kanban y Scrum</p>
        </div>
        <button
          @click="openCreateModal"
          class="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center space-x-2 shadow-lg"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Tablero</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p class="mt-4 text-gray-400">Cargando tableros...</p>
        </div>
      </div>

      <!-- Boards Grid -->
      <div v-else-if="boards.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="board in boards"
          :key="board._id"
          @click="openBoard(board._id)"
          class="board-card bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-purple-500/20 p-6 hover:border-purple-500/50"
        >
          <!-- Board Type Badge -->
          <div class="flex items-center justify-between mb-4">
            <span 
              class="px-3 py-1 text-xs font-medium rounded-full"
              :class="getBoardTypeClass(board.type)"
            >
              {{ getBoardTypeLabel(board.type) }}
            </span>
            <button
              @click.stop="openBoardSettings(board)"
              class="p-1 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>

          <!-- Board Info -->
          <h3 class="text-lg font-semibold text-white mb-2">{{ board.name }}</h3>
          <p class="text-sm text-gray-400 mb-4 line-clamp-2">{{ board.description || 'Sin descripción' }}</p>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ getTaskCount(board._id) }}</div>
              <div class="text-xs text-gray-500">Tareas</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ board.members.length }}</div>
              <div class="text-xs text-gray-500">Miembros</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ board.sprints?.length || 0 }}</div>
              <div class="text-xs text-gray-500">Sprints</div>
            </div>
          </div>

          <!-- Members Avatars -->
          <div class="flex items-center space-x-2">
            <div class="flex -space-x-2">
              <div
                v-for="member in board.members.slice(0, 5)"
                :key="member.user._id"
                class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium border-2 border-white"
                :title="member.user.name"
              >
                {{ getInitials(member.user.name) }}
              </div>
              <div
                v-if="board.members.length > 5"
                class="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-medium border-2 border-white"
              >
                +{{ board.members.length - 5 }}
              </div>
            </div>

            <!-- GitHub Badge -->
            <div v-if="board.github" class="ml-auto flex items-center space-x-1 text-xs text-gray-600">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
              </svg>
              <span>Conectado</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="w-24 h-24 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="text-lg font-medium text-white mb-2">No hay tableros</h3>
        <p class="text-gray-400 mb-6">Crea tu primer tablero para comenzar a gestionar tareas</p>
        <button
          @click="openCreateModal"
          class="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-lg"
        >
          Crear Tablero
        </button>
      </div>
    </div>

    <!-- Create Board Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]" @click.self="showCreateModal = false">
      <div class="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-purple-500/20">
        <h2 class="text-xl font-bold text-white mb-4">Crear Nuevo Tablero</h2>
        
        <form @submit.prevent="createBoard">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
            <input
              v-model="newBoard.name"
              type="text"
              required
              class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Mi Proyecto"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
            <textarea
              v-model="newBoard.description"
              rows="3"
              class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Descripción del proyecto..."
            ></textarea>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-300 mb-2">Tipo de Tablero</label>
            <div class="grid grid-cols-2 gap-3">
              <label 
                class="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors"
                :class="newBoard.type === 'kanban' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'"
              >
                <input
                  v-model="newBoard.type"
                  type="radio"
                  value="kanban"
                  class="sr-only"
                />
                <div class="flex-1">
                  <div class="font-medium text-white">Kanban</div>
                  <div class="text-xs text-gray-400">Flujo continuo</div>
                </div>
              </label>

              <label 
                class="relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors"
                :class="newBoard.type === 'scrum' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'"
              >
                <input
                  v-model="newBoard.type"
                  type="radio"
                  value="scrum"
                  class="sr-only"
                />
                <div class="flex-1">
                  <div class="font-medium text-white">Scrum</div>
                  <div class="text-xs text-gray-400">Con sprints</div>
                </div>
              </label>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="!newBoard.name"
              class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Crear Tablero
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardsStore } from '@/stores/boards'
import { useNotifications } from '@/composables/useNotifications'

const router = useRouter()
const boardsStore = useBoardsStore()
const { showError } = useNotifications()

const showCreateModal = ref(false)
const newBoard = ref({
  name: '',
  description: '',
  type: 'kanban' as 'kanban' | 'scrum'
})

const boards = computed(() => boardsStore.myBoards)
const loading = computed(() => boardsStore.loading)

// Debug
function openCreateModal() {
  console.log('Opening create modal...')
  showCreateModal.value = true
  console.log('Modal state:', showCreateModal.value)
}

function getBoardTypeClass(type: string): string {
  const classes: Record<string, string> = {
    'kanban': 'bg-blue-100 text-blue-800',
    'scrum': 'bg-purple-100 text-purple-800',
    'custom': 'bg-gray-100 text-gray-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

function getBoardTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'kanban': 'Kanban',
    'scrum': 'Scrum',
    'custom': 'Personalizado'
  }
  return labels[type] || type
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

function getTaskCount(_boardId: string): number {
  // TODO: Implementar conteo real desde el store
  return 0
}

function openBoard(boardId: string): void {
  router.push(`/boards/${boardId}`)
}

function openBoardSettings(board: any): void {
  // TODO: Implementar modal de configuración
  console.log('Open board settings:', board)
}

async function createBoard(): Promise<void> {
  try {
    console.log('Creating board with data:', newBoard.value)
    const board = await boardsStore.createBoard(newBoard.value)
    console.log('Board created successfully:', board)
    showCreateModal.value = false
    newBoard.value = {
      name: '',
      description: '',
      type: 'kanban'
    }
    router.push(`/boards/${board._id}`)
  } catch (error: any) {
    console.error('Error creating board:', error)
    showError(`Error al crear tablero: ${error.response?.data?.message || error.message || 'Error desconocido'}`)
  }
}

onMounted(async () => {
  console.log('BoardsPage mounted, fetching boards...')
  try {
    await boardsStore.fetchBoards()
    console.log('Boards fetched:', boardsStore.boards)
    console.log('My boards:', boardsStore.myBoards)
  } catch (error) {
    console.error('Error fetching boards:', error)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
