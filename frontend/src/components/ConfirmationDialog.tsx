import type { FC } from 'react'

interface ConfirmationDialogProps {
  open: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  open,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!open) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel()
        }
      }}
    >
      <div className="card" style={{ width: 'min(480px, 94vw)', margin: 0 }}>
        <div className="card-header">{title}</div>
        <div className="card-body">
          <p style={{ marginBottom: '1rem' }}>{message}</p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary btn-sm" onClick={onCancel}>
              {cancelText}
            </button>
            <button type="button" className="btn-danger btn-sm" onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog