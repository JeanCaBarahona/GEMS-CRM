<template>
  <div 
    class="task-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
    :class="cardClasses"
    @click="$emit('click', task)"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-2">
      <div class="flex items-center space-x-2 flex-1 min-w-0">
        <span class="task-type-icon flex-shrink-0" :class="typeIconClass">
          <component :is="typeIcon" class="w-4 h-4" />
        </span>
        <h3 class="text-sm font-semibold text-gray-900 truncate">{{ task.title }}</h3>
      </div>
      <span 
        class="priority-badge flex-shrink-0 ml-2 px-2 py-1 text-xs font-medium rounded"
        :class="priorityClass"
      >
        {{ priorityLabel }}
      </span>
    </div>

    <!-- Description -->
    <p v-if="task.description" class="text-xs text-gray-600 mb-3 line-clamp-2">
      {{ task.description }}
    </p>

    <!-- Tags -->
    <div v-if="task.tags && task.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
      <span 
        v-for="tag in task.tags.slice(0, 3)" 
        :key="tag"
        class="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
      >
        {{ tag }}
      </span>
      <span v-if="task.tags.length > 3" class="px-2 py-1 text-xs text-gray-500">
        +{{ task.tags.length - 3 }}
      </span>
    </div>

    <!-- GitHub Info -->
    <div v-if="task.github?.branch" class="flex items-center space-x-2 mb-3 text-xs text-gray-600">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
      </svg>
      <span class="truncate">{{ task.github.branch }}</span>
      <span v-if="task.github.pullRequest" 
        class="px-2 py-0.5 rounded text-xs font-medium"
        :class="prStatusClass"
      >
        PR #{{ task.github.pullRequest.number }}
      </span>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between">
      <!-- Assignee -->
      <div v-if="task.assignedTo" class="flex items-center space-x-2">
        <PersonAvatar :name="task.assignedTo.name" :photo="task.assignedTo.photo" class="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-medium" />
        <span class="text-xs text-gray-600 truncate max-w-[100px]">
          {{ task.assignedTo.name }}
        </span>
      </div>
      <div v-else class="text-xs text-gray-400">Sin asignar</div>

      <!-- Metadata -->
      <div class="flex items-center space-x-3 text-xs text-gray-500">
        <!-- Comments -->
        <div v-if="task.comments && task.comments.length > 0" class="flex items-center space-x-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{{ task.comments.length }}</span>
        </div>
        
        <!-- Attachments -->
        <div v-if="task.attachments && task.attachments.length > 0" class="flex items-center space-x-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span>{{ task.attachments.length }}</span>
        </div>

        <!-- Estimated hours -->
        <div v-if="task.estimatedHours" class="flex items-center space-x-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ task.estimatedHours }}h</span>
        </div>
      </div>
    </div>

    <!-- Blocked indicator -->
    <div v-if="task.status === 'blocked'" class="mt-2 flex items-center space-x-1 text-xs text-red-600">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
      </svg>
      <span>Bloqueada</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import PersonAvatar from '../ui/PersonAvatar.vue'
import { computed } from 'vue'
import type { Task } from '@/stores/tasks'

interface Props {
  task: Task
}

const props = defineProps<Props>()

defineEmits<{
  click: [task: Task]
}>()

const typeIcon = computed(() => {
  switch (props.task.type) {
    case 'bug': return 'svg'
    case 'feature': return 'svg'
    case 'user-story': return 'svg'
    case 'epic': return 'svg'
    default: return 'svg'
  }
})

const typeIconClass = computed(() => {
  const classes: Record<string, string> = {
    'task': 'text-blue-600',
    'bug': 'text-red-600',
    'feature': 'text-purple-600',
    'user-story': 'text-green-600',
    'epic': 'text-orange-600'
  }
  return classes[props.task.type] || 'text-gray-600'
})

const priorityClass = computed(() => {
  const classes: Record<string, string> = {
    'low': 'bg-gray-100 text-gray-700',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'critical': 'bg-red-100 text-red-800'
  }
  return classes[props.task.priority] || 'bg-gray-100 text-gray-700'
})

const priorityLabel = computed(() => {
  const labels: Record<string, string> = {
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta',
    'critical': 'Crítica'
  }
  return labels[props.task.priority] || props.task.priority
})

const cardClasses = computed(() => {
  if (props.task.status === 'blocked') return 'border-red-300 bg-red-50'
  if (props.task.priority === 'critical') return 'border-red-200'
  return ''
})

const prStatusClass = computed(() => {
  const status = props.task.github?.pullRequest?.status
  const classes: Record<string, string> = {
    'open': 'bg-green-100 text-green-800',
    'closed': 'bg-gray-100 text-gray-800',
    'merged': 'bg-purple-100 text-purple-800'
  }
  return classes[status || 'open']
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
