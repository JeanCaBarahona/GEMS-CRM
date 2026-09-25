<template>
  <!-- Loader de la app: anillo en degradado que gira + núcleo que late.
       Para contenido con forma conocida preferir SkeletonBoard. -->
  <div class="flex flex-col items-center justify-center gap-3" :class="padded ? 'py-12' : ''" role="status" aria-live="polite">
    <div class="relative" :style="{ width: px + 'px', height: px + 'px' }">
      <span class="app-loader-ring absolute inset-0 rounded-full"></span>
      <span class="app-loader-core absolute rounded-full bg-primary-500" :style="coreStyle"></span>
    </div>
    <p v-if="label" class="app-loader-label text-[11px] font-bold text-slate-400 tracking-wide">{{ label }}</p>
    <span v-else class="sr-only">Cargando…</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  label?: string
  padded?: boolean
}>(), {
  size: 'md',
  label: '',
  padded: true
})

const px = computed(() => ({ sm: 24, md: 40, lg: 52 }[props.size]))
const coreStyle = computed(() => {
  const core = Math.round(px.value * 0.22)
  const offset = (px.value - core) / 2
  return { width: core + 'px', height: core + 'px', top: offset + 'px', left: offset + 'px' }
})
</script>

<style scoped>
.app-loader-ring {
  background: conic-gradient(from 0deg, rgba(14, 165, 233, 0) 0deg, #38bdf8 200deg, #6366f1 360deg);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
  animation: app-loader-spin 0.9s linear infinite;
}
.app-loader-core {
  animation: app-loader-pulse 1.2s var(--ease-smooth, ease-in-out) infinite;
}
.app-loader-label {
  animation: app-loader-fade 1.6s ease-in-out infinite;
}
@keyframes app-loader-spin {
  to { transform: rotate(360deg); }
}
@keyframes app-loader-pulse {
  0%, 100% { transform: scale(0.7); opacity: 0.55; }
  50% { transform: scale(1.15); opacity: 1; }
}
@keyframes app-loader-fade {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .app-loader-ring { animation-duration: 2.4s !important; animation-iteration-count: infinite !important; }
}
</style>
