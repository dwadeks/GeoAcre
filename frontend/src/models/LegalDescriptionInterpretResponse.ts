import type { AppMode } from './AppMode'
import type { LegalDescriptionBoundary } from './LegalDescriptionBoundary'
import type { LegalDescriptionInterpretation } from './LegalDescriptionInterpretation'
import type { ModeAuditMetadata } from './ModeAuditMetadata'
import type { RetryGuidance } from './RetryGuidance'

export interface LegalDescriptionInterpretResponse {
  mode: Extract<AppMode, 'LegalDescription'>
  schemaVersion: string
  interpretation: LegalDescriptionInterpretation
  boundary?: LegalDescriptionBoundary
  retry?: RetryGuidance
  audit?: ModeAuditMetadata
}
