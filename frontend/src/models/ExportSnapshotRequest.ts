import type { AppMode } from './AppMode'

export interface ExportSnapshotRequest {
  activeMode: AppMode
  state: {
    legalDescriptionResultId?: string
  }
}
