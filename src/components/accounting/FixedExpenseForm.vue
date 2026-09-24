<template>
  <!-- Modal Backdrop -->
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click="closeModal"
  >
    <!-- Modal Content -->
    <div
      class="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-purple-500/20"
      @click.stop
    >
      <!-- Header -->
      <div class="p-6 border-b border-gray-700">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-white">
            {{ editingExpense ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo' }}
          </h2>
          <button title="Cerrar"
            @click="closeModal"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Nombre -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Nombre del Gasto *
          </label>
          <input
            v-model="form.nombre"
            type="text"
            required
            placeholder="Ej: Arriendo oficina, Servicios públicos, etc."
            class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          >
        </div>

        <!-- Monto Mensual -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Monto Mensual *
          </label>
          <div class="relative">
            <input
              v-model.number="form.monto_mensual"
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span class="text-gray-400 text-sm">/ mes</span>
            </div>
          </div>
        </div>

        <!-- Estado -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Estado
          </label>
          <div class="space-y-3">
            <div class="flex items-center">
              <input
                v-model="form.activo"
                :value="true"
                type="radio"
                id="activo"
                name="estado"
                class="h-4 w-4 text-purple-600 focus:ring-purple-500 bg-gray-700 border-gray-600"
              >
              <label for="activo" class="ml-3 flex items-center">
                <span class="text-white font-medium">Activo</span>
                <span class="ml-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Se incluye en cálculos
                </span>
              </label>
            </div>
            <div class="flex items-center">
              <input
                v-model="form.activo"
                :value="false"
                type="radio"
                id="inactivo"
                name="estado"
                class="h-4 w-4 text-purple-600 focus:ring-purple-500 bg-gray-700 border-gray-600"
              >
              <label for="inactivo" class="ml-3 flex items-center">
                <span class="text-white font-medium">Inactivo</span>
                <span class="ml-2 px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                  No se incluye en cálculos
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Preview Card -->
        <div v-if="form.nombre && form.monto_mensual > 0" 
             class="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl p-4 border border-purple-500/20">
          <h3 class="text-sm font-medium text-gray-300 mb-2">Vista Previa:</h3>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div :class="[
                'p-2 rounded-full',
                form.activo 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
              ]">
                <i :class="[
                  form.activo ? 'fas fa-check-circle' : 'fas fa-pause-circle'
                ]"></i>
              </div>
              <div>
                <p class="font-medium text-white">{{ form.nombre }}</p>
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  form.activo 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                ]">
                  {{ form.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-orange-400">
                ${{ formatCurrency(form.monto_mensual) }}
              </p>
              <p class="text-xs text-gray-400">por mes</p>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="closeModal"
            class="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
          >
            <span v-if="loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              Guardando...
            </span>
            <span v-else>
              {{ editingExpense ? 'Actualizar' : 'Crear' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FixedExpense } from '../../services/accountingService'

interface Props {
  show: boolean
  editingExpense?: FixedExpense | null
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [expense: Omit<FixedExpense, '_id'>]
}>()

const form = ref({
  nombre: '',
  monto_mensual: 0,
  activo: true
})

const resetForm = () => {
  form.value = {
    nombre: '',
    monto_mensual: 0,
    activo: true
  }
}

const closeModal = () => {
  emit('close')
}

const handleSubmit = () => {
  const expenseData: Omit<FixedExpense, '_id'> = {
    nombre: form.value.nombre,
    monto_mensual: form.value.monto_mensual,
    activo: form.value.activo
  }
  
  emit('submit', expenseData)
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Watch for editing expense changes
watch(() => props.editingExpense, (newExpense) => {
  if (newExpense) {
    form.value = {
      nombre: newExpense.nombre,
      monto_mensual: newExpense.monto_mensual,
      activo: newExpense.activo
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Watch for modal show/hide
watch(() => props.show, (newShow) => {
  if (newShow && !props.editingExpense) {
    resetForm()
  }
})
</script>
