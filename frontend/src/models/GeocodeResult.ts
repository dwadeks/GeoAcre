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
