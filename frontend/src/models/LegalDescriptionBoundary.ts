import type { GeoPoint } from './GeoPoint'

export interface LegalDescriptionBoundary {
  provenance: 'LegalInterpretation'
  isReadOnly: boolean
  vertices: GeoPoint[]
  areaSquareMeters: number
  perimeterMeters: number
  hasSelfIntersection: boolean
}
