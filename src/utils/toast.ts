import { useNotifications } from '../composables/useNotifications'

const { showSuccess, showError, showWarning, showInfo } = useNotifications()

export const toast = {
  success: (message: string) => showSuccess(message),
  error:   (message: string) => showError(message),
  warning: (message: string) => showWarning(message),
  info:    (message: string) => showInfo(message),
}
