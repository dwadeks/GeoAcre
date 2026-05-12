export interface LegalDescriptionExportPayload {
  provenance: 'LegalInterpretation'
  isReadOnly: true
  vertices: Array<{ latitude: number; longitude: number }>
  areaSquareMeters: number
  perimeterMeters: number
  interpretationConfidence: number
}
