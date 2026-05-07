<template>
  <div class="h-full flex flex-col gap-4">
    <!-- Page Header -->
    <div class="flex items-center justify-between gap-4 flex-shrink-0">
      <div>
        <div class="flex items-center gap-2.5 mb-1">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <i class="fas fa-wand-magic-sparkles text-xs"></i>
          </div>
          <h1 class="text-xl font-black text-slate-900">Prospectos IA</h1>
        </div>
        <p class="text-xs font-medium text-slate-500 ml-12">
          Convierte conversaciones en propuestas comerciales con IA
        </p>
      </div>

      <!-- Stats Bar -->
      <div class="hidden md:flex items-center gap-2">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-slate-100 text-slate-700 border-slate-200">
          <i class="fas fa-users text-[10px] opacity-70"></i>
          <span class="text-[10px] font-black uppercase tracking-wider">Total</span>
          <span class="text-[12px] font-black ml-1">{{ prospects.length }}</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-amber-50 text-amber-700 border-amber-200">
          <i class="fas fa-fire text-[10px] opacity-70"></i>
          <span class="text-[10px] font-black uppercase tracking-wider">Activos</span>
          <span class="text-[12px] font-black ml-1">{{ activosCount }}</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-emerald-50 text-emerald-700 border-emerald-200">
          <i class="fas fa-trophy text-[10px] opacity-70"></i>
          <span class="text-[10px] font-black uppercase tracking-wider">Ganados</span>
          <span class="text-[12px] font-black ml-1">{{ ganadosCount }}</span>
        </div>
      </div>
    </div>

    <!-- 3-pane layout -->
    <div class="flex-1 grid grid-cols-12 gap-4 min-h-0">
      <!-- Left: List -->
      <div class="col-span-12 md:col-span-4 lg:col-span-3 min-h-0 h-[calc(100vh-160px)] md:h-auto">
        <ProspectsList
          :prospects="prospects"
          :selected-id="selected?._id"
          :loading="loading"
          @select="selectProspect"
          @new="openGenerator"
        />
      </div>

      <!-- Right: Detail or Generator -->
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { prospectService } from '@/services/prospectService'
import type { Prospect } from '@/types/prospect'
import { useNotifications } from '@/composables/useNotifications'
import ProspectsList from '@/components/prospects/ProspectsList.vue'
import ProspectDetail from '@/components/prospects/ProspectDetail.vue'
import ProspectGenerator from '@/components/prospects/ProspectGenerator.vue'

const { showError, showSuccess, confirmDelete } = useNotifications()

const prospects = ref<Prospect[]>([])
const selected = ref<Prospect | null>(null)
const loading = ref(true)
const showGenerator = ref(false)

const activosCount = computed(
  () => prospects.value.filter((p) => ['nuevo', 'calificado', 'propuesta', 'seguimiento'].includes(p.status ?? 'nuevo')).length
)
const ganadosCount = computed(() => prospects.value.filter((p) => p.status === 'ganado').length)

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
}

const confirmDeleteProspect = async (prospect: Prospect) => {
  const result = await confirmDelete(`¿Eliminar el prospecto "${prospect.prospectName}"?`)
  if (!result.isConfirmed) return
  try {
    await prospectService.delete(prospect._id)
    prospects.value = prospects.value.filter((p) => p._id !== prospect._id)
    if (selected.value?._id === prospect._id) selected.value = null
    showSuccess('Prospecto eliminado')
  } catch (err: any) {
    showError(err?.message || 'No se pudo eliminar')
  }
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
