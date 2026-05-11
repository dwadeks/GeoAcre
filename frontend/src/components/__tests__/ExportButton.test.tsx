import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import ExportButton from '../ExportButton'

vi.mock('../../services/exportService', () => ({
  exportSessionToJSON: vi.fn(() => '{"schemaVersion":"1.0.0"}'),
  downloadJSON: vi.fn(),
  copyToClipboard: vi.fn(() => Promise.resolve()),
}))

describe('ExportButton', () => {
  it('disables actions when session has no shapes or measurements', () => {
    render(
      <ExportButton
        session={{
          primaryPolygon: undefined,
          excludePolygons: [],
          measurement: undefined,
          unitPreference: { areaUnit: 'acres', distanceUnit: 'feet' },
        }}
      />
    )

    expect(screen.getByRole('button', { name: /download session json/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /copy session json/i })).toBeDisabled()
  })

  it('enables actions and triggers download/copy for populated session', async () => {
    const service = await import('../../services/exportService')

    render(
      <ExportButton
        session={{
          primaryPolygon: {
            id: 'p1',
            vertices: [
              { latitude: 1, longitude: 1 },
              { latitude: 2, longitude: 2 },
              { latitude: 3, longitude: 3 },
            ],
            isExcludePolygon: false,
            isValid: true,
            hasIntersections: false,
            computedAreaSquareMeters: 1,
            computedPerimeterMeters: 1,
            perSideLengthsMeters: [1, 1, 1],
          },
          excludePolygons: [],
          measurement: undefined,
          unitPreference: { areaUnit: 'acres', distanceUnit: 'feet' },
        }}
      />
    )

    const download = screen.getByRole('button', { name: /download session json/i })
    const copy = screen.getByRole('button', { name: /copy session json/i })

    expect(download).toBeEnabled()
    expect(copy).toBeEnabled()

    fireEvent.click(download)
    expect(service.downloadJSON).toHaveBeenCalled()

    fireEvent.click(copy)
    expect(service.copyToClipboard).toHaveBeenCalled()
  })
})