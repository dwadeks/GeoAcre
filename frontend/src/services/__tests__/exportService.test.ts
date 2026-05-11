import { describe, expect, it, vi, beforeEach } from 'vitest'
import { copyToClipboard, downloadJSON, exportSessionToJSON } from '../exportService'
import type { SessionState } from '../../models/GeoTypes'

describe('exportService', () => {
  const session: SessionState = {
    primaryPolygon: {
      id: 'primary-1',
      isExcludePolygon: false,
      isValid: true,
      hasIntersections: false,
      parentPolygonId: undefined,
      computedAreaSquareMeters: 1000,
      computedPerimeterMeters: 200,
      perSideLengthsMeters: [50, 50, 50, 50],
      vertices: [
        { latitude: 39.78171234, longitude: -89.65012345 },
        { latitude: 39.78181234, longitude: -89.65022345 },
        { latitude: 39.78191234, longitude: -89.65032345 },
      ],
    },
    excludePolygons: [],
    measurement: {
      id: 'measurement-1',
      isValid: true,
      totalDistanceMeters: 123.4,
      perSegmentDistancesMeters: [12.3, 45.6, 65.5],
      vertices: [
        { latitude: 39.1, longitude: -89.1 },
        { latitude: 39.2, longitude: -89.2 },
      ],
    },
    unitPreference: {
      areaUnit: 'acres',
      distanceUnit: 'feet',
    },
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('exports session to valid JSON string with required schema fields', () => {
    const json = exportSessionToJSON(session)
    const parsed = JSON.parse(json)

    expect(parsed.schemaVersion).toBe('1.0.0')
    expect(parsed.exportedAt).toBeTypeOf('string')
    expect(parsed.primaryPolygon.id).toBe('primary-1')
    expect(parsed.measurements).toHaveLength(1)
    expect(parsed.units.areaUnit).toBe('acres')
    expect(parsed.units.distanceUnit).toBe('feet')
  })

  it('keeps coordinate precision to at least 6 decimals', () => {
    const json = exportSessionToJSON(session)
    const parsed = JSON.parse(json)
    const point = parsed.primaryPolygon.vertices[0]

    expect(point.latitude).toBe(39.781712)
    expect(point.longitude).toBe(-89.650123)
  })

  it('includes computed values in exported payload', () => {
    const parsed = JSON.parse(exportSessionToJSON(session))

    expect(parsed.primaryPolygon.areaSquareMeters).toBe(1000)
    expect(parsed.primaryPolygon.perimeterMeters).toBe(200)
    expect(parsed.measurements[0].totalDistanceMeters).toBe(123.4)
  })

  it('downloadJSON triggers browser download with the requested filename', () => {
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: vi.fn(() => 'blob:mock'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      writable: true,
      value: vi.fn(),
    })

    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL')
    const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL')
    const clickSpy = vi.fn()
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement)

    downloadJSON('{"ok":true}', 'session.json')

    expect(createObjectUrlSpy).toHaveBeenCalled()
    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock')
  })

  it('copyToClipboard writes exported JSON text to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    await copyToClipboard('{"hello":"world"}')

    expect(writeText).toHaveBeenCalledWith('{"hello":"world"}')
  })
})