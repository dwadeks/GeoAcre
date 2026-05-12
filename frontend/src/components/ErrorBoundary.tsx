import React from 'react'
import type { ErrorBoundaryState } from './ErrorBoundaryState'

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  public constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { hasError: false }
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Unhandled React error:', error, errorInfo)
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ margin: '2rem auto', maxWidth: '720px' }}>
          <div className="card-header">Unexpected Error</div>
          <div className="card-body">
            <p>The application encountered an unexpected error.</p>
            <p className="text-muted">{this.state.errorMessage}</p>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
