import { useRef } from 'react'

import sendIconUrl from '../../../assets/icons/references/send.svg'
import styles from './ReferenceSubmission.module.css'

interface ReferenceComposerProps {
  disabled: boolean
  errorMessage: string | null
  value: string
  onChange: (value: string) => void
  onContinue: () => void
}

export function ReferenceComposer({
  disabled,
  errorMessage,
  value,
  onChange,
  onContinue,
}: ReferenceComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  return (
    <div className={styles.composerShell}>
      <form
        className={`${styles.composer} ${disabled ? styles.composerDisabled : ''}`}
        onSubmit={(event) => {
          event.preventDefault()
          onContinue()
        }}
      >
        <textarea
          ref={textareaRef}
          aria-describedby={errorMessage ? 'reference-composer-error' : undefined}
          aria-invalid={Boolean(errorMessage)}
          aria-label="Write a reference"
          disabled={disabled}
          maxLength={1500}
          placeholder="Start typing..."
          rows={1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault()
              onContinue()
            }
          }}
        />

        <button type="submit" disabled={disabled} aria-label="Continue publishing reference">
          <img src={sendIconUrl} alt="" />
        </button>
      </form>

      {errorMessage && (
        <p className={styles.composerError} id="reference-composer-error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
