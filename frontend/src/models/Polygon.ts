import type { GeoPoint } from './GeoPoint'

export interface Polygon {
  id: string
  vertices: GeoPoint[]
  isExcludePolygon: boolean
  parentPolygonId?: string
  isValid: boolean
  hasIntersections: boolean
  computedAreaSquareMeters: number
  computedPerimeterMeters: number
  perSideLengthsMeters: number[]
}
