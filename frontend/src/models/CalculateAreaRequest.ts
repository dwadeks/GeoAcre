import type { GeoPoint } from './GeoPoint'

export interface CalculateAreaRequest {
  vertices: GeoPoint[]
  excludePolygons?: GeoPoint[][]
}
