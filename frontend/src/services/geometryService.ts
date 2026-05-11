/**
 * Geometry Service - Client-side calculations for polygons and measurements
 * Uses Turf.js for fast, accurate geometric calculations
 */

import * as turf from '@turf/turf'
import type { GeoPoint } from '../models/GeoTypes'
import { convertArea, convertDistance, type AreaUnit, type DistanceUnit } from './unitService'

/**
 * Earth's radius in meters (WGS84 mean radius)
 */
export const EARTH_RADIUS_METERS = 6371008.8

/**
 * Convert GeoPoint array to Turf.js coordinate array
 */
function toTurfCoordinates(vertices: GeoPoint[]): Array<[number, number]> {
  return vertices.map((v) => [v.longitude, v.latitude])
}

/**
 * Close a coordinate ring for Turf.js (ensure first point equals last point)
 */
function closeRing(coords: Array<[number, number]>): Array<[number, number]> {
  if (coords.length === 0) return coords
  
  const closed = [...coords]
  if (closed[0][0] !== closed[closed.length - 1][0] ||
      closed[0][1] !== closed[closed.length - 1][1]) {
    closed.push(closed[0])
  }
  
  return closed
}

/**
 * Calculate area of a polygon given vertices in square meters
 * Uses Turf.js area calculation for accuracy
 */
export function calculatePolygonArea(vertices: GeoPoint[]): number {
  if (!vertices || vertices.length < 3) {
    return 0
  }

  try {
    const coords = toTurfCoordinates(vertices)
    const polygon = turf.polygon([closeRing(coords)])
    // Area is returned in square meters
    return turf.area(polygon)
  } catch (error) {
    console.error('Error calculating polygon area:', error)
    return 0
  }
}

/**
 * Calculate individual side lengths of a polygon in meters
 */
export function calculateSideLengths(vertices: GeoPoint[]): number[] {
  if (!vertices || vertices.length < 2) {
    return []
  }

  const lengths: number[] = []

  for (let i = 0; i < vertices.length; i++) {
    const from = vertices[i]
    const to = vertices[(i + 1) % vertices.length] // Wrap to first vertex at end

    try {
      const distance = turf.distance(
        [from.longitude, from.latitude],
        [to.longitude, to.latitude],
        { units: 'meters' }
      )
      lengths.push(distance)
    } catch {
      lengths.push(0)
    }
  }

  return lengths
}

/**
 * Calculate total perimeter in meters
 */
export function calculatePerimeter(vertices: GeoPoint[]): number {
  const sideLengths = calculateSideLengths(vertices)
  return sideLengths.reduce((sum, length) => sum + length, 0)
}

function ccw(a: GeoPoint, b: GeoPoint, c: GeoPoint): boolean {
  return (c.latitude - a.latitude) * (b.longitude - a.longitude) >
    (b.latitude - a.latitude) * (c.longitude - a.longitude)
}

function segmentsIntersect(p1: GeoPoint, p2: GeoPoint, p3: GeoPoint, p4: GeoPoint): boolean {
  const d1 = ccw(p1, p3, p4)
  const d2 = ccw(p2, p3, p4)
  const d3 = ccw(p3, p1, p2)
  const d4 = ccw(p4, p1, p2)
  return d1 !== d2 && d3 !== d4
}

export function detectSelfIntersections(vertices: GeoPoint[]): boolean {
  if (!vertices || vertices.length < 4) {
    return false
  }

  for (let i = 0; i < vertices.length; i++) {
    const p1 = vertices[i]
    const p2 = vertices[(i + 1) % vertices.length]

    for (let j = i + 2; j < vertices.length; j++) {
      if (j === vertices.length - 1 && i === 0) {
        continue
      }

      const p3 = vertices[j]
      const p4 = vertices[(j + 1) % vertices.length]

      if (segmentsIntersect(p1, p2, p3, p4)) {
        return true
      }
    }
  }

  return false
}

/**
 * Format area value with unit conversion and localization
 */
export function formatArea(
  squareMeters: number,
  unit: AreaUnit
): string {
  const value = convertArea(squareMeters, 'sqm', unit)
  const labelMap: Record<AreaUnit, string> = {
    acres: 'acres',
    hectares: 'hectares',
    sqft: 'sq ft',
    sqm: 'sq m',
  }

  return `${value.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} ${labelMap[unit]}`
}

/**
 * Format distance value with unit conversion
 */
export function formatDistance(
  meters: number,
  unit: DistanceUnit
): string {
  const value = convertDistance(meters, 'meters', unit)
  const labelMap: Record<DistanceUnit, string> = {
    feet: 'ft',
    meters: 'm',
    miles: 'mi',
    km: 'km',
  }

  return `${value.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} ${labelMap[unit]}`
}

/**
 * Detect if two polygons intersect
 */
export function polygonsIntersect(
  polygon1: GeoPoint[],
  polygon2: GeoPoint[]
): boolean {
  if (polygon1.length < 3 || polygon2.length < 3) {
    return false
  }

  try {
    const poly1 = turf.polygon([closeRing(toTurfCoordinates(polygon1))])
    const poly2 = turf.polygon([closeRing(toTurfCoordinates(polygon2))])

    return (
      turf.booleanIntersects(poly1, poly2) ||
      turf.booleanOverlap(poly1, poly2)
    )
  } catch {
    return false
  }
}

/**
 * Check if a point is inside a polygon
 */
export function isPointInPolygon(
  point: GeoPoint,
  polygonVertices: GeoPoint[]
): boolean {
  if (polygonVertices.length < 3) {
    return false
  }

  try {
    const turfPoint = turf.point([point.longitude, point.latitude])
    const polygon = turf.polygon([closeRing(toTurfCoordinates(polygonVertices))])
    return turf.booleanPointInPolygon(turfPoint, polygon)
  } catch {
    return false
  }
}

export default {
  calculatePolygonArea,
  calculateSideLengths,
  calculatePerimeter,
  formatArea,
  formatDistance,
  polygonsIntersect,
  isPointInPolygon,
}
