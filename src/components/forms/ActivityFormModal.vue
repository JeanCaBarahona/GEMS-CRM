<template>
  <div class="fixed -inset-1 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300" @click="closeOnOutsideClick">
    <div
      class="bg-white rounded-3xl shadow-2xl border border-slate-200/60 w-full max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
      :class="isEditingTask ? 'max-w-6xl' : 'max-w-3xl'"
      @click.stop
    >
      <!-- Header compacto: al editar muestra autor y responsables -->
      <div class="flex items-center justify-between gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50/30 shrink-0">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100 shrink-0">
            <i :class="isEditing ? 'fas fa-pen-nib text-primary-500' : 'fas fa-rocket text-primary-500'" class="text-sm"></i>
          </div>
          <div class="min-w-0">
            <h2 class="text-lg font-black text-slate-800 tracking-tight leading-tight">
              {{ isEditing ? 'Refinar Tarea' : 'Lanzar Nueva Tarea' }}
            </h2>
            <div v-if="isEditing" class="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-0.5 text-[11px] text-slate-400">
              <span class="flex items-center gap-1.5">
                <i class="fas fa-user-pen text-[10px]"></i>
                Creada por <b class="font-bold text-slate-600">{{ creatorName }}</b>
                <template v-if="createdAtLabel">· {{ createdAtLabel }}</template>
              </span>
              <span class="flex items-center gap-1.5" :title="ownerNames.join(', ')">
                <i class="fas fa-user-check text-[10px]"></i>
                Responsable: <b class="font-bold text-slate-600">{{ ownersLabel }}</b>
              </span>
            </div>
            <p v-else class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
              Gestión de Productividad Customer Touch
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          title="Cerrar sin guardar los cambios"
          class="w-9 h-9 shrink-0 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
        >
          <i class="fas fa-times text-lg"></i>
        </button>
      </div>

      <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- ── Formulario: cuerpo con scroll y acciones fijas abajo ── -->
      <form @submit.prevent="handleSubmit" class="flex-1 min-w-0 flex flex-col min-h-0">
        <div class="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
          <div class="space-y-4">

            <!-- Título -->
            <div class="form-section group/field space-y-1.5">
              <div class="flex items-center justify-between">
                <label :class="labelClass">Título de la Actividad</label>
                <VoiceDictateButton v-model="form.title" size="xs" />
              </div>
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full px-5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all text-sm font-bold shadow-sm placeholder-slate-300"
                placeholder="Ej: Implementar pasarela de pagos..."
              />
            </div>

            <!-- Fila 1: Tipo, Prioridad, Estado -->
            <div class="form-section grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="group/field space-y-1.5">
                <label :class="labelClass">Tipo</label>
                <CustomSelect
                  v-model="form.type"
                  size="dense"
                  :options="[
                    { value: 'task', label: 'Tarea Estándar' },
                    { value: 'bug', label: 'Bug / Error' },
                    { value: 'feature', label: 'Mejora / Feature' },
                    { value: 'user-story', label: 'Historia de Usuario' },
                    ...(isBoardTask ? [] : [{ value: 'recurring', label: 'Recurrente (diaria)' }])
                  ]"
                />
              </div>
              <div class="group/field space-y-1.5">
                <label :class="labelClass">Prioridad</label>
                <CustomSelect
                  v-model="form.priority"
                  size="dense"
                  :options="[
                    { value: 'low', label: 'Baja (Mantenimiento)' },
                    { value: 'medium', label: 'Media (Normal)' },
                    { value: 'high', label: 'Alta (Importante)' },
                    { value: 'urgent', label: 'Crítica (Urgente)' }
                  ]"
                />
              </div>
              <!-- Estado: mueve la actividad de columna en el Kanban de Actividades
                   (y al arrastrarla allá, cambia aquí) -->
              <div v-if="!isBoardTask" class="group/field space-y-1.5">
                <label :class="labelClass">Estado</label>
                <CustomSelect v-model="form.status" size="dense" :options="statusOptions" />
              </div>
            </div>

            <!-- Fila 1b: Ambiente y fechas -->
            <div class="form-section grid grid-cols-1 md:grid-cols-3 gap-4">
              <div v-if="!isBoardTask" class="group/field space-y-1.5">
                <label :class="labelClass">Ambiente</label>
                <CustomSelect
                  v-model="form.environment"
                  size="dense"
                  placeholder="Sin definir"
                  :options="[
                    { value: '', label: 'Sin definir' },
                    { value: 'development', label: 'En Desarrollo' },
                    { value: 'testing', label: 'Prueba' },
                    { value: 'production', label: 'Producción' }
                  ]"
                />
              </div>
              <div class="group/field space-y-1.5">
                <label :class="labelClass">Inicio</label>
                <div class="relative group">
                  <input
                    v-model="form.date"
                    type="datetime-local"
                    class="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all text-xs font-bold shadow-sm"
                  />
                </div>
              </div>
              <!-- Una recurrente no tiene fecha de entrega: no vence -->
              <div v-if="form.type !== 'recurring'" class="group/field space-y-1.5">
                <label :class="labelClass">Entrega</label>
                <div class="relative group">
                  <input
                    v-model="form.dueDate"
                    type="datetime-local"
                    class="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all text-xs font-bold shadow-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Tarea recurrente: registro diario con "+" -->
            <div
              v-if="!isBoardTask && form.type === 'recurring'"
              class="form-section flex items-center gap-4 px-4 py-3 bg-teal-50/60 border border-teal-100 rounded-2xl"
            >
              <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <i class="fas fa-repeat"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-black text-slate-700">Tarea recurrente diaria</p>
                <p v-if="isEditing" class="text-[11px] text-slate-500 mt-0.5">
                  <b class="text-slate-700">{{ recurring.totalDays }}</b> días registrados ·
                  racha de <b class="text-slate-700">{{ recurring.streak }}</b> día(s) hábiles ·
                  hoy: <b :class="recurring.doneToday ? 'text-teal-600' : 'text-amber-600'">{{ recurring.doneToday ? 'hecha' : 'pendiente' }}</b>
                </p>
                <p v-else class="text-[11px] text-slate-500 mt-0.5">No vence ni se completa: cada día, quien la hace le da <b>+</b> para registrarla.</p>
              </div>
              <button
                v-if="isEditing"
                type="button"
                @click="toggleDailyCheck"
                :disabled="checkingDaily"
                class="shrink-0 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
                :class="recurring.doneToday
                  ? 'bg-teal-500 text-white shadow-sm shadow-teal-200 hover:bg-teal-600'
                  : 'bg-white text-teal-600 border border-teal-200 hover:bg-teal-50'"
                :title="recurring.doneToday ? 'Ya la registraste hoy — clic para deshacer' : 'Registrar que hiciste esta tarea hoy'"
              >
                <i :class="recurring.doneToday ? 'fas fa-check' : 'fas fa-plus'" class="mr-1.5"></i>{{ recurring.doneToday ? 'Hecha hoy' : 'Hoy' }}
              </button>
            </div>

            <!-- Fila 2: Cliente/Equipo y Detalles -->
            <div class="form-section grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              <!-- Columna Izquierda -->
              <div class="flex flex-col gap-4 min-h-0">
                <div class="group/field space-y-1.5">
                  <label :class="labelClass">Cliente</label>
                  <CustomSelect
                    v-model="form.clientId"
                    size="dense"
                    searchable
                    :options="[
                      { value: '', label: 'Interno' },
                      ...(clients || []).map(client => ({ value: client._id, label: client.company || client.name }))
                    ]"
                  />
                </div>
                <ProjectSelect
                  v-model="form.projectId"
                  :client-id="form.clientId || null"
                  size="dense"
                  auto-select-default
                />
                <!-- Feature a la que pertenece la tarea (no aplica si se está creando una feature) -->
                <div v-if="!isBoardTask && form.type !== 'feature'" class="group/field space-y-1.5">
                  <label :class="labelClass">Feature</label>
                  <CustomSelect
                    v-model="form.featureId"
                    size="dense"
                    searchable
                    :loading="loadingFeatures"
                    :disabled="!form.projectId"
                    :placeholder="form.projectId ? 'Sin feature' : 'Primero selecciona un proyecto'"
                    :options="[
                      { value: '', label: 'Sin feature' },
                      ...projectFeatures.map(f => ({ value: f._id!, label: f.title }))
                    ]"
                  />
                </div>
                <!-- Se estira para llenar el alto de la fila; tope para que la lista no crezca sin fin -->
                <div class="group/field flex-1 flex flex-col gap-1.5 min-h-0 max-h-[280px]">
                  <label :class="labelClass">Equipo Responsable</label>
                  <div class="bg-slate-50/50 border border-slate-200 rounded-2xl p-2.5 shadow-inner flex-1 flex flex-col overflow-hidden min-h-0 transition-colors group-focus-within/field:border-primary-300">
                    <AssignedUsersSelector
                      v-model="form.assignedTo"
                      :teamMembers="teamMembers"
                    />
                  </div>
                </div>
              </div>

              <!-- Columna Derecha: la descripción crece para que Tiempo y Avance
                   queden alineados con el final del Equipo Responsable -->
              <div class="flex flex-col gap-4 min-h-0">
                <div class="group/field flex-1 flex flex-col gap-1.5 min-h-0">
                  <div class="flex items-center justify-between">
                    <label :class="labelClass">Detalles y Notas</label>
                    <VoiceDictateButton v-model="form.description" size="xs" />
                  </div>
                  <textarea
                    v-model="form.description"
                    rows="4"
                    class="flex-1 min-h-[6rem] w-full px-5 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-300 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all resize-none text-sm font-medium leading-relaxed shadow-sm custom-scrollbar"
                    placeholder="Describe el contexto, los pasos o notas de la tarea..."
                  ></textarea>
                </div>

                <!-- Criterios de aceptación: aparte de la descripción para que quien
                     desarrolla vea de un vistazo el alcance esperado -->
                <div v-if="!isBoardTask" class="group/field shrink-0 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <label :class="labelClass">Criterios de Aceptación</label>
                    <VoiceDictateButton v-model="form.acceptanceCriteria" size="xs" />
                  </div>
                  <textarea
                    v-model="form.acceptanceCriteria"
                    rows="4"
                    class="w-full px-5 py-3 bg-emerald-50/30 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-300 hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all resize-none text-sm font-medium leading-relaxed shadow-sm custom-scrollbar"
                    placeholder="Un criterio por línea. Ej:&#10;- El usuario recibe el correo de confirmación&#10;- El reporte se exporta en Excel"
                  ></textarea>
                </div>

                <!-- Tiempo Estimado -->
                <div class="group/field shrink-0 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <label :class="labelClass">Tiempo Estimado</label>
                    <button
                      type="button"
                      @click="form.estimatedTime = ''"
                      class="text-[11px] font-black uppercase tracking-widest text-primary-500 hover:text-primary-600 transition-opacity duration-200"
                      :class="form.estimatedTime ? 'opacity-100' : 'opacity-0 pointer-events-none'"
                    >Limpiar</button>
                  </div>
                  <div class="grid grid-cols-4 gap-2">
                    <button
                      v-for="time in ESTIMATE_PRESETS"
                      :key="time"
                      type="button"
                      @click="form.estimatedTime = time"
                      class="px-1 py-2 rounded-xl text-[11px] font-black tracking-wider uppercase transition-all duration-200 border shadow-sm flex items-center justify-center gap-1 active:scale-95"
                      :class="form.estimatedTime === time
                        ? 'bg-primary-500 text-white border-primary-600 ring-2 ring-primary-500/20 shadow-primary-500/20'
                        : 'bg-white text-slate-500 border-slate-200 hover:-translate-y-px hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'"
                    >
                      <i class="fas fa-clock opacity-70 hidden sm:inline-block"></i>
                      {{ time }}
                    </button>

                    <div class="col-span-2 relative group">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-pen text-[10px] text-slate-400 group-focus-within:text-primary-500 transition-colors"></i>
                      </div>
                      <input
                        v-model="form.estimatedTime"
                        type="text"
                        placeholder="Ej: 3.5h"
                        class="w-full h-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-[11px] font-black hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm placeholder-slate-300"
                      />
                    </div>
                  </div>
                </div>

                <!-- Avance -->
                <div class="shrink-0 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avance</span>
                  <input
                    type="range"
                    v-model.number="form.completionPercentage"
                    min="0" max="100" step="5"
                    class="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  <span
                    class="w-10 text-right text-[11px] font-black tabular-nums transition-colors duration-300"
                    :class="(form.completionPercentage || 0) >= 100 ? 'text-emerald-500' : 'text-slate-500'"
                  >{{ form.completionPercentage || 0 }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones fijas: Guardar siempre visible sin hacer scroll -->
        <div class="shrink-0 flex items-center gap-3 px-5 py-3 border-t border-slate-100 bg-white shadow-[0_-8px_16px_-12px_rgba(15,23,42,0.18)]">
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-x-1"
            leave-active-class="transition duration-150 ease-in"
            leave-to-class="opacity-0"
          >
            <span v-if="isEditing && isDirty" class="flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Cambios sin guardar
            </span>
          </Transition>
          <div class="ml-auto flex items-center gap-3">
            <button
              type="button"
              @click="$emit('close')"
              title="Cerrar sin guardar los cambios"
              class="px-5 py-2.5 bg-white text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl transition-all font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 active:scale-95"
            >
              Descartar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all font-black text-[11px] uppercase tracking-[0.15em] shadow-lg shadow-primary-200 flex items-center justify-center gap-2 active:scale-95 group"
            >
              <div v-if="loading" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <i v-else :class="isEditing ? 'fas fa-save' : 'fas fa-paper-plane'" class="group-hover:translate-x-0.5 transition-transform"></i>
              {{ loading ? 'Sincronizando...' : (isEditing ? 'Guardar Cambios' : 'Lanzar Tarea') }}
            </button>
          </div>
        </div>
      </form>
      <!-- ── Fin formulario ── -->

      <!-- ── Columna de Comentarios (solo al editar una tarea) ── -->
      <div
        v-if="isEditingTask"
        class="w-[22rem] shrink-0 border-l border-slate-100 flex flex-col bg-slate-50/60"
      >
        <!-- Pestañas tipo segmento: Comentarios / Adjuntos / Historial -->
        <div class="px-4 pt-4 pb-3 shrink-0">
          <div
            class="relative grid gap-1 p-1 bg-slate-100/80 rounded-xl"
            :style="{ gridTemplateColumns: `repeat(${sideTabs.length}, minmax(0, 1fr))` }"
          >
            <!-- Indicador deslizante de la pestaña activa -->
            <span
              class="absolute top-1 bottom-1 left-1 bg-white rounded-lg shadow-sm transition-transform duration-300 ease-out"
              :style="{
                width: `calc((100% - 0.5rem - ${sideTabs.length - 1} * 0.25rem) / ${sideTabs.length})`,
                transform: `translateX(calc(${Math.max(0, sideTabs.findIndex(t => t.key === sideTab))} * (100% + 0.25rem)))`
              }"
              aria-hidden="true"
            ></span>
            <button
              v-for="t in sideTabs"
              :key="t.key"
              type="button"
              @click="sideTab = t.key"
              :title="t.tooltip"
              class="relative z-10 flex flex-col items-center justify-center gap-1 py-2 px-1 transition-colors"
              :class="sideTab === t.key ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'"
            >
              <span class="relative">
                <i :class="t.icon" class="text-sm"></i>
                <span
                  v-if="t.count"
                  class="absolute -top-1.5 -right-3 min-w-[1rem] h-4 px-1 rounded-full text-[9px] font-black leading-4 text-center ring-2 transition-colors"
                  :class="sideTab === t.key ? 'bg-primary-500 text-white ring-white' : 'bg-slate-300 text-white ring-slate-100'"
                >{{ t.count }}</span>
              </span>
              <span class="text-[11px] font-bold leading-none">{{ t.label }}</span>
            </button>
          </div>
        </div>

        <Transition name="side-panel" mode="out-in">
        <!-- Historial de la tarea (scrollable) -->
        <div v-if="showHistory" key="history" class="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          <TaskHistory :task="localTask" variant="light" :show-creator="false" />
        </div>

        <!-- Adjuntos (solo actividades): enlaces externos o capturas guardadas en la base -->
        <div
          v-else-if="sideTab === 'attachments'"
          key="attachments"
          class="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar focus:outline-none"
          tabindex="0"
          @paste="onAttachmentPaste"
        >
          <!-- Enlace -->
          <form class="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 space-y-2" @submit.prevent="addLinkAttachment">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agregar enlace</p>
            <input
              v-model="newLinkUrl"
              type="url"
              placeholder="https://drive.google.com/..."
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-700 placeholder-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
            <div class="flex gap-2">
              <input
                v-model="newLinkName"
                type="text"
                placeholder="Nombre (opcional)"
                class="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-700 placeholder-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
              <button
                type="submit"
                :disabled="!newLinkUrl.trim() || savingAttachment"
                class="px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-40"
                title="Guardar el enlace en esta tarea"
              >Agregar</button>
            </div>
          </form>

          <!-- Captura de pantalla -->
          <label
            class="flex flex-col items-center justify-center gap-1 py-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all"
            :class="draggingAttachment ? 'border-primary-400 bg-primary-50/60' : 'border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50/30'"
            title="Adjuntar una captura de pantalla a esta tarea"
            @dragover.prevent="draggingAttachment = true"
            @dragleave.prevent="draggingAttachment = false"
            @drop.prevent="onAttachmentDrop"
          >
            <i v-if="!savingAttachment" class="fas fa-image text-lg text-slate-300"></i>
            <div v-else class="w-5 h-5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            <span class="text-[11px] font-bold text-slate-500">{{ savingAttachment ? 'Guardando...' : 'Captura de pantalla' }}</span>
            <span class="text-[10px] text-slate-300">Arrastra, haz clic o pega con Ctrl+V</span>
            <input type="file" accept="image/*" multiple class="hidden" @change="onAttachmentSelect" :disabled="savingAttachment" />
          </label>

          <p v-if="allAttachments.length === 0" class="text-center text-[11px] text-slate-300 font-medium py-3">Sin adjuntos todavía</p>

          <div
            v-for="att in allAttachments"
            :key="att._id"
            class="group flex items-center gap-2.5 px-3 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <button
              v-if="isImageAttachment(att)"
              type="button"
              class="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-100"
              @click="previewUrl = att.url"
              title="Ver la captura en grande"
            >
              <img :src="att.url" class="w-full h-full object-cover" />
            </button>
            <div v-else class="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
              <i :class="attachmentIcon(att)" class="text-slate-400 text-sm"></i>
            </div>
            <div class="min-w-0 flex-1">
              <button
                v-if="isImageAttachment(att)"
                type="button"
                @click="previewUrl = att.url"
                class="block text-left text-[12px] font-bold text-slate-700 truncate hover:text-primary-600 w-full"
                title="Ver la captura en grande"
              >{{ att.name }}</button>
              <a
                v-else
                :href="att.url"
                target="_blank"
                rel="noopener noreferrer"
                class="block text-[12px] font-bold text-slate-700 truncate hover:text-primary-600"
                :title="`Abrir ${att.url} en una pestaña nueva`"
              >{{ att.name }}</a>
              <p class="text-[10px] text-slate-400 truncate">
                {{ attachmentSubtitle(att) }}<template v-if="attachmentUploader(att)"> · {{ attachmentUploader(att) }}</template>
              </p>
            </div>
            <button
              v-if="att.fromComment"
              type="button"
              @click="sideTab = 'comments'"
              class="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 hover:bg-primary-50 hover:text-primary-600 text-[9px] font-bold transition-colors"
              title="Viene de un comentario — para quitarlo, edita o borra el comentario"
            >
              <i class="fas fa-comment text-[8px]"></i>Comentario
            </button>
            <button
              v-else
              type="button"
              @click="removeAttachment(att)"
              class="w-6 h-6 rounded-md text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shrink-0"
              title="Quitar este adjunto de la tarea"
            >
              <i class="fas fa-trash text-[10px]"></i>
            </button>
          </div>
        </div>

        <!-- Lista de comentarios (scrollable) -->
        <div v-else key="comments" class="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
          <!-- Empty state -->
          <div v-if="localComments.length === 0 && !loadingComments" class="flex flex-col items-center justify-center py-10 text-center">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <i class="fas fa-comment-slash text-slate-300 text-lg"></i>
            </div>
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sin comentarios</p>
            <p class="text-[10px] text-slate-300 mt-1">Sé el primero en comentar</p>
          </div>

          <!-- Comentarios (instantáneo desde props.activity) -->
          <div
            v-for="comment in localComments"
            :key="comment._id"
            class="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200 group"
          >
            <div class="flex items-center gap-2 mb-1.5">
              <PersonAvatar :name="commentAuthorName(comment)" :photo="comment?.userId?.photo || comment?.author?.photo" class="w-6 h-6 rounded-full bg-primary-500 text-white text-[9px] font-black" />
              <span class="text-[11px] font-black text-slate-700 truncate">{{ commentAuthorName(comment) }}</span>
              <span class="text-[10px] text-slate-300 ml-auto shrink-0">{{ formatCommentDate(comment.createdAt) }}</span>

              <!-- Botones edit/delete (solo autor) -->
              <div v-if="canEditComment(comment)" class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                <button
                  type="button"
                  @click="startEditComment(comment)"
                  class="w-5 h-5 rounded-md text-slate-400 hover:text-primary-500 hover:bg-primary-50 flex items-center justify-center transition-all"
                  title="Editar tu comentario"
                >
                  <i class="fas fa-pen text-[9px]"></i>
                </button>
                <button
                  type="button"
                  @click="deleteComment(comment)"
                  class="w-5 h-5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all"
                  title="Eliminar tu comentario"
                >
                  <i class="fas fa-trash text-[9px]"></i>
                </button>
              </div>
            </div>

            <!-- Modo edición -->
            <div v-if="editingCommentId === comment._id" class="ml-8">
              <textarea
                v-model="editingCommentText"
                rows="2"
                class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none transition-all"
              />
              <div class="flex items-center gap-2 mt-1.5">
                <button
                  type="button"
                  @click="saveEditComment(comment)"
                  :disabled="!editingCommentText.trim() || savingEdit"
                  class="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all disabled:opacity-40"
                >Guardar</button>
                <button
                  type="button"
                  @click="cancelEditComment"
                  class="px-3 py-1 bg-slate-100 text-slate-500 hover:bg-slate-200 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all"
                >Cancelar</button>
              </div>
            </div>

            <!-- Texto con menciones resaltadas -->
            <p
              v-else-if="comment.text"
              class="text-[12px] text-slate-600 leading-relaxed ml-8 whitespace-pre-wrap break-words"
              v-html="renderMentions(comment.text)"
            ></p>

            <!-- Imágenes del comentario -->
            <div v-if="comment.images && comment.images.length > 0" class="mt-2 ml-8 flex flex-wrap gap-1.5">
              <img
                v-for="(img, idx) in comment.images"
                :key="idx"
                :src="img.url"
                class="w-16 h-16 object-cover rounded-xl cursor-pointer border border-slate-100 hover:opacity-80 transition-opacity"
                @click="previewUrl = img.url"
              />
            </div>
          </div>
        </div>
        </Transition>

        <!-- Input nuevo comentario (fijo al fondo) -->
        <div v-if="sideTab === 'comments'" class="px-4 py-3 border-t border-slate-100 bg-white shrink-0 relative">
          <!-- Dropdown de menciones @ -->
          <div
            v-if="mentionOpen && mentionMatches.length > 0"
            class="absolute bottom-full left-4 right-4 mb-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-44 overflow-y-auto z-30"
          >
            <button
              v-for="(member, idx) in mentionMatches"
              :key="member._id || member.id || idx"
              type="button"
              @mousedown.prevent="selectMention(member)"
              class="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary-50 transition-colors text-left"
              :class="idx === mentionActiveIdx ? 'bg-primary-50' : ''"
            >
              <PersonAvatar :name="member.name" :photo="member.photo" class="w-6 h-6 rounded-full bg-primary-500 text-white text-[9px] font-black" />
              <div class="flex-1 min-w-0">
                <p class="text-[11px] font-bold text-slate-700 truncate">{{ member.name }}</p>
                <p v-if="member.email" class="text-[9px] text-slate-400 truncate">{{ member.email }}</p>
              </div>
            </button>
          </div>

          <!-- Previews de imágenes a enviar -->
          <div v-if="commentImagePreviews.length > 0" class="flex flex-wrap gap-1.5 mb-2">
            <div v-for="(src, idx) in commentImagePreviews" :key="idx" class="relative group">
              <img :src="src" class="w-12 h-12 object-cover rounded-xl border border-slate-200" />
              <button
                type="button"
                @click="removeCommentImage(idx)"
                class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >×</button>
            </div>
          </div>

          <textarea
            ref="commentTextarea"
            v-model="newCommentText"
            placeholder="Escribe un comentario... usa @ para mencionar"
            rows="2"
            @input="onCommentInput"
            @keydown="onCommentKeydown"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-300 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none transition-all"
          />
          <div class="flex items-center justify-between mt-2">
            <label class="cursor-pointer flex items-center gap-1.5 text-slate-400 hover:text-primary-500 transition-colors" title="Adjuntar imágenes al comentario">
              <i class="fas fa-image text-sm"></i>
              <span class="text-[10px] font-black uppercase tracking-wider">Imagen</span>
              <input
                ref="commentImageInput"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleCommentImageSelect"
              />
            </label>
            <button
              type="button"
              @click="submitComment"
              title="Publicar el comentario"
              :disabled="(!newCommentText.trim() && commentImages.length === 0) || submittingComment"
              class="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 shadow-sm shadow-primary-200"
            >
              <div v-if="submittingComment" class="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
              <i v-else class="fas fa-paper-plane text-[10px]"></i>
              {{ submittingComment ? '...' : 'Enviar' }}
            </button>
          </div>
        </div>
      </div>
      <!-- ── Fin columna comentarios ── -->

      </div><!-- flex row -->
    </div>
  </div>

  <!-- Lightbox imágenes -->
  <Teleport to="body">
    <div
      v-if="previewUrl"
      class="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 cursor-zoom-out"
      @click="previewUrl = null"
    >
      <img :src="previewUrl" class="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl" @click.stop />
      <button class="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white text-xl flex items-center justify-center transition-colors" @click="previewUrl = null">×</button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import axios from 'axios'
import { API_CONFIG } from '../../config/api'
import AssignedUsersSelector from '../AssignedUsersSelector.vue'
import CustomSelect from '../ui/CustomSelect.vue'
import ProjectSelect from './ProjectSelect.vue'
import VoiceDictateButton from '@/components/ui/VoiceDictateButton.vue'
import TaskHistory from '../tasks/TaskHistory.vue'
import { activityService, type ActivityData, type ActivityAttachment } from '../../services/activityService'
import { compressImageToDataUrl } from '../../utils/compressImage'
import { recurringStats } from '../../utils/recurring'
import { useBoardsStore } from '../../stores/boards'
import { useTasksStore } from '../../stores/tasks'
import { useAuthStore } from '../../stores/auth'
import { useNotifications } from '../../composables/useNotifications'
import type { TeamMember, Client } from '../../types'
import PersonAvatar from '../ui/PersonAvatar.vue'

console.log('ActivityFormModal script setup initialized')

const boardsStore = useBoardsStore()
const tasksStore = useTasksStore()
const authStore = useAuthStore()
const { showSuccess, showError, confirmDelete } = useNotifications()

interface Props {
  activity?: any | null
  clients: Client[]
  teamMembers: TeamMember[]
  initialBoardStatus?: string
  boardId?: string
  sprints?: any[]
  // Preseleccionan cliente/proyecto solo al crear (props.activity === null) —
  // para abrir el modal ya "anclado" a un proyecto, ej. desde su página de detalle.
  initialClientId?: string
  initialProjectId?: string | null
  // Solo al crear: abre el modal como "Nueva feature" o como tarea de una feature
  // (desde el Backlog del proyecto).
  initialType?: string
  initialFeatureId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  activity: null,
  clients: () => [],
  teamMembers: () => [],
  initialBoardStatus: 'backlog',
  initialClientId: '',
  initialProjectId: null,
  initialType: 'task',
  initialFeatureId: null
})

const emit = defineEmits<{
  close: []
  saved: [activity: any]
  // Cambios que no cierran el modal (ej. el "+" diario de una recurrente)
  updated: [activity: any]
}>()

const loading = ref(false)

const isEditing = computed(() => !!props.activity)

const form = reactive({
  title: '',
  description: '',
  clientId: '',
  projectId: null as string | null,
  assignedTo: [] as string[],
  priority: 'medium',
  status: 'pending',
  type: 'task',
  date: '',
  dueDate: '',
  estimatedTime: '',
  completionPercentage: 0,
  featureId: '' as string,
  acceptanceCriteria: '',
  environment: '' as string
})

// Estado de la actividad: los tres que usa el Kanban de Actividades. Si la
// actividad ya está en otro estado (vencida/cancelada) se muestra también, para
// no cambiarlo sin querer al guardar.
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  'in-progress': 'En progreso',
  completed: 'Completado',
  overdue: 'Vencida',
  cancelled: 'Cancelada'
}
const statusOptions = computed(() => {
  const base = ['pending', 'in-progress', 'completed']
  if (form.status && !base.includes(form.status)) base.push(form.status)
  return base.map(value => ({ value, label: STATUS_LABELS[value] || value }))
})

// Etiqueta de campo: se resalta mientras su campo (group/field) tiene el foco
const labelClass = 'block ml-1 text-[11px] font-black text-slate-400 uppercase tracking-widest transition-colors duration-200 group-focus-within/field:text-primary-500'

const ESTIMATE_PRESETS = ['15m', '30m', '1h', '2h', '4h', '8h']

// Estado del formulario al abrirlo, para avisar de cambios sin guardar
const savedSnapshot = ref('')
const isDirty = computed(() => !!savedSnapshot.value && JSON.stringify(form) !== savedSnapshot.value)

const populateForm = () => {
  try {
    console.log('Populating ActivityFormModal with:', props.activity)
    if (props.activity) {
      form.title = props.activity.title || ''
      form.description = props.activity.description || ''
      
      // Soporte para ambos: clientId (Activity) o client (Task)
      form.clientId = props.activity.clientId?._id || props.activity.clientId || 
                      props.activity.client?._id || props.activity.client || ''
      form.projectId = props.activity.projectId?._id || props.activity.projectId || null
      
      // Soporte para asignación múltiple (Activity) o única (Task)
      if (props.activity.assignedTo) {
        if (Array.isArray(props.activity.assignedTo)) {
          form.assignedTo = props.activity.assignedTo.map((u: any) => typeof u === 'object' ? (u?._id || '') : u).filter(Boolean)
        } else {
          // Es un objeto único (Task)
          const userId = typeof props.activity.assignedTo === 'object' ? props.activity.assignedTo?._id : props.activity.assignedTo
          form.assignedTo = userId ? [userId] : []
        }
      } else {
        form.assignedTo = []
      }

      form.priority = props.activity.priority || 'medium'
      form.status = props.activity.status || 'pending'
      form.type = props.activity.type || 'task'
      
      // Soporte para estimatedHours (Task) o estimatedTime (Activity)
      form.estimatedTime = props.activity.estimatedTime || (props.activity.estimatedHours ? `${props.activity.estimatedHours}h` : '')
      
      form.completionPercentage = props.activity.completionPercentage || 0
      
      const defaultDate = new Date().toISOString().slice(0, 16)
      form.date = props.activity.date ? formatDateTimeLocal(props.activity.date) : (props.activity.createdAt ? formatDateTimeLocal(props.activity.createdAt) : defaultDate)
      form.dueDate = props.activity.dueDate ? formatDateTimeLocal(props.activity.dueDate) : ''
      form.featureId = props.activity.featureId?._id || props.activity.featureId || ''
      // En tareas del tablero acceptanceCriteria es una lista; solo aplica el texto de actividades
      form.acceptanceCriteria = typeof props.activity.acceptanceCriteria === 'string' ? props.activity.acceptanceCriteria : ''
      form.environment = props.activity.environment || ''
    } else {
      // Valores por defecto para nueva tarea
      form.title = ''
      form.description = ''
      form.clientId = props.initialClientId || ''
      form.projectId = props.initialProjectId || null
      form.assignedTo = []
      form.priority = 'medium'
      form.status = 'pending'
      form.type = props.initialType || 'task'
      form.estimatedTime = ''
      form.completionPercentage = 0
      form.date = new Date().toISOString().slice(0, 16)
      form.dueDate = ''
      form.featureId = props.initialFeatureId || ''
      form.acceptanceCriteria = ''
      form.environment = ''
    }
    savedSnapshot.value = JSON.stringify(form)
  } catch (err) {
    console.error('Error in populateForm:', err)
  }
}

const formatDateTimeLocal = (dateString: any) => {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 16)
  } catch (e) {
    return ''
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const isTask = !!props.boardId || !!props.activity?.boardId || !!props.activity?.boardStatus
    
    const taskData: any = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: form.status,
      type: form.type,
      completionPercentage: form.completionPercentage,
      // Una recurrente no vence (el backend también lo fuerza)
      dueDate: form.type === 'recurring' ? null : (form.dueDate || undefined)
    }

    // Campos específicos según el modelo
    if (isTask) {
      taskData.boardId = props.boardId || props.activity?.boardId
      taskData.boardStatus = props.initialBoardStatus || props.activity?.boardStatus
      // En Task, assignedTo es usualmente el primer elemento o manejado diferente en el backend
      taskData.assignedTo = form.assignedTo[0] || null
      taskData.clientId = form.clientId || undefined
      taskData.projectId = form.projectId || null
      // Convertir estimatedTime (1.5h) a estimatedHours (1.5)
      const hours = parseFloat(form.estimatedTime.replace('h', ''))
      if (!isNaN(hours)) taskData.estimatedHours = hours
    } else {
      taskData.clientId = form.clientId || undefined
      taskData.projectId = form.projectId || null
      taskData.assignedTo = form.assignedTo
      taskData.estimatedTime = form.estimatedTime
      taskData.date = form.date
      // Campos propios de actividades (el modelo Task del tablero no los tiene
      // o, como acceptanceCriteria, los guarda con otra forma).
      taskData.featureId = form.type === 'feature' || !form.projectId ? null : (form.featureId || null)
      taskData.acceptanceCriteria = form.acceptanceCriteria
      taskData.environment = form.environment || null
      // Marcarla como completada desde el formulario deja el avance al 100%,
      // igual que al completarla desde el Kanban.
      if (form.status === 'completed') taskData.completionPercentage = 100
    }

    let savedData: any
    
    if (isEditing.value && props.activity?._id) {
      if (isTask) {
        savedData = await tasksStore.updateTask(props.activity._id, taskData)
      } else {
        savedData = await activityService.update(props.activity._id, taskData)
      }
      showSuccess(isTask ? 'Tarea actualizada' : 'Actividad actualizada')
    } else {
      if (isTask) {
        savedData = await tasksStore.createTask(taskData)
      } else {
        savedData = await activityService.create(taskData)
      }
      showSuccess(isTask ? 'Tarea creada con éxito' : 'Actividad creada con éxito')
    }
    
    emit('saved', savedData)
    emit('close')
  } catch (error) {
    showError('Error al sincronizar la información')
    console.error('Submit Error:', error)
  } finally {
    loading.value = false
  }
}

const closeOnOutsideClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

// ── Comentarios ────────────────────────────────────────────────────────────────

// Decidir si la entidad es una Task (board) o una Activity para elegir el endpoint correcto.
const isBoardTask = computed(() => {
  const a: any = props.activity
  return !!(a?.boardId || a?.boardStatus || props.boardId)
})

const commentEntityId = computed<string | null>(() => {
  const a: any = props.activity
  if (!a?._id) return null
  // Si es una task de board → usa ese _id contra /api/tasks
  // Si es una activity → usa ese _id contra /api/activities
  return a._id
})

// Mostrar columna de comentarios siempre que se esté editando algo con id
const isEditingTask = computed(() => isEditing.value && !!commentEntityId.value)

const localTask = ref<any>(props.activity)
const loadingComments = ref(false)
type SideTab = 'comments' | 'attachments' | 'history'
const sideTab = ref<SideTab>('comments')
const showHistory = computed(() => sideTab.value === 'history')

// ── Features del proyecto (selector "Feature") ──────────────────────────────
const projectFeatures = ref<ActivityData[]>([])
const loadingFeatures = ref(false)

// Devuelve false si no se pudieron cargar (para no borrar la feature elegida por un error de red)
async function loadProjectFeatures(): Promise<boolean> {
  if (isBoardTask.value || !form.projectId) {
    projectFeatures.value = []
    return true
  }
  loadingFeatures.value = true
  try {
    const selfId = props.activity?._id
    projectFeatures.value = (await activityService.getFeatures(form.projectId)).filter(f => f._id !== selfId)
    return true
  } catch {
    projectFeatures.value = []
    return false
  } finally {
    loadingFeatures.value = false
  }
}

// Al cambiar de proyecto, una feature de otro proyecto deja de aplicar
watch(() => form.projectId, async () => {
  const loaded = await loadProjectFeatures()
  if (loaded && form.featureId && !projectFeatures.value.some(f => f._id === form.featureId)) {
    form.featureId = ''
  }
})

// ── Adjuntos (solo actividades) ─────────────────────────────────────────────
const localAttachments = computed<ActivityAttachment[]>(() => localTask.value?.attachments || [])

// Las fotos y links que se ponen en los comentarios también se listan en Adjuntos.
// Se derivan de los comentarios (no se duplican en la BD): si se borra el
// comentario, desaparecen de aquí también.
type ListedAttachment = ActivityAttachment & { fromComment?: boolean }
const COMMENT_LINK = /https?:\/\/[^\s<>"']+/gi
const commentAttachments = computed<ListedAttachment[]>(() => {
  const items: ListedAttachment[] = []
  for (const comment of localComments.value as any[]) {
    const author = { name: commentAuthorName(comment) }
    ;(comment.images || []).forEach((img: any, i: number) => {
      if (!img?.url) return
      items.push({
        _id: `comment-${comment._id}-img-${i}`,
        kind: 'image',
        name: img.name || img.originalName || 'Imagen de un comentario',
        url: img.url,
        uploadedBy: author,
        uploadedAt: comment.createdAt,
        fromComment: true
      } as ListedAttachment)
    })
    for (const match of String(comment.text || '').matchAll(COMMENT_LINK)) {
      const url = match[0].replace(/[.,;:!?)\]]+$/, '')
      items.push({
        _id: `comment-${comment._id}-link-${match.index}`,
        kind: 'link',
        name: url.replace(/^https?:\/\/(www\.)?/i, ''),
        url,
        uploadedBy: author,
        uploadedAt: comment.createdAt,
        fromComment: true
      } as ListedAttachment)
    }
  }
  return items
})
const allAttachments = computed<ListedAttachment[]>(() => {
  const seen = new Set<string>()
  return [...localAttachments.value, ...commentAttachments.value].filter(att => {
    if (seen.has(att.url)) return false
    seen.add(att.url)
    return true
  })
})
const savingAttachment = ref(false)
const draggingAttachment = ref(false)
const newLinkUrl = ref('')
const newLinkName = ref('')

const sideTabs = computed(() => {
  const tabs: Array<{ key: SideTab; label: string; icon: string; tooltip: string; count?: number }> = [
    { key: 'comments', label: 'Comentarios', icon: 'fas fa-comments', tooltip: 'Ver y escribir comentarios de la tarea', count: localComments.value.length },
  ]
  if (!isBoardTask.value) {
    tabs.push({ key: 'attachments', label: 'Adjuntos', icon: 'fas fa-paperclip', tooltip: 'Enlaces y capturas de la tarea (incluye los de los comentarios)', count: allAttachments.value.length })
  }
  tabs.push({ key: 'history', label: 'Historial', icon: 'fas fa-clock-rotate-left', tooltip: 'Ver quién cambió qué y cuándo' })
  return tabs
})

async function addLinkAttachment() {
  if (!commentEntityId.value) return
  let url = newLinkUrl.value.trim()
  if (!url) return
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`
  savingAttachment.value = true
  try {
    localTask.value = await activityService.addAttachment(commentEntityId.value, { kind: 'link', url, name: newLinkName.value.trim() })
    newLinkUrl.value = ''
    newLinkName.value = ''
    showSuccess('Enlace agregado')
  } catch (e: any) {
    showError(e?.message || 'No se pudo agregar el enlace')
  } finally {
    savingAttachment.value = false
  }
}

// Capturas: se comprimen en el navegador y se guardan en la base (sin archivos en el servidor)
async function addScreenshots(files: File[]) {
  const images = files.filter(f => f.type.startsWith('image/'))
  if (!commentEntityId.value || images.length === 0) {
    if (files.length) showError('Solo se pueden adjuntar imágenes; para documentos agrega un enlace')
    return
  }
  savingAttachment.value = true
  try {
    for (const file of images) {
      const dataUrl = await compressImageToDataUrl(file)
      const name = file.name && file.name !== 'image.png' ? file.name.replace(/\.[^.]+$/, '') : 'Captura de pantalla'
      localTask.value = await activityService.addAttachment(commentEntityId.value, { kind: 'image', dataUrl, name })
    }
    showSuccess(images.length === 1 ? 'Captura adjuntada' : `${images.length} capturas adjuntadas`)
  } catch (e: any) {
    showError(e?.message || 'No se pudo guardar la captura')
  } finally {
    savingAttachment.value = false
  }
}

function onAttachmentSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = ''
  addScreenshots(files)
}

function onAttachmentDrop(e: DragEvent) {
  draggingAttachment.value = false
  addScreenshots(Array.from(e.dataTransfer?.files || []))
}

// Ctrl+V en la pestaña Adjuntos: pega una captura del portapapeles
function onAttachmentPaste(e: ClipboardEvent) {
  const files = Array.from(e.clipboardData?.files || [])
  if (files.some(f => f.type.startsWith('image/'))) {
    e.preventDefault()
    addScreenshots(files)
  }
}

// ── Tarea recurrente: "+" del día ───────────────────────────────────────────
const recurring = computed(() => recurringStats(localTask.value?.dailyLog, authStore.user?._id))
const checkingDaily = ref(false)

async function toggleDailyCheck() {
  if (!commentEntityId.value) return
  checkingDaily.value = true
  try {
    localTask.value = await activityService.dailyCheck(commentEntityId.value)
    emit('updated', localTask.value)
  } catch (e: any) {
    showError(e?.message || 'No se pudo registrar el día')
  } finally {
    checkingDaily.value = false
  }
}

function attachmentSubtitle(att: ActivityAttachment) {
  if (isImageAttachment(att)) return `Captura${att.size ? ` · ${formatFileSize(att.size)}` : ''}`
  try {
    return new URL(att.url).hostname.replace(/^www\./, '')
  } catch {
    return 'Enlace'
  }
}

async function removeAttachment(att: ActivityAttachment) {
  if (!commentEntityId.value) return
  const result = await confirmDelete(att.name)
  if (!result.isConfirmed) return
  try {
    localTask.value = await activityService.deleteAttachment(commentEntityId.value, att._id)
    showSuccess('Adjunto eliminado')
  } catch (e: any) {
    showError(e?.message || 'No se pudo eliminar el adjunto')
  }
}

function isImageAttachment(att: ActivityAttachment) {
  return att.kind === 'image' || (att.url || '').startsWith('data:image/') || (att.mimetype || '').startsWith('image/')
}

function attachmentIcon(att: ActivityAttachment) {
  if (att.kind === 'link' || !att.kind) {
    const host = (att.url || '').toLowerCase()
    if (host.includes('docs.google') || host.includes('drive.google')) return 'fab fa-google-drive'
    if (host.includes('sharepoint') || host.includes('onedrive')) return 'fab fa-microsoft'
    if (host.includes('github')) return 'fab fa-github'
    if (host.includes('figma')) return 'fab fa-figma'
    return 'fas fa-link'
  }
  const type = `${att.mimetype || ''} ${att.name || ''}`.toLowerCase()
  if (type.includes('pdf')) return 'fas fa-file-pdf'
  if (type.includes('word') || /\.docx?\b/.test(type)) return 'fas fa-file-word'
  if (type.includes('sheet') || type.includes('excel') || /\.(xlsx?|csv)\b/.test(type)) return 'fas fa-file-excel'
  if (type.includes('zip') || type.includes('compressed')) return 'fas fa-file-zipper'
  return 'fas fa-file'
}

function formatFileSize(bytes?: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function attachmentUploader(att: ActivityAttachment) {
  return typeof att.uploadedBy === 'object' ? att.uploadedBy?.name : ''
}

// ── Autor y responsables (header) ────────────────────────────────────────────
// Actividades creadas antes de esta función no tienen autor registrado en la BD;
// no hay forma de reconstruirlo, así que se muestra como tal en vez de adivinar.
const creatorName = computed(() => localTask.value?.createdBy?.name || 'No registrado (actividad anterior)')

const createdAtLabel = computed(() => {
  const date = localTask.value?.createdAt
  if (!date) return ''
  try {
    return format(new Date(date), 'd MMM yyyy', { locale: es })
  } catch {
    return ''
  }
})

// Refleja la selección actual del formulario; los nombres salen del equipo
// o, si no está cargado, de los usuarios poblados en la tarea.
const ownerNames = computed<string[]>(() => {
  const names = new Map<string, string>()
  const saved = localTask.value?.assignedTo
  for (const user of Array.isArray(saved) ? saved : saved ? [saved] : []) {
    if (user && typeof user === 'object' && user._id && user.name) names.set(String(user._id), user.name)
  }
  for (const member of (props.teamMembers || []) as any[]) {
    const id = member?._id || member?.id
    if (id && member.name) names.set(String(id), member.name)
  }
  return form.assignedTo
    .map(id => names.get(String(id)))
    .filter((name): name is string => !!name)
})

const ownersLabel = computed(() => {
  const names = ownerNames.value
  if (names.length === 0) return 'Sin asignar'
  return names.length <= 2 ? names.join(', ') : `${names.slice(0, 2).join(', ')} +${names.length - 2}`
})

const localComments = computed(() => localTask.value?.comments || [])

const newCommentText = ref('')
const commentImages = ref<File[]>([])
const commentImagePreviews = ref<string[]>([])
const submittingComment = ref(false)
const commentImageInput = ref<HTMLInputElement>()
const previewUrl = ref<string | null>(null)

function handleCommentImageSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  for (const file of Array.from(input.files)) {
    if (!file.type.startsWith('image/')) continue
    commentImages.value.push(file)
    const reader = new FileReader()
    reader.onload = (ev) => commentImagePreviews.value.push(ev.target?.result as string)
    reader.readAsDataURL(file)
  }
  input.value = ''
}

// ── Menciones @ ───────────────────────────────────────────────────────────────
const commentTextarea = ref<HTMLTextAreaElement>()
const mentionOpen = ref(false)
const mentionQuery = ref('')
const mentionStart = ref(-1) // posición del @
const mentionActiveIdx = ref(0)

const mentionMatches = computed(() => {
  if (!mentionOpen.value) return []
  const q = mentionQuery.value.toLowerCase()
  return (props.teamMembers || [])
    .filter((m: any) => !q || (m.name || '').toLowerCase().includes(q))
    .slice(0, 6)
})

function onCommentInput(e: Event) {
  const ta = e.target as HTMLTextAreaElement
  const pos = ta.selectionStart
  const text = ta.value.substring(0, pos)
  // Buscar el último @ — acepta letras con tildes/ñ, números, guión bajo
  const match = text.match(/(?:^|\s)@([\p{L}\p{N}_]*)$/u)
  if (match) {
    mentionStart.value = pos - match[1].length - 1 // posición del @
    mentionQuery.value = match[1]
    mentionOpen.value = true
    mentionActiveIdx.value = 0
  } else {
    mentionOpen.value = false
    mentionQuery.value = ''
    mentionStart.value = -1
  }
}

function onCommentKeydown(e: KeyboardEvent) {
  if (!mentionOpen.value) return
  const matches = mentionMatches.value
  if (matches.length === 0) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    mentionActiveIdx.value = (mentionActiveIdx.value + 1) % matches.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    mentionActiveIdx.value = (mentionActiveIdx.value - 1 + matches.length) % matches.length
  } else if (e.key === 'Enter' || e.key === 'Tab') {
    e.preventDefault()
    selectMention(matches[mentionActiveIdx.value])
  } else if (e.key === 'Escape') {
    mentionOpen.value = false
  }
}

function selectMention(member: any) {
  if (mentionStart.value < 0) return
  const before = newCommentText.value.substring(0, mentionStart.value)
  const afterStart = mentionStart.value + 1 + mentionQuery.value.length
  const after = newCommentText.value.substring(afterStart)
  const insert = `@${(member.name || '').replace(/\s+/g, '')} `
  newCommentText.value = before + insert + after
  mentionOpen.value = false
  mentionQuery.value = ''
  mentionStart.value = -1
  nextTick(() => {
    const ta = commentTextarea.value
    if (ta) {
      const newPos = before.length + insert.length
      ta.focus()
      ta.setSelectionRange(newPos, newPos)
    }
  })
}

function renderMentions(text: string): string {
  // escapar HTML básico
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // Enlaces clicables — antes de menciones para no interferir con el regex de @nombre.
  const withLinks = escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary-600 underline break-all hover:text-primary-700">$1</a>'
  )
  // Resaltar menciones @nombre (acepta tildes/ñ)
  return withLinks.replace(/@([\p{L}\p{N}_]+)/gu, '<span class="text-primary-500 font-bold bg-primary-50 px-1 rounded">@$1</span>')
}

// ── Editar / eliminar comentarios ─────────────────────────────────────────────
const editingCommentId = ref<string | null>(null)
const editingCommentText = ref('')
const savingEdit = ref(false)

function canEditComment(comment: any): boolean {
  const uid = authStore.user?._id
  if (!uid) return false
  const authorId = comment?.userId?._id || comment?.userId || comment?.author?._id
  return String(authorId) === String(uid)
}

function startEditComment(comment: any) {
  editingCommentId.value = comment._id
  editingCommentText.value = comment.text || ''
}

function cancelEditComment() {
  editingCommentId.value = null
  editingCommentText.value = ''
}

async function saveEditComment(comment: any) {
  if (!editingCommentText.value.trim() || !commentEntityId.value) return
  savingEdit.value = true
  try {
    const base = API_CONFIG.BASE_URL.replace('/api', '')
    const path = isBoardTask.value
      ? `${base}/api/tasks/${commentEntityId.value}/comments/${comment._id}`
      : `${base}/api/activities/${commentEntityId.value}/comments/${comment._id}`
    const token = localStorage.getItem('token')
    const { data } = await axios.put(path, { text: editingCommentText.value }, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    localTask.value = data
    cancelEditComment()
  } catch (e) {
    showError('No se pudo editar el comentario')
  } finally {
    savingEdit.value = false
  }
}

async function deleteComment(comment: any) {
  if (!commentEntityId.value) return
  const snippet = (comment.text || 'Comentario sin texto').slice(0, 60)
  const result = await confirmDelete(snippet)
  if (!result.isConfirmed) return
  try {
    const base = API_CONFIG.BASE_URL.replace('/api', '')
    const path = isBoardTask.value
      ? `${base}/api/tasks/${commentEntityId.value}/comments/${comment._id}`
      : `${base}/api/activities/${commentEntityId.value}/comments/${comment._id}`
    const token = localStorage.getItem('token')
    const { data } = await axios.delete(path, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    localTask.value = data
    showSuccess('Comentario eliminado')
  } catch (e) {
    showError('No se pudo eliminar el comentario')
  }
}

function removeCommentImage(idx: number) {
  commentImages.value.splice(idx, 1)
  commentImagePreviews.value.splice(idx, 1)
}

async function submitComment() {
  if (!commentEntityId.value) return
  if (!newCommentText.value.trim() && commentImages.value.length === 0) return
  submittingComment.value = true
  try {
    const imgs = commentImages.value.length > 0 ? commentImages.value : undefined
    const updated = isBoardTask.value
      ? await tasksStore.addComment(commentEntityId.value, newCommentText.value, imgs)
      : await activityService.addComment(commentEntityId.value, newCommentText.value, imgs)
    localTask.value = updated
    newCommentText.value = ''
    commentImages.value = []
    commentImagePreviews.value = []
  } catch (e) {
    showError('Error al enviar el comentario')
  } finally {
    submittingComment.value = false
  }
}

function commentAuthorName(comment: any): string {
  return comment?.userId?.name || comment?.author?.name || comment?.userName || 'Usuario'
}

function formatCommentDate(date: Date | string): string {
  try {
    return format(new Date(date), "d MMM, HH:mm", { locale: es })
  } catch {
    return ''
  }
}

async function loadFullTask() {
  if (!isEditingTask.value || !commentEntityId.value) return
  loadingComments.value = true
  try {
    const full = isBoardTask.value
      ? await tasksStore.fetchTaskById(commentEntityId.value)
      : await activityService.getById(commentEntityId.value)
    localTask.value = full
  } catch (e) {
    console.warn('No se pudieron cargar comentarios:', e)
  } finally {
    loadingComments.value = false
  }
}

// ──────────────────────────────────────────────────────────────────────────────

watch(() => props.activity, (val) => {
  localTask.value = val
  populateForm()
}, { deep: true })

onMounted(() => {
  populateForm()
  loadFullTask()
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
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #CBD5E1;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoom-in-95 {
  from { opacity: 0; transform: translateY(8px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes slide-in-from-top-2 {
  from { transform: translateY(-0.5rem); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Las utilidades duration-* de Tailwind son de transition, no de animation:
   sin esto las animaciones de entrada duraban 0s. */
.animate-in {
  animation-duration: 280ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: backwards;
}

/* Entrada escalonada de las secciones del formulario */
@keyframes section-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.form-section {
  animation: section-in 320ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}
.form-section:nth-child(2) { animation-delay: 50ms; }
.form-section:nth-child(3) { animation-delay: 100ms; }

/* Cambio entre Comentarios e Historial */
.side-panel-enter-active,
.side-panel-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.side-panel-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.side-panel-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .animate-in,
  .form-section {
    animation: none;
  }
  .side-panel-enter-active,
  .side-panel-leave-active {
    transition: none;
  }
}
.fade-in {
  animation-name: fade-in;
}
.zoom-in-95 {
  animation-name: zoom-in-95;
}
.slide-in-from-top-2 {
  animation-name: slide-in-from-top-2;
}

/* Ocultar flecha nativa en IE/Edge */
select::-ms-expand {
  display: none;
}

/* Personalización básica para inputs de fecha */
input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  filter: invert(0.5);
  transition: opacity 0.2s;
}
input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
</style>
