import type { AppMode } from './AppMode'

export interface ExportSnapshotResponse<TPayload = unknown> {
  schemaVersion: string
  mode: AppMode
  exportedAtUtc: string
  payload: TPayload
}
