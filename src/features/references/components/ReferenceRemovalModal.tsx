import { useEffect, useRef } from 'react'

import { DialogCloseButton } from '../../../components/dialog/DialogCloseButton.tsx'
import { useModalPageLock } from '../../../components/dialog/useModalPageLock.ts'
import type { OwnedReferenceStatus } from '../model/reference.types.ts'
import styles from './ReferenceSubmission.module.css'

interface ReferenceRemovalModalProps {
  errorMessage: string | null
  isOpen: boolean
  isRemoving: boolean
  status: OwnedReferenceStatus | null
  onClose: () => void
  onConfirm: () => Promise<boolean>
}

export function ReferenceRemovalModal({
  errorMessage,
  isOpen,
  isRemoving,
  status,
  onClose,
  onConfirm,
}: ReferenceRemovalModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isRejected = status === 'rejected'
  useModalPageLock(isOpen)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  function closeModal() {
    if (!isRemoving) onClose()
  }

  async function confirmRemoval() {
    const removed = await onConfirm()
    if (removed) onClose()
  }

  return (
    <dialog
      className={`${styles.modal} ${styles.removalModal}`}
      ref={dialogRef}
      aria-describedby="reference-removal-description"
      aria-labelledby="reference-removal-title"
      onCancel={(event) => {
        if (isRemoving) event.preventDefault()
        else closeModal()
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || isRemoving) return
        const bounds = event.currentTarget.getBoundingClientRect()
        const isInside =
          event.clientX >= bounds.left &&
          event.clientX <= bounds.right &&
          event.clientY >= bounds.top &&
          event.clientY <= bounds.bottom
        if (!isInside) closeModal()
      }}
    >
      <DialogCloseButton
        className={styles.closeButton}
        disabled={isRemoving}
        label="Close confirmation"
        onClick={closeModal}
      />

      <h3 id="reference-removal-title">
        {isRejected ? 'Delete this reference?' : 'Withdraw this reference?'}
      </h3>
      <p id="reference-removal-description">
        This permanently removes your reference. This action cannot be undone.
      </p>

      {errorMessage && (
        <p className={styles.formError} role="alert">
          {errorMessage}
        </p>
      )}

      <div className={styles.removalActions}>
        <button type="button" disabled={isRemoving} onClick={closeModal}>
          Cancel
        </button>
        <button
          className={styles.destructiveButton}
          type="button"
          disabled={isRemoving}
          onClick={() => void confirmRemoval()}
        >
          {isRemoving ? 'Removing…' : isRejected ? 'Delete' : 'Withdraw'}
        </button>
      </div>
    </dialog>
  )
}
