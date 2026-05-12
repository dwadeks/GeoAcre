import type { GeoPoint } from './GeoTypes'
import type { AppMode } from './ModeTypes'

export type LegalDescriptionSourceType = 'PastedText' | 'UploadedImage'
export type LegalDescriptionInterpretationStatus = 'Succeeded' | 'Failed' | 'NeedsRetry'

export interface LegalDescriptionSource {
  type: LegalDescriptionSourceType
  text?: string
  fileName?: string
  contentType?: string
  base64Content?: string
}

export interface LegalDescriptionInterpretOptions {
  maxVertices?: number
  confidenceThreshold?: number
}

export interface LegalDescriptionInterpretRequest {
  source: LegalDescriptionSource
  options?: LegalDescriptionInterpretOptions
}

export interface LegalDescriptionInterpretation {
  status: LegalDescriptionInterpretationStatus
  confidence: number
  diagnostics: string[]
}

export interface LegalDescriptionBoundary {
  provenance: 'LegalInterpretation'
  isReadOnly: boolean
  vertices: GeoPoint[]
  areaSquareMeters: number
  perimeterMeters: number
  hasSelfIntersection: boolean
}

export interface RetryGuidance {
  allowed: boolean
  message: string
}

export interface LegalDescriptionInterpretResponse {
  mode: Extract<AppMode, 'LegalDescription'>
  schemaVersion: string
  interpretation: LegalDescriptionInterpretation
  boundary?: LegalDescriptionBoundary
  retry?: RetryGuidance
}

export interface ExportSnapshotRequest {
  activeMode: AppMode
  state: {
    legalDescriptionResultId?: string
  }
}

export interface ExportSnapshotResponse<TPayload = unknown> {
  schemaVersion: string
  mode: AppMode
  exportedAtUtc: string
  payload: TPayload
}