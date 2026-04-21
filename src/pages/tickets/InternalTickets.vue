<template>
  <div class="flex flex-col h-full min-h-0 gap-4">
    <!-- Header -->
    <div class="flex-shrink-0 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-black text-slate-800 tracking-tight">Gestión de Tickets</h1>
        <p class="text-xs text-slate-500 font-medium mt-0.5">Soporte técnico y atención al cliente</p>
      </div>
      
      <div class="flex items-center gap-3">
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
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2"
        >
          <i class="fas fa-plus"></i> Nuevo Ticket
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="flex-shrink-0 flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
      <div class="relative flex-1 max-w-xs">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por #, asunto o cliente..."
          class="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
        />
      </div>
      
      <select v-model="filterCategory" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none">
        <option value="">Todas las categorías</option>
        <option value="technical">Technical</option>
        <option value="billing">Billing</option>
        <option value="sales">Sales</option>
        <option value="other">Other</option>
      </select>

      <select v-model="filterPriority" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none">
        <option value="">Prioridades</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 min-h-0 relative">
      
      <!-- BOARD VIEW -->
      <div v-if="viewMode === 'board'" class="h-full grid grid-cols-4 gap-4 overflow-x-auto pb-4">
        <div v-for="col in columns" :key="col.id" class="flex flex-col min-w-[280px]">
          <!-- Column Header with top accent bar -->
          <div class="flex-shrink-0 mb-3">
             <div :class="col.color" class="h-1.5 w-full rounded-t-lg opacity-80"></div>
             <div class="bg-white border-x border-b border-slate-200 rounded-b-xl p-3 flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-2">
                  <i :class="[col.icon, col.textColor]" class="text-xs"></i>
                  <span class="text-xs font-black text-slate-700 uppercase tracking-wider">{{ col.title }}</span>
                </div>
                <span class="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-black border border-slate-200">
                  {{ getTicketsByStatus(col.id).length }}
                </span>
             </div>
          </div>

          <!-- Column Cards -->
          <div class="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            <div 
              v-for="ticket in getTicketsByStatus(col.id)" 
              :key="ticket._id"
              @click="openTicketDetail(ticket)"
              class="bg-white rounded-xl p-3 border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group relative overflow-hidden"
            >
              <!-- Priority indicator bar -->
              <div :class="getPriorityClass(ticket.priority)" class="absolute left-0 top-0 bottom-0 w-1"></div>
              
              <div class="flex items-center justify-between mb-2 pl-1">
                <span class="text-[9px] font-black font-mono text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded border border-primary-100">#{{ ticket.ticketNumber }}</span>
                <span :class="getPriorityBadgeClass(ticket.priority)" class="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                  {{ ticket.priority }}
                </span>
              </div>

              <h4 class="text-xs font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-primary-600 leading-snug pl-1">{{ ticket.subject }}</h4>

              <div class="flex items-center gap-1.5 mb-3 pl-1">
                <div class="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center">
                   <i class="fas fa-user text-[8px] text-slate-400"></i>
                </div>
                <p class="text-[10px] text-slate-500 font-bold truncate">{{ ticket.submittedBy.name }}</p>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-slate-50 pl-1">
                <span class="text-[9px] text-slate-400 font-medium">hace {{ formatDateRelative(ticket.createdAt) }}</span>
                <div v-if="ticket.assignedTo" class="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm overflow-hidden" :title="typeof ticket.assignedTo === 'object' ? ticket.assignedTo.name : 'Asignado'">
                  <img v-if="typeof ticket.assignedTo === 'object' && (ticket.assignedTo.avatar || ticket.assignedTo.photo)" :src="ticket.assignedTo.avatar || ticket.assignedTo.photo" class="w-full h-full object-cover">
                  <span v-else class="text-[9px] font-black text-primary-700">{{ typeof ticket.assignedTo === 'object' ? getInitials(ticket.assignedTo.name) : 'A' }}</span>
                </div>
                <div v-else class="w-6 h-6 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center dashed-border" title="Sin asignar">
                   <i class="fas fa-user-slash text-[9px] text-orange-400"></i>
                </div>
              </div>
            </div>

            <!-- Empty State for Column -->
            <div v-if="getTicketsByStatus(col.id).length === 0" class="py-8 flex flex-col items-center justify-center opacity-40">
               <i class="fas fa-inbox text-2xl text-slate-300"></i>
               <span class="text-[10px] font-bold text-slate-400 mt-1">Sin tickets</span>
            </div>
          </div>
        </div>
      </div>

      <!-- INBOX VIEW -->
      <div v-else class="h-full bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden animate-fade-in">
        <!-- Inbox Toolbar -->
        <div class="flex-shrink-0 border-b border-slate-100 p-3 bg-slate-50 flex items-center justify-between">
           <div class="flex items-center gap-4">
              <span class="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">Mis Asignaciones</span>
              <div class="h-4 w-px bg-slate-200"></div>
              <div class="flex items-center gap-2">
                 <button class="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary-600 transition-colors shadow-sm">
                   <i class="fas fa-filter text-[10px]"></i>
                 </button>
              </div>
           </div>
           <div class="text-[10px] font-bold text-slate-400">
             Mostrando {{ inboxTickets.length }} tickets asignados a ti
           </div>
        </div>

        <!-- Inbox List -->
        <div class="flex-1 overflow-y-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket</th>
                <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asunto</th>
                <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prioridad</th>
                <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr 
                v-for="ticket in inboxTickets" 
                :key="ticket._id"
                @click="openTicketDetail(ticket)"
                class="hover:bg-primary-50 transition-colors cursor-pointer group"
              >
                <td class="px-4 py-4">
                  <span :class="getStatusPillClass(ticket.status)" class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border">
                    {{ ticket.status }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span class="text-xs font-black font-mono text-primary-600">#{{ ticket.ticketNumber }}</span>
                </td>
                <td class="px-4 py-4">
                  <div class="max-w-md">
                    <p class="text-[13px] font-bold text-slate-800 line-clamp-1 group-hover:text-primary-600 transition-colors">{{ ticket.subject }}</p>
                    <p class="text-[10px] text-slate-400 truncate">{{ ticket.category }}</p>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400">
                      {{ getInitials(ticket.submittedBy.name) }}
                    </div>
                    <span class="text-xs font-bold text-slate-600">{{ ticket.submittedBy.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-4">
                   <span :class="getPriorityBadgeClass(ticket.priority)" class="px-2 py-1 rounded-lg text-[9px] font-black uppercase">
                     {{ ticket.priority }}
                   </span>
                </td>
                <td class="px-4 py-4">
                  <span class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{{ formatDate(ticket.createdAt) }}</span>
                </td>
              </tr>

              <tr v-if="inboxTickets.length === 0">
                <td colspan="6" class="py-20 text-center">
                   <i class="fas fa-check-circle text-4xl text-emerald-100 mb-3"></i>
                   <p class="text-sm font-black text-slate-400">¡Al día! No tienes tickets asignados pendientes</p>
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
                     <span class="text-xs font-black text-slate-800">{{ selectedTicket.submittedBy.name }}</span>
                     <span class="text-[10px] font-bold text-slate-400">{{ selectedTicket.submittedBy.email }}</span>
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
                  <button class="text-[10px] font-black text-primary-600 hover:underline uppercase tracking-tighter">Cambiar</button>
                </div>
              </div>
              <div class="bg-white rounded-xl p-4 border border-slate-200 flex flex-col gap-2">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Actual:</span>
                <div class="flex items-center justify-between">
                  <span :class="getStatusPillClass(selectedTicket.status)" class="text-[10px] font-black px-2 py-1 rounded-lg uppercase border">
                    {{ selectedTicket.status }}
                  </span>
                  <div class="flex gap-1">
                    <button 
                      v-if="selectedTicket.status !== 'resolved'"
                      @click="updateTicketStatus('resolved')"
                      class="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black hover:bg-emerald-100 transition-colors uppercase"
                    >Resolver</button>
                    <button 
                      v-if="selectedTicket.status !== 'closed'"
                      @click="updateTicketStatus('closed')"
                      class="px-2 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[9px] font-black hover:bg-slate-100 transition-colors uppercase"
                    >Cerrar</button>
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
    <div v-if="showNewTicketModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showNewTicketModal = false">
      <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md animate-fade-in overflow-hidden">
        <div class="bg-slate-50 p-5 border-b border-slate-100 flex items-center justify-between">
           <div class="flex items-center gap-3">
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

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ticketService } from '../../services/ticketService'
import { useAuthStore } from '../../stores/auth'
import { useNotifications } from '../../composables/useNotifications'
import type { Ticket } from '../../types/ticket'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'

const authStore = useAuthStore()
const { showSuccess, showError } = useNotifications()

// State
const viewMode = ref<'board' | 'inbox'>('board')
const tickets = ref<Ticket[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filterPriority = ref('')
const filterCategory = ref('')

// Selection & Modal
const selectedTicket = ref<Ticket | null>(null)
const showNewTicketModal = ref(false)
const creating = ref(false)

// Comment State
const newCommentText = ref('')
const commentFiles = ref<File[]>([])
const newCommentIsInternal = ref(false)
const sendingComment = ref(false)

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

const columns = [
  { id: 'new', title: 'Nuevos', icon: 'fas fa-star', color: 'bg-amber-400', textColor: 'text-amber-500' },
  { id: 'open', title: 'En Proceso', icon: 'fas fa-spinner', color: 'bg-blue-400', textColor: 'text-blue-500' },
  { id: 'waiting', title: 'Pendiente Cliente', icon: 'fas fa-hourglass-half', color: 'bg-orange-400', textColor: 'text-orange-500' },
  { id: 'resolved', title: 'Resueltos', icon: 'fas fa-check-circle', color: 'bg-emerald-400', textColor: 'text-emerald-500' }
]

// Computed
const filteredTickets = computed(() => {
  return tickets.value.filter(t => {
    const matchSearch = !searchQuery.value || 
      t.subject.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.submittedBy.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchPriority = !filterPriority.value || t.priority === filterPriority.value
    const matchCategory = !filterCategory.value || t.category === filterCategory.value
    
    return matchSearch && matchPriority && matchCategory
  })
})

const inboxTickets = computed(() => {
  return filteredTickets.value.filter(t => {
    const assignedId = typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo;
    return assignedId === authStore.user?._id;
  })
})

// Methods
const loadTickets = async () => {
  loading.value = true
  try {
    tickets.value = await ticketService.getAll()
  } catch (err: any) {
    showError(err.message)
  } finally {
    loading.value = false
  }
}

const getTicketsByStatus = (status: string) => {
  return filteredTickets.value.filter(t => t.status === status)
}

const openTicketDetail = async (ticket: Ticket) => {
  try {
    // Fetch full detail with comments
    selectedTicket.value = await ticketService.getById(ticket._id!)
  } catch (err: any) {
    showError(err.message)
    // Fallback if detail fetch fails
    selectedTicket.value = ticket
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
    // Update locally
    const idx = tickets.value.findIndex(t => t._id === updated._id)
    if (idx !== -1) tickets.value[idx] = updated
    selectedTicket.value = { ...selectedTicket.value, ...updated }
    showSuccess(`Estado actualizado a ${newStatus}`)
  } catch (err: any) {
    showError(err.message)
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

    const comment = await ticketService.addComment(
      selectedTicket.value._id, 
      formData
    )
    
    // Add to local UI
    if (!selectedTicket.value.comments) selectedTicket.value.comments = []
    selectedTicket.value.comments.push(comment)
    
    // Clear input
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

const createNewTicket = async () => {
  creating.value = true
  try {
    const response = await ticketService.createPublic(newTicketData.value)
    if (response.success && response.data) {
      tickets.value.unshift(response.data)
      showNewTicketModal.value = false
      newTicketData.value = {
        name: '',
        email: '',
        subject: '',
        description: '',
        category: 'technical',
        priority: 'medium'
      }
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

// Helpers
const getPriorityClass = (priority: string) => {
  switch(priority) {
    case 'urgent': return 'bg-rose-500'
    case 'high': return 'bg-orange-500'
    case 'medium': return 'bg-amber-400'
    default: return 'bg-emerald-400'
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
    case 'new': return 'bg-amber-50 text-amber-600 border-amber-100'
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

// ... (existing code)

const isImgUrl = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif)$/.test(url.toLowerCase())

const resolveImageUrl = (url: string) => {
  if (url.startsWith('http')) return url
  const origin = String(API_CONFIG.BASE_URL).replace(/\/?api\/?$/i, '')
  return `${origin.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

const viewAttachment = (url: string) => {
  window.open(resolveImageUrl(url), '_blank')
}

const formatDateLong = (dateStr?: string) => {
  if (!dateStr) return ''
  return format(new Date(dateStr), "d 'DE' MMMM, yyyy", { locale: es })
}

onMounted(() => {
  loadTickets()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
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

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
</style>
