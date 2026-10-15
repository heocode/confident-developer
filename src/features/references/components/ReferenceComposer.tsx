import { useEffect, useLayoutEffect, useRef } from 'react'

import sendIconUrl from '../../../assets/icons/references/send.svg'
import styles from './ReferenceSubmission.module.css'

interface ReferenceComposerProps {
  disabled: boolean
  errorMessage: string | null
  value: string
  onChange: (value: string) => void
  onContinue: () => void
}

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = 'auto'
  const maxHeight = Number.parseFloat(window.getComputedStyle(textarea).maxHeight)
  const nextHeight = Math.min(textarea.scrollHeight, maxHeight)
  textarea.style.height = `${nextHeight}px`
  textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
}

export function ReferenceComposer({
  disabled,
  errorMessage,
  value,
  onChange,
  onContinue,
}: ReferenceComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    if (textareaRef.current) resizeTextarea(textareaRef.current)
  }, [value])

  useEffect(() => {
    const handleResize = () => {
      if (textareaRef.current) resizeTextarea(textareaRef.current)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
