<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white">Transacciones</h2>
        <p class="text-gray-400">Registra ingresos y egresos</p>
      </div>
      <button
        @click="$emit('create')"
        class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
      >
        <i class="fas fa-plus"></i>
        Nueva Transacción
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-purple-500/20">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar por concepto..."
            class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          >
        </div>
        <select
          v-model="typeFilter"
          class="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
        >
          <option value="" class="bg-gray-700">Todos los tipos</option>
          <option value="ingreso" class="bg-gray-700">Ingresos</option>
          <option value="egreso" class="bg-gray-700">Egresos</option>
        </select>
        <input
          v-model="dateFilter"
          type="month"
          class="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
        >
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <AppLoader label="Cargando transacciones…" :padded="false" />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTransactions.length === 0" class="text-center py-12">
      <i class="fas fa-exchange-alt text-4xl text-gray-500 mb-4"></i>
      <p class="text-gray-400 text-lg">No se encontraron transacciones</p>
    </div>

    <!-- Transactions List -->
    <div v-else class="space-y-4">
      <div
        v-for="transaction in filteredTransactions"
        :key="transaction._id"
        class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-purple-500/20 hover:border-purple-400"
      >
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <!-- Transaction Info -->
          <div class="flex items-center gap-4 flex-1">
            <div :class="[
              'p-3 rounded-full',
              transaction.tipo === 'ingreso' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            ]">
              <i :class="[
                'text-xl',
                transaction.tipo === 'ingreso' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'
              ]"></i>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-white text-lg">{{ transaction.concepto }}</h3>
              <div class="flex flex-wrap gap-4 text-sm text-gray-400 mt-1">
                <span>
                  <i class="fas fa-calendar mr-1"></i>
                  {{ formatDate(transaction.fecha) }}
                </span>
                <span v-if="transaction.metodo">
                  <i class="fas fa-credit-card mr-1"></i>
                  {{ transaction.metodo }}
                </span>
                <span v-if="transaction.cliente_id">
                  <i class="fas fa-user mr-1"></i>
                  Cliente: {{ transaction.cliente_id }}
                </span>
              </div>
            </div>
          </div>

          <!-- Amount -->
          <div class="flex items-center gap-4">
            <div :class="[
              'text-right',
              transaction.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'
            ]">
              <p class="text-2xl font-bold">
                {{ transaction.tipo === 'ingreso' ? '+' : '-' }}${{ formatCurrency(transaction.monto) }}
              </p>
              <p class="text-sm text-gray-400 capitalize">{{ transaction.tipo }}</p>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button title="Editar transacción"
                @click="$emit('edit', transaction)"
                class="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors border border-blue-500/30"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button title="Eliminar transacción"
                @click="$emit('delete', transaction._id!)"
                class="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors border border-red-500/30"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppLoader from '@/components/ui/AppLoader.vue'
import { ref, computed } from 'vue'
import type { Transaction } from '../../services/accountingService'

interface Props {
  transactions: Transaction[]
  loading: boolean
}

const searchTerm = ref('')
const typeFilter = ref('')
const dateFilter = ref('')

const filteredTransactions = computed(() => {
  return props.transactions.filter(transaction => {
    const matchesSearch = transaction.concepto.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchesType = !typeFilter.value || transaction.tipo === typeFilter.value
    const matchesDate = !dateFilter.value || 
      new Date(transaction.fecha).toISOString().slice(0, 7) === dateFilter.value
    
    return matchesSearch && matchesType && matchesDate
  })
})

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const props = defineProps<Props>()
</script>
