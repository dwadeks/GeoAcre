/**
 * GeoTypes - TypeScript interfaces matching backend DTOs
 * Defines data structures for geographic coordinates, polygons, and API requests/responses
 */

/**
 * Represents a geographic coordinate (latitude, longitude)
 */
export interface GeoPoint {
  latitude: number // WGS84, degrees [-90, 90]
  longitude: number // WGS84, degrees [-180, 180]
}

/**
 * Represents a closed polygon boundary
 */
export interface Polygon {
  id: string // UUID
  vertices: GeoPoint[] // ≥ 3 points for valid polygon
  isExcludePolygon: boolean // true if this is an exclude area
  parentPolygonId?: string // set if this is an exclude polygon
  isValid: boolean // computed: vertices.length >= 3
  hasIntersections: boolean // computed: sides cross each other
  computedAreaSquareMeters: number // geodetic area
  computedPerimeterMeters: number // geodetic perimeter
  perSideLengthsMeters: number[] // array of distances between consecutive vertices
}

/**
 * Represents a distance measurement as a polyline
 */
export interface Measurement {
  id: string // UUID
  vertices: GeoPoint[] // ≥ 2 points for valid measurement
  isValid: boolean // computed: vertices.length >= 2
  totalDistanceMeters: number // total distance along polyline
  perSegmentDistancesMeters: number[] // array of segment distances
}

/**
 * User's unit preferences
 */
export interface UnitPreference {
  areaUnit: 'acres' | 'hectares' | 'sqm'
  distanceUnit: 'feet' | 'meters' | 'miles' | 'km'
}

/**
 * Session state
 */
export interface SessionState {
  primaryPolygon?: Polygon
  excludePolygons: Polygon[]
  unitPreference: UnitPreference
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * POST /geometry/calculate-area request
 */
export interface CalculateAreaRequest {
  vertices: GeoPoint[] // primary polygon vertices
  excludePolygons?: GeoPoint[][] // optional exclude polygons
}

/**
 * POST /geometry/calculate-area response
 */
export interface CalculateAreaResponse {
  areaSquareMeters: number
  netAreaSquareMeters: number
  excludedAreaSquareMeters: number
  perSideLengthsMeters: number[]
  hasIntersections: boolean
}

/**
 * POST /geocode/search request
 */
export interface GeocodeSearchRequest {
  query: string // e.g., "123 Main St, Springfield, IL"
  maxResults?: number // default 5
}

/**
 * Search result from geocoding
 */
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

/**
 * POST /geocode/search response
 */
export interface GeocodeSearchResponse {
  results: GeocodeResult[]
}

/**
 * POST /geocode/reverse request
 */
export interface ReverseGeocodeRequest {
  latitude: number
  longitude: number
}

/**
 * POST /geocode/reverse response
 */
export interface ReverseGeocodeResponse {
  address: string
  latitude: number
  longitude: number
}
