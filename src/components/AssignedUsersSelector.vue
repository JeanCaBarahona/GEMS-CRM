<template>
  <div class="space-y-2 flex flex-col h-full">
    <!-- Selected Users Chips -->
    <div v-if="selectedUsers.length > 0" class="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100 min-h-[36px] max-h-[84px] overflow-y-auto shrink-0 custom-scrollbar shadow-inner">
      <span v-for="user in selectedUsers" :key="user?._id"
        class="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-md shadow-sm group transition-all hover:border-primary-300"
      >
        <div v-if="user?.photo || user?.avatar" class="w-4 h-4 rounded-full overflow-hidden flex-shrink-0 border border-slate-100">
           <img :src="user.photo || user.avatar" class="w-full h-full object-cover" />
        </div>
        <div v-else class="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center text-[8px] font-black text-primary-600 flex-shrink-0">
          {{ user?.name?.charAt(0) || '?' }}
        </div>
        <span class="text-[11px] font-bold text-slate-700 whitespace-nowrap">{{ user?.name || 'Usuario' }}</span>
        <button
          type="button"
          @click="removeAssigned(user?._id!)"
          class="text-slate-300 hover:text-red-500 transition-colors"
          title="Eliminar"
        >
          <i class="fas fa-times-circle text-[10px]"></i>
        </button>
      </span>
    </div>

    <!-- Search Input -->
    <div class="relative group shrink-0">
      <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors text-[10px]"></i>
      <input
        v-model="searchUser"
        type="text"
        placeholder="Buscar miembro..."
        class="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all text-xs font-medium"
      />
    </div>

    <!-- Department Filter -->
    <div v-if="availableDepartments.length > 0" class="flex flex-wrap items-center gap-1 shrink-0">
      <button
        type="button"
        @click="selectedDepartment = ''"
        class="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors border"
        :class="selectedDepartment === '' ? 'bg-primary-500 text-white border-primary-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'"
      >
        Todos
      </button>
      <button
        v-for="dept in availableDepartments"
        :key="dept"
        type="button"
        @click="selectedDepartment = dept"
        class="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors border"
        :class="selectedDepartment === dept ? 'bg-primary-500 text-white border-primary-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'"
      >
        {{ dept }}
      </button>
    </div>

    <!-- Users List -->
    <div class="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar min-h-0">
      <button
        v-for="member in filteredMembers"
        :key="member._id"
        type="button"
        @click="typeof member._id === 'string' && toggleAssigned(member._id)"
        class="flex items-center w-full px-2 py-1.5 rounded-lg transition-all border group"
        :class="isUserSelected(member._id!)
          ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-sm ring-1 ring-primary-200/50'
          : 'bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200 hover:text-slate-900'"
      >
        <div class="w-6 h-6 rounded-full overflow-hidden mr-2 border border-slate-100 shadow-sm flex-shrink-0">
          <img v-if="member.photo || member.avatar" :src="member.photo || member.avatar" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
            {{ member.name.charAt(0) }}
          </div>
        </div>
        <div class="flex flex-col items-start min-w-0">
          <span class="text-[12px] font-bold truncate">{{ member.name }}</span>
          <span class="text-[9px] text-slate-400 font-medium truncate uppercase tracking-wider">{{ member.department || member.role || 'Miembro' }}</span>
        </div>
        <div class="ml-auto flex-shrink-0 pl-2">
          <div v-if="isUserSelected(member._id!)" class="w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center shadow-sm">
             <i class="fas fa-check text-[8px] text-white"></i>
          </div>
          <div v-else class="w-4 h-4 border-2 border-slate-200 rounded-full group-hover:border-primary-300 transition-colors"></div>
        </div>
      </button>

      <div v-if="filteredMembers.length === 0" class="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
        <i class="fas fa-user-slash text-slate-300 mb-1 text-sm"></i>
        <p class="text-[11px] text-slate-500 font-medium">No se encontraron miembros</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Exponer selectedUsers al template
import { ref, computed } from 'vue'
import type { TeamMember } from '../types'

const props = defineProps<{
  modelValue: string[]
  teamMembers: TeamMember[]
}>()
const emit = defineEmits(['update:modelValue'])

const searchUser = ref('')
const selectedDepartment = ref('')

const availableDepartments = computed(() => {
  const depts = new Set<string>()
  props.teamMembers.forEach(m => {
    const d = m.department || m.role
    if (d) depts.add(d)
  })
  return Array.from(depts).sort()
})

const addAssigned = (id: string) => {
  if (!props.modelValue.includes(id)) {
    emit('update:modelValue', [...props.modelValue, id])
  }
}
const removeAssigned = (id: string) => {
  emit('update:modelValue', props.modelValue.filter(uid => uid !== id))
}
const filteredMembers = computed(() => {
  let result = props.teamMembers
  
  if (selectedDepartment.value) {
    result = result.filter(m => (m.department || m.role) === selectedDepartment.value)
  }
  
  if (searchUser.value) {
    const search = searchUser.value.toLowerCase()
    result = result.filter(u =>
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    )
  }
  
  return result
})
const isUserSelected = (id: string) => {
  return props.modelValue.includes(id)
}
const toggleAssigned = (id: string) => {
  if (isUserSelected(id)) {
    removeAssigned(id)
  } else {
    addAssigned(id)
  }
}
const selectedUsers = computed(() => props.modelValue.map(id => props.teamMembers.find(u => u._id === id)).filter(Boolean))
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #CBD5E1;
}
</style>
