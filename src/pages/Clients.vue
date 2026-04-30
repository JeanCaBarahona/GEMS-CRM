<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
    <!-- Header with Breadcrumbs & Title -->
    <div class="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">
          <i class="fas fa-home"></i>
          <i class="fas fa-chevron-right text-[8px]"></i>
          <span>Comercial</span>
          <i class="fas fa-chevron-right text-[8px]"></i>
          <span class="text-primary-500">Clientes</span>
        </div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Gestión de Clientes</h1>
        <p class="text-slate-400 text-sm font-medium">Directorio centralizado de contactos y empresas.</p>
      </div>
      
      <PermissionGuard :permissions="['create-clients']" :fallback="false">
        <button 
          @click="showModal = true; editingClient = null; resetForm()" 
          class="btn-primary"
        >
          <PlusIcon class="w-5 h-5" />
          Nuevo Cliente
        </button>
      </PermissionGuard>
    </div>

    <!-- Toolbar & Filters -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 p-4">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <!-- Tabs -->
        <div class="flex bg-slate-100 p-1 rounded-xl">
          <button
            @click="activeTab = 'clientes'"
            :class="[activeTab === 'clientes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
          >Directorio</button>
          <button
            @click="activeTab = 'prospectos'"
            :class="[activeTab === 'prospectos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            class="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
          >Prospectos IA</button>
        </div>

        <!-- Search & Sort (Only if Directory) -->
        <div v-if="activeTab === 'clientes'" class="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:justify-end">
          <div class="relative w-full sm:max-w-xs group">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar por nombre, email o empresa..."
              class="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
            />
          </div>
          
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Ordenar por</span>
            <select 
              v-model="sortBy" 
              class="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-700 outline-none cursor-pointer focus:bg-white focus:border-primary-500 transition-all"
            >
              <option value="name">Nombre</option>
              <option value="company">Empresa</option>
              <option value="createdAt">Recientes</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
      <div v-if="activeTab === 'prospectos'" class="flex-1 overflow-y-auto bg-slate-50 p-8">
        <ProspectAIForm />
      </div>
          
      <div v-else class="flex-1 flex flex-col relative">
        <div v-if="loading" class="flex items-center justify-center absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px]">
          <div class="flex flex-col items-center gap-3">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargando Clientes</span>
          </div>
        </div>
      
        <div v-else-if="error" class="flex-1 flex items-center justify-center p-12">
          <div class="max-w-md w-full text-center p-8 bg-red-50 rounded-3xl border border-red-100">
            <ExclamationTriangleIcon class="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 class="text-red-900 font-black text-lg mb-2">Error de conexión</h3>
            <p class="text-red-600/70 text-sm mb-6">{{ error }}</p>
            <button @click="fetchClients" class="btn-danger btn-sm">
              <i class="fas fa-sync mr-2"></i> Reintentar
            </button>
          </div>
        </div>
      
        <div v-else class="flex-1">
          <!-- Desktop Table View -->
          <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-100">
              <thead>
                <tr class="bg-slate-50/50">
                  <th class="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th class="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa</th>
                  <th class="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                  <th class="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Registro</th>
                  <th class="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr 
                  v-for="client in filteredClients" 
                  :key="client._id"
                  class="hover:bg-slate-50/80 transition-all group"
                >
                  <td class="px-8 py-5 whitespace-nowrap">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 flex items-center justify-center text-primary-600 font-black text-sm shadow-sm ring-1 ring-primary-100">
                        {{ client.name.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="text-slate-900 font-bold text-sm leading-tight group-hover:text-primary-600 transition-colors">{{ client.name }}</div>
                        <div class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Persona Física</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-5 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-slate-200"></div>
                      <span class="text-slate-700 text-xs font-black">{{ client.company }}</span>
                    </div>
                  </td>
                  <td class="px-8 py-5 whitespace-nowrap">
                    <div class="space-y-1">
                      <div class="text-slate-600 text-[11px] font-bold flex items-center gap-2">
                        <i class="fas fa-envelope text-slate-300 w-3 text-center"></i> 
                        {{ client.email }}
                      </div>
                      <div class="text-slate-400 text-[11px] font-medium flex items-center gap-2">
                        <i class="fas fa-phone text-slate-300 w-3 text-center"></i> 
                        {{ client.phone }}
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-5 whitespace-nowrap">
                    <div class="flex flex-col items-center">
                      <span class="text-slate-700 text-xs font-bold">{{ formatDate(client.createdAt) }}</span>
                      <span class="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Confirmado</span>
                    </div>
                  </td>
                  <td class="px-8 py-5 whitespace-nowrap text-right">
                    <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <router-link :to="`/clients/${client._id}`" class="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all" title="Ver Perfil">
                        <i class="fas fa-arrow-right text-sm"></i>
                      </router-link>
                      <PermissionGuard :permissions="['edit-clients']" :fallback="false">
                        <button @click="editClient(client)" class="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Editar">
                          <PencilIcon class="w-4 h-4" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard :permissions="['delete-clients']" :fallback="false">
                        <button @click="confirmDelete(client)" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Eliminar">
                          <TrashIcon class="w-4 h-4" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Card View -->
          <div class="md:hidden p-4 space-y-4">
            <div 
              v-for="client in filteredClients" 
              :key="client._id"
              class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div class="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-black text-sm">
                    {{ client.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <h3 class="text-slate-900 font-bold text-sm">{{ client.name }}</h3>
                    <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">{{ client.company }}</p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <PermissionGuard :permissions="['edit-clients']" :fallback="false">
                    <button @click="editClient(client)" class="w-8 h-8 flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg"><PencilIcon class="w-4 h-4" /></button>
                  </PermissionGuard>
                </div>
              </div>
              
              <div class="space-y-2 mb-4">
                <div class="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <i class="fas fa-envelope text-slate-300 w-4"></i> {{ client.email }}
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <i class="fas fa-phone text-slate-300 w-4"></i> {{ client.phone }}
                </div>
              </div>

              <router-link :to="`/clients/${client._id}`" class="block w-full text-center py-2.5 bg-primary-50 text-primary-700 text-xs font-black uppercase tracking-widest rounded-xl transition-all active:bg-primary-100">
                Ver Expediente
              </router-link>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="filteredClients.length === 0" class="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <div class="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 text-slate-200">
              <UserGroupIcon class="w-12 h-12" />
            </div>
            <h3 class="text-xl font-black text-slate-900 mb-2">
              {{ searchTerm ? 'Sin coincidencias' : 'Directorio vacío' }}
            </h3>
            <p class="text-slate-400 text-sm font-medium max-w-xs mx-auto mb-8">
              {{ searchTerm ? 'No encontramos ningún cliente que coincida con tu búsqueda. Intenta con otros términos.' : 'Aún no tienes clientes registrados en la plataforma. Comienza a construir tu base de contactos.' }}
            </p>
            <button v-if="!searchTerm" @click="showModal = true; editingClient = null; resetForm()" class="btn-primary">
              <PlusIcon class="w-5 h-5" />
              Añadir Primer Cliente
            </button>
            <button v-else @click="searchTerm = ''" class="btn-secondary btn-sm">Limpiar Búsqueda</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showModal = false"></div>
      <div class="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in border border-slate-100">
        <div class="flex items-center justify-between p-8 border-b border-slate-50">
          <div>
            <h3 class="text-xl font-black text-slate-900 leading-tight">
              {{ editingClient ? 'Editar Expediente' : 'Nuevo Cliente' }}
            </h3>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Completa los datos de contacto</p>
          </div>
          <button @click="showModal = false" class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveClient" class="p-8">
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nombre Completo</label>
              <input v-model="form.name" type="text" required placeholder="Ej: Juan Pérez" class="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all" />
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Correo Electrónico</label>
                <input v-model="form.email" type="email" required placeholder="correo@ejemplo.com" class="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/10 transition-all" />
              </div>
              
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">WhatsApp / Tel</label>
                <input v-model="form.phone" type="tel" required placeholder="+57 ..." class="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/10 transition-all" />
              </div>
            </div>
            
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Empresa / Organización</label>
              <input v-model="form.company" type="text" required placeholder="Nombre de la empresa" class="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/10 transition-all" />
            </div>
          </div>
          
          <div class="flex items-center gap-4 mt-10 pt-8 border-t border-slate-50">
            <button type="button" @click="showModal = false" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" :disabled="loading" class="btn-primary flex-1">
              <i v-if="!loading" class="fas fa-check mr-2"></i>
              <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {{ editingClient ? 'Actualizar' : 'Guardar Cliente' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showDeleteModal = false"></div>
      <div class="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in border border-slate-100 p-8 text-center">
        <div class="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
          <TrashIcon class="w-10 h-10" />
        </div>
        <h3 class="text-xl font-black text-slate-900 mb-2">¿Eliminar Cliente?</h3>
        <p class="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
          Esta acción eliminará permanentemente a <span class="text-slate-900 font-bold">{{ clientToDelete?.name }}</span>. ¿Estás seguro de continuar?
        </p>
        
        <div class="flex flex-col gap-3">
          <button @click="deleteClient" :disabled="loading" class="btn-danger w-full">
            <i v-if="!loading" class="fas fa-trash-alt mr-2"></i>
            <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 mx-auto"></div>
            {{ loading ? 'Eliminando...' : 'Sí, Eliminar' }}
          </button>
          <button @click="showDeleteModal = false" class="btn-ghost w-full">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClientStore } from '../stores/clientStore'
import type { Client, ClientForm } from '../types'
import ProspectAIForm from '../components/ProspectAIForm.vue'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const clientsStore = useClientStore()
const activeTab = ref('clientes')
const showModal = ref(false)
const showDeleteModal = ref(false)
const searchTerm = ref('')
const sortBy = ref('name')
const editingClient = ref<Client | null>(null)
const clientToDelete = ref<Client | null>(null)

const form = ref<ClientForm>({
  name: '',
  email: '',
  phone: '',
  company: ''
})

const clients = computed(() => clientsStore.clients)
const loading = computed(() => clientsStore.loading)
const error = computed(() => clientsStore.error)

const filteredClients = computed(() => {
  let filtered = clients.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(client => 
      client.name.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search) ||
      (client.company || '').toLowerCase().includes(search) ||
      (client.phone || '').toLowerCase().includes(search)
    )
  }

  return [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'company':
        return (a.company || '').localeCompare(b.company || '')
      case 'createdAt':
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      default:
        return 0
    }
  })
})

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    phone: '',
    company: ''
  }
}

const editClient = (client: Client) => {
  editingClient.value = client
  form.value = {
    name: client.name,
    email: client.email,
    phone: client.phone,
    company: client.company
  }
  showModal.value = true
}

const confirmDelete = (client: Client) => {
  clientToDelete.value = client
  showDeleteModal.value = true
}

const saveClient = async () => {
  try {
    if (editingClient.value) {
      await clientsStore.updateClient(editingClient.value._id!, form.value)
    } else {
      await clientsStore.createClient(form.value)
    }
    showModal.value = false
    resetForm()
    editingClient.value = null
  } catch (error) {
    console.error('Error saving client:', error)
  }
}

const deleteClient = async () => {
  if (!clientToDelete.value?._id) return
  
  try {
    await clientsStore.deleteClient(clientToDelete.value._id)
    showDeleteModal.value = false
    clientToDelete.value = null
  } catch (error) {
    console.error('Error deleting client:', error)
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const fetchClients = async () => {
  try {
    await clientsStore.fetchClients()
  } catch (error) {
    console.error('Error fetching clients:', error)
  }
}

onMounted(() => {
  fetchClients()
})
</script>
