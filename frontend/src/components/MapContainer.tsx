/**
 * MapContainer - Leaflet map component for drawing polygons
 * Handles click events to build vertex arrays and polygon rendering
 */

import { FC, useEffect, useRef, useState } from 'react'
import type { GeoPoint, Polygon } from '../models/GeoTypes'
import * as mapService from '../services/mapService'
import type { BaseLayerMode, MapInstance } from '../services/mapService'
import { v4 as uuidv4 } from 'uuid'
import 'leaflet/dist/leaflet.css'

interface MapContainerProps {
  onPolygonChange?: (polygon: Polygon | undefined) => void
  panToLocation?: GeoPoint | null
}

const MapContainer: FC<MapContainerProps> = ({ onPolygonChange, panToLocation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<MapInstance | null>(null)
  const onPolygonChangeRef = useRef(onPolygonChange)
  const modeRef = useRef<'draw' | 'view'>('draw')
  const [vertices, setVertices] = useState<GeoPoint[]>([])
  const [mode, setMode] = useState<'draw' | 'view'>('draw')
  const [baseLayer, setBaseLayer] = useState<BaseLayerMode>('street')

  useEffect(() => {
    onPolygonChangeRef.current = onPolygonChange
  }, [onPolygonChange])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return

    const instance = mapService.initMap(mapContainerRef.current.id)
    mapInstanceRef.current = instance

    // Add click handler to map for vertex placement
    instance.map.on('click', (e: L.LeafletMouseEvent) => {
      if (modeRef.current !== 'draw') return

      const { lat, lng } = e.latlng
      const newVertex: GeoPoint = { latitude: lat, longitude: lng }

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

  // Draw polygon when vertices change
  useEffect(() => {
    if (!mapInstanceRef.current) return

    mapService.clearPolygons(mapInstanceRef.current)

    if (vertices.length < 3) {
      // Draw vertices as markers while drawing
      vertices.forEach((v, idx) => {
        mapService.addMarker(mapInstanceRef.current!, v.latitude, v.longitude, `Vertex ${idx + 1}`)
      })
      return
    }

    // Draw completed polygon
    mapService.drawPolygon(mapInstanceRef.current, vertices, {
      color: '#3388ff',
      fillColor: '#3388ff',
      fillOpacity: 0.2,
    })

    // Create polygon entity
    const newPolygon: Polygon = {
      id: uuidv4(),
      vertices,
      isExcludePolygon: false,
      isValid: vertices.length >= 3,
      hasIntersections: false,
      computedAreaSquareMeters: 0, // Will be calculated by caller
      computedPerimeterMeters: 0,
      perSideLengthsMeters: [],
    }

    onPolygonChangeRef.current?.(newPolygon)
  }, [vertices])

  const handleClear = () => {
    setVertices([])
    if (mapInstanceRef.current) {
      mapService.clearPolygons(mapInstanceRef.current)
      mapService.clearMarkers(mapInstanceRef.current)
    }
    onPolygonChangeRef.current?.(undefined)
  }

  const handleUndo = () => {
    if (vertices.length > 0) {
      setVertices((prev) => prev.slice(0, -1))
    }
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
        <button
          className="btn-secondary btn-sm"
          onClick={() =>
            setBaseLayer((current) =>
              current === 'street' ? 'satellite' : 'street'
            )
          }
        >
          {baseLayer === 'street' ? '🛰 Satellite' : '🗺 Streets'}
        </button>
        <button className="btn-secondary btn-sm" onClick={handleUndo} disabled={vertices.length === 0}>
          ↶ Undo
        </button>
        <button className="btn-danger btn-sm" onClick={handleClear} disabled={vertices.length === 0}>
          🗑️ Clear
        </button>
        <p style={{ fontSize: '0.875rem', margin: 0, padding: '0.5rem 0', borderTop: '1px solid #eee' }}>
          Vertices: <strong>{vertices.length}</strong>
        </p>
      </div>
    </div>
  )
}

export default MapContainer
