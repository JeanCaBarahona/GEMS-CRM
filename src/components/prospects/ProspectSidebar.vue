<template>
  <aside class="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full">
    <!-- Score + Temperatura -->
    <div class="px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lead Score</span>
        <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border', tempStyle.color]">
          {{ tempStyle.icon }} {{ tempStyle.label }}
        </span>
      </div>
      <div class="flex items-baseline gap-2">
        <span class="text-3xl font-black" :class="scoreColor">{{ score }}</span>
        <span class="text-[10px] text-slate-400 font-bold">/ 100</span>
      </div>
      <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
        <div :class="['h-full transition-all', scoreBarBg]" :style="{ width: score + '%' }"></div>
      </div>
    </div>

    <!-- Metadata fields -->
    <div class="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
      <!-- Valor estimado -->
      <div>
        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Valor estimado</label>
        <div v-if="!editingValue" @click="startEditValue" class="cursor-pointer group">
          <p v-if="prospect.estimatedValue" class="text-base font-black text-emerald-600">
            ${{ formatMoney(prospect.estimatedValue) }}
            <span v-if="weighted" class="text-[10px] text-slate-400 font-bold ml-2">
              (forecast: ${{ formatMoney(weighted) }})
            </span>
          </p>
          <p v-else class="text-xs font-bold text-slate-400 group-hover:text-violet-600">+ Añadir valor</p>
        </div>
        <div v-else class="flex gap-2">
          <input
            v-model.number="valueInput"
            type="number"
            placeholder="USD"
            class="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:bg-white focus:border-violet-500 outline-none"
            @keydown.enter="saveValue"
            @keydown.escape="editingValue = false"
            ref="valueInputRef"
          />
          <button @click="saveValue" class="px-2 bg-violet-600 text-white rounded-lg text-[10px] font-black">OK</button>
        </div>
      </div>

      <!-- Fuente -->
      <div>
        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Fuente</label>
        <select
          :value="prospect.source || ''"
          @change="updateSource(($event.target as HTMLSelectElement).value as ProspectSource)"
          class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:bg-white focus:border-violet-500 outline-none cursor-pointer"
        >
          <option value="">— Sin definir —</option>
          <option v-for="src in PROSPECT_SOURCES" :key="src.value" :value="src.value">
            {{ src.label }}
          </option>
        </select>
      </div>

      <!-- Contacto -->
      <div class="space-y-2">
        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Contacto</label>
        <SidebarField
          icon="fa-user"
          placeholder="Nombre del contacto"
          :value="prospect.contactName || ''"
          @save="(v) => updateMeta({ contactName: v })"
        />
        <SidebarField
          icon="fa-envelope"
          placeholder="Email"
          type="email"
          :value="prospect.contactEmail || ''"
          @save="(v) => updateMeta({ contactEmail: v })"
        />
        <SidebarField
          icon="fa-phone"
          placeholder="Teléfono"
          :value="prospect.contactPhone || ''"
          @save="(v) => updateMeta({ contactPhone: v })"
        />
      </div>

      <!-- Empresa -->
      <div v-if="prospect.company">
        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Empresa</label>
        <p class="text-xs font-bold text-slate-700">{{ prospect.company }}</p>
      </div>

      <!-- Fechas -->
      <div>
        <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tiempo</label>
        <div class="space-y-1">
          <p class="text-[10px] text-slate-500 font-bold">
            <i class="fas fa-plus text-[9px] opacity-50 mr-1"></i>
            Creado {{ formatRelative(prospect.createdAt) }}
          </p>
          <p v-if="prospect.lastUpdated" class="text-[10px] text-slate-500 font-bold">
            <i class="fas fa-clock text-[9px] opacity-50 mr-1"></i>
            Última actividad {{ formatRelative(prospect.lastUpdated) }}
          </p>
        </div>
      </div>

      <!-- Stats -->
      <div class="pt-3 border-t border-slate-100">
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-slate-50 rounded-lg p-2.5">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Mensajes</p>
            <p class="text-sm font-black text-slate-800">{{ prospect.messages?.length || 0 }}</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-2.5">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tareas</p>
            <p class="text-sm font-black text-slate-800">
              {{ tasks.filter((t) => !t.done).length }}
              <span class="text-[10px] text-slate-400">/ {{ tasks.length }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, defineComponent, h } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Prospect, ProspectSource, ProspectTask } from '@/types/prospect'
import { PROSPECT_SOURCES, probabilityFor } from '@/types/prospect'
import { prospectService } from '@/services/prospectService'

interface Props {
  prospect: Prospect
  tasks: ProspectTask[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [prospect: Prospect]
}>()

const editingValue = ref(false)
const valueInput = ref<number | null>(null)
const valueInputRef = ref<HTMLInputElement | null>(null)

const score = computed(() => prospectService.computeLeadScore(props.prospect, props.tasks))
const temperature = computed(() => prospectService.computeTemperature(props.prospect, score.value))

const tempStyle = computed(() => {
  const t = temperature.value
  if (t === 'hot') return { label: 'Hot', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: '🔥' }
  if (t === 'warm') return { label: 'Warm', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '☀️' }
  return { label: 'Cold', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: '❄️' }
})

const scoreColor = computed(() =>
  score.value >= 70 ? 'text-emerald-600' : score.value >= 40 ? 'text-amber-600' : 'text-slate-500'
)
const scoreBarBg = computed(() =>
  score.value >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
  score.value >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
  'bg-gradient-to-r from-slate-300 to-slate-400'
)

const weighted = computed(() => {
  if (!props.prospect.estimatedValue) return 0
  return Math.round((props.prospect.estimatedValue * probabilityFor(props.prospect.status)) / 100)
})

const formatMoney = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k'
  return String(n)
}

const formatRelative = (d?: string | number) => {
  if (!d) return ''
  try {
    return formatDistanceToNow(new Date(d), { addSuffix: true, locale: es })
  } catch {
    return ''
  }
}

const startEditValue = async () => {
  editingValue.value = true
  valueInput.value = props.prospect.estimatedValue || null
  await nextTick()
  valueInputRef.value?.focus()
}

const saveValue = async () => {
  const v = valueInput.value ?? 0
  editingValue.value = false
  emit('updated', { ...props.prospect, estimatedValue: v })
  await prospectService.setMetadata(props.prospect._id, { estimatedValue: v })
}

const updateSource = async (source: ProspectSource | '') => {
  const value = (source || undefined) as ProspectSource | undefined
  emit('updated', { ...props.prospect, source: value })
  await prospectService.setMetadata(props.prospect._id, { source: value })
}

const updateMeta = async (meta: Partial<{ contactName: string; contactEmail: string; contactPhone: string }>) => {
  emit('updated', { ...props.prospect, ...meta })
  await prospectService.setMetadata(props.prospect._id, meta)
}

// Inline mini-component for editable text fields
const SidebarField = defineComponent({
  props: {
    icon: { type: String, required: true },
    placeholder: { type: String, required: true },
    value: { type: String, default: '' },
    type: { type: String, default: 'text' },
  },
  emits: ['save'],
  setup(props, { emit }) {
    const editing = ref(false)
    const input = ref(props.value)
    const inputRef = ref<HTMLInputElement | null>(null)

    const start = async () => {
      editing.value = true
      input.value = props.value
      await nextTick()
      inputRef.value?.focus()
    }

    const save = () => {
      emit('save', input.value.trim())
      editing.value = false
    }

    return () => {
      if (!editing.value) {
        return h(
          'div',
          {
            class: 'flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors group',
            onClick: start,
          },
          [
            h('i', { class: `fas ${props.icon} text-[10px] text-slate-400 group-hover:text-violet-600` }),
            props.value
              ? h('span', { class: 'text-[11px] font-bold text-slate-700 truncate flex-1' }, props.value)
              : h('span', { class: 'text-[11px] font-bold text-slate-400 italic flex-1' }, props.placeholder),
          ]
        )
      }
      return h('div', { class: 'flex gap-1.5' }, [
        h('input', {
          ref: inputRef,
          type: props.type,
          value: input.value,
          placeholder: props.placeholder,
          class: 'flex-1 px-2.5 py-1.5 bg-white border border-violet-300 rounded-lg text-[11px] font-bold focus:border-violet-500 outline-none',
          onInput: (e: any) => (input.value = e.target.value),
          onKeydown: (e: KeyboardEvent) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') editing.value = false
          },
        }),
        h('button', {
          class: 'px-2 bg-violet-600 text-white rounded-lg text-[10px] font-black',
          onClick: save,
        }, 'OK'),
      ])
    }
  },
})
</script>
