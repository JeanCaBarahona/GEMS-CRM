import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ClientData } from '../services/clientService'
import { clientService } from '../services/clientService'

export const useClientStore = defineStore('client', () => {
  const clients = ref<ClientData[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchClients = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await clientService.getAll()
      clients.value = response
    } catch (err: any) {
      error.value = err.message || 'Error al cargar clientes'
      console.error('Error fetching clients:', err)
    } finally {
      loading.value = false
    }
  }

  const getClient = async (id: string) => {
    try {
      return await clientService.getById(id)
    } catch (err: any) {
      error.value = err.message || 'Error al cargar cliente'
      throw err
    }
  }

  const createClient = async (clientData: Omit<ClientData, '_id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null
    try {
      const newClient = await clientService.create(clientData)
      clients.value.push(newClient)
      return newClient
    } catch (err: any) {
      error.value = err.message || 'Error al crear cliente'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateClient = async (id: string, clientData: Partial<ClientData>) => {
    loading.value = true
    error.value = null
    try {
      const updatedClient = await clientService.update(id, clientData)
      const index = clients.value.findIndex(c => c._id === id)
      if (index !== -1) {
        clients.value[index] = updatedClient
      }
      return updatedClient
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar cliente'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteClient = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await clientService.deleteClient(id)
      const index = clients.value.findIndex(c => c._id === id)
      if (index !== -1) {
        clients.value.splice(index, 1)
      }
    } catch (err: any) {
      // 409 = bloqueo esperado (tiene historial asociado) — el caller lo muestra
      // en su propio modal; no lo tratamos como un error de conexión genérico.
      if (err.status !== 409) {
        error.value = err.message || 'Error al eliminar cliente'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const setClientStatus = async (id: string, status: 'active' | 'inactive') => {
    loading.value = true
    error.value = null
    try {
      const updated = await clientService.setStatus(id, status)
      const index = clients.value.findIndex(c => c._id === id)
      if (index !== -1) clients.value[index] = updated
      return updated
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar el estado del cliente'
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchClients = async (query: string) => {
    try {
      return await clientService.search(query)
    } catch (err: any) {
      error.value = err.message || 'Error al buscar clientes'
      throw err
    }
  }

  // Getters
  const getClientById = (id: string) => {
    return clients.value.find(c => c._id === id)
  }

  const getActiveClients = () => {
    return clients.value.filter(c => c.estado === 'active')
  }

  const getClientsByCompany = (empresa: string) => {
    return clients.value.filter(c => c.empresa === empresa)
  }

  return {
    // State
    clients,
    loading,
    error,

    // Actions
    fetchClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
    setClientStatus,
    searchClients,

    // Getters
    getClientById,
    getActiveClients,
    getClientsByCompany
  }
})
