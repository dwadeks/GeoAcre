import type { AreaUnit } from './AreaUnit'
import type { DistanceUnit } from './DistanceUnit'

export type { AreaUnit } from './AreaUnit'
export type { DistanceUnit } from './DistanceUnit'

const AREA_TO_SQM: Record<AreaUnit, number> = {
  acres: 4046.8564224,
  hectares: 10000,
  sqft: 0.09290304,
  sqm: 1,
}

const DISTANCE_TO_METERS: Record<DistanceUnit, number> = {
  feet: 0.3048,
  meters: 1,
  miles: 1609.344,
  km: 1000,
}

export function convertArea(value: number, fromUnit: AreaUnit, toUnit: AreaUnit): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  const inSquareMeters = value * AREA_TO_SQM[fromUnit]
  return inSquareMeters / AREA_TO_SQM[toUnit]
}

export function convertDistance(
  value: number,
  fromUnit: DistanceUnit,
  toUnit: DistanceUnit
): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  const inMeters = value * DISTANCE_TO_METERS[fromUnit]
  return inMeters / DISTANCE_TO_METERS[toUnit]
}
