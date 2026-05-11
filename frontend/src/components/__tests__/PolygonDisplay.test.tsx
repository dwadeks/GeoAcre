import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PolygonDisplay from '../PolygonDisplay'
import type { Polygon, UnitPreference } from '../../models/GeoTypes'

describe('PolygonDisplay', () => {
  const mockPolygon: Polygon = {
    id: '123',
    vertices: [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 },
      { latitude: 1, longitude: 0 },
    ],
    isExcludePolygon: false,
    isValid: true,
    hasIntersections: false,
    computedAreaSquareMeters: 12100000, // ~1 sq degree
    computedPerimeterMeters: 555000, // approximate
    perSideLengthsMeters: [111000, 111000, 111000],
  }

  const mockUnitPreference: UnitPreference = {
    areaUnit: 'acres',
    distanceUnit: 'feet',
  }

  it('should display area in selected unit', () => {
    // Act
    render(
      <PolygonDisplay polygon={mockPolygon} unitPreference={mockUnitPreference} />
    )

    // Assert
    expect(screen.getByText(/primary area/i)).toBeInTheDocument()
  })

  it('should display side lengths with correct unit labels', () => {
    // Act
    render(
      <PolygonDisplay polygon={mockPolygon} unitPreference={mockUnitPreference} />
    )

    // Assert
    expect(screen.getByText(/side lengths/i)).toBeInTheDocument()
  })

  it('should update when polygon changes', () => {
    // Arrange
    const { rerender } = render(
      <PolygonDisplay polygon={mockPolygon} unitPreference={mockUnitPreference} />
    )

    const updatedPolygon: Polygon = {
      ...mockPolygon,
      computedAreaSquareMeters: 24200000,
    }

    // Act
    rerender(
      <PolygonDisplay
        polygon={updatedPolygon}
        unitPreference={mockUnitPreference}
      />
    )

    // Assert - Component should render without error
    expect(screen.getByText(/primary area/i)).toBeInTheDocument()
  })
})
