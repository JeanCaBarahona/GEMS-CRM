<template>
  <div class="flex flex-col h-full min-h-0 relative">
    <!-- Unified Header Toolbar -->
    <div class="flex flex-col lg:flex-row justify-between gap-4 mb-4 flex-shrink-0">
      <!-- Tabs (Left) -->
      <div class="flex bg-slate-100 p-1 rounded-lg self-start">
        <button
          :class="[activeTab === 'clientes' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700', 'px-6 py-1.5 rounded-md text-sm font-bold transition-all']"
          @click="activeTab = 'clientes'"
        >Directorio</button>
        <button
          :class="[activeTab === 'prospectos' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700', 'px-6 py-1.5 rounded-md text-sm font-bold transition-all']"
          @click="activeTab = 'prospectos'"
        >Prospectos IA</button>
      </div>

      <!-- Actions (Right) IF Directory -->
      <div v-if="activeTab === 'clientes'" class="flex flex-col sm:flex-row gap-2 flex-1 justify-end">
        <div class="relative w-full sm:max-w-xs">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar clientes..."
            class="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow"
          />
        </div>
        <select 
          v-model="sortBy" 
          class="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
        >
          <option value="name">Nombre</option>
          <option value="company">Empresa</option>
          <option value="createdAt">Registro</option>
        </select>
        
        <PermissionGuard :permissions="['create-clients']" :fallback="false">
          <button 
            @click="showModal = true; editingClient = null; resetForm()" 
            class="px-4 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 text-sm font-bold shadow-sm"
          >
            <PlusIcon class="w-4 h-4" />
            Nuevo
          </button>
        </PermissionGuard>
      </div>
    </div>

    <!-- MAIN CONTENT AREA -->
    <div class="flex-1 min-h-0 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div v-if="activeTab === 'prospectos'" class="h-full overflow-y-auto bg-slate-50">
        <ProspectAIForm />
      </div>
          
      <div v-else class="flex-1 flex flex-col h-full bg-white relative">
        <div v-if="loading" class="flex items-center justify-center absolute inset-0 z-10 bg-white/50 backdrop-blur-sm">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 mx-6">
          <div class="flex items-center justify-center gap-3 mb-4">
            <ExclamationTriangleIcon class="w-8 h-8 text-red-500" />
            <h3 class="text-red-800 font-bold text-lg">Error al cargar clientes</h3>
          </div>
          <p class="text-red-600 mb-4">{{ error }}</p>
          <button @click="fetchClients" class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-bold text-sm">
            Reintentar
          </button>
        </div>
      </div>
      
      <div v-else class="flex-1 overflow-y-auto">
        <!-- Desktop Table View -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50 sticky top-0 z-10 shadow-sm shadow-slate-200/50">
              <tr>
                <th class="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Empresa</th>
                <th class="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Contacto</th>
                <th class="px-6 py-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-wider">Fecha Registro</th>
                <th class="px-6 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-100">
              <tr 
                v-for="client in filteredClients" 
                :key="client._id"
                class="hover:bg-slate-50 transition-colors group"
              >
                <td class="px-6 py-2 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary-100">
                      {{ client.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="ml-3">
                      <div class="text-slate-800 font-bold text-sm group-hover:text-primary transition-colors">{{ client.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-2 whitespace-nowrap">
                  <div class="text-slate-600 text-sm font-medium">{{ client.company }}</div>
                </td>
                <td class="px-6 py-2 whitespace-nowrap">
                  <div class="text-slate-700 text-sm flex items-center gap-1.5 font-medium"><i class="fas fa-envelope text-slate-400 text-xs"></i> {{ client.email }}</div>
                  <div class="text-slate-500 text-xs flex items-center gap-1.5 mt-0.5"><i class="fas fa-phone text-slate-400 text-xs"></i> {{ client.phone }}</div>
                </td>
                <td class="px-6 py-2 whitespace-nowrap text-slate-500 text-sm text-center font-medium">
                  {{ formatDate(client.createdAt) }}
                </td>
                <td class="px-6 py-2 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <router-link :to="`/clients/${client._id}`" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Ver detalle">
                      <i class="fas fa-eye text-sm"></i>
                    </router-link>
                    <PermissionGuard :permissions="['edit-clients']" :fallback="false">
                      <button
                        @click="editClient(client)"
                        class="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                        title="Editar cliente"
                      >
                        <PencilIcon class="w-4 h-4" />
                      </button>
                    </PermissionGuard>
                    <PermissionGuard :permissions="['delete-clients']" :fallback="false">
                      <button
                        @click="confirmDelete(client)"
                        class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar cliente"
                      >
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
        <div class="md:hidden p-4 space-y-3">
          <div 
            v-for="client in filteredClients" 
            :key="client._id"
            class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
          >
            <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold text-xs">
                  {{ client.name.charAt(0).toUpperCase() }}
                </div>
                <div class="ml-3">
                  <h3 class="text-slate-800 font-bold text-sm">{{ client.name }}</h3>
                  <p class="text-slate-500 text-xs font-medium">{{ client.company }}</p>
                </div>
              </div>
              <div class="flex gap-1">
                <PermissionGuard :permissions="['edit-clients']" :fallback="false">
                  <button
                    @click="editClient(client)"
                    class="p-2 text-slate-400 hover:bg-slate-50 hover:text-primary-600 rounded-md transition-colors"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                </PermissionGuard>
                <PermissionGuard :permissions="['delete-clients']" :fallback="false">
                  <button
                    @click="confirmDelete(client)"
                    class="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </PermissionGuard>
              </div>
            </div>
            <div class="space-y-1.5 text-xs">
              <p class="text-slate-600 font-medium flex items-center gap-1.5"><i class="fas fa-envelope text-slate-400"></i> {{ client.email }}</p>
              <p class="text-slate-600 font-medium flex items-center gap-1.5"><i class="fas fa-phone text-slate-400"></i> {{ client.phone }}</p>
              <p class="text-slate-500 mt-2 pt-2 border-t border-slate-100">Registrado: <span class="font-bold">{{ formatDate(client.createdAt) }}</span></p>
                <router-link :to="`/clients/${client._id}`" class="mt-2 block w-full text-center py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md font-bold transition-colors">
                  Ver perfil completo
                </router-link>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="filteredClients.length === 0" class="text-center py-12 flex flex-col items-center justify-center">
          <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <UserGroupIcon class="h-8 w-8 text-slate-400" />
          </div>
          <h3 class="text-base font-bold text-slate-800 mb-1">
            {{ searchTerm ? 'No se encontraron clientes' : 'Sin clientes aún' }}
          </h3>
          <p class="text-slate-500 text-sm mb-4">
            {{ searchTerm ? 'Intenta con otros términos' : 'Construye tu lista de contactos' }}
          </p>
          <button @click="showModal = true; editingClient = null; resetForm()" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2 font-bold text-sm shadow-sm">
            <PlusIcon class="w-4 h-4" />
            Añadir
          </button>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div class="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 class="text-lg font-black text-slate-800 flex items-center gap-2">
            <i class="fas fa-user-plus text-primary-500 text-sm"></i>
            {{ editingClient ? 'Editar Información' : 'Datos del Cliente' }}
          </h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveClient" class="p-5">
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Nombre completo *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                placeholder="Juan Pérez"
              />
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email *
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  placeholder="juan@ejemplo.com"
                />
              </div>
              
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Teléfono *
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  required
                  class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  placeholder="+57 300 123 4567"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Empresa *
              </label>
              <input
                v-model="form.company"
                type="text"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                placeholder="Empresa ABC"
              />
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-sm font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2 shadow-sm text-sm font-bold disabled:opacity-50"
            >
              <span v-if="loading" class="flex items-center gap-2">
                <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Guardando...
              </span>
              <span v-else class="flex items-center gap-2">
                <i class="fas fa-check"></i>
                {{ editingClient ? 'Actualizar' : 'Guardar' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in border border-slate-100">
        <div class="p-6 text-center">
          <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrashIcon class="w-8 h-8" />
          </div>
          <h3 class="text-lg font-black text-slate-800 mb-1">
            Eliminar Cliente
          </h3>
          <p class="text-slate-500 text-sm mb-5">
            ¿Confirmas la eliminación permanente de <strong>{{ clientToDelete?.name }}</strong> de la lista de contactos?
          </p>
          
          <div class="flex justify-center gap-3">
            <button
              @click="showDeleteModal = false"
              class="px-5 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors text-sm font-bold w-1/2"
            >
              Cancelar
            </button>
            <button
              @click="deleteClient"
              :disabled="loading"
              class="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center gap-2 text-sm font-bold w-1/2"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              </span>
              <span v-else>
                Eliminar
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
// ...existing code...
import ProspectAIForm from '../components/ProspectAIForm.vue'
const activeTab = ref('clientes')
import { ref, computed, onMounted } from 'vue'
import { useClientStore } from '../stores/clientStore'
import type { Client, ClientForm } from '../types'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const clientsStore = useClientStore()

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

  return filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'company':
        return (a.company || '').localeCompare(b.company || '')
      case 'email':
        return a.email.localeCompare(b.email)
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
