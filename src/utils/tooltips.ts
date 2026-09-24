/**
 * Tooltips globales con tippy.js.
 *
 * Cualquier elemento con `title="..."` (estático o `:title` de Vue, también los
 * que aparezcan después) se convierte automáticamente: el texto se mueve a
 * `data-tooltip` para que el navegador no muestre su tooltip nativo, y un único
 * `delegate` de tippy lo muestra con el tema "crm". No hay que tocar los
 * componentes: basta con seguir usando `title`.
 */
import { delegate, type Placement } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/shift-away-subtle.css'

const ATTR = 'data-tooltip'

function convert(el: Element) {
  if (!(el instanceof HTMLElement)) return
  const text = el.getAttribute('title')
  if (text === null) return
  el.removeAttribute('title')
  if (!text.trim()) {
    el.removeAttribute(ATTR)
    return
  }
  el.setAttribute(ATTR, text)
  // Los botones de solo ícono usaban el title como nombre accesible.
  if (!el.hasAttribute('aria-label') && !el.textContent?.trim()) {
    el.setAttribute('aria-label', text)
  }
}

function convertTree(root: ParentNode) {
  if (root instanceof Element) convert(root)
  root.querySelectorAll?.('[title]').forEach(convert)
}

export function installTooltips() {
  convertTree(document.body)

  new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes') convert(m.target as Element)
      else m.addedNodes.forEach((node) => { if (node instanceof Element) convertTree(node) })
    }
  }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['title'] })

  delegate(document.body, {
    target: `[${ATTR}]`,
    theme: 'crm',
    animation: 'shift-away-subtle',
    placement: 'top',
    arrow: true,
    delay: [350, 0],
    duration: [160, 110],
    maxWidth: 280,
    offset: [0, 8],
    zIndex: 20000,
    appendTo: () => document.body,
    touch: ['hold', 450],
    allowHTML: false,
    // El texto puede cambiar entre hovers (`:title` reactivo): se lee al mostrar.
    // `data-tooltip-placement="right"` (etc.) cambia la posición por elemento.
    onShow(instance) {
      const ref = instance.reference
      const text = ref.getAttribute(ATTR)
      if (!text) return false
      instance.setContent(text)
      const placement = ref.getAttribute('data-tooltip-placement') as Placement | null
      instance.setProps({ placement: placement || 'top' })
    }
  })
}
