// Las capturas de pantalla se guardan en la base como data URL; el backend
// acepta hasta ~2 millones de caracteres. Se reduce a 1920 px de lado mayor y
// se baja la calidad JPEG hasta que entre.
const MAX_DIMENSION = 1920
const MAX_DATA_URL_LENGTH = 1_900_000

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')) }
    img.src = url
  })
}

export async function compressImageToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Solo se pueden adjuntar imágenes como captura')

  const img = await loadImage(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo procesar la imagen')
  // Fondo blanco: las capturas PNG con transparencia se verían negras en JPEG
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  for (const quality of [0.85, 0.7, 0.55, 0.4]) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality)
    if (dataUrl.length <= MAX_DATA_URL_LENGTH) return dataUrl
  }
  throw new Error('La captura es demasiado grande incluso comprimida; recórtala e inténtalo de nuevo')
}
