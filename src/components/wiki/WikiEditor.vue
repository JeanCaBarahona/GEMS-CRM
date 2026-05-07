<template>
  <div class="wiki-editor" :class="{ 'wiki-editor--focused': editor?.isFocused }">
    <!-- Toolbar -->
    <div v-if="editor" class="wiki-editor__toolbar">
      <!-- Texto -->
      <div class="wiki-editor__group">
        <button type="button" @click="editor.chain().focus().toggleBold().run()" :class="{ active: editor.isActive('bold') }" title="Negrita (Ctrl+B)">
          <i class="fas fa-bold"></i>
        </button>
        <button type="button" @click="editor.chain().focus().toggleItalic().run()" :class="{ active: editor.isActive('italic') }" title="Cursiva (Ctrl+I)">
          <i class="fas fa-italic"></i>
        </button>
        <button type="button" @click="editor.chain().focus().toggleUnderline().run()" :class="{ active: editor.isActive('underline') }" title="Subrayado (Ctrl+U)">
          <i class="fas fa-underline"></i>
        </button>
        <button type="button" @click="editor.chain().focus().toggleStrike().run()" :class="{ active: editor.isActive('strike') }" title="Tachado">
          <i class="fas fa-strikethrough"></i>
        </button>
        <button type="button" @click="editor.chain().focus().toggleHighlight().run()" :class="{ active: editor.isActive('highlight') }" title="Resaltar">
          <i class="fas fa-highlighter"></i>
        </button>
      </div>

      <div class="wiki-editor__divider"></div>

      <!-- Headings -->
      <div class="wiki-editor__group">
        <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ active: editor.isActive('heading', { level: 1 }) }" title="Título 1">
          <span class="text-[11px] font-black">H1</span>
        </button>
        <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ active: editor.isActive('heading', { level: 2 }) }" title="Título 2">
          <span class="text-[11px] font-black">H2</span>
        </button>
        <button type="button" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ active: editor.isActive('heading', { level: 3 }) }" title="Título 3">
          <span class="text-[11px] font-black">H3</span>
        </button>
      </div>

      <div class="wiki-editor__divider"></div>

      <!-- Listas -->
      <div class="wiki-editor__group">
        <button type="button" @click="editor.chain().focus().toggleBulletList().run()" :class="{ active: editor.isActive('bulletList') }" title="Lista">
          <i class="fas fa-list-ul"></i>
        </button>
        <button type="button" @click="editor.chain().focus().toggleOrderedList().run()" :class="{ active: editor.isActive('orderedList') }" title="Lista numerada">
          <i class="fas fa-list-ol"></i>
        </button>
        <button type="button" @click="editor.chain().focus().toggleTaskList().run()" :class="{ active: editor.isActive('taskList') }" title="Lista de tareas">
          <i class="fas fa-tasks"></i>
        </button>
        <button type="button" @click="editor.chain().focus().toggleBlockquote().run()" :class="{ active: editor.isActive('blockquote') }" title="Cita">
          <i class="fas fa-quote-right"></i>
        </button>
      </div>

      <div class="wiki-editor__divider"></div>

      <!-- Alineación -->
      <div class="wiki-editor__group">
        <button type="button" @click="editor.chain().focus().setTextAlign('left').run()" :class="{ active: editor.isActive({ textAlign: 'left' }) }" title="Izquierda">
          <i class="fas fa-align-left"></i>
        </button>
        <button type="button" @click="editor.chain().focus().setTextAlign('center').run()" :class="{ active: editor.isActive({ textAlign: 'center' }) }" title="Centro">
          <i class="fas fa-align-center"></i>
        </button>
        <button type="button" @click="editor.chain().focus().setTextAlign('right').run()" :class="{ active: editor.isActive({ textAlign: 'right' }) }" title="Derecha">
          <i class="fas fa-align-right"></i>
        </button>
      </div>

      <div class="wiki-editor__divider"></div>

      <!-- Código y enlaces -->
      <div class="wiki-editor__group">
        <button type="button" @click="editor.chain().focus().toggleCode().run()" :class="{ active: editor.isActive('code') }" title="Código en línea">
          <i class="fas fa-code"></i>
        </button>
        <button type="button" @click="editor.chain().focus().toggleCodeBlock().run()" :class="{ active: editor.isActive('codeBlock') }" title="Bloque de código">
          <i class="fas fa-file-code"></i>
        </button>
        <button type="button" @click="setLink" :class="{ active: editor.isActive('link') }" title="Insertar enlace">
          <i class="fas fa-link"></i>
        </button>
      </div>

      <div class="wiki-editor__divider"></div>

      <!-- Media -->
      <div class="wiki-editor__group">
        <button type="button" @click="triggerImageUpload" title="Insertar imagen">
          <i class="fas fa-image"></i>
        </button>
        <button type="button" @click="insertTable" title="Insertar tabla">
          <i class="fas fa-table"></i>
        </button>
        <button type="button" @click="editor.chain().focus().setHorizontalRule().run()" title="Línea divisoria">
          <i class="fas fa-minus"></i>
        </button>
      </div>

      <div class="wiki-editor__divider"></div>

      <!-- Deshacer/rehacer -->
      <div class="wiki-editor__group">
        <button type="button" @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" title="Deshacer (Ctrl+Z)">
          <i class="fas fa-undo"></i>
        </button>
        <button type="button" @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" title="Rehacer (Ctrl+Y)">
          <i class="fas fa-redo"></i>
        </button>
      </div>

      <input ref="imageInput" type="file" accept="image/*" multiple class="hidden" @change="onImageSelected" />
    </div>

    <!-- Editor Content -->
    <editor-content :editor="editor" class="wiki-editor__content" />

    <!-- Word Count -->
    <div v-if="editor && showStats" class="wiki-editor__stats">
      <span>{{ editor.storage.characterCount?.characters() ?? editor.getText().length }} caracteres · {{ editor.getText().split(/\s+/).filter(Boolean).length }} palabras</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { TextAlign } from '@tiptap/extension-text-align'
import { Highlight } from '@tiptap/extension-highlight'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'

interface Props {
  modelValue: string
  placeholder?: string
  showStats?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Comienza a escribir tu documentación...',
  showStats: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const imageInput = ref<HTMLInputElement | null>(null)

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: {
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'wiki-editor__link',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      },
    }),
    Highlight.configure({ multicolor: false }),
    Image.configure({
      inline: false,
      allowBase64: true,
      HTMLAttributes: {
        class: 'wiki-editor__image',
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: { class: 'wiki-editor__table' },
    }),
    TableRow,
    TableHeader,
    TableCell,
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (!editor.value) return
    const current = editor.value.getHTML()
    if (newValue !== current) {
      editor.value.commands.setContent(newValue || '', false)
    }
  }
)

const setLink = () => {
  if (!editor.value) return
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('URL del enlace:', previousUrl)
  if (url === null) return
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

const insertTable = () => {
  if (!editor.value) return
  editor.value.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

const triggerImageUpload = () => {
  imageInput.value?.click()
}

const onImageSelected = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length || !editor.value) return

  for (const file of Array.from(target.files)) {
    if (!file.type.startsWith('image/')) continue
    const dataUrl = await readFileAsDataUrl(file)
    editor.value.chain().focus().setImage({ src: dataUrl, alt: file.name }).run()
  }

  target.value = ''
}

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
.wiki-editor {
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  background: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.wiki-editor--focused {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.wiki-editor__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.wiki-editor__group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.wiki-editor__divider {
  width: 1px;
  height: 22px;
  background: #e2e8f0;
  margin: 0 4px;
}

.wiki-editor__toolbar button {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.15s ease;
}

.wiki-editor__toolbar button:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
}

.wiki-editor__toolbar button.active {
  background: #6366f1;
  color: white;
}

.wiki-editor__toolbar button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.wiki-editor__content {
  min-height: 360px;
  padding: 24px 28px;
  font-family: 'Inter', sans-serif;
}

.wiki-editor__stats {
  padding: 6px 14px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
  font-size: 0.65rem;
  color: #94a3b8;
  font-weight: 700;
  text-align: right;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

/* ProseMirror content styling */
.wiki-editor__content .ProseMirror {
  outline: none;
  min-height: 320px;
  color: #0f172a;
  font-size: 0.875rem;
  line-height: 1.7;
}

.wiki-editor__content .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #cbd5e1;
  pointer-events: none;
  height: 0;
  font-style: italic;
}

.wiki-editor__content .ProseMirror h1 {
  font-size: 1.875rem;
  font-weight: 800;
  margin: 1.5rem 0 0.75rem;
  color: #0f172a;
  line-height: 1.2;
}

.wiki-editor__content .ProseMirror h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 1.25rem 0 0.5rem;
  color: #0f172a;
  line-height: 1.3;
}

.wiki-editor__content .ProseMirror h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
  color: #1e293b;
}

.wiki-editor__content .ProseMirror p {
  margin: 0.5rem 0;
}

.wiki-editor__content .ProseMirror ul,
.wiki-editor__content .ProseMirror ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.wiki-editor__content .ProseMirror ul li,
.wiki-editor__content .ProseMirror ol li {
  margin: 0.25rem 0;
}

.wiki-editor__content .ProseMirror ul[data-type="taskList"] {
  list-style: none;
  padding-left: 0.25rem;
}

.wiki-editor__content .ProseMirror ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.wiki-editor__content .ProseMirror ul[data-type="taskList"] li > label {
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.wiki-editor__content .ProseMirror ul[data-type="taskList"] li > div {
  flex: 1;
}

.wiki-editor__content .ProseMirror blockquote {
  border-left: 4px solid #6366f1;
  padding: 0.25rem 1rem;
  margin: 0.75rem 0;
  color: #475569;
  font-style: italic;
  background: #f8fafc;
  border-radius: 0 0.5rem 0.5rem 0;
}

.wiki-editor__content .ProseMirror code {
  background: #f1f5f9;
  color: #be123c;
  padding: 0.15rem 0.4rem;
  border-radius: 0.35rem;
  font-size: 0.85em;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.wiki-editor__content .ProseMirror pre {
  background: #0f172a;
  color: #e2e8f0;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  margin: 0.75rem 0;
  overflow-x: auto;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
}

.wiki-editor__content .ProseMirror pre code {
  background: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
}

.wiki-editor__content .ProseMirror hr {
  border: none;
  border-top: 2px solid #e2e8f0;
  margin: 1.5rem 0;
}

.wiki-editor__content .ProseMirror a {
  color: #6366f1;
  text-decoration: underline;
  cursor: pointer;
}

.wiki-editor__content .ProseMirror mark {
  background: #fef08a;
  padding: 0 0.2rem;
  border-radius: 0.25rem;
}

.wiki-editor__content .ProseMirror img.wiki-editor__image,
.wiki-editor__content .ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 0.75rem;
  margin: 0.75rem 0;
  box-shadow: 0 4px 16px -8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.wiki-editor__content .ProseMirror table,
.wiki-editor__content .ProseMirror .wiki-editor__table {
  border-collapse: collapse;
  margin: 0.75rem 0;
  table-layout: fixed;
  width: 100%;
  overflow: hidden;
  border-radius: 0.5rem;
}

.wiki-editor__content .ProseMirror table td,
.wiki-editor__content .ProseMirror table th {
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  vertical-align: top;
  position: relative;
  min-width: 80px;
}

.wiki-editor__content .ProseMirror table th {
  background: #f1f5f9;
  font-weight: 700;
  text-align: left;
}

.wiki-editor__content .ProseMirror .selectedCell::after {
  background: rgba(99, 102, 241, 0.12);
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
