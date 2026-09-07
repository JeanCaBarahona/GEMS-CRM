<template>
  <div class="space-y-2 flex flex-col h-full">
    <!-- Seleccionados: tira horizontal de una sola línea (scroll, no wrap) — así -->
    <!-- nunca crece en alto sin importar cuántos haya, dejando espacio a la lista. -->
    <div
      v-if="selectedUsers.length > 0"
      class="flex items-center gap-1.5 px-1.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100 shrink-0 overflow-x-auto chips-scrollbar"
    >
      <span
        v-for="user in selectedUsers"
        :key="user?._id"
        class="inline-flex items-center gap-1 pl-1 pr-1.5 py-1 bg-white border border-slate-200 rounded-md shadow-sm shrink-0"
      >
        <div v-if="user?.photo || user?.avatar" class="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
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
          title="Quitar"
        >
          <i class="fas fa-times text-[10px]"></i>
        </button>
      </span>
    </div>

    <!-- Buscador + filtro de depto en una sola fila: el filtro es un dropdown -->
    <!-- (no botones que envuelven a varias líneas) para no robarle alto a la lista. -->
    <div class="flex items-center gap-1.5 shrink-0">
      <div class="relative group flex-1 min-w-0">
        <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors text-[10px]"></i>
        <input
          v-model="searchUser"
          type="text"
          placeholder="Buscar miembro..."
          class="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all text-xs font-medium"
        />
      </div>
      <CustomSelect
        v-if="availableDepartments.length > 0"
        v-model="selectedDepartment"
        size="sm"
        class="w-[128px] shrink-0"
        :options="[
          { value: '', label: 'Todos' },
          ...availableDepartments.map(d => ({ value: d, label: d }))
        ]"
      />
    </div>

    <!-- Lista: solo candidatos aún no asignados (los ya elegidos viven en la tira -->
    <!-- de arriba, no hace falta repetirlos aquí — se quitan con la X del chip). -->
    <div class="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar min-h-0">
      <button
        v-for="member in filteredMembers"
        :key="member._id"
        type="button"
        @click="typeof member._id === 'string' && addAssigned(member._id)"
        class="flex items-center w-full px-2 py-1.5 rounded-lg transition-all border border-transparent bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-200 hover:text-slate-900 group"
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
        <i class="fas fa-plus ml-auto flex-shrink-0 pl-2 text-slate-300 text-[10px] group-hover:text-primary-500 transition-colors"></i>
      </button>

      <div v-if="filteredMembers.length === 0" class="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
        <i class="fas fa-user-check text-slate-300 mb-1 text-sm"></i>
        <p class="text-[11px] text-slate-500 font-medium">{{ teamMembers.length === selectedUsers.length ? 'Ya asignaste a todo el equipo' : 'No se encontraron miembros' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Exponer selectedUsers al template
import { ref, computed } from 'vue'
import type { TeamMember } from '../types'
import CustomSelect from './ui/CustomSelect.vue'

const props = defineProps<{
  modelValue: string[]
  teamMembers: TeamMember[]
}>()
const emit = defineEmits(['update:modelValue'])

const searchUser = ref('')
const selectedDepartment = ref<string | number | null>('')

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
  // Los ya asignados no se repiten en la lista de candidatos.
  let result = props.teamMembers.filter(m => !isUserSelected(m._id!))

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
.chips-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.chips-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.chips-scrollbar::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
</style>
