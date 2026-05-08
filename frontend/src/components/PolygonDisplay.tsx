/**
 * PolygonDisplay - Displays polygon area and side lengths
 */

import { FC, useMemo } from 'react'
import type { Polygon, UnitPreference } from '../models/GeoTypes'
import { formatArea, formatDistance } from '../services/geometryService'

interface PolygonDisplayProps {
  polygon?: Polygon
  unitPreference: UnitPreference
  excludedAreaSquareMeters?: number
  netAreaSquareMeters?: number
}

const PolygonDisplay: FC<PolygonDisplayProps> = ({
  polygon,
  unitPreference,
  excludedAreaSquareMeters = 0,
  netAreaSquareMeters,
}) => {
  const formattedArea = useMemo(
    () => (polygon ? formatArea(polygon.computedAreaSquareMeters, unitPreference.areaUnit) : null),
    [polygon, unitPreference.areaUnit]
  )

  const formattedPerimeter = useMemo(
    () => (polygon ? formatDistance(polygon.computedPerimeterMeters, unitPreference.distanceUnit) : null),
    [polygon, unitPreference.distanceUnit]
  )

  const formattedExcludedArea = useMemo(
    () => formatArea(excludedAreaSquareMeters, unitPreference.areaUnit),
    [excludedAreaSquareMeters, unitPreference.areaUnit]
  )

  const effectiveNetArea = netAreaSquareMeters ?? polygon?.computedAreaSquareMeters ?? 0
  const formattedNetArea = useMemo(
    () => formatArea(effectiveNetArea, unitPreference.areaUnit),
    [effectiveNetArea, unitPreference.areaUnit]
  )

  const formattedSideLengths = useMemo(
    () =>
      polygon
        ? polygon.perSideLengthsMeters.map((len) => formatDistance(len, unitPreference.distanceUnit))
        : [],
    [polygon, unitPreference.distanceUnit]
  )

  if (!polygon) {
    return (
      <div className="card">
        <p className="text-muted">No polygon drawn yet. Draw a polygon on the map to see measurements.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">Polygon Measurements</div>

      <div className="card-body">
        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
          <strong>⚠️ Note:</strong> Measurements are calculated using spherical geometry (geodetic calculations).
          {polygon.hasIntersections && (
            <div style={{ marginTop: '0.5rem' }}>
              ⚠️ This polygon has self-intersections. Area uses even-odd rule.
            </div>
          )}
        </div>

        {/* Area Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Primary Area</h4>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0.25rem 0' }}>{formattedArea}</p>
          <p className="text-muted" style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}>
            ({formatArea(polygon.computedAreaSquareMeters, 'sqm')})
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            Excluded Area: <strong>{formattedExcludedArea}</strong>
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            Net Area: <strong>{formattedNetArea}</strong>
          </p>
        </div>

        {/* Perimeter Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Perimeter</h4>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0.25rem 0' }}>{formattedPerimeter}</p>
        </div>

        {/* Side Lengths Section */}
        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>Side Lengths ({polygon.perSideLengthsMeters.length})</h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {formattedSideLengths.map((length, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>
                Side {idx + 1}: <strong>{length}</strong>
              </li>
            ))}
          </ul>
        </div>

        {/* Vertices Info */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
          <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>
            Vertices: {polygon.vertices.length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PolygonDisplay
