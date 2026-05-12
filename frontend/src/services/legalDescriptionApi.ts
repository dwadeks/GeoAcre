import type {
  ExportSnapshotRequest,
  ExportSnapshotResponse,
  LegalDescriptionInterpretRequest,
  LegalDescriptionInterpretResponse,
} from '../models/LegalDescriptionTypes'
import { LEGAL_DESCRIPTION_ENDPOINTS } from './config'
import { apiPost } from './apiClient'

export async function interpretLegalDescription(
  request: LegalDescriptionInterpretRequest
) {
  return apiPost<LegalDescriptionInterpretResponse>(
    LEGAL_DESCRIPTION_ENDPOINTS.interpret,
    request
  )
}

export async function exportActiveModeSnapshot<TPayload = unknown>(
  request: ExportSnapshotRequest
) {
  return apiPost<ExportSnapshotResponse<TPayload>>(
    LEGAL_DESCRIPTION_ENDPOINTS.export,
    request
  )
}