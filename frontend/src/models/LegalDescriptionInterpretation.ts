export interface LegalDescriptionInterpretation {
  status: 'Succeeded' | 'Failed' | 'NeedsRetry'
  confidence: number
  diagnostics: string[]
}
