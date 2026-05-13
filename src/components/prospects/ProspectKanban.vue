<template>
  <div class="h-full overflow-x-auto custom-scrollbar bg-white rounded-2xl border border-slate-200 p-4">
    <div class="flex gap-3 h-full min-w-max">
      <div
        v-for="status in PROSPECT_STATUSES"
        :key="status.value"
        class="flex flex-col w-72 flex-shrink-0 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
        @dragover.prevent
        @drop.prevent="onDrop($event, status.value)"
        @dragenter.prevent="dragOverColumn = status.value"
        @dragleave="dragOverColumn = null"
        :class="{ 'ring-2 ring-violet-300 ring-offset-2': dragOverColumn === status.value }"
      >
        <!-- Column Header -->
        <div class="px-3 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div class="flex items-center gap-2">
            <div :class="['w-6 h-6 rounded-md border flex items-center justify-center', status.color]">
              <i :class="['fas', status.icon, 'text-[10px]']"></i>
            </div>
            <span class="text-[11px] font-black text-slate-700">{{ status.label }}</span>
            <span class="text-[10px] font-bold text-slate-400">·  {{ countFor(status.value) }}</span>
          </div>
          <span v-if="totalValueFor(status.value) > 0" class="text-[9px] font-black text-emerald-600">
            ${{ formatMoney(totalValueFor(status.value)) }}
          </span>
        </div>

        <!-- Cards -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          <div
            v-for="prospect in groupedProspects[status.value]"
            :key="prospect._id"
            draggable="true"
            @dragstart="onDragStart($event, prospect)"
            @dragend="onDragEnd"
            @click="$emit('select', prospect)"
            :class="[
              'p-3 rounded-xl border bg-white cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:-translate-y-0.5',
              draggingId === prospect._id ? 'opacity-40' : '',
            ]"
          >
            <div class="flex items-start gap-2 mb-2">
              <div
                :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0',
                  avatarClass(prospect),
                ]"
              >
                {{ initials(prospect) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1">
                  <h4 class="text-[11px] font-black text-slate-900 truncate leading-tight flex-1">
                    {{ prospect.prospectName }}
                  </h4>
                  <span v-if="tempOf(prospect)" class="text-[10px]" :title="`Score: ${scoreOf(prospect)}/100`">{{ tempOf(prospect) }}</span>
                </div>
                <p v-if="prospect.company" class="text-[10px] font-bold text-slate-500 truncate mt-0.5">
                  {{ prospect.company }}
                </p>
              </div>
            </div>

            <div class="flex items-center justify-between text-[9px] font-medium">
              <div class="flex items-center gap-2 text-slate-400">
                <span class="flex items-center gap-1">
                  <i class="fas fa-comment text-[8px]"></i>
                  {{ prospect.messages?.length || 0 }}
                </span>
                <span v-if="prospect.estimatedValue" class="text-emerald-600 font-black">
                  ${{ formatMoney(prospect.estimatedValue) }}
                </span>
              </div>
              <span v-if="prospect.lastUpdated" class="text-slate-400">
                {{ formatRelative(prospect.lastUpdated) }}
              </span>
            </div>
          </div>

          <div
            v-if="!groupedProspects[status.value]?.length"
            class="p-4 text-center"
          >
            <p class="text-[10px] text-slate-400 font-medium">Sin prospectos</p>
          </div>
        </div>
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
import { prospectService } from '@/services/prospectService'

interface Props {
  prospects: Prospect[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [prospect: Prospect]
  'status-change': [prospect: Prospect, status: ProspectStatus]
}>()

const draggingId = ref<string | null>(null)
const dragOverColumn = ref<ProspectStatus | null>(null)

const groupedProspects = computed(() => {
  const map: Record<string, Prospect[]> = {}
  PROSPECT_STATUSES.forEach((s) => (map[s.value] = []))
  props.prospects.forEach((p) => {
    const status = p.status ?? 'nuevo'
    if (map[status]) map[status].push(p)
  })
  // Sort by last updated desc within each column
  Object.keys(map).forEach((key) => {
    map[key].sort((a, b) => {
      const da = new Date(a.lastUpdated || a.createdAt || 0).getTime()
      const db = new Date(b.lastUpdated || b.createdAt || 0).getTime()
      return db - da
    })
  })
  return map
})

const countFor = (status: ProspectStatus) => groupedProspects.value[status]?.length || 0
const totalValueFor = (status: ProspectStatus) =>
  (groupedProspects.value[status] || []).reduce((sum, p) => sum + (p.estimatedValue || 0), 0)

const formatMoney = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k'
  return String(n)
}

const onDragStart = (e: DragEvent, prospect: Prospect) => {
  draggingId.value = prospect._id
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', prospect._id)
  }
}

const onDragEnd = () => {
  draggingId.value = null
  dragOverColumn.value = null
}

const onDrop = (e: DragEvent, status: ProspectStatus) => {
  dragOverColumn.value = null
  const id = e.dataTransfer?.getData('text/plain')
  if (!id) return
  const prospect = props.prospects.find((p) => p._id === id)
  if (!prospect) return
  if ((prospect.status ?? 'nuevo') === status) return
  emit('status-change', prospect, status)
}

const initials = (prospect: Prospect) => {
  const source = prospect.company || prospect.prospectName || '?'
  return (
    source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() || '')
      .join('') || '?'
  )
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

const scoreOf = (p: Prospect) => prospectService.computeLeadScore(p, prospectService.getTasks(p._id))
const tempOf = (p: Prospect) => {
  const s = scoreOf(p)
  const t = prospectService.computeTemperature(p, s)
  return t === 'hot' ? '🔥' : t === 'warm' ? '☀️' : ''
}
</script>
