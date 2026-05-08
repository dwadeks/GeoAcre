import type { GeoPoint } from '../models/GeoTypes'
import { calculatePolygonArea, polygonsIntersect } from './geometryService'

export function clampArea(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, value)
}

export function calculateNetArea(
  primaryVertices: GeoPoint[],
  excludeVertices: GeoPoint[][]
): number {
  const primaryArea = calculatePolygonArea(primaryVertices)

  if (primaryArea <= 0 || excludeVertices.length === 0) {
    return clampArea(primaryArea)
  }

  let excludedArea = 0

  for (const exclude of excludeVertices) {
    if (exclude.length < 3) continue

    // Subtract only excludes that overlap the primary polygon.
    if (polygonsIntersect(primaryVertices, exclude)) {
      excludedArea += calculatePolygonArea(exclude)
    }
  }

  return clampArea(primaryArea - excludedArea)
}

export default {
  calculateNetArea,
  clampArea,
}
