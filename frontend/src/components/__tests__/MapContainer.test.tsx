import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import MapContainer from '../MapContainer'

const mapStub = {
  on: vi.fn(),
  remove: vi.fn(),
}

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
  addMarker: vi.fn(),
  drawPolygon: vi.fn(),
  panTo: vi.fn(),
}))

describe('MapContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

  it('shows a satellite toggle and switches label when clicked', () => {
    render(<MapContainer onPolygonChange={vi.fn()} />)

    const toggle = screen.getByRole('button', { name: /satellite/i })
    fireEvent.click(toggle)

    expect(screen.getByRole('button', { name: /streets/i })).toBeInTheDocument()
  })
})
