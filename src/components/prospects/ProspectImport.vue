<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
            <i class="fas fa-file-import text-sm"></i>
          </div>
          <div>
            <h2 class="text-base font-black text-slate-900">Importar prospectos</h2>
            <p class="text-xs text-slate-500 font-medium">Carga masiva desde CSV o Excel</p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center justify-center">
          <i class="fas fa-xmark"></i>
        </button>
      </div>

      <!-- Step 1: Input -->
      <div v-if="step === 'input'" class="flex-1 overflow-y-auto p-6 space-y-4">
        <div class="bg-cyan-50 border border-cyan-100 rounded-xl p-3.5">
          <p class="text-xs font-bold text-cyan-900 mb-1.5">
            <i class="fas fa-lightbulb mr-1"></i>Formato esperado
          </p>
          <p class="text-[11px] text-cyan-800 font-medium leading-relaxed">
            Una empresa por línea. Las columnas pueden venir separadas por <strong>tab</strong>, <strong>coma</strong> o <strong>punto y coma</strong>.
            Encabezados detectables: <code class="bg-white px-1 rounded">empresa</code>, <code class="bg-white px-1 rounded">contacto</code>,
            <code class="bg-white px-1 rounded">email</code>, <code class="bg-white px-1 rounded">telefono</code>, <code class="bg-white px-1 rounded">notas</code>.
          </p>
        </div>

        <div>
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
            Pega tu CSV / Excel aquí
          </label>
          <textarea
            v-model="rawText"
            rows="10"
            :placeholder="placeholderExample"
            class="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 outline-none transition-all resize-none leading-relaxed"
          ></textarea>
        </div>

        <div class="flex items-center gap-3">
          <label class="flex-1 cursor-pointer">
            <input type="file" accept=".csv,.tsv,.txt" class="hidden" @change="onFile" />
            <div class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl text-center transition-all flex items-center justify-center gap-2">
              <i class="fas fa-paperclip text-[11px]"></i>
              O sube un archivo CSV
            </div>
          </label>
          <button
            @click="parsePreview"
            :disabled="!rawText.trim()"
            class="px-5 py-2.5 bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-xs font-black rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <i class="fas fa-eye text-[11px]"></i>
            Previsualizar
          </button>
        </div>
      </div>

      <!-- Step 2: Preview -->
      <div v-else-if="step === 'preview'" class="flex-1 overflow-y-auto p-6 space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-black text-slate-700">
            {{ rows.length }} filas detectadas
            <span v-if="invalidRows > 0" class="text-rose-500 ml-2">· {{ invalidRows }} sin empresa</span>
          </p>
          <button @click="step = 'input'" class="text-[10px] font-black text-slate-500 hover:text-slate-900">
            <i class="fas fa-arrow-left mr-1"></i>Volver
          </button>
        </div>

        <div class="border border-slate-200 rounded-xl overflow-hidden">
          <table class="w-full text-xs">
            <thead class="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <tr>
                <th class="px-3 py-2 text-left">Empresa</th>
                <th class="px-3 py-2 text-left">Contacto</th>
                <th class="px-3 py-2 text-left">Email</th>
                <th class="px-3 py-2 text-left">Teléfono</th>
                <th class="px-3 py-2 text-left">Notas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(row, idx) in rows.slice(0, 12)" :key="idx" :class="!row.company ? 'bg-rose-50' : ''">
                <td class="px-3 py-2 font-bold text-slate-800 truncate max-w-[160px]">{{ row.company || '—' }}</td>
                <td class="px-3 py-2 text-slate-600 truncate max-w-[120px]">{{ row.contactName || '—' }}</td>
                <td class="px-3 py-2 text-slate-600 truncate max-w-[160px]">{{ row.email || '—' }}</td>
                <td class="px-3 py-2 text-slate-600 truncate max-w-[120px]">{{ row.phone || '—' }}</td>
                <td class="px-3 py-2 text-slate-500 truncate max-w-[200px]">{{ row.notes || '—' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="rows.length > 12" class="px-3 py-2 bg-slate-50 text-[10px] text-slate-500 font-bold text-center">
            +{{ rows.length - 12 }} filas más
          </div>
        </div>

        <div class="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <p class="text-[10px] text-slate-500 font-medium">
            Cada prospecto se crea sin pasar por IA. Puedes generar la propuesta luego desde el detalle.
          </p>
          <button
            @click="importAll"
            :disabled="validRows === 0"
            class="px-5 py-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <i class="fas fa-cloud-arrow-up text-[11px]"></i>
            Importar {{ validRows }} prospectos
          </button>
        </div>
      </div>

      <!-- Step 3: Importing -->
      <div v-else-if="step === 'importing'" class="flex-1 flex items-center justify-center p-12">
        <div class="text-center max-w-sm">
          <i class="fas fa-circle-notch fa-spin text-3xl text-cyan-500 mb-3 block"></i>
          <p class="text-sm font-black text-slate-800 mb-2">Importando prospectos...</p>
          <p class="text-xs font-bold text-slate-500 mb-4">{{ importedCount }} de {{ validRows }}</p>
          <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all" :style="{ width: progressPct + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Step 4: Done -->
      <div v-else-if="step === 'done'" class="flex-1 flex items-center justify-center p-12">
        <div class="text-center max-w-sm">
          <div class="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto mb-3 flex items-center justify-center">
            <i class="fas fa-check text-xl"></i>
          </div>
          <p class="text-sm font-black text-slate-800 mb-1">{{ importedCount }} prospectos importados</p>
          <p v-if="failedCount > 0" class="text-xs font-bold text-rose-500 mb-4">{{ failedCount }} fallaron</p>
          <button
            @click="$emit('close')"
            class="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { prospectService } from '@/services/prospectService'
import { useNotifications } from '@/composables/useNotifications'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  imported: [count: number]
}>()

const { showError } = useNotifications()

interface Row {
  company: string
  contactName?: string
  email?: string
  phone?: string
  notes?: string
}

const step = ref<'input' | 'preview' | 'importing' | 'done'>('input')
const rawText = ref('')
const rows = ref<Row[]>([])
const importedCount = ref(0)
const failedCount = ref(0)

const placeholderExample = `empresa,contacto,email,telefono,notas
Acme Corp,Juan Perez,juan@acme.com,+57 300 123 4567,Necesita CRM
Globex,,info@globex.io,,Migrar telefonia a IP`

const validRows = computed(() => rows.value.filter((r) => r.company.trim().length > 0).length)
const invalidRows = computed(() => rows.value.length - validRows.value)
const progressPct = computed(() => (validRows.value > 0 ? (importedCount.value / validRows.value) * 100 : 0))

const onFile = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  const file = target.files[0]
  rawText.value = await file.text()
  target.value = ''
}

const detectDelimiter = (text: string): string => {
  const firstLine = text.split('\n')[0] || ''
  const tabCount = (firstLine.match(/\t/g) || []).length
  const semiCount = (firstLine.match(/;/g) || []).length
  const commaCount = (firstLine.match(/,/g) || []).length
  if (tabCount >= semiCount && tabCount >= commaCount && tabCount > 0) return '\t'
  if (semiCount >= commaCount && semiCount > 0) return ';'
  return ','
}

const splitRespectQuotes = (line: string, delim: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"' && line[i + 1] === '"') {
      current += '"'
      i++
    } else if (c === '"') {
      inQuotes = !inQuotes
    } else if (c === delim && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += c
    }
  }
  result.push(current.trim())
  return result
}

const HEADER_MAP: Record<string, keyof Row> = {
  empresa: 'company',
  company: 'company',
  organizacion: 'company',
  contacto: 'contactName',
  contact: 'contactName',
  nombre: 'contactName',
  name: 'contactName',
  email: 'email',
  correo: 'email',
  telefono: 'phone',
  teléfono: 'phone',
  phone: 'phone',
  movil: 'phone',
  whatsapp: 'phone',
  notas: 'notes',
  notes: 'notes',
  observaciones: 'notes',
  diagnostico: 'notes',
  descripcion: 'notes',
}

const parsePreview = () => {
  const text = rawText.value.trim()
  if (!text) return
  const delim = detectDelimiter(text)
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)

  // Detect header
  const firstCells = splitRespectQuotes(lines[0], delim).map((c) => c.toLowerCase().trim())
  const hasHeader = firstCells.some((c) => HEADER_MAP[c])

  let columnMap: Array<keyof Row | null> = []
  let dataLines = lines

  if (hasHeader) {
    columnMap = firstCells.map((c) => HEADER_MAP[c] || null)
    dataLines = lines.slice(1)
  } else {
    // Default order: empresa, contacto, email, telefono, notas
    columnMap = ['company', 'contactName', 'email', 'phone', 'notes']
  }

  rows.value = dataLines.map((line) => {
    const cells = splitRespectQuotes(line, delim)
    const row: Row = { company: '' }
    cells.forEach((cell, idx) => {
      const key = columnMap[idx]
      if (key && cell.trim()) {
        ;(row as any)[key] = cell.trim()
      }
    })
    return row
  })

  step.value = 'preview'
}

const importAll = async () => {
  step.value = 'importing'
  importedCount.value = 0
  failedCount.value = 0

  for (const row of rows.value) {
    if (!row.company.trim()) continue
    try {
      const initialMessage = [
        row.notes ? `**Notas iniciales:**\n${row.notes}` : null,
        row.contactName ? `**Contacto:** ${row.contactName}` : null,
        row.email ? `**Email:** ${row.email}` : null,
        row.phone ? `**Teléfono:** ${row.phone}` : null,
      ]
        .filter(Boolean)
        .join('\n\n') || `Prospecto importado: ${row.company}`

      const created = await prospectService.create({
        prospectName: row.company,
        company: row.company,
        initialMessage,
      })

      // Persist contact metadata locally
      if (row.contactName || row.email || row.phone) {
        prospectService.setMetadata(created._id, {
          contactName: row.contactName,
          contactEmail: row.email,
          contactPhone: row.phone,
        })
      }
      importedCount.value++
    } catch (err) {
      console.error('Falló importar:', row, err)
      failedCount.value++
    }
  }

  step.value = 'done'
  emit('imported', importedCount.value)
  if (failedCount.value > 0 && importedCount.value === 0) {
    showError('No se pudo importar ninguno. Revisa el formato.')
  }
}
</script>
