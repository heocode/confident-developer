import { useEffect, useRef } from 'react'

import { loadTurnstile } from './turnstile.ts'
import type { TurnstileAction } from './turnstile.ts'

interface TurnstileWidgetProps {
  action: TurnstileAction
  className?: string
  revision: number
  siteKey: string
  onError: () => void
  onToken: (token: string) => void
}

export function TurnstileWidget({
  action,
  className,
  revision,
  siteKey,
  onError,
  onToken,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onErrorRef = useRef(onError)
  const onTokenRef = useRef(onToken)

  useEffect(() => {
    onErrorRef.current = onError
    onTokenRef.current = onToken
  }, [onError, onToken])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let disposed = false
    let widgetId: string | null = null

    void loadTurnstile()
      .then((turnstile) => {
        if (disposed) return
        widgetId = turnstile.render(container, {
          sitekey: siteKey,
          action,
          appearance: 'interaction-only',
          callback: (token) => onTokenRef.current(token),
          'error-callback': () => onErrorRef.current(),
          'expired-callback': () => onTokenRef.current(''),
          'timeout-callback': () => onTokenRef.current(''),
        })
      })
      .catch(() => {
        if (!disposed) onErrorRef.current()
      })

    return () => {
      disposed = true
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
      container.replaceChildren()
    }
  }, [action, revision, siteKey])

  return <div className={className} ref={containerRef} />
}
