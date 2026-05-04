import Swal from 'sweetalert2'

/**
 * GEMS CRM — Ultra-Premium Notification System (v3)
 * Enfoque: Minimalismo extremo, tipografía refinada y cero elementos distractores.
 */

const base = {
  background: 'transparent',
  showConfirmButton: false,
  backdrop: false,
  allowOutsideClick: true,
  position: 'top' as const,
  timerProgressBar: false, // ELIMINADA LA BARRA DE PROGRESO POR PETICIÓN
  customClass: {
    popup:          'crm-premium-pill',
    title:          'crm-premium-title',
    htmlContainer:  'crm-premium-body',
  },
  showClass: { popup: 'crm-ani-in' },
  hideClass: { popup: 'crm-ani-out' },
  buttonsStyling: false,
}

export const useNotifications = () => {

  const showSuccess = (title: string, _message?: string) => toast(title, 'success')
  const showError = (title: string, message?: string) => toast(title || message || 'Error', 'error')
  const showWarning = (title: string, message?: string) => toast(title || message || 'Advertencia', 'warning')
  const showInfo = (title: string, _message?: string) => toast(title, 'info')

  const toast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const config = {
      success: { icon: 'fa-check', color: '#10b981' },
      error:   { icon: 'fa-times', color: '#f43f5e' },
      warning: { icon: 'fa-exclamation', color: '#f59e0b' },
      info:    { icon: 'fa-info', color: '#3b82f6' },
    }

    return Swal.fire({
      ...base,
      timer: 2500,
      toast: true,
      customClass: {
        popup: `crm-pill-toast crm-pill-${type}`,
      },
      html: `
        <div class="crm-pill-wrapper">
          <div class="crm-pill-icon-box" style="background: ${config[type].color}">
            <i class="fas ${config[type].icon}"></i>
          </div>
          <span class="crm-pill-message">${message}</span>
        </div>
      `,
    })
  }

  /** Confirmación de eliminación — Manteniendo minimalismo */
  const confirmDelete = (itemName: string) =>
    Swal.fire({
      ...base,
      icon: 'warning',
      title: '¿Eliminar?',
      text: itemName,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText:  'No',
      position: 'center',
      customClass: {
        popup: 'crm-confirm-modal',
        confirmButton: 'crm-btn-del',
        cancelButton: 'crm-btn-keep',
      },
    })

  const showLoading = (title = 'Sincronizando...') =>
    Swal.fire({
      ...base,
      title,
      allowOutsideClick: false,
      showConfirmButton: false,
      html: '<div class="crm-loader-line"></div>'
    })

  const closeLoading = () => Swal.close()

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    confirmDelete,
    showLoading,
    closeLoading,
    toast,
  }
}

export const injectSwalStyles = () => {
  if (typeof document === 'undefined') return
  const style = document.createElement('style')
  style.id = 'crm-swal-styles'
  style.textContent = `
/* ── Estética Premium Pill ── */
.crm-pill-toast {
  background: #ffffff !important;
  border-radius: 100px !important;
  padding: 0.4rem 0.8rem !important;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.15) !important;
  border: 1px solid rgba(0,0,0,0.03) !important;
  margin-top: 1.2rem !important;
  width: auto !important;
  min-width: 220px !important;
  max-width: 400px !important;
}

.crm-pill-wrapper {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
}

.crm-pill-icon-box {
  width: 24px !important;
  height: 24px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: white !important;
  font-size: 0.7rem !important;
  flex-shrink: 0 !important;
}

.crm-pill-message {
  font-family: 'Inter', sans-serif !important;
  font-weight: 600 !important;
  color: #334155 !important;
  font-size: 0.75rem !important; /* TEXTO MÁS PEQUEÑO Y REFINADO */
  letter-spacing: -0.01em !important;
  white-space: nowrap !important;
}

/* ── Confirmación ── */
.crm-confirm-modal {
  background: white !important;
  border-radius: 1.5rem !important;
  padding: 2rem !important;
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.1) !important;
}
.crm-btn-del { background: #f43f5e !important; color: white !important; padding: 0.6rem 1.5rem !important; border-radius: 0.75rem !important; font-weight: 800 !important; font-size: 0.75rem !important; margin: 0 5px !important; }
.crm-btn-keep { background: #f1f5f9 !important; color: #64748b !important; padding: 0.6rem 1.5rem !important; border-radius: 0.75rem !important; font-weight: 800 !important; font-size: 0.75rem !important; margin: 0 5px !important; }

/* ── Animaciones ── */
@keyframes crm-ani-in {
  from { transform: translate3d(0, -30px, 0) scale(0.95); opacity: 0; }
  to { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
}
@keyframes crm-ani-out {
  to { transform: translate3d(0, -20px, 0) scale(0.95); opacity: 0; }
}
.crm-ani-in { animation: crm-ani-in 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards !important; }
.crm-ani-out { animation: crm-ani-out 0.3s ease-in forwards !important; }

/* ── Ocultar Progress Bar ── */
.swal2-timer-progress-bar { display: none !important; }
.swal2-timer-progress-bar-container { display: none !important; }

/* ── Limpieza global ── */
.swal2-backdrop-show { background: transparent !important; backdrop-filter: none !important; }
.swal2-container { pointer-events: none !important; }
.swal2-popup { pointer-events: auto !important; }
`
  const existing = document.getElementById('crm-swal-styles')
  if (existing) existing.remove()
  document.head.appendChild(style)
}
