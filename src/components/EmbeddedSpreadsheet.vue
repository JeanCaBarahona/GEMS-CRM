<template>
  <div class="embedded-spreadsheet">
    <div v-if="loadError" class="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <i class="fas fa-exclamation-triangle text-amber-500 text-xl"></i>
      <p class="text-sm font-bold text-slate-600">No se pudo cargar la hoja de cálculo.</p>
      <p class="text-xs text-slate-400">{{ loadError }}</p>
      <button
        type="button"
        @click="init"
        class="mt-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-colors"
      >
        Reintentar
      </button>
    </div>

    <div v-else-if="loading" class="flex flex-col items-center justify-center gap-2 py-16">
      <i class="fas fa-spinner fa-spin text-slate-300 text-2xl"></i>
      <p class="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Cargando hoja de cálculo…</p>
    </div>

    <div ref="containerRef" class="embedded-spreadsheet__canvas" :class="{ hidden: loading || !!loadError }"></div>

    <div v-if="!loading && !loadError" class="embedded-spreadsheet__status">
      <span v-if="saving"><i class="fas fa-spinner fa-spin mr-1"></i>Guardando…</span>
      <span v-else-if="lastSavedAt">Guardado {{ formatTime(lastSavedAt) }}</span>
      <span v-else class="text-slate-300">Sin cambios aún</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { casesService } from '../services/casesService'
import { wikiService } from '../services/wikiService'

const props = defineProps<{
  entityType: 'cases' | 'wiki'
  entityId: string
  /** Solo se inicializa cuando es true — para no montar Univer hasta que la pestaña esté visible. */
  active: boolean
}>()

const containerRef = ref<HTMLElement | null>(null)
const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const lastSavedAt = ref<Date | null>(null)

// Referencias imperativas de Univer — deliberadamente fuera de la reactividad
// de Vue (son instancias de una librería externa basada en canvas).
let univer: any = null
let univerAPI: any = null
let pollTimer: ReturnType<typeof setInterval> | null = null
let lastSnapshotJson = ''
let destroyed = false

const service = props.entityType === 'cases' ? casesService : wikiService

const formatTime = (d: Date) =>
  d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

const teardown = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  univerAPI = null
  try {
    univer?.dispose()
  } catch {
    // no-op: si ya se destruyó o falló a mitad de inicialización, no bloquear el unmount
  }
  univer = null
}

const saveIfChanged = async () => {
  if (!univerAPI) return
  const workbook = univerAPI.getActiveWorkbook()
  if (!workbook) return
  const snapshot = workbook.save()
  const json = JSON.stringify(snapshot)
  if (json === lastSnapshotJson) return // nada cambió desde el último guardado

  saving.value = true
  try {
    await service.saveSpreadsheet(props.entityId, snapshot)
    lastSnapshotJson = json
    lastSavedAt.value = new Date()
  } catch (err) {
    console.error('Error guardando la hoja de cálculo:', err)
  } finally {
    saving.value = false
  }
}

const init = async () => {
  teardown()
  loading.value = true
  loadError.value = ''

  try {
    const [presetsMod, sheetsCoreMod, localeMod] = await Promise.all([
      import('@univerjs/presets'),
      import('@univerjs/preset-sheets-core'),
      import('@univerjs/preset-sheets-core/locales/es-ES')
    ])

    if (destroyed) return // el componente se desmontó mientras cargaba el chunk

    const { createUniver, LocaleType } = presetsMod
    const { UniverSheetsCorePreset } = sheetsCoreMod
    const esES = (localeMod as any).default ?? localeMod

    const existing = await service.getSpreadsheet(props.entityId)

    if (destroyed || !containerRef.value) return

    const { univer: u, univerAPI: api } = createUniver({
      locale: LocaleType.ES_ES,
      locales: { [LocaleType.ES_ES]: esES },
      presets: [UniverSheetsCorePreset({ container: containerRef.value })]
    })
    univer = u
    univerAPI = api

    const workbook = api.createWorkbook((existing as any) || {})
    lastSnapshotJson = JSON.stringify(workbook.save())

    // Autosave: se compara el snapshot cada 2s y solo se guarda si cambió —
    // evita depender del nombre exacto de un evento interno de Univer y
    // evita pegarle al backend en cada tecla.
    pollTimer = setInterval(saveIfChanged, 2000)

    loading.value = false
  } catch (err: any) {
    console.error('Error inicializando la hoja de cálculo:', err)
    loadError.value = err?.message || 'Error desconocido al cargar Univer.'
    loading.value = false
  }
}

watch(
  () => props.active,
  (isActive) => {
    if (isActive && !univer && !loadError.value) init()
  },
  { immediate: true }
)

onMounted(() => {
  if (props.active) init()
})

onBeforeUnmount(async () => {
  destroyed = true
  await saveIfChanged() // último intento de guardar cambios pendientes antes de desmontar
  teardown()
})
</script>

<style scoped>
.embedded-spreadsheet {
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: white;
  overflow: hidden;
}

.embedded-spreadsheet__canvas {
  height: 560px;
  width: 100%;
}

.embedded-spreadsheet__status {
  padding: 6px 14px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
  font-size: 0.65rem;
  color: #94a3b8;
  font-weight: 700;
  text-align: right;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
</style>
