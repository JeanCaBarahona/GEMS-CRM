<template>
  <div class="min-h-screen bg-[#F8FAFC] p-8 font-['Inter',sans-serif]">
    
    <!-- Top Bar: Directory Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Directorio del Equipo</h1>
        <p class="text-sm text-slate-500 font-medium">Gestión de capital humano, roles y departamentos.</p>
      </div>
      
      <div class="flex items-center gap-4">
        <!-- Stats Mini (Integrated) -->
        <div class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
           <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
           <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ activeMembers }} Activos</span>
        </div>

        <PermissionGuard :permissions="['create-team']" :fallback="false">
          <button 
            @click="showCreateModal = true"
            class="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-violet-200 transition-all active:scale-95 flex items-center gap-2"
          >
            <i class="fas fa-plus"></i>
            Agregar Miembro
          </button>
        </PermissionGuard>
      </div>
    </div>

    <!-- Filters & Search (Premium Glass) -->
    <div class="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-6 mb-10 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-6">
       <div class="flex-1 relative group w-full">
          <i class="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors"></i>
          <input 
            v-model="searchQuery" 
            placeholder="Buscar por nombre, email o departamento..."
            class="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-violet-500/5 transition-all outline-none"
          >
       </div>
       
       <div class="flex items-center gap-4 w-full md:w-auto">
          <select v-model="selectedRole" class="px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-4 focus:ring-violet-500/5 transition-all cursor-pointer">
             <option value="">Todos los Roles</option>
             <option value="admin">Administrador</option>
             <option value="manager">Gerente</option>
             <option value="support">Soporte</option>
             <option value="development">Desarrollo</option>
             <option value="fullstack">Fullstack</option>
             <option value="employee">Empleado</option>
          </select>

          <select v-model="selectedStatus" class="px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-4 focus:ring-violet-500/5 transition-all cursor-pointer">
             <option value="">Estado</option>
             <option value="true">Activos</option>
             <option value="false">Inactivos</option>
          </select>
       </div>
    </div>

    <!-- Team List View (Premium & Clean) -->
    <div class="space-y-4">
      <div 
        v-for="member in filteredMembers" 
        :key="member._id"
        class="group bg-white border border-slate-100 rounded-[2rem] p-4 px-8 shadow-sm hover:shadow-xl hover:shadow-violet-200/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between gap-6"
      >
        <!-- Left: Basic Info & Avatar -->
        <div class="flex items-center gap-6 min-w-[300px]">
           <div class="relative">
              <UserAvatar :name="member.name" :photo="member.photo" size="lg" class="w-14 h-14 rounded-2xl shadow-inner" />
              <div v-if="member.isActive" class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
           </div>
           <div>
              <h3 class="text-sm font-black text-slate-800 tracking-tight group-hover:text-violet-600 transition-colors">{{ member.name }}</h3>
              <p class="text-[11px] font-medium text-slate-400">{{ member.email }}</p>
           </div>
        </div>

        <!-- Center: Role & Department -->
        <div class="flex items-center gap-12 flex-1">
           <div class="w-24">
              <span :class="getRoleBadgeClass(member.role)" class="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest block text-center">
                {{ getRoleDisplayName(member.role) }}
              </span>
           </div>
           
           <div class="flex-1">
              <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Departamento</p>
              <p class="text-[11px] font-bold text-slate-600 uppercase">{{ member.department || 'General' }}</p>
           </div>

           <div class="hidden xl:block">
              <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Último Acceso</p>
              <p class="text-[11px] font-bold text-slate-500">{{ formatDate(member.lastLogin) }}</p>
           </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2">
           <button 
             @click="editMember(member)" 
             class="w-10 h-10 bg-slate-50 hover:bg-violet-100 text-slate-400 hover:text-violet-600 rounded-xl flex items-center justify-center transition-all"
             title="Editar Colaborador"
           >
             <i class="fas fa-edit text-xs"></i>
           </button>
           <button 
             @click="toggleMemberStatus(member)" 
             :class="member.isActive ? 'hover:bg-rose-100 text-slate-400 hover:text-rose-600' : 'hover:bg-emerald-100 text-slate-400 hover:text-emerald-600'" 
             class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center transition-all"
             :title="member.isActive ? 'Desactivar' : 'Activar'"
           >
             <i :class="member.isActive ? 'fas fa-user-slash' : 'fas fa-user-check'" class="text-xs"></i>
           </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!filteredMembers.length" class="py-32 flex flex-col items-center justify-center text-center opacity-30">
          <div class="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
             <i class="fas fa-users-slash text-3xl"></i>
          </div>
          <h3 class="text-xl font-black text-slate-900 mb-1">Cero Resultados</h3>
          <p class="text-sm font-medium text-slate-500">No encontramos miembros que coincidan con tu búsqueda.</p>
      </div>
    </div>

    <!-- Create/Edit Modal (Premium) -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
       <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="closeModal"></div>
       <div class="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 space-y-10 animate-scale-up overflow-hidden">
          <!-- Modal Decoration -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-bl-[5rem] -mr-10 -mt-10"></div>
          
          <div class="relative">
            <h3 class="text-2xl font-black text-slate-900 tracking-tight">{{ showCreateModal ? 'Nuevo Miembro del Equipo' : 'Editar Información' }}</h3>
            <p class="text-sm text-slate-400 font-medium">Define los accesos y perfil del colaborador.</p>
          </div>
          
          <form @submit.prevent="submitForm" class="space-y-6">
             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Inputs Section -->
                <div class="space-y-6">
                   <div class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nombre Completo</label>
                      <input v-model="formData.name" required class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-violet-500/5 outline-none transition-all">
                   </div>
                   <div class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Correo Electrónico</label>
                      <input v-model="formData.email" type="email" required class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-violet-500/5 outline-none transition-all">
                   </div>
                   <div v-if="showCreateModal" class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Contraseña Temporal</label>
                      <input v-model="formData.password" type="password" required class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-violet-500/5 outline-none transition-all">
                   </div>
                </div>

                <div class="space-y-6">
                   <div class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Rol Operativo</label>
                      <select v-model="formData.role" required class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-violet-500/5">
                        <option value="admin">Administrador</option>
                        <option value="manager">Gerente</option>
                        <option value="support">Soporte GEMS</option>
                        <option value="development">Desarrollo IT</option>
                        <option value="fullstack">Fullstack Ninja</option>
                        <option value="employee">Empleado General</option>
                        <option value="viewer">Solo Lectura</option>
                      </select>
                   </div>
                   <div class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Departamento</label>
                      <input v-model="formData.department" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-violet-500/5">
                   </div>
                   <div class="space-y-2">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Teléfono Corporativo</label>
                      <input v-model="formData.phone" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-violet-500/5">
                   </div>
                </div>
             </div>

             <div class="flex gap-4 pt-10">
                <button type="button" @click="closeModal" class="flex-1 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
                <button type="submit" :disabled="isSubmitting" class="flex-[2] py-4 bg-violet-600 text-[11px] font-black text-white uppercase tracking-widest rounded-2xl shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all">
                   {{ isSubmitting ? 'Guardando...' : (showCreateModal ? 'Crear Colaborador' : 'Actualizar Información') }}
                </button>
             </div>
          </form>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useTeamStore } from '../stores'
import PermissionGuard from '../components/PermissionGuard.vue'
import UserAvatar from '../components/ui/UserAvatar.vue'
import type { TeamMember } from '../types'

const authStore = useAuthStore()
const teamStore = useTeamStore()

// State
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const isSubmitting = ref(false)
const editingMember = ref<TeamMember | null>(null)

// Form data
const formData = reactive({
  name: '',
  email: '',
  password: '',
  role: '' as TeamMember['role'],
  department: '',
  position: '',
  phone: ''
})

// Computed
const activeMembers = computed(() => teamStore.members.filter(m => m.isActive).length)

const filteredMembers = computed(() => {
  let filtered = teamStore.members

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(member => 
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.department?.toLowerCase().includes(query)
    )
  }

  if (selectedRole.value) {
    filtered = filtered.filter(member => member.role === selectedRole.value)
  }

  if (selectedStatus.value) {
    const isActive = selectedStatus.value === 'true'
    filtered = filtered.filter(member => member.isActive === isActive)
  }

  return filtered.sort((a,b) => (a.isActive === b.isActive) ? 0 : a.isActive ? -1 : 1)
})

// Methods
const formatDate = (dateString?: string) => {
  if (!dateString) return 'Nunca'
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

const getRoleDisplayName = (role: string) => {
  const roleNames: Record<string, string> = {
    admin: 'Admin',
    manager: 'Gerente',
    support: 'Soporte',
    development: 'Desarrollo',
    fullstack: 'Fullstack',
    employee: 'Staff',
    viewer: 'Viewer'
  }
  return roleNames[role] || role
}

const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    admin: 'bg-rose-500 text-white',
    manager: 'bg-orange-500 text-white',
    support: 'bg-violet-600 text-white',
    development: 'bg-indigo-600 text-white',
    fullstack: 'bg-slate-900 text-white',
    employee: 'bg-emerald-500 text-white',
    viewer: 'bg-slate-200 text-slate-500'
  }
  return classes[role] || classes.viewer
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingMember.value = null
  Object.assign(formData, { name: '', email: '', password: '', role: '', department: '', position: '', phone: '' })
}

const editMember = (member: TeamMember) => {
  editingMember.value = member
  Object.assign(formData, {
    name: member.name,
    email: member.email,
    password: '',
    role: member.role,
    department: member.department || '',
    position: member.position || '',
    phone: member.phone || ''
  })
  showEditModal.value = true
}

const submitForm = async () => {
  try {
    isSubmitting.value = true
    if (showCreateModal.value) {
      await teamStore.createMember(formData)
    } else if (editingMember.value) {
      const { password, ...updateData } = formData
      await teamStore.updateMember(editingMember.value._id!, updateData)
    }
    closeModal()
  } catch (error: any) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}

const toggleMemberStatus = async (member: TeamMember) => {
  try {
    if (member.isActive) {
      await teamStore.deleteMember(member._id!)
    } else {
      await teamStore.activateMember(member._id!)
    }
  } catch (error: any) {
    console.error('Error toggling status:', error)
  }
}

onMounted(async () => {
  if (authStore.canViewTeam) {
    await teamStore.fetchTeam()
  }
})
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

@keyframes scale-up {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
