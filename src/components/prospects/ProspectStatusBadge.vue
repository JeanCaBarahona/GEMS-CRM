<template>
  <span
    v-if="config"
    :class="[
      'inline-flex items-center gap-1 font-black border rounded-md',
      config.color,
      mini ? 'text-[8px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1',
    ]"
  >
    <i :class="['fas', config.icon, mini ? 'text-[7px]' : 'text-[9px]']"></i>
    <span v-if="!mini">{{ config.label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProspectStatus } from '@/types/prospect'
import { PROSPECT_STATUSES } from '@/types/prospect'

interface Props {
  status?: ProspectStatus
  mini?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: 'nuevo',
  mini: false,
})

const config = computed(() => PROSPECT_STATUSES.find((s) => s.value === props.status))
</script>
