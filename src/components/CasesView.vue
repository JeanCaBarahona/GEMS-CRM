<template>
  <div class="min-h-screen bg-white font-['Inter',sans-serif] text-slate-900 flex overflow-hidden">
    
    <!-- Notion-Style Sidebar -->
    <aside class="w-64 md:w-72 bg-[#FBFBFA] border-r border-[#EFEFEF] flex flex-col h-screen transition-all duration-300">
      <div class="p-4 flex items-center justify-between">
        <div class="flex items-center gap-2 px-2">
          <div class="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white text-[10px] font-black">W</div>
          <span class="text-sm font-semibold text-slate-700">Workspace</span>
        </div>
        <button @click="openCreateModal" class="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors">
          <i class="fas fa-plus text-xs"></i>
        </button>
      </div>

      <!-- Mode Switcher -->
      <div class="px-4 py-2">
        <div class="flex bg-slate-200/50 p-1 rounded-lg">
          <button 
            @click="viewMode = 'cases'"
            :class="viewMode === 'cases' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            class="flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1.5"
          >
            <i class="fas fa-tasks text-[9px]"></i>
            Casos
          </button>
          <button 
            @click="viewMode = 'wiki'"
            :class="viewMode === 'wiki' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            class="flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1.5"
          >
            <i class="fas fa-book text-[9px]"></i>
            Wiki
          </button>
        </div>
      </div>

      <!-- Árbol / Tabla -->
      <div class="px-4 pb-2">
        <div class="flex bg-slate-200/50 p-1 rounded-lg">
          <button
            @click="listDisplayMode = 'tree'"
            :class="listDisplayMode === 'tree' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            class="flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1.5"
          >
            <i class="fas fa-sitemap text-[9px]"></i>
            Árbol
          </button>
          <button
            @click="listDisplayMode = 'grid'"
            :class="listDisplayMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            class="flex-1 py-1 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1.5"
          >
            <i class="fas fa-table text-[9px]"></i>
            Tabla
          </button>
        </div>
      </div>

      <!-- Search Box -->
      <div class="px-4 py-2">
        <div class="relative group">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]"></i>
          <input 
            v-model="searchTerm"
            placeholder="Buscar..."
            class="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
          />
        </div>
      </div>

      <!-- Tree Structure (Grouped by Category/Client) -->
      <nav class="flex-1 overflow-y-auto px-2 py-4 space-y-1 custom-scrollbar">
        <div v-if="viewMode === 'cases'">
          <div v-for="(group, clientName) in groupedCases" :key="clientName" class="mb-4">
            <button 
              @click="toggleGroup(clientName)"
              class="w-full flex items-center gap-2 px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200/50 rounded-md transition-colors"
            >
              <i :class="expandedGroups.includes(clientName) ? 'fa-chevron-down' : 'fa-chevron-right'" class="fas text-[8px] w-2"></i>
              <i class="fas fa-building text-[10px]"></i>
              <span class="truncate">{{ clientName }}</span>
              <span class="ml-auto text-[10px] opacity-50">{{ group.length }}</span>
            </button>
            <div v-if="expandedGroups.includes(clientName)" class="mt-1 ml-4 space-y-0.5">
              <button 
                v-for="c in group" :key="c._id"
                @click="selectCase(c)"
                :class="selectedCase?._id === c._id ? 'bg-[#EFEFEF] text-slate-900' : 'text-slate-600 hover:bg-slate-200/50'"
                class="w-full text-left px-3 py-1.5 rounded-md text-xs transition-all flex items-center gap-2 group"
              >
                <i class="far fa-file-alt text-[10px] text-slate-400 group-hover:text-primary-500"></i>
                <span class="truncate">{{ c.titulo }}</span>
              </button>
            </div>
          </div>
        </div>

        <div v-else>
          <div v-for="(group, cat) in groupedWiki" :key="cat" class="mb-4">
            <button 
              @click="toggleGroup(cat)"
              class="w-full flex items-center gap-2 px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200/50 rounded-md transition-colors"
            >
              <i :class="expandedGroups.includes(cat) ? 'fa-chevron-down' : 'fa-chevron-right'" class="fas text-[8px] w-2"></i>
              <i :class="getWikiIcon(cat)" class="text-[10px]"></i>
              <span class="capitalize">{{ cat }}</span>
              <span class="ml-auto text-[10px] opacity-50">{{ group.length }}</span>
            </button>
            <div v-if="expandedGroups.includes(cat)" class="mt-1 ml-4 space-y-0.5">
              <button 
                v-for="w in group" :key="w._id"
                @click="selectedWiki = w"
                :class="selectedWiki?._id === w._id ? 'bg-[#EFEFEF] text-slate-900' : 'text-slate-600 hover:bg-slate-200/50'"
                class="w-full text-left px-3 py-1.5 rounded-md text-xs transition-all flex items-center gap-2 group"
              >
                <i class="far fa-file-alt text-[10px] text-slate-400 group-hover:text-primary-500"></i>
                <span class="truncate">{{ w.titulo }}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto relative bg-white custom-scrollbar">

      <!-- Vista de tabla: catálogo completo, ordenable y filtrable -->
      <div v-if="listDisplayMode === 'grid'" class="max-w-6xl mx-auto px-6 md:px-12 py-10 animate-fade-in">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-black text-slate-900">{{ viewMode === 'cases' ? 'Todos los casos' : 'Todos los artículos' }}</h2>
          <span class="text-xs font-bold text-slate-400">{{ viewMode === 'cases' ? casesGridRows.length : wikiGridRows.length }} resultados</span>
        </div>

        <template v-if="viewMode === 'cases'">
          <div class="flex flex-wrap gap-2 mb-4">
            <select v-model="gridFilterEstado" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none">
              <option :value="null">Todos los estados</option>
              <option value="abierto">Abierto</option>
              <option value="en_progreso">En progreso</option>
              <option value="resuelto">Resuelto</option>
              <option value="cerrado">Cerrado</option>
            </select>
            <select v-model="gridFilterPrioridad" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none">
              <option :value="null">Todas las prioridades</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>
          <DataGridTable
            :columns="casesGridColumns"
            :items="casesGridRows"
            :row-key="(c: Case) => c._id!"
            :sort-key="casesSortKey"
            :sort-dir="casesSortDir"
            @sort="toggleCasesSort"
            @row-click="selectCaseFromGrid"
          >
            <template #cell-titulo="{ item }"><span class="font-bold text-slate-800">{{ item.titulo }}</span></template>
            <template #cell-estado="{ item }">
              <span class="inline-flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full" :class="getStatusDot(item.estado)"></span><span class="capitalize text-xs font-medium">{{ item.estado?.replace('_', ' ') }}</span></span>
            </template>
            <template #cell-prioridad="{ item }"><span :class="getPriorityClass(item.prioridad)" class="px-2 py-0.5 rounded-md text-[10px] font-bold capitalize">{{ item.prioridad }}</span></template>
            <template #cell-cliente="{ item }"><span class="text-xs text-slate-600">{{ getClientName(item.cliente_id) }}</span></template>
            <template #cell-updatedAt="{ item }"><span class="text-xs text-slate-400">{{ formatDateRelative(item.updatedAt) }}</span></template>
            <template #empty>No hay casos que coincidan con los filtros.</template>
          </DataGridTable>
        </template>

        <template v-else>
          <div class="flex flex-wrap gap-2 mb-4">
            <select v-model="gridFilterCategoria" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none">
              <option :value="null">Todas las categorías</option>
              <option value="proceso">Proceso</option>
              <option value="codigo">Código</option>
              <option value="manual">Manual</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          <DataGridTable
            :columns="wikiGridColumns"
            :items="wikiGridRows"
            :row-key="(w: WikiArticle) => w._id!"
            :sort-key="wikiSortKey"
            :sort-dir="wikiSortDir"
            @sort="toggleWikiSort"
            @row-click="selectWikiFromGrid"
          >
            <template #cell-titulo="{ item }"><span class="font-bold text-slate-800">{{ item.titulo }}</span></template>
            <template #cell-categoria="{ item }"><span :class="getWikiCatClass(item.categoria)" class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">{{ item.categoria }}</span></template>
            <template #cell-vistas="{ item }"><span class="text-xs text-slate-500">{{ item.vistas || 0 }}</span></template>
            <template #cell-updatedAt="{ item }"><span class="text-xs text-slate-400">{{ formatDateRelative(item.updatedAt) }}</span></template>
            <template #empty>No hay artículos que coincidan con los filtros.</template>
          </DataGridTable>
        </template>
      </div>

      <!-- Cases Detail Mode -->
      <template v-else-if="viewMode === 'cases'">
        <div v-if="selectedCase" class="max-w-4xl mx-auto px-6 md:px-12 py-10 animate-fade-in">
          <!-- Page Cover -->
          <div class="h-40 md:h-52 w-full rounded-2xl mb-8 overflow-hidden relative group no-print">
            <div :class="getCoverGradient(selectedCase.prioridad)" class="absolute inset-0 opacity-80"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <i :class="getCaseIcon(selectedCase.tipo)" class="text-white/20 text-7xl md:text-9xl"></i>
            </div>
            <!-- Actions Overlay -->
            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
              <button @click="exportToPDF" class="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-md">
                <i class="fas fa-file-pdf mr-1"></i> Exportar
              </button>
              <button @click="openEditCase" class="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-md">Editar</button>
              <button @click="deleteCurrentCase" class="px-3 py-1.5 bg-rose-500/90 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-md">Eliminar</button>
            </div>
          </div>

          <!-- Title & Emoji -->
          <div class="mb-10 relative">
            <div class="absolute -top-16 left-0 text-6xl drop-shadow-sm">📂</div>
            <h1 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
              {{ selectedCase.titulo }}
            </h1>
            
            <!-- Metadata Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-slate-100 py-6 no-print">
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</p>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :class="getStatusDot(selectedCase.estado)"></div>
                  <span class="text-xs font-bold text-slate-700 capitalize">{{ selectedCase.estado?.replace('_', ' ') }}</span>
                </div>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prioridad</p>
                <span :class="getPriorityClass(selectedCase.prioridad)" class="px-2 py-0.5 rounded-md text-[10px] font-bold inline-block">
                  {{ selectedCase.prioridad }}
                </span>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</p>
                <div class="flex items-center gap-1.5">
                  <div class="w-4 h-4 rounded bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                    {{ getClientInitials(selectedCase.cliente_id) }}
                  </div>
                  <span class="text-xs font-medium text-slate-700">{{ getClientName(selectedCase.cliente_id) }}</span>
                </div>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actualizado</p>
                <span class="text-xs font-medium text-slate-500">{{ formatDateRelative(selectedCase.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Document Content Tabs -->
          <div class="mb-8 flex gap-6 border-b border-slate-100 no-print">
            <button 
              v-for="tab in tabs" :key="tab.id" 
              @click="activeViewTab = tab.id"
              :class="activeViewTab === tab.id ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'"
              class="pb-2 text-xs font-bold transition-all flex items-center gap-2"
            >
              <i :class="tab.icon" class="text-[10px]"></i>
              {{ tab.label }}
              <span v-if="tab.count" class="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded-full">{{ tab.count }}</span>
            </button>
          </div>

          <!-- Tab Contents -->
          <div class="prose prose-slate max-w-none">
            <!-- Wiki Section -->
            <div v-if="activeViewTab === 'wiki'" class="animate-content-in">
              <div v-if="isEditingWiki" class="space-y-4">
                <WikiEditor
                  v-model="selectedCase.wikiContent"
                  placeholder="Escribe la documentación del caso aquí..."
                />
                <div class="flex justify-end gap-3">
                  <button @click="isEditingWiki = false" class="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
                  <button @click="saveWiki" class="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-lg hover:bg-slate-800 transition-all">Guardar cambios</button>
                </div>
              </div>
              <div v-else class="group relative">
                <WikiContent
                  v-if="selectedCase.wikiContent"
                  :content="selectedCase.wikiContent"
                />
                <div v-else @click="isEditingWiki = true" class="py-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300 hover:border-primary-200 hover:text-primary-300 transition-all cursor-pointer">
                  <i class="fas fa-feather-alt text-3xl mb-4"></i>
                  <p class="text-sm font-bold uppercase tracking-widest">Documentar este caso</p>
                </div>
                <button 
                  v-if="selectedCase.wikiContent"
                  @click="isEditingWiki = true" 
                  class="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-primary-600 transition-all"
                >
                  <i class="fas fa-edit"></i>
                </button>
              </div>
            </div>

            <!-- Daily Logs -->
            <div v-if="activeViewTab === 'dailies'" class="animate-content-in space-y-8">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest m-0">Registro de Actividad</h3>
                <button @click="showAddDailyLog = true" class="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-md hover:shadow-lg transition-all">Nueva Entrada</button>
              </div>
              <div class="space-y-6 relative pl-6 border-l border-slate-100">
                <div v-for="log in sortedDailyLogs" :key="log._id" class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative group hover:shadow-md transition-all">
                  <div class="absolute -left-[31px] top-6 w-2.5 h-2.5 bg-white rounded-full border-2 border-slate-200 group-hover:border-primary-500 transition-colors"></div>
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <span class="text-lg">{{ log.sentimiento }}</span>
                      <span class="text-[10px] font-bold text-slate-400">{{ formatDateRelative(log.fecha) }}</span>
                    </div>
                  </div>
                  <p class="text-sm text-slate-700 font-medium m-0 leading-relaxed">{{ log.que_se_hizo }}</p>
                </div>
              </div>
            </div>

            <!-- Files -->
            <div v-if="activeViewTab === 'files'" class="animate-content-in space-y-6">
               <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest m-0">Documentos Adjuntos</h3>
               <FileDropzone label="Subir archivos al caso" @files-selected="uploadFilesToCase" />
               <div v-if="selectedCase.archivos?.length" class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div v-for="(file, idx) in selectedCase.archivos" :key="idx" class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                    <div class="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:border-primary-200">
                      <i :class="getFileIcon(file.nombre)" class="text-lg text-slate-400 group-hover:text-primary-500"></i>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-bold text-slate-800 truncate m-0">{{ file.nombre }}</p>
                      <a :href="file.url" target="_blank" download class="text-[9px] text-slate-400 font-medium m-0 no-underline hover:text-primary-600 uppercase tracking-tighter">Descargar</a>
                    </div>
                  </div>
               </div>

               <!-- Enlaces externos -->
               <div class="pt-4 border-t border-slate-100 space-y-3">
                 <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest m-0">Enlaces externos</h4>
                 <div class="flex gap-2">
                   <input v-model="newLinkName" placeholder="Nombre (ej: Manual en Drive)" class="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:bg-white" />
                   <input v-model="newLinkUrl" placeholder="https://..." class="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:bg-white" />
                   <button @click="addLinkToCase" :disabled="!newLinkName || !newLinkUrl" class="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed">Agregar</button>
                 </div>
                 <div v-if="selectedCase.enlacesExternos?.length" class="space-y-2">
                   <div v-for="link in selectedCase.enlacesExternos" :key="link._id" class="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                     <a :href="link.url" target="_blank" class="text-xs font-bold text-primary-600 hover:underline truncate mr-2"><i class="fas fa-external-link-alt mr-1.5 text-[10px]"></i>{{ link.nombre }}</a>
                     <button @click="removeLinkFromCase(link._id!)" class="text-slate-300 hover:text-rose-500 transition-colors flex-shrink-0"><i class="fas fa-times-circle text-xs"></i></button>
                   </div>
                 </div>
               </div>
            </div>

            <!-- Linked Items Section (tickets + tareas + actividades) -->
            <div v-if="activeViewTab === 'links'" class="animate-content-in space-y-8">
              <div>
                <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><i class="fas fa-ticket-alt text-slate-300"></i>Tickets</h3>
                <LinkedItemsSelector
                  :model-value="linkedTicketIds"
                  :items="ticketLinkItems"
                  :loading="loadingLinkCatalog.tickets"
                  icon="fas fa-ticket-alt"
                  placeholder="Buscar ticket..."
                  empty-label="No hay tickets disponibles"
                  @update:model-value="(ids) => onToggleLinked('tickets', ids)"
                />
              </div>
              <div>
                <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><i class="fas fa-list-check text-slate-300"></i>Tareas</h3>
                <LinkedItemsSelector
                  :model-value="linkedTaskIds"
                  :items="taskLinkItems"
                  :loading="loadingLinkCatalog.tasks"
                  icon="fas fa-list-check"
                  placeholder="Buscar tarea..."
                  empty-label="No hay tareas disponibles"
                  @update:model-value="(ids) => onToggleLinked('tasks', ids)"
                />
              </div>
              <div>
                <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><i class="fas fa-calendar-check text-slate-300"></i>Actividades</h3>
                <LinkedItemsSelector
                  :model-value="linkedActivityIds"
                  :items="activityLinkItems"
                  :loading="loadingLinkCatalog.activities"
                  icon="fas fa-calendar-check"
                  placeholder="Buscar actividad..."
                  empty-label="No hay actividades disponibles"
                  @update:model-value="(ids) => onToggleLinked('activities', ids)"
                />
              </div>
            </div>

            <!-- Hoja de cálculo -->
            <div v-if="activeViewTab === 'spreadsheet'" class="animate-content-in">
              <EmbeddedSpreadsheet
                v-if="selectedCase._id"
                :key="selectedCase._id"
                entity-type="cases"
                :entity-id="selectedCase._id"
                :active="activeViewTab === 'spreadsheet'"
              />
            </div>
          </div>
        </div>

        <!-- Empty State Cases -->
        <div v-else class="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
          <div class="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
            <i class="fas fa-folder-open text-5xl"></i>
          </div>
          <h3 class="text-xl font-black text-slate-900 mb-2">Selecciona un Proyecto</h3>
          <p class="text-sm text-slate-500 max-w-sm">Explora la lista lateral para ver el progreso y la documentación de cada caso operativo.</p>
        </div>
      </template>

      <!-- Wiki Detail Mode -->
      <template v-else>
        <div v-if="selectedWiki" class="max-w-4xl mx-auto px-6 md:px-12 py-10 animate-fade-in no-print">
          
          <!-- Page Header (Minimalist Notion Style) -->
          <div class="group relative mb-12">
            <!-- Icon/Emoji Placeholder -->
            <div class="text-6xl mb-6 select-none cursor-default">📖</div>
            
            <template v-if="isEditingWikiItem">
              <input 
                v-model="selectedWiki.titulo" 
                class="w-full text-4xl font-black text-slate-900 border-none outline-none focus:ring-0 placeholder-slate-200 bg-transparent mb-4" 
                placeholder="Sin título"
              />
              <textarea 
                v-model="selectedWiki.descripcion" 
                rows="2" 
                class="w-full text-lg text-slate-400 border-none outline-none focus:ring-0 placeholder-slate-200 bg-transparent resize-none font-medium mb-8" 
                placeholder="Añade una descripción..."
              ></textarea>
            </template>
            <template v-else>
              <h1 class="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">{{ selectedWiki.titulo || 'Sin título' }}</h1>
              <p class="text-lg text-slate-400 font-medium leading-relaxed">{{ selectedWiki.descripcion || 'Sin descripción' }}</p>
            </template>

            <!-- Metadata Grid Wiki (Clean) -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-slate-100 my-8">
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Categoría</p>
                <div v-if="isEditingWikiItem">
                  <select v-model="selectedWiki.categoria" class="bg-slate-50 border-none text-xs font-bold rounded px-2 py-1 outline-none text-slate-600">
                    <option value="proceso">Proceso</option>
                    <option value="codigo">Código</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <span v-else :class="getWikiCatClass(selectedWiki.categoria)" class="px-2 py-0.5 rounded-md text-[10px] font-bold inline-block uppercase">
                  {{ selectedWiki.categoria }}
                </span>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Lectura</p>
                <div class="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                  <i class="fas fa-eye text-slate-200"></i>
                  {{ selectedWiki.vistas || 0 }} vistas
                </div>
              </div>
              <div class="space-y-1 text-right">
                <div class="flex gap-2 justify-end">
                  <button v-if="!isEditingWikiItem" @click="isEditingWikiItem = true" class="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
                    <i class="fas fa-edit"></i>
                    Editar
                  </button>
                  <button v-if="!isEditingWikiItem" @click="exportToPDF" class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-all" title="Exportar PDF"><i class="fas fa-file-pdf"></i></button>
                  <button v-if="!isEditingWikiItem" @click="deleteWikiItem" class="p-1.5 hover:bg-rose-50 text-rose-300 rounded-lg transition-all" title="Eliminar"><i class="fas fa-trash"></i></button>
                </div>
              </div>
            </div>
          </div>

          <!-- Content Section -->
          <div class="prose prose-slate max-w-none min-h-[400px]">
            <template v-if="isEditingWikiItem">
              <div class="space-y-4">
                <WikiEditor
                  v-model="selectedWiki.contenido"
                  placeholder="Comienza a escribir tu documentación..."
                />
                <div class="flex justify-end gap-3 pt-2">
                  <label class="mr-auto cursor-pointer px-4 py-2 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg hover:bg-slate-200 transition-all flex items-center gap-2">
                    <i class="fas fa-paperclip"></i>
                    Adjuntar archivos
                    <input type="file" multiple class="hidden" @change="(e: any) => selectedWiki!.archivos = [...(selectedWiki!.archivos || []), ...Array.from(e.target.files)]">
                  </label>
                  <button @click="isEditingWikiItem = false" class="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-900">Cancelar</button>
                  <button @click="handleUpdateWiki" class="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all">Guardar página</button>
                </div>
              </div>
            </template>
            <template v-else>
              <div v-if="selectedWiki.categoria === 'codigo' && !isHtmlContent(selectedWiki.contenido)" class="relative">
                <div class="bg-[#F8F9FA] rounded-2xl p-8 border border-slate-100 overflow-x-auto">
                  <pre class="font-mono text-xs leading-relaxed text-slate-700 m-0">{{ selectedWiki.contenido }}</pre>
                </div>
              </div>
              <WikiContent v-else :content="selectedWiki.contenido" />
              
              <!-- Attached Files Section -->
              <div v-if="selectedWiki.archivos && selectedWiki.archivos.length > 0" class="mt-12 pt-8 border-t border-slate-100">
                <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Archivos Adjuntos</p>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <a v-for="(file, idx) in selectedWiki.archivos" :key="idx" 
                     :href="file.url" 
                     target="_blank" 
                     download
                     class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3 hover:bg-white hover:shadow-md transition-all cursor-pointer no-underline group"
                  >
                    <div class="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:border-primary-200">
                      <i :class="getFileIcon(file.nombre)" class="text-lg text-slate-400 group-hover:text-primary-500"></i>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-bold text-slate-800 truncate m-0">{{ file.nombre }}</p>
                      <p class="text-[9px] text-slate-400 font-medium m-0 uppercase tracking-tighter">Descargar</p>
                    </div>
                  </a>
                </div>
              </div>

              <!-- Wiki: Enlaces externos + Adjuntos rápidos -->
              <div v-if="!isEditingWikiItem" class="mt-12 pt-8 border-t border-slate-100 space-y-3">
                <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Enlaces externos</p>
                <div class="flex gap-2">
                  <input v-model="newLinkName" placeholder="Nombre (ej: Manual en Drive)" class="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:bg-white" />
                  <input v-model="newLinkUrl" placeholder="https://..." class="flex-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:bg-white" />
                  <button @click="addLinkToWiki" :disabled="!newLinkName || !newLinkUrl" class="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed">Agregar</button>
                </div>
                <div v-if="selectedWiki.enlacesExternos?.length" class="space-y-2">
                  <div v-for="link in selectedWiki.enlacesExternos" :key="link._id" class="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <a :href="link.url" target="_blank" class="text-xs font-bold text-primary-600 hover:underline truncate mr-2"><i class="fas fa-external-link-alt mr-1.5 text-[10px]"></i>{{ link.nombre }}</a>
                    <button @click="removeLinkFromWiki(link._id!)" class="text-slate-300 hover:text-rose-500 transition-colors flex-shrink-0"><i class="fas fa-times-circle text-xs"></i></button>
                  </div>
                </div>
              </div>

              <!-- Wiki: Vinculados (tickets + tareas + actividades) -->
              <div v-if="!isEditingWikiItem" class="mt-12 pt-8 border-t border-slate-100 space-y-8">
                <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Vinculados</p>
                <div>
                  <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><i class="fas fa-ticket-alt text-slate-300"></i>Tickets</h3>
                  <LinkedItemsSelector
                    :model-value="linkedTicketIds"
                    :items="ticketLinkItems"
                    :loading="loadingLinkCatalog.tickets"
                    icon="fas fa-ticket-alt"
                    placeholder="Buscar ticket..."
                    empty-label="No hay tickets disponibles"
                    @update:model-value="(ids) => onToggleLinked('tickets', ids)"
                  />
                </div>
                <div>
                  <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><i class="fas fa-list-check text-slate-300"></i>Tareas</h3>
                  <LinkedItemsSelector
                    :model-value="linkedTaskIds"
                    :items="taskLinkItems"
                    :loading="loadingLinkCatalog.tasks"
                    icon="fas fa-list-check"
                    placeholder="Buscar tarea..."
                    empty-label="No hay tareas disponibles"
                    @update:model-value="(ids) => onToggleLinked('tasks', ids)"
                  />
                </div>
                <div>
                  <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><i class="fas fa-calendar-check text-slate-300"></i>Actividades</h3>
                  <LinkedItemsSelector
                    :model-value="linkedActivityIds"
                    :items="activityLinkItems"
                    :loading="loadingLinkCatalog.activities"
                    icon="fas fa-calendar-check"
                    placeholder="Buscar actividad..."
                    empty-label="No hay actividades disponibles"
                    @update:model-value="(ids) => onToggleLinked('activities', ids)"
                  />
                </div>
              </div>

              <!-- Wiki: Hoja de cálculo (sección plegable, no se monta hasta abrirla) -->
              <div v-if="!isEditingWikiItem" class="mt-12 pt-8 border-t border-slate-100">
                <button @click="showWikiSpreadsheet = !showWikiSpreadsheet" class="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors">
                  <i class="fas fa-table"></i> Hoja de cálculo
                  <i :class="showWikiSpreadsheet ? 'fa-chevron-up' : 'fa-chevron-down'" class="fas text-[8px]"></i>
                </button>
                <div v-if="showWikiSpreadsheet" class="mt-4">
                  <EmbeddedSpreadsheet
                    v-if="selectedWiki._id"
                    :key="selectedWiki._id"
                    entity-type="wiki"
                    :entity-id="selectedWiki._id"
                    :active="showWikiSpreadsheet"
                  />
                </div>
              </div>

              <!-- Placeholder for empty content -->
              <div v-if="!selectedWiki.contenido" @click="isEditingWikiItem = true" class="py-20 border-2 border-dashed border-slate-50 rounded-3xl flex flex-col items-center justify-center text-slate-200 hover:border-slate-100 hover:text-slate-300 transition-all cursor-pointer">
                <p class="text-xs font-bold uppercase tracking-widest">Esta página está vacía. Pulsa para editar.</p>
              </div>
            </template>

          </div>
        </div>

        <!-- Empty State Wiki -->
        <div v-else class="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
          <div class="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
            <i class="fas fa-brain text-5xl"></i>
          </div>
          <h3 class="text-xl font-black text-slate-900 mb-2">Base de Conocimiento</h3>
          <p class="text-sm text-slate-500 max-w-sm">Documenta procesos, snippets de código y manuales para estandarizar la operación del equipo.</p>
          <button @click="openCreateWiki" class="mt-8 px-6 py-2.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-primary-600 transition-all shadow-lg">Empezar a Documentar</button>
        </div>
      </template>

    </main>

    <!-- Notion-Style Modals -->
    <div v-if="showCreateModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
       <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" @click="showCreateModal = false"></div>
       <div class="relative bg-white w-full max-w-2xl rounded-[1.5rem] shadow-2xl p-0 animate-scale-up border border-slate-200 overflow-hidden">
          
          <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-[#FBFBFA]">
            <div>
              <h3 class="text-lg font-bold text-slate-900 leading-none mb-1">
                {{ modalMode === 'create' ? (viewMode === 'cases' ? 'Nuevo Proyecto' : 'Nuevo Artículo') : (viewMode === 'cases' ? 'Editar Proyecto' : 'Editar Artículo') }}
              </h3>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {{ modalMode === 'create' ? 'Crear nueva página en' : 'Actualizar página en' }} {{ viewMode }}
              </p>
            </div>
            <button @click="showCreateModal = false" class="w-8 h-8 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 transition-colors"><i class="fas fa-times"></i></button>
          </div>
          
          <div class="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
             <template v-if="viewMode === 'cases'">
                <div class="space-y-4">
                  <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Título de la Página</label>
                    <input v-model="newCase.titulo" placeholder="Ej: Implementación API v2" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/10 transition-all">
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cliente</label>
                      <select v-model="newCase.cliente_id" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none">
                        <option value="">Seleccionar cliente...</option>
                        <option v-for="c in clients" :key="c._id" :value="c._id">{{ c.name }}</option>
                      </select>
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Categoría</label>
                      <input v-model="newCase.categoria" placeholder="Ej: Backend, Legal..." class="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none">
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Prioridad</label>
                      <div class="flex gap-1 p-1 bg-slate-50 rounded-xl">
                        <button v-for="p in ['baja', 'media', 'alta', 'critica']" :key="p" @click="newCase.prioridad = p" :class="newCase.prioridad === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'" class="flex-1 py-2 text-[8px] font-black uppercase rounded-lg transition-all">{{ p }}</button>
                      </div>
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tipo</label>
                      <div class="flex gap-1 p-1 bg-slate-50 rounded-xl">
                        <button v-for="t in ['seguimiento', 'incidencia', 'documento']" :key="t" @click="newCase.tipo = t" :class="newCase.tipo === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'" class="flex-1 py-2 text-[8px] font-black uppercase rounded-lg transition-all">{{ t }}</button>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Descripción Breve</label>
                    <textarea v-model="newCase.descripcion" rows="3" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:bg-white"></textarea>
                  </div>

                  <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Adjuntos (Opcional)</label>
                    <FileDropzone
                      :label="newCase.archivos?.length ? `${newCase.archivos.length} seleccionados` : 'Subir archivos'"
                      @files-selected="(files) => newCase.archivos = [...(newCase.archivos || []), ...files]"
                    />
                  </div>
                </div>
             </template>

             <template v-else>
                <div class="space-y-4">
                  <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Título (síntoma exacto o pregunta del usuario)</label>
                    <input v-model="newWiki.titulo" placeholder="Ej: 'No puedo iniciar sesión - error 401'" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white">
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Categoría</label>
                      <select v-model="newWiki.categoria" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none">
                        <option value="proceso">Proceso Estándar</option>
                        <option value="codigo">Snippet de Código</option>
                        <option value="manual">Manual de Usuario</option>
                      </select>
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tags (palabras clave para búsqueda)</label>
                      <input v-model="wikiTagsRaw" placeholder="login, 401, credenciales, autenticacion" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none">
                    </div>
                  </div>

                  <!-- Warning de duplicados -->
                  <div v-if="wikiDuplicates.length > 0" class="rounded-xl border-2 border-amber-200 bg-amber-50 p-3 animate-fade-in">
                    <div class="flex items-start gap-2 mb-2">
                      <i class="fas fa-triangle-exclamation text-amber-600 mt-0.5"></i>
                      <div class="flex-1">
                        <p class="text-[11px] font-black text-amber-900">Posibles artículos similares</p>
                        <p class="text-[10px] text-amber-700 font-medium">Antes de crear, revisa si ya existe documentación sobre esto:</p>
                      </div>
                    </div>
                    <div class="space-y-1.5 pl-6">
                      <button
                        v-for="dup in wikiDuplicates"
                        :key="dup._id"
                        type="button"
                        @click="openDuplicate(dup)"
                        class="w-full text-left bg-white hover:bg-amber-100/50 border border-amber-200 rounded-lg px-3 py-2 transition-all"
                      >
                        <p class="text-[11px] font-black text-slate-800 truncate">{{ dup.titulo }}</p>
                        <p v-if="dup.tags?.length" class="text-[9px] text-slate-500 font-bold mt-0.5">
                          <span v-for="t in dup.tags.slice(0, 4)" :key="t" class="inline-block mr-1.5">#{{ t }}</span>
                        </p>
                      </button>
                    </div>
                  </div>

                  <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Resumen Ejecutivo</label>
                    <input v-model="newWiki.descripcion" placeholder="¿De qué trata este artículo? (1 línea)" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none">
                  </div>

                  <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Adjuntos (Opcional)</label>
                    <FileDropzone
                      :label="newWiki.archivos?.length ? `${newWiki.archivos.length} seleccionados` : 'Subir documentos'"
                      @files-selected="(files) => newWiki.archivos = [...(newWiki.archivos || []), ...files]"
                    />
                  </div>

                  <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Contenido</label>
                    <WikiEditor
                      v-model="newWiki.contenido"
                      placeholder="Comienza a escribir tu documentación..."
                    />
                  </div>
                </div>
             </template>
          </div>

          <div class="p-6 bg-[#FBFBFA] border-t border-slate-100 flex gap-4">
             <button @click="showCreateModal = false" class="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-200/50 rounded-xl transition-all">Cerrar</button>
             <button 
               @click="modalMode === 'create' ? (viewMode === 'cases' ? handleCreateCase() : handleCreateWiki()) : (viewMode === 'cases' ? handleUpdateCase() : handleUpdateWiki())" 
               class="flex-1 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
             >
               {{ modalMode === 'create' ? 'Publicar Página' : 'Guardar Cambios' }}
             </button>
          </div>
       </div>
    </div>

    <!-- Modal Log Diario (Notion Style) -->
    <div v-if="showAddDailyLog" class="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
       <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" @click="showAddDailyLog = false"></div>
       <div class="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6 animate-scale-up border border-slate-100">
          <div class="text-center">
            <h3 class="text-lg font-bold text-slate-900 mb-1">Nueva Bitácora</h3>
            <p class="text-xs text-slate-400">¿Qué has logrado hoy?</p>
          </div>
          <div class="space-y-4">
             <div class="space-y-1">
               <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Actividad</label>
               <textarea v-model="newLog.que_se_hizo" rows="3" class="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:bg-white transition-all" placeholder="Describe brevemente..."></textarea>
             </div>
             <div class="flex justify-between items-center gap-2 p-2 bg-slate-50 rounded-xl">
               <button v-for="s in ['😊', '😐', '😟', '🔥']" :key="s" @click="newLog.sentimiento = s" :class="newLog.sentimiento === s ? 'bg-white shadow-sm scale-110' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'" class="flex-1 py-2 text-2xl transition-all rounded-lg">{{ s }}</button>
             </div>
          </div>
          <div class="flex gap-3 pt-2">
            <button @click="showAddDailyLog = false" class="flex-1 py-3 text-xs font-bold text-slate-400 hover:bg-slate-50 rounded-xl">Cancelar</button>
            <button @click="handleAddDailyLog" class="flex-1 py-3 bg-primary-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-700">Registrar Actividad</button>
          </div>
       </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { casesService, type Case } from '../services/casesService'
import { clientService, type ClientData } from '../services/clientService'
import { wikiService, type WikiArticle, type WikiArticleInput } from '../services/wikiService'
import { useNotifications } from '../composables/useNotifications'
import { useAuthStore } from '../stores/auth'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import WikiEditor from './wiki/WikiEditor.vue'
import WikiContent from './wiki/WikiContent.vue'
import FileDropzone from './ui/FileDropzone.vue'
import LinkedItemsSelector from './forms/LinkedItemsSelector.vue'
import EmbeddedSpreadsheet from './EmbeddedSpreadsheet.vue'
import DataGridTable, { type DataGridColumn } from './ui/DataGridTable.vue'
import { useSortableFilterableList } from '../composables/useSortableFilterableList'

const { showSuccess, showError, showLoading, closeLoading, confirmDelete } = useNotifications()
const authStore = useAuthStore()

// View State
const viewMode = ref<'cases' | 'wiki'>('cases')
const searchTerm = ref('')
const expandedGroups = ref<string[]>([])
/** 'tree' = árbol lateral de siempre. 'grid' = tabla ordenable/filtrable de todo el catálogo. */
const listDisplayMode = ref<'tree' | 'grid'>('tree')
const gridFilterEstado = ref<string | null>(null)
const gridFilterPrioridad = ref<string | null>(null)
const gridFilterCategoria = ref<string | null>(null)

// Data State
const cases = ref<Case[]>([])
const clients = ref<ClientData[]>([])
const wikiArticles = ref<WikiArticle[]>([])
const selectedCase = ref<Case | null>(null)
const selectedWiki = ref<WikiArticle | null>(null)

// UI State
const activeViewTab = ref<'wiki' | 'dailies' | 'files' | 'links' | 'spreadsheet'>('wiki')
const isEditingWiki = ref(false)
const isEditingWikiItem = ref(false)
const showCreateModal = ref(false)
const showAddDailyLog = ref(false)
const wikiTagsRaw = ref('')
const modalMode = ref<'create' | 'edit'>('create')

import { ticketService } from '../services/ticketService'
import { useTasksStore } from '../stores/tasks'
import { activityService } from '../services/activityService'

// Form State
const newCase = ref({ titulo: '', tipo: 'seguimiento' as any, prioridad: 'media' as any, descripcion: '', cliente_id: '', categoria: '', tags: [] as string[], archivos: [] as File[] })
const newWiki = ref<WikiArticleInput>({ titulo: '', categoria: 'proceso', contenido: '', descripcion: '', tags: [], archivos: [] })
const newLog = ref({ que_se_hizo: '', sentimiento: '😐' as any })

// Enlaces externos
const newLinkName = ref('')
const newLinkUrl = ref('')

// Hoja de cálculo (Wiki — sección plegable, se monta solo al abrirla)
const showWikiSpreadsheet = ref(false)

// Vinculación múltiple (tickets / tareas / actividades)
const tasksStore = useTasksStore()
const loadingLinkCatalog = ref({ tickets: false, tasks: false, activities: false })
const ticketCatalog = ref<any[]>([])
const taskCatalog = ref<any[]>([])
const activityCatalog = ref<any[]>([])
const linkCatalogLoaded = ref(false)

const loadLinkCatalogs = async () => {
  if (linkCatalogLoaded.value) return
  linkCatalogLoaded.value = true
  loadingLinkCatalog.value = { tickets: true, tasks: true, activities: true }
  try {
    const [ticketsRes] = await Promise.all([ticketService.getAll({ limit: 100 })])
    ticketCatalog.value = ticketsRes.data || []
  } catch (err) { console.error('Error cargando tickets:', err) }
  finally { loadingLinkCatalog.value.tickets = false }

  try {
    await tasksStore.fetchTasks()
    taskCatalog.value = tasksStore.tasks
  } catch (err) { console.error('Error cargando tareas:', err) }
  finally { loadingLinkCatalog.value.tasks = false }

  try {
    activityCatalog.value = await activityService.getAll()
  } catch (err) { console.error('Error cargando actividades:', err) }
  finally { loadingLinkCatalog.value.activities = false }
}

const currentLinkedEntity = computed(() => (viewMode.value === 'cases' ? selectedCase.value : selectedWiki.value))

const linkedTicketIds = computed(() => (currentLinkedEntity.value?.linkedTickets || []).map((t: any) => t._id || t))
const linkedTaskIds = computed(() => (currentLinkedEntity.value?.linkedTasks || []).map((t: any) => t._id || t))
const linkedActivityIds = computed(() => (currentLinkedEntity.value?.linkedActivities || []).map((a: any) => a._id || a))

const ticketLinkItems = computed(() => ticketCatalog.value.map((t: any) => ({
  _id: t._id,
  label: t.subject || t.titulo || 'Sin asunto',
  sublabel: `#${t.ticketNumber || t._id.slice(-6).toUpperCase()} · ${t.status || ''}`
})))
const taskLinkItems = computed(() => taskCatalog.value.map((t: any) => ({
  _id: t._id,
  label: t.title,
  sublabel: t.boardStatus || t.status || ''
})))
const activityLinkItems = computed(() => activityCatalog.value.map((a: any) => ({
  _id: a._id,
  label: a.title,
  sublabel: a.status || ''
})))

/** Compara el array de ids nuevo contra el actual y llama al endpoint de link/unlink
 *  por cada diferencia — LinkedItemsSelector emite la lista completa, no un toggle. */
const onToggleLinked = async (type: 'tickets' | 'tasks' | 'activities', newIds: string[]) => {
  const entity = currentLinkedEntity.value
  if (!entity?._id) return
  const currentIds = type === 'tickets' ? linkedTicketIds.value : type === 'tasks' ? linkedTaskIds.value : linkedActivityIds.value
  const added = newIds.filter(id => !currentIds.includes(id))
  const removed = currentIds.filter((id: string) => !newIds.includes(id))
  if (!added.length && !removed.length) return

  const svc = viewMode.value === 'cases' ? casesService : wikiService
  // Envueltos en closures para preservar el `this` del servicio — svc.linkTicket
  // como referencia suelta pierde el binding y rompe `this.apiUrl` internamente.
  const linkFn = (id: string) => type === 'tickets' ? svc.linkTicket(entity._id!, id) : type === 'tasks' ? svc.linkTask(entity._id!, id) : svc.linkActivity(entity._id!, id)
  const unlinkFn = (id: string) => type === 'tickets' ? svc.unlinkTicket(entity._id!, id) : type === 'tasks' ? svc.unlinkTask(entity._id!, id) : svc.unlinkActivity(entity._id!, id)

  try {
    let updated: any = entity
    for (const id of added) updated = await linkFn(id)
    for (const id of removed) updated = await unlinkFn(id)

    if (viewMode.value === 'cases') {
      selectedCase.value = updated
      const idx = cases.value.findIndex(c => c._id === updated._id)
      if (idx !== -1) cases.value[idx] = updated
    } else {
      selectedWiki.value = updated
      const idx = wikiArticles.value.findIndex(w => w._id === updated._id)
      if (idx !== -1) wikiArticles.value[idx] = updated
    }
  } catch (err: any) {
    showError('Error', err.message || 'No se pudo actualizar el vínculo')
  }
}

// Enlaces externos
const addLinkToCase = async () => {
  if (!selectedCase.value?._id || !newLinkName.value || !newLinkUrl.value) return
  try {
    const link = await casesService.addExternalLink(selectedCase.value._id, { nombre: newLinkName.value, url: newLinkUrl.value })
    selectedCase.value.enlacesExternos = [...(selectedCase.value.enlacesExternos || []), link]
    newLinkName.value = ''; newLinkUrl.value = ''
  } catch (err: any) { showError('Error', err.message) }
}
const removeLinkFromCase = async (linkId: string) => {
  if (!selectedCase.value?._id) return
  try {
    await casesService.removeExternalLink(selectedCase.value._id, linkId)
    selectedCase.value.enlacesExternos = (selectedCase.value.enlacesExternos || []).filter(l => l._id !== linkId)
  } catch (err: any) { showError('Error', err.message) }
}
const addLinkToWiki = async () => {
  if (!selectedWiki.value?._id || !newLinkName.value || !newLinkUrl.value) return
  try {
    const link = await wikiService.addExternalLink(selectedWiki.value._id, { nombre: newLinkName.value, url: newLinkUrl.value })
    selectedWiki.value.enlacesExternos = [...(selectedWiki.value.enlacesExternos || []), link]
    newLinkName.value = ''; newLinkUrl.value = ''
  } catch (err: any) { showError('Error', err.message) }
}
const removeLinkFromWiki = async (linkId: string) => {
  if (!selectedWiki.value?._id) return
  try {
    await wikiService.removeExternalLink(selectedWiki.value._id, linkId)
    selectedWiki.value.enlacesExternos = (selectedWiki.value.enlacesExternos || []).filter(l => l._id !== linkId)
  } catch (err: any) { showError('Error', err.message) }
}

// Grouping Logic
const groupedCases = computed(() => {
  const result: Record<string, Case[]> = {}
  const filtered = cases.value.filter(c => 
    !searchTerm.value || 
    c.titulo.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    c.categoria?.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
  
  filtered.forEach(c => {
    const clientName = getClientName(c.cliente_id)
    if (!result[clientName]) result[clientName] = []
    result[clientName].push(c)
  })
  return result
})

const groupedWiki = computed(() => {
  const result: Record<string, WikiArticle[]> = {}
  const filtered = wikiArticles.value.filter(w => 
    !searchTerm.value || 
    w.titulo.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    w.descripcion?.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
  
  filtered.forEach(w => {
    const cat = w.categoria || 'otros'
    if (!result[cat]) result[cat] = []
    result[cat].push(w)
  })
  return result
})

// ── Vista de tabla (grid ordenable/filtrable) — adicional al árbol, no lo reemplaza ──
const estadoFilterFn = computed(() => (gridFilterEstado.value ? (c: Case) => c.estado === gridFilterEstado.value : null))
const prioridadFilterFn = computed(() => (gridFilterPrioridad.value ? (c: Case) => c.prioridad === gridFilterPrioridad.value : null))
const categoriaFilterFn = computed(() => (gridFilterCategoria.value ? (w: WikiArticle) => w.categoria === gridFilterCategoria.value : null))

const {
  sortKey: casesSortKey, sortDir: casesSortDir, toggleSort: toggleCasesSort, filteredSorted: casesGridRows
} = useSortableFilterableList(cases, {
  filters: { estado: estadoFilterFn, prioridad: prioridadFilterFn },
  sortAccessors: {
    titulo: (c: Case) => c.titulo,
    estado: (c: Case) => c.estado,
    prioridad: (c: Case) => c.prioridad,
    cliente: (c: Case) => getClientName(c.cliente_id),
    updatedAt: (c: Case) => new Date(c.updatedAt)
  },
  defaultSortKey: 'updatedAt',
  defaultSortDir: 'desc'
})

const {
  sortKey: wikiSortKey, sortDir: wikiSortDir, toggleSort: toggleWikiSort, filteredSorted: wikiGridRows
} = useSortableFilterableList(wikiArticles, {
  filters: { categoria: categoriaFilterFn },
  sortAccessors: {
    titulo: (w: WikiArticle) => w.titulo,
    categoria: (w: WikiArticle) => w.categoria,
    vistas: (w: WikiArticle) => w.vistas || 0,
    updatedAt: (w: WikiArticle) => (w.updatedAt ? new Date(w.updatedAt) : null)
  },
  defaultSortKey: 'updatedAt',
  defaultSortDir: 'desc'
})

const casesGridColumns: DataGridColumn[] = [
  { key: 'titulo', label: 'Título' },
  { key: 'estado', label: 'Estado' },
  { key: 'prioridad', label: 'Prioridad' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'updatedAt', label: 'Actualizado' }
]

const wikiGridColumns: DataGridColumn[] = [
  { key: 'titulo', label: 'Título' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'vistas', label: 'Vistas', align: 'right' },
  { key: 'updatedAt', label: 'Actualizado' }
]

const selectCaseFromGrid = (c: Case) => {
  selectCase(c)
  listDisplayMode.value = 'tree'
}
const selectWikiFromGrid = (w: WikiArticle) => {
  selectedWiki.value = w
  listDisplayMode.value = 'tree'
}

const tabs = computed(() => [
  { id: 'wiki', label: 'Documentación', icon: 'fas fa-book-open' },
  {
    id: 'links', label: 'Vinculados', icon: 'fas fa-link',
    count: (selectedCase.value?.linkedTickets?.length || 0) + (selectedCase.value?.linkedTasks?.length || 0) + (selectedCase.value?.linkedActivities?.length || 0)
  },
  { id: 'dailies', label: 'Actividad', icon: 'fas fa-history', count: selectedCase.value?.dailyLogs?.length },
  { id: 'files', label: 'Adjuntos', icon: 'fas fa-paperclip', count: (selectedCase.value?.archivos?.length || 0) + (selectedCase.value?.enlacesExternos?.length || 0) },
  { id: 'spreadsheet', label: 'Hoja de cálculo', icon: 'fas fa-table' }
])

const sortedDailyLogs = computed(() => {
  if (!selectedCase.value?.dailyLogs) return []
  return [...selectedCase.value.dailyLogs].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
})

// Methods
const loadData = async () => {
  try {
    const [casesData, clientsData, wikiData] = await Promise.all([
      casesService.getAll(),
      clientService.getAll(),
      wikiService.getAll()
    ])
    cases.value = casesData
    clients.value = clientsData
    wikiArticles.value = wikiData
    
    // Auto-expand first groups
    if (Object.keys(groupedCases.value).length > 0) expandedGroups.value.push(Object.keys(groupedCases.value)[0])
    if (Object.keys(groupedWiki.value).length > 0) expandedGroups.value.push(Object.keys(groupedWiki.value)[0])
    
    if (cases.value.length && !selectedCase.value) selectedCase.value = cases.value[0]
    if (wikiArticles.value.length && !selectedWiki.value) selectedWiki.value = wikiArticles.value[0]
  } catch (err) { showError('Error', 'Fallo al sincronizar datos.') }
}

const toggleGroup = (name: string) => {
  const idx = expandedGroups.value.indexOf(name)
  if (idx === -1) expandedGroups.value.push(name)
  else expandedGroups.value.splice(idx, 1)
}

const openCreateModal = () => {
  modalMode.value = 'create'
  resetForm()
  showCreateModal.value = true
}

const resetForm = () => {
  newCase.value = { titulo: '', tipo: 'seguimiento', prioridad: 'media', descripcion: '', cliente_id: '', categoria: '', tags: [], archivos: [] }
  newWiki.value = { titulo: '', categoria: 'proceso', contenido: WIKI_TEMPLATE, descripcion: '', tags: [], archivos: [] }
  wikiTagsRaw.value = ''
}

const WIKI_TEMPLATE = `<h2>Síntomas</h2>
<p><em>Describe los mensajes de error, comportamiento observado, logs o códigos HTTP que permiten identificar este problema.</em></p>
<p></p>
<h2>Causa raíz</h2>
<p><em>Explica el origen del fallo: configuración incorrecta, bug conocido, dependencia caída, etc.</em></p>
<p></p>
<h2>Solución</h2>
<ol>
  <li>Paso 1: …</li>
  <li>Paso 2: …</li>
  <li>Paso 3: …</li>
</ol>
<p></p>
<h2>Tags / palabras clave</h2>
<p><em>Añádelas en el campo "Tags" del formulario para facilitar la búsqueda.</em></p>`

const openCreateWiki = () => {
  viewMode.value = 'wiki'
  // Pre-llena con plantilla solo si está vacío (no pisa contenido en edición)
  if (!newWiki.value.contenido) newWiki.value.contenido = WIKI_TEMPLATE
  showCreateModal.value = true
}

// Detector de duplicados de Wiki
const wikiDuplicates = computed(() => {
  const title = (newWiki.value.titulo || '').trim().toLowerCase()
  const tags = (wikiTagsRaw.value || '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)

  if (title.length < 4 && tags.length === 0) return []

  return wikiArticles.value
    .filter((w) => {
      // No incluir la wiki que estamos editando
      if (modalMode.value === 'edit' && selectedWiki.value?._id === w._id) return false

      const wTitle = (w.titulo || '').toLowerCase()
      const wTags = (w.tags || []).map((t) => t.toLowerCase())

      // Match por título (substring de 4+ chars)
      const titleMatch = title.length >= 4 && (wTitle.includes(title) || title.includes(wTitle))
      // Match por tags (al menos 1 tag en común)
      const tagMatch = tags.length > 0 && tags.some((t) => wTags.includes(t))

      return titleMatch || tagMatch
    })
    .slice(0, 3)
})

const exportToPDF = () => {
  const content = viewMode.value === 'cases' ? selectedCase.value?.wikiContent : selectedWiki.value?.contenido
  const title = viewMode.value === 'cases' ? selectedCase.value?.titulo : selectedWiki.value?.titulo
  
  if (!content) return showError('Error', 'No hay contenido para exportar.')

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const html = `
    <html>
      <head>
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
          h1 { font-size: 24px; margin-bottom: 8px; color: #0f172a; }
          .metadata { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
          .content { font-size: 14px; white-space: pre-wrap; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="metadata">Documento Generado por GEMS CRM • ${new Date().toLocaleDateString()}</div>
        <div class="content">${content}</div>
      </body>
    </html>
  `
  printWindow.document.write(html)
  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 500)
}

const selectCase = (c: Case) => {
  selectedCase.value = c
  activeViewTab.value = 'wiki'
  isEditingWiki.value = false
}

const handleCreateCase = async () => {
  if (!newCase.value.titulo) return showError('Requerido', 'El título es obligatorio.')
  showLoading('Creando página...')
  try {
    const created = await casesService.createCase(newCase.value);
    cases.value.unshift(created); selectedCase.value = created; showCreateModal.value = false
    closeLoading(); showSuccess('¡Éxito!', 'Proyecto creado.')
  } catch (err: any) { closeLoading(); showError('Error', err.message) }
}

const openDuplicate = (dup: WikiArticle) => {
  selectedWiki.value = dup
  showCreateModal.value = false
}

const saveWiki = async () => {
  if (!selectedCase.value?._id) return
  showLoading('Guardando...')
  try {
    const updated = await casesService.updateCase(selectedCase.value._id, { wikiContent: selectedCase.value.wikiContent });
    const idx = cases.value.findIndex(c => c._id === updated._id);
    if (idx !== -1) cases.value[idx] = updated;
    selectedCase.value = updated; // Actualizar referencia local
    isEditingWiki.value = false;
    closeLoading(); showSuccess('Éxito', 'Documentación actualizada.')
  } catch (err: any) { closeLoading(); showError('Error', err.message) }
}

const handleCreateWiki = async () => {
  if (!newWiki.value.titulo) return showError('Requerido', 'El título es obligatorio.')
  newWiki.value.tags = wikiTagsRaw.value.split(',').map(t => t.trim()).filter(t => t)
  showLoading('Publicando...')
  try {
    const created = await wikiService.create(newWiki.value);
    wikiArticles.value.unshift(created); selectedWiki.value = created; showCreateModal.value = false
    closeLoading(); showSuccess('¡Éxito!', 'Artículo publicado.')
  } catch (err: any) { closeLoading(); showError('Error', err.message) }
}

const handleUpdateWiki = async () => {
  if (!selectedWiki.value?._id) return
  showLoading('Actualizando...')
  try {
    const updated = await wikiService.update(selectedWiki.value._id, selectedWiki.value);
    const idx = wikiArticles.value.findIndex(w => w._id === updated._id);
    if (idx !== -1) wikiArticles.value[idx] = updated;
    selectedWiki.value = updated; // Actualizar referencia local
    isEditingWikiItem.value = false;
    closeLoading(); showSuccess('Éxito', 'Wiki actualizada.')
  } catch (err: any) { closeLoading(); showError('Error', err.message) }
}

const deleteWikiItem = async () => {
  if (!selectedWiki.value?._id) return; const result = await confirmDelete(selectedWiki.value.titulo); if (result.isConfirmed) {
    showLoading('Eliminando...')
    try { await wikiService.delete(selectedWiki.value._id); wikiArticles.value = wikiArticles.value.filter(w => w._id !== selectedWiki.value?._id); selectedWiki.value = wikiArticles.value[0] || null; closeLoading(); showSuccess('Eliminado', 'Artículo removido.') } catch (err: any) { closeLoading(); showError('Error', err.message) }
  }
}

const handleAddDailyLog = async () => {
  if (!selectedCase.value?._id || !newLog.value.que_se_hizo) return
  showLoading('Registrando...')
  try {
    const updated = await casesService.addDailyLog(selectedCase.value._id, { 
      que_se_hizo: newLog.value.que_se_hizo, 
      sentimiento: newLog.value.sentimiento,
      autor: authStore.user?._id
    })
    
    // Actualizar el caso seleccionado con los nuevos logs
    selectedCase.value = updated
    
    // También actualizar en la lista general
    const idx = cases.value.findIndex(c => c._id === updated._id)
    if (idx !== -1) cases.value[idx] = updated
    
    showAddDailyLog.value = false
    newLog.value = { que_se_hizo: '', sentimiento: '😐' }
    closeLoading(); showSuccess('Registrado', 'Actividad añadida correctamente.')
  } catch (err: any) { closeLoading(); showError('Error', err.message) }
}

// Helpers
const getClientName = (id?: string) => clients.value.find(c => c._id === id)?.name || 'Interno'
const getClientInitials = (id?: string) => getClientName(id).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
const getStatusDot = (s?: string) => ({ abierto: 'bg-emerald-500', en_progreso: 'bg-amber-500', resueltos: 'bg-blue-500', cerrado: 'bg-slate-900' }[s || ''] || 'bg-slate-300')
const getPriorityClass = (p?: string) => ({ baja: 'bg-emerald-50 text-emerald-600', media: 'bg-amber-50 text-amber-600', alta: 'bg-orange-50 text-orange-600', critica: 'bg-rose-50 text-rose-600' }[p || ''] || 'bg-slate-50 text-slate-500')
const getCoverGradient = (p?: string) => ({ baja: 'bg-gradient-to-br from-emerald-400 to-teal-600', media: 'bg-gradient-to-br from-amber-400 to-orange-500', alta: 'bg-gradient-to-br from-orange-400 to-rose-600', critica: 'bg-gradient-to-br from-rose-500 to-slate-900' }[p || ''] || 'bg-gradient-to-br from-slate-400 to-slate-600')
const getWikiCoverGradient = (cat?: string) => ({ proceso: 'bg-gradient-to-br from-blue-400 to-indigo-600', codigo: 'bg-gradient-to-br from-emerald-400 to-cyan-600', manual: 'bg-gradient-to-br from-purple-400 to-fuchsia-600' }[cat || ''] || 'bg-gradient-to-br from-slate-400 to-slate-600')
const getCaseIcon = (t?: string) => ({ documento: 'fas fa-file-contract', incidencia: 'fas fa-bug', seguimiento: 'fas fa-project-diagram' }[t || ''] || 'fas fa-folder')
const getWikiIcon = (cat?: string) => ({ proceso: 'fas fa-cogs', codigo: 'fas fa-code', manual: 'fas fa-book' }[cat || ''] || 'fas fa-file-alt')
const getWikiCatClass = (cat?: string) => ({ proceso: 'bg-blue-50 text-blue-600', codigo: 'bg-emerald-50 text-emerald-600', manual: 'bg-purple-50 text-purple-600' }[cat || ''] || 'bg-slate-50 text-slate-500')
const formatDateRelative = (date: any) => date ? formatDistanceToNow(new Date(date), { addSuffix: true, locale: es }) : ''
const getFileIcon = (name: string) => casesService.getFileIcon(name)
const isHtmlContent = (content?: string) => !!content && /<[a-z][\s\S]*>/i.test(content)
const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); showSuccess('Copiado', 'Contenido en el portapapeles.') }

const openEditCase = () => {
  if (!selectedCase.value) return
  modalMode.value = 'edit'
  newCase.value = { ...selectedCase.value, archivos: [] } // No enviamos archivos previos por ahora
  showCreateModal.value = true
}

const handleUpdateCase = async () => {
  if (!selectedCase.value?._id) return
  showLoading('Actualizando caso...')
  try {
    const updated = await casesService.updateCase(selectedCase.value._id, newCase.value as any)
    const idx = cases.value.findIndex(c => c._id === updated._id)
    if (idx !== -1) cases.value[idx] = updated
    selectedCase.value = updated
    showCreateModal.value = false
    closeLoading(); showSuccess('Éxito', 'Caso actualizado correctamente.')
  } catch (err: any) { closeLoading(); showError('Error', err.message) }
}
const deleteCurrentCase = async () => {
  if (!selectedCase.value?._id) return
  const result = await confirmDelete(selectedCase.value.titulo)
  if (result.isConfirmed) {
    showLoading('Eliminando...')
    try {
      await casesService.deleteCase(selectedCase.value._id)
      cases.value = cases.value.filter(c => c._id !== selectedCase.value?._id)
      selectedCase.value = cases.value[0] || null
      closeLoading(); showSuccess('Eliminado', 'El caso ha sido removido.')
    } catch (err: any) { closeLoading(); showError('Error', err.message) }
  }
}

const uploadFilesToCase = async (e: any) => {
  if (!selectedCase.value?._id) return
  const files = Array.from(e.target.files)
  if (!files.length) return
  
  showLoading('Subiendo archivos...')
  try {
    const updated = await casesService.updateCase(selectedCase.value._id, { archivos: files } as any)
    const idx = cases.value.findIndex(c => c._id === updated._id)
    if (idx !== -1) cases.value[idx] = updated
    selectedCase.value = updated
    closeLoading(); showSuccess('Éxito', 'Archivos añadidos correctamente.')
  } catch (err: any) { closeLoading(); showError('Error', err.message) }
}
onMounted(() => {
  loadData()
  loadLinkCatalogs()
})
watch(viewMode, () => { searchTerm.value = ''; expandedGroups.value = [] })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #EFEFEF; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #E2E8F0; }

@keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

@keyframes scale-up { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
.animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

@keyframes content-in { from { opacity: 0; filter: blur(4px); transform: translateY(5px); } to { opacity: 1; filter: blur(0); transform: translateY(0); } }
.animate-content-in { animation: content-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

.document-content {
  line-height: 1.8;
  letter-spacing: -0.01em;
}
.prose-xs { font-size: 0.75rem; line-height: 1.6; }

@media print {
  aside, .no-print, button, .actions-overlay, .tabs-header, .metadata-grid, .cover-image, .page-header-actions {
    display: none !important;
  }
  main {
    margin: 0 !important;
    padding: 2cm !important;
    width: 100% !important;
    background: white !important;
  }
  .max-w-4xl {
    max-width: 100% !important;
    box-shadow: none !important;
    border: none !important;
  }
  h1 {
    font-size: 24pt !important;
    margin-top: 0 !important;
  }
  .document-content {
    font-size: 11pt !important;
    line-height: 1.6 !important;
    color: black !important;
  }
  /* Show header emoji/icon in print */
  .text-6xl {
    font-size: 40pt !important;
  }
}
</style>