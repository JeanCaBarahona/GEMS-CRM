<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h2 class="text-2xl font-bold text-white">Pagos Recurrentes</h2>
        <p class="text-gray-400">Gestiona pagos mensuales de clientes</p>
      </div>
      <button
        @click="refreshPayments"
        class="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
      >
        <i class="fas fa-sync-alt"></i>
        Actualizar
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      <p class="mt-2 text-gray-300">Cargando pagos recurrentes...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="payments.length === 0" class="text-center py-12">
      <i class="fas fa-calendar-check text-4xl text-gray-500 mb-4"></i>
      <p class="text-gray-400 text-lg">No hay pagos recurrentes pendientes</p>
    </div>

    <!-- Payments List -->
    <div v-else class="space-y-4">
      <div
        v-for="payment in payments"
        :key="payment._id"
        class="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-purple-500/20 hover:border-purple-400"
      >
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <!-- Payment Info -->
          <div class="flex items-center gap-4 flex-1">
            <div class="p-3 bg-green-500/20 text-green-400 rounded-full">
              <i class="fas fa-calendar-alt text-xl"></i>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-white text-lg">{{ payment.concepto }}</h3>
              <div class="flex flex-wrap gap-4 text-sm text-gray-400 mt-1">
                <span v-if="payment.cliente_id">
                  <i class="fas fa-user mr-1"></i>
                  {{ getClientName(payment.cliente_id) }}
                </span>
                <span>
                  <i class="fas fa-repeat mr-1"></i>
                  {{ formatFrequency(payment.frecuencia) }}
                </span>
                <span v-if="payment.proximo_pago">
                  <i class="fas fa-clock mr-1"></i>
                  Próximo: {{ formatDate(payment.proximo_pago) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Amount and Actions -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <!-- Amount -->
            <div class="text-right">
              <p class="text-2xl font-bold text-green-400">
                ${{ formatCurrency(payment.monto) }}
              </p>
              <p class="text-sm text-gray-400">{{ formatFrequency(payment.frecuencia) }}</p>
            </div>

            <!-- Status Badge -->
            <div class="flex items-center gap-2">
              <span :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                getStatusClass(payment)
              ]">
                {{ getStatusText(payment) }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button
                @click="markAsPaid(payment)"
                :disabled="processingPayment === payment._id"
                class="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors border border-green-500/30 disabled:opacity-50 flex items-center gap-2"
              >
                <i v-if="processingPayment === payment._id" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-check"></i>
                Marcar Pagado
              </button>
              <button title="Editar pago"
                @click="$emit('edit', payment)"
                class="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors border border-blue-500/30"
              >
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Payment History (if available) -->
        <div v-if="payment.estado_pago === 'pagado'" class="mt-4 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
          <div class="flex items-center gap-2 text-green-400">
            <i class="fas fa-check-circle"></i>
            <span class="text-sm font-medium">Último pago registrado: {{ formatDate(payment.fecha) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { accountingService, type Transaction } from '../../services/accountingService'

defineEmits<{
  edit: [payment: Transaction]
  refresh: []
}>()

const payments = ref<Transaction[]>([])
const loading = ref(false)
const processingPayment = ref<string | null>(null)

const loadPayments = async () => {
  try {
    loading.value = true
    payments.value = await accountingService.getRecurringPayments()
  } catch (error) {
    console.error('Error loading recurring payments:', error)
  } finally {
    loading.value = false
  }
}

const refreshPayments = () => {
  loadPayments()
}

const markAsPaid = async (payment: Transaction) => {
  if (!payment._id) return
  
  try {
    processingPayment.value = payment._id
    await accountingService.markPaymentAsPaid(payment._id)
    await loadPayments() // Reload to get updated data
  } catch (error) {
    console.error('Error marking payment as paid:', error)
  } finally {
    processingPayment.value = null
  }
}

const getClientName = (clientData: any): string => {
  if (typeof clientData === 'object' && clientData !== null) {
    return `${clientData.nombre || ''} ${clientData.apellido || ''}`.trim()
  }
  return 'Cliente no especificado'
}

const formatFrequency = (frequency?: string): string => {
  const frequencies: Record<string, string> = {
    mensual: 'Mensual',
    trimestral: 'Trimestral',
    semestral: 'Semestral',
    anual: 'Anual'
  }
  return frequency ? frequencies[frequency] || frequency : 'No especificado'
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const getStatusClass = (payment: Transaction): string => {
  if (!payment.proximo_pago) return 'bg-gray-500/20 text-gray-400'
  
  const nextPayment = new Date(payment.proximo_pago)
  const today = new Date()
  const daysDiff = Math.ceil((nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff < 0) {
    return 'bg-red-500/20 text-red-400' // Vencido
  } else if (daysDiff <= 7) {
    return 'bg-yellow-500/20 text-yellow-400' // Próximo a vencer
  } else {
    return 'bg-green-500/20 text-green-400' // Al día
  }
}

const getStatusText = (payment: Transaction): string => {
  if (!payment.proximo_pago) return 'Sin fecha'
  
  const nextPayment = new Date(payment.proximo_pago)
  const today = new Date()
  const daysDiff = Math.ceil((nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff < 0) {
    return `Vencido (${Math.abs(daysDiff)} días)`
  } else if (daysDiff <= 7) {
    return `Vence en ${daysDiff} días`
  } else {
    return 'Al día'
  }
}

onMounted(() => {
  loadPayments()
})

defineExpose({
  loadPayments,
  refreshPayments
})
</script>
