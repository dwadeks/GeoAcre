import type { GeoPoint } from './GeoPoint'

export interface Measurement {
  id: string
  vertices: GeoPoint[]
  isValid: boolean
  totalDistanceMeters: number
  perSegmentDistancesMeters: number[]
}
