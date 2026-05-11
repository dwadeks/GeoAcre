import { describe, it, expect } from 'vitest'
import {
  calculatePolygonArea,
  calculateSideLengths,
  formatArea,
  formatDistance,
} from '../geometryService'
import type { GeoPoint } from '../../models/GeoTypes'

describe('geometryService', () => {
  describe('calculatePolygonArea', () => {
    it('should return correct acres for sample coordinates', () => {
      // Arrange - Simple square at equator: ~1 degree x 1 degree
      const vertices: GeoPoint[] = [
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 },
        { latitude: 1, longitude: 1 },
        { latitude: 1, longitude: 0 },
      ]

      // Act
      const areaSquareMeters = calculatePolygonArea(vertices)
      const areaAcres = areaSquareMeters / 4046.8564224

      // Assert - 1 degree square at equator is roughly 12,100 sq km = 2,990,000 acres
      expect(areaAcres).toBeGreaterThan(1000000)
      expect(areaAcres).toBeLessThan(5000000)
    })

    it('should return 0 for invalid polygons', () => {
      // Arrange - Fewer than 3 vertices
      const vertices: GeoPoint[] = [
        { latitude: 0, longitude: 0 },
        { latitude: 1, longitude: 1 },
      ]

      // Act
      const area = calculatePolygonArea(vertices)

      // Assert
      expect(area).toBe(0)
    })

    it('should return positive area for Central Park-like coordinates', () => {
      // Arrange - Central Park approximate boundary
      const vertices: GeoPoint[] = [
        { latitude: 40.785091, longitude: -73.981155 },
        { latitude: 40.784669, longitude: -73.951316 },
        { latitude: 40.769921, longitude: -73.947555 },
        { latitude: 40.768582, longitude: -73.981155 },
      ]

      // Act
      const areaSquareMeters = calculatePolygonArea(vertices)

      // Assert - Central Park is 843 acres = ~3.4M sq meters
      expect(areaSquareMeters).toBeGreaterThan(2000000)
      expect(areaSquareMeters).toBeLessThan(5000000)
    })
  })

  describe('calculateSideLengths', () => {
    it('should return array of lengths for valid polygon', () => {
      // Arrange
      const vertices: GeoPoint[] = [
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 },
        { latitude: 1, longitude: 0 },
      ]

      // Act
      const lengths = calculateSideLengths(vertices)

      // Assert
      expect(lengths).toHaveLength(3)
      lengths.forEach((length) => {
        expect(length).toBeGreaterThan(0)
      })
    })

    it('should return empty array for invalid polygon', () => {
      // Arrange
      const vertices: GeoPoint[] = [{ latitude: 0, longitude: 0 }]

      // Act
      const lengths = calculateSideLengths(vertices)

      // Assert
      expect(lengths).toHaveLength(0)
    })
  })

  describe('formatArea', () => {
    it('should convert square meters to acres', () => {
      // Arrange - 1 acre = 4046.8564224 sq meters
      const squareMeters = 4046.8564224

      // Act
      const result = formatArea(squareMeters, 'acres')

      // Assert
      expect(result).toMatch(/^1\.00 acres$/)
    })

    it('should convert square meters to hectares', () => {
      // Arrange - 1 hectare = 10000 sq meters
      const squareMeters = 10000

      // Act
      const result = formatArea(squareMeters, 'hectares')

      // Assert
      expect(result).toMatch(/^1\.00 hectares?$/)
    })

      it('should convert square meters to square feet', () => {
        // Arrange - 1 acre = 43,560 square feet
        const squareMeters = 4046.8564224

        // Act
        const result = formatArea(squareMeters, 'sqft')

        // Assert
        expect(result).toMatch(/^43,560\.00 sq ft$/)
      })

    it('should format square meters', () => {
      // Arrange
      const squareMeters = 5000

      // Act
      const result = formatArea(squareMeters, 'sqm')

      // Assert
      expect(result).toMatch(/^5,000\.00 sq m$/)
    })
  })

  describe('formatDistance', () => {
    it('should convert meters to feet', () => {
      // Arrange - 1 meter = 3.28084 feet
      const meters = 1

      // Act
      const result = formatDistance(meters, 'feet')

      // Assert
      expect(result).toMatch(/^3\.28 ft$/)
    })

    it('should convert meters to miles', () => {
      // Arrange - 1 mile = 1609.344 meters
      const meters = 1609.344

      // Act
      const result = formatDistance(meters, 'miles')

      // Assert
      expect(result).toMatch(/^1\.00 mi$/)
    })

    it('should format meters', () => {
      // Arrange
      const meters = 500

      // Act
      const result = formatDistance(meters, 'meters')

      // Assert
      expect(result).toMatch(/^500\.00 m$/)
    })

    it('should format kilometers', () => {
      // Arrange
      const meters = 5000

      // Act
      const result = formatDistance(meters, 'km')

      // Assert
      expect(result).toMatch(/^5\.00 km$/)
    })
  })
})
