<template>
  <div class="h-full flex flex-col gap-4">
    <!-- Page Header -->
    <div class="flex items-center justify-between gap-4 flex-shrink-0">
      <div>
        <div class="flex items-center gap-2.5 mb-1 flex-wrap">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <i class="fas fa-wand-magic-sparkles text-xs"></i>
          </div>
          <h1 class="text-xl font-black text-slate-900">Prospectos IA</h1>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-wider">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            En desarrollo
          </span>
        </div>
        <p class="text-xs font-medium text-amber-700 ml-12 font-bold">
          ⚠️ Módulo en construcción — no usar en producción aún
        </p>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <!-- Stats Bar -->
        <div class="hidden lg:flex items-center gap-2">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-slate-100 text-slate-700 border-slate-200" title="Total de prospectos">
            <i class="fas fa-users text-[10px] opacity-70"></i>
            <span class="text-[10px] font-black uppercase tracking-wider">Total</span>
            <span class="text-[12px] font-black ml-1">{{ prospects.length }}</span>
          </div>
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-amber-50 text-amber-700 border-amber-200" title="Activos: nuevo/calificado/propuesta/seguimiento">
            <i class="fas fa-fire text-[10px] opacity-70"></i>
            <span class="text-[10px] font-black uppercase tracking-wider">Activos</span>
            <span class="text-[12px] font-black ml-1">{{ activosCount }}</span>
          </div>
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-emerald-50 text-emerald-700 border-emerald-200" title="Cerrados como ganados">
            <i class="fas fa-trophy text-[10px] opacity-70"></i>
            <span class="text-[10px] font-black uppercase tracking-wider">Ganados</span>
            <span class="text-[12px] font-black ml-1">{{ ganadosCount }}</span>
          </div>
          <div
            v-if="forecastWeighted > 0"
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-700 border-violet-200"
            :title="`Pipeline bruto: $${formatMoney(pipelineGross)} · Forecast ponderado por probabilidad`"
          >
            <i class="fas fa-chart-line text-[10px] opacity-70"></i>
            <span class="text-[10px] font-black uppercase tracking-wider">Forecast</span>
            <span class="text-[12px] font-black ml-1">${{ formatMoney(forecastWeighted) }}</span>
          </div>
        </div>

        <!-- View Toggle -->
        <div class="flex bg-slate-100 rounded-xl p-1">
          <button
            @click="viewMode = 'list'"
            :class="[
              'px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-1.5',
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
            ]"
          >
            <i class="fas fa-list text-[10px]"></i>Lista
          </button>
          <button
            @click="viewMode = 'kanban'"
            :class="[
              'px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-1.5',
              viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
            ]"
          >
            <i class="fas fa-columns text-[10px]"></i>Pipeline
          </button>
        </div>

        <!-- Import button -->
        <button
          @click="showImport = true"
          class="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-black rounded-xl transition-all flex items-center gap-1.5"
        >
          <i class="fas fa-file-import text-[10px]"></i>
          Importar
        </button>
      </div>
    </div>

    <!-- LIST VIEW: 3-pane -->
    <div v-if="viewMode === 'list'" class="flex-1 grid grid-cols-12 gap-4 min-h-0">
      <div class="col-span-12 md:col-span-4 lg:col-span-3 min-h-0 h-[calc(100vh-160px)] md:h-auto">
        <ProspectsList
          :prospects="prospects"
          :selected-id="selected?._id"
          :loading="loading"
          @select="selectProspect"
          @new="openGenerator"
          @import="showImport = true"
        />
      </div>
      <div class="col-span-12 md:col-span-8 lg:col-span-9 min-h-0 h-[calc(100vh-160px)] md:h-auto">
        <transition name="fade" mode="out-in">
          <ProspectGenerator
            v-if="showGenerator || (!selected && !loading)"
            key="generator"
            @created="onProspectCreated"
          />
          <ProspectDetail
            v-else-if="selected"
            :key="selected._id"
            :prospect="selected"
            @updated="onProspectUpdated"
            @delete="confirmDeleteProspect"
          />
          <div
            v-else
            key="loading"
            class="bg-white rounded-2xl border border-slate-200 h-full flex items-center justify-center"
          >
            <div class="text-center">
              <i class="fas fa-circle-notch fa-spin text-3xl text-violet-400 mb-3 block"></i>
              <p class="text-xs font-bold text-slate-400">Cargando prospectos...</p>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- KANBAN VIEW -->
    <div v-else class="flex-1 min-h-0 h-[calc(100vh-160px)]">
      <ProspectKanban
        :prospects="prospects"
        @select="openDetailFromKanban"
        @status-change="onKanbanStatusChange"
      />
    </div>

    <!-- Modals -->
    <ProspectImport
      v-if="showImport"
      :is-open="showImport"
      @close="showImport = false"
      @imported="onImported"
    />

    <!-- Detail dialog from kanban -->
    <div
      v-if="kanbanDetailProspect"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      @click.self="kanbanDetailProspect = null"
    >
      <div class="bg-transparent w-full max-w-4xl h-[85vh]">
        <ProspectDetail
          :prospect="kanbanDetailProspect"
          @updated="onProspectUpdated"
          @delete="confirmDeleteProspect"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { prospectService } from '@/services/prospectService'
import type { Prospect, ProspectStatus } from '@/types/prospect'
import { forecastValue } from '@/types/prospect'
import { useNotifications } from '@/composables/useNotifications'
import ProspectsList from '@/components/prospects/ProspectsList.vue'
import ProspectDetail from '@/components/prospects/ProspectDetail.vue'
import ProspectGenerator from '@/components/prospects/ProspectGenerator.vue'
import ProspectKanban from '@/components/prospects/ProspectKanban.vue'
import ProspectImport from '@/components/prospects/ProspectImport.vue'

const { showError, showSuccess, confirmDelete } = useNotifications()

const prospects = ref<Prospect[]>([])
const selected = ref<Prospect | null>(null)
const loading = ref(true)
const showGenerator = ref(false)
const showImport = ref(false)
const viewMode = ref<'list' | 'kanban'>('list')
const kanbanDetailProspect = ref<Prospect | null>(null)

const activosCount = computed(
  () => prospects.value.filter((p) => ['nuevo', 'calificado', 'propuesta', 'seguimiento'].includes(p.status ?? 'nuevo')).length
)
const ganadosCount = computed(() => prospects.value.filter((p) => p.status === 'ganado').length)
const activeProspects = computed(() =>
  prospects.value.filter((p) => ['nuevo', 'calificado', 'propuesta', 'seguimiento'].includes(p.status ?? 'nuevo'))
)
const pipelineGross = computed(() => activeProspects.value.reduce((sum, p) => sum + (p.estimatedValue || 0), 0))
const forecastWeighted = computed(() => Math.round(forecastValue(activeProspects.value)))

const formatMoney = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k'
  return String(n)
}

const loadProspects = async () => {
  loading.value = true
  try {
    prospects.value = await prospectService.list()
  } catch (err: any) {
    showError(err?.message || 'No se pudieron cargar los prospectos')
  } finally {
    loading.value = false
  }
}

const selectProspect = (prospect: Prospect) => {
  selected.value = prospect
  showGenerator.value = false
}

const openGenerator = () => {
  selected.value = null
  showGenerator.value = true
}

const onProspectCreated = async (id: string) => {
  showGenerator.value = false
  await loadProspects()
  const created = prospects.value.find((p) => p._id === id)
  if (created) selected.value = created
  showSuccess('Propuesta generada')
}

const onProspectUpdated = (updated: Prospect) => {
  const idx = prospects.value.findIndex((p) => p._id === updated._id)
  if (idx !== -1) prospects.value[idx] = updated
  if (selected.value?._id === updated._id) selected.value = updated
  if (kanbanDetailProspect.value?._id === updated._id) kanbanDetailProspect.value = updated
}

const confirmDeleteProspect = async (prospect: Prospect) => {
  const result = await confirmDelete(`¿Eliminar el prospecto "${prospect.prospectName}"?`)
  if (!result.isConfirmed) return
  try {
    await prospectService.delete(prospect._id)
    prospects.value = prospects.value.filter((p) => p._id !== prospect._id)
    if (selected.value?._id === prospect._id) selected.value = null
    if (kanbanDetailProspect.value?._id === prospect._id) kanbanDetailProspect.value = null
    showSuccess('Prospecto eliminado')
  } catch (err: any) {
    showError(err?.message || 'No se pudo eliminar')
  }
}

const onImported = async () => {
  await loadProspects()
}

const openDetailFromKanban = (prospect: Prospect) => {
  kanbanDetailProspect.value = prospect
}

const onKanbanStatusChange = (prospect: Prospect, status: ProspectStatus) => {
  prospectService.setStatus(prospect._id, status)
  const updated = { ...prospect, status }
  onProspectUpdated(updated)
  showSuccess(`Movido a "${status}"`)
}

onMounted(() => {
  loadProspects()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
