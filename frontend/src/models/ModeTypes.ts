export type AppMode = 'DrawBoundary' | 'LegalDescription' | 'MeasureDistance'

export interface BaseModeExportSnapshot<TPayload> {
  schemaVersion: string
  mode: AppMode
  exportedAtUtc: string
  payload: TPayload
}

export interface DrawBoundaryExportPayload {
  provenance: 'Manual'
  vertices: Array<{ latitude: number; longitude: number }>
  excludePolygons: Array<{ vertices: Array<{ latitude: number; longitude: number }> }>
  areaSquareMeters: number
  perimeterMeters: number
}

export interface LegalDescriptionExportPayload {
  provenance: 'LegalInterpretation'
  isReadOnly: true
  vertices: Array<{ latitude: number; longitude: number }>
  areaSquareMeters: number
  perimeterMeters: number
  interpretationConfidence: number
}

export interface MeasureDistanceExportPayload {
  vertices: Array<{ latitude: number; longitude: number }>
  totalDistanceMeters: number
  perSegmentDistancesMeters: number[]
}

export type ModeExportSnapshot =
  | BaseModeExportSnapshot<DrawBoundaryExportPayload>
  | BaseModeExportSnapshot<LegalDescriptionExportPayload>
  | BaseModeExportSnapshot<MeasureDistanceExportPayload>