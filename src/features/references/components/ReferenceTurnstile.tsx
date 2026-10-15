import { useEffect, useRef } from 'react'

import { loadTurnstile } from '../anti-spam/turnstile.ts'
import styles from './ReferenceSubmission.module.css'

interface ReferenceTurnstileProps {
  revision: number
  siteKey: string
  onError: () => void
  onToken: (token: string) => void
}

export function ReferenceTurnstile({
  revision,
  siteKey,
  onError,
  onToken,
}: ReferenceTurnstileProps) {
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
          action: 'reference_submit',
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
  }, [revision, siteKey])

  return <div className={styles.turnstileSlot} ref={containerRef} />
}
