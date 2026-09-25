<template>
  <div class="space-y-6">
    <!-- Encabezado y resumen de configuración -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center">
      <div>
        <h2 class="text-2xl font-bold text-white mb-1">Configuración de Notificaciones de Tareas</h2>
        <p class="text-gray-400 text-sm">Administra cuándo y cómo se envían las notificaciones a WhatsApp</p>
      </div>
    </div>
    
    <!-- Tarjeta de estado -->
    <div class="p-4 rounded-xl bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-white/10 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <!-- Estado WhatsApp -->
      <div class="flex items-center gap-2">
        <div 
          class="w-3 h-3 rounded-full"
          :class="whatsappStatus ? 'bg-green-500' : 'bg-red-500'"
        ></div>
        <span class="text-sm font-medium" :class="whatsappStatus ? 'text-green-400' : 'text-red-400'">
          {{ whatsappStatus ? 'WhatsApp conectado' : 'WhatsApp desconectado' }}
        </span>
      </div>
      
      <!-- Zona horaria -->
      <div class="flex items-center gap-2 text-sm text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Zona horaria: {{ currentTimezone }}</span>
      </div>
      
      <!-- Indicador de último envío -->
      <div class="flex flex-wrap gap-4 text-sm text-gray-400">
        <div v-if="settings.lastDailyRun" class="flex items-center gap-1">
          <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span>Último resumen: {{ formatDateShort(settings.lastDailyRun) }}</span>
        </div>
        <div v-if="settings.lastDueTomorrowRun" class="flex items-center gap-1">
          <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span>Último recordatorio: {{ formatDateShort(settings.lastDueTomorrowRun) }}</span>
        </div>
      </div>
    </div>
    
    <!-- Cargando -->
    <div v-if="loading" class="flex items-center justify-center p-8">
      <AppLoader label="Cargando configuración…" :padded="false" />
    </div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Panel de Resumen diario -->
      <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden">
        <!-- Encabezado -->
        <div class="bg-gradient-to-r from-purple-900/30 to-purple-800/30 px-5 py-4 border-b border-purple-500/20">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-purple-700/30">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-white">Resumen Diario de Tareas</h3>
            </div>
            
            <div class="flex items-center">
              <span class="mr-2 text-sm text-gray-300">Habilitado</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  class="sr-only peer" 
                  v-model="settings.dailySummaryEnabled" 
                  @change="updateSettings"
                >
                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Contenido -->
        <div class="p-5 space-y-4">
          <p class="text-sm text-gray-300">Envía automáticamente un resumen de todas las tareas creadas durante el día a través de WhatsApp al grupo de notificaciones.</p>
          
          <!-- Configuración de tiempo -->
          <div class="space-y-4">
            <!-- Hora de envío -->
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm text-gray-300 w-28">Hora de envío:</span>
              <div class="relative">
                <input 
                  type="time" 
                  class="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-1 pr-8 focus:border-purple-500 focus:outline-none"
                  v-model="settings.dailySummaryTime"
                  @change="updateSettings"
                >
                <svg xmlns="http://www.w3.org/2000/svg" class="absolute right-2 top-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <!-- Visualización en texto -->
              <span class="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                {{ formatTimeDescription(settings.dailySummaryTime) }}
              </span>
            </div>
            
            <!-- Días de la semana -->
            <div>
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span class="text-sm text-gray-300 w-28">Días de envío:</span>
                <span class="text-xs text-gray-400">
                  {{ getSelectedDaysText(settings.dailySummaryDays) }}
                </span>
              </div>
              
              <div class="flex flex-wrap gap-1 pl-28">
                <template v-for="(day, index) in weekdays" :key="index">
                  <button 
                    @click="toggleDailySummaryDay(index)" 
                    :class="[
                      'w-8 h-8 rounded-full text-xs font-medium transition-colors',
                      settings.dailySummaryDays?.includes(index) 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    ]"
                  >
                    {{ day.substring(0, 1) }}
                  </button>
                </template>
              </div>
            </div>
          </div>
          
          <!-- Último envío -->
          <div v-if="settings.lastDailyRun" class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Último envío: {{ formatDate(settings.lastDailyRun) }}</span>
          </div>
          
          <!-- Botón enviar ahora -->
          <div class="flex justify-end">
            <button 
              class="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
              @click="sendManualDailySummary"
              :disabled="sending.daily || !whatsappStatus"
            >
              <svg v-if="sending.daily" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span v-if="sending.daily">Enviando...</span>
              <span v-else>Enviar resumen ahora</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Panel de Recordatorio de vencimiento -->
      <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-yellow-500/20 overflow-hidden">
        <!-- Encabezado -->
        <div class="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 px-5 py-4 border-b border-yellow-500/20">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-yellow-700/30">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-white">Recordatorio de Vencimiento</h3>
            </div>
            
            <div class="flex items-center">
              <span class="mr-2 text-sm text-gray-300">Habilitado</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  class="sr-only peer" 
                  v-model="settings.dueTomorrowEnabled" 
                  @change="updateSettings"
                >
                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Contenido -->
        <div class="p-5 space-y-4">
          <p class="text-sm text-gray-300">Envía recordatorios de las tareas próximas a vencer a través de WhatsApp, mencionando a los responsables asignados.</p>
          
          <!-- Configuración de tiempo -->
          <div class="space-y-4">
            <!-- Hora de envío -->
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm text-gray-300 w-28">Hora de envío:</span>
              <div class="relative">
                <input 
                  type="time" 
                  class="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-1 pr-8 focus:border-yellow-500 focus:outline-none"
                  v-model="settings.dueTomorrowTime"
                  @change="updateSettings"
                >
                <svg xmlns="http://www.w3.org/2000/svg" class="absolute right-2 top-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <!-- Visualización en texto -->
              <span class="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
                {{ formatTimeDescription(settings.dueTomorrowTime) }}
              </span>
            </div>
            
            <!-- Días de la semana -->
            <div>
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span class="text-sm text-gray-300 w-28">Días de envío:</span>
                <span class="text-xs text-gray-400">
                  {{ getSelectedDaysText(settings.dueTomorrowDays) }}
                </span>
              </div>
              
              <div class="flex flex-wrap gap-1 pl-28">
                <template v-for="(day, index) in weekdays" :key="index">
                  <button 
                    @click="toggleDueTomorrowDay(index)" 
                    :class="[
                      'w-8 h-8 rounded-full text-xs font-medium transition-colors',
                      settings.dueTomorrowDays?.includes(index) 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    ]"
                  >
                    {{ day.substring(0, 1) }}
                  </button>
                </template>
              </div>
            </div>
            
            <!-- Días de anticipación -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-300 w-28">Anticipación:</span>
              <select 
                v-model="settings.dueTomorrowAdvanceDays" 
                class="bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-1 focus:border-yellow-500 focus:outline-none"
                @change="updateSettings"
              >
                <option value="0">Mismo día</option>
                <option value="1">1 día antes</option>
                <option value="2">2 días antes</option>
                <option value="3">3 días antes</option>
                <option value="5">5 días antes</option>
                <option value="7">1 semana antes</option>
              </select>
              
              <!-- Visualización en texto -->
              <span class="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
                Notifica tareas que vencen {{ getDaysDescription(settings.dueTomorrowAdvanceDays) }}
              </span>
            </div>
          </div>
          
          <!-- Último envío -->
          <div v-if="settings.lastDueTomorrowRun" class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Último envío: {{ formatDate(settings.lastDueTomorrowRun) }}</span>
          </div>
          
          <!-- Botón enviar ahora -->
          <div class="flex justify-end">
            <button 
              class="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
              @click="sendManualDueTomorrowReminder"
              :disabled="sending.dueTomorrow || !whatsappStatus"
            >
              <svg v-if="sending.dueTomorrow" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span v-if="sending.dueTomorrow">Enviando...</span>
              <span v-else>Enviar recordatorio ahora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Estado de WhatsApp -->
    <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-5 border border-blue-500/20 mt-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="p-2 rounded-lg bg-blue-700/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-white">Estado de WhatsApp</h3>
      </div>
      
      <div class="flex flex-col md:flex-row gap-4 justify-between">
        <div class="space-y-2">
          <div class="flex items-center">
            <div 
              class="w-3 h-3 rounded-full mr-2"
              :class="whatsappStatus ? 'bg-green-500' : 'bg-red-500'"
            ></div>
            <span class="text-sm font-medium" :class="whatsappStatus ? 'text-green-400' : 'text-red-400'">
              {{ whatsappStatus ? 'WhatsApp conectado' : 'WhatsApp desconectado' }}
            </span>
          </div>
          
          <p class="text-sm text-gray-300">
            Para que los reportes automáticos funcionen correctamente, WhatsApp debe estar conectado al sistema.
          </p>
        </div>
        
        <div>
          <a 
            href="/vincular-wpp" 
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Ir a página de vinculación
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppLoader from '@/components/ui/AppLoader.vue'
import { ref, onMounted } from 'vue'
import { taskReportService } from '../../services/taskReportService'
import { useToast } from '../../composables/useToast'

const { toast, showError } = useToast()

// Estado
const settings = ref({
  dailySummaryEnabled: true,
  dailySummaryTime: '23:00',
  dailySummaryDays: [1, 2, 3, 4, 5], // Lunes a Viernes
  dueTomorrowEnabled: true,
  dueTomorrowTime: '08:00',
  dueTomorrowDays: [1, 2, 3, 4, 5], // Lunes a Viernes
  dueTomorrowAdvanceDays: 1,
  lastDailyRun: null,
  lastDueTomorrowRun: null
})

// Días de la semana
const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// Zona horaria actual
const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const loading = ref(true)
const whatsappStatus = ref(false)
const sending = ref({
  daily: false,
  dueTomorrow: false
})

// Cargar configuraciones
onMounted(async () => {
  try {
    await checkWhatsAppStatus()
    await loadSettings()
  } catch (error) {
    console.error('Error en inicialización:', error)
    showError('Error al cargar los datos', error instanceof Error ? error.message : 'Error desconocido')
  }
})

async function loadSettings() {
  loading.value = true
  try {
    const data = await taskReportService.getSettings()
    settings.value = data
    console.log('Configuraciones cargadas:', data)
  } catch (error) {
    console.error('Error cargando configuraciones:', error)
    showError('Error al cargar configuraciones', error instanceof Error ? error.message : 'Error desconocido')
  } finally {
    loading.value = false
  }
}

// Verificar estado de WhatsApp
async function checkWhatsAppStatus() {
  try {
    const response = await fetch('https://gems-crm-backend.onrender.com/api/wpp-status')
    const data = await response.json()
    whatsappStatus.value = data.ready === true
  } catch (error) {
    whatsappStatus.value = false
    console.error('Error verificando estado de WhatsApp:', error)
  }
}

// Funciones para toggling de días
function toggleDailySummaryDay(dayIndex: number) {
  if (!settings.value.dailySummaryDays) {
    settings.value.dailySummaryDays = [];
  }
  
  const index = settings.value.dailySummaryDays.indexOf(dayIndex);
  if (index > -1) {
    settings.value.dailySummaryDays.splice(index, 1);
  } else {
    settings.value.dailySummaryDays.push(dayIndex);
  }
  
  updateSettings();
}

function toggleDueTomorrowDay(dayIndex: number) {
  if (!settings.value.dueTomorrowDays) {
    settings.value.dueTomorrowDays = [];
  }
  
  const index = settings.value.dueTomorrowDays.indexOf(dayIndex);
  if (index > -1) {
    settings.value.dueTomorrowDays.splice(index, 1);
  } else {
    settings.value.dueTomorrowDays.push(dayIndex);
  }
  
  updateSettings();
}

// Actualizar configuraciones
async function updateSettings() {
  try {
    await taskReportService.updateSettings({
      dailySummaryEnabled: settings.value.dailySummaryEnabled,
      dailySummaryTime: settings.value.dailySummaryTime,
      dailySummaryDays: settings.value.dailySummaryDays,
      dueTomorrowEnabled: settings.value.dueTomorrowEnabled,
      dueTomorrowTime: settings.value.dueTomorrowTime,
      dueTomorrowDays: settings.value.dueTomorrowDays,
      dueTomorrowAdvanceDays: settings.value.dueTomorrowAdvanceDays
    })
    
    toast('Configuración actualizada correctamente', 'success')
  } catch (error) {
    console.error('Error actualizando configuraciones:', error)
    showError('Error al guardar configuraciones', error instanceof Error ? error.message : 'Error desconocido')
    
    // Recargar configuraciones originales
    await loadSettings()
  }
}

// Enviar reportes manuales
async function sendManualDailySummary() {
  if (!whatsappStatus.value) {
    showError('WhatsApp no conectado', 'Es necesario vincular WhatsApp para enviar reportes')
    return
  }
  
  sending.value.daily = true
  try {
    await taskReportService.sendDailySummary()
    toast('Resumen diario enviado correctamente', 'success')
    
    // Recargar para obtener última fecha de ejecución
    await loadSettings()
  } catch (error) {
    console.error('Error enviando resumen diario:', error)
    showError('Error al enviar resumen', error instanceof Error ? error.message : 'Error desconocido')
  } finally {
    sending.value.daily = false
  }
}

async function sendManualDueTomorrowReminder() {
  if (!whatsappStatus.value) {
    showError('WhatsApp no conectado', 'Es necesario vincular WhatsApp para enviar reportes')
    return
  }
  
  sending.value.dueTomorrow = true
  try {
    await taskReportService.sendDueTomorrowReminder()
    toast('Recordatorio de vencimiento enviado correctamente', 'success')
    
    // Recargar para obtener última fecha de ejecución
    await loadSettings()
  } catch (error) {
    console.error('Error enviando recordatorio:', error)
    showError('Error al enviar recordatorio', error instanceof Error ? error.message : 'Error desconocido')
  } finally {
    sending.value.dueTomorrow = false
  }
}

// Utilidades
function formatDate(dateString: string) {
  if (!dateString) return ''
  
  return new Date(dateString).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Formatear fecha corta
function formatDateShort(dateString: string) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // Si es hoy
  if (date.toDateString() === today.toDateString()) {
    return `Hoy a las ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  
  // Si fue ayer
  if (date.toDateString() === yesterday.toDateString()) {
    return `Ayer a las ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  
  // Cualquier otro día
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Formatear descripción de tiempo
function formatTimeDescription(time: string) {
  if (!time) return ''
  
  const [hour, minute] = time.split(':')
  const hourNum = parseInt(hour, 10)
  
  if (hourNum < 12) {
    return `${hour}:${minute} AM`
  } else if (hourNum === 12) {
    return `12:${minute} PM`
  } else {
    return `${hourNum - 12}:${minute} PM`
  }
}

// Obtener descripción de los días seleccionados
function getSelectedDaysText(dayIndices: number[]) {
  if (!dayIndices || dayIndices.length === 0) {
    return 'Ningún día seleccionado'
  }
  
  // Ordenar los días para mostrarlos en orden
  const sortedIndices = [...dayIndices].sort((a, b) => a - b)
  
  if (sortedIndices.length === 7) {
    return 'Todos los días'
  }
  
  if (JSON.stringify(sortedIndices) === JSON.stringify([1, 2, 3, 4, 5])) {
    return 'De lunes a viernes'
  }
  
  if (JSON.stringify(sortedIndices) === JSON.stringify([0, 6])) {
    return 'Fines de semana'
  }
  
  return sortedIndices.map(index => weekdays[index].substring(0, 3)).join(', ')
}

// Obtener descripción de días de anticipación
function getDaysDescription(days: string | number) {
  const daysNum = parseInt(String(days), 10)
  
  switch(daysNum) {
    case 0:
      return 'el mismo día'
    case 1:
      return 'un día después'
    case 2:
      return 'en 2 días'
    case 3:
      return 'en 3 días'
    case 5:
      return 'en 5 días'
    case 7:
      return 'en una semana'
    default:
      return `en ${daysNum} días`
  }
}
</script>