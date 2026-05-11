import { useMemo, useState } from 'react'
import type { SessionState } from '../models/GeoTypes'
import { copyToClipboard, downloadJSON, exportSessionToJSON } from '../services/exportService'

interface ExportButtonProps {
  session: SessionState
}

export default function ExportButton({ session }: ExportButtonProps) {
  const [status, setStatus] = useState<string>('')

  const hasExportableData = useMemo(() => {
    return Boolean(session.primaryPolygon) || session.excludePolygons.length > 0 || Boolean(session.measurement)
  }, [session])

  const payload = useMemo(() => exportSessionToJSON(session), [session])

  const handleDownload = () => {
    const filename = `geoacre-session-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    downloadJSON(payload, filename)
    setStatus('Session downloaded.')
  }

  const handleCopy = async () => {
    try {
      await copyToClipboard(payload)
      setStatus('Session copied to clipboard.')
    } catch {
      setStatus('Copy failed. Your browser blocked clipboard access.')
    }
  }

  return (
    <div className="card" aria-live="polite">
      <div className="card-header">Export Session</div>
      <div className="card-body">
        <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
          Download or copy your current polygons, measurements, and unit preferences as JSON.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-primary btn-sm"
            onClick={handleDownload}
            disabled={!hasExportableData}
            aria-label="Download session JSON"
          >
            Download JSON
          </button>
          <button
            className="btn-secondary btn-sm"
            onClick={handleCopy}
            disabled={!hasExportableData}
            aria-label="Copy session JSON"
          >
            Copy JSON
          </button>
        </div>
        {status ? (
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>{status}</p>
        ) : null}
      </div>
    </div>
  )
}