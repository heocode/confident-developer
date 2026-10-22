interface ServicesPageFeedbackProps {
  isError?: boolean
  message: string
  onRetry?: () => void
  title: string
}

export function ServicesPageFeedback({
  isError = false,
  message,
  onRetry,
  title,
}: ServicesPageFeedbackProps) {
  return (
    <div role={isError ? 'alert' : 'status'}>
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
