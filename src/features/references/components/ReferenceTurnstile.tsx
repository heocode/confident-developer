import { TurnstileWidget } from '../../../components/anti-spam/TurnstileWidget.tsx'
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
  return (
    <TurnstileWidget
      action="reference_submit"
      className={styles.turnstileSlot}
      revision={revision}
      siteKey={siteKey}
      onError={onError}
      onToken={onToken}
    />
  )
}
