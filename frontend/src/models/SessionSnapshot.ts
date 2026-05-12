import type { GeoPoint } from './GeoPoint'
import type { UnitPreference } from './UnitPreference'

export interface SessionSnapshot {
  schemaVersion: '1.0.0'
  exportedAt: string
  units: UnitPreference
  primaryPolygon?: {
    id: string
    vertices: GeoPoint[]
    areaSquareMeters: number
    perimeterMeters: number
    perSideLengthsMeters: number[]
  }
  excludePolygons: Array<{
    id: string
    vertices: GeoPoint[]
    areaSquareMeters: number
  }>
  measurements: Array<{
    id: string
    vertices: GeoPoint[]
    totalDistanceMeters: number
    perSegmentDistancesMeters: number[]
  }>
}
