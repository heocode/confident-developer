import { useCallback, useEffect, useRef, useState } from 'react'

import { DialogCloseButton } from '../../../components/dialog/DialogCloseButton.tsx'
import { useModalPageLock } from '../../../components/dialog/useModalPageLock.ts'
import { ContactForm } from './ContactForm.tsx'
import styles from './ContactDrawer.module.css'

interface ContactDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function ContactDrawer({ isOpen, onClose }: ContactDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handleSubmittingChange = useCallback((nextIsSubmitting: boolean) => {
    setIsSubmitting(nextIsSubmitting)
  }, [])
  useModalPageLock(isOpen)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  return (
    <dialog
      className={styles.drawer}
      ref={dialogRef}
      aria-labelledby="contact-dialog-title"
      onCancel={(event) => {
        if (isSubmitting) event.preventDefault()
        else onClose()
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || isSubmitting) return
        const bounds = event.currentTarget.getBoundingClientRect()
        const isInside =
          event.clientX >= bounds.left &&
          event.clientX <= bounds.right &&
          event.clientY >= bounds.top &&
          event.clientY <= bounds.bottom
        if (!isInside) onClose()
      }}
    >
      <DialogCloseButton
        className={styles.closeButton}
        disabled={isSubmitting}
        label="Close contact form"
        onClick={onClose}
      />
      <ContactForm onClose={onClose} onSubmittingChange={handleSubmittingChange} />
    </dialog>
  )
}
