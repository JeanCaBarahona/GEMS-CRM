<template>
  <div class="flex flex-col h-full min-h-0 gap-4">
    <!-- Header Controls (New Ticket & Refresh) -->
    <div class="flex-shrink-0 flex items-center justify-end pr-24">
      
      <div class="flex items-center gap-5">
        <!-- View Toggle -->
        <div class="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
          <button 
            @click="viewMode = 'board'"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
            :class="viewMode === 'board' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          >
            <i class="fas fa-columns text-[10px]"></i> Tablero
          </button>
          <button 
            @click="viewMode = 'inbox'"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
            :class="viewMode === 'inbox' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          >
            <i class="fas fa-list text-[10px]"></i> Mi Bandeja
          </button>
        </div>

        <div class="h-8 w-px bg-slate-200 mx-1"></div>

        <button 
          @click="loadTickets"
          :disabled="loading"
          class="p-2 text-slate-400 hover:text-primary-600 transition-colors"
        >
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
        </button>

        <button
          @click="showNewTicketModal = true"
          class="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-primary-600 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 transition-all active:bg-primary-100"
          title="Nuevo Ticket"
        >
          <i class="fas fa-plus text-xs"></i>
        </button>
      </div>
    </div>

    <!-- Modern Filters Toolbar -->
    <div class="flex-shrink-0 flex items-center justify-between bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200/60 shadow-sm mb-6">
      <div class="flex items-center gap-4 flex-1">
        <!-- Search Group -->
        <div class="relative w-80 group">
          <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors text-xs"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por #, asunto o cliente..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border border-transparent rounded-xl text-[11px] font-bold text-slate-700 placeholder-slate-400 focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
          />
        </div>

        <div class="h-8 w-px bg-slate-200/60 mx-1"></div>

        <!-- Filters Group -->
        <div class="flex items-center gap-2">
          <!-- Status -->
          <div class="flex items-center gap-2 px-3 py-2 bg-slate-100/40 rounded-xl border border-transparent hover:border-slate-200 transition-all cursor-pointer group">
            <i class="fas fa-layer-group text-[10px] text-slate-400 group-hover:text-primary-500"></i>
            <select v-model="filterStatus" class="bg-transparent text-[11px] font-black text-slate-600 outline-none cursor-pointer">
              <option value="open">En Proceso</option>
              <option value="waiting">Pendiente Cliente</option>
              <option value="resolved">Resueltos</option>
            </select>
          </div>

          <!-- Category -->
          <div class="flex items-center gap-2 px-3 py-2 bg-slate-100/40 rounded-xl border border-transparent hover:border-slate-200 transition-all cursor-pointer group">
            <i class="fas fa-tag text-[10px] text-slate-400 group-hover:text-primary-500"></i>
            <select v-model="filterCategory" class="bg-transparent text-[11px] font-black text-slate-600 outline-none cursor-pointer">
              <option value="">Todas las categorías</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="sales">Sales</option>
              <option value="other">Other</option>
            </select>
          </div>

          <!-- Priority -->
          <div class="flex items-center gap-2 px-3 py-2 bg-slate-100/40 rounded-xl border border-transparent hover:border-slate-200 transition-all cursor-pointer group">
            <i class="fas fa-flag text-[10px] text-slate-400 group-hover:text-primary-500"></i>
            <select v-model="filterPriority" class="bg-transparent text-[11px] font-black text-slate-600 outline-none cursor-pointer">
              <option value="">Prioridades</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div class="h-8 w-px bg-slate-200/60 mx-2"></div>

          <!-- Responsible -->
          <div class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200/80 rounded-xl shadow-sm hover:border-primary-300 transition-all cursor-pointer group">
            <i class="fas fa-user-shield text-[10px] text-primary-500"></i>
            <select v-model="filterAssignedTo" class="bg-transparent text-[11px] font-black text-slate-700 outline-none cursor-pointer max-w-[160px]">
              <option value="">Cualquier Agente</option>
              <option v-for="member in supportAgents" :key="member._id" :value="member._id">
                {{ member.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Actions Group -->
      <div class="flex items-center gap-3">
        <button 
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="px-3 py-2 text-[10px] font-black text-rose-500 hover:bg-rose-50 rounded-xl uppercase tracking-widest flex items-center gap-2 transition-all"
        >
          <i class="fas fa-times-circle"></i>
          Limpiar
        </button>
        
        <button @click="loadTickets(1)" class="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-primary-600 rounded-xl flex items-center justify-center transition-all border border-slate-200/50 shadow-sm" title="Actualizar">
          <i class="fas fa-sync-alt text-xs" :class="{ 'fa-spin': loading }"></i>
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 min-h-0 relative">
      
      <!-- BOARD VIEW -->
      <div v-if="viewMode === 'board'" class="h-full flex gap-6 overflow-x-auto pb-6 custom-scrollbar px-2">
        <div 
          v-for="col in columns" 
          :key="col.id" 
          class="flex flex-col flex-1 min-w-[350px] bg-gradient-to-b from-slate-50/50 to-white rounded-[2rem] border border-slate-200/60 shadow-inner"
        >
          <!-- Column Header -->
          <div class="flex-shrink-0 p-5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div :class="col.textColor" class="w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                <i :class="col.icon" class="text-xs"></i>
              </div>
              <div>
                <h3 class="text-xs font-black text-slate-700 uppercase tracking-widest">{{ col.title }}</h3>
                <p class="text-[9px] font-bold text-slate-400">{{ getTicketsByStatus(col.id).length }} tickets</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
               <button class="w-6 h-6 rounded-lg hover:bg-slate-200/50 text-slate-400 transition-colors">
                 <i class="fas fa-ellipsis-h text-[10px]"></i>
               </button>
            </div>
          </div>

          <!-- Column Cards Container -->
          <div class="flex-1 overflow-y-auto overflow-x-visible px-6 pb-6 space-y-4 custom-scrollbar-slim">
            <div 
              v-for="ticket in getTicketsByStatus(col.id)" 
              :key="ticket._id"
              @click="openTicketDetail(ticket)"
            class="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-primary-300/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative flex flex-col gap-3"
            >
              <!-- Card Content (already there) -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-[9px] font-black font-mono text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-100 shadow-sm">
                    #{{ ticket.ticketNumber }}
                  </span>
                  <div v-if="ticket.priority === 'urgent'" class="flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 text-rose-500 rounded-md border border-rose-100 animate-pulse">
                    <span class="w-1 h-1 bg-rose-500 rounded-full"></span>
                    <span class="text-[8px] font-black uppercase">Crítico</span>
                  </div>
                </div>
                <span :class="getPriorityBadgeClass(ticket.priority)" class="text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter border">
                  {{ ticket.priority }}
                </span>
              </div>

              <h4 class="text-xs font-black text-slate-800 line-clamp-2 group-hover:text-primary-600 transition-colors leading-relaxed">
                {{ ticket.subject }}
              </h4>

              <div class="flex items-center gap-2 mt-1">
                <div class="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500 overflow-hidden shadow-inner">
                  {{ getInitials(ticket.submittedBy?.name || 'G') }}
                </div>
                <p class="text-[10px] text-slate-500 font-bold truncate">{{ ticket.submittedBy?.name || 'Usuario' }}</p>
              </div>

              <div class="flex items-center justify-between pt-3 border-t border-slate-50 mt-1">
                <div class="flex items-center gap-1.5">
                  <i class="far fa-clock text-[9px] text-slate-300"></i>
                  <span class="text-[9px] text-slate-400 font-bold">hace {{ formatDateRelative(ticket.createdAt) }}</span>
                </div>
                
                <div v-if="ticket.assignedTo" class="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                  <img v-if="ticket.assignedTo.avatar || ticket.assignedTo.photo" :src="resolveImageUrl(ticket.assignedTo.avatar || ticket.assignedTo.photo)" class="w-full h-full object-cover">
                  <span v-else class="text-[9px] font-black text-primary-700">{{ getInitials(ticket.assignedTo.name) }}</span>
                </div>
                <div v-else class="w-7 h-7 rounded-xl bg-slate-50 border border-slate-200 border-dashed flex items-center justify-center" title="Sin asignar">
                   <i class="fas fa-user-slash text-[9px] text-slate-300"></i>
                </div>
              </div>
            </div>

            <!-- Botón Ver Más interactivo -->
            <div v-if="hasMoreInColumn(col.id)" class="pt-2 pb-2">
              <button 
                @click="increaseColumnLimit(col.id)"
                class="w-full py-3 bg-white/40 hover:bg-white border border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest transition-all hover:border-primary-300 hover:text-primary-600 shadow-sm"
              >
                <i class="fas fa-plus-circle mr-2"></i>
                Ver más tickets
              </button>
            </div>

            <!-- Empty State for Column -->
            <div v-if="getTicketsByStatus(col.id).length === 0" class="py-12 flex flex-col items-center justify-center opacity-30 select-none">
               <div class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                 <i class="fas fa-inbox text-xl text-slate-300"></i>
               </div>
               <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Columna Vacía</span>
            </div>
          </div>
        </div>
      </div>

      <!-- INBOX VIEW -->
      <div v-else class="h-full bg-white rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col overflow-hidden animate-fade-in relative">
        <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 to-indigo-500 opacity-80"></div>
        
        <!-- Inbox Toolbar -->
        <div class="flex-shrink-0 border-b border-slate-100 px-8 py-6 bg-slate-50/30 flex items-center justify-between">
           <div class="flex items-center gap-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center">
                  <i class="fas fa-inbox text-primary-500"></i>
                </div>
                <div>
                  <h3 class="text-base font-black text-slate-800">Mi Bandeja</h3>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tickets asignados a ti</p>
                </div>
              </div>
              <div class="h-8 w-px bg-slate-200"></div>
              <div class="flex items-center gap-3">
                 <div class="flex flex-col">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Pendientes</span>
                    <span class="text-sm font-black text-slate-800">{{ inboxTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length }}</span>
                 </div>
              </div>
           </div>
           <div class="flex items-center gap-3">
              <button @click="loadMyTickets" class="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingMyTickets }"></i>
              </button>
           </div>
        </div>

        <!-- Inbox List -->
        <div class="flex-1 overflow-y-auto custom-scrollbar px-6">
          <div v-if="loadingMyTickets" class="py-20 flex flex-col items-center justify-center gap-4">
            <i class="fas fa-circle-notch fa-spin text-3xl text-primary-400"></i>
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando tu bandeja...</span>
          </div>

          <table v-else class="w-full text-left border-collapse mt-4">
            <thead>
              <tr class="border-b border-slate-100">
                <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket</th>
                <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asunto</th>
                <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prioridad</th>
                <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Antigüedad</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr 
                v-for="ticket in inboxTickets" 
                :key="ticket._id"
                @click="openTicketDetail(ticket)"
                class="hover:bg-primary-50 transition-all cursor-pointer group"
              >
                <td class="px-4 py-5">
                  <span :class="getStatusPillClass(ticket.status)" class="px-3 py-1 rounded-xl text-[9px] font-black uppercase border shadow-sm transition-transform group-hover:scale-105">
                    {{ ticket.status }}
                  </span>
                </td>
                <td class="px-4 py-5">
                  <span class="text-xs font-black font-mono text-primary-600">#{{ ticket.ticketNumber }}</span>
                </td>
                <td class="px-4 py-5">
                  <div class="max-w-md">
                    <p class="text-sm font-black text-slate-800 line-clamp-1 group-hover:text-primary-600 transition-colors">{{ ticket.subject }}</p>
                    <p class="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{{ ticket.category }}</p>
                  </div>
                </td>
                <td class="px-4 py-5">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-inner">
                      {{ getInitials(ticket.submittedBy?.name || 'G') }}
                    </div>
                    <div class="flex flex-col">
                       <span class="text-xs font-black text-slate-700">{{ ticket.submittedBy?.name || 'Usuario' }}</span>
                       <span class="text-[9px] font-bold text-slate-400 truncate max-w-[120px]">{{ ticket.submittedBy?.email || 'N/A' }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-5">
                   <span :class="getPriorityBadgeClass(ticket.priority)" class="px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase border shadow-sm">
                     {{ ticket.priority }}
                   </span>
                </td>
                <td class="px-4 py-5">
                  <div class="flex flex-col">
                    <span class="text-xs font-black text-slate-600">{{ formatDateRelative(ticket.createdAt) }}</span>
                    <span class="text-[9px] font-bold text-slate-400 uppercase">{{ formatDate(ticket.createdAt) }}</span>
                  </div>
                </td>
              </tr>

              <tr v-if="inboxTickets.length === 0">
                <td colspan="6" class="py-32 text-center">
                   <div class="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm animate-bounce-subtle">
                     <i class="fas fa-check-circle text-3xl text-emerald-500"></i>
                   </div>
                   <h4 class="text-lg font-black text-slate-800 mb-1">¡Bandeja al día!</h4>
                   <p class="text-xs font-black text-slate-400 uppercase tracking-widest">No tienes tickets asignados pendientes</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- DETAIL PANEL (Slide-over) -->
    <div v-if="selectedTicket" class="fixed inset-0 z-50 overflow-hidden" @click.self="closeTicketDetail">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>
      
      <div class="absolute inset-y-0 right-0 max-w-2xl w-full flex">
        <div class="w-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
          
          <!-- Detail Header -->
          <div class="flex-shrink-0 p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                   <span class="text-xs font-black font-mono text-primary-600 bg-white px-2 py-0.5 rounded border border-slate-200">#{{ selectedTicket.ticketNumber }}</span>
                   <h2 class="text-lg font-black text-slate-800">{{ selectedTicket.subject }}</h2>
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <span :class="getStatusPillClass(selectedTicket.status)" class="text-[9px] font-black px-2 py-0.5 rounded-full uppercase border">
                    {{ selectedTicket.status }}
                  </span>
                  <span :class="getPriorityBadgeClass(selectedTicket.priority)" class="text-[9px] font-black px-2 py-0.5 rounded-full uppercase border">
                    {{ selectedTicket.priority }}
                  </span>
                  <span class="text-[10px] font-bold text-slate-400 border-l border-slate-200 pl-2 ml-1">{{ selectedTicket.category }}</span>
                </div>
              </div>
            </div>
            <button @click="closeTicketDetail" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-all">
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>

          <!-- Detail Content -->
          <div class="flex-1 overflow-y-auto flex flex-col p-6 space-y-8 custom-scrollbar">
            
            <!-- Description -->
            <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative">
               <div class="absolute -top-3 left-4 bg-white border border-slate-100 px-3 py-1 rounded-full flex items-center gap-2">
                 <i class="fas fa-info-circle text-[10px] text-primary-500"></i>
                 <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descripción Inicial</span>
               </div>
               <p class="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap mt-2">{{ selectedTicket.description }}</p>
               
               <div class="flex items-center justify-between mt-6 pt-4 border-t border-slate-200/50">
                 <div class="flex items-center gap-3">
                   <div class="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                     <i class="fas fa-user text-xs text-slate-400"></i>
                   </div>
                   <div class="flex flex-col">
                     <span class="text-xs font-black text-slate-800">{{ selectedTicket.submittedBy?.name || 'Usuario' }}</span>
                     <span class="text-[10px] font-bold text-slate-400">{{ selectedTicket.submittedBy?.email || 'N/A' }}</span>
                   </div>
                 </div>
                 <div class="text-[10px] font-black text-slate-400 uppercase">
                    RECIBIDO EL {{ formatDateLong(selectedTicket.createdAt) }}
                 </div>
               </div>
            </div>

            <!-- Meta info grid -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white rounded-xl p-4 border border-slate-200 flex flex-col gap-2">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asignado a:</span>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                      <img v-if="selectedTicket.assignedTo?.avatar" :src="selectedTicket.assignedTo.avatar" class="w-full h-full object-cover">
                      <span v-else class="text-xs font-black text-indigo-600">{{ getInitials(selectedTicket.assignedTo?.name || '?') }}</span>
                    </div>
                    <span class="text-sm font-bold text-slate-700">{{ selectedTicket.assignedTo?.name || 'Sin asignar' }}</span>
                  </div>
                  <div class="relative">
                    <button 
                      @click="showAgentSelector = !showAgentSelector"
                      class="text-[10px] font-black text-primary-600 hover:underline uppercase tracking-tighter"
                    >
                      {{ showAgentSelector ? 'Cancelar' : 'Cambiar' }}
                    </button>
                    
                    <!-- Dropdown de agentes -->
                    <div v-if="showAgentSelector" class="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[70] py-2 animate-fade-in ring-4 ring-slate-900/5">
                       <div class="px-4 py-2 mb-2 border-b border-slate-100 flex items-center justify-between">
                         <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reasignar a...</span>
                         <button @click="showAgentSelector = false" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times text-[10px]"></i></button>
                       </div>
                       <div class="max-h-64 overflow-y-auto custom-scrollbar-slim px-2">
                         <button 
                          v-for="agent in supportAgents" 
                          :key="agent._id"
                          @click.stop="reassignTicket(agent._id)"
                          class="w-full px-3 py-2.5 text-left hover:bg-primary-50 rounded-xl flex items-center gap-3 transition-all group/agent"
                         >
                           <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover/agent:bg-primary-100 group-hover/agent:text-primary-600 transition-colors">
                             {{ getInitials(agent.name) }}
                           </div>
                           <div class="flex flex-col">
                             <span class="text-xs font-bold text-slate-700 group-hover/agent:text-primary-700">{{ agent.name }}</span>
                             <span class="text-[9px] font-bold text-slate-400 uppercase">{{ agent.role }}</span>
                           </div>
                         </button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-white rounded-xl p-4 border border-slate-200 flex flex-col gap-2">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Actual:</span>
                <div class="flex items-center justify-between">
                  <span :class="getStatusPillClass(selectedTicket.status)" class="text-[10px] font-black px-2 py-1 rounded-lg uppercase border">
                    {{ selectedTicket.status }}
                  </span>
                  <button 
                    v-if="selectedTicket.status !== 'resolved'"
                    @click="updateTicketStatus('resolved')"
                    class="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-black hover:bg-emerald-100 transition-all uppercase"
                  >Resolver Ticket</button>
                </div>
              </div>
            </div>

            <!-- Linked Resources -->
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div class="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <i class="fas fa-link text-primary-500"></i> Recursos Vinculados
                </h3>
                <div class="flex gap-2">
                  <button @click="openLinkResourceModal('case')" class="px-2.5 py-1.5 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1.5">
                    <i class="fas fa-briefcase text-[8px]"></i> + Caso
                  </button>
                  <button @click="openLinkResourceModal('wiki')" class="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1.5">
                    <i class="fas fa-book-open text-[8px]"></i> + Wiki
                  </button>
                </div>
              </div>
              
              <div class="p-4">
                <div v-if="(selectedTicket.linkedCases?.length || 0) + (selectedTicket.linkedWikiArticles?.length || 0) === 0" 
                     class="py-6 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center opacity-40">
                  <i class="fas fa-puzzle-piece text-lg mb-2 text-slate-300"></i>
                  <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sin recursos asociados</span>
                </div>
                
                <div class="grid grid-cols-1 gap-2">
                  <!-- Linked Cases -->
                  <div v-for="item in selectedTicket.linkedCases" :key="item._id" 
                       class="p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl flex items-center justify-between group">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                        <i class="fas fa-briefcase text-xs"></i>
                      </div>
                      <div class="flex flex-col">
                        <span class="text-[10px] font-black text-indigo-700 uppercase tracking-tighter">Caso Vinculado</span>
                        <span class="text-xs font-bold text-slate-700">{{ item.titulo || item.title }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button @click="openResource(item, 'case')" class="opacity-0 group-hover:opacity-100 p-1.5 text-indigo-400 hover:text-indigo-600 transition-all" title="Ver recurso">
                        <i class="fas fa-external-link-alt text-[10px]"></i>
                      </button>
                      <button @click="unlinkResource('case', item._id)" class="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 transition-all" title="Desvincular">
                        <i class="fas fa-unlink text-[10px]"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Linked Wiki -->
                  <div v-for="item in selectedTicket.linkedWikiArticles" :key="item._id" 
                       class="p-3 bg-emerald-50/30 border border-emerald-100 rounded-xl flex items-center justify-between group">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                        <i class="fas fa-book-open text-xs"></i>
                      </div>
                      <div class="flex flex-col">
                        <span class="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">Manual / Wiki</span>
                        <span class="text-xs font-bold text-slate-700">{{ item.titulo }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button @click="openResource(item)" class="opacity-0 group-hover:opacity-100 p-1.5 text-primary-400 hover:text-primary-600 transition-all" title="Ver recurso">
                        <i class="fas fa-external-link-alt text-[10px]"></i>
                      </button>
                      <button @click="unlinkResource('wiki', item._id)" class="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 transition-all" title="Desvincular">
                        <i class="fas fa-unlink text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Conversation/Timeline -->
            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <i class="fas fa-comments text-primary-500"></i> Seguimiento
                </h3>
                <span class="text-[10px] font-bold text-slate-400">{{ selectedTicket.comments?.length || 0 }} mensajes</span>
              </div>

              <!-- Message List -->
              <div class="space-y-4">
                <div 
                  v-for="comment in selectedTicket.comments" 
                  :key="comment._id"
                  class="flex gap-3"
                  :class="{ 'flex-row-reverse': comment.author._id === authStore.user?._id }"
                >
                  <div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden">
                    <img v-if="comment.author.avatar" :src="comment.author.avatar" class="w-full h-full object-cover">
                    <span v-else class="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400">
                      {{ getInitials(comment.author.name) }}
                    </span>
                  </div>
                  <div class="flex flex-col max-w-[80%]" :class="{ 'items-end': comment.author._id === authStore.user?._id }">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-[10px] font-black text-slate-700">{{ comment.author.name }}</span>
                      <span v-if="comment.isInternal" class="text-[8px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase tracking-tighter">Nota Interna</span>
                      <span class="text-[8px] font-bold text-slate-400">{{ formatDateRelative(comment.createdAt) }}</span>
                    </div>
                    <div 
                      class="p-3 text-xs leading-relaxed font-medium shadow-sm"
                      :class="[
                        comment.isInternal ? 'bg-amber-50 border border-amber-100 text-amber-900' : 'border border-slate-100',
                        comment.author._id === authStore.user?._id ? 'bg-primary-600 text-white rounded-l-2xl rounded-br-2xl border-transparent' : 'bg-white text-slate-700 rounded-r-2xl rounded-bl-2xl'
                      ]"
                    >
                      {{ comment.text }}
                      
                      <!-- Comment Attachments -->
                      <div v-if="comment.attachments?.length" class="flex flex-wrap gap-2 mt-3 pt-3 border-t" :class="comment.author._id === authStore.user?._id ? 'border-primary-500/30' : 'border-slate-100'">
                        <div v-for="(att, i) in comment.attachments" :key="i"
                          @click="viewAttachment(att)"
                          class="w-20 h-20 rounded-lg overflow-hidden cursor-pointer border hover:border-primary-400 transition-all shadow-sm"
                          :class="comment.author._id === authStore.user?._id ? 'bg-primary-700/50 border-primary-500' : 'bg-slate-50 border-slate-200'"
                        >
                          <img v-if="isImgUrl(att)" :src="resolveImageUrl(att)" class="w-full h-full object-cover">
                          <div v-else class="w-full h-full flex flex-col items-center justify-center gap-1">
                            <i class="fas fa-file-alt text-[10px]" :class="comment.author._id === authStore.user?._id ? 'text-primary-200' : 'text-slate-300'"></i>
                            <span class="text-[7px] font-black uppercase" :class="comment.author._id === authStore.user?._id ? 'text-primary-100' : 'text-slate-400'">Doc</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="!selectedTicket.comments?.length" class="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl opacity-50">
                   <p class="text-xs font-bold text-slate-400 italic">No hay mensajes aún. Sé el primero en escribir.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Detail Input Area -->
          <div class="flex-shrink-0 p-4 border-t border-slate-100 bg-slate-50">
            <div class="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
              <textarea 
                v-model="newCommentText"
                rows="2" 
                placeholder="Escribe una respuesta o nota interna..." 
                class="w-full p-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-0 focus:ring-0 resize-none font-medium"
              ></textarea>
              <div class="flex items-center justify-between pt-2 border-t border-slate-50">
                <div class="flex items-center gap-3 pl-2">
                  <label class="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" v-model="newCommentIsInternal" class="w-3.5 h-3.5 rounded text-primary-600 border-slate-200 focus:ring-primary-500">
                    <span class="text-[10px] font-black text-slate-400 group-hover:text-amber-600 uppercase tracking-tighter transition-colors">Nota Interna</span>
                  </label>
                  <label class="p-1.5 text-slate-400 hover:text-primary-600 cursor-pointer relative transition-colors">
                    <i class="fas fa-paperclip text-sm"></i>
                    <input type="file" multiple @change="handleCommentFiles" class="hidden">
                    <span v-if="commentFiles.length" class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary-600 text-[7px] text-white rounded-full flex items-center justify-center font-black">
                      {{ commentFiles.length }}
                    </span>
                  </label>
                </div>
                <button 
                  @click="submitComment"
                  :disabled="!newCommentText.trim() || sendingComment"
                  class="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  {{ sendingComment ? 'Enviando...' : 'Enviar Mensaje' }}
                  <i class="fas fa-paper-plane text-[10px]"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Ticket (Para uso interno) -->
    <Teleport to="body">
    <div v-if="showNewTicketModal" class="fixed -inset-1 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="showNewTicketModal = false">
      <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md animate-fade-in overflow-hidden">
        <div class="bg-slate-50 p-5 border-b border-slate-100 flex items-center justify-between">
           <div class="flex items-center gap-6">
             <div class="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center border border-primary-200">
               <i class="fas fa-ticket-alt"></i>
             </div>
             <div>
               <h3 class="text-base font-black text-slate-800">Crear Manualmente</h3>
               <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nuevo ticket de soporte</p>
             </div>
           </div>
           <button @click="showNewTicketModal = false" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre del Cliente</label>
            <input v-model="newTicketData.name" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email del Cliente</label>
            <input v-model="newTicketData.email" type="email" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all">
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Asunto</label>
            <input v-model="newTicketData.subject" type="text" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Prioridad</label>
              <select v-model="newTicketData.priority" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none">
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Categoría</label>
              <select v-model="newTicketData.category" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none">
                <option value="technical">Técnica</option>
                <option value="billing">Facturación</option>
                <option value="sales">Ventas</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Descripción</label>
            <textarea v-model="newTicketData.description" rows="3" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"></textarea>
          </div>
        </div>
        <div class="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button @click="showNewTicketModal = false" class="flex-1 px-4 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">Cancelar</button>
          <button 
            @click="createNewTicket"
            :disabled="creating"
            class="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-md flex items-center justify-center gap-2"
          >
            {{ creating ? 'Creando...' : 'Crear Ticket' }}
            <i class="fas fa-check"></i>
          </button>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- Link Resource Modal -->
    <div v-if="showLinkModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" @click.self="showLinkModal = null">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <i :class="showLinkModal === 'case' ? 'fas fa-briefcase text-indigo-500' : 'fas fa-book-open text-emerald-500'"></i>
            Vincular {{ showLinkModal === 'case' ? 'Caso' : 'Wiki' }}
          </h3>
          <button @click="showLinkModal = null" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
        </div>
        
        <div class="p-6 flex flex-col gap-4">
          <div class="relative">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              v-model="linkSearchQuery"
              type="text" 
              :placeholder="`Buscar ${showLinkModal === 'case' ? 'caso por título' : 'wiki por título'}...`"
              class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white transition-all outline-none"
            >
          </div>
          
          <div class="max-h-80 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2">
            <div 
              v-for="item in filteredLinkableItems" 
              :key="item._id"
              @click="linkResource(item._id)"
              class="p-4 border border-slate-100 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div class="flex flex-col">
                <span class="text-xs font-black text-slate-800 group-hover:text-primary-700 transition-colors">{{ item.titulo }}</span>
                <span v-if="showLinkModal === 'wiki'" class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{{ item.categoria }}</span>
                <span v-else class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{{ item.estado }} • {{ item.prioridad }}</span>
              </div>
              <i class="fas fa-link text-slate-300 group-hover:text-primary-500 transition-colors"></i>
            </div>
            
            <div v-if="filteredLinkableItems.length === 0" class="py-12 text-center text-slate-400 italic text-sm">
              No se encontraron resultados
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { ticketService } from '../../services/ticketService'
import { teamService } from '../../services/teamService'
import { casesService } from '../../services/casesService'
import { wikiService } from '../../services/wikiService'
import { useAuthStore } from '../../stores/auth'
import { useNotifications } from '../../composables/useNotifications'
import type { Ticket } from '../../types/ticket'
import type { TeamMember } from '../../types'
import type { Case } from '../../services/casesService'
import type { WikiArticle } from '../../services/wikiService'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const { showSuccess, showError } = useNotifications()

// State
const viewMode = ref<'board' | 'inbox'>('board')
const tickets = ref<Ticket[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filterPriority = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const filterAssignedTo = ref('')
const teamMembers = ref<TeamMember[]>([])
const pagination = ref({
  page: 1,
  limit: 25, 
  total: 0,
  pages: 1
})

const myInboxTickets = ref<Ticket[]>([])
const loadingMyTickets = ref(false)

// Selection & Modal
const selectedTicket = ref<Ticket | null>(null)
const showNewTicketModal = ref(false)
const creating = ref(false)
const showLinkModal = ref<'case' | 'wiki' | null>(null)
const linkSearchQuery = ref('')
const allLinkableCases = ref<Case[]>([])
const allLinkableWiki = ref<WikiArticle[]>([])
const isLinking = ref(false)

// Comment State
const newCommentText = ref('')
const commentFiles = ref<File[]>([])
const newCommentIsInternal = ref(false)
const sendingComment = ref(false)
const showAgentSelector = ref(false)

const handleCommentFiles = (e: any) => {
  const files = Array.from(e.target.files) as File[]
  commentFiles.value = [...commentFiles.value, ...files]
}

const newTicketData = ref({
  name: '',
  email: '',
  subject: '',
  description: '',
  category: 'technical',
  priority: 'medium'
})

const columnLimits = reactive<Record<string, number>>({
  open: 10,
  waiting: 10,
  resolved: 10
})

const columns = [
  { id: 'open', title: 'En Proceso', icon: 'fas fa-spinner', color: 'bg-blue-400', textColor: 'text-blue-500' },
  { id: 'waiting', title: 'Pendiente Cliente', icon: 'fas fa-hourglass-half', color: 'bg-orange-400', textColor: 'text-orange-500' },
  { id: 'resolved', title: 'Resueltos', icon: 'fas fa-check-circle', color: 'bg-emerald-400', textColor: 'text-emerald-500' }
]

// Computed
const filteredTickets = computed(() => {
  if (!tickets.value) return []
  return tickets.value.filter(t => {
    if (!t) return false
    const query = searchQuery.value.toLowerCase()
    const matchSearch = !query || 
      (t.subject && t.subject.toLowerCase().includes(query)) ||
      (t.ticketNumber && t.ticketNumber.toLowerCase().includes(query)) ||
      (t.submittedBy?.name && t.submittedBy.name.toLowerCase().includes(query))
    
    const assignedId = typeof t.assignedTo === 'object' ? (t.assignedTo as any)?._id : t.assignedTo
    const matchAgent = !filterAssignedTo.value || assignedId === filterAssignedTo.value
    
    const matchPriority = !filterPriority.value || t.priority === filterPriority.value
    const matchCategory = !filterCategory.value || t.category === filterCategory.value
    
    return matchSearch && matchAgent && matchPriority && matchCategory
  })
})

const supportAgents = computed(() => {
  return teamMembers.value.filter(member => 
    member.role !== 'client' && 
    ['admin', 'manager', 'support', 'development', 'fullstack'].includes(member.role)
  )
})

const inboxTickets = computed(() => {
  if (!myInboxTickets.value) return []
  return myInboxTickets.value.filter(t => {
    if (!t) return false
    const query = searchQuery.value.toLowerCase()
    const matchSearch = !query || 
      (t.subject && t.subject.toLowerCase().includes(query)) ||
      (t.ticketNumber && t.ticketNumber.toLowerCase().includes(query)) ||
      (t.submittedBy?.name && t.submittedBy.name.toLowerCase().includes(query))
    
    const assignedId = typeof t.assignedTo === 'object' ? (t.assignedTo as any)?._id : t.assignedTo
    const matchAgent = !filterAssignedTo.value || assignedId === filterAssignedTo.value
    
    const matchStatus = !filterStatus.value || t.status === filterStatus.value
    const matchPriority = !filterPriority.value || t.priority === filterPriority.value
    const matchCategory = !filterCategory.value || t.category === filterCategory.value
    
    return matchSearch && matchAgent && matchStatus && matchPriority && matchCategory
  })
})

const filteredLinkableItems = computed(() => {
  if (showLinkModal.value === 'case') {
    return allLinkableCases.value.filter(c => 
      c.titulo.toLowerCase().includes(linkSearchQuery.value.toLowerCase())
    )
  } else if (showLinkModal.value === 'wiki') {
    return allLinkableWiki.value.filter(w => 
      w.titulo.toLowerCase().includes(linkSearchQuery.value.toLowerCase())
    )
  }
  return []
})

// Methods
const openLinkResourceModal = async (type: 'case' | 'wiki') => {
  showLinkModal.value = type
  linkSearchQuery.value = ''
  if (type === 'case') {
    const result = await casesService.getAllCases()
    allLinkableCases.value = result.cases
  } else {
    allLinkableWiki.value = await wikiService.getAll()
  }
}

const linkResource = async (resourceId: string) => {
  if (!selectedTicket.value || isLinking.value) return
  isLinking.value = true
  
  try {
    const field = showLinkModal.value === 'case' ? 'linkedCases' : 'linkedWikiArticles'
    const currentList = selectedTicket.value[field as keyof Ticket] || []
    
    if ((currentList as any[]).some((i: any) => (i._id || i) === resourceId)) {
       Swal.fire('Atención', 'Este recurso ya está vinculado', 'warning')
       return
    }

    const updatedTicket = await ticketService.updateTicket(selectedTicket.value._id, {
      [field]: [...(currentList as any[]).map((i: any) => i._id || i), resourceId]
    })
    
    if (updatedTicket) {
      selectedTicket.value = updatedTicket
      Swal.fire({ title: 'Vinculado', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
    }
  } catch (error) {
    Swal.fire('Error', 'No se pudo vincular el recurso', 'error')
  } finally {
    isLinking.value = false
    showLinkModal.value = null
  }
}

const unlinkResource = async (type: 'case' | 'wiki', resourceId: string) => {
  if (!selectedTicket.value) return
  
  const confirm = await Swal.fire({
    title: '¿Desvincular recurso?',
    text: "Se eliminará la trazabilidad con este elemento",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, desvincular',
    cancelButtonText: 'Cancelar'
  })

  if (confirm.isConfirmed) {
    try {
      const field = type === 'case' ? 'linkedCases' : 'linkedWikiArticles'
      const updatedList = (selectedTicket.value[field as keyof Ticket] || []).filter((i: any) => (i._id || i) !== resourceId)
      
      const updatedTicket = await ticketService.updateTicket(selectedTicket.value._id, {
        [field]: updatedList.map((i: any) => i._id || i)
      })
      
      if (updatedTicket) {
        selectedTicket.value = updatedTicket
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo desvincular el recurso', 'error')
    }
  }
}

const loadTickets = async (page = 1) => {
  loading.value = true
  try {
    const isBoard = viewMode.value === 'board'
    const response = await ticketService.getAll({
      status: filterStatus.value || undefined,
      priority: filterPriority.value || undefined,
      category: filterCategory.value || undefined,
      assignedTo: filterAssignedTo.value || undefined,
      page,
      limit: isBoard ? 100 : pagination.value.limit
    })
    
    if (response.success) {
      tickets.value = response.data
      pagination.value = response.pagination
    }
  } catch (err: any) {
    showError(err.message)
  } finally {
    loading.value = false
  }
}

const loadMyTickets = async () => {
  loadingMyTickets.value = true
  try {
    const data = await ticketService.getMyTickets()
    myInboxTickets.value = data
  } catch (err: any) {
    showError(err.message)
  } finally {
    loadingMyTickets.value = false
  }
}

const openTicketDetail = async (ticket: Ticket) => {
  if (!ticket || !ticket._id) return
  selectedTicket.value = { ...ticket }
  try {
    const fullTicket = await ticketService.getById(ticket._id.toString())
    if (selectedTicket.value && selectedTicket.value._id === fullTicket._id) {
       selectedTicket.value = fullTicket
    }
  } catch (err: any) {
    console.error('Error fetching ticket detail:', err)
  }
}

const closeTicketDetail = () => {
  selectedTicket.value = null
  newCommentText.value = ''
  newCommentIsInternal.value = false
}

const updateTicketStatus = async (newStatus: string) => {
  if (!selectedTicket.value?._id) return
  try {
    const updated = await ticketService.updateStatus(selectedTicket.value._id, newStatus)
    const idx = tickets.value.findIndex(t => t._id === updated._id)
    if (idx !== -1) tickets.value[idx] = updated
    selectedTicket.value = { ...selectedTicket.value, ...updated }
    showSuccess(`Estado actualizado a ${newStatus}`)
  } catch (err: any) {
    showError(err.message)
  }
}

const getTicketsByStatus = (status: string) => {
  const all = filteredTickets.value.filter(t => t.status === status)
  return all.slice(0, columnLimits[status] || 10)
}

const hasMoreInColumn = (status: string) => {
  const allInColumn = filteredTickets.value.filter(t => t.status === status).length
  return allInColumn > (columnLimits[status] || 10)
}

const increaseColumnLimit = (status: string) => {
  columnLimits[status] = (columnLimits[status] || 10) + 10
}

const openResource = (item: any, type?: string) => {
  if (type === 'case' || item.caseNumber) {
    window.open(`/cases?id=${item._id}`, '_blank')
  } else {
    window.open(`/wiki?id=${item._id}`, '_blank')
  }
}

const submitComment = async () => {
  if (!selectedTicket.value?._id || !newCommentText.value.trim()) return
  sendingComment.value = true
  try {
    const formData = new FormData()
    formData.append('text', newCommentText.value)
    formData.append('isInternal', String(newCommentIsInternal.value))
    commentFiles.value.forEach(file => {
      formData.append('files', file)
    })

    const comment = await ticketService.addComment(selectedTicket.value._id, formData)
    if (!selectedTicket.value.comments) selectedTicket.value.comments = []
    selectedTicket.value.comments.push(comment)
    
    if (!newCommentIsInternal.value && selectedTicket.value.status === 'open') {
      await updateTicketStatus('waiting')
    }

    newCommentText.value = ''
    commentFiles.value = []
    newCommentIsInternal.value = false
    showSuccess('Mensaje enviado')
  } catch (err: any) {
    showError(err.message)
  } finally {
    sendingComment.value = false
  }
}

const reassignTicket = async (agentId: string) => {
  if (!selectedTicket.value?._id) return
  try {
    const updated = await ticketService.updateStatus(selectedTicket.value._id, selectedTicket.value.status, agentId)
    const idx = tickets.value.findIndex(t => t._id === updated._id)
    if (idx !== -1) tickets.value[idx] = updated
    selectedTicket.value = { ...selectedTicket.value, ...updated }
    showAgentSelector.value = false
    showSuccess(`Ticket reasignado correctamente`)
  } catch (err: any) {
    showError(err.message)
  }
}

const createNewTicket = async () => {
  creating.value = true
  try {
    const response = await ticketService.createPublic(newTicketData.value)
    if (response.success && response.data) {
      tickets.value.unshift(response.data)
      showNewTicketModal.value = false
      newTicketData.value = { name: '', email: '', subject: '', description: '', category: 'technical', priority: 'medium' }
      showSuccess('Ticket creado exitosamente')
    } else {
      showError(response.error || 'No se pudo crear el ticket')
    }
  } catch (err: any) {
    showError(err.message)
  } finally {
    creating.value = false
  }
}

const getPriorityBadgeClass = (priority: string) => {
  switch(priority) {
    case 'urgent': return 'bg-rose-50 text-rose-600 border-rose-100'
    case 'high': return 'bg-orange-50 text-orange-600 border-orange-100'
    case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100'
    default: return 'bg-emerald-50 text-emerald-600 border-emerald-100'
  }
}

const getStatusPillClass = (status: string) => {
  switch(status) {
    case 'open': return 'bg-blue-50 text-blue-600 border-blue-100'
    case 'waiting': return 'bg-orange-50 text-orange-600 border-orange-100'
    case 'resolved': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    default: return 'bg-slate-50 text-slate-500 border-slate-100'
  }
}

const getInitials = (name: string) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatDateRelative = (dateStr?: string) => {
  if (!dateStr) return ''
  return formatDistanceToNow(new Date(dateStr), { locale: es })
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  return format(new Date(dateStr), 'dd MMM', { locale: es })
}

import { API_CONFIG } from '@/config/api'

const isImgUrl = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif)$/.test(url.toLowerCase())

const resolveImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const origin = String(API_CONFIG.BASE_URL).replace(/\/?api\/?$/i, '')
  return `${origin.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

const viewAttachment = (url: string) => window.open(resolveImageUrl(url), '_blank')

const formatDateLong = (dateStr?: string) => dateStr ? format(new Date(dateStr), "d 'DE' MMMM, yyyy", { locale: es }) : ''

watch(viewMode, (newVal) => {
  if (newVal === 'inbox') loadMyTickets()
  else loadTickets()
})

const loadTeamMembers = async () => {
  try {
    teamMembers.value = await teamService.getActiveMembers()
  } catch (error) {
    Swal.fire('Error', 'No se pudieron cargar los miembros del equipo', 'error')
  }
}

onMounted(async () => {
  await loadTeamMembers()
  // Set default filter if current user is support
  const isSupport = ['support', 'development', 'fullstack'].includes(authStore.user?.role || '')
  if (isSupport && authStore.user?._id) {
    filterAssignedTo.value = authStore.user._id
  }

  if (viewMode.value === 'inbox') {
    loadMyTickets()
  } else {
    loadTickets()
  }
})
</script>

<style scoped>
.custom-scrollbar-slim::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.custom-scrollbar-slim::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar-slim::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.custom-scrollbar-slim::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.animate-bounce-subtle {
  animation: bounce-subtle 3s ease-in-out infinite;
}
.dashed-border {
  border-style: dashed;
}

@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.animate-bounce-subtle {
  animation: bounce-subtle 3s ease-in-out infinite;
}
</style>
