import { onBeforeUnmount, ref } from 'vue'

/**
 * Web Speech API wrapper for Spanish dictation (es-CO/MX/CR-friendly).
 *
 * Uso típico:
 *   const { isRecording, isSupported, toggle } = useSpeechToText({
 *     onInterim: (text) => (formData.title = text),
 *     onFinal: (text) => (formData.title = text),
 *   })
 *
 * Estado:
 *   isSupported: boolean — true si el browser soporta Web Speech API
 *   isRecording: Ref<boolean> — true mientras está escuchando
 *
 * Acciones:
 *   start() / stop() / toggle()
 *
 * Notas:
 *   - SpeechRecognition es prefixed en Chrome/Edge (webkitSpeechRecognition).
 *     Safari iOS funciona, pero Firefox no soporta nada por ahora.
 *   - El idioma se ajusta automáticamente al navigator.language si es 'es-*'.
 *     Si no, cae a 'es-CO'.
 *   - El stream se acumula con un baseline para no pisar lo ya escrito.
 */

interface UseSpeechToTextOptions {
  /** Texto inicial sobre el que acumular (no se pierde lo escrito antes) */
  getInitialText?: () => string
  /** Llamado mientras se está dictando (incluye texto interim no-final) */
  onInterim?: (text: string) => void
  /** Llamado solo cuando una frase queda como final (mejor calidad) */
  onFinal?: (text: string) => void
  /** Llamado al detener (con el texto final acumulado) */
  onComplete?: (text: string) => void
  /** Llamado en errores (permisos, no-soporte, etc.) */
  onError?: (message: string) => void
  /** Idioma (default: auto desde navigator.language, fallback es-CO) */
  lang?: string
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const SpeechRecognitionImpl =
    typeof window !== 'undefined'
      ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
      : null

  const isSupported = !!SpeechRecognitionImpl
  const isRecording = ref(false)
  let recognition: any = null
  let baseline = ''

  const resolveLang = (): string => {
    if (options.lang) return options.lang
    const navLang = (typeof navigator !== 'undefined' && navigator.language) || ''
    if (navLang.toLowerCase().startsWith('es')) return navLang
    return 'es-CO'
  }

  const start = () => {
    if (!SpeechRecognitionImpl) {
      options.onError?.('Tu navegador no soporta dictado por voz. Usa Chrome o Edge.')
      return
    }
    if (isRecording.value) return

    recognition = new SpeechRecognitionImpl()
    recognition.lang = resolveLang()
    recognition.continuous = true
    recognition.interimResults = true

    const initial = options.getInitialText?.() || ''
    baseline = initial ? initial.trimEnd() + ' ' : ''
    let finalTranscript = ''

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
          options.onFinal?.((baseline + finalTranscript).trimStart())
        } else {
          interim += transcript
        }
      }
      options.onInterim?.((baseline + finalTranscript + interim).trimStart())
    }

    recognition.onerror = (event: any) => {
      const code = event?.error || 'unknown'
      let msg = `Error al dictar (${code})`
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        msg = 'Permiso de micrófono denegado'
      } else if (code === 'no-speech') {
        msg = 'No se detectó voz'
      } else if (code === 'audio-capture') {
        msg = 'No se encontró micrófono'
      } else if (code === 'network') {
        msg = 'Error de red al transcribir'
      }
      options.onError?.(msg)
      isRecording.value = false
    }

    recognition.onend = () => {
      isRecording.value = false
      options.onComplete?.((baseline + finalTranscript).trimStart())
    }

    try {
      recognition.start()
      isRecording.value = true
    } catch (e: any) {
      console.warn('No se pudo iniciar dictado:', e)
      options.onError?.(e?.message || 'No se pudo iniciar el dictado')
      isRecording.value = false
    }
  }

  const stop = () => {
    if (!recognition) return
    try {
      recognition.stop()
    } catch {
      /* ignora */
    }
    isRecording.value = false
  }

  const toggle = () => {
    if (isRecording.value) stop()
    else start()
  }

  onBeforeUnmount(() => stop())

  return {
    isSupported,
    isRecording,
    start,
    stop,
    toggle,
  }
}
