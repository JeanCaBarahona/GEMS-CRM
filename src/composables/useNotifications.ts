import Swal from 'sweetalert2'

// Configuración base para SweetAlert2 con tema premium glassmorphic (LIGHT)
const swalConfig = {
  background: 'rgba(255, 255, 255, 0.98)',
  color: '#0f172a',
  confirmButtonColor: '#52c2ef',
  cancelButtonColor: 'transparent',
  customClass: {
    popup: 'swal-premium-popup',
    title: 'swal-premium-title',
    htmlContainer: 'swal-premium-content',
    confirmButton: 'swal-premium-confirm',
    cancelButton: 'swal-premium-cancel',
    input: 'swal-premium-input'
  },
  showClass: {
    popup: 'animate__animated animate__fadeInDown animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutUp animate__faster'
  }
}

export const useNotifications = () => {
  // Notificación de éxito
  const showSuccess = (title: string, message?: string) => {
    return Swal.fire({
      ...swalConfig,
      icon: 'success',
      iconColor: '#10b981',
      title,
      text: message,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false
    })
  }

  // Notificación de error
  const showError = (title: string, message?: string) => {
    return Swal.fire({
      ...swalConfig,
      icon: 'error',
      iconColor: '#ef4444',
      title,
      text: message,
      confirmButtonText: 'Cerrar'
    })
  }

  // Notificación de advertencia
  const showWarning = (title: string, message?: string) => {
    return Swal.fire({
      ...swalConfig,
      icon: 'warning',
      iconColor: '#f59e0b',
      title,
      text: message,
      confirmButtonText: 'Entendido'
    })
  }

  // Notificación informativa
  const showInfo = (title: string, message?: string) => {
    return Swal.fire({
      ...swalConfig,
      icon: 'info',
      iconColor: '#52c2ef',
      title,
      text: message,
      confirmButtonText: 'Entendido'
    })
  }

  // Confirmación de eliminación
  const confirmDelete = (itemName: string, itemType: string = 'elemento') => {
    return Swal.fire({
      ...swalConfig,
      title: '¿Estás seguro?',
      html: `
        <div class="space-y-4 py-4">
          <p class="text-slate-600 font-medium">
            Esta acción eliminará permanentemente <span class="text-primary-600 font-black">${itemName}</span>
          </p>
          <p class="text-slate-400 text-[10px] uppercase tracking-widest font-black">
            Esta acción no se puede deshacer
          </p>
        </div>
      `,
      icon: 'warning',
      iconColor: '#f43f5e',
      showCancelButton: true,
      confirmButtonText: `Sí, eliminar`,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true
    })
  }

  // Confirmación genérica
  const confirm = (title: string, message: string, confirmText: string = 'Confirmar') => {
    return Swal.fire({
      ...swalConfig,
      title,
      text: message,
      icon: 'question',
      iconColor: '#52c2ef',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    })
  }

  // Loading
  const showLoading = (title: string = 'Procesando...') => {
    return Swal.fire({
      ...swalConfig,
      title,
      html: `
        <div class="flex flex-col items-center py-6">
          <div class="w-12 h-12 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-4"></div>
          <p class="text-slate-500 text-sm font-bold">Por favor espera...</p>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false
    })
  }

  // Cerrar loading
  const closeLoading = () => {
    Swal.close()
  }

  // Toast simple
  const toast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const iconColors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#52c2ef'
    }

    const Toast = Swal.mixin({
      ...swalConfig,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      iconColor: iconColors[type],
      customClass: {
        popup: 'swal-premium-toast',
        title: 'swal-premium-toast-title'
      }
    })

    return Toast.fire({
      icon: type,
      title: message
    })
  }

  // Input personalizado
  const showInput = (title: string, inputLabel: string, inputType: 'text' | 'email' | 'password' | 'textarea' = 'text') => {
    return Swal.fire({
      ...swalConfig,
      title,
      input: inputType,
      inputLabel,
      inputPlaceholder: `Ingresa ${inputLabel.toLowerCase()}`,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return `${inputLabel} es requerido`
        }
      }
    })
  }

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
    showInput
  }
}

// Estilos CSS personalizados para SweetAlert2
export const injectSwalStyles = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style')
    style.textContent = `
      .swal-premium-popup {
        border-radius: 2rem !important;
        border: 1px solid rgba(226, 232, 240, 0.8) !important;
        backdrop-filter: blur(16px) !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        padding: 1.5rem !important;
      }
      
      .swal-premium-title {
        font-family: 'Inter', sans-serif !important;
        font-weight: 900 !important;
        letter-spacing: -0.025em !important;
        color: #0f172a !important;
        font-size: 1.25rem !important;
        margin-top: 1rem !important;
        outline: none !important;
        user-select: none !important;
      }
      
      .swal-premium-content {
        font-family: 'Inter', sans-serif !important;
        color: #64748b !important;
        font-weight: 500 !important;
        font-size: 0.9rem !important;
      }
      
      .swal-premium-confirm {
        background: #52c2ef !important;
        background: linear-gradient(135deg, #52c2ef, #38bdf8) !important;
        border: none !important;
        border-radius: 1rem !important;
        padding: 0.75rem 1.75rem !important;
        font-weight: 800 !important;
        font-size: 0.75rem !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        box-shadow: 0 4px 6px -1px rgba(82, 194, 239, 0.3) !important;
        color: white !important;
      }
      
      .swal-premium-confirm:hover {
        transform: translateY(-1px) scale(1.02) !important;
        box-shadow: 0 10px 15px -3px rgba(82, 194, 239, 0.4) !important;
        filter: brightness(1.05) !important;
      }
      
      .swal-premium-cancel {
        background: #f1f5f9 !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 1rem !important;
        padding: 0.75rem 1.75rem !important;
        font-weight: 800 !important;
        font-size: 0.75rem !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        color: #64748b !important;
        transition: all 0.3s ease !important;
      }
      
      .swal-premium-cancel:hover {
        background: #e2e8f0 !important;
        color: #0f172a !important;
      }
      
      .swal-premium-input {
        background: #f8fafc !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 0.75rem !important;
        color: #0f172a !important;
        font-family: inherit !important;
        font-size: 0.875rem !important;
      }
      
      .swal-premium-input:focus {
        border-color: #52c2ef !important;
        box-shadow: 0 0 0 4px rgba(82, 194, 239, 0.1) !important;
      }

      .swal-premium-toast {
        border-radius: 1rem !important;
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(10px) !important;
        border: 1px solid #e2e8f0 !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
      }

      .swal-premium-toast-title {
        color: #0f172a !important;
        font-weight: 700 !important;
        font-size: 0.875rem !important;
      }
      
      .swal2-timer-progress-bar-container {
        position: absolute !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        border-bottom-left-radius: 2rem !important;
        border-bottom-right-radius: 2rem !important;
        overflow: hidden !important;
        height: 8px !important;
        background: rgba(82, 194, 239, 0.1) !important;
      }
      
      .swal2-timer-progress-bar {
        background: linear-gradient(to right, #52c2ef, #38bdf8) !important;
        height: 100% !important;
        margin: 0 !important;
        border-radius: 0 !important;
      }

      .swal2-icon {
        border-width: 2px !important;
        margin-top: 1rem !important;
      }
    `
    document.head.appendChild(style)
  }
}
