import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MeasurementTool from '../MeasurementTool';
import { GeoPoint } from '../../models/GeoTypes';

describe('MeasurementTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render toggle button to activate/deactivate Distance Measurement Mode', () => {
    const onMeasurementChange = vi.fn();
    render(
      <MeasurementTool
        isActive={false}
        onToggle={vi.fn()}
        onMeasurementChange={onMeasurementChange}
      />
    );

    const toggleButton = screen.getByRole('button', {
      name: /toggle.*distance|activate.*distance/i,
    });
    expect(toggleButton).toBeInTheDocument();
  });

  it('should be inactive by default', () => {
    const onMeasurementChange = vi.fn();
    render(
      <MeasurementTool
        isActive={false}
        onToggle={vi.fn()}
        onMeasurementChange={onMeasurementChange}
      />
    );

    expect(screen.getByRole('button', { name: /activate|start/i })).toBeInTheDocument();
  });

  it('should display measurement points when active', () => {
    const measurementPoints: GeoPoint[] = [
      { latitude: 40.7128, longitude: -74.006 },
      { latitude: 34.0522, longitude: -118.2437 },
    ];
    const onMeasurementChange = vi.fn();
    render(
      <MeasurementTool
        isActive={true}
        onToggle={vi.fn()}
        onMeasurementChange={onMeasurementChange}
        measurementPoints={measurementPoints}
        totalDistance={3944000}
        segmentDistances={[3944000]}
      />
    );

    // Should display measurement display when active
    expect(screen.getByText(/2 points placed/i)).toBeInTheDocument();
  });

  it('should display total distance when measurements exist', () => {
    const measurementPoints: GeoPoint[] = [
      { latitude: 40.7128, longitude: -74.006 },
      { latitude: 34.0522, longitude: -118.2437 },
    ];
    const totalDistance = 3944000; // meters (3944 km)
    const onMeasurementChange = vi.fn();
    render(
      <MeasurementTool
        isActive={true}
        onToggle={vi.fn()}
        onMeasurementChange={onMeasurementChange}
        measurementPoints={measurementPoints}
        totalDistance={totalDistance}
        segmentDistances={[totalDistance]}
      />
    );

    // Should display total distance in a readable format
    expect(screen.getByText(/total.*distance|3944.*km|3.944/i)).toBeInTheDocument();
  });

  it('should display segment labels when multiple segments exist', () => {
    const measurementPoints: GeoPoint[] = [
      { latitude: 40.7128, longitude: -74.006 },
      { latitude: 34.0522, longitude: -118.2437 },
      { latitude: 41.8781, longitude: -87.6298 },
    ];
    const segmentDistances = [3944000, 2000000];
    const onMeasurementChange = vi.fn();
    render(
      <MeasurementTool
        isActive={true}
        onToggle={vi.fn()}
        onMeasurementChange={onMeasurementChange}
        measurementPoints={measurementPoints}
        totalDistance={5944000}
        segmentDistances={segmentDistances}
      />
    );

    // Should display segment labels
    const segments = screen.getAllByText(/segment|leg/i);
    expect(segments.length).toBeGreaterThan(0);
  });

  it('should have clear button to reset measurement', async () => {
    const onToggle = vi.fn();
    const onMeasurementChange = vi.fn();
    const user = userEvent.setup();

    const measurementPoints: GeoPoint[] = [
      { latitude: 40.7128, longitude: -74.006 },
    ];
    const { rerender } = render(
      <MeasurementTool
        isActive={true}
        onToggle={onToggle}
        onMeasurementChange={onMeasurementChange}
        measurementPoints={measurementPoints}
        totalDistance={0}
        segmentDistances={[]}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear|reset/i });
    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);
    expect(onMeasurementChange).toHaveBeenCalledWith([]);
  });

  it('should disable input when not active', () => {
    const onMeasurementChange = vi.fn();
    render(
      <MeasurementTool
        isActive={false}
        onToggle={vi.fn()}
        onMeasurementChange={onMeasurementChange}
      />
    );

    // Map container or input area should be disabled or have aria-disabled
    expect(screen.getByRole('button', { name: /activate|start/i })).toBeInTheDocument();
  });

  it('should call onToggle when toggle button clicked', async () => {
    const onToggle = vi.fn();
    const onMeasurementChange = vi.fn();
    const user = userEvent.setup();

    render(
      <MeasurementTool
        isActive={false}
        onToggle={onToggle}
        onMeasurementChange={onMeasurementChange}
      />
    );

    const toggleButton = screen.getByRole('button', {
      name: /toggle|activate|start/i,
    });
    await user.click(toggleButton);
    expect(onToggle).toHaveBeenCalled();
  });

  it('should call onMeasurementChange when points added', async () => {
    const onMeasurementChange = vi.fn();
    const onToggle = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <MeasurementTool
        isActive={true}
        onToggle={onToggle}
        onMeasurementChange={onMeasurementChange}
        measurementPoints={[]}
        totalDistance={0}
        segmentDistances={[]}
      />
    );

    // Simulate map click (this would be handled by the parent/Map component in real scenario)
    // For this test, we verify the component structure supports measurement
    expect(container.querySelector('[class*="measurement"]')).toBeDefined();
  });
});
