<template>
  <div ref="bellRoot" class="fixed bottom-6 right-6 z-50">
    <!-- Botón campana — minimalista, sin animaciones, perfectamente circular -->
    <button
      type="button"
      @click.stop="toggleDropdown"
      class="relative w-12 h-12 flex items-center justify-center bg-white border border-slate-200/80 rounded-full shadow-[0_4px_18px_-4px_rgba(15,23,42,0.12)] hover:border-slate-300 hover:shadow-[0_6px_22px_-4px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 transition-all duration-200 active:scale-95 group"
      title="Notificaciones"
    >
      <!-- Icono -->
      <i
        class="fas fa-bell text-[15px] transition-colors duration-200"
        :class="unreadCount > 0 ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'"
      ></i>

      <!-- Badge no leídas (sobrio y refinado) -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500/95 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-[1.5px] border-white shadow-[0_2px_6px_-1px_rgba(244,63,94,0.35)] tabular-nums leading-none"
      >{{ unreadCount > 99 ? '99+' : unreadCount }}</span>

      <!-- Punto verde discreto cuando NO hay no leídas (estado "estás al día") -->
      <span
        v-else
        class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-[1.5px] border-white rounded-full shadow-sm"
      ></span>
    </button>

    <!-- Dropdown abre hacia arriba -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="absolute right-0 bottom-full mb-3 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden origin-bottom-right"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/40">
          <h3 class="text-sm font-black text-slate-700 tracking-tight">Notificaciones</h3>
          <button
            v-if="hasUnread"
            type="button"
            @click="markAllAsRead"
            class="text-[10px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-wider transition-colors"
          >Marcar todas leídas</button>
        </div>

        <!-- Filtros tabs -->
        <div class="flex border-b border-slate-100 px-2">
          <button
            v-for="t in tabs"
            :key="t.id"
            type="button"
            @click="activeTab = t.id"
            class="flex-1 py-2 px-2 text-[10px] font-black uppercase tracking-wider transition-colors relative"
            :class="activeTab === t.id ? 'text-primary-500' : 'text-slate-400 hover:text-slate-600'"
          >
            {{ t.label }}
            <span
              v-if="activeTab === t.id"
              class="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-500 rounded-full"
            ></span>
          </button>
        </div>

        <!-- Lista -->
        <div v-auto-animate class="max-h-96 overflow-y-auto custom-scrollbar">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="w-5 h-5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>

          <div v-else-if="filteredNotifications.length === 0" class="flex flex-col items-center justify-center py-10 text-center px-6">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-2">
              <i class="fas fa-inbox text-slate-300 text-lg"></i>
            </div>
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sin notificaciones</p>
            <p class="text-[10px] text-slate-300 mt-1">Estás al día</p>
          </div>

          <div
            v-for="n in filteredNotifications"
            :key="n._id"
            class="relative border-b border-slate-100 group"
            :class="!n.read ? 'bg-primary-50/30' : ''"
          >
            <button
              type="button"
              @click="onNotificationClick(n)"
              class="w-full px-4 py-3 hover:bg-slate-50 text-left transition-colors flex items-start gap-3"
            >
              <!-- Icono según categoría -->
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[14px]"
                :class="categoryIconBg(n.category)"
              >
                <i :class="categoryIcon(n.category)"></i>
              </div>

              <!-- Contenido -->
              <div class="flex-1 min-w-0 pr-6">
                <div class="flex items-center gap-1">
                  <p class="text-[12px] truncate" :class="!n.read ? 'font-black text-slate-800' : 'font-bold text-slate-500'">{{ n.title }}</p>
                  <span v-if="!n.read" class="w-1.5 h-1.5 bg-primary-500 rounded-full shrink-0 ml-auto"></span>
                </div>
                <p v-if="n.message" class="text-[11px] mt-0.5 line-clamp-2" :class="!n.read ? 'text-slate-600' : 'text-slate-400'">{{ n.message }}</p>
                <p class="text-[9px] text-slate-300 mt-1 font-bold uppercase tracking-wider">{{ formatDate(n.createdAt) }}</p>
              </div>
            </button>

            <!-- Botón ✕ flotante (descartar sin abrir el modal) -->
            <button
              v-if="!n.read"
              type="button"
              @click="dismissNotification($event, n)"
              class="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm"
              title="Marcar como leída"
            >
              <i class="fas fa-check text-[9px]"></i>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { notificationService, type AppNotification } from '@/services/notificationService'
import { useActivityModalStore } from '@/stores/activityModal'

const activityModalStore = useActivityModalStore()

const open = ref(false)
const loading = ref(false)
const notifications = ref<AppNotification[]>([])
const unreadCount = ref(0)
const activeTab = ref<'all' | 'mention' | 'assignment' | 'due'>('all')
const bellRoot = ref<HTMLElement>()

const tabs = [
  { id: 'all' as const, label: 'Todas' },
  { id: 'mention' as const, label: 'Menciones' },
  { id: 'assignment' as const, label: 'Asignadas' },
  { id: 'due' as const, label: 'Vencen' },
]

// ── Dismiss de virtuales (no se pueden persistir en el back, usamos localStorage) ──
const DISMISSED_KEY = 'crm.dismissedVirtualNotifs'
const dismissedVirtuals = ref<Set<string>>(new Set(loadDismissed()))

function loadDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]')
  } catch {
    return []
  }
}

function persistDismissed() {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(dismissedVirtuals.value)))
  } catch {}
}

function isEffectivelyRead(n: AppNotification): boolean {
  if (n.virtual) return dismissedVirtuals.value.has(n._id)
  return n.read
}

// ── Computed ──
const visibleNotifications = computed(() =>
  notifications.value.map(n => ({ ...n, read: isEffectivelyRead(n) }))
)

const hasUnread = computed(() => visibleNotifications.value.some(n => !n.read))

const effectiveUnreadCount = computed(() =>
  visibleNotifications.value.filter(n => !n.read).length
)

const filteredNotifications = computed(() => {
  const list = visibleNotifications.value
  if (activeTab.value === 'mention') return list.filter(n => n.category === 'mention')
  if (activeTab.value === 'assignment') return list.filter(n => n.category === 'assignment')
  if (activeTab.value === 'due') return list.filter(n => n.category === 'due-soon' || n.category === 'overdue')
  return list
})

// ── Fetching ──
async function fetchNotifications() {
  loading.value = true
  try {
    notifications.value = await notificationService.list()
    // Limpiar dismissed que ya no aparecen (la entidad se completó)
    const liveIds = new Set(notifications.value.map(n => n._id))
    let changed = false
    for (const id of Array.from(dismissedVirtuals.value)) {
      if (!liveIds.has(id)) {
        dismissedVirtuals.value.delete(id)
        changed = true
      }
    }
    if (changed) persistDismissed()
  } catch (e) {
    console.error('Error fetching notifications:', e)
  } finally {
    loading.value = false
  }
}

async function fetchUnreadCount() {
  try {
    // Para reflejar inmediatamente las virtuales dismissed, recalculamos local
    if (notifications.value.length > 0) {
      unreadCount.value = effectiveUnreadCount.value
    } else {
      unreadCount.value = await notificationService.unreadCount()
    }
  } catch {}
}

async function toggleDropdown() {
  open.value = !open.value
  if (open.value) {
    await fetchNotifications()
    unreadCount.value = effectiveUnreadCount.value
  }
}

function closeDropdown() {
  open.value = false
}

// ── Marcar como leída ──
async function markNotificationRead(n: AppNotification) {
  if (n.virtual) {
    // Virtuales: dismiss local
    dismissedVirtuals.value.add(n._id)
    persistDismissed()
    // Forzar reactividad de Set
    dismissedVirtuals.value = new Set(dismissedVirtuals.value)
  } else if (!n.read) {
    try {
      await notificationService.markRead(n._id)
      const idx = notifications.value.findIndex(x => x._id === n._id)
      if (idx !== -1) notifications.value[idx] = { ...notifications.value[idx], read: true }
    } catch {}
  }
  unreadCount.value = effectiveUnreadCount.value
}

async function dismissNotification(e: Event, n: AppNotification) {
  e.stopPropagation()
  await markNotificationRead(n)
}

async function markAllAsRead() {
  // Persistidas: marcar en backend
  try {
    await notificationService.markAllRead()
  } catch {}
  notifications.value.forEach(n => { if (!n.virtual) n.read = true })

  // Virtuales: dismiss local
  notifications.value.forEach(n => {
    if (n.virtual) dismissedVirtuals.value.add(n._id)
  })
  persistDismissed()
  dismissedVirtuals.value = new Set(dismissedVirtuals.value)

  unreadCount.value = 0
}

async function onNotificationClick(n: AppNotification) {
  // Marcar como leída (también virtuales via localStorage)
  await markNotificationRead(n)

  closeDropdown()

  // Abrir el modal "Refinar Tarea" en el mismo lugar (sin navegar)
  if (n.entityId) {
    const type = n.entityType === 'task' ? 'task' : 'activity'
    await activityModalStore.open(String(n.entityId), type)
  }
}

// ── Iconos por categoría ──
function categoryIcon(category: string): string {
  switch (category) {
    case 'mention': return 'fas fa-at text-violet-500'
    case 'assignment': return 'fas fa-user-tag text-blue-500'
    case 'comment': return 'fas fa-comment text-emerald-500'
    case 'due-soon': return 'fas fa-clock text-amber-500'
    case 'overdue': return 'fas fa-exclamation-triangle text-rose-500'
    default: return 'fas fa-bell text-slate-400'
  }
}

function categoryIconBg(category: string): string {
  switch (category) {
    case 'mention': return 'bg-violet-50'
    case 'assignment': return 'bg-blue-50'
    case 'comment': return 'bg-emerald-50'
    case 'due-soon': return 'bg-amber-50'
    case 'overdue': return 'bg-rose-50'
    default: return 'bg-slate-50'
  }
}

function formatDate(date: string): string {
  try {
    const d = new Date(date)
    const diff = Date.now() - d.getTime()
    // Si es menos de 7 días, mostrar relativo
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(d, { locale: es, addSuffix: true })
    }
    return format(d, "d MMM, HH:mm", { locale: es })
  } catch {
    return ''
  }
}

// ── Click outside handler (sin directiva) ──
function onDocClick(e: MouseEvent) {
  if (!open.value) return
  if (bellRoot.value && !bellRoot.value.contains(e.target as Node)) {
    open.value = false
  }
}

// ── Polling cada 15s ──
// - Siempre refresca el contador (badge)
// - Si el dropdown está abierto, también refresca la lista en vivo
let pollInterval: number | undefined

async function pollTick() {
  await fetchUnreadCount()
  if (open.value) {
    try {
      notifications.value = await notificationService.list()
    } catch {}
  }
}

onMounted(() => {
  pollTick()
  pollInterval = window.setInterval(pollTick, 15_000)
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => {
  if (pollInterval) clearInterval(pollInterval)
  document.removeEventListener('click', onDocClick)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0); }
  20%, 60% { transform: rotate(-10deg); }
  40%, 80% { transform: rotate(10deg); }
}
.animate-wiggle {
  animation: wiggle 1.4s ease-in-out infinite;
  transform-origin: top center;
}

@keyframes ping-slow {
  0%   { transform: scale(1);   opacity: 0.7; }
  80%  { transform: scale(1.6); opacity: 0;   }
  100% { transform: scale(1.6); opacity: 0;   }
}
.animate-ping-slow {
  animation: ping-slow 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
