import React, { useState, useEffect } from 'react';
import { GeoPoint, Measurement } from '../models/GeoTypes';
import {
  calculatePolylineDistance,
  calculateSegmentDistances,
  calculateMidpoint,
  calculateBearing,
} from '../services/measurementService';
import { formatDistance } from '../services/geometryService';

interface MeasurementToolProps {
  isActive: boolean;
  onToggle: () => void;
  onMeasurementChange: (vertices: GeoPoint[]) => void;
  measurementPoints?: GeoPoint[];
  totalDistance?: number;
  segmentDistances?: number[];
  distanceUnit?: 'feet' | 'meters' | 'miles' | 'km';
}

/**
 * MeasurementTool Component
 * Allows users to measure distances along a polyline by clicking points on the map
 * Displays per-segment and total distances
 */
const MeasurementTool: React.FC<MeasurementToolProps> = ({
  isActive,
  onToggle,
  onMeasurementChange,
  measurementPoints = [],
  totalDistance = 0,
  segmentDistances = [],
  distanceUnit = 'feet',
}) => {
  const [localPoints, setLocalPoints] = useState<GeoPoint[]>(measurementPoints);
  const [localTotalDistance, setLocalTotalDistance] = useState<number>(totalDistance);
  const [localSegmentDistances, setLocalSegmentDistances] = useState<number[]>(segmentDistances);

  // Update local state when props change
  useEffect(() => {
    setLocalPoints(measurementPoints);
  }, [measurementPoints]);

  useEffect(() => {
    setLocalTotalDistance(totalDistance);
  }, [totalDistance]);

  useEffect(() => {
    setLocalSegmentDistances(segmentDistances);
  }, [segmentDistances]);

  /**
   * Adds a new measurement point
   * Called when user clicks on the map in measurement mode
   */
  const addMeasurementPoint = (point: GeoPoint): void => {
    const newPoints = [...localPoints, point];
    setLocalPoints(newPoints);

    // Recalculate distances
    const newTotal = calculatePolylineDistance(newPoints);
    const newSegments = calculateSegmentDistances(newPoints);

    setLocalTotalDistance(newTotal);
    setLocalSegmentDistances(newSegments);
    onMeasurementChange(newPoints);
  };

  /**
   * Removes the last measurement point
   */
  const removeLast = (): void => {
    if (localPoints.length > 0) {
      const newPoints = localPoints.slice(0, -1);
      setLocalPoints(newPoints);

      const newTotal = calculatePolylineDistance(newPoints);
      const newSegments = calculateSegmentDistances(newPoints);

      setLocalTotalDistance(newTotal);
      setLocalSegmentDistances(newSegments);
      onMeasurementChange(newPoints);
    }
  };

  /**
   * Clears all measurement points
   */
  const clearMeasurement = (): void => {
    setLocalPoints([]);
    setLocalTotalDistance(0);
    setLocalSegmentDistances([]);
    onMeasurementChange([]);
  };

  /**
   * Removes a specific measurement point by index
   */
  const removePoint = (index: number): void => {
    const newPoints = localPoints.filter((_, i) => i !== index);
    setLocalPoints(newPoints);

    const newTotal = calculatePolylineDistance(newPoints);
    const newSegments = calculateSegmentDistances(newPoints);

    setLocalTotalDistance(newTotal);
    setLocalSegmentDistances(newSegments);
    onMeasurementChange(newPoints);
  };

  return (
    <div className="measurement-tool">
      <div className="measurement-controls">
        <button
          className={`measurement-toggle ${isActive ? 'active' : ''}`}
          onClick={onToggle}
          aria-label={isActive ? 'Deactivate Distance Measurement Mode' : 'Activate Distance Measurement Mode'}
        >
          {isActive ? '✓ Distance Measurement Active' : '○ Distance Measurement'}
        </button>

        {isActive && localPoints.length > 0 && (
          <>
            <button
              className="measurement-undo"
              onClick={removeLast}
              aria-label="Remove last measurement point"
              title="Remove last point (Ctrl+Z)"
            >
              ↶ Undo
            </button>

            <button
              className="measurement-clear"
              onClick={clearMeasurement}
              aria-label="Clear all measurement points"
            >
              × Clear
            </button>
          </>
        )}
      </div>

      {isActive && (
        <div className="measurement-display">
          <div className="measurement-info">
            <p className="measurement-status">
              {localPoints.length === 0
                ? 'Click on the map to start measuring'
                : `${localPoints.length} point${localPoints.length !== 1 ? 's' : ''} placed`}
            </p>

            {localPoints.length >= 2 && (
              <>
                <div className="measurement-total">
                  <strong>Total Distance:</strong>
                  <span className="distance-value">
                    {formatDistance(localTotalDistance, distanceUnit)}
                  </span>
                </div>

                {localSegmentDistances.length > 0 && (
                  <div className="measurement-segments">
                    <strong>Segments:</strong>
                    <div className="segment-list">
                      {localSegmentDistances.map((distance, index) => (
                        <div key={index} className="segment-item">
                          <span className="segment-label">
                            Leg {index + 1}:
                          </span>
                          <span className="segment-distance">
                            {formatDistance(distance, distanceUnit)}
                          </span>
                          <button
                            className="segment-remove"
                            onClick={() => removePoint(index)}
                            aria-label={`Remove point ${index + 1}`}
                            title="Remove this point"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {localSegmentDistances.length > 1 && (
                  <div className="measurement-stats">
                    <div className="stat">
                      <span>Average Leg:</span>
                      <span>
                        {formatDistance(
                          localTotalDistance / localSegmentDistances.length,
                          distanceUnit
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Point details list */}
          {localPoints.length > 0 && (
            <div className="measurement-points">
              <strong>Points:</strong>
              <div className="points-list">
                {localPoints.map((point, index) => (
                  <div key={index} className="point-item">
                    <span className="point-number">#{index + 1}</span>
                    <span className="point-coords">
                      {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                    </span>
                    <button
                      className="point-remove"
                      onClick={() => removePoint(index)}
                      aria-label={`Remove point ${index + 1}`}
                      title="Remove this point"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MeasurementTool;
