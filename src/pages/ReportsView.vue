<template>
  <div class="flex flex-col gap-6 h-full min-h-0 bg-slate-50/50 p-4 lg:p-8 relative">
    <!-- Background Accents -->
    <div class="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-50/40 to-transparent pointer-events-none"></div>

    <!-- ══ Page Tabs ══════════════════════════════════════════════════ -->
    <div class="flex-shrink-0 flex items-center gap-1 bg-white/80 backdrop-blur-md rounded-2xl p-1.5 border border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] self-start relative z-20">
      <button @click="activePageTab = 'reports'"
        class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        :class="activePageTab === 'reports' ? 'bg-gradient-to-r from-primary-600 to-indigo-500 text-white shadow-[0_4px_12px_rgb(99,102,241,0.3)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
        <i class="fas fa-chart-pie mr-1.5 text-[10px]"></i>Reportes
      </button>
      <button @click="activePageTab = 'kpis'"
        class="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        :class="activePageTab === 'kpis' ? 'bg-gradient-to-r from-primary-600 to-indigo-500 text-white shadow-[0_4px_12px_rgb(99,102,241,0.3)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'">
        <i class="fas fa-users-cog mr-1.5 text-[10px]"></i>KPIs del Equipo
      </button>
    </div>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- TAB: REPORTES (contenido original)                           -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <template v-if="activePageTab === 'reports'">

    <!-- Header -->
    <div class="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-end gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Filtros Rápidos -->
        <div class="flex flex-wrap items-center gap-2">
          <select 
            v-model="selectedPeriod" 
            @change="loadData"
            class="bg-white/90 backdrop-blur-md border border-white/40 text-xs font-bold text-slate-600 rounded-xl px-4 py-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
          >
            <option v-for="p in periods" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>

          <select 
            v-model="filters.department" 
            @change="loadData"
            class="bg-white/90 backdrop-blur-md border border-white/40 text-xs font-bold text-slate-600 rounded-xl px-4 py-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
          >
            <option value="">Todos los Equipos</option>
            <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
          </select>

          <select 
            v-model="filters.clientId" 
            @change="loadData"
            class="bg-white/90 backdrop-blur-md border border-white/40 text-xs font-bold text-slate-600 rounded-xl px-4 py-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
          >
            <option value="">Todos los Clientes</option>
            <option v-for="client in clients" :key="client._id" :value="client._id">{{ client.name }}</option>
          </select>

          <select 
            v-model="filters.assignedTo" 
            @change="loadData"
            class="bg-white/90 backdrop-blur-md border border-white/40 text-xs font-bold text-slate-600 rounded-xl px-4 py-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
          >
            <option value="">Todo el Personal</option>
            <option v-for="member in availableMembers" :key="member._id" :value="member._id">{{ member.name }}</option>
          </select>
        </div>

        <div class="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

        <button
          @click="refreshData"
          :disabled="loading"
          class="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-500 hover:from-primary-500 hover:to-indigo-400 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-[0_8px_20px_rgb(99,102,241,0.25)] hover:shadow-[0_8px_25px_rgb(99,102,241,0.4)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
        >
          <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'" class="text-xs"></i>
          {{ loading ? 'Actualizar' : 'Actualizar' }}
        </button>
      </div>
    </div>

    <!-- KPI Row -->
    <div class="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        class="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.08)] transition-all duration-300 relative overflow-hidden group"
      >
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-current to-transparent opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700" :class="kpi.iconColor"></div>
        <div class="flex items-start justify-between mb-4">
          <div :class="kpi.iconBg" class="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner">
            <i :class="[kpi.icon, kpi.iconColor]" class="text-base"></i>
          </div>
          <span
            class="text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm"
            :class="kpi.trend >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 'bg-red-50 text-red-500 border border-red-100/50'"
          >
            <i :class="kpi.trend >= 0 ? 'fas fa-arrow-trend-up' : 'fas fa-arrow-trend-down'" class="text-[8px]"></i>
            {{ Math.abs(kpi.trend) }}%
          </span>
        </div>
        <div class="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 leading-none mb-2 tracking-tight">{{ kpi.value }}</div>
        <div class="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">{{ kpi.label }}</div>
      </div>
    </div>

    <!-- Charts + Tables -->
    <div class="flex-1 min-h-0 grid grid-cols-3 gap-4 overflow-hidden">

      <!-- Left: 2 charts stacked -->
      <div class="col-span-2 flex flex-col gap-4 min-h-0 overflow-y-auto">


        <!-- Activities + Clients row -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-shrink-0">
          <!-- Activities Donut -->
          <div class="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative z-10">
              <h3 class="text-base font-black text-slate-800 mb-1">Actividades por Estado</h3>
              <p class="text-xs text-slate-500 font-medium mb-3">Distribución actual de las tareas</p>
              <div class="h-64 flex items-center justify-center">
                <apexchart type="donut" height="100%" width="100%" :options="activitiesChartOptions" :series="activitiesChartSeries"></apexchart>
              </div>
            </div>
          </div>
          <!-- Client Growth Bar -> Workload -->
          <div class="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative z-10">
              <h3 class="text-base font-black text-slate-800 mb-1">Carga de Trabajo</h3>
              <p class="text-xs text-slate-500 font-medium mb-3">Tareas activas por miembro del equipo</p>
              <div class="h-64">
                <apexchart type="bar" height="100%" width="100%" :options="workloadChartOptions" :series="workloadChartSeries"></apexchart>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Performance -->
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex-shrink-0 relative overflow-hidden group">
          <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-400 to-indigo-600"></div>
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-base font-black text-slate-800 tracking-tight">Rendimiento del Equipo</h3>
              <p class="text-xs text-slate-400 font-bold mt-0.5">Actividades completadas vs asignadas</p>
            </div>
          </div>
          <div class="space-y-4">
            <div v-for="member in teamMembers" :key="member.name" class="flex items-center gap-4 p-2 -mx-2 hover:bg-slate-50/50 rounded-xl transition-colors">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-50 to-indigo-50 flex items-center justify-center flex-shrink-0 border border-primary-100/50 shadow-inner">
                <span class="text-xs font-black bg-clip-text text-transparent bg-gradient-to-br from-primary-600 to-indigo-600">{{ member.initials }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-extrabold text-slate-700 truncate">{{ member.name }}</span>
                  <span class="text-xs font-black text-slate-800 ml-2 tracking-tight">{{ member.completed }}/<span class="text-slate-400">{{ member.total }}</span></span>
                </div>
                <div class="h-2 bg-slate-100/80 rounded-full overflow-hidden shadow-inner">
                  <div
                    class="h-full rounded-full transition-all duration-1000 relative"
                    :class="member.rate >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : member.rate >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'"
                    :style="{ width: member.rate + '%' }"
                  >
                    <div class="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>
              <span
                class="text-[10px] font-black px-2 py-1 rounded-lg flex-shrink-0 shadow-sm border"
                :class="member.rate >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : member.rate >= 60 ? 'bg-amber-50 text-amber-600 border-amber-100/50' : 'bg-red-50 text-red-500 border-red-100/50'"
              >{{ member.rate }}%</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Right panel: exec summary + top clients -->
      <div class="flex flex-col gap-4 min-h-0 overflow-y-auto">

        <!-- Resumen ejecutivo -->
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex-shrink-0">
          <h3 class="text-base font-black text-slate-800 tracking-tight mb-4">Métricas Globales</h3>
          <div class="space-y-3">
            <div v-for="row in executiveRows" :key="row.label" class="flex items-center justify-between py-2.5 border-b border-slate-100/50 last:border-0 group">
              <div class="flex items-center gap-3">
                <div :class="row.iconBg" class="w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform">
                  <i :class="[row.icon, row.iconColor]" class="text-[11px]"></i>
                </div>
                <span class="text-xs font-bold text-slate-600">{{ row.label }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-black text-slate-800">{{ row.value }}</span>
                <span
                  class="text-[9px] font-black px-2 py-0.5 rounded-full border"
                  :class="row.growth >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : 'bg-red-50 text-red-500 border-red-100/50'"
                >{{ row.growth >= 0 ? '+' : '' }}{{ row.growth }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Clientes -->
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex-shrink-0 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100 to-transparent opacity-20 rounded-bl-full pointer-events-none"></div>
          <h3 class="text-base font-black text-slate-800 tracking-tight mb-4">Top Clientes Activos</h3>
          <div class="space-y-3">
            <div v-for="(client, i) in topClients" :key="client.name" class="flex items-center gap-3 p-2.5 -mx-2 hover:bg-white rounded-xl transition-all hover:shadow-sm border border-transparent hover:border-slate-100/50">
              <div
                class="w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black flex-shrink-0 shadow-inner"
                :class="i === 0 ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 border border-amber-300/50' : i === 1 ? 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 border border-slate-300/50' : 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 border border-orange-200/50'"
              >{{ i + 1 }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-extrabold text-slate-800 truncate tracking-tight">{{ client.name }}</p>
                <p class="text-[10px] text-slate-400 font-bold mt-0.5">{{ client.activities }} operaciones</p>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-sm font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">{{ client.rate }}%</div>
                <div class="text-[8px] text-slate-400 font-black uppercase tracking-wider mt-0.5">Éxito</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tiempo resolución -->
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex-shrink-0">
          <h3 class="text-base font-black text-slate-800 tracking-tight mb-4">Velocidad de Resolución</h3>
          <div class="grid grid-cols-3 gap-3">
            <div class="text-center p-3 bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 rounded-2xl border border-emerald-100/50 shadow-sm hover:shadow-md transition-shadow">
              <div class="text-xl font-black text-emerald-600 tracking-tight">{{ resolutionTime.min }}<span class="text-[10px] ml-0.5 text-emerald-500/80">d</span></div>
              <div class="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Mínimo</div>
            </div>
            <div class="text-center p-3 bg-gradient-to-br from-blue-50/80 to-blue-100/40 rounded-2xl border border-blue-100/50 shadow-sm hover:shadow-md transition-shadow">
              <div class="text-xl font-black text-blue-600 tracking-tight">{{ resolutionTime.avg }}<span class="text-[10px] ml-0.5 text-blue-500/80">d</span></div>
              <div class="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Promedio</div>
            </div>
            <div class="text-center p-3 bg-gradient-to-br from-red-50/80 to-red-100/40 rounded-2xl border border-red-100/50 shadow-sm hover:shadow-md transition-shadow">
              <div class="text-xl font-black text-red-500 tracking-tight">{{ resolutionTime.max }}<span class="text-[10px] ml-0.5 text-red-400/80">d</span></div>
              <div class="text-[9px] font-black text-red-400 uppercase tracking-widest mt-1">Máximo</div>
            </div>
          </div>
        </div>

        <!-- Comparativa mensual -->
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex-shrink-0">
          <h3 class="text-base font-black text-slate-800 tracking-tight mb-4">Progreso vs Periodo Anterior</h3>
          <div class="space-y-4">
            <div v-for="comp in monthlyComparison" :key="comp.label">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-bold text-slate-600">{{ comp.label }}</span>
                <span class="text-xs font-black bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100" :class="comp.growth >= 0 ? 'text-emerald-500' : 'text-red-500'">
                  {{ comp.growth >= 0 ? '+' : '' }}{{ comp.growth }}%
                </span>
              </div>
              <div class="flex items-center gap-2 text-[10px] text-slate-400 font-bold bg-slate-50/50 p-1.5 rounded-lg border border-slate-100/50">
                <span class="flex-1 text-center">Actual: <strong class="text-slate-700">{{ comp.current }}</strong></span>
                <span class="text-slate-300">|</span>
                <span class="flex-1 text-center">Previo: <strong class="text-slate-500">{{ comp.previous }}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Email Report Panel -->
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-shrink-0 overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100/50">
            <div>
              <h3 class="text-base font-black text-slate-800 tracking-tight">Enviar Reporte por Email</h3>
              <p class="text-xs text-slate-400 font-bold mt-0.5">Envío manual o programado</p>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
              <i class="fas fa-envelope text-indigo-500 text-sm"></i>
            </div>
          </div>
          <div class="px-6 py-5 space-y-4">
            <!-- Manual send -->
            <div>
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Destinatarios</label>
              <input v-model="reportEmail" type="text" placeholder="email1@ejemplo.com, email2@ejemplo.com"
                class="w-full px-4 py-2.5 text-xs font-bold border border-slate-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white" />
            </div>
            <div>
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Período del reporte</label>
              <select v-model="reportPeriod"
                class="w-full px-4 py-2.5 text-xs font-bold border border-slate-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white">
                <option value="week">Semanal</option>
                <option value="month">Mensual</option>
                <option value="quarter">Trimestral</option>
              </select>
            </div>
            <button @click="sendManualReport" :disabled="sendingReport"
              class="w-full py-3 bg-gradient-to-r from-primary-600 to-indigo-500 hover:from-primary-500 hover:to-indigo-400 text-white text-xs font-black rounded-xl shadow-[0_8px_20px_rgb(99,102,241,0.25)] hover:shadow-[0_8px_25px_rgb(99,102,241,0.4)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2">
              <i class="fas text-[11px]" :class="sendingReport ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
              {{ sendingReport ? 'Enviando...' : 'Enviar reporte ahora' }}
            </button>
            <p v-if="reportMsg" class="text-[11px] font-bold text-center" :class="reportMsgType === 'ok' ? 'text-emerald-500' : 'text-red-500'">{{ reportMsg }}</p>
          </div>

          <!-- Schedule config -->
          <div class="border-t border-slate-100/50 px-6 py-4 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs font-black text-slate-700">Envío automático</span>
                <p class="text-[10px] text-slate-400 font-bold mt-0.5">Programa reportes recurrentes</p>
              </div>
              <button @click="toggleSchedule"
                class="relative w-10 h-5.5 rounded-full transition-colors"
                :class="scheduleEnabled ? 'bg-primary-500' : 'bg-slate-200'">
                <span class="absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform"
                  :class="scheduleEnabled ? 'translate-x-[18px]' : ''"></span>
              </button>
            </div>
            <div v-if="scheduleEnabled" class="space-y-3 pt-2">
              <div class="flex gap-2">
                <select v-model="scheduleFrequency" @change="saveSchedule"
                  class="flex-1 px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl outline-none bg-white">
                  <option value="daily">Diario (L-V)</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
                <select v-if="scheduleFrequency === 'weekly'" v-model.number="scheduleDayOfWeek" @change="saveSchedule"
                  class="flex-1 px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl outline-none bg-white">
                  <option :value="1">Lunes</option>
                  <option :value="2">Martes</option>
                  <option :value="3">Miércoles</option>
                  <option :value="4">Jueves</option>
                  <option :value="5">Viernes</option>
                </select>
              </div>
              <div class="flex gap-2 items-center">
                <label class="text-[10px] text-slate-400 font-black shrink-0">Hora:</label>
                <input type="number" v-model.number="scheduleHour" min="0" max="23" @change="saveSchedule"
                  class="w-16 px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl outline-none text-center bg-white" />
                <span class="text-xs text-slate-400 font-bold">:</span>
                <input type="number" v-model.number="scheduleMinute" min="0" max="59" @change="saveSchedule"
                  class="w-16 px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl outline-none text-center bg-white" />
              </div>
              <p v-if="scheduleLastRun" class="text-[10px] text-slate-400 font-bold">
                <i class="fas fa-clock text-[8px] mr-1"></i>Último envío: {{ new Date(scheduleLastRun).toLocaleString('es-CO') }}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>

    </template><!-- end reports tab -->

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- TAB: KPIs DEL EQUIPO                                         -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <template v-if="activePageTab === 'kpis'">

      <!-- KPI Header + Period Selector -->
      <div class="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <h2 class="text-lg font-black text-slate-800 tracking-tight">KPIs del Equipo</h2>
          <p class="text-xs text-slate-400 font-bold mt-0.5">Métricas de rendimiento por persona</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex bg-white/90 backdrop-blur-md border border-white/60 rounded-xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <button v-for="p in kpiPeriods" :key="p.value" @click="kpiPeriod = p.value; fetchKPIs()"
              class="px-3.5 py-2 text-[10px] font-black uppercase tracking-widest transition-colors"
              :class="kpiPeriod === p.value ? 'bg-gradient-to-r from-primary-600 to-indigo-500 text-white' : 'text-slate-500 hover:bg-slate-50'">
              {{ p.label }}
            </button>
          </div>
          <button @click="fetchKPIs" :disabled="kpiLoading"
            class="px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-500 hover:from-primary-500 hover:to-indigo-400 text-white font-black rounded-xl text-xs shadow-[0_8px_20px_rgb(99,102,241,0.25)] transition-all disabled:opacity-50">
            <i :class="kpiLoading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'" class="text-xs"></i>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="flex-shrink-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
        <div v-for="card in kpiStatCards" :key="card.label"
          class="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.08)] transition-all">
          <div class="flex items-center gap-2.5 mb-2.5">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm" :class="card.iconBg">
              <i :class="['fas', card.icon, card.iconColor, 'text-[11px]']"></i>
            </div>
            <span class="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">{{ card.label }}</span>
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-2xl font-black leading-none" :class="card.valueColor">{{ kpiLoading ? '—' : card.value }}</span>
            <span v-if="card.suffix" class="text-[10px] font-bold text-slate-400">{{ card.suffix }}</span>
          </div>
        </div>
      </div>

      <!-- Trends + KPIs Grid -->
      <div class="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-3 gap-4 overflow-y-auto">

        <!-- Left: Trends + Per-person KPIs -->
        <div class="xl:col-span-2 flex flex-col gap-4">

          <!-- Trend Chart -->
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex-shrink-0">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100/50">
              <div>
                <h3 class="text-base font-black text-slate-800 tracking-tight">Tendencias</h3>
                <p class="text-xs text-slate-400 font-bold mt-0.5">Actividad completada por período</p>
              </div>
              <div class="flex bg-slate-100/80 rounded-xl overflow-hidden">
                <button @click="kpiTrendTab = 'weekly'"
                  class="px-3.5 py-2 text-[10px] font-black uppercase tracking-widest transition-colors"
                  :class="kpiTrendTab === 'weekly' ? 'bg-gradient-to-r from-primary-600 to-indigo-500 text-white' : 'text-slate-500 hover:text-slate-700'">
                  Semanal
                </button>
                <button @click="kpiTrendTab = 'monthly'"
                  class="px-3.5 py-2 text-[10px] font-black uppercase tracking-widest transition-colors"
                  :class="kpiTrendTab === 'monthly' ? 'bg-gradient-to-r from-primary-600 to-indigo-500 text-white' : 'text-slate-500 hover:text-slate-700'">
                  Mensual
                </button>
              </div>
            </div>
            <div class="px-6 py-5">
              <div v-if="kpiTrendsLoading" class="flex items-center justify-center py-12">
                <div class="w-5 h-5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
              </div>
              <div v-else>
                <div class="flex items-end gap-2.5 h-44 px-1">
                  <div v-for="(point, i) in kpiCurrentTrend" :key="i" class="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                    <span class="text-[10px] font-black text-slate-600 tabular-nums">{{ point.completed }}</span>
                    <div class="w-full max-w-[52px] rounded-t-lg transition-all duration-700 min-h-[4px] mx-auto shadow-sm"
                      :class="kpiTrendTab === 'weekly' ? 'bg-gradient-to-t from-primary-600 to-primary-400' : 'bg-gradient-to-t from-indigo-600 to-indigo-400'"
                      :style="{ height: kpiTrendBarHeight(point.completed) }">
                    </div>
                  </div>
                </div>
                <div class="flex gap-2.5 mt-2.5 px-1">
                  <div v-for="(point, i) in kpiCurrentTrend" :key="'tl'+i"
                    class="flex-1 text-center text-[9px] font-black text-slate-400 uppercase tracking-wider truncate min-w-0">
                    {{ point.label }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Per-person KPI Cards -->
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex-shrink-0">
            <div class="px-6 py-4 border-b border-slate-100/50">
              <h3 class="text-base font-black text-slate-800 tracking-tight">Rendimiento por Persona</h3>
              <p class="text-xs text-slate-400 font-bold mt-0.5">Completadas, cumplimiento, carga y vencidas</p>
            </div>
            <div v-if="kpiLoading" class="flex items-center justify-center py-12">
              <div class="w-5 h-5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
            <div v-else-if="kpiData.kpis.length === 0" class="py-12 text-center">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-users text-slate-300 text-lg"></i>
              </div>
              <p class="text-xs text-slate-400 font-bold">Sin datos para el período seleccionado</p>
            </div>
            <div v-else class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div v-for="kpi in kpiData.kpis" :key="kpi.user._id"
                class="border border-slate-100/80 rounded-xl p-4 hover:border-slate-200 hover:shadow-md transition-all bg-white/50">
                <!-- Header -->
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-sm">
                    {{ kpi.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-xs font-black text-slate-800 truncate">{{ kpi.user.name }}</div>
                    <div class="text-[10px] text-slate-400 font-bold truncate">{{ kpi.user.department || kpi.user.role }}</div>
                  </div>
                  <span class="text-xs font-black px-2.5 py-1 rounded-full shrink-0 border shadow-sm"
                    :class="kpi.complianceRate >= 70 ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : kpi.complianceRate >= 40 ? 'bg-amber-50 text-amber-600 border-amber-100/50' : 'bg-red-50 text-red-600 border-red-100/50'">
                    {{ kpi.complianceRate }}%
                  </span>
                </div>
                <!-- Bar -->
                <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div class="h-full rounded-full transition-all duration-700"
                    :class="kpi.complianceRate >= 70 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : kpi.complianceRate >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'"
                    :style="{ width: kpi.complianceRate + '%' }"></div>
                </div>
                <!-- Stats -->
                <div class="grid grid-cols-4 gap-1 text-center">
                  <div>
                    <div class="text-sm font-black text-slate-800">{{ kpi.totalCompleted }}</div>
                    <div class="text-[8px] font-black uppercase tracking-wider text-slate-400 mt-0.5">Hechas</div>
                  </div>
                  <div>
                    <div class="text-sm font-black text-slate-600">{{ kpi.currentWorkload }}</div>
                    <div class="text-[8px] font-black uppercase tracking-wider text-slate-400 mt-0.5">Pend.</div>
                  </div>
                  <div>
                    <div class="text-sm font-black" :class="kpi.overdueCount > 0 ? 'text-red-500' : 'text-slate-300'">{{ kpi.overdueCount }}</div>
                    <div class="text-[8px] font-black uppercase tracking-wider text-slate-400 mt-0.5">Venc.</div>
                  </div>
                  <div>
                    <div class="text-sm font-black text-slate-500">{{ kpi.avgResolutionDays }}d</div>
                    <div class="text-[8px] font-black uppercase tracking-wider text-slate-400 mt-0.5">Prom.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Right: Overload alerts + Workload ranking -->
        <div class="flex flex-col gap-4">

          <!-- Overload Alerts -->
          <div v-if="kpiOverloaded.length > 0"
            class="bg-amber-50/80 backdrop-blur-xl rounded-2xl border border-amber-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 flex-shrink-0">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center border border-amber-200/50">
                <i class="fas fa-exclamation-triangle text-amber-600 text-xs"></i>
              </div>
              <div>
                <h3 class="text-xs font-black text-amber-800">Sobrecarga Detectada</h3>
                <p class="text-[10px] text-amber-600 font-bold">Personas con carga excesiva</p>
              </div>
            </div>
            <div class="space-y-2">
              <div v-for="m in kpiOverloaded" :key="m.user._id"
                class="flex items-center justify-between p-2.5 bg-white/60 rounded-xl border border-amber-100/50">
                <span class="text-xs font-bold text-amber-900 truncate">{{ m.user.name }}</span>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{{ m.currentWorkload }} pend.</span>
                  <span v-if="m.overdueCount > 0" class="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{{ m.overdueCount }} venc.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Workload Ranking -->
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 flex-shrink-0">
            <h3 class="text-base font-black text-slate-800 tracking-tight mb-1">Ranking de Carga</h3>
            <p class="text-xs text-slate-400 font-bold mb-4">Ordenado por tareas pendientes</p>
            <div class="space-y-3">
              <div v-for="(kpi, i) in kpiSortedByWorkload" :key="kpi.user._id"
                class="flex items-center gap-3 p-2 -mx-2 hover:bg-slate-50/50 rounded-xl transition-colors">
                <div class="w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 shadow-inner"
                  :class="i === 0 ? 'bg-gradient-to-br from-red-100 to-red-200 text-red-700 border border-red-300/50' : i === 1 ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 border border-amber-300/50' : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 border border-slate-300/50'">
                  {{ i + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-extrabold text-slate-800 truncate">{{ kpi.user.name }}</p>
                  <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                    <div class="h-full rounded-full bg-gradient-to-r from-primary-400 to-indigo-500 transition-all duration-700"
                      :style="{ width: Math.min((kpi.currentWorkload / Math.max(...kpiSortedByWorkload.map(k => k.currentWorkload), 1)) * 100, 100) + '%' }"></div>
                  </div>
                </div>
                <span class="text-sm font-black text-slate-700 shrink-0">{{ kpi.currentWorkload }}</span>
              </div>
            </div>
          </div>

          <!-- Hours Worked -->
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 flex-shrink-0">
            <h3 class="text-base font-black text-slate-800 tracking-tight mb-1">Horas Registradas</h3>
            <p class="text-xs text-slate-400 font-bold mb-4">Tiempo invertido por persona</p>
            <div class="space-y-2.5">
              <div v-for="kpi in kpiSortedByHours" :key="'h'+kpi.user._id"
                class="flex items-center justify-between py-1.5">
                <span class="text-xs font-bold text-slate-600 truncate">{{ kpi.user.name }}</span>
                <span class="text-sm font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500 shrink-0">{{ kpi.hoursWorked }}h</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </template><!-- end kpis tab -->

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { reportsService } from '../services/reportsService'
import { useNotifications } from '../composables/useNotifications'
import type {
  DashboardStats,
  FinancialData,
  ActivityStats,
  ClientStats,
  TeamPerformance,
  ExecutiveSummary
} from '../services/reportsService'
import { teamService } from '../services/teamService'
import { clientService } from '../services/clientService'
import { useTeamStore } from '../stores'
import { teamReportsService, type KPIResponse, type TrendPoint } from '../services/reportsService'

const { showError, showSuccess } = useNotifications()
const teamStore = useTeamStore()

// ── Page Tab ──
const activePageTab = ref<'reports' | 'kpis'>('reports')

// Register apexchart component globally in script setup isn't strictly needed if we just use the imported component
const apexchart = VueApexCharts

// State
const loading = ref(false)
const selectedPeriod = ref<'month' | 'quarter' | 'year'>('month')

const filters = ref({
  department: '',
  clientId: '',
  assignedTo: ''
})

const availableMembers = ref<any[]>([])
const clients = ref<any[]>([])
const departments = computed(() => {
  const depts = new Set(availableMembers.value.map(m => m.department).filter(Boolean))
  return Array.from(depts).sort()
})

const periods = [
  { value: 'month', label: 'Este Mes' },
  { value: 'quarter', label: 'Este Trimestre' },
  { value: 'year', label: 'Este Año' }
]

// API Data
const dashboardStats = ref<DashboardStats | null>(null)
const financialData = ref<FinancialData | null>(null)
const activityStats = ref<ActivityStats | null>(null)
const clientStats = ref<ClientStats | null>(null)
const teamPerformance = ref<TeamPerformance | null>(null)
const executiveSummary = ref<ExecutiveSummary | null>(null)

// Formatters
const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0'
  return '$' + new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

// --- Computed UI Data ---
const kpis = computed(() => [
  {
    label: 'Total Equipo',
    value: String(dashboardStats.value?.totals?.teamMembers ?? 0),
    icon: 'fas fa-id-badge',
    iconBg: 'bg-primary-50 border-primary-100',
    iconColor: 'text-primary-600',
    trend: 0
  },
  {
    label: 'Clientes Activos',
    value: String(dashboardStats.value?.totals?.clients ?? 0),
    icon: 'fas fa-users',
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600',
    trend: executiveSummary.value?.growth?.clients ?? 0
  },
  {
    label: 'Actividades',
    value: String(dashboardStats.value?.monthly?.completedActivities ?? 0),
    icon: 'fas fa-check-circle',
    iconBg: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-600',
    trend: executiveSummary.value?.growth?.activities ?? 0
  },
  {
    label: 'Casos Activos',
    value: String(dashboardStats.value?.totals?.cases ?? 0),
    icon: 'fas fa-folder-open',
    iconBg: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-600',
    trend: 0
  }
])

const executiveRows = computed(() => [
  { label: 'Nuevos clientes', value: String(executiveSummary.value?.kpis?.newClientsThisMonth ?? 0), growth: executiveSummary.value?.growth?.clients ?? 0, icon: 'fas fa-user-plus', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { label: 'Actividades completadas', value: String(executiveSummary.value?.kpis?.completedThisMonth ?? 0), growth: executiveSummary.value?.growth?.activities ?? 0, icon: 'fas fa-check', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'Total clientes', value: String(executiveSummary.value?.kpis?.totalClients ?? 0), growth: 0, icon: 'fas fa-building', iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
])

const topClients = computed(() => {
  if (clientStats.value?.topActive?.length) {
    return clientStats.value.topActive.slice(0, 5).map((c: any) => ({
      name: c.clientName || 'Cliente sin nombre',
      activities: c.totalActivities,
      rate: Math.round(c.completionRate * 100)
    }))
  }
  return []
})

const teamMembers = computed(() => {
  if (teamPerformance.value?.performance?.length) {
    return teamPerformance.value.performance.map((m: any) => {
      // Improved fallback taking first name from availableMembers array
      let name = m.teamMember?.name || m.teamMember?.nombre
      if (!name) {
        const found = availableMembers.value.find(user => user._id === m._id)
        name = found?.name || `Miembro ${String(m._id).slice(-4)}`
      }
      const parts = name.split(' ').filter(Boolean)
      const initials = parts.length >= 2 
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase()
        
      return {
        name,
        initials,
        completed: m.completedActivities,
        total: m.totalActivities,
        rate: Math.round(m.completionRate || 0)
      }
    })
  }
  return []
})

const resolutionTime = computed(() => ({
  min: activityStats.value?.resolutionTime?.minResolutionTime ? Math.round(activityStats.value.resolutionTime.minResolutionTime) : 0,
  avg: activityStats.value?.resolutionTime?.avgResolutionTime ? Math.round(activityStats.value.resolutionTime.avgResolutionTime) : 0,
  max: activityStats.value?.resolutionTime?.maxResolutionTime ? Math.round(activityStats.value.resolutionTime.maxResolutionTime) : 0,
}))

const monthlyComparison = computed(() => [
  {
    label: 'Nuevos Clientes',
    current: executiveSummary.value?.kpis?.newClientsThisMonth ?? 0,
    previous: executiveSummary.value?.kpis?.newClientsLastMonth ?? 0,
    growth: executiveSummary.value?.growth?.clients ?? 0
  },
  {
    label: 'Actividades Completadas',
    current: executiveSummary.value?.kpis?.completedThisMonth ?? 0,
    previous: executiveSummary.value?.kpis?.completedLastMonth ?? 0,
    growth: executiveSummary.value?.growth?.activities ?? 0
  },
])

// -- ApexCharts Configuration --
const CHART_COLORS = {
  emerald: '#10b981',
  primary: '#6366f1',
  amber: '#f59e0b',
  red: '#ef4444',
  text: '#64748b'
}

// Donut Chart for Activities
const activitiesChartSeries = computed(() => {
  let completed = 142, inProgress = 28, pending = 34
  if (activityStats.value?.statusDistribution?.length) {
    completed = 0; inProgress = 0; pending = 0
    activityStats.value.statusDistribution.forEach((s: any) => {
      const id = (s._id || '').toLowerCase()
      if (id.includes('complet') || id.includes('finaliz')) completed += s.count
      else if (id.includes('progress') || id.includes('progreso')) inProgress += s.count
      else pending += s.count
    })
  }
  return [completed, inProgress, pending]
})

const activitiesChartOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit', dropShadow: { enabled: true, top: 2, left: 0, blur: 4, opacity: 0.05 } },
  labels: ['Completadas', 'En Proceso', 'Pendientes'],
  colors: [CHART_COLORS.emerald, CHART_COLORS.primary, CHART_COLORS.amber],
  plotOptions: {
    pie: { donut: { size: '70%', labels: { show: true, name: { fontSize: '12px' }, value: { fontSize: '20px', fontWeight: 900 } } } }
  },
  dataLabels: { enabled: false },
  stroke: { width: 0 },
  legend: { position: 'bottom', fontSize: '12px', fontWeight: 600, markers: { radius: 12 } }
}))

// Bar Chart for Workload
const workloadChartSeries = computed(() => {
  let data = [5, 8, 4]
  if (teamPerformance.value?.currentWorkload?.length) {
    data = teamPerformance.value.currentWorkload.map((m: any) => m.activeWorkload)
  }
  return [{ name: 'Tareas Activas', data }]
})

const workloadChartOptions = computed(() => {
  let categories = ['Miembro 1', 'Miembro 2', 'Miembro 3']
  if (teamPerformance.value?.currentWorkload?.length) {
    categories = teamPerformance.value.currentWorkload.map((m: any) => {
      let name = m.teamMember?.name || m.teamMember?.nombre
      if (!name) {
        const found = availableMembers.value.find(user => user._id === m._id)
        name = found?.name || `U ${String(m._id).slice(-4)}`
      }
      return name
    })
  }
  return {
    chart: { type: 'bar', fontFamily: 'inherit', toolbar: { show: false } },
    plotOptions: {
      bar: { borderRadius: 6, columnWidth: '45%', distributed: true }
    },
    colors: [CHART_COLORS.primary, '#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b'],
    dataLabels: { enabled: true, formatter: (val: any) => val, style: { fontSize: '10px', fontWeight: 900 } },
    legend: { show: false },
    xaxis: {
      categories,
      labels: { style: { colors: CHART_COLORS.text, fontSize: '10px', fontWeight: 600 } },
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    yaxis: {
      labels: { style: { colors: CHART_COLORS.text, fontSize: '10px', fontWeight: 600 } }
    },
    grid: { strokeDashArray: 4, borderColor: '#e2e8f0' }
  }
})

const loadData = async () => {
  loading.value = true
  try {
    if (availableMembers.value.length === 0) {
      const [, clientsData] = await Promise.all([
        teamStore.members.length === 0 ? teamStore.fetchTeam(1, 500) : Promise.resolve(),
        clientService.getAll()
      ])
      availableMembers.value = teamStore.members.length > 0
        ? teamStore.members
        : await teamService.getAll()
      clients.value = clientsData
    }

    const query = {
      period: selectedPeriod.value,
      ...filters.value
    }

    const [dash, fin, act, cli, team, exec] = await Promise.all([
      reportsService.getDashboardStats(query).catch(() => null),
      reportsService.getFinancialData(selectedPeriod.value).catch(() => null),
      reportsService.getActivityStats(query).catch(() => null),
      reportsService.getClientStats(query).catch(() => null),
      reportsService.getTeamPerformance(query).catch(() => null),
      reportsService.getExecutiveSummary(query).catch(() => null)
    ])
    dashboardStats.value = dash
    financialData.value = fin
    activityStats.value = act
    clientStats.value = cli
    teamPerformance.value = team
    executiveSummary.value = exec
  } catch (error) {
    console.error('Error loading reports:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  await loadData()
  showSuccess('Reportes actualizados')
}

// ═══════════════════════════════════════════════════════════════════════════
// KPIs Tab
// ═══════════════════════════════════════════════════════════════════════════

const kpiPeriod = ref('month')
const kpiLoading = ref(false)
const kpiData = ref<KPIResponse>({ kpis: [], teamTotals: { totalItems: 0, totalCompleted: 0, avgCompliance: 0, avgResolution: 0, totalWorkload: 0, totalOverdue: 0, totalHours: 0 }, period: 'month', since: '' })
const weeklyTrends = ref<TrendPoint[]>([])
const monthlyTrends = ref<TrendPoint[]>([])
const kpiTrendsLoading = ref(false)
const kpiTrendTab = ref<'weekly' | 'monthly'>('weekly')

const kpiPeriods = [
  { value: 'week', label: 'Sem' },
  { value: 'month', label: 'Mes' },
  { value: 'quarter', label: 'Trim' },
  { value: 'year', label: 'Año' },
]

const kpiStatCards = computed(() => {
  const t = kpiData.value.teamTotals
  return [
    { label: 'Completadas', value: t.totalCompleted, valueColor: 'text-slate-900', icon: 'fa-check-circle', iconBg: 'bg-emerald-50 border-emerald-100', iconColor: 'text-emerald-600' },
    { label: 'Cumplimiento', value: t.avgCompliance + '%', valueColor: t.avgCompliance >= 70 ? 'text-emerald-600' : t.avgCompliance >= 40 ? 'text-amber-600' : 'text-red-600', icon: 'fa-bullseye', iconBg: 'bg-blue-50 border-blue-100', iconColor: 'text-blue-600' },
    { label: 'Resolución', value: t.avgResolution, suffix: 'días', valueColor: 'text-slate-900', icon: 'fa-clock', iconBg: 'bg-slate-100 border-slate-200', iconColor: 'text-slate-600' },
    { label: 'Pendientes', value: t.totalWorkload, valueColor: 'text-slate-900', icon: 'fa-clipboard-list', iconBg: 'bg-amber-50 border-amber-100', iconColor: 'text-amber-600' },
    { label: 'Vencidas', value: t.totalOverdue, valueColor: t.totalOverdue > 0 ? 'text-red-600' : 'text-slate-900', icon: 'fa-exclamation-triangle', iconBg: t.totalOverdue > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-100 border-slate-200', iconColor: t.totalOverdue > 0 ? 'text-red-600' : 'text-slate-400' },
    { label: 'Horas', value: t.totalHours, suffix: 'h', valueColor: 'text-slate-900', icon: 'fa-stopwatch', iconBg: 'bg-purple-50 border-purple-100', iconColor: 'text-purple-600' },
  ]
})

const kpiOverloaded = computed(() => kpiData.value.kpis.filter(k => k.currentWorkload > 10 || k.overdueCount > 3))
const kpiSortedByWorkload = computed(() => [...kpiData.value.kpis].sort((a, b) => b.currentWorkload - a.currentWorkload).slice(0, 8))
const kpiSortedByHours = computed(() => [...kpiData.value.kpis].filter(k => k.hoursWorked > 0).sort((a, b) => b.hoursWorked - a.hoursWorked).slice(0, 8))
const kpiCurrentTrend = computed(() => kpiTrendTab.value === 'weekly' ? weeklyTrends.value : monthlyTrends.value)

function kpiTrendBarHeight(value: number) {
  const max = Math.max(...kpiCurrentTrend.value.map(p => p.completed), 1)
  return Math.max((value / max) * 100, 3) + '%'
}

async function fetchKPIs() {
  kpiLoading.value = true
  try {
    kpiData.value = await teamReportsService.getKPIs(kpiPeriod.value)
  } catch (e) { console.error('Error fetching KPIs:', e) }
  finally { kpiLoading.value = false }
}

async function fetchKPITrends() {
  kpiTrendsLoading.value = true
  try {
    const [w, m] = await Promise.all([
      teamReportsService.getWeeklyTrends(),
      teamReportsService.getMonthlyTrends(),
    ])
    weeklyTrends.value = w
    monthlyTrends.value = m
  } catch (e) { console.error('Error fetching trends:', e) }
  finally { kpiTrendsLoading.value = false }
}

// ── Email Report Panel ──
const reportEmail = ref('')
const reportPeriod = ref('week')
const sendingReport = ref(false)
const reportMsg = ref('')
const reportMsgType = ref<'ok' | 'err'>('ok')

const scheduleEnabled = ref(false)
const scheduleFrequency = ref('weekly')
const scheduleDayOfWeek = ref(1)
const scheduleHour = ref(8)
const scheduleMinute = ref(0)
const scheduleLastRun = ref<string | null>(null)

async function loadScheduleConfig() {
  try {
    const cfg = await teamReportsService.getScheduleConfig()
    scheduleEnabled.value = cfg.enabled
    scheduleFrequency.value = cfg.frequency
    scheduleDayOfWeek.value = cfg.dayOfWeek
    scheduleHour.value = cfg.hour
    scheduleMinute.value = cfg.minute
    scheduleLastRun.value = cfg.lastRun
  } catch {}
}

async function sendManualReport() {
  sendingReport.value = true
  reportMsg.value = ''
  try {
    const recipients = reportEmail.value.split(',').map(e => e.trim()).filter(Boolean)
    const result = await teamReportsService.sendTeamReport({
      recipients: recipients.length > 0 ? recipients : undefined,
      period: reportPeriod.value
    })
    reportMsg.value = result.success ? 'Reporte enviado correctamente' : (result.error || 'Error al enviar')
    reportMsgType.value = result.success ? 'ok' : 'err'
  } catch (e: any) {
    reportMsg.value = e.message || 'Error al enviar el reporte'
    reportMsgType.value = 'err'
  } finally {
    sendingReport.value = false
    setTimeout(() => { reportMsg.value = '' }, 5000)
  }
}

async function toggleSchedule() {
  scheduleEnabled.value = !scheduleEnabled.value
  await saveSchedule()
}

async function saveSchedule() {
  try {
    await teamReportsService.updateScheduleConfig({
      enabled: scheduleEnabled.value,
      frequency: scheduleFrequency.value as any,
      dayOfWeek: scheduleDayOfWeek.value,
      hour: scheduleHour.value,
      minute: scheduleMinute.value,
      period: reportPeriod.value,
    })
  } catch (e) {
    console.error('Error saving schedule:', e)
  }
}

watch(activePageTab, (tab) => {
  if (tab === 'kpis') {
    if (kpiData.value.kpis.length === 0) fetchKPIs()
    if (weeklyTrends.value.length === 0 && monthlyTrends.value.length === 0) fetchKPITrends()
  }
})

onMounted(() => { loadData(); loadScheduleConfig() })
</script>
