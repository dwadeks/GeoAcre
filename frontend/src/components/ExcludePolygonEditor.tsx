import { FC, useMemo } from 'react'
import type { Polygon, UnitPreference } from '../models/GeoTypes'
import { formatArea } from '../services/geometryService'

interface ExcludePolygonEditorProps {
  isExcludeMode: boolean
  onToggleExcludeMode: () => void
  excludePolygons: Polygon[]
  onDeleteExcludePolygon: (polygonId: string) => void
  primaryAreaSquareMeters: number
  netAreaSquareMeters: number
  unitPreference: UnitPreference
}

const ExcludePolygonEditor: FC<ExcludePolygonEditorProps> = ({
  isExcludeMode,
  onToggleExcludeMode,
  excludePolygons,
  onDeleteExcludePolygon,
  primaryAreaSquareMeters,
  netAreaSquareMeters,
  unitPreference,
}) => {
  const excludedAreaSquareMeters = useMemo(() => {
    return Math.max(0, primaryAreaSquareMeters - netAreaSquareMeters)
  }, [primaryAreaSquareMeters, netAreaSquareMeters])

  return (
    <div className="card">
      <div className="card-header">Exclude Polygons</div>
      <div className="card-body">
        <button
          type="button"
          className={isExcludeMode ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
          onClick={onToggleExcludeMode}
        >
          {isExcludeMode ? 'Exit Exclude Mode' : 'Add Exclude Mode'}
        </button>

        <div style={{ marginTop: '1rem' }}>
          <p style={{ marginBottom: '0.25rem' }}>
            Primary Area: <strong>{formatArea(primaryAreaSquareMeters, unitPreference.areaUnit)}</strong>
          </p>
          <p style={{ marginBottom: '0.25rem' }}>
            Total Excluded Area: <strong>{formatArea(excludedAreaSquareMeters, unitPreference.areaUnit)}</strong>
          </p>
          <p style={{ marginBottom: '0.75rem' }}>
            Net Area: <strong>{formatArea(netAreaSquareMeters, unitPreference.areaUnit)}</strong>
          </p>
        </div>

        {excludePolygons.length === 0 ? (
          <p className="text-muted" style={{ margin: 0 }}>
            No exclude polygons yet.
          </p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {excludePolygons.map((polygon, idx) => (
              <li key={polygon.id} style={{ marginBottom: '0.5rem' }}>
                Exclude Polygon {idx + 1}
                <button
                  type="button"
                  className="btn-danger btn-sm"
                  style={{ marginLeft: '0.75rem' }}
                  onClick={() => onDeleteExcludePolygon(polygon.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ExcludePolygonEditor
