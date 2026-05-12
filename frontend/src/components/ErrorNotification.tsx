import type { FC } from 'react'

type ErrorNotificationProps = {
  message: string
  onDismiss?: () => void
}

const ErrorNotification: FC<ErrorNotificationProps> = ({ message, onDismiss }) => {
  return (
    <div
      className="alert alert-warning"
      role="alert"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        maxWidth: '420px',
        zIndex: 3500,
        boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <span>{message}</span>
        {onDismiss ? (
          <button type="button" className="btn-secondary btn-sm" onClick={onDismiss} aria-label="Dismiss error">
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default ErrorNotification