import Swal from 'sweetalert2'

// ─── Base config ────────────────────────────────────────────────────────────
// ─── Base config ────────────────────────────────────────────────────────────
const base = {
  background: '#ffffff',
  color: '#0f172a',
  customClass: {
    popup:          'crm-popup',
    title:          'crm-title',
    htmlContainer:  'crm-body',
    confirmButton:  'crm-btn-confirm',
    cancelButton:   'crm-btn-cancel',
    input:          'crm-input',
    icon:           'crm-icon',
    actions:        'crm-actions',
  },
  showClass: { popup: 'crm-show' },
  hideClass: { popup: 'crm-hide' },
  buttonsStyling: false,
}

// ─── Composable ──────────────────────────────────────────────────────────────
export const useNotifications = () => {

  /** Éxito — auto-cierra en 2.5s */
  const showSuccess = (title: string, message?: string) =>
    Swal.fire({
      ...base,
      icon: 'success',
      title,
      text: message,
      timer: 2500,
      timerProgressBar: false, // Desactivado por estética
      showConfirmButton: false,
    })

  /** Error */
  const showError = (title: string, message?: string) =>
    Swal.fire({
      ...base,
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Entendido',
    })

  /** Advertencia */
  const showWarning = (title: string, message?: string) =>
    Swal.fire({
      ...base,
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'Cerrar',
    })

  /** Info */
  const showInfo = (title: string, message?: string) =>
    Swal.fire({
      ...base,
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'Entendido',
    })

  /** Confirmación de eliminación */
  const confirmDelete = (itemName: string, _itemType: string = 'elemento') =>
    Swal.fire({
      ...base,
      icon: 'warning',
      title: '¿Confirmar eliminación?',
      html: `
        <div class="crm-delete-body">
          <p class="crm-delete-name">${itemName}</p>
          <p class="crm-delete-warn">Esta acción eliminará el registro permanentemente</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText:  'Cancelar',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        ...base.customClass,
        confirmButton: 'crm-btn-danger',
      },
    })

  /** Confirmación genérica */
  const confirm = (title: string, message: string, confirmText = 'Confirmar') =>
    Swal.fire({
      ...base,
      icon: 'question',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText:  'Cancelar',
      reverseButtons: true,
    })

  /** Loading bloqueante */
  const showLoading = (title = 'Procesando...') =>
    Swal.fire({
      ...base,
      title,
      html: `
        <div class="crm-loader-wrap">
          <div class="crm-spinner"></div>
          <p class="crm-loader-text">Por favor espera un momento…</p>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
    })

  /** Cierra loading */
  const closeLoading = () => Swal.close()

  /** Toast ligero — esquina superior derecha */
  const toast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const icons: Record<string, string> = {
      success: `<svg viewBox="0 0 20 20" fill="currentColor" class="crm-toast-icon crm-toast-success"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/></svg>`,
      error:   `<svg viewBox="0 0 20 20" fill="currentColor" class="crm-toast-icon crm-toast-error"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/></svg>`,
      warning: `<svg viewBox="0 0 20 20" fill="currentColor" class="crm-toast-icon crm-toast-warning"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>`,
      info:    `<svg viewBox="0 0 20 20" fill="currentColor" class="crm-toast-icon crm-toast-info"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"/></svg>`,
    }

    return Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: false, // Desactivado en toast también
      customClass: {
        popup:          'crm-toast-popup',
        title:          'crm-toast-title',
      },
      showClass: { popup: 'crm-toast-show' },
      hideClass: { popup: 'crm-toast-hide' },
      buttonsStyling: false,
    }).fire({
      html: `
        <div class="crm-toast-row">
          ${icons[type]}
          <span class="crm-toast-msg">${message}</span>
        </div>
      `,
    })
  }

  /** Input modal */
  const showInput = (
    title: string,
    inputLabel: string,
    inputType: 'text' | 'email' | 'password' | 'textarea' = 'text'
  ) =>
    Swal.fire({
      ...base,
      title,
      input: inputType,
      inputLabel,
      inputPlaceholder: `Escribe aquí...`,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText:  'Cancelar',
      inputValidator: (value) => {
        if (!value) return `${inputLabel} es obligatorio`
      },
    })

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    confirmDelete,
    confirm,
    showLoading,
    closeLoading,
    toast,
    showInput,
  }
}

// ─── CSS injection ────────────────────────────────────────────────────────────
export const injectSwalStyles = () => {
  if (typeof document === 'undefined') return
  const style = document.createElement('style')
  style.id = 'crm-swal-styles'
  style.textContent = `
/* ═══════════════════════════════════════════════════
   Customer CRM — SweetAlert2 Premium Theme (Clean v2)
   ═══════════════════════════════════════════════════ */

/* ── Popup ── */
.crm-popup {
  font-family: 'Inter', system-ui, sans-serif !important;
  background: #ffffff !important;
  border-radius: 1.5rem !important;
  border: 1px solid rgba(226, 232, 240, 0.8) !important;
  box-shadow:
    0 10px 40px -10px rgba(15, 23, 42, 0.1),
    0 20px 25px -5px rgba(15, 23, 42, 0.04) !important;
  padding: 1.5rem !important; /* Reducido de 2.5rem */
  max-width: 22rem !important;  /* Reducido de 30rem */
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}

/* ── Animations ── */
@keyframes crm-fade-in  { from { opacity:0; transform:translateY(10px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
@keyframes crm-fade-out { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(5px) scale(0.98); } }
.crm-show { animation: crm-fade-in  0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards !important; }
.crm-hide { animation: crm-fade-out 0.2s ease-in forwards !important; }

/* ── Overlay ── */
.swal2-backdrop-show { background: rgba(15, 23, 42, 0.3) !important; backdrop-filter: blur(8px) !important; }

/* ── Icon ── */
.swal2-icon.crm-icon,
.swal2-icon {
  width: 2.5rem !important;
  height: 2.5rem !important;
  margin: 0 auto 1rem !important;
  border-width: 2px !important;
  transform: scale(1) !important;
}

/* Ajuste específico para las líneas del checkmark de éxito */
.swal2-icon.swal2-success [class^=swal2-success-line] {
  height: 2px !important;
}
.swal2-icon.swal2-success .swal2-success-line-tip {
  width: 0.8125rem !important;
  left: 0.1875rem !important;
  top: 1.625rem !important;
}
.swal2-icon.swal2-success .swal2-success-line-long {
  width: 1.5625rem !important;
  right: 0.25rem !important;
  top: 1.375rem !important;
}
.swal2-icon.swal2-success .swal2-success-ring {
  width: 100% !important;
  height: 100% !important;
}

.swal2-icon.swal2-success { border-color: #10b981 !important; color: #10b981 !important; }
.swal2-icon.swal2-error  { border-color: #f43f5e !important; color: #f43f5e !important; }

/* ── Title ── */
.crm-title {
  font-size: 1rem !important; /* Reducido de 1.25rem */
  font-weight: 800 !important;
  letter-spacing: -0.01em !important;
  color: #1e293b !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* ── Body text ── */
.crm-body {
  font-size: 0.8125rem !important;
  font-weight: 500 !important;
  color: #64748b !important;
  line-height: 1.4 !important;
  margin-top: 0.5rem !important;
}

/* ── Delete body ── */
.crm-delete-body {
  margin-top: 1rem;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 1.25rem;
  border: 1px solid #f1f5f9;
}
.crm-delete-name {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.25rem;
}
.crm-delete-warn {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ef4444;
}

/* ── Actions row ── */
.crm-actions {
  gap: 0.75rem !important;
  margin-top: 2rem !important;
}

/* ── Buttons shared ── */
.crm-btn-confirm,
.crm-btn-cancel,
.crm-btn-danger {
  border-radius: 1rem !important;
  padding: 0.875rem 2rem !important;
  font-size: 0.875rem !important;
  font-weight: 800 !important;
  text-transform: none !important;
  transition: all 0.2s ease !important;
}

/* Confirm — Sky blue */
.crm-btn-confirm {
  background: #0ea5e9 !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2) !important;
}
.crm-btn-confirm:hover { background: #0284c7 !important; transform: translateY(-2px) !important; }

/* Cancel — Neutral */
.crm-btn-cancel {
  background: #f1f5f9 !important;
  color: #64748b !important;
  box-shadow: none !important;
}
.crm-btn-cancel:hover { background: #e2e8f0 !important; color: #1e293b !important; }

/* Danger — Rose */
.crm-btn-danger {
  background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%) !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(244, 63, 94, 0.2) !important;
}
.crm-btn-danger:hover { filter: brightness(1.1); transform: translateY(-2px) !important; }

/* ── Hidden progress bar ── */
.swal2-timer-progress-bar-container,
.swal2-timer-progress-bar {
  display: none !important;
}

/* ── Toast ── */
.crm-toast-popup {
  border-radius: 1.25rem !important;
  padding: 1rem 1.5rem !important;
  border: 1px solid rgba(226, 232, 240, 0.5) !important;
}
.crm-toast-msg { font-weight: 700 !important; }
`
  const existing = document.getElementById('crm-swal-styles')
  if (existing) existing.remove()
  document.head.appendChild(style)
}
