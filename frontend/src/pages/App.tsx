import { FC, useCallback, useMemo, useReducer, useState } from 'react'
import type { Polygon, SessionState, UnitPreference } from '../models/GeoTypes'
import MapContainer from '../components/MapContainer'
import PolygonDisplay from '../components/PolygonDisplay'
import UnitSelector from '../components/UnitSelector'
import LocationSearch from '../components/LocationSearch'
import ExcludePolygonEditor from '../components/ExcludePolygonEditor'
import { calculatePolygonArea, calculateSideLengths, calculatePerimeter } from '../services/geometryService'
import { calculateNetArea } from '../services/polygonService'
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
  | { type: 'CLEAR_EXCLUDE_POLYGONS' }
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
    case 'CLEAR_EXCLUDE_POLYGONS':
      return {
        ...state,
        excludePolygons: [],
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
  const [isExcludeMode, setIsExcludeMode] = useState(false)
  const [targetLocation, setTargetLocation] = useReducer(
    (_: { latitude: number; longitude: number } | null, next: { latitude: number; longitude: number } | null) => next,
    null
  )

  const handlePolygonChange = useCallback((polygon: Polygon | undefined) => {
    if (!polygon) {
      dispatch({ type: 'SET_PRIMARY_POLYGON', payload: undefined })
      dispatch({ type: 'CLEAR_EXCLUDE_POLYGONS' })
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

  const handleExcludePolygonComplete = useCallback((polygon: Polygon) => {
    const areaSquareMeters = calculatePolygonArea(polygon.vertices)
    const perSideLengthsMeters = calculateSideLengths(polygon.vertices)
    const perimeter = calculatePerimeter(polygon.vertices)

    const enrichedPolygon: Polygon = {
      ...polygon,
      isExcludePolygon: true,
      computedAreaSquareMeters: areaSquareMeters,
      perSideLengthsMeters,
      computedPerimeterMeters: perimeter,
    }

    dispatch({ type: 'ADD_EXCLUDE_POLYGON', payload: enrichedPolygon })
  }, [])

  const handleDeleteExcludePolygon = useCallback((polygonId: string) => {
    dispatch({ type: 'REMOVE_EXCLUDE_POLYGON', payload: polygonId })
  }, [])

  const handleToggleExcludeMode = useCallback(() => {
    setIsExcludeMode((prev) => !prev)
  }, [])

  const handleUnitPreferenceChange = useCallback((unitPreference: UnitPreference) => {
    dispatch({ type: 'UPDATE_UNIT_PREFERENCE', payload: unitPreference })
  }, [])

  const handleClearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' })
    setIsExcludeMode(false)
  }, [])

  const handleLocationSelect = useCallback((latitude: number, longitude: number) => {
    setTargetLocation({ latitude, longitude })
  }, [])

  const netAreaSquareMeters = useMemo(() => {
    if (!state.primaryPolygon) return 0
    return calculateNetArea(
      state.primaryPolygon.vertices,
      state.excludePolygons.map((p) => p.vertices)
    )
  }, [state.primaryPolygon, state.excludePolygons])

  return (
    <div className="app">
      <header>
        <h1>🗺️ Land Area Estimator</h1>
      </header>
      <main>
        {/* Map container */}
        <MapContainer
          onPolygonChange={handlePolygonChange}
          onExcludePolygonComplete={handleExcludePolygonComplete}
          primaryPolygon={state.primaryPolygon}
          excludePolygons={state.excludePolygons}
          drawTarget={isExcludeMode ? 'exclude' : 'primary'}
          panToLocation={targetLocation}
        />

        {/* Control panel */}
        <div className="control-panel">
          <section>
            <h3>Measurement</h3>
            <p className="text-muted">
              {state.primaryPolygon
                ? `✓ Polygon with ${state.primaryPolygon.vertices.length} vertices (${state.excludePolygons.length} exclude polygons)`
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

          <LocationSearch onLocationSelect={handleLocationSelect} />

          <ExcludePolygonEditor
            isExcludeMode={isExcludeMode}
            onToggleExcludeMode={handleToggleExcludeMode}
            excludePolygons={state.excludePolygons}
            onDeleteExcludePolygon={handleDeleteExcludePolygon}
            primaryAreaSquareMeters={state.primaryPolygon?.computedAreaSquareMeters ?? 0}
            netAreaSquareMeters={netAreaSquareMeters}
            unitPreference={state.unitPreference}
          />

          {/* Polygon Display */}
          <section>
            <h3>Results</h3>
            <PolygonDisplay
              polygon={state.primaryPolygon}
              unitPreference={state.unitPreference}
              excludedAreaSquareMeters={Math.max(
                0,
                (state.primaryPolygon?.computedAreaSquareMeters ?? 0) - netAreaSquareMeters
              )}
              netAreaSquareMeters={netAreaSquareMeters}
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

