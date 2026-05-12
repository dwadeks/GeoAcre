import type { AppMode } from './AppMode'

export interface BaseModeExportSnapshot<TPayload> {
  schemaVersion: string
  mode: AppMode
  exportedAtUtc: string
  payload: TPayload
}
