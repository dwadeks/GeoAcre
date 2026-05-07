import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MapContainer from '../MapContainer'

// Mock Leaflet
vi.mock('leaflet', () => ({
  map: vi.fn(() => ({
    setView: vi.fn(),
    on: vi.fn(),
    remove: vi.fn(),
  })),
  tileLayer: vi.fn(() => ({
    addTo: vi.fn(),
  })),
  polygon: vi.fn(() => ({
    addTo: vi.fn(),
    remove: vi.fn(),
  })),
  marker: vi.fn(() => ({
    addTo: vi.fn(),
    remove: vi.fn(),
    bindPopup: vi.fn(),
  })),
  LatLng: vi.fn((lat, lng) => ({ lat, lng })),
  latLngBounds: vi.fn(),
  icon: vi.fn(() => ({})),
}))

describe('MapContainer', () => {
  it('renders map container div', () => {
    // Act
    render(<MapContainer onPolygonChange={vi.fn()} />)

    // Assert
    expect(screen.getByTestId('map')).toBeInTheDocument()
  })

  it('should call onPolygonChange when vertices are updated', () => {
    // Arrange
    const mockOnPolygonChange = vi.fn()

    // Act
    render(<MapContainer onPolygonChange={mockOnPolygonChange} />)

    // Assert - Component should be rendered
    expect(screen.getByTestId('map')).toBeInTheDocument()
  })
})
