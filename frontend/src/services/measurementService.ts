import { GeoPoint } from '../models/GeoTypes';
import { EARTH_RADIUS_METERS } from './geometryService';

/**
 * Calculates the total distance of a polyline (sum of all segment distances)
 * @param vertices Array of GeoPoint coordinates defining the polyline
 * @returns Total distance in meters
 */
export function calculatePolylineDistance(vertices: GeoPoint[]): number {
  if (vertices.length < 2) {
    return 0;
  }

  let totalDistance = 0;
  for (let i = 0; i < vertices.length - 1; i++) {
    totalDistance += haversineDistance(vertices[i], vertices[i + 1]);
  }
  return totalDistance;
}

/**
 * Calculates the distance of each segment in a polyline
 * @param vertices Array of GeoPoint coordinates defining the polyline
 * @returns Array of distances in meters for each segment
 */
export function calculateSegmentDistances(vertices: GeoPoint[]): number[] {
  if (vertices.length < 2) {
    return [];
  }

  const distances: number[] = [];
  for (let i = 0; i < vertices.length - 1; i++) {
    distances.push(haversineDistance(vertices[i], vertices[i + 1]));
  }
  return distances;
}

/**
 * Calculates the great-circle distance between two points using Haversine formula
 * Accuracy: ~0.5m
 * @param from Starting GeoPoint
 * @param to Ending GeoPoint
 * @returns Distance in meters
 */
export function haversineDistance(from: GeoPoint, to: GeoPoint): number {
  const lat1 = degreesToRadians(from.latitude);
  const lat2 = degreesToRadians(to.latitude);
  const deltaLat = degreesToRadians(to.latitude - from.latitude);
  const deltaLon = degreesToRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_METERS * c;

  return distance;
}

/**
 * Converts degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates the bearing (direction) from one point to another
 * @param from Starting GeoPoint
 * @param to Ending GeoPoint
 * @returns Bearing in degrees (0-360), where 0 is North
 */
export function calculateBearing(from: GeoPoint, to: GeoPoint): number {
  const lat1 = degreesToRadians(from.latitude);
  const lat2 = degreesToRadians(to.latitude);
  const dLon = degreesToRadians(to.longitude - from.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearing = Math.atan2(y, x);
  const bearingDegrees = (radiansToDegrees(bearing) + 360) % 360;

  return bearingDegrees;
}

/**
 * Converts radians to degrees
 * @param radians Angle in radians
 * @returns Angle in degrees
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Finds the midpoint between two GeoPoints (for label placement on map)
 * @param from Starting GeoPoint
 * @param to Ending GeoPoint
 * @returns Midpoint GeoPoint
 */
export function calculateMidpoint(from: GeoPoint, to: GeoPoint): GeoPoint {
  const lat1 = degreesToRadians(from.latitude);
  const lat2 = degreesToRadians(to.latitude);
  const lon1 = degreesToRadians(from.longitude);
  const lon2 = degreesToRadians(to.longitude);
  const dLon = lon2 - lon1;

  const Bx = Math.cos(lat2) * Math.cos(dLon);
  const By = Math.cos(lat2) * Math.sin(dLon);

  const lat3 = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + Bx) ** 2 + By ** 2)
  );
  const lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

  return {
    latitude: radiansToDegrees(lat3),
    longitude: radiansToDegrees(lon3),
  };
}
