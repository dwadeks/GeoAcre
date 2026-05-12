import { describe, it, expect } from 'vitest';
import {
  calculatePolylineDistance,
  calculateSegmentDistances,
} from '../measurementService';
import type { GeoPoint } from '../../models/GeoTypes';

describe('measurementService', () => {
  describe('calculatePolylineDistance', () => {
    it('should return zero distance for a single point', () => {
      const vertices: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 },
      ];
      const distance = calculatePolylineDistance(vertices);
      expect(distance).toBe(0);
    });

    it('should calculate distance between two points', () => {
      // NYC to LA: approximately 3944 km
      const vertices: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 }, // NYC
        { latitude: 34.0522, longitude: -118.2437 }, // LA
      ];
      const distance = calculatePolylineDistance(vertices);
      // Should be approximately 3944 km = 3944000 meters
      expect(distance).toBeGreaterThan(3900000);
      expect(distance).toBeLessThan(3990000);
    });

    it('should calculate cumulative distance for multiple segments', () => {
      // Three points forming a triangle
      const vertices: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 }, // NYC
        { latitude: 34.0522, longitude: -118.2437 }, // LA
        { latitude: 40.7128, longitude: -74.006 }, // back to NYC
      ];
      const distance = calculatePolylineDistance(vertices);
      // Should be approximately 2x the distance from NYC to LA
      expect(distance).toBeGreaterThan(7800000);
      expect(distance).toBeLessThan(7980000);
    });

    it('should handle symmetry: A→B→A matches 2×Distance(A, B)', () => {
      const pointA: GeoPoint = { latitude: 40.7128, longitude: -74.006 };
      const pointB: GeoPoint = { latitude: 34.0522, longitude: -118.2437 };

      const distanceAtoB = calculatePolylineDistance([pointA, pointB]);
      const distanceRoundTrip = calculatePolylineDistance([pointA, pointB, pointA]);

      // Should be approximately 2x within small tolerance
      expect(Math.abs(distanceRoundTrip - 2 * distanceAtoB)).toBeLessThan(100); // 100m tolerance
    });

    it('should return zero for empty vertices array', () => {
      const vertices: GeoPoint[] = [];
      const distance = calculatePolylineDistance(vertices);
      expect(distance).toBe(0);
    });
  });

  describe('calculateSegmentDistances', () => {
    it('should return empty array for single point', () => {
      const vertices: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 },
      ];
      const distances = calculateSegmentDistances(vertices);
      expect(distances).toEqual([]);
    });

    it('should return single distance for two points', () => {
      const vertices: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 }, // NYC
        { latitude: 34.0522, longitude: -118.2437 }, // LA
      ];
      const distances = calculateSegmentDistances(vertices);
      expect(distances).toHaveLength(1);
      // NYC to LA: approximately 3944 km
      expect(distances[0]).toBeGreaterThan(3900000);
      expect(distances[0]).toBeLessThan(3990000);
    });

    it('should return correct number of segments for multiple points', () => {
      const vertices: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 34.0522, longitude: -118.2437 },
        { latitude: 41.8781, longitude: -87.6298 },
      ];
      const distances = calculateSegmentDistances(vertices);
      expect(distances).toHaveLength(2);
    });

    it('should calculate correct segment distances', () => {
      const vertices: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 }, // NYC
        { latitude: 34.0522, longitude: -118.2437 }, // LA
        { latitude: 40.7128, longitude: -74.006 }, // back to NYC
      ];
      const distances = calculateSegmentDistances(vertices);
      expect(distances).toHaveLength(2);

      // Both segments should be approximately the same distance (NYC to LA)
      expect(distances[0]).toBeGreaterThan(3900000);
      expect(distances[0]).toBeLessThan(3990000);
      expect(distances[1]).toBeGreaterThan(3900000);
      expect(distances[1]).toBeLessThan(3990000);

      // Sum should equal total polyline distance
      const totalDistance = calculatePolylineDistance(vertices);
      const sumSegments = distances.reduce((a, b) => a + b, 0);
      expect(Math.abs(totalDistance - sumSegments)).toBeLessThan(100);
    });

    it('should return empty array for empty vertices', () => {
      const vertices: GeoPoint[] = [];
      const distances = calculateSegmentDistances(vertices);
      expect(distances).toEqual([]);
    });
  });
});
