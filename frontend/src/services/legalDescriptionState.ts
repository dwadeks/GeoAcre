import type { LegalDescriptionInterpretRequest } from '../models/LegalDescriptionInterpretRequest'
import type { LegalDescriptionInterpretResponse } from '../models/LegalDescriptionInterpretResponse'
import { interpretLegalDescription } from './legalDescriptionApi'

export type LegalDescriptionWorkflowStatus =
  | 'idle'
  | 'submitting'
  | 'succeeded'
  | 'needsRetry'
  | 'failed'

export type LegalDescriptionWorkflowState = {
  status: LegalDescriptionWorkflowStatus
  result: LegalDescriptionInterpretResponse | null
  errorMessage: string | null
}

export function createInitialLegalDescriptionWorkflowState(): LegalDescriptionWorkflowState {
  return {
    status: 'idle',
    result: null,
    errorMessage: null,
  }
}

export async function submitLegalDescriptionRequest(
  request: LegalDescriptionInterpretRequest
): Promise<LegalDescriptionWorkflowState> {
  const response = await interpretLegalDescription(request)

  if (response.error) {
    return {
      status: 'failed',
      result: null,
      errorMessage: response.error.message || 'Interpretation request failed.',
    }
  }

  const result = response.data ?? null
  if (!result) {
    return {
      status: 'failed',
      result: null,
      errorMessage: 'Interpretation response was empty.',
    }
  }

  const status = result.interpretation.status === 'NeedsRetry' ? 'needsRetry' : 'succeeded'
  return {
    status,
    result,
    errorMessage: null,
  }
}
