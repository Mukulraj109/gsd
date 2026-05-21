import { SendMailClient } from "zeptomail"

export type ZeptoSendParams = {
  to: { email: string; name?: string }
  templateKey: string
  merge: Record<string, string>
}

function normalizeApiKey(raw: string): string {
  const key = raw.trim()
  return key.startsWith("Zoho-enczapikey") ? key : `Zoho-enczapikey ${key}`
}

/** Base URL only (e.g. https://api.zeptomail.in/). Do not pass the full /email/template path. */
function getZeptoBaseUrl(): string {
  const configured = process.env.ZEPTO_API_URL?.trim()
  if (configured) {
    return configured.endsWith("/") ? configured : `${configured}/`
  }
  return "https://api.zeptomail.in/"
}

export function isZeptoConfigured(): boolean {
  return Boolean(
    process.env.ZEPTO_API_KEY?.trim() &&
      process.env.ZEPTO_FROM_EMAIL?.trim()
  )
}

export async function sendZeptoTemplate(params: ZeptoSendParams): Promise<boolean> {
  const apiKey = process.env.ZEPTO_API_KEY?.trim()
  const fromEmail = process.env.ZEPTO_FROM_EMAIL?.trim()
  const fromName = process.env.ZEPTO_FROM_NAME?.trim() || "FirstStep GSD"

  if (!apiKey || !fromEmail) {
    console.warn("[zepto] Skipping send — ZEPTO_API_KEY or ZEPTO_FROM_EMAIL not set")
    return false
  }

  const client = new SendMailClient({
    url: getZeptoBaseUrl(),
    token: normalizeApiKey(apiKey),
  })

  try {
    await client.sendMailWithTemplate({
      template_key: params.templateKey,
      from: { address: fromEmail, name: fromName },
      to: [
        {
          email_address: {
            address: params.to.email,
            name: params.to.name || params.to.email,
          },
        },
      ],
      merge_info: params.merge,
    })
    return true
  } catch (err) {
    console.error("[zepto] sendMailWithTemplate failed", err)
    return false
  }
}
