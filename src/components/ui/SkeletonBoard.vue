<template>
  <!-- Esqueleto de carga: la forma del contenido con un brillo que la recorre -->
  <div aria-busy="true" aria-label="Cargando…" class="motion-stagger" :class="variant === 'kanban' ? 'grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-4' : 'space-y-2'">
    <template v-if="variant === 'kanban'">
      <div
        v-for="(cards, col) in [3, 2, 2, 1]"
        :key="col"
        class="bg-gradient-to-b from-slate-50/60 to-white border border-slate-200/60 rounded-xl p-3 sm:p-4 shadow-sm"
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="skeleton w-8 h-8 rounded-full"></div>
          <div class="skeleton h-3 w-24 rounded-full"></div>
          <div class="skeleton h-5 w-5 rounded-full ml-auto"></div>
        </div>
        <div class="flex flex-col gap-3">
          <div v-for="n in cards" :key="n" class="relative bg-white rounded-xl p-3 border border-slate-100 h-[150px] overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1.5 skeleton rounded-l-xl"></div>
            <div class="pl-2 space-y-2.5">
              <div class="skeleton h-3 w-14 rounded-full"></div>
              <div class="skeleton h-3.5 rounded-full" :style="{ width: 60 + ((n * 17 + col * 11) % 30) + '%' }"></div>
              <div class="skeleton h-2.5 w-1/3 rounded-full"></div>
            </div>
            <div class="absolute left-5 right-3 bottom-3 flex items-center gap-2">
              <div class="skeleton h-6 w-6 rounded-lg"></div>
              <div class="skeleton h-6 w-12 rounded-lg"></div>
              <div class="skeleton h-6 w-10 rounded-lg"></div>
              <div class="skeleton h-5 w-5 rounded-full ml-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div v-for="n in rows" :key="n" class="flex items-center gap-3 px-4 py-3.5 border-t border-slate-50 first:border-t-0">
        <div class="skeleton w-5 h-5 rounded-full"></div>
        <div class="flex-1 space-y-1.5">
          <div class="skeleton h-3 rounded-full" :style="{ width: 30 + ((n * 23) % 40) + '%' }"></div>
          <div class="skeleton h-2.5 w-1/5 rounded-full"></div>
        </div>
        <div class="skeleton hidden md:block h-6 w-6 rounded-full"></div>
        <div class="skeleton hidden md:block h-5 w-16 rounded-md"></div>
        <div class="skeleton hidden lg:block h-5 w-14 rounded-md"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'kanban' | 'list'
  rows?: number
}>(), {
  variant: 'kanban',
  rows: 7
})
</script>
