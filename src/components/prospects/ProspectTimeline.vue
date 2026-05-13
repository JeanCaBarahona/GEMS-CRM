<template>
  <div class="p-5">
    <div v-if="timeline.length" class="relative">
      <!-- Vertical line -->
      <div class="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200"></div>

      <div class="space-y-3">
        <div v-for="entry in timeline" :key="entry.id" class="flex gap-3 relative">
          <div
            :class="[
              'relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white',
              styleFor(entry.type).bg,
            ]"
          >
            <i :class="['fas text-[10px] text-white', styleFor(entry.type).icon]"></i>
          </div>
          <div class="flex-1 min-w-0 pt-1.5 pb-3">
            <p class="text-xs font-bold text-slate-800 leading-snug">{{ entry.description }}</p>
            <p class="text-[10px] font-bold text-slate-400 mt-0.5">{{ formatDate(entry.createdAt) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <i class="fas fa-clock-rotate-left text-3xl text-slate-200 mb-2 block"></i>
      <p class="text-xs font-bold text-slate-400">Sin actividad registrada aún</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ProspectTimelineEntry, TimelineEventType } from '@/types/prospect'

interface Props {
  timeline: ProspectTimelineEntry[]
}

defineProps<Props>()

const STYLES: Record<TimelineEventType, { icon: string; bg: string }> = {
  created:           { icon: 'fa-sparkles',     bg: 'bg-gradient-to-br from-violet-500 to-fuchsia-500' },
  status:            { icon: 'fa-arrow-right',  bg: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
  outreach_email:    { icon: 'fa-envelope',     bg: 'bg-gradient-to-br from-violet-500 to-fuchsia-500' },
  outreach_whatsapp: { icon: 'fa-comment-dots', bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
  outreach_call:     { icon: 'fa-phone',        bg: 'bg-gradient-to-br from-cyan-500 to-blue-500' },
  note:              { icon: 'fa-note-sticky',  bg: 'bg-gradient-to-br from-amber-400 to-amber-500' },
  task_created:      { icon: 'fa-list-check',   bg: 'bg-gradient-to-br from-indigo-500 to-blue-500' },
  task_completed:    { icon: 'fa-check',        bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
  converted:         { icon: 'fa-trophy',       bg: 'bg-gradient-to-br from-amber-500 to-orange-500' },
  ai_summary:        { icon: 'fa-wand-magic-sparkles', bg: 'bg-gradient-to-br from-fuchsia-500 to-pink-500' },
  ai_action:         { icon: 'fa-brain',        bg: 'bg-gradient-to-br from-violet-500 to-purple-500' },
}

const styleFor = (type: TimelineEventType) => STYLES[type] || { icon: 'fa-circle', bg: 'bg-slate-400' }

const formatDate = (iso: string) => {
  try {
    return format(new Date(iso), "d MMM yyyy, HH:mm", { locale: es })
  } catch {
    return ''
  }
}
</script>
