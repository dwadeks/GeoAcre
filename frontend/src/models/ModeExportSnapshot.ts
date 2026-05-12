import type { BaseModeExportSnapshot } from './BaseModeExportSnapshot'
import type { DrawBoundaryExportPayload } from './DrawBoundaryExportPayload'
import type { LegalDescriptionExportPayload } from './LegalDescriptionExportPayload'
import type { MeasureDistanceExportPayload } from './MeasureDistanceExportPayload'

export type ModeExportSnapshot =
  | BaseModeExportSnapshot<DrawBoundaryExportPayload>
  | BaseModeExportSnapshot<LegalDescriptionExportPayload>
  | BaseModeExportSnapshot<MeasureDistanceExportPayload>
