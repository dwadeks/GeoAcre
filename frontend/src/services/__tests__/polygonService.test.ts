import { describe, expect, it } from 'vitest'
import { calculateNetArea, clampArea } from '../polygonService'

describe('polygonService', () => {
  const primary = [
    { latitude: 0, longitude: 0 },
    { latitude: 0, longitude: 1 },
    { latitude: 1, longitude: 1 },
    { latitude: 1, longitude: 0 },
  ]

  it('calculateNetArea(primary, excludes) returns expected difference', () => {
    const exclude = [
      { latitude: 0.2, longitude: 0.2 },
      { latitude: 0.2, longitude: 0.4 },
      { latitude: 0.4, longitude: 0.4 },
      { latitude: 0.4, longitude: 0.2 },
    ]

    const result = calculateNetArea(primary, [exclude])

    expect(result).toBeGreaterThan(0)
    // Should reduce area when overlap exists.
    expect(result).toBeLessThan(calculateNetArea(primary, []))
  })

  it('clampArea(value) ensures non-negative', () => {
    expect(clampArea(-1)).toBe(0)
    expect(clampArea(0)).toBe(0)
    expect(clampArea(10.5)).toBe(10.5)
  })
})
