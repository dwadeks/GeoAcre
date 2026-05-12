import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor, act } from '@testing-library/react'
import MapContainer from '../MapContainer'
import type { Polygon } from '../../models/GeoTypes'

const mapHandlers: Record<string, ((event?: unknown) => void) | undefined> = {}

const mapDraggingState = {
  enabled: true,
}

const mapStub = {
  on: vi.fn((event: string, handler: (event?: unknown) => void) => {
    mapHandlers[event] = handler
  }),
  off: vi.fn((event: string) => {
    delete mapHandlers[event]
  }),
  remove: vi.fn(),
  dragging: {
    enabled: vi.fn(() => mapDraggingState.enabled),
    disable: vi.fn(() => {
      mapDraggingState.enabled = false
    }),
    enable: vi.fn(() => {
      mapDraggingState.enabled = true
    }),
  },
}

type MarkerStub = {
  on: ReturnType<typeof vi.fn>
  off: ReturnType<typeof vi.fn>
  handlers: Record<string, ((event: unknown) => void) | undefined>
}

const createdMarkers: MarkerStub[] = []

vi.mock('../../services/mapService', () => ({
  initMap: vi.fn(() => ({
    map: mapStub,
    polygons: [],
    markers: [],
    baseLayers: {
      street: { addTo: vi.fn() },
      satellite: { addTo: vi.fn() },
    },
    activeBaseLayer: 'street',
  })),
  setBaseLayer: vi.fn(),
  clearPolygons: vi.fn(),
  clearMarkers: vi.fn(),
  addMarker: vi.fn(() => {
    const handlers: Record<string, ((event: unknown) => void) | undefined> = {}
    const marker: MarkerStub = {
      handlers,
      on: vi.fn((event: string, handler: (event: unknown) => void) => {
        handlers[event] = handler
      }),
      off: vi.fn((event: string) => {
        delete handlers[event]
      }),
    }
    createdMarkers.push(marker)
    return marker
  }),
  drawPolygon: vi.fn(),
  panTo: vi.fn(),
}))

describe('MapContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mapDraggingState.enabled = true
    Object.keys(mapHandlers).forEach((key) => delete mapHandlers[key])
    createdMarkers.length = 0
  })

  it('renders map container div', () => {
    render(<MapContainer onPolygonChange={vi.fn()} />)

    expect(screen.getByTestId('map')).toBeInTheDocument()
  })

  it('renders with onPolygonChange callback', () => {
    const mockOnPolygonChange = vi.fn()

    render(<MapContainer onPolygonChange={mockOnPolygonChange} />)

    expect(screen.getByTestId('map')).toBeInTheDocument()
  })

  it('shows a layers button with satellite and street view options', () => {
    render(<MapContainer onPolygonChange={vi.fn()} />)

    expect(screen.getByTitle('Select map layer')).toBeInTheDocument()
  })

  it('disables map dragging during vertex drag and restores it on mouse up', async () => {
    const polygon: Polygon = {
      id: 'polygon-1',
      isExcludePolygon: false,
      isValid: true,
      hasIntersections: false,
      computedAreaSquareMeters: 0,
      computedPerimeterMeters: 0,
      perSideLengthsMeters: [],
      vertices: [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.7138, longitude: -74.007 },
        { latitude: 40.7148, longitude: -74.008 },
      ],
    }

    render(<MapContainer onPolygonChange={vi.fn()} primaryPolygon={polygon} />)

    await waitFor(() => {
      expect(createdMarkers.length).toBeGreaterThan(0)
      expect(createdMarkers[0].handlers.mousedown).toBeTypeOf('function')
    })

    act(() => {
      createdMarkers[0].handlers.mousedown?.({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      })
    })

    expect(mapStub.dragging.enabled).toHaveBeenCalled()
    expect(mapStub.dragging.disable).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(mapHandlers.mouseup).toBeTypeOf('function')
    })

    act(() => {
      mapHandlers.mouseup?.()
    })

    expect(mapStub.dragging.enable).toHaveBeenCalledTimes(1)
  })
})
