import { FC, useCallback, useReducer } from 'react'
import type { Polygon, SessionState, UnitPreference } from '../models/GeoTypes'
import MapContainer from '../components/MapContainer'
import PolygonDisplay from '../components/PolygonDisplay'
import UnitSelector from '../components/UnitSelector'
import { calculatePolygonArea, calculateSideLengths, calculatePerimeter } from '../services/geometryService'
import '../styles/globals.css'

/**
 * Root application component
 * Integrates map container, polygon display, and unit selector
 */

const initialState: SessionState = {
  primaryPolygon: undefined,
  excludePolygons: [],
  unitPreference: {
    areaUnit: 'acres',
    distanceUnit: 'feet',
  },
}

type SessionAction =
  | { type: 'SET_PRIMARY_POLYGON'; payload: Polygon | undefined }
  | { type: 'ADD_EXCLUDE_POLYGON'; payload: Polygon }
  | { type: 'REMOVE_EXCLUDE_POLYGON'; payload: string }
  | { type: 'UPDATE_UNIT_PREFERENCE'; payload: UnitPreference }
  | { type: 'CLEAR_ALL' }

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_PRIMARY_POLYGON':
      return {
        ...state,
        primaryPolygon: action.payload,
      }
    case 'ADD_EXCLUDE_POLYGON':
      return {
        ...state,
        excludePolygons: [...state.excludePolygons, action.payload],
      }
    case 'REMOVE_EXCLUDE_POLYGON':
      return {
        ...state,
        excludePolygons: state.excludePolygons.filter((p) => p.id !== action.payload),
      }
    case 'UPDATE_UNIT_PREFERENCE':
      return {
        ...state,
        unitPreference: action.payload,
      }
    case 'CLEAR_ALL':
      return initialState
    default:
      return state
  }
}

const App: FC = () => {
  const [state, dispatch] = useReducer(sessionReducer, initialState)

  const handlePolygonChange = useCallback((polygon: Polygon | undefined) => {
    if (!polygon) {
      dispatch({ type: 'SET_PRIMARY_POLYGON', payload: undefined })
      return
    }

    // Calculate area and side lengths
    const areaSquareMeters = calculatePolygonArea(polygon.vertices)
    const perSideLengthsMeters = calculateSideLengths(polygon.vertices)
    const perimeter = calculatePerimeter(polygon.vertices)

    const enrichedPolygon: Polygon = {
      ...polygon,
      computedAreaSquareMeters: areaSquareMeters,
      perSideLengthsMeters,
      computedPerimeterMeters: perimeter,
    }

    dispatch({ type: 'SET_PRIMARY_POLYGON', payload: enrichedPolygon })
  }, [])

  const handleUnitPreferenceChange = useCallback((unitPreference: UnitPreference) => {
    dispatch({ type: 'UPDATE_UNIT_PREFERENCE', payload: unitPreference })
  }, [])

  const handleClearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' })
  }, [])

  return (
    <div className="app">
      <header>
        <h1>🗺️ Land Area Estimator</h1>
      </header>
      <main>
        {/* Map container */}
        <MapContainer onPolygonChange={handlePolygonChange} />

        {/* Control panel */}
        <div className="control-panel">
          <section>
            <h3>Measurement</h3>
            <p className="text-muted">
              {state.primaryPolygon
                ? `✓ Polygon with ${state.primaryPolygon.vertices.length} vertices`
                : 'Click map to draw a polygon (≥3 points)'}
            </p>
            {state.primaryPolygon && (
              <button className="btn-danger btn-sm btn-block" onClick={handleClearAll}>
                🗑️ Clear Polygon
              </button>
            )}
          </section>

          {/* Unit Selector */}
          <UnitSelector
            unitPreference={state.unitPreference}
            onUnitPreferenceChange={handleUnitPreferenceChange}
          />

          {/* Polygon Display */}
          <section>
            <h3>Results</h3>
            <PolygonDisplay
              polygon={state.primaryPolygon}
              unitPreference={state.unitPreference}
            />
          </section>

          {/* Info Section */}
          <section>
            <h3>About</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
              <strong>Phase 1 MVP</strong> - Draw polygons on the map to measure area in acres and view side
              lengths in feet. All measurements use geodetic (spherical) calculations for accuracy.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App

