import { useNotifications } from './useNotifications'

export function useToast() {
  const { showSuccess, showError, showWarning, showInfo, confirmDelete } = useNotifications()

  const toast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    switch (type) {
      case 'success': return showSuccess(message)
      case 'error':   return showError(message)
      case 'warning': return showWarning(message)
      case 'info':
      default:        return showInfo(message)
    }
  }

  return {
    toast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    confirmDelete,
  }
}
