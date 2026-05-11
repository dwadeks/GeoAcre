import type { SessionSnapshot, SessionState } from '../models/GeoTypes'
import { SESSION_SNAPSHOT_SCHEMA_VERSION } from '../types/schemas'

function roundCoordinate(value: number): number {
  return Number(value.toFixed(6))
}

export function exportSessionToJSON(session: SessionState): string {
  const snapshot: SessionSnapshot = {
    schemaVersion: SESSION_SNAPSHOT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    units: session.unitPreference,
    primaryPolygon: session.primaryPolygon
      ? {
          id: session.primaryPolygon.id,
          vertices: session.primaryPolygon.vertices.map((v) => ({
            latitude: roundCoordinate(v.latitude),
            longitude: roundCoordinate(v.longitude),
          })),
          areaSquareMeters: session.primaryPolygon.computedAreaSquareMeters,
          perimeterMeters: session.primaryPolygon.computedPerimeterMeters,
          perSideLengthsMeters: session.primaryPolygon.perSideLengthsMeters,
        }
      : undefined,
    excludePolygons: session.excludePolygons.map((p) => ({
      id: p.id,
      vertices: p.vertices.map((v) => ({
        latitude: roundCoordinate(v.latitude),
        longitude: roundCoordinate(v.longitude),
      })),
      areaSquareMeters: p.computedAreaSquareMeters,
    })),
    measurements: session.measurement
      ? [
          {
            id: session.measurement.id,
            vertices: session.measurement.vertices.map((v) => ({
              latitude: roundCoordinate(v.latitude),
              longitude: roundCoordinate(v.longitude),
            })),
            totalDistanceMeters: session.measurement.totalDistanceMeters,
            perSegmentDistancesMeters: session.measurement.perSegmentDistancesMeters,
          },
        ]
      : [],
  }

  return JSON.stringify(snapshot, null, 2)
}

export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function copyToClipboard(data: string): Promise<void> {
  await navigator.clipboard.writeText(data)
}