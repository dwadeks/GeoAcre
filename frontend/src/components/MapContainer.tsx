/**
 * MapContainer - Leaflet map component for drawing polygons
 * Handles click events to build vertex arrays and polygon rendering
 */

import { FC, useEffect, useRef, useState } from 'react'
import type { GeoPoint, Polygon } from '../models/GeoTypes'
import * as mapService from '../services/mapService'
import type { BaseLayerMode, MapInstance } from '../services/mapService'
import * as dragService from '../services/dragService'
import type { DragState } from '../services/dragService'
import { detectSelfIntersections } from '../services/geometryService'
import SelfIntersectionWarning from './SelfIntersectionWarning'
import L from 'leaflet'
import { v4 as uuidv4 } from 'uuid'
import 'leaflet/dist/leaflet.css'

interface MapContainerProps {
  onPolygonChange?: (polygon: Polygon | undefined) => void
  onExcludePolygonComplete?: (polygon: Polygon) => void
  onMeasurementPointsChange?: (points: GeoPoint[]) => void
  primaryPolygon?: Polygon
  excludePolygons?: Polygon[]
  measurementPoints?: GeoPoint[]
  interactionMode?: 'polygon' | 'measurement'
  drawTarget?: 'primary' | 'exclude'
  panToLocation?: GeoPoint | null
}

const MapContainer: FC<MapContainerProps> = ({
  onPolygonChange,
  onExcludePolygonComplete,
  onMeasurementPointsChange,
  primaryPolygon,
  excludePolygons = [],
  measurementPoints = [],
  interactionMode = 'polygon',
  drawTarget = 'primary',
  panToLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<MapInstance | null>(null)
  const onPolygonChangeRef = useRef(onPolygonChange)
  const onExcludePolygonCompleteRef = useRef(onExcludePolygonComplete)
  const onMeasurementPointsChangeRef = useRef(onMeasurementPointsChange)
  const measurementPointsRef = useRef<GeoPoint[]>(measurementPoints)
  const interactionModeRef = useRef<'polygon' | 'measurement'>(interactionMode)
  const drawTargetRef = useRef<'primary' | 'exclude'>(drawTarget)
  const modeRef = useRef<'draw' | 'view'>('draw')
  const [vertices, setVertices] = useState<GeoPoint[]>([])
  const [mode, setMode] = useState<'draw' | 'view'>('draw')
  const [baseLayer, setBaseLayer] = useState<BaseLayerMode>('street')
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [isLayersOpen, setIsLayersOpen] = useState(false)
  const [hasCurrentIntersections, setHasCurrentIntersections] = useState(false)
  const markersRef = useRef<L.Marker[]>([])
  const dragJustEndedRef = useRef(false)
  const dragSourceRef = useRef<'inprogress' | 'primary' | null>(null)
  const mapDragWasEnabledRef = useRef(false)

  const disableMapDraggingForVertexDrag = () => {
    const map = mapInstanceRef.current?.map
    if (!map) return

    mapDragWasEnabledRef.current = map.dragging.enabled()
    if (mapDragWasEnabledRef.current) {
      map.dragging.disable()
    }
  }

  const restoreMapDraggingAfterVertexDrag = () => {
    const map = mapInstanceRef.current?.map
    if (!map) return

    if (mapDragWasEnabledRef.current) {
      map.dragging.enable()
    }
    mapDragWasEnabledRef.current = false
  }

  useEffect(() => {
    onPolygonChangeRef.current = onPolygonChange
  }, [onPolygonChange])

  useEffect(() => {
    onExcludePolygonCompleteRef.current = onExcludePolygonComplete
  }, [onExcludePolygonComplete])

  useEffect(() => {
    onMeasurementPointsChangeRef.current = onMeasurementPointsChange
  }, [onMeasurementPointsChange])

  useEffect(() => {
    measurementPointsRef.current = measurementPoints
  }, [measurementPoints])

  useEffect(() => {
    interactionModeRef.current = interactionMode
  }, [interactionMode])

  useEffect(() => {
    drawTargetRef.current = drawTarget
  }, [drawTarget])

  useEffect(() => {
    setVertices([])
  }, [drawTarget])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return

    const instance = mapService.initMap(mapContainerRef.current.id)
    mapInstanceRef.current = instance

    // Add click handler to map for vertex placement
    instance.map.on('click', (e: L.LeafletMouseEvent) => {
      if (modeRef.current !== 'draw') return
      if (dragJustEndedRef.current) return

      const { lat, lng } = e.latlng
      const newVertex: GeoPoint = { latitude: lat, longitude: lng }

      if (interactionModeRef.current === 'measurement') {
        const nextPoints = [...measurementPointsRef.current, newVertex]
        onMeasurementPointsChangeRef.current?.(nextPoints)
        return
      }

      setVertices((prev) => [...prev, newVertex])
    })

    return () => {
      instance.map.remove()
    }
  }, [])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    mapService.setBaseLayer(mapInstanceRef.current, baseLayer)
  }, [baseLayer])

  useEffect(() => {
    if (!mapInstanceRef.current || !panToLocation) return

    mapService.panTo(
      mapInstanceRef.current,
      panToLocation.latitude,
      panToLocation.longitude,
      16
    )
  }, [panToLocation])

  // Handle vertex dragging
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      if (!dragState || mode !== 'draw') return

      // Prevent Leaflet map drag behavior while dragging a vertex marker.
      L.DomEvent.stop(e)

      const { lat, lng } = e.latlng
      const updatedVertices = dragService.updateVertexPosition(dragState, {
        latitude: lat,
        longitude: lng,
      })

      setVertices(updatedVertices)
    }

    const handleTouchMove = (e: any) => {
      if (!dragState || mode !== 'draw') return
      const touch = e?.latlng
      if (!touch) return

      const updatedVertices = dragService.updateVertexPosition(dragState, {
        latitude: touch.lat,
        longitude: touch.lng,
      })

      setVertices(updatedVertices)
    }

    const handleMouseUp = () => {
      if (!dragState) return
      dragService.endDrag(dragState)
      setDragState(null)

      if (dragSourceRef.current === 'primary' && primaryPolygon) {
        onPolygonChangeRef.current?.({
          ...primaryPolygon,
          vertices: dragState.currentVertices,
        })
      }

      dragSourceRef.current = null
      restoreMapDraggingAfterVertexDrag()

      // Mark that drag just ended to prevent click from placing vertex
      dragJustEndedRef.current = true
      setTimeout(() => {
        dragJustEndedRef.current = false
      }, 50)
    }

    mapInstanceRef.current.map.on('mousemove', handleMouseMove)
    mapInstanceRef.current.map.on('mouseup', handleMouseUp)
    mapInstanceRef.current.map.on('touchmove', handleTouchMove)
    mapInstanceRef.current.map.on('touchend', handleMouseUp)

    return () => {
      if (mapInstanceRef.current?.map?.off) {
        mapInstanceRef.current.map.off('mousemove', handleMouseMove)
        mapInstanceRef.current.map.off('mouseup', handleMouseUp)
        mapInstanceRef.current.map.off('touchmove', handleTouchMove)
        mapInstanceRef.current.map.off('touchend', handleMouseUp)
      }

      // Safety net in case the effect is torn down while dragging.
      restoreMapDraggingAfterVertexDrag()
    }
  }, [dragState, mode, primaryPolygon])

  // Draw persisted polygons and the in-progress polygon when inputs change.
  useEffect(() => {
    if (!mapInstanceRef.current) return

    mapService.clearPolygons(mapInstanceRef.current)
    mapService.clearMarkers(mapInstanceRef.current)
    markersRef.current = []

    if (interactionMode === 'measurement') {
      if (measurementPoints.length > 0) {
        measurementPoints.forEach((v, idx) => {
          mapService.addMarker(
            mapInstanceRef.current!,
            v.latitude,
            v.longitude,
            `Point ${idx + 1}`
          )
        })
      }

      if (measurementPoints.length >= 2) {
        mapService.drawPolyline(mapInstanceRef.current, measurementPoints, {
          color: '#dc2626',
          weight: 3,
          opacity: 0.9,
          dashArray: '6, 4',
        })
      }

      return
    }

    if (primaryPolygon && primaryPolygon.vertices.length >= 3) {
      mapService.drawPolygon(mapInstanceRef.current, primaryPolygon.vertices, {
        color: '#3388ff',
        fillColor: '#3388ff',
        fillOpacity: 0.15,
      })

      if (mode === 'draw') {
        primaryPolygon.vertices.forEach((v, idx) => {
          const marker = mapService.addMarker(
            mapInstanceRef.current!,
            v.latitude,
            v.longitude,
            `Vertex ${idx + 1}`
          )
          const startDrag = (e: any) => {
            L.DomEvent.stop(e)
            dragSourceRef.current = 'primary'
            disableMapDraggingForVertexDrag()
            setDragState(dragService.startDrag(idx, primaryPolygon.vertices))
          }
          marker.on('mousedown', startDrag)
          marker.on('touchstart', startDrag)
          markersRef.current.push(marker)
        })
      }
    }

    excludePolygons.forEach((exclude) => {
      if (exclude.vertices.length < 3) return

      mapService.drawPolygon(mapInstanceRef.current!, exclude.vertices, {
        color: '#d97706',
        fillColor: '#f59e0b',
        fillOpacity: 0.25,
      })
    })

    if (mode !== 'draw') {
      return
    }

    if (vertices.length > 0) {
      // Draw vertices as markers while drawing and store references.
      vertices.forEach((v, idx) => {
        const marker = mapService.addMarker(
          mapInstanceRef.current!,
          v.latitude,
          v.longitude,
          `Vertex ${idx + 1}`
        )
        const startDrag = (e: any) => {
          L.DomEvent.stop(e)
          dragSourceRef.current = 'inprogress'
          disableMapDraggingForVertexDrag()
          setDragState(dragService.startDrag(idx, vertices))
        }
        marker.on('mousedown', startDrag)
        marker.on('touchstart', startDrag)
        markersRef.current.push(marker)
      })
    }

    if (vertices.length < 3) {
      setHasCurrentIntersections(false)
      return
    }

    const intersects = detectSelfIntersections(vertices)
    setHasCurrentIntersections(intersects)

    const isExcludeTarget = drawTargetRef.current === 'exclude'
    mapService.drawPolygon(mapInstanceRef.current, vertices, {
      color: isExcludeTarget ? '#d97706' : '#3388ff',
      fillColor: isExcludeTarget ? '#f59e0b' : '#3388ff',
      fillOpacity: 0.2,
      dashArray: isExcludeTarget ? '6, 4' : undefined,
    })

    if (!isExcludeTarget) {
      const newPolygon: Polygon = {
        id: uuidv4(),
        vertices,
        isExcludePolygon: false,
        isValid: vertices.length >= 3,
        hasIntersections: intersects,
        computedAreaSquareMeters: 0,
        computedPerimeterMeters: 0,
        perSideLengthsMeters: [],
      }

      onPolygonChangeRef.current?.(newPolygon)
    }
  }, [vertices, mode, primaryPolygon, excludePolygons, interactionMode, measurementPoints])

  const handleClear = () => {
    if (interactionMode === 'measurement') {
      onMeasurementPointsChangeRef.current?.([])
      return
    }

    setVertices([])
    if (drawTargetRef.current === 'primary') {
      onPolygonChangeRef.current?.(undefined)
    }
  }

  const handleUndo = () => {
    if (interactionMode === 'measurement') {
      const nextPoints = measurementPoints.slice(0, -1)
      onMeasurementPointsChangeRef.current?.(nextPoints)
      return
    }

    if (vertices.length > 0) {
      setVertices((prev) => prev.slice(0, -1))
    }
  }

  const handleCompleteShape = () => {
    if (vertices.length < 3) return

    const isExcludeTarget = drawTargetRef.current === 'exclude'
    const newPolygon: Polygon = {
      id: uuidv4(),
      vertices,
      isExcludePolygon: isExcludeTarget,
      isValid: true,
      hasIntersections: detectSelfIntersections(vertices),
      computedAreaSquareMeters: 0,
      computedPerimeterMeters: 0,
      perSideLengthsMeters: [],
    }

    if (isExcludeTarget) {
      onExcludePolygonCompleteRef.current?.(newPolygon)
    } else {
      onPolygonChangeRef.current?.(newPolygon)
    }

    setVertices([])
  }

  return (
    <div className={`map-container ${mode === 'draw' ? 'drawing-mode' : 'view-mode'}`}>
      <div
        ref={mapContainerRef}
        id="map"
        data-testid="map"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
        }}
      />

      {hasCurrentIntersections ? (
        <div style={{ position: 'absolute', left: '1rem', top: '1rem', zIndex: 1200, maxWidth: '520px' }}>
          <SelfIntersectionWarning message="Current polygon self-intersects. Continue editing or move vertices to resolve overlaps." />
        </div>
      ) : null}

      {/* Map controls overlay */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: 'white',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          padding: '0.75rem',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <button
          className="btn-primary btn-sm"
          onClick={() => setMode(mode === 'draw' ? 'view' : 'draw')}
        >
          {mode === 'draw' ? '✓ Drawing' : '👁️ View'}
        </button>
        <p style={{ fontSize: '0.8rem', margin: 0 }}>
          Target: <strong>{interactionMode === 'measurement' ? 'Distance Measurement' : (drawTarget === 'exclude' ? 'Exclude Polygon' : 'Primary Polygon')}</strong>
        </p>
        <button
          className="btn-success btn-sm"
          onClick={handleCompleteShape}
          disabled={interactionMode === 'measurement' || vertices.length < 3 || mode !== 'draw'}
        >
          ✓ Complete Shape
        </button>
        <button className="btn-secondary btn-sm" onClick={handleUndo} disabled={vertices.length === 0}>
          ↶ Undo
        </button>
        <button className="btn-danger btn-sm" onClick={handleClear} disabled={vertices.length === 0}>
          🗑️ Clear
        </button>
        <p style={{ fontSize: '0.875rem', margin: 0, padding: '0.5rem 0', borderTop: '1px solid #eee' }}>
          {interactionMode === 'measurement' ? 'Points' : 'Vertices'}: <strong>{interactionMode === 'measurement' ? measurementPoints.length : vertices.length}</strong>
        </p>
      </div>

      {/* Layer selector — bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '0.625rem',
          zIndex: 1000,
        }}
      >
        {/* Layers button (always visible) */}
        <button
          onClick={() => setIsLayersOpen((prev) => !prev)}
          title="Select map layer"
          style={{
            width: '42px',
            height: '36px',
            padding: '0.4rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            background: 'white',
            color: '#333',
            boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
        >
          �
        </button>

        {/* Expanded layers panel */}
        {isLayersOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              marginBottom: '0.5rem',
              background: 'white',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              padding: '0.75rem',
              minWidth: '160px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {/* Street view option */}
            <button
              onClick={() => {
                setBaseLayer('street')
                setIsLayersOpen(false)
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem',
                border: baseLayer === 'street' ? '2px solid #3498db' : '2px solid #ddd',
                borderRadius: '4px',
                background: baseLayer === 'street' ? '#e8f4f8' : 'white',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (baseLayer !== 'street') {
                  e.currentTarget.style.borderColor = '#bbb'
                  e.currentTarget.style.background = '#f9f9f9'
                }
              }}
              onMouseLeave={(e) => {
                if (baseLayer !== 'street') {
                  e.currentTarget.style.borderColor = '#ddd'
                  e.currentTarget.style.background = 'white'
                }
              }}
            >
              {/* Street preview */}
              <div
                style={{
                  width: '100px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #f0e68c 0%, #f5f5dc 50%, #daa520 100%)',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                🗺️
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#333' }}>Streets</span>
            </button>

            {/* Satellite view option */}
            <button
              onClick={() => {
                setBaseLayer('satellite')
                setIsLayersOpen(false)
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem',
                border: baseLayer === 'satellite' ? '2px solid #3498db' : '2px solid #ddd',
                borderRadius: '4px',
                background: baseLayer === 'satellite' ? '#e8f4f8' : 'white',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (baseLayer !== 'satellite') {
                  e.currentTarget.style.borderColor = '#bbb'
                  e.currentTarget.style.background = '#f9f9f9'
                }
              }}
              onMouseLeave={(e) => {
                if (baseLayer !== 'satellite') {
                  e.currentTarget.style.borderColor = '#ddd'
                  e.currentTarget.style.background = 'white'
                }
              }}
            >
              {/* Satellite preview */}
              <div
                style={{
                  width: '100px',
                  height: '60px',
                  background: 'radial-gradient(circle at 20% 30%, #4fb3d9 0%, #2c5aa0 40%, #1a3a5c 100%)',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                🛰️
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#333' }}>Satellite</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapContainer
