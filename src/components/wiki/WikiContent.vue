<template>
  <div class="wiki-content" v-html="sanitized"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'

interface Props {
  content?: string
}

const props = defineProps<Props>()

const sanitized = computed(() => {
  if (!props.content) return ''
  // Si el contenido viene como texto plano (legacy), preservar saltos de línea
  const isHtml = /<[a-z][\s\S]*>/i.test(props.content)
  const html = isHtml ? props.content : props.content.replace(/\n/g, '<br>')
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'rel'],
    ADD_TAGS: ['iframe'],
  })
})
</script>

<style>
.wiki-content {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  line-height: 1.75;
  color: #0f172a;
}

.wiki-content h1 {
  font-size: 1.875rem;
  font-weight: 800;
  margin: 1.5rem 0 0.75rem;
  color: #0f172a;
  line-height: 1.2;
}

.wiki-content h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 1.25rem 0 0.5rem;
  color: #0f172a;
  line-height: 1.3;
}

.wiki-content h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
  color: #1e293b;
}

.wiki-content p {
  margin: 0.5rem 0;
}

.wiki-content ul,
.wiki-content ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.wiki-content ul li,
.wiki-content ol li {
  margin: 0.25rem 0;
}

.wiki-content ul[data-type="taskList"] {
  list-style: none;
  padding-left: 0.25rem;
}

.wiki-content ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.wiki-content blockquote {
  border-left: 4px solid #6366f1;
  padding: 0.25rem 1rem;
  margin: 0.75rem 0;
  color: #475569;
  font-style: italic;
  background: #f8fafc;
  border-radius: 0 0.5rem 0.5rem 0;
}

.wiki-content code {
  background: #f1f5f9;
  color: #be123c;
  padding: 0.15rem 0.4rem;
  border-radius: 0.35rem;
  font-size: 0.85em;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.wiki-content pre {
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

.wiki-content pre code {
  background: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
}

.wiki-content hr {
  border: none;
  border-top: 2px solid #e2e8f0;
  margin: 1.5rem 0;
}

.wiki-content a {
  color: #6366f1;
  text-decoration: underline;
}

.wiki-content mark {
  background: #fef08a;
  padding: 0 0.2rem;
  border-radius: 0.25rem;
}

.wiki-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.75rem;
  margin: 0.75rem 0;
  box-shadow: 0 4px 16px -8px rgba(0, 0, 0, 0.15);
}

.wiki-content table {
  border-collapse: collapse;
  margin: 0.75rem 0;
  table-layout: fixed;
  width: 100%;
  overflow: hidden;
  border-radius: 0.5rem;
}

.wiki-content table td,
.wiki-content table th {
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  vertical-align: top;
}

.wiki-content table th {
  background: #f1f5f9;
  font-weight: 700;
  text-align: left;
}
</style>
