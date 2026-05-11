import { FC, useCallback, useMemo, useReducer, useState } from 'react'
import type { GeoPoint, Polygon, SessionState, UnitPreference, Measurement } from '../models/GeoTypes'
import MapContainer from '../components/MapContainer'
import PolygonDisplay from '../components/PolygonDisplay'
import SettingsPanel from '../components/SettingsPanel'
import LocationSearch from '../components/LocationSearch'
import ExcludePolygonEditor from '../components/ExcludePolygonEditor'
import MeasurementTool from '../components/MeasurementTool'
import ExportButton from '../components/ExportButton'
import ConfirmationDialog from '../components/ConfirmationDialog'
import ErrorNotification from '../components/ErrorNotification'
import { calculatePolygonArea, calculateSideLengths, calculatePerimeter } from '../services/geometryService'
import { calculateNetArea } from '../services/polygonService'
import { calculatePolylineDistance, calculateSegmentDistances } from '../services/measurementService'
import '../styles/globals.css'

/**
 * Root application component
 * Integrates map container, polygon display, and unit selector
 */

const initialState: SessionState = {
  primaryPolygon: undefined,
  excludePolygons: [],
  unitPreference: (() => {
    try {
      const raw = localStorage.getItem('geoacre.unitPreference')
      if (raw) {
        const parsed = JSON.parse(raw) as UnitPreference
        if (parsed.areaUnit && parsed.distanceUnit) {
          return parsed
        }
      }
    } catch {
      // no-op: fallback to defaults
    }

    return {
      areaUnit: 'acres',
      distanceUnit: 'feet',
    }
  })(),
}

type SessionAction =
  | { type: 'SET_PRIMARY_POLYGON'; payload: Polygon | undefined }
  | { type: 'ADD_EXCLUDE_POLYGON'; payload: Polygon }
  | { type: 'REMOVE_EXCLUDE_POLYGON'; payload: string }
  | { type: 'CLEAR_EXCLUDE_POLYGONS' }
  | { type: 'UPDATE_UNIT_PREFERENCE'; payload: UnitPreference }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_MEASUREMENT'; payload: Measurement | undefined }

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
    case 'SET_MEASUREMENT':
      return {
        ...state,
        measurement: action.payload,
      }
    default:
      return state
  }
}

const App: FC = () => {
  const [state, dispatch] = useReducer(sessionReducer, initialState)
  const [isExcludeMode, setIsExcludeMode] = useState(false)
  const [isMeasurementMode, setIsMeasurementMode] = useState(false)
  const [showModeConfirm, setShowModeConfirm] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [appError, setAppError] = useState<string>('')
  const [measurementPoints, setMeasurementPoints] = useState<GeoPoint[]>([])
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
    localStorage.setItem('geoacre.unitPreference', JSON.stringify(unitPreference))
    dispatch({ type: 'UPDATE_UNIT_PREFERENCE', payload: unitPreference })
  }, [])

  const handleClearAll = useCallback(() => {
    if (state.primaryPolygon || state.excludePolygons.length > 0 || measurementPoints.length > 0) {
      setShowDiscardConfirm(true)
      return
    }

    dispatch({ type: 'CLEAR_ALL' })
    setIsExcludeMode(false)
  }, [state.primaryPolygon, state.excludePolygons.length, measurementPoints.length])

  const handleConfirmDiscard = useCallback(() => {
    setShowDiscardConfirm(false)
    dispatch({ type: 'CLEAR_ALL' })
    setIsExcludeMode(false)
    setMeasurementPoints([])
  }, [])

  const handleLocationSelect = useCallback((latitude: number, longitude: number) => {
    setTargetLocation({ latitude, longitude })
  }, [])

  const handleToggleMeasurementMode = useCallback(() => {
    const hasInProgressWork = Boolean(state.primaryPolygon) || measurementPoints.length > 0

    if (hasInProgressWork) {
      setShowModeConfirm(true)
      return
    }

    setAppError('')
    setIsMeasurementMode((prev) => {
      const next = !prev
      if (!next) {
        setMeasurementPoints([])
        dispatch({ type: 'SET_MEASUREMENT', payload: undefined })
      }
      return next
    })
  }, [state.primaryPolygon, measurementPoints.length])

  const handleConfirmModeSwitch = useCallback(() => {
    setShowModeConfirm(false)
    setIsMeasurementMode((prev) => !prev)
  }, [])

  const handleMeasurementPointsChange = useCallback((vertices: GeoPoint[]) => {
    setMeasurementPoints(vertices)
    
    if (vertices.length >= 2) {
      const totalDistance = calculatePolylineDistance(vertices)
      const segmentDistances = calculateSegmentDistances(vertices)
      
      const measurement: Measurement = {
        id: `measurement-${Date.now()}`,
        vertices,
        isValid: vertices.length >= 2,
        totalDistanceMeters: totalDistance,
        perSegmentDistancesMeters: segmentDistances,
      }
      
      dispatch({ type: 'SET_MEASUREMENT', payload: measurement })
    } else {
      dispatch({ type: 'SET_MEASUREMENT', payload: undefined })
    }
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
      {appError ? <ErrorNotification message={appError} onDismiss={() => setAppError('')} /> : null}

      <ConfirmationDialog
        open={showModeConfirm}
        title="Switch Measurement Mode?"
        message="You have an unfinished or existing shape. Discard it and switch modes?"
        confirmText="Discard and Switch"
        cancelText="Keep Editing"
        onConfirm={handleConfirmModeSwitch}
        onCancel={() => setShowModeConfirm(false)}
      />

      <ConfirmationDialog
        open={showDiscardConfirm}
        title="Discard Existing Shape?"
        message="You have an existing shape. Discard it?"
        confirmText="Discard"
        cancelText="Cancel"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setShowDiscardConfirm(false)}
      />

      <header>
        <h1>🗺️ Land Area Estimator</h1>
      </header>
      <main>
        {/* Map container */}
        <MapContainer
          onPolygonChange={handlePolygonChange}
          onExcludePolygonComplete={handleExcludePolygonComplete}
          onMeasurementPointsChange={handleMeasurementPointsChange}
          primaryPolygon={state.primaryPolygon}
          excludePolygons={state.excludePolygons}
          measurementPoints={measurementPoints}
          interactionMode={isMeasurementMode ? 'measurement' : 'polygon'}
          drawTarget={isExcludeMode ? 'exclude' : 'primary'}
          panToLocation={targetLocation}
        />

        {/* Control panel */}
        <div className="control-panel">
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>Measurement</h3>
              <SettingsPanel
                unitPreference={state.unitPreference}
                onUnitPreferenceChange={handleUnitPreferenceChange}
              />
            </div>
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

          <section style={{ marginBottom: '1.5rem' }}>
            <LocationSearch onLocationSelect={handleLocationSelect} />
          </section>

          <ExcludePolygonEditor
            isExcludeMode={isExcludeMode}
            onToggleExcludeMode={handleToggleExcludeMode}
            excludePolygons={state.excludePolygons}
            onDeleteExcludePolygon={handleDeleteExcludePolygon}
            primaryAreaSquareMeters={state.primaryPolygon?.computedAreaSquareMeters ?? 0}
            netAreaSquareMeters={netAreaSquareMeters}
            unitPreference={state.unitPreference}
          />

          {/* Distance Measurement Tool */}
          <section style={{ marginBottom: '1.5rem' }}>
            <MeasurementTool
              isActive={isMeasurementMode}
              onToggle={handleToggleMeasurementMode}
              onMeasurementChange={handleMeasurementPointsChange}
              measurementPoints={measurementPoints}
              totalDistance={state.measurement?.totalDistanceMeters ?? 0}
              segmentDistances={state.measurement?.perSegmentDistancesMeters ?? []}
              distanceUnit={state.unitPreference.distanceUnit}
            />
          </section>

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
          <ExportButton session={state} />

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

