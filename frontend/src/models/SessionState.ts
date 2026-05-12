import type { Measurement } from './Measurement'
import type { Polygon } from './Polygon'
import type { UnitPreference } from './UnitPreference'

export interface SessionState {
  primaryPolygon?: Polygon
  excludePolygons: Polygon[]
  measurement?: Measurement
  unitPreference: UnitPreference
}
