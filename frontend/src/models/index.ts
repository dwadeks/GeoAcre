/**
 * GeoTypes - Central type definitions for the application
 */

export interface GeoPoint {
  latitude: number
  longitude: number
}

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

export interface UnitPreference {
  areaUnit: 'acres' | 'hectares' | 'sqft' | 'sqm'
  distanceUnit: 'feet' | 'meters' | 'miles' | 'km'
}

export interface SessionState {
  primaryPolygon?: Polygon
  excludePolygons: Polygon[]
  measurement?: {
    id: string
    vertices: GeoPoint[]
    isValid: boolean
    totalDistanceMeters: number
    perSegmentDistancesMeters: number[]
  }
  unitPreference: UnitPreference
}

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

export interface CalculateAreaRequest {
  vertices: GeoPoint[]
  excludePolygons?: GeoPoint[][]
}

export interface CalculateAreaResponse {
  areaSquareMeters: number
  netAreaSquareMeters: number
  excludedAreaSquareMeters: number
  perSideLengthsMeters: number[]
  hasIntersections: boolean
}

export interface GeocodeSearchRequest {
  query: string
  maxResults?: number
}

export interface GeocodeResult {
  id: string
  displayName: string
  latitude: number
  longitude: number
  boundingBox?: {
    minLat: number
    maxLat: number
    minLon: number
    maxLon: number
  }
}

export interface GeocodeSearchResponse {
  results: GeocodeResult[]
}

export interface ReverseGeocodeRequest {
  latitude: number
  longitude: number
}

export interface ReverseGeocodeResponse {
  address: string
  latitude: number
  longitude: number
}

export default {
  GeoPoint,
  Polygon,
  UnitPreference,
  SessionState,
}
