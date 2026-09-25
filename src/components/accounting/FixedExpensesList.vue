<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white">Gastos Fijos</h2>
        <p class="text-gray-400">Administra gastos recurrentes mensuales</p>
      </div>
      <button
        @click="$emit('create')"
        class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
      >
        <i class="fas fa-plus"></i>
        Nuevo Gasto Fijo
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-purple-500/20">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar por nombre..."
            class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          >
        </div>
        <select
          v-model="statusFilter"
          class="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
        >
          <option value="" class="bg-gray-700">Todos los estados</option>
          <option value="true" class="bg-gray-700">Activos</option>
          <option value="false" class="bg-gray-700">Inactivos</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <AppLoader label="Cargando gastos fijos…" :padded="false" />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredExpenses.length === 0" class="text-center py-12">
      <i class="fas fa-repeat text-4xl text-gray-500 mb-4"></i>
      <p class="text-gray-400 text-lg">No se encontraron gastos fijos</p>
    </div>

    <!-- Summary Card -->
    <div v-else class="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl shadow-lg p-6 mb-6 border border-purple-500/30">
      <div class="text-center">
        <h3 class="text-xl font-bold text-white mb-2">Total Gastos Fijos Activos</h3>
        <p class="text-3xl font-bold text-purple-300">
          ${{ formatCurrency(totalActiveExpenses) }} / mes
        </p>
        <p class="text-sm text-gray-400 mt-1">
          {{ activeExpensesCount }} gastos activos de {{ filteredExpenses.length }} totales
        </p>
      </div>
    </div>

    <!-- Expenses List -->
    <div class="space-y-4">
      <div
        v-for="expense in filteredExpenses"
        :key="expense._id"
        class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-purple-500/20 hover:border-purple-400"
      >
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <!-- Expense Info -->
          <div class="flex items-center gap-4 flex-1">
            <div :class="[
              'p-3 rounded-full',
              expense.activo 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-gray-500/20 text-gray-400'
            ]">
              <i :class="[
                'text-xl',
                expense.activo ? 'fas fa-check-circle' : 'fas fa-pause-circle'
              ]"></i>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-white text-lg">{{ expense.nombre }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  expense.activo 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                ]">
                  {{ expense.activo ? 'Activo' : 'Inactivo' }}
                </span>
                <span class="text-gray-400 text-sm">Mensual</span>
              </div>
            </div>
          </div>

          <!-- Amount -->
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-2xl font-bold text-orange-400">
                ${{ formatCurrency(expense.monto_mensual) }}
              </p>
              <p class="text-sm text-gray-400">por mes</p>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button
                @click="toggleStatus(expense)"
                :class="[
                  'p-2 rounded-lg transition-colors border',
                  expense.activo 
                    ? 'bg-gray-600/20 text-gray-400 border-gray-500/30 hover:bg-gray-600/30' 
                    : 'bg-green-600/20 text-green-400 border-green-500/30 hover:bg-green-600/30'
                ]"
                :title="expense.activo ? 'Desactivar' : 'Activar'"
              >
                <i :class="expense.activo ? 'fas fa-pause' : 'fas fa-play'"></i>
              </button>
              <button title="Editar gasto"
                @click="$emit('edit', expense)"
                class="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors border border-blue-500/30"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button title="Eliminar gasto"
                @click="$emit('delete', expense._id!)"
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
import type { FixedExpense } from '../../services/accountingService'

interface Props {
  expenses: FixedExpense[]
  loading: boolean
}

const searchTerm = ref('')
const statusFilter = ref('')

const filteredExpenses = computed(() => {
  return props.expenses.filter(expense => {
    const matchesSearch = expense.nombre.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchesStatus = statusFilter.value === '' || 
      expense.activo.toString() === statusFilter.value
    
    return matchesSearch && matchesStatus
  })
})

const totalActiveExpenses = computed(() => {
  return filteredExpenses.value
    .filter(expense => expense.activo)
    .reduce((total, expense) => total + expense.monto_mensual, 0)
})

const activeExpensesCount = computed(() => {
  return filteredExpenses.value.filter(expense => expense.activo).length
})

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const toggleStatus = (expense: FixedExpense) => {
  emit('toggleStatus', expense)
}

const props = defineProps<Props>()
const emit = defineEmits<{
  create: []
  edit: [expense: FixedExpense]
  delete: [id: string]
  refresh: []
  toggleStatus: [expense: FixedExpense]
}>()
</script>
