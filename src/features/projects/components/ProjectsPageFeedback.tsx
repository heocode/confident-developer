import styles from './ProjectsPageFeedback.module.css'

interface ProjectsPageFeedbackProps {
  isError?: boolean
  message: string
  onRetry?: () => void
  title: string
}

export function ProjectsPageFeedback({ isError = false, message, onRetry, title }: ProjectsPageFeedbackProps) {
  return (
    <div className={styles.feedback} role={isError || onRetry ? 'alert' : 'status'}>
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}
