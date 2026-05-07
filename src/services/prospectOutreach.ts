import { prospectService } from './prospectService'
import type { Prospect } from '@/types/prospect'

export type OutreachChannel = 'email' | 'whatsapp' | 'call'

const lastAssistantMessage = (p: Prospect): string => {
  const msgs = p.messages || []
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].role === 'assistant') return msgs[i].content
  }
  return ''
}

const buildContext = (p: Prospect): string => {
  const proposal = lastAssistantMessage(p).slice(0, 2000)
  return `PROSPECTO: ${p.prospectName}
EMPRESA: ${p.company || '(no especificada)'}
CONTACTO: ${p.contactName || '(no especificado)'}
ESTADO: ${p.status || 'nuevo'}

PROPUESTA / DIAGNÓSTICO MÁS RECIENTE:
"""
${proposal || '(aún sin propuesta generada)'}
"""`
}

const PROMPTS: Record<OutreachChannel, (ctx: string) => string> = {
  email: (ctx) => `Eres un comercial senior de GEMS. Redacta un EMAIL frío de primer contacto a este prospecto.

${ctx}

REQUISITOS:
- Asunto que enganche (max 60 caracteres, sin clickbait barato)
- Saludo personalizado al contacto si lo conoces
- Hook: una observación específica de su negocio (no genérica)
- Propuesta de valor: 1 frase concreta de cómo ayudamos
- CTA: pedir 15 minutos de llamada esta semana, no más
- Firma genérica "Equipo GEMS"
- Tono: profesional pero humano. SIN emojis. SIN palabras como "estimado", "innovador", "sinergia", "transformación digital", "líder".

FORMATO DE SALIDA (estricto, sin texto adicional):
Asunto: <asunto aquí>

<cuerpo del email aquí>`,

  whatsapp: (ctx) => `Eres un comercial senior de GEMS. Redacta un mensaje de WhatsApp de primer contacto.

${ctx}

REQUISITOS:
- Máximo 4 líneas, cada una corta
- Tutea, lenguaje natural y conversacional (no "estimado")
- Hook específico al negocio del prospecto
- 1 pregunta abierta al final que invite a responder
- SIN emojis excesivos (uno solo si suma, normalmente ninguno)
- SIN saludos formales largos

FORMATO DE SALIDA (estricto, devuelve SOLO el mensaje, sin "Mensaje:" ni explicaciones):
<mensaje aquí>`,

  call: (ctx) => `Eres un comercial senior de GEMS. Redacta un SCRIPT de llamada en frío de 60 segundos.

${ctx}

ESTRUCTURA:
**Apertura (10s):** preséntate, di por qué llamas
**Hook (15s):** observación específica del negocio del prospecto + pregunta calificadora
**Pitch (20s):** propuesta de valor concreta
**Cierre (15s):** propuesta de próximo paso (reunión de 20min)

OBJECCIONES PREVISIBLES (al final del script):
Lista 3 objeciones probables y cómo responderlas en 1 frase cada una.

FORMATO: Markdown bien estructurado.`,
}

const STRIP_CODE_FENCE = /^```(\w+)?\n?|\n?```$/g

export interface OutreachResult {
  channel: OutreachChannel
  subject?: string
  body: string
  raw: string
}

export const outreachService = {
  async generate(prospect: Prospect, channel: OutreachChannel): Promise<OutreachResult> {
    const prompt = PROMPTS[channel](buildContext(prospect))
    const raw = (await prospectService.generateWithGemini({ prompt }))
      .replace(STRIP_CODE_FENCE, '')
      .trim()

    if (channel === 'email') {
      const match = raw.match(/^Asunto:\s*(.+?)\n+([\s\S]+)$/i)
      if (match) {
        return { channel, subject: match[1].trim(), body: match[2].trim(), raw }
      }
      return { channel, subject: '', body: raw, raw }
    }

    return { channel, body: raw, raw }
  },

  buildWhatsAppLink(phone: string, message: string): string {
    const cleanPhone = phone.replace(/[^\d]/g, '')
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
  },

  buildMailtoLink(email: string, subject: string, body: string): string {
    const params = new URLSearchParams()
    if (subject) params.set('subject', subject)
    params.set('body', body)
    return `mailto:${email}?${params.toString()}`
  },
}
