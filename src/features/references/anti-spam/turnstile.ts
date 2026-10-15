const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script'
const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

export interface TurnstileRenderOptions {
  sitekey: string
  action: string
  appearance: 'interaction-only'
  callback: (token: string) => void
  'error-callback': () => void
  'expired-callback': () => void
  'timeout-callback': () => void
}

export interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileRenderOptions): string
  remove(widgetId: string): void
  reset(widgetId: string): void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let turnstilePromise: Promise<TurnstileApi> | null = null

function waitForTurnstile(resolve: (api: TurnstileApi) => void, reject: (error: Error) => void) {
  let attempts = 0
  const timer = window.setInterval(() => {
    if (window.turnstile) {
      window.clearInterval(timer)
      resolve(window.turnstile)
      return
    }

    attempts += 1
    if (attempts >= 100) {
      window.clearInterval(timer)
      reject(new Error('Turnstile did not become available.'))
    }
  }, 50)
}

export function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (turnstilePromise) return turnstilePromise

  turnstilePromise = new Promise<TurnstileApi>((resolve, reject) => {
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID)
    if (existingScript) {
      waitForTurnstile(resolve, reject)
      return
    }

    const script = document.createElement('script')
    script.id = TURNSTILE_SCRIPT_ID
    script.src = TURNSTILE_SCRIPT_URL
    script.async = true
    script.defer = true
    script.addEventListener('load', () => waitForTurnstile(resolve, reject), { once: true })
    script.addEventListener('error', () => reject(new Error('Turnstile could not be loaded.')), {
      once: true,
    })
    document.head.append(script)
  }).catch((error: unknown) => {
    turnstilePromise = null
    throw error
  })

  return turnstilePromise
}
