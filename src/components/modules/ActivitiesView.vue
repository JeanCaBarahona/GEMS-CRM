<template>
  <div class="space-y-4">
    <!-- Header con controles -->
    <div class="flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 p-2 rounded-xl border border-slate-100 shadow-sm">
      <div class="flex items-center gap-4 flex-wrap">
        <!-- Toggle vista -->
        <div class="flex bg-slate-100 rounded-lg p-1 border border-slate-200 shadow-inner">
          <button
            @click="currentView = 'kanban'"
            :class="currentView === 'kanban' 
              ? 'bg-white text-primary-600 shadow-sm font-bold border-slate-200' 
              : 'text-slate-500 hover:text-slate-800'"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          >
            <i class="fas fa-columns mr-1.5"></i>
            Kanban
          </button>
          <button
            @click="currentView = 'tasks'"
            :class="currentView === 'tasks' 
              ? 'bg-white text-primary-600 shadow-sm font-bold border-slate-200' 
              : 'text-slate-500 hover:text-slate-800'"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          >
            <i class="fas fa-list mr-1.5"></i>
            Lista
          </button>
          <button
            @click="currentView = 'calendar'"
            :class="currentView === 'calendar' 
              ? 'bg-white text-primary shadow-sm font-bold border-slate-200' 
              : 'text-slate-500 hover:text-slate-800'"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          >
            <i class="fas fa-calendar-alt mr-1.5"></i>
            Cal.
          </button>
          <button
            @click="currentView = 'daily'"
            :class="currentView === 'daily' 
              ? 'bg-white text-primary shadow-sm font-bold border-slate-200' 
              : 'text-slate-500 hover:text-slate-800'"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          >
            <i class="fas fa-sun mr-1.5"></i>
            Daily
          </button>
          <button
            v-if="authStore.isLeader"
            @click="currentView = 'team'"
            :class="currentView === 'team' 
              ? 'bg-white text-primary shadow-sm font-bold border-slate-200' 
              : 'text-slate-500 hover:text-slate-800'"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          >
            <i class="fas fa-users-viewfinder mr-1.5"></i>
            Equipo
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-64 hidden md:block">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            :value="searchTerm"
            @input="$emit('update:searchTerm', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Buscar actividad..."
            class="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
          />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Stats (Only Desktop) -->
        <div class="hidden lg:flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2 pr-12">
          <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> {{ pendingActivities.length }}</span>
          <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-primary-400"></span> {{ inProgressActivities.length }}</span>
        </div>

        <!-- Botón crear (Sober y Profesional) -->
        <button
          v-if="authStore.canCreateActivities"
          @click="showCreateModal = true"
          class="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-primary-600 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 transition-all active:bg-primary-100"
          title="Nueva Actividad"
        >
          <i class="fas fa-plus text-xs"></i>
        </button>
      </div>
    </div>

    <!-- Barra de tarea rápida -->
    <div 
      class="bg-indigo-50 rounded-xl p-2 border border-indigo-100 shadow-sm relative"
    >
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 text-indigo-700 ml-1">
          <i class="fas fa-bolt text-xs"></i>
          <span class="font-bold text-xs tracking-wide uppercase">Tarea Rápida</span>
          <!-- Indicador de configuración -->
          <div class="flex items-center text-[9px] bg-indigo-200/50 text-indigo-800 font-bold px-2 py-0.5 rounded">
            <i class="fas fa-clock mr-1 text-[8px]"></i>
            <span>{{ quickTaskSettings.dueDays }}d</span>
            <span class="mx-1">·</span>
            <span>{{ quickTaskSettings.priority === 'low' ? 'Baja' : quickTaskSettings.priority === 'medium' ? 'Media' : quickTaskSettings.priority === 'high' ? 'Alta' : 'Urgente' }}</span>
            <span class="mx-1">·</span>
            <span>{{ quickTaskSettings.estimatedTime }}</span>
          </div>
        </div>
        
        <div class="flex-1 relative">
          <input
            v-model="quickTaskTitle"
            @keyup.enter="createQuickTaskNow"
            @keyup.esc="quickTaskTitle = ''"
            @focus="showQuickTaskHints = true"
            @blur="setTimeout(() => showQuickTaskHints = false, 200)"
            type="text"
            placeholder="¿Qué necesitas hacer? (Enter para crear, Esc para limpiar)"
            class="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none font-medium text-xs shadow-sm"
          />
          
          <!-- Hints para atajos de teclado -->
          <div 
            v-if="showQuickTaskHints && quickTaskTitle"
            class="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 shadow-xl rounded-lg p-2 text-[10px] text-white z-20 font-medium"
          >
            <div class="flex gap-3">
              <span><kbd class="bg-slate-700 text-white border border-slate-600 px-1 py-0.5 rounded shadow-sm mr-1">Enter</kbd>Crear</span>
              <span><kbd class="bg-slate-700 text-white border border-slate-600 px-1 py-0.5 rounded shadow-sm mr-1">Esc</kbd>Limpiar</span>
            </div>
          </div>
        </div>
        
        <button
          @click="createQuickTaskNow"
          :disabled="!quickTaskTitle.trim()"
          class="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold text-xs shadow-sm disabled:opacity-50 flex items-center gap-1"
        >
          <i class="fas fa-bolt"></i>
          Crear
        </button>

        <!-- Configuración rápida (desplegable) -->
        <div class="relative">
          <button
            @click="showQuickSettings = !showQuickSettings"
            class="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100/50 rounded-lg transition-colors"
            title="Configuración rápida"
          >
            <i class="fas fa-cog text-sm"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div 
      class="bg-white rounded-xl border shadow-sm transition-all"
      :class="filtersLocked ? 'border-primary-200 ring-2 ring-primary-100' : 'border-slate-200'"
    >
      <!-- Filter Header -->
      <div class="flex items-center justify-between px-4 pt-2.5 pb-2 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <i class="fas fa-filter text-xs text-slate-400"></i>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtros Activos</span>
          <span v-if="hasActiveFilters" class="w-4 h-4 bg-primary-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
            {{ [selectedDepartment, selectedTeamMember, selectedStatus].filter(Boolean).length }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <!-- Indicador de filtro guardado -->
          <span v-if="filtersLocked" class="text-[10px] text-primary-600 font-bold flex items-center gap-1">
            <i class="fas fa-lock text-[9px]"></i> Guardado
          </span>
          <!-- Botón candado -->
          <button
            @click="toggleLockFilters"
            :title="filtersLocked ? 'Filtro guardado como predeterminado. Click para desbloquear' : 'Guardar filtro actual como predeterminado'"
            :class="filtersLocked 
              ? 'bg-primary-500 text-white shadow-md shadow-primary-100' 
              : 'bg-slate-100 text-slate-400 hover:text-primary-500 hover:bg-primary-50'"
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          >
            <i :class="filtersLocked ? 'fas fa-lock' : 'fas fa-lock-open'" class="text-xs"></i>
          </button>
          
          <!-- Botón Copiar Resumen (Compacto) -->
          <button
            @click="copyActivitiesSummary"
            title="Copiar resumen para WhatsApp/Slack"
            class="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-100 transition-all"
          >
            <i class="fas fa-copy text-xs"></i>
          </button>
          <!-- Mis Tareas shortcut -->
          <button
            @click="setMyTasksFilter"
            :class="selectedTeamMember === authStore.user?._id ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-primary-50 hover:text-primary-600'"
            class="px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
          >
            <i class="fas fa-user text-[9px]"></i> Mis Tareas
          </button>
          <button
            @click="clearFilters"
            class="px-3.5 py-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <i class="fas fa-times mr-1"></i> Limpiar
          </button>
        </div>
      </div>

      <!-- Filter Selects -->
      <div class="flex flex-wrap gap-3 items-center p-2.5 sm:p-3">
        <!-- Filtro por cliente -->
        <div class="flex-1 min-w-[180px]">
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5 ml-1">
            Cliente
          </label>
          <CustomSelect
            v-model="selectedClient"
            size="sm"
            :options="[
              { value: '', label: 'Todos los clientes' },
              ...clients.map(c => ({ value: c._id || '', label: c.name }))
            ]"
          />
        </div>
        <!-- Filtro por departamento -->
        <div class="flex-1 min-w-[140px]">
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5 ml-1">
            Departamento
          </label>
          <CustomSelect
            v-model="selectedDepartment"
            size="sm"
            :options="[
              { value: '', label: 'Todos los depto.' },
              { value: 'TI', label: 'TI' },
              { value: 'Comercial', label: 'Comercial' },
              { value: 'Marketing', label: 'Marketing' }
            ]"
          />
        </div>

        <!-- Filtro por miembro del equipo -->
        <div class="flex-1 min-w-[180px]">
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5 ml-1">
            Miembro del equipo
          </label>
          <CustomSelect
            v-model="selectedTeamMember"
            size="sm"
            :options="[
              { value: '', label: 'Todos los miembros' },
              { value: 'unassigned', label: 'Sin asignar', specialClass: 'text-slate-500 italic' },
              ...filteredMembersByDept.map(m => ({ value: m._id!, label: m.name }))
            ]"
          />
        </div>

        <!-- Filtro por estado -->
        <div class="flex-1 min-w-[160px]">
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5 ml-1">
            Estado
          </label>
          <CustomSelect
            v-model="selectedStatus"
            size="sm"
            :options="[
              { value: '', label: 'Todos los estados' },
              { value: 'pending', label: 'Pendiente' },
              { value: 'in-progress', label: 'En Proceso' },
              { value: 'completed', label: 'Completada' }
            ]"
          />
        </div>

        <!-- Filtro por rango de fechas -->
        <div class="flex items-center gap-2 min-w-[280px]">
          <div class="flex-1">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5 ml-1">
              Desde
            </label>
            <input 
              v-model="startDate" 
              type="date" 
              class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
          <div class="flex-1">
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5 ml-1">
              Hasta
            </label>
            <input 
              v-model="endDate" 
              type="date" 
              class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>


    <!-- Vista de Calendario -->
    <div v-if="currentView === 'calendar'">
      <MonthlyCalendar
        :activities="filteredActivities"
        :clients="clients"
        :team-members="teamMembers"
        @quick-task="handleQuickTask"
        @view-activity="viewActivity"
      />
    </div>

    <!-- Vista Daily -->
    <div v-else-if="currentView === 'daily'">
      <DailyScrum :activities="filteredActivities" />
    </div>

    <!-- Vista Equipo (Líderes) -->
    <div v-else-if="currentView === 'team'">
      <TeamActivities />
    </div>

    <!-- Vista de Lista -->
    <div v-else-if="currentView === 'tasks'" class="bg-white rounded-2xl border border-slate-200 shadow-sm mt-6 flex flex-col min-h-0 overflow-visible">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-500 tracking-wider">
              <th class="py-5 px-4 pl-8">Actividad</th>
              <th class="py-5 px-4 hidden md:table-cell">Cliente</th>
              <th class="py-5 px-4">Asignado</th>
              <th class="py-5 px-4">Estado</th>
              <th class="py-5 px-4 hidden sm:table-cell">Prioridad</th>
              <th class="py-5 px-4 pr-8 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="activity in filteredActivities" :key="activity._id" class="hover:bg-slate-50/80 transition-colors group">
              <td class="py-6 px-4 pl-8">
                <div class="font-bold text-slate-800 text-sm tracking-tight cursor-pointer hover:text-primary-600 transition-colors" @click="toggleCardExpansion(activity._id!)">{{ activity.title }}</div>
                <div 
                  class="text-[11px] text-slate-500 mt-1.5 max-w-md font-medium cursor-pointer transition-all duration-300"
                  :class="expandedCards.has(activity._id!) ? 'line-clamp-none bg-slate-50 p-2 rounded border border-slate-100 mt-2' : 'line-clamp-1'"
                  @click="toggleCardExpansion(activity._id!)"
                >
                  {{ activity.description || 'Sin descripción' }}
                </div>
                
                <div v-if="activity.estimatedTime || activity.timeSpent || activity.completionPercentage !== undefined" class="mt-4 flex items-center gap-4">
                  <div class="flex-1 max-w-[140px] bg-slate-100 rounded-full h-1.5 overflow-hidden flex items-center shadow-inner relative group/progress">
                    <div class="bg-primary-500 h-1.5 rounded-full transition-all shadow-sm" :style="{ width: `${activity.completionPercentage || 0}%` }"></div>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    <!-- Percentage Edit -->
                    <div class="relative">
                      <div @click.stop="editingPercentageId = activity._id!" class="flex items-center gap-1 text-[10px] font-black text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 cursor-pointer hover:bg-white hover:border-primary-300 transition-all">
                      <span class="text-primary-600">{{ Math.min(activity.completionPercentage || 0, 100) }}%</span>
                      </div>
                      <div v-if="editingPercentageId === activity._id" class="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-lg shadow-xl border border-slate-200 p-2 flex items-center gap-2 animate-scale-up origin-bottom-left" @click.stop>
                        <input 
                          type="number" 
                          v-model="activity.completionPercentage" 
                          max="100"
                          min="0"
                          class="w-12 text-[10px] font-bold border-slate-200 rounded p-1"
                          @input="activity.completionPercentage = Math.min(activity.completionPercentage || 0, 100)"
                          @keyup.enter="updatePercentage(activity, activity.completionPercentage); editingPercentageId = null"
                          @blur="editingPercentageId = null"
                          v-focus
                        />
                        <button @click.stop="updatePercentage(activity, activity.completionPercentage); editingPercentageId = null" class="text-emerald-500 hover:text-emerald-600"><i class="fas fa-check"></i></button>
                      </div>
                    </div>

                    <!-- Timer & Manual Edit -->
                    <div class="flex items-center gap-1.5">
                      <!-- Starter (Iniciador) -->
                      <button 
                        @click.stop="toggleTimer(activity)" 
                        class="w-7 h-7 flex items-center justify-center rounded-lg transition-all shadow-sm" 
                        :class="isTimerActive(activity) ? 'text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 animate-pulse' : 'text-primary-500 bg-primary-50 hover:bg-primary-100 border border-primary-50'"
                        title="Iniciar/Detener Temporizador"
                      >
                        <i :class="isTimerActive(activity) ? 'fas fa-stop' : 'fas fa-play'" class="text-[9px]"></i>
                      </button>

                      <!-- Manual Time Display (Click to edit) -->
                      <div class="relative">
                        <div 
                          @click.stop="startEditingTime(activity)" 
                          class="flex items-center gap-1.5 text-[10px] font-black text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 cursor-pointer hover:border-primary-300 transition-all shadow-sm"
                        >
                          <i class="far fa-clock text-[8px] text-slate-400"></i>
                          <span :class="isTimerActive(activity) ? 'text-red-500 font-black' : ''">{{ formatTime(activity.timeSpent) }}</span>
                        </div>

                        <!-- Inline Manual Time Edit Popover -->
                        <div v-if="editingTimeId === activity._id" class="absolute bottom-full left-0 mb-2 z-[60] bg-white rounded-xl shadow-2xl border border-slate-200 p-3 min-w-[140px] animate-scale-up origin-bottom-left" @click.stop>
                          <div class="flex items-center gap-2 mb-2">
                            <div class="flex flex-col gap-1">
                              <span class="text-[8px] font-black text-slate-400 uppercase">Horas</span>
                              <input v-model="manualHours" type="number" min="0" class="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold focus:bg-white transition-all">
                            </div>
                            <div class="flex flex-col gap-1">
                              <span class="text-[8px] font-black text-slate-400 uppercase">Minutos</span>
                              <input v-model="manualMinutes" type="number" min="0" max="59" class="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold focus:bg-white transition-all">
                            </div>
                          </div>
                          <div class="flex gap-1.5">
                            <button @click="saveManualTime(activity)" class="flex-1 py-1.5 bg-primary-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-primary-700 transition-all">Guardar</button>
                            <button @click="editingTimeId = null" class="px-2 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase hover:bg-slate-200 transition-all">X</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="py-6 px-4 hidden md:table-cell text-xs font-bold text-slate-600">
                {{ getClientName(activity.clientId) }}
              </td>
              <td class="py-6 px-4">
                <div class="flex items-center gap-2">
                  <template v-if="Array.isArray(activity.assignedTo) && activity.assignedTo.length">
                    <div class="flex -space-x-2">
                      <AvatarInline
                        v-for="(user, i) in activity.assignedTo.slice(0, 3)"
                        :key="user._id || user"
                        :name="getUserInfo(user).name"
                        :photo="getUserInfo(user).photo"
                        :avatar="getUserInfo(user).avatar"
                        :hide-name="true"
                        class="ring-2 ring-white relative"
                        :style="{ zIndex: 10 - i }"
                      />
                      <span v-if="activity.assignedTo.length > 3" class="text-[10px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full ring-2 ring-white relative z-0 flex items-center justify-center">
                        +{{ activity.assignedTo.length - 3 }}
                      </span>
                    </div>
                  </template>
                  <template v-else>
                    <AvatarInline
                      :name="getSmartAssignedName(activity)"
                      :photo="(activity.assignedTo && typeof activity.assignedTo === 'object') ? activity.assignedTo.photo : ''"
                      :avatar="(activity.assignedTo && typeof activity.assignedTo === 'object') ? activity.assignedTo.avatar : ''"
                    />
                  </template>
                </div>
              </td>
              <td class="py-6 px-4">
                <span :class="getStatusBadgeClass(activity.status)" class="text-[10px] font-black px-2.5 py-1 rounded-lg border inline-block whitespace-nowrap shadow-sm">
                  {{ getStatusLabel(activity.status) }}
                </span>
              </td>
              <td class="py-6 px-4 hidden sm:table-cell">
                <span 
                  v-if="activity.priority"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-black border inline-flex items-center gap-1.5 shadow-sm"
                  :class="getPriorityClass(activity.priority)"
                >
                  <i :class="getPriorityIcon(activity.priority)"></i>
                  {{ getPriorityLabel(activity.priority) }}
                </span>
              </td>
              <td class="py-6 px-4 pr-8 text-right">
                <div class="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="markAsCompleted(activity._id!)" class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Completar">
                    <i class="fas fa-check text-xs"></i>
                  </button>
                  <button v-if="authStore.canEditActivities" @click="editActivity(activity)" class="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Editar">
                    <i class="fas fa-edit text-xs"></i>
                  </button>
                  <button v-if="authStore.canDeleteActivities" @click="deleteActivity(activity._id!)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredActivities.length === 0">
              <td colspan="6" class="p-12 text-center text-slate-500 text-sm font-medium">
                <i class="fas fa-list text-4xl text-slate-200 mb-4 block"></i>
                No hay actividades para mostrar en la lista
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Detalles de Tarea -->
    <Teleport to="body">
      <div
        v-if="selectedTask"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        @click.self="selectedTask = null"
      >
        <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in"
        >
        <!-- Header -->
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div class="flex items-center gap-3">
            <i :class="getTypeIcon(selectedTask.type)" class="text-lg"></i>
            <span class="text-sm font-bold text-primary-600">{{ selectedTask._id.slice(-4).toUpperCase() }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button
              @click="showEditTaskModal"
              class="px-3 py-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-md text-xs flex items-center gap-1 font-medium transition-colors"
              title="Editar tarea"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              @click="deleteTask(selectedTask._id)"
              class="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-xs flex items-center gap-1 font-medium transition-colors"
              title="Eliminar tarea"
            >
              <i class="fas fa-trash"></i>
            </button>
            <button @click="selectedTask = null" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors ml-1">
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>

        <!-- Body Scrolleable -->
        <div class="flex-1 overflow-y-auto p-5 space-y-5">
          <!-- Título -->
          <div>
            <h3 class="text-xl font-black text-slate-800 mb-1">{{ selectedTask.title }}</h3>
            <p class="text-sm text-slate-500 font-medium">{{ selectedTask.description || 'Sin descripción' }}</p>
          </div>

          <!-- Estado y Prioridad -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Estado</label>
              <select
                v-model="selectedTask.boardStatus"
                @change="updateTaskStatus"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="testing">Testing</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Prioridad</label>
              <select
                v-model="selectedTask.priority"
                @change="updateTaskPriority"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <!-- Asignado -->
          <div>
            <label class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Persona asignada</label>
            <div v-if="getFirstAssigned(selectedTask.assignedTo)" class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-black">
                {{ getFirstAssigned(selectedTask.assignedTo)?.name?.charAt(0) || '?' }}
              </div>
              <div>
                <div class="text-sm font-bold text-slate-800">{{ getFirstAssigned(selectedTask.assignedTo)?.name || 'Sin nombre' }}</div>
                <div class="text-xs text-slate-500">{{ getFirstAssigned(selectedTask.assignedTo)?.email || '' }}</div>
              </div>
            </div>
            <div v-else class="text-sm text-slate-500 p-3 bg-slate-50/50 rounded-lg border border-slate-100 border-dashed text-center">Sin asignar</div>
          </div>

          <!-- Fechas -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Fecha inicio</label>
              <input
                type="date"
                v-model="selectedTask.startDate"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Fecha límite</label>
              <input
                type="date"
                v-model="selectedTask.dueDate"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <!-- Estimación -->
          <div>
            <label class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Estimación original</label>
            <input
              type="text"
              v-model="selectedTask.estimatedTime"
              placeholder="4h"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <!-- Sprint -->
          <div v-if="selectedBoard?.type === 'scrum'">
            <label class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Sprint</label>
            <select
              v-model="selectedTask.sprint"
              @change="updateTaskSprint"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Backlog</option>
              <option v-for="sprint in selectedBoard.sprints" :key="sprint._id" :value="sprint._id">
                {{ sprint.name }} ({{ sprint.status }})
              </option>
            </select>
          </div>
          <div v-else>
            <label class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Sprint</label>
            <div class="text-sm font-bold text-primary-600 bg-primary-50 inline-block px-2 py-1 rounded">{{ getTaskSprintName(selectedTask) }}</div>
          </div>

          <!-- GitHub Integration -->
          <div class="border-t border-slate-200 pt-5">
            <div class="flex items-center justify-between mb-3">
              <label class="text-xs font-bold text-slate-700 uppercase tracking-wider">Desarrollo</label>
              <i class="fab fa-github text-slate-500"></i>
            </div>

            <!-- Rama actual -->
            <div v-if="selectedTask.github?.branch" class="mb-3">
              <div class="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <i class="fas fa-code-branch text-emerald-600"></i>
                <span class="text-sm text-emerald-700 font-medium flex-1">{{ selectedTask.github.branch }}</span>
                <button
                  @click="deleteGitHubBranch"
                  class="p-2 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                  title="Eliminar rama"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <!-- Crear rama -->
            <div v-if="!selectedTask.github?.branch" class="space-y-3">
              <button
                @click="openCreateBranchModal"
                class="w-full px-4 py-2.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 text-sm shadow-sm transition-colors"
              >
                <i class="fas fa-code-branch mr-2"></i>
                Crear rama
              </button>
            </div>

            <!-- PR -->
            <div v-if="selectedTask.github?.pr" class="mt-3 space-y-2">
              <a
                :href="selectedTask.github.pr"
                target="_blank"
                class="flex items-center gap-2 p-3 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <i class="fas fa-code-pull-request text-primary-600"></i>
                <span class="text-sm text-primary-700 font-medium flex-1">Ver Pull Request</span>
                <i class="fas fa-external-link-alt text-primary-600 text-xs"></i>
              </a>
              
              <!-- Botón para sincronizar estado del PR -->
              <button
                @click="syncPullRequestStatus"
                class="w-full px-3 py-2 text-xs bg-slate-100 text-slate-600 font-bold border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                title="Actualizar estado del PR desde GitHub"
              >
                <i class="fas fa-sync-alt"></i>
                <span>Actualizar estado del PR</span>
              </button>
            </div>
            <button
              v-else-if="selectedTask.github?.branch"
              @click="createPullRequest"
              class="w-full mt-3 px-4 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 shadow-sm text-sm"
            >
              <i class="fas fa-code-pull-request mr-2"></i>
              Crear Pull Request
            </button>
          </div>

          <!-- Recursos Vinculados (Trazabilidad) -->
          <div class="border-t border-slate-200 pt-5">
            <div class="flex items-center justify-between mb-3">
              <label class="text-xs font-bold text-slate-700 uppercase tracking-wider">Recursos Vinculados</label>
              <div class="flex gap-1.5">
                <button 
                  @click="openCaseLinkingModal"
                  class="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded border border-indigo-100 transition-colors"
                >
                  + Caso
                </button>
                <button 
                  @click="openWikiLinkingModal"
                  class="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded border border-emerald-100 transition-colors"
                >
                  + Wiki
                </button>
              </div>
            </div>

            <!-- Lista de Recursos -->
            <div v-if="(selectedTask.linkedCases?.length || 0) + (selectedTask.linkedWikiArticles?.length || 0) > 0" class="space-y-2">
              <!-- Casos -->
              <div v-for="c in selectedTask.linkedCases" :key="c._id" class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg group">
                <div class="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center text-indigo-600 shrink-0">
                  <i class="fas fa-briefcase text-xs"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold text-slate-800 truncate">{{ c.title }}</div>
                  <div class="text-[10px] text-slate-500 font-medium">{{ c.caseNumber }} • {{ c.status }}</div>
                </div>
                <div class="flex items-center gap-1.5">
                  <button @click="openResource(c, 'case')" class="p-1.5 text-indigo-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all" title="Ver caso">
                    <i class="fas fa-external-link-alt text-xs"></i>
                  </button>
                  <button @click="unlinkCase(c._id)" class="p-1.5 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all" title="Desvincular">
                    <i class="fas fa-unlink text-xs"></i>
                  </button>
                </div>
              </div>

              <!-- Wiki -->
              <div v-for="a in selectedTask.linkedWikiArticles" :key="a._id" class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg group">
                <div class="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center text-emerald-600 shrink-0">
                  <i class="fas fa-book text-xs"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold text-slate-800 truncate">{{ a.title }}</div>
                  <div class="text-[10px] text-slate-500 font-medium">{{ a.category }}</div>
                </div>
                <div class="flex items-center gap-1.5">
                  <button @click="openResource(a)" class="p-1.5 text-emerald-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-all" title="Ver wiki">
                    <i class="fas fa-external-link-alt text-xs"></i>
                  </button>
                  <button @click="unlinkWiki(a._id)" class="p-1.5 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all" title="Desvincular">
                    <i class="fas fa-unlink text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-lg">
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sin recursos vinculados</p>
            </div>
          </div>

          <!-- Comentarios -->
          <div class="border-t border-slate-200 pt-5">
            <label class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 block">Comentarios</label>
            <div class="space-y-3 mb-3">
              <div
                v-for="comment in selectedTask.comments"
                :key="comment._id"
                class="p-4 bg-slate-50 border border-slate-100 rounded-lg shadow-sm"
              >
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                    {{ comment.user?.name?.charAt(0) }}
                  </div>
                  <span class="text-xs font-bold text-slate-800">{{ comment.user?.name }}</span>
                  <span class="text-xs font-medium text-slate-400">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="text-sm text-slate-600 leading-relaxed">{{ comment.text }}</p>
              </div>
            </div>
            <div class="flex gap-2">
              <input
                v-model="newComment"
                @keyup.enter="addComment"
                type="text"
                placeholder="Escribe un comentario..."
                class="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
              />
              <button
                @click="addComment"
                class="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 shadow-sm transition-colors"
                title="Enviar"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Crear Rama de GitHub -->
    <Teleport to="body">
      <div
        v-if="showCreateBranchModal && selectedTask"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[10000]"
        @click.self="showCreateBranchModal = false"
      >
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 max-w-md w-full mx-4 animate-fade-in">
        <h3 class="text-xl font-black text-slate-800 mb-5">
          <i class="fab fa-github mr-2"></i>
          Crear rama
        </h3>

        <div class="space-y-5">
          <!-- Repositorio -->
          <div>
            <label class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Repositorio</label>
            <select
              v-model="branchForm.repository"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
            >
              <option value="">Seleccionar...</option>
              <option v-for="repo in githubStore.repositories" :key="repo.name" :value="repo.full_name">
                {{ repo.name }}
              </option>
            </select>
          </div>

          <!-- Tipo -->
          <div>
            <label class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Tipo</label>
            <select
              v-model="branchForm.type"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
            >
              <option value="feature">Feature</option>
              <option value="bugfix">Bugfix</option>
              <option value="hotfix">Hotfix</option>
              <option value="release">Release</option>
            </select>
          </div>

          <!-- Rama base -->
          <div>
            <label class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Desde rama</label>
            <select
              v-model="branchForm.baseBranch"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
            >
              <option value="master">master</option>
              <option value="main">main</option>
              <option value="develop">develop</option>
            </select>
          </div>

          <!-- Nombre de la rama (editable) -->
          <div>
            <label class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
              Nombre de la rama
              <button
                @click="branchForm.customName = generateBranchName()"
                type="button"
                class="ml-2 text-xs text-primary-600 hover:text-primary-700"
                title="Regenerar nombre"
              >
                <i class="fas fa-sync-alt"></i>
              </button>
            </label>
            <input
              v-model="branchForm.customName"
              type="text"
              placeholder="feature/task-123-titulo"
              class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
              @focus="() => { if (!branchForm.customName) branchForm.customName = generateBranchName() }"
            />
            <p class="text-xs text-slate-500 mt-1.5 font-medium">Puedes personalizar el nombre de la rama</p>
          </div>

          <!-- Diagrama visual -->
          <div class="py-4 flex items-center justify-center gap-4 bg-slate-50 rounded-lg border border-slate-100 mt-2">
            <div class="flex flex-col items-center">
              <div class="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
              <div class="text-[10px] font-bold text-slate-500 mt-2 uppercase">{{ branchForm.baseBranch }}</div>
            </div>
            <div class="flex-1 h-0.5 bg-slate-300"></div>
            <div class="flex flex-col items-center">
              <div class="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
              <div class="text-[10px] font-bold text-slate-500 mt-2 text-center max-w-[120px] truncate uppercase">
                {{ branchForm.customName || generateBranchName() }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button
            @click="createGitHubBranch"
            :disabled="!branchForm.repository"
            class="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors shadow-sm text-sm"
          >
            Crear Rama
          </button>
          <button
            @click="showCreateBranchModal = false"
            class="px-5 py-2.5 bg-white text-slate-600 font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
      </div>
    </Teleport>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-5 mx-4 shadow-sm">
      <div class="flex items-center gap-3">
        <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
        <div>
          <h3 class="text-red-800 font-bold">Error al cargar actividades</h3>
          <p class="text-red-600 text-sm mt-0.5 font-medium">{{ error }}</p>
        </div>
      </div>
      <button 
        @click="loadActivities"
        class="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 shadow-sm transition-colors"
      >
        Reintentar
      </button>
    </div>

    <!-- Tablero Kanban -->
    <div
      v-else-if="currentView === 'kanban'"
      class="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-4"
    >
      <!-- Columna Pendiente -->
      <div class="bg-gradient-to-b from-slate-50/50 to-white border border-slate-200/60 rounded-xl p-3 sm:p-4 w-full snap-start flex flex-col h-full shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center border border-amber-200 shadow-sm">
            <i class="far fa-clock text-amber-500 text-sm"></i>
          </div>
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">Pendiente</h2>
          <span class="w-5 h-5 flex items-center justify-center bg-amber-100 border border-amber-200 text-amber-600 rounded-full text-[10px] font-black shadow-sm">
            {{ pendingActivities.length }}
          </span>
        </div>
        
        <div 
          :class="[
            'flex flex-col gap-3 flex-1 overflow-y-auto overflow-x-visible px-1.5 pb-6 transition-all duration-300 min-h-0 content-start custom-scrollbar-slim',
            isDragging && draggedActivity?.status !== 'pending' ? 'ring-2 ring-amber-400/50 rounded-lg bg-amber-50/50' : ''
          ]"
          @drop="onDrop($event, 'pending')"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="activity in pendingActivities"
            :key="activity._id"
            class="bg-white rounded-xl p-3 border border-slate-200 hover:border-amber-400 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 shadow-sm transition-all duration-300 group cursor-move relative shrink-0 flex flex-col"
            :class="expandedCards.has(activity._id!) ? 'h-auto min-h-[185px] z-20' : 'h-[185px]'"
            draggable="true"
            @dragstart="onDragStart($event, activity)"
            @dragend="onDragEnd"
          >
            <!-- Priority Sidebar -->
            <div 
              class="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl transition-colors"
              :class="activity.priority === 'urgent' ? 'bg-red-500' : activity.priority === 'high' ? 'bg-orange-500' : activity.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-200'"
            ></div>

            <div 
              class="flex flex-col relative group/card transition-all duration-300 cursor-pointer h-full"
              :class="expandedCards.has(activity._id!) ? '' : 'overflow-hidden'"
              @click="editActivity(activity)"
            >
              <div class="p-2.5 flex flex-col h-full">
                <!-- Top Row -->
                <div class="flex justify-between items-center mb-1">
                  <span class="text-[7px] font-black uppercase text-amber-600 tracking-widest bg-amber-50 px-1 rounded">{{ activity.dueDate ? formatDate(activity.dueDate) : 'Sin fecha' }}</span>
                </div>

                <!-- Middle: Title & Client -->
                <div class="flex-1 min-w-0 pr-12">
                  <h3 class="text-slate-800 font-black text-[13px] leading-tight line-clamp-2 group-hover:text-amber-600 transition-colors" :title="activity.title">{{ activity.title }}</h3>
                  <p class="text-slate-400 font-bold text-[10px] uppercase tracking-wider mt-0.5 truncate">{{ getClientName(activity.clientId) }}</p>
                  
                  <!-- Visible Expand Toggle -->
                  <button @click.stop="toggleCardExpansion(activity._id!)" class="mt-1 flex items-center gap-1 text-slate-400 hover:text-amber-500 transition-colors py-0.5">
                    <i class="fas text-[8px]" :class="expandedCards.has(activity._id!) ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                    <span class="text-[7px] font-black uppercase tracking-tighter">{{ expandedCards.has(activity._id!) ? 'Ocultar' : 'Detalles' }}</span>
                  </button>

                  <!-- Expandable Description (Enlarged Card Style) -->
                  <div v-if="expandedCards.has(activity._id!)" class="mt-4 text-[10px] text-slate-600 leading-relaxed border-t border-slate-100 pt-4 animate-scale-up font-medium bg-slate-50/50 -mx-3.5 px-3.5 pb-2 rounded-b-xl">
                    <div class="flex items-center gap-2 mb-2 text-slate-400">
                      <i class="fas fa-align-left text-[8px]"></i>
                      <span class="text-[8px] font-black uppercase tracking-widest">Detalles de actividad</span>
                    </div>
                    <p class="whitespace-pre-wrap break-words overflow-hidden">{{ activity.description || 'Sin descripción adicional' }}</p>
                  </div>
                </div>

                <!-- Bottom Row -->
                <div class="mt-auto flex items-center justify-between pt-2">
                  <div class="flex items-center gap-1.5">
                    <!-- Timer & Manual Edit (Pending) -->
                    <div class="flex items-center gap-1">
                      <button 
                        @click.stop="toggleTimer(activity)" 
                        class="w-6 h-6 flex items-center justify-center rounded-lg transition-all shadow-sm border text-amber-500 bg-amber-50 border-amber-200 hover:bg-white hover:border-amber-400"
                      >
                        <i class="fas fa-play text-[8px]"></i>
                      </button>

                      <div class="relative">
                        <div 
                          @click.stop="startEditingTime(activity)" 
                          class="flex items-center gap-1 text-[9px] font-black text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 cursor-pointer hover:border-amber-300 transition-all shadow-sm"
                        >
                          <i class="far fa-clock text-[8px] text-slate-400"></i>
                          <span class="whitespace-nowrap">{{ formatTime(activity.timeSpent) }}</span>
                        </div>

                        <!-- Manual Time Edit Popover -->
                        <div v-if="editingTimeId === activity._id" class="absolute bottom-full left-0 mb-2 z-[60] bg-white rounded-xl shadow-2xl border border-slate-200 p-3 min-w-[140px] animate-scale-up origin-bottom-left" @click.stop>
                          <div class="flex items-center gap-2 mb-2">
                            <div class="flex flex-col gap-1">
                              <span class="text-[8px] font-black text-slate-400 uppercase">Horas</span>
                              <input v-model="manualHours" type="number" min="0" class="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold focus:bg-white transition-all">
                            </div>
                            <div class="flex flex-col gap-1">
                              <span class="text-[8px] font-black text-slate-400 uppercase">Minutos</span>
                              <input v-model="manualMinutes" type="number" min="0" max="59" class="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold focus:bg-white transition-all">
                            </div>
                          </div>
                          <div class="flex gap-1.5">
                            <button @click="saveManualTime(activity)" class="flex-1 py-1.5 bg-primary-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-primary-700 transition-all">Guardar</button>
                            <button @click="editingTimeId = null" class="px-2 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase hover:bg-slate-200 transition-all">X</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Progress % with Inline Edit -->
                    <div class="relative">
                      <div @click.stop="editingPercentageId = activity._id!" class="flex items-center gap-1 text-[9px] font-black text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 cursor-pointer hover:bg-white hover:border-amber-300 transition-all">
                        <span class="text-amber-600">{{ Math.min(activity.completionPercentage || 0, 100) }}%</span>
                      </div>
                      
                      <!-- Popover de edición de porcentaje -->
                      <div v-if="editingPercentageId === activity._id" class="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-lg shadow-xl border border-slate-200 p-2 flex items-center gap-2 animate-scale-up origin-bottom-left" @click.stop>
                        <input v-model="activity.completionPercentage" type="number" min="0" max="100" class="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold focus:bg-white transition-all" @keyup.enter="updatePercentage(activity, activity.completionPercentage); editingPercentageId = null">
                        <button @click.stop="updatePercentage(activity, activity.completionPercentage); editingPercentageId = null" class="p-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors">
                          <i class="fas fa-check text-[8px]"></i>
                        </button>
                        <button @click="editingPercentageId = null" class="p-1 bg-slate-100 text-slate-500 rounded hover:bg-slate-200 transition-colors">
                          <i class="fas fa-times text-[8px]"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex -space-x-1.5" @click.stop>
                    <template v-if="Array.isArray(activity.assignedTo) && activity.assignedTo.length">
                      <div v-for="user in activity.assignedTo.slice(0, 3)" :key="user._id || user" class="relative">
                        <img v-if="getUserInfo(user).photo" :src="getUserInfo(user).photo" class="w-5 h-5 rounded-full border border-white shadow-sm object-cover" :title="getUserInfo(user).name">
                        <div v-else class="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[9px] font-bold text-slate-500 shadow-sm" :title="getUserInfo(user).name">
                          {{ getUserInfo(user).name.charAt(0).toUpperCase() }}
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>

              <!-- Floating Actions Pill -->
              <div class="absolute right-1.5 top-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-10" @click.stop>
                <button @click.stop="markAsCompleted(activity._id!)" class="w-6 h-6 flex items-center justify-center text-emerald-600 bg-white/95 backdrop-blur-sm hover:bg-emerald-500 hover:text-white rounded-lg shadow-sm border border-emerald-100 transition-all" title="Completar"><i class="fas fa-check text-[7px]"></i></button>
                <button @click.stop="deleteActivity(activity._id!)" class="w-6 h-6 flex items-center justify-center text-red-600 bg-white/95 backdrop-blur-sm hover:bg-red-500 hover:text-white rounded-lg shadow-sm border border-red-100 transition-all" title="Eliminar"><i class="fas fa-trash-alt text-[7px]"></i></button>
              </div>
            </div>
          </div>

          <!-- View More Button -->
          <div v-if="hasMorePending" class="mt-4 pb-2">
            <button 
              @click="increaseLimit('pending')"
              class="w-full py-2.5 bg-white/50 hover:bg-white border border-slate-200 border-dashed rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest transition-all hover:border-amber-400 hover:text-amber-600 shadow-sm"
            >
              <i class="fas fa-plus-circle mr-1.5"></i>
              Ver más tareas pendientes
            </button>
          </div>

          <!-- Estado vacío para pendientes -->
          <div v-if="pendingActivities.length === 0" class="text-center py-8">
            <i class="fas fa-clock text-3xl text-slate-300 mb-2"></i>
            <p class="text-slate-500 text-sm font-medium">No hay actividades pendientes</p>
          </div>
        </div>

        <!-- Botón de tarea rápida al final de la columna pendientes -->
        <div class="mt-3">
          <button
            @click="createQuickTaskForStatus('pending')"
            class="w-full py-2 bg-white border border-dashed border-amber-300 rounded-lg text-amber-600 font-bold hover:bg-amber-50 hover:border-amber-400 transition-all duration-200 text-sm shadow-sm"
          >
            <i class="fas fa-plus mr-1"></i>
            Agregar tarea rápida
          </button>
        </div>
      </div>

    <!-- Columna En Proceso -->
    <div class="bg-gradient-to-b from-slate-50/50 to-white border border-slate-200/60 rounded-xl p-3 sm:p-4 w-full snap-start flex flex-col h-full shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200">
            <i class="fas fa-play text-blue-500 text-sm"></i>
          </div>
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">En Proceso</h2>
          <span class="w-5 h-5 flex items-center justify-center bg-blue-100 border border-blue-200 text-blue-600 rounded-full text-[10px] font-black shadow-sm">
            {{ inProgressActivities.length }}
          </span>
        </div>
        
        <div 
          :class="[
            'flex flex-col gap-3 flex-1 overflow-y-auto overflow-x-visible px-1.5 pb-6 transition-all duration-300 min-h-0 content-start custom-scrollbar-slim',
            isDragging && draggedActivity?.status !== 'in-progress' ? 'ring-2 ring-blue-400/50 rounded-lg bg-blue-50/50' : ''
          ]"
          @drop="onDrop($event, 'in-progress')"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="activity in inProgressActivities"
            :key="activity._id"
            class="bg-white rounded-xl p-3 border border-slate-200 hover:border-blue-400 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 shadow-sm transition-all duration-300 group cursor-move relative shrink-0 flex flex-col"
            :class="expandedCards.has(activity._id!) ? 'h-auto min-h-[185px] z-20' : 'h-[185px]'"
            draggable="true"
            @dragstart="onDragStart($event, activity)"
            @dragend="onDragEnd"
          >
            <!-- Priority Sidebar -->
            <div 
              class="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl transition-colors"
              :class="activity.priority === 'urgent' ? 'bg-red-500' : activity.priority === 'high' ? 'bg-orange-500' : activity.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-200'"
            ></div>

            <div 
              class="flex flex-col relative group/card transition-all duration-300 cursor-pointer h-full"
              :class="expandedCards.has(activity._id!) ? '' : 'overflow-hidden'"
              @click="editActivity(activity)"
            >
              <div class="p-2.5 flex flex-col h-full">
                <!-- Top Row -->
                <div class="flex justify-between items-center mb-1">
                  <span class="text-[7px] font-black uppercase text-blue-600 tracking-widest bg-blue-50 px-1 rounded">{{ activity.dueDate ? formatDate(activity.dueDate) : 'Sin fecha' }}</span>
                </div>

                <!-- Middle -->
                <div class="flex-1 min-w-0 pr-12">
                  <h3 class="text-slate-800 font-black text-[13px] leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors" :title="activity.title">{{ activity.title }}</h3>
                  <p class="text-slate-400 font-bold text-[10px] uppercase tracking-wider mt-0.5 truncate">{{ getClientName(activity.clientId) }}</p>
                  
                  <!-- Visible Expand Toggle -->
                  <button @click.stop="toggleCardExpansion(activity._id!)" class="mt-1 flex items-center gap-1 text-slate-400 hover:text-blue-500 transition-colors py-0.5">
                    <i class="fas text-[8px]" :class="expandedCards.has(activity._id!) ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                    <span class="text-[7px] font-black uppercase tracking-tighter">{{ expandedCards.has(activity._id!) ? 'Ocultar' : 'Detalles' }}</span>
                  </button>

                  <!-- Expandable Description (Enlarged Card Style) -->
                  <div v-if="expandedCards.has(activity._id!)" class="mt-4 text-[10px] text-slate-600 leading-relaxed border-t border-slate-100 pt-4 animate-scale-up font-medium bg-slate-50/50 -mx-3.5 px-3.5 pb-2 rounded-b-xl">
                    <div class="flex items-center gap-2 mb-2 text-slate-400">
                      <i class="fas fa-align-left text-[8px]"></i>
                      <span class="text-[8px] font-black uppercase tracking-widest">Detalles de actividad</span>
                    </div>
                    <p class="whitespace-pre-wrap break-words overflow-hidden">{{ activity.description || 'Sin descripción adicional' }}</p>
                  </div>
                </div>

                <!-- Bottom Row -->
                <div class="mt-auto flex items-center justify-between pt-2">
                  <div class="flex items-center gap-1.5">
                    <!-- Timer & Manual Edit (En Proceso) -->
                    <div class="flex items-center gap-1">
                      <button 
                        @click.stop="toggleTimer(activity)" 
                        class="w-6 h-6 flex items-center justify-center rounded-lg transition-all shadow-sm border" 
                        :class="isTimerActive(activity) ? 'text-red-500 bg-red-50 border-red-200 animate-pulse' : 'text-blue-500 bg-blue-50 border-blue-200 hover:bg-white hover:border-blue-400'"
                      >
                        <i :class="isTimerActive(activity) ? 'fas fa-stop' : 'fas fa-play'" class="text-[8px]"></i>
                      </button>

                      <div class="relative">
                        <div 
                          @click.stop="startEditingTime(activity)" 
                          class="flex items-center gap-1 text-[9px] font-black text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 cursor-pointer hover:border-blue-300 transition-all shadow-sm"
                        >
                          <i class="far fa-clock text-[8px] text-slate-400"></i>
                          <span :class="isTimerActive(activity) ? 'text-red-500' : ''" class="whitespace-nowrap">{{ formatTime(activity.timeSpent) }}</span>
                        </div>

                        <!-- Manual Time Edit Popover -->
                        <div v-if="editingTimeId === activity._id" class="absolute bottom-full left-0 mb-2 z-[60] bg-white rounded-xl shadow-2xl border border-slate-200 p-3 min-w-[140px] animate-scale-up origin-bottom-left" @click.stop>
                          <div class="flex items-center gap-2 mb-2">
                            <div class="flex flex-col gap-1">
                              <span class="text-[8px] font-black text-slate-400 uppercase">Horas</span>
                              <input v-model="manualHours" type="number" min="0" class="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold focus:bg-white transition-all">
                            </div>
                            <div class="flex flex-col gap-1">
                              <span class="text-[8px] font-black text-slate-400 uppercase">Minutos</span>
                              <input v-model="manualMinutes" type="number" min="0" max="59" class="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold focus:bg-white transition-all">
                            </div>
                          </div>
                          <div class="flex gap-1.5">
                            <button @click="saveManualTime(activity)" class="flex-1 py-1.5 bg-primary-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-primary-700 transition-all">Guardar</button>
                            <button @click="editingTimeId = null" class="px-2 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase hover:bg-slate-200 transition-all">X</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Progress % with Inline Edit -->
                    <div class="relative">
                      <div @click.stop="editingPercentageId = activity._id!" class="flex items-center gap-1 text-[9px] font-black text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 cursor-pointer hover:bg-white hover:border-blue-300 transition-all">
                        <span :class="activity.status === 'overdue' ? 'text-red-600' : 'text-blue-600'">{{ Math.min(activity.completionPercentage || 0, 100) }}%</span>
                      </div>

                      <!-- Popover de edición de porcentaje -->
                      <div v-if="editingPercentageId === activity._id" class="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-lg shadow-xl border border-slate-200 p-2 flex items-center gap-2 animate-scale-up origin-bottom-left" @click.stop>
                        <input v-model="activity.completionPercentage" type="number" min="0" max="100" class="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold focus:bg-white transition-all" @keyup.enter="updatePercentage(activity, activity.completionPercentage); editingPercentageId = null">
                        <button @click.stop="updatePercentage(activity, activity.completionPercentage); editingPercentageId = null" class="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                          <i class="fas fa-check text-[8px]"></i>
                        </button>
                        <button @click="editingPercentageId = null" class="p-1 bg-slate-100 text-slate-500 rounded hover:bg-slate-200 transition-colors">
                          <i class="fas fa-times text-[8px]"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex -space-x-1.5" @click.stop>
                    <template v-if="Array.isArray(activity.assignedTo) && activity.assignedTo.length">
                      <div v-for="user in activity.assignedTo.slice(0, 3)" :key="user._id || user" class="relative">
                        <img v-if="getUserInfo(user).photo" :src="getUserInfo(user).photo" class="w-5 h-5 rounded-full border border-white shadow-sm object-cover" :title="getUserInfo(user).name">
                        <div v-else class="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[9px] font-bold text-slate-500 shadow-sm" :title="getUserInfo(user).name">
                          {{ getUserInfo(user).name.charAt(0).toUpperCase() }}
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>

              <!-- Floating Actions Pill -->
              <div class="absolute right-1.5 top-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-10" @click.stop>
                <button @click.stop="markAsCompleted(activity._id!)" class="w-6 h-6 flex items-center justify-center text-emerald-600 bg-white/95 backdrop-blur-sm hover:bg-emerald-500 hover:text-white rounded-lg shadow-sm border border-emerald-100 transition-all" title="Completar"><i class="fas fa-check text-[7px]"></i></button>
                <button @click.stop="deleteActivity(activity._id!)" class="w-6 h-6 flex items-center justify-center text-red-600 bg-white/95 backdrop-blur-sm hover:bg-red-500 hover:text-white rounded-lg shadow-sm border border-red-100 transition-all" title="Eliminar"><i class="fas fa-trash-alt text-[7px]"></i></button>
              </div>
            </div>
          </div>

          <!-- View More Button -->
          <div v-if="hasMoreInProgress" class="mt-4 pb-2">
            <button 
              @click="increaseLimit('inProgress')"
              class="w-full py-2.5 bg-white/50 hover:bg-white border border-slate-200 border-dashed rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest transition-all hover:border-blue-400 hover:text-blue-600 shadow-sm"
            >
              <i class="fas fa-plus-circle mr-1.5"></i>
              Ver más tareas en proceso
            </button>
          </div>

          <div v-if="inProgressActivities.length === 0" class="text-center py-8">
            <i class="fas fa-play text-3xl text-slate-300 mb-2"></i>
            <p class="text-slate-500 text-sm font-medium">No hay actividades en proceso</p>
          </div>
        </div>

        <!-- Botón de tarea rápida al final de la columna en proceso -->
        <div class="mt-3">
          <button
            @click="createQuickTaskForStatus('in-progress')"
            class="w-full py-2 bg-white border border-dashed border-blue-300 rounded-lg text-blue-600 font-bold hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 text-sm shadow-sm"
          >
            <i class="fas fa-plus mr-1"></i>
            Agregar tarea rápida
          </button>
        </div>
      </div>

    <!-- Columna Completada -->
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 w-full snap-start flex flex-col h-full shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-200">
            <i class="fas fa-check text-emerald-500 text-sm"></i>
          </div>
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">Completada</h2>
          <span class="w-5 h-5 flex items-center justify-center bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full text-[10px] font-black shadow-sm">
            {{ completedActivities.length }}
          </span>
        </div>
        
        <div 
          :class="[
            'flex flex-col gap-3 flex-1 overflow-y-auto overflow-x-visible px-1.5 pb-6 transition-all duration-300 min-h-0 content-start custom-scrollbar-slim',
            isDragging && draggedActivity?.status !== 'completed' ? 'ring-2 ring-emerald-400/50 rounded-lg bg-emerald-50/50' : ''
          ]"
          @drop="onDrop($event, 'completed')"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="activity in completedActivities"
            :key="activity._id"
            class="bg-white rounded-xl p-3 border border-slate-200 hover:border-emerald-400 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 shadow-sm transition-all duration-300 group cursor-move relative shrink-0 opacity-80 hover:opacity-100 flex flex-col"
            :class="expandedCards.has(activity._id!) ? 'h-auto min-h-[185px] z-20' : 'h-[185px]'"
            draggable="true"
            @dragstart="onDragStart($event, activity)"
            @dragend="onDragEnd"
          >
            <!-- Priority Sidebar (Gray for completed) -->
            <div class="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl bg-slate-200"></div>

            <div 
              class="flex flex-col relative group/card transition-all duration-300 cursor-pointer h-full"
              :class="expandedCards.has(activity._id!) ? '' : 'overflow-hidden'"
              @click="editActivity(activity)"
            >
              <div class="p-2.5 flex flex-col h-full">
                <!-- Top Row -->
                <div class="flex justify-between items-center mb-1">
                  <span class="text-[7px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-50 px-1 rounded">{{ activity.dueDate ? formatDate(activity.dueDate) : 'Sin fecha' }}</span>
                </div>

                <!-- Middle -->
                <div class="flex-1 min-w-0 pr-12">
                  <h3 class="text-slate-500 font-bold text-[13px] leading-snug mb-1 line-clamp-2 line-through decoration-slate-300" :title="activity.title">{{ activity.title }}</h3>
                  <p class="text-slate-400 font-bold text-[10px] uppercase tracking-wider mt-0.5 truncate">{{ getClientName(activity.clientId) }}</p>
                  
                  <!-- Visible Expand Toggle -->
                  <button @click.stop="toggleCardExpansion(activity._id!)" class="mt-1 flex items-center gap-1 text-slate-400 hover:text-emerald-500 transition-colors py-0.5">
                    <i class="fas text-[8px]" :class="expandedCards.has(activity._id!) ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                    <span class="text-[7px] font-black uppercase tracking-tighter">{{ expandedCards.has(activity._id!) ? 'Ocultar' : 'Detalles' }}</span>
                  </button>

                  <!-- Expandable Description (Enlarged Card Style) -->
                  <div v-if="expandedCards.has(activity._id!)" class="mt-4 text-[10px] text-slate-600 leading-relaxed border-t border-slate-100 pt-4 animate-scale-up font-medium bg-slate-50/50 -mx-3.5 px-3.5 pb-2 rounded-b-xl">
                    <div class="flex items-center gap-2 mb-2 text-slate-400">
                      <i class="fas fa-align-left text-[8px]"></i>
                      <span class="text-[8px] font-black uppercase tracking-widest">Detalles de actividad</span>
                    </div>
                    <p class="whitespace-pre-wrap break-words overflow-hidden">{{ activity.description || 'Sin descripción adicional' }}</p>
                  </div>
                </div>

                <!-- Bottom Row -->
                <div class="mt-auto flex items-center justify-between pt-2">
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 shadow-sm shrink-0">
                      <i class="fas fa-check-circle text-[8px]"></i>
                      <span>COMPLETADO</span>
                    </div>

                    <!-- Manual Time (Completed) -->
                    <div class="relative">
                      <div @click.stop="startEditingTime(activity)" class="flex items-center gap-1.5 text-[9px] font-black text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 cursor-pointer hover:border-emerald-300 transition-all shadow-sm">
                        <i class="far fa-clock text-[8px] text-slate-400"></i>
                        <span class="whitespace-nowrap">{{ formatTime(activity.timeSpent) }}</span>
                      </div>
                      <div v-if="editingTimeId === activity._id" class="absolute bottom-full left-0 mb-2 z-[60] bg-white rounded-xl shadow-2xl border border-slate-200 p-3 min-w-[140px] animate-scale-up origin-bottom-left" @click.stop>
                        <div class="flex items-center gap-2 mb-2">
                          <div class="flex flex-col gap-1">
                            <span class="text-[8px] font-black text-slate-400 uppercase">Horas</span>
                            <input v-model="manualHours" type="number" min="0" class="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold focus:bg-white transition-all">
                          </div>
                          <div class="flex flex-col gap-1">
                            <span class="text-[8px] font-black text-slate-400 uppercase">Minutos</span>
                            <input v-model="manualMinutes" type="number" min="0" max="59" class="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold focus:bg-white transition-all">
                          </div>
                        </div>
                        <div class="flex gap-1.5">
                          <button @click="saveManualTime(activity)" class="flex-1 py-1.5 bg-primary-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-primary-700 transition-all">Guardar</button>
                          <button @click="editingTimeId = null" class="px-2 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase hover:bg-slate-200 transition-all">X</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex -space-x-1.5" @click.stop>
                    <template v-if="Array.isArray(activity.assignedTo) && activity.assignedTo.length">
                      <div v-for="user in activity.assignedTo.slice(0, 3)" :key="user._id || user" class="relative">
                        <img v-if="getUserInfo(user).photo" :src="getUserInfo(user).photo" class="w-5 h-5 rounded-full border border-white shadow-sm object-cover" :title="getUserInfo(user).name">
                        <div v-else class="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[9px] font-bold text-slate-500 shadow-sm" :title="getUserInfo(user).name">
                          {{ getUserInfo(user).name.charAt(0).toUpperCase() }}
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>

              <!-- Floating Actions Pill -->
              <div class="absolute right-1.5 top-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-10" @click.stop>
                <button @click.stop="markAsPending(activity._id!)" class="w-6 h-6 flex items-center justify-center text-amber-600 bg-white/95 backdrop-blur-sm hover:bg-amber-500 hover:text-white rounded-lg shadow-sm border border-amber-100 transition-all" title="Deshacer"><i class="fas fa-undo text-[7px]"></i></button>
                <button @click.stop="deleteActivity(activity._id!)" class="w-6 h-6 flex items-center justify-center text-red-600 bg-white/95 backdrop-blur-sm hover:bg-red-500 hover:text-white rounded-lg shadow-sm border border-red-100 transition-all" title="Eliminar"><i class="fas fa-trash-alt text-[7px]"></i></button>
              </div>
            </div>
          </div>

          <!-- View More Button -->
          <div v-if="hasMoreCompleted" class="mt-4 pb-2">
            <button 
              @click="increaseLimit('completed')"
              class="w-full py-2.5 bg-white/50 hover:bg-white border border-slate-200 border-dashed rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest transition-all hover:border-emerald-400 hover:text-emerald-600 shadow-sm"
            >
              <i class="fas fa-plus-circle mr-1.5"></i>
              Ver más tareas completadas
            </button>
          </div>

          <!-- Estado vacío para completadas -->
          <div v-if="completedActivities.length === 0" class="text-center py-8">
            <i class="fas fa-check-circle text-3xl text-slate-300 mb-2"></i>
            <p class="text-slate-500 text-sm font-medium">No hay actividades completadas</p>
          </div>
        </div>
      </div>

    <!-- Columna Vencida -->
    <div class="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 w-full snap-start flex flex-col h-full shadow-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center border border-red-200">
            <i class="fas fa-exclamation-triangle text-red-600 text-sm"></i>
          </div>
          <h2 class="text-xs font-black text-red-800 uppercase tracking-wide">Vencida</h2>
          <span class="w-5 h-5 flex items-center justify-center bg-red-100 border border-red-200 text-red-600 rounded-full text-[10px] font-black shadow-sm">
            {{ overdueActivities.length }}
          </span>
        </div>
        
        <div 
          :class="[
            'flex flex-col gap-3 flex-1 overflow-y-auto overflow-x-visible px-1.5 pb-6 transition-all duration-300 min-h-0 content-start custom-scrollbar-slim',
            isDragging && draggedActivity?.status !== 'overdue' ? 'ring-2 ring-red-400/50 rounded-lg bg-red-50/50' : ''
          ]"
          @drop="onDrop($event, 'overdue')"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="activity in overdueActivities"
            :key="activity._id"
            class="bg-white rounded-xl p-3 border border-red-200 hover:border-red-500 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 shadow-sm transition-all duration-300 group cursor-move relative shrink-0 flex flex-col"
            :class="expandedCards.has(activity._id!) ? 'h-auto min-h-[185px] z-20' : 'h-[185px]'"
            draggable="true"
            @dragstart="onDragStart($event, activity)"
            @dragend="onDragEnd"
          >
            <!-- Priority Sidebar (Red for overdue) -->
            <div class="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]"></div>

            <div 
              class="flex flex-col relative group/card transition-all duration-300 cursor-pointer h-full"
              :class="expandedCards.has(activity._id!) ? '' : 'overflow-hidden'"
              @click="editActivity(activity)"
            >
              <div class="p-2.5 flex flex-col h-full">
                <!-- Top Row -->
                <div class="flex justify-between items-center mb-1">
                  <span class="text-[7px] font-black uppercase text-red-600 tracking-widest bg-red-50 px-1 rounded">{{ activity.dueDate ? formatDate(activity.dueDate) : 'Sin fecha' }}</span>
                </div>

                <!-- Middle -->
                <div class="flex-1 min-w-0 pr-12">
                  <h3 class="text-red-900 font-bold text-[13px] leading-snug mb-1 line-clamp-2 group-hover:text-red-600 transition-colors" :title="activity.title">{{ activity.title }}</h3>
                  <p class="text-red-500 font-bold text-[10px] uppercase tracking-wider mt-0.5 truncate">{{ getClientName(activity.clientId) }}</p>
                  
                  <!-- Visible Expand Toggle -->
                  <button @click.stop="toggleCardExpansion(activity._id!)" class="mt-1 flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors py-0.5">
                    <i class="fas text-[8px]" :class="expandedCards.has(activity._id!) ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                    <span class="text-[7px] font-black uppercase tracking-tighter">{{ expandedCards.has(activity._id!) ? 'Ocultar' : 'Detalles' }}</span>
                  </button>

                  <!-- Expandable Description (Enlarged Card Style) -->
                  <div v-if="expandedCards.has(activity._id!)" class="mt-4 text-[10px] text-slate-600 leading-relaxed border-t border-slate-100 pt-4 animate-scale-up font-medium bg-slate-50/50 -mx-3.5 px-3.5 pb-2 rounded-b-xl">
                    <div class="flex items-center gap-2 mb-2 text-slate-400">
                      <i class="fas fa-align-left text-[8px]"></i>
                      <span class="text-[8px] font-black uppercase tracking-widest">Detalles de actividad</span>
                    </div>
                    <p class="whitespace-pre-wrap break-words overflow-hidden">{{ activity.description || 'Sin descripción adicional' }}</p>
                  </div>
                </div>

                <!-- Bottom Row -->
                <div class="mt-auto flex items-center justify-between pt-2">
                  <div class="flex items-center gap-1.5">
                    <!-- Timer & Manual Edit (Vencida) -->
                    <div class="flex items-center gap-1">
                      <button 
                        @click.stop="toggleTimer(activity)" 
                        class="w-6 h-6 flex items-center justify-center rounded-lg transition-all shadow-sm border text-red-500 bg-red-50 border-red-200 hover:bg-white hover:border-red-400"
                      >
                        <i class="fas fa-play text-[8px]"></i>
                      </button>

                      <div class="relative">
                        <div 
                          @click.stop="startEditingTime(activity)" 
                          class="flex items-center gap-1 text-[9px] font-black text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 cursor-pointer hover:border-red-300 transition-all shadow-sm"
                        >
                          <i class="far fa-clock text-[8px] text-slate-400"></i>
                          <span class="whitespace-nowrap">{{ formatTime(activity.timeSpent) }}</span>
                        </div>

                        <!-- Manual Time Edit Popover -->
                        <div v-if="editingTimeId === activity._id" class="absolute bottom-full left-0 mb-2 z-[60] bg-white rounded-xl shadow-2xl border border-slate-200 p-3 min-w-[140px] animate-scale-up origin-bottom-left" @click.stop>
                          <div class="flex items-center gap-2 mb-2">
                            <div class="flex flex-col gap-1">
                              <span class="text-[8px] font-black text-slate-400 uppercase">Horas</span>
                              <input v-model="manualHours" type="number" min="0" class="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold focus:bg-white transition-all">
                            </div>
                            <div class="flex flex-col gap-1">
                              <span class="text-[8px] font-black text-slate-400 uppercase">Minutos</span>
                              <input v-model="manualMinutes" type="number" min="0" max="59" class="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold focus:bg-white transition-all">
                            </div>
                          </div>
                          <div class="flex gap-1.5">
                            <button @click="saveManualTime(activity)" class="flex-1 py-1.5 bg-primary-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-primary-700 transition-all">Guardar</button>
                            <button @click="editingTimeId = null" class="px-2 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase hover:bg-slate-200 transition-all">X</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Progress % with Inline Edit -->
                    <div class="relative">
                      <div @click.stop="editingPercentageId = activity._id!" class="flex items-center gap-1 text-[9px] font-black text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 cursor-pointer hover:bg-white hover:border-red-300 transition-all">
                        <span>{{ Math.min(activity.completionPercentage || 0, 100) }}%</span>
                      </div>

                      <!-- Popover de edición de porcentaje -->
                      <div v-if="editingPercentageId === activity._id" class="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-lg shadow-xl border border-slate-200 p-2 flex items-center gap-2 animate-scale-up origin-bottom-left" @click.stop>
                        <input v-model="activity.completionPercentage" type="number" min="0" max="100" class="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold focus:bg-white transition-all" @keyup.enter="updatePercentage(activity, activity.completionPercentage); editingPercentageId = null">
                        <button @click.stop="updatePercentage(activity, activity.completionPercentage); editingPercentageId = null" class="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                          <i class="fas fa-check text-[8px]"></i>
                        </button>
                        <button @click="editingPercentageId = null" class="p-1 bg-slate-100 text-slate-500 rounded hover:bg-slate-200 transition-colors">
                          <i class="fas fa-times text-[8px]"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex -space-x-1.5" @click.stop>
                    <template v-if="Array.isArray(activity.assignedTo) && activity.assignedTo.length">
                      <div v-for="user in activity.assignedTo.slice(0, 3)" :key="user._id || user" class="relative">
                        <img v-if="getUserInfo(user).photo" :src="getUserInfo(user).photo" class="w-5 h-5 rounded-full border border-white shadow-sm object-cover" :title="getUserInfo(user).name">
                        <div v-else class="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[9px] font-bold text-slate-500 shadow-sm" :title="getUserInfo(user).name">
                          {{ getUserInfo(user).name.charAt(0).toUpperCase() }}
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>

              <!-- Floating Actions Pill -->
              <div class="absolute right-1.5 top-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-10" @click.stop>
                <button @click.stop="extendDeadline(activity._id!)" class="w-6 h-6 flex items-center justify-center text-amber-600 bg-white/95 backdrop-blur-sm hover:bg-amber-500 hover:text-white rounded-lg shadow-sm border border-amber-100 transition-all" title="Extender"><i class="fas fa-calendar-plus text-[7px]"></i></button>
                <button @click.stop="deleteActivity(activity._id!)" class="w-6 h-6 flex items-center justify-center text-red-600 bg-white/95 backdrop-blur-sm hover:bg-red-500 hover:text-white rounded-lg shadow-sm border border-red-100 transition-all" title="Eliminar"><i class="fas fa-trash-alt text-[7px]"></i></button>
              </div>
            </div>
          </div>

          <!-- View More Button -->
          <div v-if="hasMoreOverdue" class="mt-4 pb-2">
            <button 
              @click="increaseLimit('overdue')"
              class="w-full py-2.5 bg-white/50 hover:bg-white border border-slate-200 border-dashed rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest transition-all hover:border-red-400 hover:text-red-600 shadow-sm"
            >
              <i class="fas fa-plus-circle mr-1.5"></i>
              Ver más tareas vencidas
            </button>
          </div>

          <div v-if="overdueActivities.length === 0" class="text-center py-8">
            <i class="fas fa-exclamation-triangle text-3xl text-red-300/50 mb-2"></i>
            <p class="text-red-500/70 text-sm font-bold">No hay actividades vencidas</p>
            <p class="text-red-400/60 text-xs mt-1 font-medium">¡Excelente gestión del tiempo!</p>
          </div>
        </div>
      </div>
  </div>

    <!-- Modales -->
    <Teleport to="body">
    <!-- Modal de crear/editar actividad -->
    <ActivityFormModal
      v-if="showCreateModal || showEditModal"
      :activity="editingActivity"
      :clients="clients"
      :team-members="teamMembers"
      @close="closeModals"
      @saved="onActivitySaved"
    />

    <!-- Modal de asignación -->
    <AssignActivityModal
      v-if="showAssignModalState"
      :activity="assigningActivity"
      :team-members="teamMembers"
      @close="closeAssignModal"
      @assign="handleAssignActivity"
    />

    <!-- Modal de tarea rápida -->
    <QuickTaskModal
      v-if="showQuickTaskModal"
      :selected-date="selectedDateForQuickTask!"
      @close="showQuickTaskModal = false; selectedDateForQuickTask = null"
      @create="handleQuickTaskCreate"
    />
    </Teleport>

    <!-- Modal de Configuración de Tareas Rápidas -->
    <Teleport to="body">
      <div
        v-if="showQuickSettings"
        class="fixed inset-0 z-[99999] overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <!-- Overlay -->
        <div 
          class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          @click="showQuickSettings = false"
        ></div>
        
        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md transform transition-all animate-fade-in">
            <!-- Header del modal -->
            <div class="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center border border-amber-200 shadow-sm">
                  <i class="fas fa-cog text-amber-500 text-lg"></i>
                </div>
                <div>
                  <h3 class="text-xl font-black text-slate-800">Configuración</h3>
                  <p class="text-sm font-medium text-slate-500">Tareas rápidas por defecto</p>
                </div>
              </div>
              <button
                @click="showQuickSettings = false"
                class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all duration-200"
              >
                <i class="fas fa-times text-lg"></i>
              </button>
            </div>

            <!-- Contenido del modal -->
            <div class="p-6 space-y-6">
              <!-- Días de vencimiento -->
              <div>
                <label class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  <i class="fas fa-calendar-day text-amber-500"></i>
                  Días hasta vencimiento
                </label>
                <div class="grid grid-cols-4 gap-2">
                  <button
                    v-for="day in [1, 2, 3, 7]"
                    :key="day"
                    @click="quickTaskSettings.dueDays = day"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 relative',
                      quickTaskSettings.dueDays === day 
                        ? 'bg-amber-100 text-amber-700 border-2 border-amber-400 shadow-sm' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    ]"
                  >
                    {{ day === 7 ? '1 sem' : `${day} día${day > 1 ? 's' : ''}` }}
                  </button>
                </div>
              </div>

              <!-- Prioridad por defecto -->
              <div>
                <label class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  <i class="fas fa-flag text-amber-500"></i>
                  Prioridad por defecto
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="priority in [
                      { value: 'low', label: 'Baja', color: 'green' },
                      { value: 'medium', label: 'Media', color: 'amber' },
                      { value: 'high', label: 'Alta', color: 'orange' },
                      { value: 'urgent', label: 'Urgente', color: 'red' }
                    ]"
                    :key="priority.value"
                    @click="quickTaskSettings.priority = priority.value"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 relative',
                      quickTaskSettings.priority === priority.value 
                        ? `bg-${priority.color}-50 text-${priority.color}-700 border-2 border-${priority.color}-400 shadow-sm` 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    ]"
                  >
                    <i :class="`fas fa-circle text-${priority.color}-500 text-[10px]`"></i>
                    {{ priority.label }}
                  </button>
                </div>
              </div>

              <!-- Tiempo estimado -->
              <div>
                <label class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  <i class="fas fa-clock text-amber-500"></i>
                  Tiempo estimado
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="time in ['30 min', '1 hora', '2 horas', '4 horas', '1 día']"
                    :key="time"
                    @click="quickTaskSettings.estimatedTime = time"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 relative',
                      quickTaskSettings.estimatedTime === time 
                        ? 'bg-amber-100 text-amber-700 border-2 border-amber-400 shadow-sm' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    ]"
                  >
                    {{ time }}
                  </button>
                </div>
              </div>

              <!-- Auto-asignación -->
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                <label class="flex items-center gap-4 cursor-pointer">
                  <div class="relative">
                    <input
                      v-model="quickTaskSettings.autoAssign"
                      type="checkbox"
                      class="sr-only"
                    >
                    <div :class="[
                      'w-11 h-6 rounded-full transition-all duration-200 border border-transparent shadow-inner',
                      quickTaskSettings.autoAssign ? 'bg-amber-500' : 'bg-slate-300'
                    ]">
                      <div :class="[
                        'w-5 h-5 bg-white rounded-full transition-transform duration-200 mt-[1px] ml-[1px] shadow-sm',
                        quickTaskSettings.autoAssign ? 'translate-x-[20px]' : 'translate-x-0'
                      ]"></div>
                    </div>
                  </div>
                  <div>
                    <span class="text-slate-800 font-bold text-sm block">Auto-asignación</span>
                    <p class="text-xs text-slate-500 font-medium">Asignarme automáticamente las tareas rápidas</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Footer del modal -->
            <div class="flex items-center justify-between gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button
                @click="resetQuickSettings"
                class="px-4 py-2.5 text-slate-600 hover:text-slate-800 font-bold hover:bg-slate-200 rounded-lg transition-all duration-200 text-sm flex items-center"
              >
                <i class="fas fa-undo mr-2"></i>
                Restablecer
              </button>
              <div class="flex gap-3">
                <button
                  @click="showQuickSettings = false"
                  class="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-all duration-200 shadow-sm text-sm"
                >
                  Cancelar
                </button>
                <button
                  @click="showQuickSettings = false"
                  class="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-all duration-200 shadow-sm text-sm"
                >
                  <i class="fas fa-save mr-2"></i>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Crear/Editar Tarea -->
    <Teleport to="body">
      <div
        v-if="showCreateTaskModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        @click.self="closeTaskModal"
      >
        <div class="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-200 max-h-[90vh] overflow-hidden flex flex-col pt-0 animate-fade-in relative mt-4 sm:mt-0">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 relative z-10 shrink-0">
            <h2 class="text-xl font-black text-slate-800">
              <i class="fas fa-tasks mr-2 text-primary-500"></i>
              {{ isEditingTask ? 'Editar Tarea' : 'Nueva Tarea' }}
            </h2>
            <button @click="closeTaskModal" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors">
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-6 scroll-smooth">
          <form @submit.prevent="createTask">
            <div class="grid grid-cols-2 gap-5">
              <!-- Título -->
              <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Título *</label>
                <input
                  v-model="newTask.title"
                  type="text"
                  required
                  class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  placeholder="Título de la tarea"
                />
              </div>

              <!-- Descripción -->
              <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Descripción</label>
                <textarea
                  v-model="newTask.description"
                  rows="3"
                  class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  placeholder="Describe la tarea..."
                ></textarea>
              </div>

              <!-- Tipo -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tipo *</label>
                <select
                  v-model="newTask.type"
                  required
                  class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="epic">Épica</option>
                  <option value="feature">Feature</option>
                  <option value="user-story">User Story</option>
                  <option value="task">Task</option>
                  <option value="bug">Bug</option>
                </select>
              </div>

              <!-- Relación Jerárquica: Épica (solo para Features) -->
              <div v-if="newTask.type === 'feature'">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  <i class="fas fa-mountain text-primary-500 mr-1"></i>
                  Épica *
                </label>
                <select
                  v-model="newTask.epicId"
                  required
                  class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecciona una épica</option>
                  <option v-for="epic in getEpics()" :key="epic._id" :value="epic._id">
                    {{ epic.title }}
                  </option>
                </select>
              </div>

              <!-- Relación Jerárquica: Feature (solo para User Stories) -->
              <div v-if="newTask.type === 'user-story'">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  <i class="fas fa-layer-group text-blue-500 mr-1"></i>
                  Feature *
                </label>
                <select
                  v-model="newTask.featureId"
                  required
                  class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecciona una feature</option>
                  <option v-for="feature in tasksStore.tasks.filter(t => t.type === 'feature')" :key="feature._id" :value="feature._id">
                    {{ feature.title }}
                  </option>
                </select>
              </div>

              <!-- Relación Jerárquica: User Story (solo para Tasks) -->
              <div v-if="newTask.type === 'task'">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  <i class="fas fa-book-open text-emerald-500 mr-1"></i>
                  User Story (opcional)
                </label>
                <select
                  v-model="newTask.userStoryId"
                  class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Sin User Story (tarea independiente)</option>
                  <option v-for="story in tasksStore.tasks.filter(t => t.type === 'user-story')" :key="story._id" :value="story._id">
                    {{ story.title }}
                  </option>
                </select>
              </div>

              <!-- Prioridad -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Prioridad *</label>
                <select
                  v-model="newTask.priority"
                  required
                  class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>

              <!-- Estado del Board -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Estado *</label>
                <select
                  v-model="newTask.boardStatus"
                  required
                  class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option v-for="column in selectedBoard?.columns" :key="column.id" :value="column.mappedStatus">
                    {{ column.name }}
                  </option>
                </select>
              </div>

              <!-- Sprint -->
              <div v-if="selectedBoard?.type === 'scrum'">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Sprint</label>
                <select
                  v-model="newTask.sprint"
                  class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Backlog</option>
                  <option v-for="sprint in selectedBoard?.sprints" :key="sprint._id" :value="sprint._id">
                    {{ sprint.name }}
                  </option>
                </select>
              </div>

              <!-- Asignado a -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Asignar a</label>
                <select
                  v-model="newTask.assignedTo"
                  class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Sin asignar</option>
                  <option v-for="member in teamMembers" :key="member._id" :value="member._id">
                    {{ member.name }}
                  </option>
                </select>
              </div>

              <!-- Story Points -->
              <div v-if="selectedBoard?.type === 'scrum'">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Story Points</label>
                <input
                  v-model.number="newTask.storyPoints"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  placeholder="0"
                />
              </div>

              <!-- Estimación -->
              <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Estimación de tiempo</label>
                <select
                  v-model="newTask.estimatedTime"
                  class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Sin estimación</option>
                  <option value="15m">15 minutos</option>
                  <option value="30m">30 minutos</option>
                  <option value="1h">1 hora</option>
                  <option value="2h">2 horas</option>
                  <option value="3h">3 horas</option>
                  <option value="4h">4 horas</option>
                  <option value="1d">1 día</option>
                  <option value="2d">2 días</option>
                  <option value="3d">3 días</option>
                  <option value="1w">1 semana</option>
                  <option value="2w">2 semanas</option>
                </select>
              </div>

              <!-- Etiquetas -->
              <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Etiquetas</label>
                <input
                  v-model="newTask.tags"
                  type="text"
                  class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  placeholder="frontend, backend, api (separadas por comas)"
                />
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-100">
              <button
                type="button"
                @click="closeTaskModal"
                class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="!newTask.title || !newTask.type || !newTask.boardStatus"
                class="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i :class="isEditingTask ? 'fas fa-save' : 'fas fa-plus'" class="mr-2"></i>
                {{ isEditingTask ? 'Guardar Cambios' : 'Crear Tarea' }}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Crear Tablero -->
    <Teleport to="body">
      <div
        v-if="showCreateBoardModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        @click.self="showCreateBoardModal = false"
      >
        <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 animate-fade-in relative mt-4 sm:mt-0">
          <h2 class="text-xl font-black text-slate-800 mb-6">
            <i class="fas fa-layer-group mr-2 text-primary-500"></i>
            Crear Nuevo Tablero
          </h2>

          <!-- Debug Info (remover en producción) -->
          <div v-if="clients.length > 0" class="mb-4 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs font-bold text-emerald-700">
            <i class="fas fa-check-circle mr-1 text-emerald-500"></i>
            {{ clients.length }} cliente(s) disponible(s)
          </div>
          
          <form @submit.prevent="createBoard">
            <div class="mb-5">
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <i class="fas fa-tag text-slate-400 mr-1"></i>
                Nombre *
              </label>
              <input
                v-model="newBoard.name"
                type="text"
                required
                class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                placeholder="Ej: Desarrollo App Móvil"
              />
            </div>

            <div class="mb-5">
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <i class="fas fa-user-tie text-slate-400 mr-1"></i>
                Cliente / Proyecto *
              </label>
              
              <!-- Mensaje si no hay clientes -->
              <div v-if="clients.length === 0" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium">
                <i class="fas fa-exclamation-triangle mr-1"></i>
                No hay clientes disponibles. Debes crear un cliente primero.
              </div>
              
              <select
                v-model="newBoard.clientId"
                required
                :disabled="clients.length === 0"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <option value="">{{ clients.length === 0 ? 'No hay clientes disponibles' : 'Selecciona un cliente' }}</option>
                <option v-for="client in clients" :key="client._id" :value="client._id">
                  {{ client.name }}{{ client.company ? ` - ${client.company}` : '' }}
                </option>
              </select>
              <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1.5 flex items-center gap-1">
                <i class="fas fa-info-circle"></i>
                El tablero se asociará a este cliente/proyecto
              </p>
            </div>

            <div class="mb-5">
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <i class="fas fa-align-left text-slate-400 mr-1"></i>
                Descripción
              </label>
              <textarea
                v-model="newBoard.description"
                rows="3"
                class="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                placeholder="Descripción del proyecto..."
              ></textarea>
            </div>

            <div class="mb-8">
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <i class="fas fa-layer-group text-slate-400 mr-1"></i>
                Tipo de Tablero
              </label>
              <div class="flex items-center p-4 border-2 border-primary-500 bg-primary-50 rounded-xl">
                <div class="flex-1">
                  <div class="font-bold text-primary-900">Scrum</div>
                  <div class="text-xs text-primary-600 font-medium">Tablero con sprints para gestión ágil</div>
                </div>
                <i class="fas fa-check-circle text-primary-500 text-xl"></i>
              </div>
            </div>

            <div class="flex justify-end space-x-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                @click="showCreateBoardModal = false"
                class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="!newBoard.name || !newBoard.clientId"
                class="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fas fa-plus mr-2"></i>
                Crear Tablero
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Gestionar Sprints -->
    <Teleport to="body">
      <div
        v-if="showSprintsModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        @click.self="showSprintsModal = false"
      >
        <div class="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-200 max-h-[90vh] overflow-hidden flex flex-col pt-0 animate-fade-in relative mt-4 sm:mt-0">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 relative z-10 shrink-0">
            <h2 class="text-xl font-black text-slate-800">
              <i class="fas fa-running mr-2 text-primary-500"></i>
              Gestionar Sprints
            </h2>
            <button @click="showSprintsModal = false" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors">
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 scroll-smooth">
          <!-- Información del Tablero y Cliente -->
          <div v-if="selectedBoard" class="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <i class="fas fa-layer-group text-primary-500"></i>
                  <span class="font-bold text-slate-800">{{ selectedBoard.name }}</span>
                </div>
                <div v-if="selectedBoard.client" class="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <i class="fas fa-user-tie text-blue-500 text-xs"></i>
                  <span>{{ selectedBoard.client.name }}</span>
                  <span v-if="selectedBoard.client.company" class="text-slate-400">
                    - {{ selectedBoard.client.company }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Sprints</div>
                <div class="text-2xl font-black text-primary-600 leading-none mt-1">{{ selectedBoard.sprints?.length || 0 }}</div>
              </div>
            </div>
          </div>

          <!-- Formulario Crear Nuevo Sprint -->
          <div class="mb-6 p-5 bg-primary-50/50 border border-primary-100 rounded-xl">
            <h3 class="text-sm font-bold text-primary-700 uppercase tracking-wider mb-4 flex items-center">
              <i class="fas fa-plus-circle mr-2 text-primary-500"></i>
              Crear Nuevo Sprint
            </h3>
            <form @submit.prevent="createSprint" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre del Sprint *</label>
                  <input
                    v-model="newSprint.name"
                    type="text"
                    required
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm font-medium placeholder-slate-400 focus:ring-2 focus:ring-primary-500 shadow-sm"
                    placeholder="Sprint 1"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Objetivo</label>
                  <input
                    v-model="newSprint.goal"
                    type="text"
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm font-medium placeholder-slate-400 focus:ring-2 focus:ring-primary-500 shadow-sm"
                    placeholder="Implementar autenticación"
                  />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fecha Inicio *</label>
                  <input
                    v-model="newSprint.startDate"
                    type="date"
                    required
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:ring-2 focus:ring-primary-500 shadow-sm"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fecha Fin *</label>
                  <input
                    v-model="newSprint.endDate"
                    type="date"
                    required
                    class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:ring-2 focus:ring-primary-500 shadow-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                :disabled="!newSprint.name || !newSprint.startDate || !newSprint.endDate"
                class="w-full px-4 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i class="fas fa-plus mr-2"></i>
                Crear Sprint
              </button>
            </form>
          </div>

          <!-- Lista de Sprints -->
          <div class="space-y-4 pt-2">
            <h3 class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              <i class="fas fa-list mr-1"></i>
              Sprints Existentes
            </h3>
            
            <div v-if="!selectedBoard?.sprints || selectedBoard.sprints.length === 0" class="text-center py-10 bg-slate-50 border border-slate-200 border-dashed rounded-xl">
              <i class="fas fa-inbox text-3xl mb-3 text-slate-300"></i>
              <p class="text-slate-500 font-medium text-sm">No hay sprints creados</p>
              <p class="text-xs text-slate-400 mt-1">Crea tu primer sprint usando el formulario arriba</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="sprint in selectedBoard.sprints"
                :key="sprint._id"
                class="p-4 bg-white border border-slate-200 rounded-xl hover:border-primary-400 hover:shadow-md transition-all shadow-sm"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-1.5">
                      <h4 class="font-bold text-slate-800 text-sm">{{ sprint.name }}</h4>
                      <span
                        :class="{
                          'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm': sprint.status === 'active',
                          'bg-slate-100 text-slate-600 border-slate-200 shadow-sm': sprint.status === 'planned',
                          'bg-blue-100 text-blue-700 border-blue-200 shadow-sm': sprint.status === 'completed'
                        }"
                        class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border"
                      >
                        {{ sprint.status === 'active' ? 'Activo' : sprint.status === 'planned' ? 'Planeado' : 'Completado' }}
                      </span>
                    </div>
                    <p v-if="sprint.goal" class="text-sm font-medium text-slate-600 mb-2.5">{{ sprint.goal }}</p>
                    <div class="flex items-center gap-4 text-xs font-medium text-slate-500">
                      <span class="flex items-center">
                        <i class="fas fa-calendar-alt mr-1.5 text-slate-400"></i>
                        {{ formatDate(sprint.startDate) }} - {{ formatDate(sprint.endDate) }}
                      </span>
                      <span v-if="sprint.velocity" class="flex items-center bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 border border-slate-200">
                        <i class="fas fa-tachometer-alt mr-1.5 text-slate-400"></i>
                        Velocity: <strong>{{ sprint.velocity }}</strong>
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click="deleteSprint(sprint._id)"
                      class="p-2 w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-200"
                      title="Eliminar sprint"
                    >
                      <i class="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          <div class="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              @click="showSprintsModal = false"
              class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 shadow-sm transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Panel de Filtros de Tareas (Teleport) -->
    <Teleport to="body">
      <div
        v-if="showTaskFilters"
        class="fixed inset-0 z-[9998]"
        @click="showTaskFilters = false"
      >
        <div
          :style="filterPanelStyle"
          @click.stop
          class="fixed w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-5 space-y-4 animate-fade-in"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider">Filtros de Tareas</h3>
            <button 
              @click="clearTaskFilters"
              class="text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors"
            >
              Limpiar todo
            </button>
          </div>

          <!-- Filtro por Estado del Board -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Estado en Tablero
            </label>
            <select
              v-model="taskFilters.boardStatus"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            >
              <option value="">Todos los estados</option>
              <option value="backlog">📋 Backlog</option>
              <option value="todo">📝 Por Hacer</option>
              <option value="in-progress">🔄 En Progreso</option>
              <option value="review">👀 En Revisión</option>
              <option value="done">✅ Completado</option>
            </select>
          </div>

          <!-- Filtro por Prioridad -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Prioridad
            </label>
            <select
              v-model="taskFilters.priority"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            >
              <option value="">Todas las prioridades</option>
              <option value="critical">🔴 Crítica</option>
              <option value="high">🟠 Alta</option>
              <option value="medium">🟡 Media</option>
              <option value="low">🟢 Baja</option>
            </select>
          </div>

          <!-- Filtro por Tipo -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Tipo de Tarea
            </label>
            <select
              v-model="taskFilters.type"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            >
              <option value="">Todos los tipos</option>
              <option value="epic">🎯 Epic</option>
              <option value="feature">⭐ Feature</option>
              <option value="user-story">📖 User Story</option>
              <option value="task">✅ Task</option>
              <option value="bug">🐛 Bug</option>
            </select>
          </div>

          <!-- Filtro por Asignado -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Asignado a
            </label>
            <select
              v-model="taskFilters.assignedTo"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            >
              <option value="">Todos los miembros</option>
              <option value="unassigned">Sin asignar</option>
              <option v-for="member in teamMembers" :key="member._id" :value="member._id">
                {{ member.name }}
              </option>
            </select>
          </div>

          <!-- Filtro por Tags -->
          <div v-if="availableTags.length > 0">
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Etiquetas
            </label>
            <div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              <button
                v-for="tag in availableTags"
                :key="tag"
                @click="toggleTagFilter(tag)"
                class="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-colors border shadow-sm"
                :class="taskFilters.tags.includes(tag) 
                  ? 'bg-primary-500 text-white border-primary-500' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'"
              >
                #{{ tag }}
              </button>
            </div>
          </div>

          <!-- Botón Aplicar -->
          <div class="pt-2">
            <button
              @click="applyTaskFilters"
              class="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-bold shadow-sm transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Confirmación de Borrado en Cascada -->
    <Teleport to="body">
      <div
        v-if="showCascadeDeleteModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        @click.self="cancelCascadeDelete"
      >
        <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 animate-fade-in relative mt-4 sm:mt-0">
          <!-- Header con icono -->
          <div class="flex flex-col items-center text-center mb-6">
            <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100 shadow-sm">
              <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
            </div>
            <h2 class="text-xl font-black text-slate-800 mb-2">¿Estás seguro?</h2>
            <p class="text-slate-500 font-medium text-sm">
              Esta acción eliminará permanentemente
            </p>
            <p class="text-red-600 font-bold text-base mt-2 break-words max-w-full bg-red-50 px-3 py-1 rounded-lg border border-red-100">
              "{{ cascadeDeleteInfo.taskTitle }}"
            </p>
          </div>

          <!-- Detalles de elementos a borrar (solo si hay cascada) -->
          <div v-if="cascadeDeleteInfo.total > 0" class="bg-slate-50 border border-slate-200 shadow-sm rounded-xl p-4 mb-5">
            <p class="text-slate-700 font-bold text-sm mb-3 text-center uppercase tracking-wider">Esta acción eliminará en cascada:</p>
            <div class="space-y-2">
              <div v-if="cascadeDeleteInfo.features > 0" class="flex items-center justify-between bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2">
                <div class="flex items-center gap-2">
                  <i class="fas fa-layer-group text-blue-500"></i>
                  <span class="text-slate-600 text-sm font-bold">Features</span>
                </div>
                <span class="text-slate-800 font-black">{{ cascadeDeleteInfo.features }}</span>
              </div>
              <div v-if="cascadeDeleteInfo.stories > 0" class="flex items-center justify-between bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2">
                <div class="flex items-center gap-2">
                  <i class="fas fa-book-open text-emerald-500"></i>
                  <span class="text-slate-600 text-sm font-bold">User Stories</span>
                </div>
                <span class="text-slate-800 font-black">{{ cascadeDeleteInfo.stories }}</span>
              </div>
              <div v-if="cascadeDeleteInfo.tasks > 0" class="flex items-center justify-between bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2">
                <div class="flex items-center gap-2">
                  <i class="fas fa-tasks text-slate-400"></i>
                  <span class="text-slate-600 text-sm font-bold">Tasks</span>
                </div>
                <span class="text-slate-800 font-black">{{ cascadeDeleteInfo.tasks }}</span>
              </div>
              <div class="pt-2 mt-2 border-t border-slate-200">
                <div class="flex items-center justify-between font-bold bg-red-50 border border-red-200 shadow-sm rounded-lg px-3 py-2">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-trash text-red-500"></i>
                    <span class="text-red-700 uppercase tracking-wider text-[11px]">Total</span>
                  </div>
                  <span class="text-red-600 font-black text-lg">{{ cascadeDeleteInfo.total + 1 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Advertencia -->
          <div class="bg-amber-50 border border-amber-200 shadow-sm rounded-xl p-3 mb-4">
            <div class="flex items-start gap-2">
              <i class="fas fa-info-circle text-amber-500 mt-0.5 flex-shrink-0"></i>
              <p class="text-amber-800 font-medium text-xs leading-relaxed">
                Esta acción no se puede deshacer. {{ cascadeDeleteInfo.total > 0 ? 'Todos los elementos hijos se eliminarán junto con el elemento principal.' : 'La tarea se eliminará permanentemente.' }}
              </p>
            </div>
          </div>

          <!-- 🌿 Advertencia de ramas de GitHub -->
          <div class="bg-emerald-50 border border-emerald-200 shadow-sm rounded-xl p-3 mb-6">
            <div class="flex items-start gap-2">
              <i class="fab fa-github text-emerald-500 mt-0.5 flex-shrink-0 text-sm"></i>
              <div class="flex-1">
                <p class="text-emerald-800 text-[11px] uppercase tracking-wider font-bold mb-1">
                  Ramas de GitHub
                </p>
                <p class="text-emerald-700 font-medium text-[11px] leading-relaxed">
                  Las ramas asociadas a estas tareas (sin PR abierto) también se eliminarán automáticamente de GitHub.
                </p>
              </div>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              @click="cancelCascadeDelete"
              class="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="confirmCascadeDelete"
              class="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm transition-colors flex items-center justify-center gap-1"
            >
              Sí, eliminar<span v-if="cascadeDeleteInfo.total > 0" class="font-bold text-[11px] bg-red-700 px-1.5 py-0.5 rounded-md ml-1">{{ cascadeDeleteInfo.total + 1 }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modales de Vinculación -->
    <Teleport to="body">
      <!-- Vincular Caso -->
      <div v-if="showCaseLinkingModal" class="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-scale-up">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
            <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider">Vincular Caso Técnico</h3>
            <button @click="showCaseLinkingModal = false" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
          </div>
          <div class="p-4">
            <div class="relative mb-4">
              <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input 
                v-model="caseSearchQuery" 
                type="text" 
                placeholder="Buscar por número o título..." 
                class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div class="max-h-60 overflow-y-auto space-y-2 custom-scrollbar-slim">
              <div v-if="linkingLoading" class="text-center py-4"><i class="fas fa-spinner fa-spin text-indigo-500"></i></div>
              <div 
                v-for="c in filteredCasesForLinking" 
                :key="c._id"
                @click="linkCase(c)"
                class="p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/30 cursor-pointer transition-all flex items-center gap-3"
              >
                <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                  {{ c.caseNumber?.slice(-3) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold text-slate-800 truncate">{{ c.title }}</div>
                  <div class="text-[10px] text-slate-500">{{ c.status }} • {{ c.priority }}</div>
                </div>
                <i class="fas fa-plus text-indigo-400 text-xs"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vincular Wiki -->
      <div v-if="showWikiLinkingModal" class="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-scale-up">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
            <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider">Vincular Documentación</h3>
            <button @click="showWikiLinkingModal = false" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
          </div>
          <div class="p-4">
            <div class="relative mb-4">
              <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input 
                v-model="wikiSearchQuery" 
                type="text" 
                placeholder="Buscar por título o categoría..." 
                class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div class="max-h-60 overflow-y-auto space-y-2 custom-scrollbar-slim">
              <div v-if="linkingLoading" class="text-center py-4"><i class="fas fa-spinner fa-spin text-emerald-500"></i></div>
              <div 
                v-for="a in filteredWikiForLinking" 
                :key="a._id"
                @click="linkWiki(a)"
                class="p-3 bg-white border border-slate-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/30 cursor-pointer transition-all flex items-center gap-3"
              >
                <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                  <i class="fas fa-book text-xs"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold text-slate-800 truncate">{{ a.title }}</div>
                  <div class="text-[10px] text-slate-500">{{ a.category }}</div>
                </div>
                <i class="fas fa-plus text-emerald-400 text-xs"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'
import { activityService, type ActivityData } from '../../services/activityService'
import { clientService, type ClientData } from '../../services/clientService'
import { teamService } from '../../services/teamService'
import { useNotifications } from '../../composables/useNotifications'
import { useAuthStore } from '../../stores/auth'
import { useBoardsStore } from '../../stores/boards'
import { useTasksStore } from '../../stores/tasks'
import { useGitHubStore } from '../../stores/github'
import { API_CONFIG } from '../../config/api'
import type { Client, TeamMember } from '../../types'
import { casesService } from '../../services/casesService'
import { wikiService } from '../../services/wikiService'
import ActivityFormModal from '../forms/ActivityFormModal.vue'
import AssignActivityModal from '../modals/AssignActivityModal.vue'
import CustomSelect from '../ui/CustomSelect.vue'
import MonthlyCalendar from '../calendar/MonthlyCalendar.vue'
import QuickTaskModal from '../modals/QuickTaskModal.vue'
import AvatarInline from '../AvatarInline.vue'
// import TaskNotifier from '../notifications/TaskNotifier.vue' // REMOVED

// Props
interface Props {
  searchTerm?: string
}
const props = withDefaults(defineProps<Props>(), {
  searchTerm: ''
})

// Emits
const emit = defineEmits<{
  create: []
  edit: [activity: ActivityData]
}>()

// Composables
const { showSuccess, showError, confirmDelete, toast, showLoading, closeLoading } = useNotifications()
const authStore = useAuthStore()
const boardsStore = useBoardsStore()
const tasksStore = useTasksStore()
const githubStore = useGitHubStore()

// Constants
const API_URL = API_CONFIG.BASE_URL.replace('/api', '')

// Reactive data
const activities = ref<ActivityData[]>([])
const clients = ref<ClientData[]>([])
const teamMembers = ref<TeamMember[]>([])
const loading = ref(true)
const loadingClients = ref(true)
const error = ref<string | null>(null)
const draggedActivity = ref<ActivityData | null>(null)
const isDragging = ref(false)

// Vista y UI
import DailyScrum from '../../pages/DailyScrum.vue'
import TeamActivities from '../../pages/TeamActivities.vue'

const currentView = ref<'kanban' | 'tasks' | 'calendar' | 'daily' | 'team'>('kanban')

// Gestión de expansión de tarjetas Kanban
const expandedCards = ref<Set<string>>(new Set())
const editingPercentageId = ref<string | null>(null)

// Control de límites de visualización por columna
const columnLimits = ref({
  pending: 8,
  inProgress: 8,
  completed: 8,
  overdue: 8
})

const increaseLimit = (column: 'pending' | 'inProgress' | 'completed' | 'overdue') => {
  columnLimits.value[column] += 12
}

const toggleCardExpansion = (id: string) => {
  if (expandedCards.value.has(id)) {
    expandedCards.value.delete(id)
  } else {
    expandedCards.value.add(id)
  }
}
const vFocus = {
  mounted: (el: HTMLElement) => el.focus()
}

const quickTaskTitle = ref('')
const showQuickSettings = ref(false)
const showQuickTaskHints = ref(false)

// Estados de collapse para vista jerárquica
const collapsedEpics = ref<Set<string>>(new Set())
const collapsedFeatures = ref<Set<string>>(new Set())
const collapsedStories = ref<Set<string>>(new Set())

// Configuración de tareas rápidas
const quickTaskSettings = ref({
  dueDays: 2,
  priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  estimatedTime: '2 horas',
  autoAssign: true
})


// Filtros de Tareas (Boards)
const showTaskFilters = ref(false)
const filterButton = ref<HTMLElement | null>(null)
const filterPanelStyle = ref({})
const taskFilters = ref({
  boardStatus: '',
  priority: '',
  type: '',
  assignedTo: '',
  tags: [] as string[]
})

// Modales
const sendingComment = ref(false)
const showAgentSelector = ref(false)

// Manual Time Edit State
const editingTimeId = ref<string | null>(null)
const manualHours = ref(0)
const manualMinutes = ref(0)
const editingActivity = ref<ActivityData | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showAssignModalState = ref(false)
const assigningActivity = ref<ActivityData | null>(null)
const assignLoading = ref(false)

// Filtros
const selectedDepartment = ref('')
const selectedTeamMember = ref('')
const selectedStatus = ref('')
const selectedClient = ref('')
const startDate = ref('')
const endDate = ref('')

// Modales para tableros
const showCreateBoardModal = ref(false)
const newBoard = ref({
  name: '',
  description: '',
  type: 'scrum' as 'kanban' | 'scrum',
  clientId: ''
})

// Modal de gestión de sprints
const showSprintsModal = ref(false)
const newSprint = ref({
  name: '',
  goal: '',
  startDate: '',
  endDate: ''
})

// Modal de confirmación de borrado en cascada
const showCascadeDeleteModal = ref(false)
const cascadeDeleteInfo = ref({
  taskId: '',
  taskTitle: '',
  taskType: '',
  features: 0,
  stories: 0,
  tasks: 0,
  total: 0
})

// Modales para funcionalidad del calendario
const showQuickTaskModal = ref(false)
const selectedDateForQuickTask = ref<Date | null>(null)
const showActivityDetailModal = ref(false)
const selectedActivity = ref<ActivityData | null>(null)

// Trazabilidad (Vinculación de Casos y Wiki)
const showCaseLinkingModal = ref(false)
const showWikiLinkingModal = ref(false)
const casesList = ref<any[]>([])
const wikiList = ref<any[]>([])
const caseSearchQuery = ref('')
const wikiSearchQuery = ref('')
const linkingLoading = ref(false)

const filteredCasesForLinking = computed(() => {
  if (!caseSearchQuery.value) return casesList.value
  const q = caseSearchQuery.value.toLowerCase()
  return casesList.value.filter(c => 
    c.caseNumber?.toLowerCase().includes(q) || 
    c.title?.toLowerCase().includes(q) ||
    c.subject?.toLowerCase().includes(q)
  )
})

const filteredWikiForLinking = computed(() => {
  if (!wikiSearchQuery.value) return wikiList.value
  const q = wikiSearchQuery.value.toLowerCase()
  return wikiList.value.filter(a => 
    a.title?.toLowerCase().includes(q) || 
    a.category?.toLowerCase().includes(q)
  )
})

// Computed
const filteredMembersByDept = computed(() => {
  if (!selectedDepartment.value) return teamMembers.value
  return teamMembers.value.filter((m: any) => m.department === selectedDepartment.value)
})

const filteredActivities = computed(() => {
  let filtered = activities.value

  // Filtrar por término de búsqueda
  if (props.searchTerm) {
    const search = props.searchTerm.toLowerCase()
    filtered = filtered.filter(activity =>
      activity.title.toLowerCase().includes(search) ||
      activity.description?.toLowerCase().includes(search) ||
      getClientName(activity.clientId).toLowerCase().includes(search)
    )
  }

  // Filtrar por departamento (basado en el dpto del miembro asignado)
  if (selectedDepartment.value) {
    const memberIdsInDept = filteredMembersByDept.value.map((m: any) => m._id)
    filtered = filtered.filter(activity => {
      if (!activity.assignedTo || activity.assignedTo.length === 0) return false
      if (Array.isArray(activity.assignedTo) && typeof activity.assignedTo[0] === 'object') {
        return activity.assignedTo.some((user: any) => memberIdsInDept.includes(user._id))
      }
      if (Array.isArray(activity.assignedTo)) {
        return activity.assignedTo.some((id: any) => memberIdsInDept.includes(String(id)))
      }
      return false
    })
  }

  // Filtrar por miembro del equipo asignado
  if (selectedTeamMember.value && selectedTeamMember.value !== 'all') {
    filtered = filtered.filter(activity => {
      if (selectedTeamMember.value === 'unassigned') {
        // Mostrar actividades sin asignar
        return !activity.assignedTo || activity.assignedTo.length === 0
      }

      // Mostrar actividades asignadas al miembro seleccionado
      if (!activity.assignedTo || activity.assignedTo.length === 0) return false

      // Si assignedTo es un array de objetos (populated)
      if (Array.isArray(activity.assignedTo) && typeof activity.assignedTo[0] === 'object') {
        return activity.assignedTo.some((user: any) => user._id === selectedTeamMember.value)
      }

      // Si assignedTo es un array de strings (IDs)
      if (Array.isArray(activity.assignedTo) && typeof activity.assignedTo[0] === 'string') {
        return activity.assignedTo.includes(selectedTeamMember.value)
      }

      return false
    })
  }

  // Filtrar por estado
  if (selectedStatus.value && selectedStatus.value !== 'all') {
    filtered = filtered.filter(activity => activity.status === selectedStatus.value)
  }

  // Filtro por rango de fechas (Mejorado: detecta solapamiento)
  if (startDate.value || endDate.value) {
    const filterStart = startDate.value ? new Date(startDate.value) : new Date(0);
    if (startDate.value) filterStart.setHours(0, 0, 0, 0);
    
    const filterEnd = endDate.value ? new Date(endDate.value) : new Date(8640000000000000);
    if (endDate.value) filterEnd.setHours(23, 59, 59, 999);

    const today = new Date();

    filtered = filtered.filter(a => {
      const taskStart = new Date(a.date);
      // Si no hay dueDate, asumimos que dura el mismo día que empezó
      const taskEnd = a.dueDate ? new Date(a.dueDate) : new Date(a.date);
      
      // Ajustar horas para comparación de días completos
      taskStart.setHours(0,0,0,0);
      taskEnd.setHours(23,59,59,999);

      // Una tarea es relevante si hay intersección entre [taskStart, taskEnd] y [filterStart, filterEnd]
      const overlaps = taskStart <= filterEnd && taskEnd >= filterStart;
      
      // O si está en progreso actualmente y el rango incluye hoy
      const isTodayInRange = today >= filterStart && today <= filterEnd;
      const isActiveNow = a.status === 'in-progress' && isTodayInRange;

      return overlaps || isActiveNow;
    });
  }

  // Filtrar por cliente
  if (selectedClient.value) {
    filtered = filtered.filter(a => {
      const id = (typeof a.clientId === 'object' && a.clientId !== null) ? (a.clientId as any)._id : a.clientId
      return id === selectedClient.value
    })
  }

  return filtered
})

// Helper para priorización
const getPriorityScore = (priority?: string) => {
  const scores = { urgent: 4, high: 3, medium: 2, low: 1 }
  return scores[priority as keyof typeof scores] || 0
}

const sortActivities = (list: ActivityData[]) => {
  return [...list].sort((a, b) => {
    // 1. Prioridad (Más alto primero: Urgente > Alta > Media > Baja)
    const pA = getPriorityScore(a.priority)
    const pB = getPriorityScore(b.priority)
    if (pB !== pA) return pB - pA
    
    // 2. Gestión de fechas dentro de la misma prioridad
    // Las tareas con fecha de fin definida tienen precedencia sobre las que no tienen
    const hasDateA = !!a.dueDate
    const hasDateB = !!b.dueDate
    
    if (hasDateA && !hasDateB) return -1
    if (!hasDateA && hasDateB) return 1
    
    // Si ambas tienen fecha o ambas carecen de ella, ordenamos por fecha ascendente
    // (Lo más próximo o antiguo primero para dar salida a lo pendiente)
    const dA = a.dueDate ? new Date(a.dueDate).getTime() : new Date(a.date).getTime()
    const dB = b.dueDate ? new Date(b.dueDate).getTime() : new Date(b.date).getTime()
    return dA - dB
  })
}

const pendingActivities = computed(() => {
  const sorted = sortActivities(filteredActivities.value.filter(a => a.status === 'pending'))
  return sorted.slice(0, columnLimits.value.pending)
})

const hasMorePending = computed(() => 
  filteredActivities.value.filter(a => a.status === 'pending').length > columnLimits.value.pending
)

const inProgressActivities = computed(() => {
  const sorted = sortActivities(filteredActivities.value.filter(a => a.status === 'in-progress'))
  return sorted.slice(0, columnLimits.value.inProgress)
})

const hasMoreInProgress = computed(() => 
  filteredActivities.value.filter(a => a.status === 'in-progress').length > columnLimits.value.inProgress
)

const completedActivities = computed(() => {
  const sorted = sortActivities(filteredActivities.value.filter(a => a.status === 'completed'))
  return sorted.slice(0, columnLimits.value.completed)
})

const hasMoreCompleted = computed(() => 
  filteredActivities.value.filter(a => a.status === 'completed').length > columnLimits.value.completed
)

// Filtro defensivo: ocultamos del Kanban cualquier actividad marcada como overdue
// que en realidad ya esté terminada (100% o status final), evitando el bug visual
// donde tareas completadas aparecen en la columna de vencidas.
const trulyOverdueActivities = computed(() =>
  filteredActivities.value.filter((a) => a.status === 'overdue' && !isActivityDone(a))
)

const overdueActivities = computed(() => {
  const sorted = sortActivities(trulyOverdueActivities.value)
  return sorted.slice(0, columnLimits.value.overdue)
})

const hasMoreOverdue = computed(() =>
  trulyOverdueActivities.value.length > columnLimits.value.overdue
)

const formatTime = (seconds: number | undefined) => {
  if (!seconds || seconds === 0) return '0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

const isTimerActive = (activity: any) => {
  return activity.activeSessions?.some((s: any) => s.userId === authStore.user?._id)
}

const toggleTimer = async (activity: any) => {
  const action = isTimerActive(activity) ? 'stop' : 'start'
  try {
    const updated = await activityService.toggleTimer(activity._id, action, authStore.user!._id)
    const index = activities.value.findIndex(a => a._id === updated._id)
    if (index !== -1) {
      activities.value[index] = updated
    }
  } catch (error) {
    showError('Error al actualizar el temporizador')
  }
}

const updatePercentage = async (activity: any, value: number) => {
  try {
    const updated = await activityService.update(activity._id, {
      ...activity,
      completionPercentage: value
    })
    const index = activities.value.findIndex(a => a._id === updated._id)
    if (index !== -1) {
      activities.value[index] = updated
    }
    toast(`Progreso actualizado al ${value}%`, 'success')
  } catch (error) {
    showError('Error al actualizar el progreso')
  }
}

const activeTimePopover = ref<string | null>(null)

const addManualTime = async (activity: any, mins: number) => {
  try {
    const updated = await activityService.toggleTimer(activity._id, 'add_manual', authStore.user!._id, mins)
    const index = activities.value.findIndex(a => a._id === updated._id)
    if (index !== -1) {
      activities.value[index] = updated
    }
    showSuccess(`${mins}m añadidos`)
    activeTimePopover.value = null
  } catch (error) {
    showError('Error al añadir tiempo')
  }
}

const startEditingTime = (activity: any) => {
  editingTimeId.value = activity._id
  const seconds = activity.timeSpent || 0
  manualHours.value = Math.floor(seconds / 3600)
  manualMinutes.value = Math.floor((seconds % 3600) / 60)
}

const saveManualTime = async (activity: any) => {
  try {
    const totalSeconds = (manualHours.value * 3600) + (manualMinutes.value * 60)
    const updated = await activityService.update(activity._id, {
      ...activity,
      timeSpent: totalSeconds
    })
    
    const index = activities.value.findIndex(a => a._id === updated._id)
    if (index !== -1) {
      activities.value[index] = updated
    }
    
    showSuccess('Tiempo actualizado manualmente')
    editingTimeId.value = null
  } catch (error) {
    showError('Error al actualizar el tiempo')
  }
}

// Función helper para obtener información completa del usuario
const getUserInfo = (user: any) => {
  if (!user) return { name: 'Sin asignar', photo: '', avatar: '' }
  
  // Si es un objeto usuario completo
  if (typeof user === 'object' && user.name) {
    return {
      name: user.name,
      photo: user.photo || '',
      avatar: user.avatar || ''
    }
  }
  
  // Si es un string ID, buscar en teamMembers
  if (typeof user === 'string') {
    const member = teamMembers.value.find(m => m._id === user)
    return {
      name: member?.name || 'Sin asignar',
      photo: member?.photo || '',
      avatar: member?.avatar || ''
    }
  }
  
  return { name: 'Sin asignar', photo: '', avatar: '' }
}

const copyActivitiesSummary = () => {
  if (filteredActivities.value.length === 0) {
    toast('No hay actividades para exportar', 'info')
    return
  }

  let text = `📋 *RESUMEN DE ACTIVIDADES*\n`
  if (startDate.value || endDate.value) {
    text += `📅 Período: ${startDate.value || '...'} a ${endDate.value || '...'}\n`
  }
  if (selectedClient.value) {
    const client = clients.value.find(c => c._id === selectedClient.value)
    if (client) text += `🏢 Cliente: ${client.name}\n`
  }
  text += `----------------------------------\n\n`

  filteredActivities.value.forEach(activity => {
    const statusIcon = activity.status === 'completed' ? '✅' : activity.status === 'in-progress' ? '🔄' : '⏳'
    const assigned = getSmartAssignedName(activity)
    const clientName = getClientName(activity.clientId)
    const percentage = activity.completionPercentage || 0
    const dateStr = formatDate(activity.date)
    const dueDateStr = activity.dueDate ? formatDate(activity.dueDate) : 'Sin fecha'
    
    text += `${statusIcon} *${activity.title}*\n`
    text += `👤 Asignado: ${assigned}\n`
    text += `🏢 Cliente: ${clientName}\n`
    text += `📈 Progreso: ${percentage}%\n`
    text += `🗓️ Fecha: ${dateStr} - ${dueDateStr}\n`
    text += `\n`
  })

  // Copiar al portapapeles
  const textArea = document.createElement("textarea")
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()
  try {
    document.execCommand('copy')
    toast('Resumen copiado al portapapeles', 'success')
  } catch (err) {
    toast('Error al copiar', 'error')
  }
  document.body.removeChild(textArea)
}

// Methods
const loadActivities = async () => {
  loading.value = true
  try {
    // Cargar actividades tradicionales
    activities.value = await activityService.getAll()
    console.log('✅ Activities loaded:', activities.value.length)
    
    // Cargar boards y tasks del nuevo sistema
    await boardsStore.fetchBoards()
    console.log('✅ Boards loaded:', boardsStore.myBoards.length)
    
    // Si hay boards, cargar las tareas del primer board por defecto
    if (boardsStore.myBoards.length > 0) {
      const firstBoard = boardsStore.myBoards[0]
      await tasksStore.fetchTasks(firstBoard._id)
      console.log('✅ Tasks loaded:', tasksStore.tasks.length)
    }
  } catch (err) {
    console.error('❌ Error loading activities:', err)
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    loading.value = false
  }
}

/**
 * Considera una actividad "terminada" (no debe volverse overdue) si:
 * - Su status es 'completed' o 'cancelled', o
 * - Su completionPercentage es 100 (puede haber bug donde el status no se actualizó)
 */
const isActivityDone = (activity: any): boolean => {
  if (!activity) return false
  if (activity.status === 'completed' || activity.status === 'cancelled') return true
  if (typeof activity.completionPercentage === 'number' && activity.completionPercentage >= 100) return true
  return false
}

/**
 * Una actividad está vencida solo cuando ya pasó el FIN DEL DÍA local del dueDate.
 *
 * Por qué: el backend guarda dueDate en UTC ("2026-05-12T00:00:00Z"). Si el usuario
 * está en UTC-5 (Colombia), eso se interpreta como "11 may 7 PM" en su zona, lo que
 * provocaba que tareas con vencimiento "mañana" aparecieran vencidas hoy.
 *
 * Solución: tomamos solo año/mes/día del dueDate y lo comparamos contra el final
 * del día local (23:59:59) en la zona del usuario. Margen extra de 1 hora para
 * cubrir desfases de relojes entre cliente y servidor.
 */
const SAFETY_MARGIN_MS = 60 * 60 * 1000 // 1 hora

const isPastDueDate = (dueDateIso: string): boolean => {
  if (!dueDateIso) return false
  const due = new Date(dueDateIso)
  if (isNaN(due.getTime())) return false

  // Fin del día local del dueDate (23:59:59.999 en la zona del usuario)
  const endOfDueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate(), 23, 59, 59, 999)

  return Date.now() > endOfDueDay.getTime() + SAFETY_MARGIN_MS
}

/**
 * Auto-corrige inconsistencias: si una actividad está marcada como 'overdue' pero
 * tiene 100% de progreso, la regresamos a 'completed'. Evita el bug visual donde
 * una tarea terminada aparece en la columna de vencidas.
 */
const reconcileCompletedActivities = async () => {
  const inconsistent = activities.value.filter(
    (a) => a.status === 'overdue' && typeof a.completionPercentage === 'number' && a.completionPercentage >= 100
  )
  if (!inconsistent.length) return

  console.warn(`🔧 Reconciliando ${inconsistent.length} actividades mal marcadas como vencidas (100% completadas)`)
  for (const activity of inconsistent) {
    if (!activity._id) continue
    try {
      await activityService.updateStatus(activity._id, 'completed')
      const idx = activities.value.findIndex((a) => a._id === activity._id)
      if (idx !== -1) activities.value[idx].status = 'completed'
    } catch (err) {
      console.warn('No se pudo reconciliar actividad:', activity._id, err)
    }
  }
}

const updateOverdueActivities = async () => {
  try {
    // Primero corregimos inconsistencias antes de marcar nuevas vencidas
    await reconcileCompletedActivities()

    const overdueActivitiesToUpdate = activities.value.filter((activity) => {
      // Defensas múltiples:
      if (!activity.dueDate) return false              // 1. necesita fecha límite
      if (isActivityDone(activity)) return false       // 2. no marcar terminadas (incluye 100%)
      if (activity.status === 'overdue') return false  // 3. ya está vencida
      if (!isPastDueDate(activity.dueDate)) return false // 4. fin del día local + margen aún no pasó
      return true
    })

    for (const activity of overdueActivitiesToUpdate) {
      if (!activity._id) continue
      // Re-check antes de cada llamada (por si cambió el estado durante el loop)
      const fresh = activities.value.find((a) => a._id === activity._id)
      if (!fresh || isActivityDone(fresh) || fresh.status === 'overdue') continue

      try {
        await activityService.updateStatus(activity._id, 'overdue')
        const idx = activities.value.findIndex((a) => a._id === activity._id)
        if (idx !== -1 && !isActivityDone(activities.value[idx])) {
          activities.value[idx].status = 'overdue'
        }
      } catch (err) {
        console.warn('No se pudo marcar como vencida:', activity._id, err)
      }
    }

    if (overdueActivitiesToUpdate.length > 0) {
      console.log(`✅ Se marcaron ${overdueActivitiesToUpdate.length} actividades como vencidas`)
    }
  } catch (err) {
    console.error('❌ Error al actualizar actividades vencidas:', err)
  }
}

const loadTeamMembers = async () => {
  console.log('🔄 Iniciando carga de miembros del equipo...')
  console.log('👤 Usuario actual:', authStore.user?.name, '- Rol:', authStore.user?.role)
  console.log('🔐 Puede ver equipo:', authStore.canViewTeam)
  
  try {
    console.log('🔄 Cargando miembros del equipo...')
    teamMembers.value = await teamService.getActiveMembers()
    console.log('✅ Miembros del equipo cargados:', teamMembers.value)
  } catch (err) {
    console.error('❌ Error loading team members:', err)
    // Intentar cargar todos los miembros si falla getActiveMembers
    try {
      console.log('🔄 Intentando cargar todos los miembros...')
      const allMembers = await teamService.getAll()
      teamMembers.value = allMembers.filter(member => member.isActive)
      console.log('✅ Miembros activos filtrados:', teamMembers.value)
    } catch (err2) {
      console.error('❌ Error loading all team members:', err2)
    }
  }
}

const loadClients = async () => {
  loadingClients.value = true
  try {
    clients.value = await clientService.getAll()
    console.log('✅ Clientes cargados:', clients.value.length, clients.value)
  } catch (err) {
    console.error('❌ Error loading clients:', err)
  } finally {
    loadingClients.value = false
  }
}

const markAsCompleted = async (id: string) => {
  try {
    // Si la tarea se completa, forzamos el progreso al 100%
    await activityService.updateProgress(id, 100)
    const updated = await activityService.updateStatus(id, 'completed')
    const index = activities.value.findIndex(a => a._id === id)
    if (index !== -1) {
      activities.value[index] = { ...activities.value[index], ...updated, completionPercentage: 100 }
    }
    showSuccess('Actividad completada y progreso actualizado al 100%')
  } catch (error) {
    showError('Error al marcar como completada')
  }
}

const markAsPending = async (activityId: string) => {
  try {
    await activityService.updateStatus(activityId, 'pending')
    
    // Actualizar en el estado local
    const activityIndex = activities.value.findIndex(a => a._id === activityId)
    if (activityIndex !== -1) {
      activities.value[activityIndex].status = 'pending'
    }
    
    toast('Actividad marcada como pendiente', 'success')
  } catch (err) {
    showError('Error al cambiar estado de actividad', err instanceof Error ? err.message : 'Error desconocido')
  }
}

const markAsInProgress = async (activityId: string) => {
  try {
    await activityService.updateStatus(activityId, 'in-progress')
    
    // Actualizar en el estado local
    const activityIndex = activities.value.findIndex(a => a._id === activityId)
    if (activityIndex !== -1) {
      activities.value[activityIndex].status = 'in-progress'
    }
    
    toast('Actividad marcada como en proceso', 'success')
  } catch (err) {
    showError('Error al cambiar estado de actividad', err instanceof Error ? err.message : 'Error desconocido')
  }
}

const reactivateActivity = async (activityId: string) => {
  try {
    await activityService.updateStatus(activityId, 'pending')
    
    // Actualizar en el estado local
    const activityIndex = activities.value.findIndex(a => a._id === activityId)
    if (activityIndex !== -1) {
      activities.value[activityIndex].status = 'pending'
    }
    
    toast('Actividad reactivada', 'success')
  } catch (err) {
    showError('Error al reactivar actividad', err instanceof Error ? err.message : 'Error desconocido')
  }
}

const extendDeadline = async (activityId: string) => {
  try {
    const activity = activities.value.find(a => a._id === activityId)
    if (!activity) return
    
    // Establecer nueva fecha de vencimiento (7 días a partir de hoy)
    const newDeadline = new Date()
    newDeadline.setDate(newDeadline.getDate() + 7)
    
    await activityService.update(activityId, {
      ...activity,
      dueDate: newDeadline.toISOString(),
      status: 'pending' // Cambiar de vencida a pendiente
    })
    
    // Actualizar en el estado local
    const activityIndex = activities.value.findIndex(a => a._id === activityId)
    if (activityIndex !== -1) {
      activities.value[activityIndex].dueDate = newDeadline.toISOString()
      activities.value[activityIndex].status = 'pending'
    }
    
    toast('Plazo extendido por 7 días', 'success')
  } catch (err) {
    showError('Error al extender plazo', err instanceof Error ? err.message : 'Error desconocido')
  }
}

const getDaysOverdue = (dueDate: string): number => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = today.getTime() - due.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

// Wrapper backwards-compatible: usa la misma logica de "fin del día local + margen"
const isOverdue = (dueDate: string): boolean => isPastDueDate(dueDate)

const deleteActivity = async (activityId: string) => {
  const activity = activities.value.find(a => a._id === activityId)
  if (!activity) return

  const result = await confirmDelete(activity.title, 'actividad')
  if (result.isConfirmed) {
    try {
      await activityService.deleteActivity(activityId)
      activities.value = activities.value.filter(a => a._id !== activityId)
      showSuccess('Actividad eliminada correctamente')
    } catch (err) {
      showError('Error al eliminar actividad', err instanceof Error ? err.message : 'Error desconocido')
    }
  }
}

const editActivity = (activity: ActivityData) => {
  editingActivity.value = activity
  showEditModal.value = true
}

const showAssignModal = (activity: ActivityData) => {
  assigningActivity.value = activity
  showAssignModalState.value = true
}

const closeAssignModal = () => {
  showAssignModalState.value = false
  assigningActivity.value = null
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingActivity.value = null
}

const FILTER_STORAGE_KEY = computed(() => `ct_activity_filters_${authStore.user?._id}`)
const filtersLocked = ref(false)

const hasActiveFilters = computed(() => {
  return selectedDepartment.value !== '' || 
         selectedTeamMember.value !== '' || 
         selectedStatus.value !== '' ||
         startDate.value !== '' ||
         endDate.value !== ''
})

const clearFilters = () => {
  selectedDepartment.value = ''
  selectedTeamMember.value = ''
  selectedStatus.value = ''
  startDate.value = ''
  endDate.value = ''
}

const setMyTasksFilter = () => {
  selectedTeamMember.value = authStore.user?._id || ''
  selectedDepartment.value = ''
  selectedStatus.value = ''
  startDate.value = ''
  endDate.value = ''
}

const toggleLockFilters = () => {
  if (filtersLocked.value) {
    // Desbloquear: borrar filtro guardado
    filtersLocked.value = false
    localStorage.removeItem(FILTER_STORAGE_KEY.value)
  } else {
    // Guardar filtro actual
    filtersLocked.value = true
    localStorage.setItem(FILTER_STORAGE_KEY.value, JSON.stringify({
      department: selectedDepartment.value,
      teamMember: selectedTeamMember.value,
      status: selectedStatus.value
    }))
  }
}

const loadSavedFilters = () => {
  const saved = localStorage.getItem(FILTER_STORAGE_KEY.value)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      selectedDepartment.value = parsed.department || ''
      selectedTeamMember.value = parsed.teamMember || ''
      selectedStatus.value = parsed.status || ''
      filtersLocked.value = true
    } catch {}
  } else {
    // Default: mostrar mis tareas
    selectedTeamMember.value = authStore.user?._id || ''
  }
}

const onActivitySaved = (activity: ActivityData) => {
  if (editingActivity.value) {
    // Actualizar actividad existente
    const index = activities.value.findIndex(a => a._id === activity._id)
    if (index !== -1) {
      activities.value[index] = activity
    }
    toast('Actividad actualizada correctamente', 'success')
  } else {
    // Agregar nueva actividad
    activities.value.unshift(activity)
    showSuccess('Actividad creada correctamente')
  }
}

const handleAssignActivity = async (assigneeId: string | null) => {
  if (!assigningActivity.value?._id) return
  
  assignLoading.value = true
  try {
    const updatedActivity = await activityService.reassignActivity(
      assigningActivity.value._id,
      assigneeId
    )
    
    // Actualizar en el estado local
    const activityIndex = activities.value.findIndex(a => a._id === assigningActivity.value!._id)
    if (activityIndex !== -1) {
      activities.value[activityIndex] = updatedActivity
    }
    
    const assigneeName = assigneeId 
      ? teamMembers.value.find(m => m._id === assigneeId)?.name || 'Usuario'
      : 'Nadie'
    
    toast(`Actividad asignada a ${assigneeName}`, 'success')
    closeAssignModal()
  } catch (err) {
    showError('Error al asignar actividad', err instanceof Error ? err.message : 'Error desconocido')
  } finally {
    assignLoading.value = false
  }
}

// Métodos para funcionalidad del calendario
const handleQuickTask = (date: Date) => {
  selectedDateForQuickTask.value = date
  showQuickTaskModal.value = true
}

const createQuickTaskNow = async () => {
  if (!quickTaskTitle.value.trim()) return
  
  const today = new Date()
  const dueDate = new Date()
  dueDate.setDate(today.getDate() + quickTaskSettings.value.dueDays)
  
  const taskData = {
    title: quickTaskTitle.value.trim(),
    description: `Tarea creada rápidamente el ${today.toLocaleDateString('es-ES')}`,
    date: today.toISOString(),
    dueDate: dueDate.toISOString(),
    status: 'pending',
    priority: quickTaskSettings.value.priority,
    assignedTo: authStore.user?._id || null,
    clientId: null,
    estimatedTime: quickTaskSettings.value.estimatedTime,
    createdBy: authStore.user?._id || null
  }
  
  await handleQuickTaskCreate(taskData)
  quickTaskTitle.value = ''
  showQuickSettings.value = false
}

const handleQuickTaskCreate = async (taskData: any) => {
  try {
    showLoading('Creando tarea rápida...')
    const newActivity = await activityService.create(taskData)
    activities.value.unshift(newActivity)
    toast('Tarea rápida creada correctamente', 'success')
    showQuickTaskModal.value = false
    selectedDateForQuickTask.value = null
  } catch (err) {
    showError('Error al crear tarea rápida', err instanceof Error ? err.message : 'Error desconocido')
  } finally {
    closeLoading()
  }
}

const viewActivity = (activity: ActivityData) => {
  selectedActivity.value = activity
  showActivityDetailModal.value = true
}

const resetQuickSettings = () => {
  quickTaskSettings.value = {
    dueDays: 2,
    priority: 'medium',
    estimatedTime: '2 horas',
    autoAssign: true
  }
}

const createQuickTaskForStatus = async (status: string) => {
  const today = new Date()
  const dueDate = new Date()
  dueDate.setDate(today.getDate() + quickTaskSettings.value.dueDays)
  
  const taskData = {
    title: `Nueva tarea ${status === 'pending' ? 'pendiente' : status}`,
    description: `Tarea creada rápidamente en columna ${status} el ${today.toLocaleDateString('es-ES')}`,
    date: today.toISOString(),
    dueDate: dueDate.toISOString(),
    status: status,
    priority: quickTaskSettings.value.priority,
    assignedTo: authStore.user?._id || null,
    clientId: null,
    estimatedTime: quickTaskSettings.value.estimatedTime,
    createdBy: authStore.user?._id || null
  }
  
  try {
    showLoading('Creando tarea rápida...')
    const newActivity = await activityService.create(taskData)
    activities.value.unshift(newActivity)
    toast(`Tarea ${status === 'pending' ? 'pendiente' : status} creada`, 'success')
    
    // Si es una nueva tarea, permitir edición rápida del título
    setTimeout(() => {
      editActivity(newActivity)
    }, 500)
  } catch (err) {
    showError('Error al crear tarea rápida', err instanceof Error ? err.message : 'Error desconocido')
  } finally {
    closeLoading()
  }
}

// Funciones para manejo de tableros
const createBoard = async () => {
  if (!newBoard.value.name) {
    showError('Error', 'El nombre del tablero es requerido')
    return
  }

  if (!newBoard.value.clientId) {
    showError('Error', 'Debes seleccionar un cliente')
    return
  }

  try {
    showLoading('Creando tablero...')
    
    // Preparar datos del tablero
    const boardData: any = {
      name: newBoard.value.name,
      description: newBoard.value.description,
      type: newBoard.value.type,
      client: newBoard.value.clientId // Enviar como string ID
    }
    
    await boardsStore.createBoard(boardData)
    
    showSuccess('Tablero creado exitosamente')
    showCreateBoardModal.value = false
    
    // Resetear formulario
    newBoard.value = {
      name: '',
      description: '',
      type: 'scrum',
      clientId: ''
    }
    
    // Recargar la lista de tableros
    await boardsStore.fetchBoards()
  } catch (err) {
    showError('Error al crear tablero', err instanceof Error ? err.message : 'Error desconocido')
  } finally {
    closeLoading()
  }
}

const confirmDeleteBoard = async () => {
  if (!selectedBoardId.value) return
  
  const board = boardsStore.myBoards.find(b => b._id === selectedBoardId.value)
  if (!board) return
  
  const confirmed = await confirmDelete(
    `¿Eliminar tablero "${board.name}"?`,
    'Esta acción no se puede deshacer. Todas las tareas asociadas se eliminarán permanentemente.'
  )
  
  if (!confirmed) return

  try {
    showLoading('Eliminando tablero...')
    await boardsStore.deleteBoard(selectedBoardId.value)
    
    // Recargar tableros
    await boardsStore.fetchBoards()
    
    // Seleccionar el primer tablero disponible o limpiar selección
    if (boardsStore.myBoards.length > 0) {
      selectedBoardId.value = boardsStore.myBoards[0]._id
    } else {
      selectedBoardId.value = ''
    }
    
    showSuccess('Tablero eliminado exitosamente')
  } catch (err) {
    showError('Error al eliminar tablero', err instanceof Error ? err.message : 'Error desconocido')
  } finally {
    closeLoading()
  }
}

// Funciones para gestión de sprints
const createSprint = async () => {
  if (!selectedBoardId.value) {
    showError('Error', 'Debes seleccionar un tablero')
    return
  }

  if (!newSprint.value.name || !newSprint.value.startDate || !newSprint.value.endDate) {
    showError('Error', 'Completa todos los campos requeridos')
    return
  }

  try {
    showLoading('Creando sprint...')
    await boardsStore.createSprint(selectedBoardId.value, {
      name: newSprint.value.name,
      goal: newSprint.value.goal,
      startDate: new Date(newSprint.value.startDate),
      endDate: new Date(newSprint.value.endDate),
      status: 'planned'
    })
    
    showSuccess('Sprint creado exitosamente')
    
    // Resetear formulario
    newSprint.value = {
      name: '',
      goal: '',
      startDate: '',
      endDate: ''
    }
    
    // Recargar tablero para actualizar la lista de sprints
    await boardsStore.fetchBoardById(selectedBoardId.value)
  } catch (err) {
    showError('Error al crear sprint', err instanceof Error ? err.message : 'Error desconocido')
  } finally {
    closeLoading()
  }
}

const editSprint = (sprint: any) => {
  // Por ahora solo mostrar alerta, implementar edición completa después
  toast('Función de edición en desarrollo', 'info')
}

const activateSprint = async (sprintId: string) => {
  if (!selectedBoardId.value) return
  
  try {
    showLoading('Activando sprint...')
    await boardsStore.activateSprint(selectedBoardId.value, sprintId)
    showSuccess('Sprint activado exitosamente')
    await boardsStore.fetchBoardById(selectedBoardId.value)
  } catch (err) {
    showError('Error al activar sprint', err instanceof Error ? err.message : 'Error desconocido')
  } finally {
    closeLoading()
  }
}

const completeSprint = async (sprintId: string) => {
  if (!selectedBoardId.value) return
  
  const confirmed = await confirmDelete(
    '¿Completar este sprint?',
    'Las tareas incompletas se moverán al backlog.'
  )
  
  if (!confirmed) return
  
  try {
    showLoading('Completando sprint...')
    await boardsStore.completeSprint(selectedBoardId.value, sprintId)
    showSuccess('Sprint completado exitosamente')
    await boardsStore.fetchBoardById(selectedBoardId.value)
  } catch (err) {
    showError('Error al completar sprint', err instanceof Error ? err.message : 'Error desconocido')
  } finally {
    closeLoading()
  }
}

const deleteSprint = async (sprintId: string) => {
  console.log('🗑️ Eliminando sprint:', sprintId)
  console.log('📋 Board seleccionado:', selectedBoardId.value)
  
  if (!selectedBoardId.value) {
    showError('Error', 'No hay tablero seleccionado')
    return
  }
  
  try {
    console.log('🔄 Llamando a boardsStore.deleteSprint...')
    await boardsStore.deleteSprint(selectedBoardId.value, sprintId)
    console.log('✅ Sprint eliminado exitosamente')
    toast('Sprint eliminado', 'success')
    
    console.log('🔄 Recargando tablero...')
    await boardsStore.fetchBoardById(selectedBoardId.value)
    console.log('✅ Tablero recargado')
  } catch (err) {
    console.error('❌ Error al eliminar sprint:', err)
    showError('Error al eliminar sprint', err instanceof Error ? err.message : 'Error desconocido')
  }
}

// Función para redirigir a la sección de clientes
const redirectToClients = () => {
  showCreateBoardModal.value = false
  // Emitir evento o usar router para navegar
  toast('Redirigiendo a la sección de clientes...', 'info')
  // Si tienes vue-router configurado:
  // router.push('/clients')
}

// También crear una función auxiliar más simple para los casos actuales
const getActivityAssignedName = (assignedUser?: any): string => {
  console.log('🔍 getActivityAssignedName received:', assignedUser)
  
  // Si no hay usuario asignado
  if (!assignedUser) return 'Sin asignar'
  
  // Si es un objeto con nombre (nuevo formato populate)
  if (typeof assignedUser === 'object' && assignedUser.name) {
    console.log('✅ Found user name:', assignedUser.name)
    return assignedUser.name
  }
  
  // Si es solo un string ID, buscar en teamMembers
  if (typeof assignedUser === 'string') {
    const member = teamMembers.value.find(m => m._id === assignedUser)
    console.log('🔍 Looking for member with ID:', assignedUser, 'Found:', member)
    return member?.name || 'Sin asignar'
  }
  
  console.log('❌ Could not determine user name')
  return 'Sin asignar'
}

// Función que busca en las actividades actuales para encontrar la asignación correcta
const getActivityAssignmentByContext = (activityId: string): string => {
  console.log('🔍 Looking for activity:', activityId)
  
  // Buscar en todas las listas de actividades
  const allActivities = [
    ...pendingActivities.value,
    ...inProgressActivities.value,
    ...completedActivities.value,
    ...overdueActivities.value
  ]
  
  const activity = allActivities.find(a => a._id === activityId)
  
  if (activity) {
    console.log('✅ Found activity:', activity)
    return getAssignedToNameSmart(activity)
  }
  
  console.log('❌ Activity not found')
  return 'Sin asignar'
}

// Función especial para buscar el assignment en cualquier lugar de la actividad
const getAssignedToNameSmart = (param?: any): string => {
  console.log('🧠 getAssignedToNameSmart received:', param)
  
  // Si no hay parámetro, no podemos hacer nada
  if (!param) {
    console.log('❌ No parameter')
    return 'Sin asignar'
  }
  
  // Si recibimos directamente un usuario (objeto con name o string ID)
  if (typeof param === 'string' || (typeof param === 'object' && param.name)) {
    console.log('👤 Direct user parameter')
    return getActivityAssignedName(param)
  }
  
  // Si recibimos una actividad, buscar en ambos campos
  if (typeof param === 'object') {
    // Prioridad: assignedTo (nuevo formato)
    if (param.assignedTo) {
      console.log('✅ Found assignedTo')
      return getActivityAssignedName(param.assignedTo)
    }
    
    // Fallback: assignedToUser (formato legacy)
    if (param.assignedToUser) {
      console.log('⚠️ Found assignedToUser') 
      return getActivityAssignedName(param.assignedToUser)
    }
    
    // Si llegamos aquí, probablemente el parámetro era undefined/null de assignedToUser
    // pero tenemos la actividad padre. Necesitamos acceso a la actividad completa.
    console.log('🔍 Parameter appears to be empty assignedToUser, checking context')
  }
  
  console.log('❌ Could not find assignment')
  return 'Sin asignar'
}

// Crear un computed que tenga todas las actividades con su información completa
const allActivitiesWithAssignments = computed(() => {
  const allActivities = [
    ...pendingActivities.value,
    ...inProgressActivities.value,
    ...completedActivities.value,
    ...overdueActivities.value
  ]
  
  return allActivities.map(activity => ({
    ...activity,
    assignmentName: activity.assignedTo?.name || getActivityAssignedName(activity.assignedTo) || getActivityAssignedName(activity.assignedToUser) || 'Sin asignar'
  }))
})

// Función que busca la actividad y devuelve su asignación
const getAssignedToNameByContext = (activityId?: string): string => {
  if (!activityId) return 'Sin asignar'
  
  const activity = allActivitiesWithAssignments.value.find(a => a._id === activityId)
  return activity ? activity.assignmentName : 'Sin asignar'
}

// Función que maneja el caso cuando assignedToUser es undefined pero assignedTo tiene datos
const getAssignedToNameFixed = (activity: any): string => {
  console.log('🔧 getAssignedToNameFixed received activity:', activity)
  
  if (!activity) {
    console.log('❌ No activity provided')
    return 'Sin asignar'
  }
  
  // Prioridad: assignedTo (nuevo formato con populate del backend)
  if (activity.assignedTo) {
    console.log('✅ Using assignedTo field:', activity.assignedTo)
    return getActivityAssignedName(activity.assignedTo)
  }
  
  // Fallback: assignedToUser (formato anterior)
  if (activity.assignedToUser) {
    console.log('⚠️ Using assignedToUser field:', activity.assignedToUser)
    return getActivityAssignedName(activity.assignedToUser)
  }
  
  console.log('❌ No assignment found in activity')
  return 'Sin asignar'
}

// Función específica para obtener el nombre del asignado que maneja tanto assignedTo como assignedToUser
const getAssignmentDisplay = (activity: any): string => {
  console.log('🎯 getAssignmentDisplay for activity:', activity?._id, activity)
  
  if (!activity) {
    console.log('❌ No activity provided to getAssignmentDisplay')
    return 'Sin asignar'
  }
  
  // Prioridad 1: assignedTo con populate (formato nuevo del backend)
  if (activity.assignedTo) {
    console.log('✅ Found assignedTo:', activity.assignedTo)
    if (typeof activity.assignedTo === 'object' && activity.assignedTo.name) {
      console.log('✅ assignedTo has name:', activity.assignedTo.name)
      return activity.assignedTo.name
    }
    if (typeof activity.assignedTo === 'string') {
      const member = teamMembers.value.find(m => m._id === activity.assignedTo)
      console.log('🔍 assignedTo is string ID, found member:', member)
      return member?.name || 'Sin asignar'
    }
  }
  
  // Prioridad 2: assignedToUser (formato legacy)
  if (activity.assignedToUser) {
    console.log('⚠️ Using legacy assignedToUser:', activity.assignedToUser)
    if (typeof activity.assignedToUser === 'object' && activity.assignedToUser.name) {
      return activity.assignedToUser.name
    }
    if (typeof activity.assignedToUser === 'string') {
      const member = teamMembers.value.find(m => m._id === activity.assignedToUser)
      return member?.name || 'Sin asignar'
    }
  }
  
  console.log('❌ No assignment found')
  return 'Sin asignar'
}

// Variable para mantener el contexto de la actividad actual siendo renderizada
let currentActivityBeingRendered: any = null

// SOLUCIÓN DEFINITIVA: Crear una versión mejorada que funciona con el contexto de Vue
const getSmartAssignedName = (activity: any): string => {
  if (!activity) return 'Sin asignar'
  
  const extractName = (user: any): string => {
    if (!user) return ''
    if (typeof user === 'object' && user.name) return user.name
    if (typeof user === 'string') {
      const member = teamMembers.value.find(m => m._id === user)
      return member?.name || ''
    }
    return ''
  }

  // Si es un array de asignados
  if (Array.isArray(activity.assignedTo) && activity.assignedTo.length > 0) {
    const names = activity.assignedTo.map(extractName).filter(Boolean)
    return names.length > 0 ? names.join(', ') : 'Sin asignar'
  }

  // Si es un objeto/ID individual
  if (activity.assignedTo) {
    const name = extractName(activity.assignedTo)
    if (name) return name
  }
  
  // Fallback: assignedToUser (campo legacy)
  if (activity.assignedToUser) {
    const name = extractName(activity.assignedToUser)
    if (name) return name
  }
  
  return 'Sin asignar'
}

// Función antigua modificada para usar la nueva función internamente
const getAssignedToName = (assignedParam?: any, activity?: any): string => {
  console.log('🔍 getAssignedToName called with:', assignedParam, 'typeof:', typeof assignedParam)
  console.log('🔍 Activity context:', activity)
  
  // Si el parámetro es undefined, intentamos usar el contexto de la actividad si está disponible
  if (assignedParam === undefined && activity) {
    console.log('🚨 assignedParam is undefined! Trying to use activity context...')
    return getSmartAssignedName(activity)
  }
  
  // Si el parámetro es undefined y no hay contexto, devolvemos sin asignar
  if (assignedParam === undefined) {
    console.log('🚨 assignedParam is undefined! Returning Sin asignar')
    return 'Sin asignar'
  }
  
  // Si es un objeto con nombre
  if (typeof assignedParam === 'object' && assignedParam?.name) {
    console.log('✅ Found user name:', assignedParam.name)
    return assignedParam.name
  }
  
  // Si es solo un string ID, buscar en teamMembers
  if (typeof assignedParam === 'string') {
    const member = teamMembers.value.find(m => m._id === assignedParam)
    console.log('� Looking for member with ID:', assignedParam, 'Found:', member)
    return member?.name || 'Sin asignar'
  }
  
  console.log('❌ Could not determine user name')
  return 'Sin asignar'
}

// Función auxiliar para buscar actividad por ID y obtener el nombre del asignado
const findActivityAssignment = (activityId: string): string => {
 
  const allActivities = [
    ...pendingActivities.value,
    ...inProgressActivities.value, 
    ...completedActivities.value,
    ...overdueActivities.value
  ]
  
  const activity = allActivities.find(a => a._id === activityId)
  if (activity) {
    return getAssignmentDisplay(activity)
  }
  
  return 'Sin asignar'
}

const getPriorityIcon = (priority: string) => {
  const icons = {
    low: 'fas fa-arrow-down',
    medium: 'fas fa-minus',
    high: 'fas fa-arrow-up',
    urgent: 'fas fa-exclamation'
  }
  return icons[priority as keyof typeof icons] || icons.medium
}

const getPriorityLabel = (priority: string) => {
  const labels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente'
  }
  return labels[priority as keyof typeof labels] || 'Media'
}

// Task Filters Functions
const toggleTaskFilters = () => {
  showTaskFilters.value = !showTaskFilters.value
  
  if (showTaskFilters.value && filterButton.value) {
    const rect = filterButton.value.getBoundingClientRect()
    filterPanelStyle.value = {
      top: `${rect.bottom + 8}px`,
      right: `${window.innerWidth - rect.right}px`
    }
  }
}

const toggleTagFilter = (tag: string) => {
  const index = taskFilters.value.tags.indexOf(tag)
  if (index > -1) {
    taskFilters.value.tags.splice(index, 1)
  } else {
    taskFilters.value.tags.push(tag)
  }
}

const applyTaskFilters = () => {
  showTaskFilters.value = false
  // Los filtros se aplican automáticamente vía computed
  toast('Filtros aplicados correctamente', 'success')
}

const clearTaskFilters = () => {
  taskFilters.value = {
    boardStatus: '',
    priority: '',
    type: '',
    assignedTo: '',
    tags: []
  }
  toast('Filtros limpiados', 'info')
}

// Tasks functions
const selectedBoardId = ref('')
const selectedTask = ref<any>(null)
const selectedSprintId = ref('')
const showCreateBranchModal = ref(false)
const showCreateTaskModal = ref(false)
const isEditingTask = ref(false)
const editingTaskId = ref('')
const newComment = ref('')

const newTask = ref<{
  title: string
  description: string
  type: string
  priority: string
  boardStatus: string
  sprint: string
  assignedTo: string
  storyPoints: number
  estimatedTime: string
  tags: string
  epicId?: string
  featureId?: string
  userStoryId?: string
}>({
  title: '',
  description: '',
  type: 'task',
  priority: 'medium',
  boardStatus: 'todo',
  sprint: '',
  assignedTo: '',
  storyPoints: 0,
  estimatedTime: '',
  tags: ''
})

const groupsExpanded = ref({
  activeSprint: true,
  backlog: true
})

const branchForm = ref({
  repository: '',
  type: 'feature',
  baseBranch: 'master',
  customName: ''
})

const selectedBoard = computed(() => {
  return boardsStore.myBoards.find(b => b._id === selectedBoardId.value)
})

// Computed: Filtros de tareas activos
const hasActiveTaskFilters = computed(() => {
  return !!(
    taskFilters.value.boardStatus ||
    taskFilters.value.priority ||
    taskFilters.value.type ||
    taskFilters.value.assignedTo ||
    taskFilters.value.tags.length > 0
  )
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (taskFilters.value.boardStatus) count++
  if (taskFilters.value.priority) count++
  if (taskFilters.value.type) count++
  if (taskFilters.value.assignedTo) count++
  if (taskFilters.value.tags.length > 0) count += taskFilters.value.tags.length
  return count
})

// Computed: Tags disponibles
const availableTags = computed(() => {
  const tags = new Set<string>()
  tasksStore.tasks.forEach(task => {
    if (task.tags && Array.isArray(task.tags)) {
      task.tags.forEach(tag => tags.add(tag))
    }
  })
  return Array.from(tags).sort()
})

// Computed: Tareas filtradas
const filteredTasks = computed(() => {
  let filtered = tasksStore.tasks

  if (taskFilters.value.boardStatus) {
    filtered = filtered.filter(task => task.boardStatus === taskFilters.value.boardStatus)
  }

  if (taskFilters.value.priority) {
    filtered = filtered.filter(task => task.priority === taskFilters.value.priority)
  }

  if (taskFilters.value.type) {
    filtered = filtered.filter(task => task.type === taskFilters.value.type)
  }

  if (taskFilters.value.assignedTo) {
    if (taskFilters.value.assignedTo === 'unassigned') {
      filtered = filtered.filter(task => !task.assignedTo || task.assignedTo.length === 0)
    } else {
      filtered = filtered.filter(task => {
        if (!task.assignedTo) return false
        if (Array.isArray(task.assignedTo)) {
          return task.assignedTo.some((user: any) => {
            if (typeof user === 'string') return user === taskFilters.value.assignedTo
            return user._id === taskFilters.value.assignedTo
          })
        }
        return false
      })
    }
  }

  if (taskFilters.value.tags.length > 0) {
    filtered = filtered.filter(task => {
      if (!task.tags || !Array.isArray(task.tags)) return false
      return taskFilters.value.tags.some(filterTag => task.tags.includes(filterTag))
    })
  }

  return filtered
})

const activeSprintTasks = computed(() => {
  if (!selectedBoard.value || selectedBoard.value.type !== 'scrum') return []
  const activeSprint = selectedBoard.value.sprints?.find((s: any) => s.status === 'active')
  if (!activeSprint) return []
  return filteredTasks.value.filter(task => task.sprint === activeSprint._id && task.boardStatus !== 'backlog')
})

const getTasksByStatus = (status: string) => {
  return filteredTasks.value.filter(task => task.boardStatus === status)
}

// Funciones para vista jerárquica
const getEpics = () => {
  return filteredTasks.value.filter(task => task.type === 'epic')
}

const getEpicFeatures = (epicId: string) => {
  return filteredTasks.value.filter(task => task.type === 'feature' && task.epicId === epicId)
}

const getFeatureUserStories = (featureId: string) => {
  return filteredTasks.value.filter(task => task.type === 'user-story' && task.featureId === featureId)
}

const getUserStoryTasks = (storyId: string) => {
  return filteredTasks.value.filter(task => task.type === 'task' && task.userStoryId === storyId)
}

const getEpicTasks = (epicId: string) => {
  // Obtener todas las tareas bajo una épica (incluyendo features, stories y tasks)
  const features = getEpicFeatures(epicId)
  let count = features.length
  features.forEach(feature => {
    const stories = getFeatureUserStories(feature._id)
    count += stories.length
    stories.forEach(story => {
      count += getUserStoryTasks(story._id).length
    })
  })
  return { length: count }
}

const getIndependentTasks = () => {
  // Tareas que no tienen relación jerárquica (ni son épicas, ni tienen padres)
  return filteredTasks.value.filter(task => 
    task.type === 'task' && !task.userStoryId && !task.featureId && !task.epicId
  )
}

const toggleEpic = (epicId: string) => {
  if (collapsedEpics.value.has(epicId)) {
    collapsedEpics.value.delete(epicId)
  } else {
    collapsedEpics.value.add(epicId)
  }
}

const toggleFeature = (featureId: string) => {
  if (collapsedFeatures.value.has(featureId)) {
    collapsedFeatures.value.delete(featureId)
  } else {
    collapsedFeatures.value.add(featureId)
  }
}

const toggleStory = (storyId: string) => {
  if (collapsedStories.value.has(storyId)) {
    collapsedStories.value.delete(storyId)
  } else {
    collapsedStories.value.add(storyId)
  }
}

const isEpicCollapsed = (epicId: string) => {
  return collapsedEpics.value.has(epicId)
}

const isFeatureCollapsed = (featureId: string) => {
  return collapsedFeatures.value.has(featureId)
}

const isStoryCollapsed = (storyId: string) => {
  return collapsedStories.value.has(storyId)
}

// Funciones para borrado en cascada
const getAllChildrenIds = (taskId: string, taskType: string): string[] => {
  const childrenIds: string[] = []
  
  if (taskType === 'epic') {
    // Obtener todas las features de esta épica
    const features = getEpicFeatures(taskId)
    features.forEach(feature => {
      childrenIds.push(feature._id)
      // Obtener todas las stories de cada feature
      const stories = getFeatureUserStories(feature._id)
      stories.forEach(story => {
        childrenIds.push(story._id)
        // Obtener todas las tasks de cada story
        const tasks = getUserStoryTasks(story._id)
        tasks.forEach(task => childrenIds.push(task._id))
      })
    })
  } else if (taskType === 'feature') {
    // Obtener todas las stories de esta feature
    const stories = getFeatureUserStories(taskId)
    stories.forEach(story => {
      childrenIds.push(story._id)
      // Obtener todas las tasks de cada story
      const tasks = getUserStoryTasks(story._id)
      tasks.forEach(task => childrenIds.push(task._id))
    })
  } else if (taskType === 'user-story') {
    // Obtener todas las tasks de esta story
    const tasks = getUserStoryTasks(taskId)
    tasks.forEach(task => childrenIds.push(task._id))
  }
  
  return childrenIds
}

const getChildrenCount = (taskId: string, taskType: string) => {
  const childrenIds = getAllChildrenIds(taskId, taskType)
  return {
    total: childrenIds.length,
    features: 0,
    stories: 0,
    tasks: 0
  }
}

const getDetailedChildrenCount = (taskId: string, taskType: string) => {
  let features = 0
  let stories = 0
  let tasks = 0
  
  if (taskType === 'epic') {
    const epicFeatures = getEpicFeatures(taskId)
    features = epicFeatures.length
    epicFeatures.forEach(feature => {
      const featureStories = getFeatureUserStories(feature._id)
      stories += featureStories.length
      featureStories.forEach(story => {
        tasks += getUserStoryTasks(story._id).length
      })
    })
  } else if (taskType === 'feature') {
    const featureStories = getFeatureUserStories(taskId)
    stories = featureStories.length
    featureStories.forEach(story => {
      tasks += getUserStoryTasks(story._id).length
    })
  } else if (taskType === 'user-story') {
    tasks = getUserStoryTasks(taskId).length
  }
  
  return { features, stories, tasks, total: features + stories + tasks }
}

const handleBoardChange = async () => {
  if (selectedBoardId.value) {
    await tasksStore.fetchTasks(selectedBoardId.value)
    // Cargar repositorios de GitHub si el usuario tiene configuración
    const authStore = useAuthStore()
    if (authStore.user?.githubUsername) {
      try {
        await githubStore.fetchRepositories(authStore.user.githubUsername)
      } catch (err) {
        console.log('No se pudieron cargar repositorios de GitHub')
      }
    }
  }
}

const filterBySprint = async () => {
  // Implementar filtrado por sprint si es necesario
  await tasksStore.fetchTasks(selectedBoardId.value)
}

const refreshTasks = async () => {
  if (selectedBoardId.value) {
    await tasksStore.fetchTasks(selectedBoardId.value)
  }
}

const openCreateTaskModal = (storyId?: string) => {
  // Resetear el formulario
  newTask.value = {
    title: '',
    description: '',
    type: 'task',
    priority: 'medium',
    boardStatus: selectedBoard.value?.columns[0]?.mappedStatus || 'todo',
    sprint: '',
    assignedTo: authStore.user?._id || '',
    storyPoints: 0,
    estimatedTime: '',
    tags: '',
    ...(storyId && { userStoryId: storyId })
  }
  showCreateTaskModal.value = true
}

// Funciones para crear elementos jerárquicos
const openCreateFeatureModal = (epicId: string) => {
  newTask.value = {
    title: '',
    description: '',
    type: 'feature',
    priority: 'medium',
    boardStatus: selectedBoard.value?.columns[0]?.mappedStatus || 'todo',
    sprint: '',
    assignedTo: authStore.user?._id || '',
    storyPoints: 0,
    estimatedTime: '',
    tags: '',
    epicId: epicId
  }
  showCreateTaskModal.value = true
}

const openCreateUserStoryModal = (featureId: string) => {
  newTask.value = {
    title: '',
    description: '',
    type: 'user-story',
    priority: 'medium',
    boardStatus: selectedBoard.value?.columns[0]?.mappedStatus || 'todo',
    sprint: '',
    assignedTo: authStore.user?._id || '',
    storyPoints: 0,
    estimatedTime: '',
    tags: '',
    featureId: featureId
  }
  showCreateTaskModal.value = true
}

const createTask = async () => {
  if (!newTask.value.title || !selectedBoardId.value) {
    showError('Error', 'El título es requerido')
    return
  }

  // Validar relaciones jerárquicas requeridas
  if (newTask.value.type === 'feature' && !newTask.value.epicId) {
    showError('Error', 'Debes seleccionar una Épica para la Feature')
    return
  }
  if (newTask.value.type === 'user-story' && !newTask.value.featureId) {
    showError('Error', 'Debes seleccionar una Feature para la User Story')
    return
  }

  try {
    showLoading(isEditingTask.value ? 'Actualizando tarea...' : 'Creando tarea...')
    
    // Preparar datos de la tarea
    const taskData: any = {
      boardId: selectedBoardId.value,
      title: newTask.value.title,
      description: newTask.value.description,
      type: newTask.value.type,
      priority: newTask.value.priority,
      boardStatus: newTask.value.boardStatus,
      status: 'active',
      assignedTo: newTask.value.assignedTo || undefined,
      estimatedTime: newTask.value.estimatedTime || undefined,
    }

    // Agregar relaciones jerárquicas según el tipo
    if (newTask.value.type === 'feature' && newTask.value.epicId) {
      taskData.epicId = newTask.value.epicId
    }
    if (newTask.value.type === 'user-story' && newTask.value.featureId) {
      taskData.featureId = newTask.value.featureId
    }
    if (newTask.value.type === 'task' && newTask.value.userStoryId) {
      taskData.userStoryId = newTask.value.userStoryId
    }

    // Agregar sprint si es un board scrum
    if (selectedBoard.value?.type === 'scrum' && newTask.value.sprint) {
      taskData.sprint = newTask.value.sprint
      taskData.storyPoints = newTask.value.storyPoints || 0
    }

    // Procesar tags
    if (newTask.value.tags) {
      taskData.tags = newTask.value.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
    }

    if (isEditingTask.value && editingTaskId.value) {
      // Actualizar tarea existente
      await tasksStore.updateTask(editingTaskId.value, taskData)
      showSuccess('Tarea actualizada exitosamente')
    } else {
      // Crear nueva tarea en el board
      const createdTask = await tasksStore.createTask(taskData)
      
      // También crear una actividad en el Kanban para dar seguimiento
      const activityStatus = mapBoardStatusToActivityStatus(newTask.value.boardStatus)
      const activityData = {
        title: newTask.value.title,
        description: newTask.value.description,
        status: activityStatus,
        priority: newTask.value.priority,
        assignedTo: newTask.value.assignedTo,
        date: new Date().toISOString(),
        dueDate: null,
        estimatedTime: newTask.value.estimatedTime,
        taskId: createdTask._id,
        clientId: selectedBoard.value?.client?._id || null // ✅ Usar client._id del tablero
      }
      
      await activityService.create(activityData)
      showSuccess('Tarea creada exitosamente')
    }
    
    closeTaskModal()

    // Recargar solamente las tareas del tablero seleccionado para evitar
    // recargar todos los boards y provocar parpadeos en la UI.
    if (selectedBoardId.value) {
      await tasksStore.fetchTasks(selectedBoardId.value)
    } else {
      // Fallback: si no hay tablero seleccionado, recargar actividades generales
      await loadActivities()
    }
  } catch (err) {
    showError(
      isEditingTask.value ? 'Error al actualizar tarea' : 'Error al crear tarea',
      err instanceof Error ? err.message : 'Error desconocido'
    )
  } finally {
    closeLoading()
  }
}

const closeTaskModal = () => {
  showCreateTaskModal.value = false
  isEditingTask.value = false
  editingTaskId.value = ''
  newTask.value = {
    title: '',
    description: '',
    type: 'task',
    priority: 'medium',
    boardStatus: 'todo',
    sprint: '',
    assignedTo: '',
    storyPoints: 0,
    estimatedTime: '',
    tags: ''
  }
}

// Función para mapear estados del board a estados de actividad
const mapBoardStatusToActivityStatus = (boardStatus: string): 'pending' | 'in-progress' | 'completed' => {
  const statusMap: Record<string, 'pending' | 'in-progress' | 'completed'> = {
    'backlog': 'pending',
    'todo': 'pending',
    'in-progress': 'in-progress',
    'review': 'in-progress',
    'testing': 'in-progress',
    'done': 'completed'
  }
  return statusMap[boardStatus] || 'pending'
}

const selectTask = (task: any) => {
  selectedTask.value = task
}

const toggleGroup = (groupName: keyof typeof groupsExpanded.value) => {
  groupsExpanded.value[groupName] = !groupsExpanded.value[groupName]
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    backlog: 'bg-gray-600/50 text-gray-300',
    todo: 'bg-blue-600/50 text-blue-300',
    'in-progress': 'bg-yellow-600/50 text-yellow-300',
    review: 'bg-purple-600/50 text-purple-300',
    testing: 'bg-orange-600/50 text-orange-300',
    done: 'bg-green-600/50 text-green-300'
  }
  return classes[status as keyof typeof classes] || classes.backlog
}

const getStatusLabel = (status: string) => {
  const labels = {
    backlog: 'Backlog',
    todo: 'To Do',
    'in-progress': 'In Progress',
    review: 'Review',
    testing: 'Testing',
    done: 'Done'
  }
  return labels[status as keyof typeof labels] || status
}

const getTaskSprintName = (task: any) => {
  if (!task.sprint || !selectedBoard.value) return '-'
  const sprint = selectedBoard.value.sprints?.find((s: any) => s._id === task.sprint)
  return sprint ? sprint.name : '-'
}

const updateTaskStatus = async () => {
  if (!selectedTask.value) return
  try {
    await tasksStore.updateTask(selectedTask.value._id, {
      boardStatus: selectedTask.value.boardStatus
    })
    await toast('Estado actualizado', 'success')
  } catch (error) {
    await toast('Error al actualizar estado', 'error')
  }
}

const updateTaskPriority = async () => {
  if (!selectedTask.value) return
  try {
    await tasksStore.updateTask(selectedTask.value._id, {
      priority: selectedTask.value.priority
    })
    await toast('Prioridad actualizada', 'success')
  } catch (error) {
    await toast('Error al actualizar prioridad', 'error')
  }
}

const updateTaskSprint = async () => {
  if (!selectedTask.value) return
  try {
    await tasksStore.updateTask(selectedTask.value._id, {
      sprint: selectedTask.value.sprint || null
    })
    await toast('Sprint actualizado', 'success')
    await tasksStore.fetchTasks(selectedBoardId.value)
  } catch (error) {
    await toast('Error al actualizar sprint', 'error')
  }
}

const deleteTask = async (taskId: string) => {
  // Buscar la tarea para obtener su tipo y título
  const task = tasksStore.tasks.find(t => t._id === taskId)
  if (!task) {
    showError('Error', 'Tarea no encontrada')
    return
  }

  // Verificar si tiene elementos hijos
  const childrenCount = getDetailedChildrenCount(taskId, task.type)
  
  // Siempre mostrar el modal personalizado (con o sin hijos)
  cascadeDeleteInfo.value = {
    taskId: taskId,
    taskTitle: task.title,
    taskType: task.type,
    features: childrenCount.features,
    stories: childrenCount.stories,
    tasks: childrenCount.tasks,
    total: childrenCount.total
  }
  showCascadeDeleteModal.value = true
}

const confirmCascadeDelete = async () => {
  try {
    showLoading('Eliminando elementos...')
    showCascadeDeleteModal.value = false
    
    // Obtener todos los IDs a borrar (el elemento principal + sus hijos)
    const childrenIds = getAllChildrenIds(cascadeDeleteInfo.value.taskId, cascadeDeleteInfo.value.taskType)
    const allIds = [cascadeDeleteInfo.value.taskId, ...childrenIds]
    
    // 🌿 Recopilar todas las ramas de GitHub a eliminar
    const branchesToDelete: Array<{
      repoOwner: string
      repoName: string
      branch: string
      taskTitle: string
    }> = []
    
    for (const id of allIds) {
      const task = tasksStore.tasks.find(t => t._id === id)
      if (task?.github?.branch && task.github?.repoOwner && task.github?.repoName) {
        // 🔄 Sincronizar estado del PR si existe
        let canDelete = true
        
        if (task.github.pullRequest?.number) {
          try {
            console.log(`🔄 Sincronizando PR de tarea ${task.title}...`)
            const response = await axios.post(
              `${API_URL}/api/github/tasks/${id}/sync-pr`,
              {},
              { headers: { Authorization: `Bearer ${authStore.token}` }}
            )
            
            // Actualizar con datos frescos
            if (response.data.task?.github?.pullRequest) {
              task.github.pullRequest = response.data.task.github.pullRequest
              const prStatus = response.data.task.github.pullRequest.status
              const prMerged = response.data.task.github.pullRequest.mergedAt
              
              // Solo prevenir si está abierto y no mergeado
              if (prStatus === 'open' && !prMerged) {
                canDelete = false
                console.log(`⚠️ Rama "${task.github.branch}" tiene PR #${response.data.task.github.pullRequest.number} abierto`)
              }
            }
          } catch (syncError) {
            console.warn(`⚠️ No se pudo sincronizar PR de ${task.title}:`, syncError)
            // Si no se puede sincronizar, usar datos locales
            const pr = task.github.pullRequest
            canDelete = !pr || 
                       pr.status === 'closed' ||
                       pr.status === 'merged' ||
                       !!pr.mergedAt
          }
        }
        
        if (canDelete) {
          branchesToDelete.push({
            repoOwner: task.github.repoOwner,
            repoName: task.github.repoName,
            branch: task.github.branch,
            taskTitle: task.title
          })
        }
      }
    }
    
    // Borrar todos los elementos de la base de datos
    for (const id of allIds) {
      // 🗑️ Primero eliminar la actividad asociada en el Kanban (si existe)
      const task = tasksStore.tasks.find(t => t._id === id)
      if (task) {
        // Buscar actividad asociada por taskId
        const relatedActivity = activities.value.find(a => a.taskId === id)
        if (relatedActivity && relatedActivity._id) {
          try {
            await activityService.deleteActivity(relatedActivity._id)
            console.log(`🗑️ Actividad eliminada del Kanban: ${relatedActivity.title}`)
          } catch (error) {
            console.warn(`⚠️ No se pudo eliminar actividad del Kanban:`, error)
          }
        }
      }
      
      // Luego eliminar la tarea del board
      await tasksStore.deleteTask(id)
    }
    
    // 🌿 Eliminar ramas de GitHub (en segundo plano, no bloquear si falla)
    if (branchesToDelete.length > 0) {
      console.log(`🌿 Eliminando ${branchesToDelete.length} ramas de GitHub...`)
      
      for (const branchInfo of branchesToDelete) {
        try {
          await githubStore.deleteBranch(
            branchInfo.repoOwner,
            branchInfo.repoName,
            branchInfo.branch
          )
          console.log(`✅ Rama eliminada: ${branchInfo.branch}`)
        } catch (error: any) {
          // Si la rama no existe (404), solo registrar
          if (error.response?.status === 404) {
            console.log(`⚠️ Rama ya no existe en GitHub: ${branchInfo.branch}`)
          } else {
            console.error(`❌ Error eliminando rama ${branchInfo.branch}:`, error.message)
          }
        }
      }
      
      if (branchesToDelete.length > 0) {
        await toast(`${allIds.length} elementos y ${branchesToDelete.length} ramas eliminadas`, 'success')
      }
    } else {
      await toast(`${allIds.length} elementos eliminados correctamente`, 'success')
    }
    
    selectedTask.value = null
    
    // Solo recargar actividades del Kanban (las tareas ya se eliminaron del store)
    await loadActivities()
  } catch (error) {
    showError('Error al eliminar elementos', error instanceof Error ? error.message : 'Error desconocido')
  } finally {
    closeLoading()
  }
}

const cancelCascadeDelete = () => {
  showCascadeDeleteModal.value = false
  cascadeDeleteInfo.value = {
    taskId: '',
    taskTitle: '',
    taskType: '',
    features: 0,
    stories: 0,
    tasks: 0,
    total: 0
  }
}

const showEditTaskModal = () => {
  if (!selectedTask.value) return
  
  // Llenar el formulario con los datos actuales
  newTask.value = {
    title: selectedTask.value.title,
    description: selectedTask.value.description || '',
    type: selectedTask.value.type,
    priority: selectedTask.value.priority,
    boardStatus: selectedTask.value.boardStatus,
    sprint: selectedTask.value.sprint || '',
    assignedTo: typeof selectedTask.value.assignedTo === 'object' 
      ? selectedTask.value.assignedTo._id 
      : selectedTask.value.assignedTo || '',
    storyPoints: selectedTask.value.storyPoints || 0,
    estimatedTime: selectedTask.value.estimatedTime || '',
    tags: selectedTask.value.tags?.join(', ') || ''
  }
  
  showCreateTaskModal.value = true
  isEditingTask.value = true
  editingTaskId.value = selectedTask.value._id
}

// Métodos de Vinculación de Recursos
const openCaseLinkingModal = async () => {
  showCaseLinkingModal.value = true
  linkingLoading.value = true
  try {
    casesList.value = await casesService.getAll()
  } catch (error) {
    showError('Error al cargar casos')
  } finally {
    linkingLoading.value = false
  }
}

const openWikiLinkingModal = async () => {
  showWikiLinkingModal.value = true
  linkingLoading.value = true
  try {
    wikiList.value = await wikiService.getAll()
  } catch (error) {
    showError('Error al cargar wiki')
  } finally {
    linkingLoading.value = false
  }
}

const linkCase = async (caseObj: any) => {
  if (!selectedTask.value) return
  
  const currentCases = selectedTask.value.linkedCases || []
  if (currentCases.some((c: any) => c._id === caseObj._id)) {
    toast('Este caso ya está vinculado', 'info')
    return
  }

  try {
    const updated = await tasksStore.updateTask(selectedTask.value._id, {
      linkedCases: [...currentCases, caseObj]
    })
    selectedTask.value = updated
    toast('Caso vinculado exitosamente', 'success')
    showCaseLinkingModal.value = false
  } catch (error) {
    showError('Error al vincular caso')
  }
}

const linkWiki = async (wikiObj: any) => {
  if (!selectedTask.value) return
  
  const currentArticles = selectedTask.value.linkedWikiArticles || []
  if (currentArticles.some((a: any) => a._id === wikiObj._id)) {
    toast('Este artículo ya está vinculado', 'info')
    return
  }

  try {
    const updated = await tasksStore.updateTask(selectedTask.value._id, {
      linkedWikiArticles: [...currentArticles, wikiObj]
    })
    selectedTask.value = updated
    toast('Artículo vinculado exitosamente', 'success')
    showWikiLinkingModal.value = false
  } catch (error) {
    showError('Error al vincular artículo')
  }
}

const unlinkCase = async (caseId: string) => {
  if (!selectedTask.value) return
  
  try {
    const currentCases = selectedTask.value.linkedCases || []
    const updated = await tasksStore.updateTask(selectedTask.value._id, {
      linkedCases: currentCases.filter((c: any) => c._id !== caseId)
    })
    selectedTask.value = updated
    toast('Caso desvinculado', 'success')
  } catch (error) {
    showError('Error al desvincular caso')
  }
}

const unlinkWiki = async (wikiId: string) => {
  if (!selectedTask.value) return
  
  try {
    const currentArticles = selectedTask.value.linkedWikiArticles || []
    const updated = await tasksStore.updateTask(selectedTask.value._id, {
      linkedWikiArticles: currentArticles.filter((a: any) => a._id !== wikiId)
    })
    selectedTask.value = updated
    toast('Artículo desvinculado', 'success')
  } catch (error) {
    showError('Error al desvincular artículo')
  }
}

const openResource = (item: any, type?: string) => {
  if (type === 'case' || item.caseNumber) {
    window.open(`/cases?id=${item._id}`, '_blank')
  } else {
    window.open(`/wiki?id=${item._id}`, '_blank')
  }
}

const editTaskFromCard = (task: any) => {
  selectedTask.value = task
  showEditTaskModal()
}

const getAssignedName = (assignedTo: any): string => {
  if (!assignedTo) return 'Sin asignar'
  
  // Si es un array, tomar el primer elemento
  if (Array.isArray(assignedTo)) {
    if (assignedTo.length === 0) return 'Sin asignar'
    const firstAssigned = assignedTo[0]
    if (typeof firstAssigned === 'object' && firstAssigned?.name) return firstAssigned.name
    if (typeof firstAssigned === 'string') {
      const member = teamMembers.value.find(m => m._id === firstAssigned)
      return member?.name || 'Sin asignar'
    }
    return 'Sin asignar'
  }
  
  // Si es un objeto directo
  if (typeof assignedTo === 'object' && assignedTo.name) return assignedTo.name
  
  // Si es un string (ID)
  if (typeof assignedTo === 'string') {
    const member = teamMembers.value.find(m => m._id === assignedTo)
    return member?.name || 'Sin asignar'
  }
  
  return 'Sin asignar'
}

const getFirstAssigned = (assignedTo: any): any => {
  if (!assignedTo) return null
  
  // Si es un array, devolver el primer elemento
  if (Array.isArray(assignedTo)) {
    if (assignedTo.length === 0) return null
    const firstAssigned = assignedTo[0]
    
    // Si es un objeto con datos de usuario
    if (typeof firstAssigned === 'object' && firstAssigned) {
      return firstAssigned
    }
    
    // Si es un string (ID), buscar en teamMembers
    if (typeof firstAssigned === 'string') {
      return teamMembers.value.find(m => m._id === firstAssigned) || null
    }
    
    return null
  }
  
  // Si es un objeto directo
  if (typeof assignedTo === 'object' && assignedTo) return assignedTo
  
  // Si es un string (ID)
  if (typeof assignedTo === 'string') {
    return teamMembers.value.find(m => m._id === assignedTo) || null
  }
  
  return null
}

const generateBranchName = () => {
  if (!selectedTask.value) return ''
  const taskId = selectedTask.value._id.slice(-4).toUpperCase()
  const title = selectedTask.value.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40)
  return `${branchForm.value.type}/${taskId}-${title}`
}

const openCreateBranchModal = async () => {
  showCreateBranchModal.value = true
  
  // Cargar repositorios del usuario si no están cargados
  if (githubStore.repositories.length === 0) {
    try {
      // Obtener el owner desde configuración (puedes configurar esto en el .env o settings)
      const owner = 'sebastianpg12' // TODO: Obtener de configuración del usuario
      await githubStore.fetchRepositories(owner)
    } catch (error) {
      console.error('Error loading repositories:', error)
    }
  }
}

const createGitHubBranch = async () => {
  if (!selectedTask.value || !branchForm.value.repository) return
  
  try {
    showLoading('Creando rama en GitHub...')
    
    // Extraer owner y repo del full_name (formato: "owner/repo")
    const [repoOwner, repoName] = branchForm.value.repository.split('/')
    
    console.log('🔧 Configurando repositorio en tarea...')
    console.log('Repository:', repoOwner, '/', repoName)
    console.log('Base branch:', branchForm.value.baseBranch)
    
    // Primero actualizar la tarea con la información del repositorio
    await tasksStore.updateTask(selectedTask.value._id, {
      github: {
        repoOwner,
        repoName,
        branch: undefined, // Aún no hay rama
        branchUrl: undefined,
        pullRequest: undefined,
        commits: [],
        lastSync: new Date()
      }
    })
    
    console.log('✅ Repositorio configurado en tarea')
    console.log('🌿 Creando rama en GitHub...')
    
    // Crear rama con nombre personalizado (si existe) o auto-generado
    const customBranchName = branchForm.value.customName || generateBranchName()
    const result = await githubStore.createBranch(
      selectedTask.value._id, 
      branchForm.value.baseBranch,
      customBranchName
    )
    
    console.log('✅ Rama creada:', result)
    
    // Actualizar la vista local
    if (selectedTask.value.github) {
      selectedTask.value.github.branch = result.task.github.branch
      selectedTask.value.github.branchUrl = result.task.github.branchUrl
      selectedTask.value.github.repoOwner = repoOwner
      selectedTask.value.github.repoName = repoName
    }
    
    // Refrescar tareas para obtener los datos actualizados
    await tasksStore.fetchTasks(selectedBoardId.value)
    
    // Limpiar el formulario
    branchForm.value.customName = ''
    showCreateBranchModal.value = false
    closeLoading()
    await toast('Rama creada exitosamente', 'success')
  } catch (error: any) {
    console.error('❌ Error al crear rama:', error)
    closeLoading()
    
    // Mejorar mensaje de error
    let errorMsg = 'Error al crear rama'
    if (error.response?.data?.error) {
      errorMsg = error.response.data.error
    } else if (error.message) {
      errorMsg = error.message
    }
    
    await toast(errorMsg, 'error')
  }
}

const createPullRequest = async () => {
  if (!selectedTask.value || !selectedTask.value.github?.branch) return
  
  try {
    showLoading('Creando Pull Request...')
    
    const title = `[${selectedTask.value._id.slice(-4).toUpperCase()}] ${selectedTask.value.title}`
    const description = selectedTask.value.description || ''
    
    // Crear PR desde el backend usando el taskId
    const result = await githubStore.createPullRequest(selectedTask.value._id, title, description)
    
    // Actualizar la vista local
    if (selectedTask.value.github) {
      selectedTask.value.github.pr = result.prUrl
    }
    
    // Refrescar tareas
    await tasksStore.fetchTasks(selectedBoardId.value)
    
    closeLoading()
    await toast('Pull Request creado', 'success')
  } catch (error: any) {
    closeLoading()
    await toast(error.message || 'Error al crear PR', 'error')
  }
}

const syncPullRequestStatus = async () => {
  if (!selectedTask.value || !selectedTask.value.github?.pullRequest?.number) return
  
  try {
    showLoading('Sincronizando estado del PR...')
    
    const response = await axios.post(
      `${API_URL}/api/github/tasks/${selectedTask.value._id}/sync-pr`,
      {},
      { headers: { Authorization: `Bearer ${authStore.token}` }}
    )
    
    if (response.data.task) {
      // Actualizar tarea con datos frescos
      selectedTask.value.github = response.data.task.github
      
      // También actualizar en el store
      await tasksStore.fetchTasks(selectedBoardId.value)
      
      const pr = response.data.task.github.pullRequest
      if (pr) {
        const status = pr.mergedAt ? 'mergeado' : pr.status
        await toast(`PR actualizado: estado ${status}`, 'success')
      } else {
        await toast('Estado del PR actualizado', 'success')
      }
    }
    
    closeLoading()
  } catch (error: any) {
    closeLoading()
    console.error('Error sincronizando PR:', error)
    await toast('Error al sincronizar estado del PR', 'error')
  }
}

const deleteGitHubBranch = async () => {
  if (!selectedTask.value || !selectedTask.value.github?.branch) return
  
  try {
    const branchName = selectedTask.value.github.branch
    const repoOwner = selectedTask.value.github.repoOwner
    const repoName = selectedTask.value.github.repoName
    
    if (!repoOwner || !repoName) {
      await toast('Información del repositorio no disponible', 'error')
      return
    }
    
    // 🔄 Sincronizar estado del PR desde GitHub antes de verificar
    if (selectedTask.value.github.pullRequest?.number) {
      try {
        showLoading('Verificando estado del PR...')
        console.log('🔄 Sincronizando estado del PR desde GitHub...')
        
        // Llamar al endpoint de sincronización
        const response = await axios.post(
          `${API_URL}/api/github/tasks/${selectedTask.value._id}/sync-pr`,
          {},
          { headers: { Authorization: `Bearer ${authStore.token}` }}
        )
        
        // Actualizar tarea con datos frescos
        if (response.data.task) {
          selectedTask.value.github = response.data.task.github
          console.log('✅ Estado del PR actualizado:', response.data.task.github.pullRequest)
        }
        
        closeLoading()
      } catch (syncError) {
        console.warn('⚠️ No se pudo sincronizar PR, continuando con datos locales:', syncError)
        closeLoading()
      }
    }
    
    // Verificar estado del PR después de sincronizar
    if (selectedTask.value.github.pullRequest) {
      const prStatus = selectedTask.value.github.pullRequest.status
      const prMerged = selectedTask.value.github.pullRequest.mergedAt
      
      console.log('📊 Estado del PR:', { status: prStatus, merged: prMerged })
      
      // Si el PR está abierto (no cerrado ni mergeado)
      if (prStatus === 'open' && !prMerged) {
        const prNumber = selectedTask.value.github.pullRequest.number
        await toast(
          `No se puede eliminar: PR #${prNumber} está abierto.\n` +
          `Cierra o mergea el PR en GitHub primero.`, 
          'error'
        )
        return
      }
    }
    
    // ⚠️ CONFIRMACIÓN: Eliminar rama es una acción destructiva
    const confirmResult = await confirmDelete(`¿Eliminar rama "${branchName}" de GitHub? Esta acción no se puede deshacer.`)
    if (!confirmResult.isConfirmed) return
    
    showLoading('Eliminando rama de GitHub...')
    
    try {
      // Eliminar rama en GitHub
      await githubStore.deleteBranch(repoOwner, repoName, branchName)
    } catch (deleteError: any) {
      // Si la rama ya no existe en GitHub (404), solo limpiar localmente
      if (deleteError.response?.status === 404) {
        console.log('⚠️ Rama no encontrada en GitHub, limpiando solo localmente...')
        await toast('Rama no encontrada en GitHub, limpiando asociación local', 'warning')
      } else {
        throw deleteError
      }
    }
    
    // Limpiar info de GitHub en la tarea
    await tasksStore.updateTask(selectedTask.value._id, {
      github: {
        repoOwner: undefined,
        repoName: undefined,
        branch: undefined,
        branchUrl: undefined,
        pullRequest: undefined,
        commits: [],
        lastSync: new Date()
      }
    })
    
    // Actualizar la vista local
    if (selectedTask.value.github) {
      selectedTask.value.github.branch = undefined
      selectedTask.value.github.branchUrl = undefined
      selectedTask.value.github.pullRequest = undefined
      selectedTask.value.github.repoOwner = undefined
      selectedTask.value.github.repoName = undefined
    }
    
    // Refrescar tareas
    await tasksStore.fetchTasks(selectedBoardId.value)
    
    closeLoading()
    await toast('Rama eliminada exitosamente', 'success')
  } catch (error: any) {
    console.error('❌ Error al eliminar rama:', error)
    closeLoading()
    
    // Mejorar mensaje de error
    let errorMsg = 'Error al eliminar rama'
    if (error.response?.data?.error) {
      errorMsg = error.response.data.error
    } else if (error.message) {
      errorMsg = error.message
    }
    
    await toast(errorMsg, 'error')
  }
}

const addComment = async () => {
  if (!selectedTask.value || !newComment.value.trim()) return
  
  try {
    await tasksStore.addComment(selectedTask.value._id, newComment.value)
    
    // Actualizar la vista local
    if (!selectedTask.value.comments) {
      selectedTask.value.comments = []
    }
    selectedTask.value.comments.push({
      _id: Date.now().toString(),
      text: newComment.value,
      user: authStore.user,
      createdAt: new Date().toISOString()
    })
    
    newComment.value = ''
    await toast('Comentario añadido', 'success')
  } catch (error) {
    await toast('Error al añadir comentario', 'error')
  }
}

const viewTask = (task: any) => {
  selectedTask.value = task
}

const getPriorityClass = (priority: string) => {
  const classes = {
    low: 'bg-slate-500 text-white border-slate-400/30',
    medium: 'bg-indigo-500 text-white border-indigo-400/30',
    high: 'bg-amber-500 text-white border-amber-400/30',
    urgent: 'bg-rose-500 text-white border-rose-400/30 shadow-sm shadow-rose-500/20'
  }
  return classes[priority as keyof typeof classes] || classes.medium
}

const getTypeIcon = (type: string) => {
  const icons = {
    bug: 'fas fa-bug text-red-400',
    feature: 'fas fa-star text-yellow-400',
    task: 'fas fa-tasks text-blue-400',
    improvement: 'fas fa-arrow-up text-green-400',
    documentation: 'fas fa-book text-purple-400'
  }
  return icons[type as keyof typeof icons] || icons.task
}

const getTypeLabel = (type: string) => {
  const labels = {
    bug: 'Bug',
    feature: 'Feature',
    task: 'Task',
    improvement: 'Improvement',
    documentation: 'Documentation'
  }
  return labels[type as keyof typeof labels] || 'Task'
}

const getClientName = (clientData: any): string => {
  if (!clientData) return 'Interno'
  
  // Si es un objeto cliente con información completa
  if (typeof clientData === 'object' && clientData.name) {
    return clientData.name
  }
  
  // Si es un ID, buscar en la lista de clientes cargados
  if (typeof clientData === 'string') {
    if (loadingClients.value) return 'Cargando...'
    const client = clients.value.find(c => c._id === clientData)
    return client ? client.name : 'Cliente General'
  }
  
  return 'Interno'
}

const formatDate = (dateString: string | Date): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric'
  })
}

// Drag and Drop methods
const onDragStart = (event: DragEvent, activity: ActivityData) => {
  draggedActivity.value = activity
  isDragging.value = true
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', activity._id || '')
  }

  // Añadir clase visual al elemento arrastrado
  if (event.target instanceof HTMLElement) {
    event.target.style.opacity = '0.5'
  }
}

const onDragEnd = (event: DragEvent) => {
  isDragging.value = false
  
  // Restaurar opacidad
  if (event.target instanceof HTMLElement) {
    event.target.style.opacity = '1'
  }
  
  // Limpiar después de un pequeño delay para evitar flickering
  setTimeout(() => {
    draggedActivity.value = null
  }, 100)
}

const onDrop = async (event: DragEvent, newStatus: string) => {
  event.preventDefault()
  
  if (!draggedActivity.value || !draggedActivity.value._id) {
    return
  }

  const activityId = draggedActivity.value._id
  const currentStatus = draggedActivity.value.status

  // No hacer nada si el estado es el mismo
  if (currentStatus === newStatus) {
    return
  }

  try {
    // Si se pasa a completado, forzar 100%
    if (newStatus === 'completed') {
      await activityService.updateProgress(activityId, 100)
    }
    
    // Actualizar en el backend
    await activityService.update(activityId, { status: newStatus })
    
    // Actualizar en el estado local
    const activityIndex = activities.value.findIndex(a => a._id === activityId)
    if (activityIndex !== -1) {
      activities.value[activityIndex].status = newStatus
      if (newStatus === 'completed') {
        activities.value[activityIndex].completionPercentage = 100
      }
    }

    // Mostrar notificación de éxito
    const statusText = newStatus === 'completed' ? 'completada' : 
                      newStatus === 'cancelled' ? 'cancelada' : 'pendiente'
    toast(`Actividad marcada como ${statusText}`, 'success')
    
  } catch (err) {
    showError('Error al mover actividad', err instanceof Error ? err.message : 'Error desconocido')
    // Recargar actividades en caso de error
    await loadActivities()
  }
}

// Lifecycleee
onMounted(async () => {
  // Verificar usuario autenticado
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  console.log('🔐 Token presente:', !!token)
  console.log('👤 Usuario en localStorage:', userStr ? JSON.parse(userStr) : null)
  
  // Cargar datos iniciales
  await Promise.all([
    loadClients(),
    loadTeamMembers(),
    loadActivities(),
    boardsStore.fetchBoards() // Cargar tableros disponibles
  ])
  
  // Crear tablero por defecto si no hay ninguno
  if (boardsStore.myBoards.length === 0) {
    try {
      const defaultBoard = await boardsStore.createBoard({
        name: 'Tablero Principal',
        description: 'Tablero de tareas del equipo',
        type: 'scrum',
        members: []
      })
      selectedBoardId.value = defaultBoard._id
      // Cargar tareas del board recién creado
      await tasksStore.fetchTasks(defaultBoard._id)
      console.log('✅ Board por defecto creado y tareas cargadas')
    } catch (error) {
      console.error('Error creando tablero por defecto:', error)
    }
  } else {
    // Si ya hay tableros, seleccionar el primero y cargar sus tareas
    const firstBoardId = boardsStore.myBoards[0]._id
    selectedBoardId.value = firstBoardId
    // Cargar tareas del board seleccionado
    await tasksStore.fetchTasks(firstBoardId)
    console.log('📋 Board seleccionado y tareas cargadas:', firstBoardId)
  }
  
  // Actualizar estado de actividades vencidas
  await updateOverdueActivities()
  
  // Configurar intervalo para verificar periódicamente las actividades vencidas (cada 5 minutos)
  const checkOverdueInterval = setInterval(updateOverdueActivities, 5 * 60 * 1000)
  
  // Limpiar intervalo cuando el componente se desmonta
  onUnmounted(() => {
    clearInterval(checkOverdueInterval)
  })

  // Cerrar dropdown al hacer click fuera
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showQuickSettings.value = false
    }
    // Cerrar panel de filtros si se hace clic fuera
    if (!target.closest('.relative') || !target.closest('button')) {
      if (!target.closest('[class*="bg-gray-800"]')) {
        showTaskFilters.value = false
      }
    }
  })
})

// Watchers
// Watch para cargar tareas cuando cambia el board seleccionado
watch(() => selectedBoardId.value, async (newBoardId, oldBoardId) => {
  if (newBoardId && newBoardId !== oldBoardId) {
    console.log('📋 Cargando tareas del board:', newBoardId)
    try {
      await tasksStore.fetchTasks(newBoardId)
      console.log('✅ Tareas cargadas:', tasksStore.tasks.length)
    } catch (error) {
      console.error('❌ Error cargando tareas:', error)
    }
  }
}) // Removido immediate: true para evitar doble carga

// Watch para limpiar relaciones jerárquicas cuando cambia el tipo
watch(() => newTask.value.type, (newType, oldType) => {
  if (newType !== oldType) {
    // Limpiar todas las relaciones al cambiar el tipo
    if (newType !== 'feature') {
      newTask.value.epicId = undefined
    }
    if (newType !== 'user-story') {
      newTask.value.featureId = undefined
    }
    if (newType !== 'task') {
      newTask.value.userStoryId = undefined
    }
  }
})

watch(() => props.searchTerm, () => {
  // La búsqueda se maneja en el computed filteredActivities
})

// Cargar filtros guardados cuando el usuario esté disponible
watch(() => authStore.user?._id, (userId) => {
  if (userId) {
    loadSavedFilters()
  }
}, { immediate: true })

// Expose methods for parent component
defineExpose({
  loadActivities,
  loadClients,
  clients
})
</script>

<style scoped>
.space-y-6 {
  /* Ensure no accidental horizontal overflow from inner elements */
  overflow-x: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Ocultar barra horizontal pero mantener scroll táctil */
.hide-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* Personalizar scrollbar para las columnas */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}

/* Estilos para drag and drop */
.cursor-move:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.cursor-move:active {
  transform: scale(0.95);
}

/* Estilo para zona de drop */
.drop-zone-highlight {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.4);
}

/* Efectos visuales para las tarjetas */
.group:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

/* Transiciones suaves */
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
