<template>
  <div class="space-y-6">
    <!-- Encabezado del Cliente -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-black border border-primary-200">
          {{ (client?.name || 'C').charAt(0).toUpperCase() }}
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-800">{{ client?.name }}</h1>
          <p class="text-slate-500 font-medium text-sm mt-0.5">{{ client?.company || 'Sin Empresa' }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <router-link to="/clients" class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
          <i class="fas fa-arrow-left mr-2"></i> Volver
        </router-link>
        <button @click="editOverview = !editOverview" class="px-5 py-2.5 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-sm">
          <i :class="editOverview ? 'fas fa-times' : 'fas fa-edit'" class="mr-2"></i>
          {{ editOverview ? 'Cancelar Edición' : 'Editar Cliente' }}
        </button>
        <button v-if="editOverview" @click="saveOverview" class="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
          <i class="fas fa-save mr-2"></i> Guardar Cambios
        </button>
      </div>
    </div>

    <!-- Contenedor Principal (Tabs y Contenido) -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <!-- Tabs -->
      <div class="flex gap-2 p-3 border-b border-slate-100 bg-slate-50 overflow-x-auto scroll-smooth">
        <button v-for="t in tabs" :key="t.key" @click="activeTab = t.key"
          :class="[
            'px-4 py-2.5 rounded-lg whitespace-nowrap text-sm font-bold transition-colors flex items-center min-w-max',
            activeTab === t.key 
              ? 'bg-primary-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
          ]">
          <i :class="[t.icon, 'mr-2', activeTab === t.key ? 'opacity-100' : 'opacity-70']"></i>{{ t.label }}
        </button>
      </div>

      <!-- Contenido de las Tabs -->
      <div class="p-6 md:p-8">
        <!-- Overview -->
        <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div class="lg:col-span-2 space-y-6">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Acerca de</label>
              <textarea v-model="draft.profile.about" :readonly="!editOverview"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all min-h-[140px] resize-y"
                :class="!editOverview ? 'opacity-80' : 'shadow-sm'"
              ></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Dirección</label>
                <input v-model="draft.profile.address" :readonly="!editOverview" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" :class="!editOverview ? 'opacity-80' : 'shadow-sm'"/>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Sitio web</label>
                <input v-model="draft.profile.website" :readonly="!editOverview" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" :class="!editOverview ? 'opacity-80' : 'shadow-sm'"/>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Industria</label>
                <input v-model="draft.profile.industry" :readonly="!editOverview" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" :class="!editOverview ? 'opacity-80' : 'shadow-sm'"/>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tamaño de la Empresa</label>
                <input v-model="draft.profile.size" :readonly="!editOverview" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" :class="!editOverview ? 'opacity-80' : 'shadow-sm'"/>
              </div>
            </div>
          </div>
          
          <div class="space-y-6">
            <div class="bg-primary-50 p-5 rounded-xl border border-primary-100 shadow-sm">
              <label class="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-3">Etiquetas</label>
              <div class="flex flex-wrap gap-2">
                <span v-for="(tag, i) in draft.tags" :key="i" class="px-2.5 py-1 rounded-md bg-white text-primary-700 text-[11px] font-bold uppercase tracking-wider border border-primary-200 shadow-sm">{{ tag }}</span>
                <input v-if="editOverview" v-model="newTag" @keyup.enter="addTag" placeholder="+ Agregar etiqueta (Enter)" class="bg-white border border-primary-200 rounded-md px-3 py-1.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1 min-w-[120px]"/>
              </div>
            </div>
            
            <div class="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"><i class="fas fa-envelope mr-1 text-slate-400"></i> Correo Electrónico</label>
                <input v-model="draft.email" :readonly="!editOverview" class="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" :class="!editOverview ? 'opacity-80' : 'shadow-sm'"/>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"><i class="fas fa-phone mr-1 text-slate-400"></i> Teléfono</label>
                <input v-model="draft.phone" :readonly="!editOverview" class="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" :class="!editOverview ? 'opacity-80' : 'shadow-sm'"/>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"><i class="fas fa-building mr-1 text-slate-400"></i> Nombre Comercial</label>
                <input v-model="draft.company" :readonly="!editOverview" class="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" :class="!editOverview ? 'opacity-80' : 'shadow-sm'"/>
              </div>
            </div>
          </div>
        </div>

        <!-- Services -->
        <div v-else-if="activeTab === 'services'" class="space-y-6">
          <div class="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 class="text-lg font-black text-slate-800">Servicios Contratados</h3>
          </div>
          <!-- Inline add service -->
          <div class="flex flex-wrap gap-3 items-center bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div class="flex-1 min-w-[200px]">
              <label class="sr-only">Nombre del servicio</label>
              <input v-model="serviceName" placeholder="Ej: Mantenimiento Mensual" class="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-sm" />
            </div>
            <div class="w-full sm:w-auto">
              <label class="sr-only">Plan (opcional)</label>
              <input v-model="servicePlan" placeholder="Plan Premium" class="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-sm" />
            </div>
            <div class="w-full sm:w-auto">
              <label class="sr-only">Estado</label>
              <select v-model="serviceStatus" class="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-sm">
                <option value="active">Activo</option>
                <option value="paused">Pausado</option>
                <option value="cancelled">Cancelado</option>
                <option value="trial">Prueba</option>
              </select>
            </div>
            <button @click="createService" class="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-sm transition-colors">
              <i class="fas fa-plus mr-1"></i> Agregar
            </button>
          </div>
          
          <div v-if="client.services?.length" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div v-for="s in client.services" :key="s._id" class="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-md transition-all shadow-sm">
              <!-- view mode -->
              <div v-if="editingServiceId !== s._id" class="flex flex-col h-full justify-between gap-3">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="text-slate-800 font-black">{{ s.name }}</h4>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-slate-500 text-sm font-medium">{{ s.plan || 'Sin plan' }}</span>
                      <span class="text-slate-300">•</span>
                      <span :class="{
                        'bg-emerald-100 text-emerald-700 border-emerald-200': s.status === 'active',
                        'bg-amber-100 text-amber-700 border-amber-200': s.status === 'paused',
                        'bg-blue-100 text-blue-700 border-blue-200': s.status === 'trial',
                        'bg-slate-100 text-slate-600 border-slate-200': s.status === 'cancelled',
                      }" class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border">
                        {{ s.status === 'active' ? 'Activo' : s.status === 'paused' ? 'Pausado' : s.status === 'trial' ? 'Prueba' : 'Cancelado' }}
                      </span>
                    </div>
                  </div>
                  <div class="flex gap-1">
                    <button @click="startEditService(s)" class="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"><i class="fas fa-edit"></i></button>
                    <button @click="deleteService(s._id)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><i class="fas fa-trash"></i></button>
                  </div>
                </div>
                <p v-if="s.notes" class="text-slate-600 text-sm p-3 bg-slate-50 rounded-lg border border-slate-100 mt-2">{{ s.notes }}</p>
              </div>
              <!-- edit mode -->
              <div v-else class="flex flex-col gap-3">
                <div class="flex flex-col sm:flex-row gap-3">
                  <input v-model="editServicePlan" placeholder="Plan" class="w-full sm:w-1/2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:ring-2 focus:ring-primary-500" />
                  <select v-model="editServiceStatus" class="w-full sm:w-1/2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:ring-2 focus:ring-primary-500">
                    <option value="active">Activo</option>
                    <option value="paused">Pausado</option>
                    <option value="cancelled">Cancelado</option>
                    <option value="trial">Prueba</option>
                  </select>
                </div>
                <input v-model="editServiceNotes" placeholder="Notas del servicio..." class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:ring-2 focus:ring-primary-500" />
                <div class="flex gap-2 justify-end mt-2">
                  <button @click="cancelEditService" class="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">Cancelar</button>
                  <button @click="confirmEditService" class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700">Guardar</button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <i class="fas fa-box-open text-3xl text-slate-300 mb-3"></i>
            <p class="text-slate-500 font-medium">No hay servicios registrados para este cliente.</p>
          </div>
        </div>

        <!-- Commitments -->
        <div v-else-if="activeTab === 'commitments'" class="space-y-6">
          <div class="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 class="text-lg font-black text-slate-800">Compromisos y Tareas</h3>
          </div>
          <!-- Inline add commitment -->
          <div class="flex flex-wrap gap-3 items-center bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div class="flex-1 min-w-[200px]">
              <label class="sr-only">Título del compromiso</label>
              <input v-model="commitTitle" placeholder="Ej: Enviar propuesta comercial" class="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-sm" />
            </div>
            <div class="w-full sm:w-auto">
              <label class="sr-only">Fecha límite</label>
              <input v-model="commitDueDate" type="date" class="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-sm" />
            </div>
            <div class="w-full sm:w-auto">
              <label class="sr-only">Estado</label>
              <select v-model="commitStatus" class="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-sm">
                <option value="pending">Pendiente</option>
                <option value="in_progress">En progreso</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <button @click="createCommitment" class="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-sm transition-colors">
              <i class="fas fa-plus mr-1"></i> Agregar
            </button>
          </div>
          
          <div v-if="client.commitments?.length" class="space-y-3">
            <div v-for="c in client.commitments" :key="c._id" class="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-md transition-all shadow-sm">
              <!-- view mode -->
              <div v-if="editingCommitmentId !== c._id" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1">
                    <h4 class="text-slate-800 font-black text-lg">{{ c.title }}</h4>
                    <span :class="{
                      'bg-slate-100 text-slate-600 border-slate-200': c.status === 'pending',
                      'bg-primary-100 text-primary-700 border-primary-200': c.status === 'in_progress',
                      'bg-emerald-100 text-emerald-700 border-emerald-200': c.status === 'completed',
                      'bg-red-100 text-red-700 border-red-200': c.status === 'cancelled',
                    }" class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border">
                      {{ c.status === 'pending' ? 'Pendiente' : c.status === 'in_progress' ? 'En progreso' : c.status === 'completed' ? 'Completado' : 'Cancelado' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <i class="fas fa-calendar-alt text-slate-400"></i> {{ c.dueDate ? formatDate(c.dueDate).split(',')[0] : 'Sin fecha' }}
                  </div>
                  <p v-if="c.description" class="text-slate-600 text-sm mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">{{ c.description }}</p>
                </div>
                <div class="flex gap-2 sm:flex-col self-end sm:self-center">
                  <button @click="startEditCommitment(c)" class="px-3 py-1.5 text-xs font-bold bg-primary-50 text- primary-700 border border-primary-100 hover:bg-primary-100 rounded-lg transition-colors">Editar</button>
                  <button @click="deleteCommitment(c._id)" class="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 rounded-lg transition-colors">Eliminar</button>
                </div>
              </div>
              <!-- edit mode -->
              <div v-else class="flex flex-col gap-3">
                <div class="flex flex-col sm:flex-row gap-3">
                  <input v-model="editCommitDueDate" type="date" class="w-full sm:w-1/3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:ring-2 focus:ring-primary-500" />
                  <select v-model="editCommitStatus" class="w-full sm:w-1/3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:ring-2 focus:ring-primary-500">
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En progreso</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                <input v-model="editCommitDescription" placeholder="Descripción detallada..." class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:ring-2 focus:ring-primary-500" />
                <div class="flex gap-2 justify-end mt-2">
                  <button @click="cancelEditCommitment" class="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">Cancelar</button>
                  <button @click="confirmEditCommitment" class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700">Guardar</button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <i class="fas fa-check-circle text-3xl text-slate-300 mb-3"></i>
            <p class="text-slate-500 font-medium">No hay compromisos pendientes.</p>
          </div>
        </div>

        <!-- Preferences -->
        <div v-else-if="activeTab === 'preferences'" class="space-y-6">
          <div class="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 class="text-lg font-black text-slate-800">Preferencias del Cliente</h3>
          </div>
          <div class="flex flex-wrap gap-3 items-center bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div class="flex-1 min-w-[150px]">
              <input v-model="newPrefKey" placeholder="Clave (ej. Tono de comunicación)" class="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-sm" />
            </div>
            <div class="flex-1 min-w-[200px]">
              <input v-model="newPrefValue" placeholder="Valor (ej. Formal pero cercano)" class="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-sm" />
            </div>
            <button @click="addPreference" class="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-sm transition-colors">
              <i class="fas fa-plus mr-1"></i> Agregar
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="p in (client.preferences || [])" :key="p._id || p.key" class="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-slate-300 transition-colors">
              <div>
                <p class="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">{{ p.key }}</p>
                <p class="text-slate-800 font-medium">{{ p.value }}</p>
              </div>
              <button @click="removePreference(p)" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div v-if="!(client.preferences || []).length" class="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <i class="fas fa-heart text-3xl text-slate-300 mb-3"></i>
            <p class="text-slate-500 font-medium">No se han registrado preferencias.</p>
          </div>
        </div>

        <!-- Notes -->
        <div v-else-if="activeTab === 'notes'" class="space-y-6">
          <div class="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 class="text-lg font-black text-slate-800">Notas Adicionales</h3>
          </div>
          <div class="flex gap-3 items-start">
            <div class="flex-1">
              <textarea v-model="newNote" placeholder="Escribe una nueva nota o actualización (Presiona Ctr + Enter para guardar)" rows="3" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-sm resize-y"></textarea>
            </div>
            <button @click="addNote" class="px-5 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-sm transition-colors h-full">
              <i class="fas fa-save mb-1 block text-lg"></i>
              Guardar
            </button>
          </div>
          
          <div class="space-y-4">
            <div v-for="n in sortedNotes" :key="n._id" class="bg-white border text-sm rounded-xl p-5 shadow-sm transition-all" :class="n.pinned ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'">
              <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <span class="text-slate-500 text-xs font-bold flex items-center">
                  <i class="fas fa-clock mr-1.5 opacity-70"></i> {{ formatDate(n.createdAt) }}
                </span>
                <div class="flex gap-2">
                  <button @click="togglePin(n)" :class="n.pinned ? 'text-amber-500 bg-amber-50 border border-amber-200' : 'text-slate-400 bg-slate-50 border border-slate-200 hover:text-amber-500'" class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors">
                    <i class="fas fa-thumbtack" :class="{ 'rotate-45': !n.pinned }"></i>
                  </button>
                  <button @click="deleteNote(n._id)" class="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 bg-red-50 border border-red-100 hover:text-red-600 transition-colors">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <p class="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{{ n.content }}</p>
            </div>
            
            <div v-if="!sortedNotes.length" class="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              <i class="fas fa-sticky-note text-3xl text-slate-300 mb-3"></i>
              <p class="text-slate-500 font-medium">Aún no hay notas para este cliente.</p>
            </div>
          </div>
        </div>

        <!-- Custom Fields -->
        <div v-else-if="activeTab === 'custom'" class="space-y-6">
          <div class="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 class="text-lg font-black text-slate-800">Campos Personalizados</h3>
          </div>
          <div class="flex flex-wrap gap-3 items-center bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div class="flex-1 min-w-[150px]">
              <input v-model="newFieldKey" placeholder="Nombre del Campo" class="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-sm" />
            </div>
            <div class="flex-1 min-w-[200px]">
              <input v-model="newFieldValue" placeholder="Valor" class="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-sm" />
            </div>
            <button @click="addCustomField" class="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-sm transition-colors">
              <i class="fas fa-plus mr-1"></i> Agregar
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="f in (client.customFields || [])" :key="f._id || f.key" class="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-slate-300 transition-colors">
              <div>
                <p class="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">{{ f.key }}</p>
                <p class="text-slate-800 font-medium">{{ f.value }}</p>
              </div>
              <button @click="removeCustomField(f)" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div v-if="!(client.customFields || []).length" class="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <i class="fas fa-sliders-h text-3xl text-slate-300 mb-3"></i>
            <p class="text-slate-500 font-medium">Añade campos personalizados a la medida de tu requerimiento.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { clientService } from '@/services/clientService'
import { API_CONFIG } from '@/config/api'
import { useNotifications } from '@/composables/useNotifications'

const { showError } = useNotifications()

const route = useRoute()
const id = route.params.id as string
const client = reactive<any>({})
const draft = reactive<any>({ profile: {}, tags: [] })
const editOverview = ref(false)
const newTag = ref('')
const newNote = ref('')
const newPrefKey = ref('')
const newPrefValue = ref('')
const newFieldKey = ref('')
const newFieldValue = ref('')

const tabs = [
  { key: 'overview', label: 'Resumen', icon: 'fas fa-user' },
  { key: 'services', label: 'Servicios', icon: 'fas fa-box' },
  { key: 'commitments', label: 'Compromisos', icon: 'fas fa-handshake' },
  { key: 'preferences', label: 'Preferencias', icon: 'fas fa-heart' },
  { key: 'notes', label: 'Notas', icon: 'fas fa-sticky-note' },
  { key: 'custom', label: 'Campos', icon: 'fas fa-sliders-h' }
]
const activeTab = ref('overview')

// Helper: safe JSON parsing with clearer errors
const parseJsonSafe = async (res: Response) => {
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    const text = await res.text()
    throw new Error(`Respuesta no-JSON (${res.status}): ${text.slice(0, 200)}...`)
  }
  return res.json()
}

// Detect backend capability and fetch details with fallback to legacy route
const fetchDetail = async () => {
  try {
    let res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/detail`)
    if (res.status === 404) {
      // Fallback to legacy endpoint
      res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}`)
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await parseJsonSafe(res)
    Object.assign(client, data)
    Object.assign(draft, JSON.parse(JSON.stringify(data)))
  } catch (err) {
    console.error('Error cargando detalle del cliente:', err)
    showError('No se pudo cargar el detalle del cliente.')
  }
}

const saveOverview = async () => {
  try {
    const payload = {
      email: draft.email,
      phone: draft.phone,
      company: draft.company,
      tags: draft.tags,
      profile: draft.profile,
      // Persist arrays if backend ya soporta; si no, serán ignoradas sin romper
      preferences: draft.preferences,
      customFields: draft.customFields
    }

    let res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/detail`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.status === 404) {
      // Fallback a endpoint legacy PUT /clients/:id
      res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await parseJsonSafe(res)
    Object.assign(client, data)
    Object.assign(draft, JSON.parse(JSON.stringify(data)))
    editOverview.value = false
  } catch (err) {
    console.error('Error guardando cambios:', err)
    showError('No se pudieron guardar los cambios.')
  }
}

const addTag = () => {
  const v = newTag.value.trim()
  if (!v) return
  draft.tags = [...(draft.tags || []), v]
  newTag.value = ''
}

// Notes
const sortedNotes = computed(() => (client.notes || []).slice().sort((a:any,b:any)=>{
  if (a.pinned && !b.pinned) return -1
  if (!a.pinned && b.pinned) return 1
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}))

const addNote = async () => {
  const content = newNote.value.trim()
  if (!content) return
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/notes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const note = await parseJsonSafe(res)
    client.notes = [note, ...(client.notes || [])]
    newNote.value = ''
  } catch (err) {
    console.error('Error agregando nota:', err)
    showError('No se pudo agregar la nota.')
  }
}

const togglePin = async (n:any) => {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/notes/${n._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pinned: !n.pinned })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const upd = await parseJsonSafe(res)
    Object.assign(n, upd)
  } catch (err) {
    console.error('Error actualizando nota:', err)
    showError('No se pudo actualizar la nota.')
  }
}

const deleteNote = async (noteId:string) => {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/notes/${noteId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    client.notes = (client.notes || []).filter((n:any)=>n._id!==noteId)
  } catch (err) {
    console.error('Error eliminando nota:', err)
    showError('No se pudo eliminar la nota.')
  }
}

// Services (inline)
const serviceName = ref('')
const servicePlan = ref('')
const serviceStatus = ref<'active' | 'paused' | 'cancelled' | 'trial'>('active')
const editingServiceId = ref<string | null>(null)
const editServicePlan = ref('')
const editServiceNotes = ref('')
const editServiceStatus = ref<'active' | 'paused' | 'cancelled' | 'trial'>('active')

const createService = async () => {
  const name = serviceName.value.trim()
  if (!name) return
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/services`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, plan: servicePlan.value || undefined, status: serviceStatus.value })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const svc = await parseJsonSafe(res)
    client.services = [...(client.services || []), svc]
    serviceName.value = ''
    servicePlan.value = ''
    serviceStatus.value = 'active'
  } catch (err) {
    console.error('Error agregando servicio:', err)
    showError('No se pudo agregar el servicio.')
  }
}
const startEditService = (s:any) => {
  editingServiceId.value = s._id
  editServicePlan.value = s.plan || ''
  editServiceNotes.value = s.notes || ''
  editServiceStatus.value = s.status || 'active'
}
const cancelEditService = () => {
  editingServiceId.value = null
}
const confirmEditService = async () => {
  if (!editingServiceId.value) return
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/services/${editingServiceId.value}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: editServicePlan.value || undefined, notes: editServiceNotes.value || undefined, status: editServiceStatus.value })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const upd = await parseJsonSafe(res)
    const idx = (client.services || []).findIndex((x:any)=>x._id===editingServiceId.value)
    if (idx !== -1) client.services[idx] = upd
    editingServiceId.value = null
  } catch (err) {
    console.error('Error editando servicio:', err)
    showError('No se pudo editar el servicio.')
  }
}
const deleteService = async (serviceId:string) => {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/services/${serviceId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    client.services = (client.services || []).filter((s:any)=>s._id!==serviceId)
  } catch (err) {
    console.error('Error eliminando servicio:', err)
    showError('No se pudo eliminar el servicio.')
  }
}

// Commitments (inline)
const commitTitle = ref('')
const commitDueDate = ref<string>('')
const commitStatus = ref<'pending'|'in_progress'|'completed'|'cancelled'>('pending')
const editingCommitmentId = ref<string | null>(null)
const editCommitDescription = ref('')
const editCommitDueDate = ref<string>('')
const editCommitStatus = ref<'pending'|'in_progress'|'completed'|'cancelled'>('pending')

const createCommitment = async () => {
  const title = commitTitle.value.trim()
  if (!title) return
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/commitments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        title,
        status: commitStatus.value,
        dueDate: commitDueDate.value ? new Date(commitDueDate.value).toISOString() : undefined
      })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const item = await parseJsonSafe(res)
    client.commitments = [...(client.commitments || []), item]
    commitTitle.value = ''
    commitDueDate.value = ''
    commitStatus.value = 'pending'
  } catch (err) {
    console.error('Error agregando compromiso:', err)
    showError('No se pudo agregar el compromiso.')
  }
}
const startEditCommitment = (c:any) => {
  editingCommitmentId.value = c._id
  editCommitDescription.value = c.description || ''
  editCommitStatus.value = c.status || 'pending'
  editCommitDueDate.value = c.dueDate ? new Date(c.dueDate).toISOString().slice(0,10) : ''
}
const cancelEditCommitment = () => {
  editingCommitmentId.value = null
}
const confirmEditCommitment = async () => {
  if (!editingCommitmentId.value) return
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/commitments/${editingCommitmentId.value}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        description: editCommitDescription.value || undefined,
        status: editCommitStatus.value,
        dueDate: editCommitDueDate.value ? new Date(editCommitDueDate.value).toISOString() : undefined
      })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const upd = await parseJsonSafe(res)
    const idx = (client.commitments || []).findIndex((x:any)=>x._id===editingCommitmentId.value)
    if (idx !== -1) client.commitments[idx] = upd
    editingCommitmentId.value = null
  } catch (err) {
    console.error('Error editando compromiso:', err)
    showError('No se pudo editar el compromiso.')
  }
}
const deleteCommitment = async (commitmentId:string) => {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/clients/${id}/commitments/${commitmentId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    client.commitments = (client.commitments || []).filter((c:any)=>c._id!==commitmentId)
  } catch (err) {
    console.error('Error eliminando compromiso:', err)
    showError('No se pudo eliminar el compromiso.')
  }
}

// Preferences (fix persist)
const addPreference = async () => {
  const key = newPrefKey.value.trim(); const value = newPrefValue.value.trim();
  if (!key) return
  // update draft (source of truth for saveOverview)
  draft.preferences = [...(draft.preferences || []), { key, value }]
  // optimistic UI
  client.preferences = JSON.parse(JSON.stringify(draft.preferences))
  newPrefKey.value = ''; newPrefValue.value = ''
  await saveOverview()
}
const removePreference = async (pref:any) => {
  const next = (draft.preferences || []).filter((p:any)=> (p._id && pref._id) ? p._id !== pref._id : p.key !== pref.key)
  draft.preferences = next
  client.preferences = JSON.parse(JSON.stringify(next))
  await saveOverview()
}

// Custom Fields (fix persist)
const addCustomField = async () => {
  const key = newFieldKey.value.trim(); const value = newFieldValue.value
  if (!key) return
  draft.customFields = [...(draft.customFields || []), { key, value }]
  client.customFields = JSON.parse(JSON.stringify(draft.customFields))
  newFieldKey.value=''; newFieldValue.value=''
  await saveOverview()
}
const removeCustomField = async (cf:any) => {
  const next = (draft.customFields || []).filter((f:any)=> (f._id && cf._id) ? f._id !== cf._id : f.key !== cf.key)
  draft.customFields = next
  client.customFields = JSON.parse(JSON.stringify(next))
  await saveOverview()
}

const formatDate = (d?: string|Date) => d ? new Date(d).toLocaleString('es-ES') : '—'

onMounted(fetchDetail)
</script>

<style scoped>
</style>
