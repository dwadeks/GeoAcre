import type { LegalDescriptionInterpretOptions } from './LegalDescriptionInterpretOptions'
import type { LegalDescriptionSource } from './LegalDescriptionSource'

export interface LegalDescriptionInterpretRequest {
  source: LegalDescriptionSource
  options?: LegalDescriptionInterpretOptions
}
