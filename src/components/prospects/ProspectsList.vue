<template>
  <div class="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <!-- Header con búsqueda -->
    <div class="px-4 py-4 border-b border-slate-100">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-black text-slate-900">
          Prospectos
          <span class="ml-1 text-xs font-bold text-slate-400">({{ filtered.length }})</span>
        </h3>
        <button
          @click="$emit('new')"
          class="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
          title="Nuevo prospecto"
        >
          <i class="fas fa-plus text-xs"></i>
        </button>
      </div>

      <div class="relative">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por empresa, nombre..."
          class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all"
        />
      </div>
    </div>

    <!-- Stats Pills -->
    <div class="px-4 py-3 border-b border-slate-100 flex gap-1.5 overflow-x-auto custom-scrollbar">
      <button
        @click="statusFilter = 'all'"
        :class="[
          'flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all',
          statusFilter === 'all'
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50',
        ]"
      >
        Todos · {{ prospects.length }}
      </button>
      <button
        v-for="status in PROSPECT_STATUSES"
        :key="status.value"
        @click="statusFilter = status.value"
        :class="[
          'flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all whitespace-nowrap',
          statusFilter === status.value
            ? status.color + ' shadow-sm'
            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50',
        ]"
      >
        <i :class="['fas', status.icon, 'mr-1']"></i>{{ status.label }} · {{ countByStatus(status.value) }}
      </button>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <div v-if="loading" class="p-4 space-y-2">
        <div v-for="i in 5" :key="i" class="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
      </div>

      <div v-else-if="!filtered.length" class="p-8 text-center">
        <div class="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-inbox text-slate-300 text-xl"></i>
        </div>
        <p class="text-xs font-bold text-slate-500 mb-1">
          {{ search || statusFilter !== 'all' ? 'Sin resultados' : 'No hay prospectos aún' }}
        </p>
        <p class="text-[10px] text-slate-400">
          {{ search || statusFilter !== 'all' ? 'Prueba ajustando los filtros' : 'Crea uno con el botón +' }}
        </p>
      </div>

      <div v-else class="p-2 space-y-1">
        <button
          v-for="prospect in filtered"
          :key="prospect._id"
          @click="$emit('select', prospect)"
          :class="[
            'w-full text-left p-3 rounded-xl transition-all group',
            selectedId === prospect._id
              ? 'bg-violet-50 ring-1 ring-violet-200'
              : 'hover:bg-slate-50',
          ]"
        >
          <div class="flex items-start gap-3">
            <!-- Avatar -->
            <div
              :class="[
                'w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0',
                avatarClass(prospect),
              ]"
            >
              {{ initials(prospect) }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-1">
                <h4 class="text-xs font-black text-slate-900 truncate leading-tight">
                  {{ prospect.prospectName }}
                </h4>
                <ProspectStatusBadge :status="prospect.status" mini />
              </div>
              <p v-if="prospect.company" class="text-[10px] font-bold text-slate-500 truncate mb-1">
                <i class="fas fa-building text-[9px] mr-1 opacity-60"></i>
                {{ prospect.company }}
              </p>
              <div class="flex items-center justify-between gap-2">
                <span class="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <i class="fas fa-comment text-[9px]"></i>
                  {{ prospect.messages?.length || 0 }} msg
                </span>
                <span v-if="prospect.lastUpdated" class="text-[10px] text-slate-400 font-medium">
                  {{ formatRelative(prospect.lastUpdated) }}
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Prospect, ProspectStatus } from '@/types/prospect'
import { PROSPECT_STATUSES } from '@/types/prospect'
import ProspectStatusBadge from './ProspectStatusBadge.vue'

interface Props {
  prospects: Prospect[]
  selectedId?: string | null
  loading?: boolean
}

const props = defineProps<Props>()

defineEmits<{
  select: [prospect: Prospect]
  new: []
}>()

const search = ref('')
const statusFilter = ref<'all' | ProspectStatus>('all')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return props.prospects
    .filter((p) => {
      if (statusFilter.value !== 'all' && (p.status ?? 'nuevo') !== statusFilter.value) return false
      if (!q) return true
      return (
        p.prospectName?.toLowerCase().includes(q) ||
        p.company?.toLowerCase().includes(q) ||
        p.contactName?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const da = new Date(a.lastUpdated || a.createdAt || 0).getTime()
      const db = new Date(b.lastUpdated || b.createdAt || 0).getTime()
      return db - da
    })
})

const countByStatus = (status: ProspectStatus) =>
  props.prospects.filter((p) => (p.status ?? 'nuevo') === status).length

const initials = (prospect: Prospect) => {
  const source = prospect.company || prospect.prospectName || '?'
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('') || '?'
}

const avatarPalette = [
  'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white',
  'bg-gradient-to-br from-cyan-500 to-blue-500 text-white',
  'bg-gradient-to-br from-emerald-500 to-teal-500 text-white',
  'bg-gradient-to-br from-amber-500 to-orange-500 text-white',
  'bg-gradient-to-br from-rose-500 to-pink-500 text-white',
  'bg-gradient-to-br from-slate-700 to-slate-900 text-white',
]
const avatarClass = (prospect: Prospect) => {
  const seed = prospect._id?.charCodeAt(0) || 0
  return avatarPalette[seed % avatarPalette.length]
}

const formatRelative = (date: string | number) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: false, locale: es })
  } catch {
    return ''
  }
}
</script>
