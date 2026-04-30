<template>
  <div class="min-h-screen bg-[#F8FAFC] p-8 pb-24 font-['Inter',sans-serif]">
    <!-- Top Bar Controls -->
    <div class="flex flex-col md:flex-row md:items-center justify-end gap-6 mb-10">
      
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

    <!-- Department Leaders Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div
        v-for="dept in ['TI', 'Comercial', 'Marketing', 'Customer Success']"
        :key="dept"
        class="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-all"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center"
              :class="{
                'bg-indigo-50 text-indigo-500': dept === 'TI',
                'bg-emerald-50 text-emerald-500': dept === 'Comercial',
                'bg-orange-50 text-orange-500': dept === 'Marketing',
                'bg-blue-50 text-blue-500': dept === 'Customer Success'
              }"
            >
              <i :class="{
                'fas fa-laptop-code': dept === 'TI',
                'fas fa-handshake': dept === 'Comercial',
                'fas fa-bullhorn': dept === 'Marketing',
                'fas fa-headset': dept === 'Customer Success'
              }"></i>
            </div>
            <span class="text-xs font-black text-slate-700 uppercase tracking-widest">{{ dept }}</span>
          </div>
          <span class="text-[10px] font-black text-slate-400">
            {{ teamStore.members.filter(m => m.department === dept).length }} miembros
          </span>
        </div>
        <!-- Leaders -->
        <div class="space-y-2">
          <div
            v-for="leader in teamStore.members.filter(m => m.department === dept && m.departmentRole === 'leader')"
            :key="leader._id"
            class="flex items-center gap-2 p-2 bg-amber-50 border border-amber-100 rounded-xl"
          >
            <div class="w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center text-[9px] font-black text-white">
              {{ leader.name?.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[11px] font-black text-slate-700 truncate">{{ leader.name }}</p>
            </div>
            <i class="fas fa-crown text-amber-400 text-[10px]"></i>
          </div>
          <p v-if="!teamStore.members.filter(m => m.department === dept && (m as any).departmentRole === 'leader').length"
            class="text-[10px] text-slate-400 italic text-center py-1">
            Sin líder asignado
          </p>
        </div>
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
             <option v-for="role in allAvailableRoles" :key="role._id || role.name" :value="role.name">
                {{ getRoleDisplayName(role.name) }}
             </option>
          </select>

          <select v-model="selectedStatus" class="px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-4 focus:ring-violet-500/5 transition-all cursor-pointer">
             <option value="">Estado</option>
             <option value="true">Activos</option>
             <option value="false">Inactivos</option>
          </select>
       </div>
    </div>

    <!-- Team List View (Compact & Efficient) -->
    <div class="space-y-2 pb-20">
      <!-- Header de Tabla Compacta -->
      <div class="px-8 py-3 flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-2">
        <div class="min-w-[280px]">Colaborador</div>
        <div class="w-24 text-center">Rol</div>
        <div class="flex-1">Departamento</div>
        <div class="hidden xl:block w-32">Último Acceso</div>
        <div class="w-32 text-right">Acciones</div>
      </div>

      <div 
        v-for="member in filteredMembers" 
        :key="member._id"
        class="group bg-white border border-slate-100 rounded-2xl p-2 px-6 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 flex items-center justify-between gap-6"
      >
        <!-- Left: Basic Info & Avatar -->
        <div class="flex items-center gap-4 min-w-[280px]">
           <div class="relative">
              <UserAvatar :name="member.name" :photo="member.photo" size="sm" class="w-10 h-10 rounded-xl shadow-inner" />
            <div v-if="member.departmentRole === 'leader'" class="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
              <i class="fas fa-crown text-white" style="font-size: 6px"></i>
            </div>
           </div>
           <div class="min-w-0">
              <h3 class="text-xs font-bold text-slate-800 truncate">{{ member.name }}</h3>
              <p class="text-[10px] font-medium text-slate-400 truncate">{{ member.email }}</p>
           </div>
        </div>

        <!-- Center: Role & Department -->
        <div class="flex items-center gap-8 flex-1">
           <div class="w-24">
              <span :class="getRoleBadgeClass(member.role)" class="px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest block text-center">
                {{ getRoleDisplayName(member.role) }}
              </span>
           </div>
           
           <div class="flex-1">
              <p class="text-[10px] font-bold text-slate-600 uppercase truncate">{{ member.department || 'General' }}</p>
           </div>

           <div class="hidden xl:block w-32">
              <p class="text-[10px] font-bold text-slate-500">{{ formatDate(member.lastLogin) }}</p>
           </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center justify-end gap-1 w-32">
           <button 
             @click="editMember(member)" 
             class="w-8 h-8 bg-slate-50 hover:bg-violet-100 text-slate-400 hover:text-violet-600 rounded-lg flex items-center justify-center transition-all"
           >
             <i class="fas fa-edit text-[10px]"></i>
           </button>
           <button 
             @click="toggleMemberStatus(member)" 
             :class="member.isActive ? 'hover:bg-rose-100 text-slate-400 hover:text-rose-600' : 'hover:bg-emerald-100 text-slate-400 hover:text-emerald-600'" 
             class="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center transition-all"
           >
             <i :class="member.isActive ? 'fas fa-user-slash' : 'fas fa-user-check'" class="text-[10px]"></i>
           </button>
           <button 
             v-if="authStore.user?.role === 'admin'"
             @click="permanentDeleteMember(member)" 
             class="w-8 h-8 bg-slate-50 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-all"
           >
             <i class="fas fa-trash-alt text-[10px]"></i>
           </button>
        </div>
      </div>
    </div>
      <!-- Empty State -->
      <div v-if="filteredMembers.length === 0" class="py-20 text-center bg-white border border-slate-100 rounded-3xl">
        <i class="fas fa-users text-4xl text-slate-100 mb-4"></i>
        <p class="text-sm font-bold text-slate-400">No se encontraron miembros</p>
      </div>
    
    <!-- Pagination Controls (Premium) -->
    <div v-if="pagination.pages > 1" class="mt-12 flex items-center justify-center gap-2">
       <button 
         @click="changePage(pagination.page - 1)"
         :disabled="pagination.page === 1"
         class="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
       >
         <i class="fas fa-chevron-left"></i>
       </button>
       
       <div class="flex items-center gap-2 bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm">
          <button 
            v-for="p in pagination.pages" 
            :key="p"
            @click="changePage(p)"
            :class="p === pagination.page ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-50'"
            class="w-9 h-9 rounded-xl text-xs font-black transition-all"
          >
            {{ p }}
          </button>
       </div>

       <button 
         @click="changePage(pagination.page + 1)"
         :disabled="pagination.page === pagination.pages"
         class="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
       >
         <i class="fas fa-chevron-right"></i>
       </button>
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
                        <option value="" disabled>Selecciona un rol</option>
                        <option v-for="role in allAvailableRoles" :key="role._id || role.name" :value="role.name">
                          {{ getRoleDisplayName(role.name) }}
                        </option>
                      </select>
                   </div>
                   <div class="space-y-2">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Departamento</label>
                       <select v-model="formData.department" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-violet-500/5">
                         <option value="">Sin departamento</option>
                         <option value="TI">TI</option>
                         <option value="Comercial">Comercial</option>
                         <option value="Marketing">Marketing</option>
                         <option value="Customer Success">Customer Success</option>
                       </select>
                    </div>
                    <!-- Rol dentro del departamento -->
                    <div class="space-y-2">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Rol en Departamento</label>
                       <div class="grid grid-cols-2 gap-3">
                         <button
                           type="button"
                           @click="formData.departmentRole = 'member'"
                           :class="formData.departmentRole !== 'leader' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200'"
                           class="p-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                         >
                           <i class="fas fa-user"></i> Miembro
                         </button>
                         <button
                           type="button"
                           @click="formData.departmentRole = 'leader'"
                           :class="formData.departmentRole === 'leader' ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100' : 'bg-slate-50 text-slate-500 border-slate-200'"
                           class="p-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                         >
                           <i class="fas fa-crown"></i> Líder
                         </button>
                       </div>
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
import { useNotifications } from '../composables/useNotifications'
import PermissionGuard from '../components/PermissionGuard.vue'
import UserAvatar from '../components/ui/UserAvatar.vue'
import { rolesService, type Role } from '../services/rolesService'
import type { TeamMember } from '../types'

const authStore = useAuthStore()
const teamStore = useTeamStore()
const { confirmDelete, showSuccess, showError } = useNotifications()

// State
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const isSubmitting = ref(false)
const roles = ref<Role[]>([])
const baseRolesNames = ['admin', 'manager', 'support', 'development', 'fullstack', 'employee', 'viewer', 'client']

const allAvailableRoles = computed(() => {
  // Start with dynamic roles
  const combined = [...roles.value]
  
  // Add base roles if they are not already present (by name)
  baseRolesNames.forEach(name => {
    if (!combined.some(r => r.name.toLowerCase() === name.toLowerCase())) {
      combined.push({
        name: name,
        isSystem: true,
        permissions: {} as any // Will use backend defaults
      })
    }
  })
  
  return combined
})

const editingMember = ref<TeamMember | null>(null)
const pagination = reactive({
  page: 1,
  limit: 12,
  total: 0,
  pages: 0
})

// Form data
const formData = reactive({
  name: '',
  email: '',
  password: '',
  role: '' as TeamMember['role'],
  department: '',
  position: '',
  phone: '',
  supervisor: '',
  departmentRole: 'member' as 'member' | 'leader'
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
    admin: 'Administrador',
    manager: 'Gerencia',
    support: 'Soporte Técnico',
    development: 'Especialista TI',
    fullstack: 'Ingeniero Soft.',
    employee: 'Colaborador',
    viewer: 'Consultor',
    client: 'Cliente',
    development: 'Especialista TI'
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
  Object.assign(formData, { name: '', email: '', password: '', role: '', department: '', position: '', phone: '', supervisor: '', departmentRole: 'member' })
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
    phone: member.phone || '',
    supervisor: member.supervisor || '',
    departmentRole: member.departmentRole || 'member'
  })
  showEditModal.value = true
}

const submitForm = async () => {
  try {
    isSubmitting.value = true
    if (showCreateModal.value) {
      // Validaciones extra
      if (formData.password.length < 6) {
        showError('Validación', 'La contraseña debe tener al menos 6 caracteres')
        isSubmitting.value = false
        return
      }
      await teamStore.createMember(formData)
    } else if (editingMember.value) {
      const { password, ...updateData } = formData
      await teamStore.updateMember(editingMember.value._id!, updateData)
    }
    closeModal()
  } catch (error: any) {
    console.error('Error submitting form:', error)
    const message = error.response?.data?.message || error.message || 'Error al guardar los datos'
    showError('Error en el formulario', message)
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

const permanentDeleteMember = async (member: TeamMember) => {
  const confirmed = await confirmDelete(
    `¿Estás seguro de eliminar permanentemente a ${member.name}?`,
    "Esta acción borrará todos sus datos de la base de datos de forma irreversible."
  )
  
  if (confirmed) {
    try {
      await teamStore.hardDeleteMember(member._id!)
      showSuccess("Usuario eliminado permanentemente")
    } catch (error: any) {
      showError(error.message || "Error al eliminar usuario")
    }
  }
}

const changePage = (page: number) => {
  if (page < 1 || page > pagination.pages) return
  teamStore.fetchTeam(page, pagination.limit).then(res => {
    if (res) Object.assign(pagination, res)
  })
}

onMounted(async () => {
  // Load roles
  try {
    roles.value = await rolesService.getAll()
  } catch (error) {
    console.error('Error loading roles:', error)
  }

  if (authStore.canViewTeam) {
    const res = await teamStore.fetchTeam(pagination.page, pagination.limit)
    if (res) Object.assign(pagination, res)
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
