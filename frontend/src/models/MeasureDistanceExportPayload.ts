export interface MeasureDistanceExportPayload {
  vertices: Array<{ latitude: number; longitude: number }>
  totalDistanceMeters: number
  perSegmentDistancesMeters: number[]
}
