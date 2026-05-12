export interface DrawBoundaryExportPayload {
  provenance: 'Manual'
  vertices: Array<{ latitude: number; longitude: number }>
  excludePolygons: Array<{ vertices: Array<{ latitude: number; longitude: number }> }>
  areaSquareMeters: number
  perimeterMeters: number
}
