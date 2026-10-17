import type { MouseEventHandler } from 'react'

import styles from './DialogCloseButton.module.css'

interface DialogCloseButtonProps {
  className?: string
  disabled?: boolean
  label: string
  onClick: MouseEventHandler<HTMLButtonElement>
}

export function DialogCloseButton({
  className,
  disabled = false,
  label,
  onClick,
}: DialogCloseButtonProps) {
  return (
    <button
      className={[styles.button, className].filter(Boolean).join(' ')}
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <span className={styles.icon} aria-hidden="true" />
    </button>
  )
}
