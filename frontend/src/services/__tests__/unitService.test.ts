import { describe, expect, it } from 'vitest'
import { convertArea, convertDistance } from '../unitService'

describe('unitService', () => {
  it('converts area between supported units', () => {
    expect(convertArea(4046.8564224, 'sqm', 'acres')).toBeCloseTo(1, 6)
    expect(convertArea(1, 'acres', 'sqft')).toBeCloseTo(43560, 0)
    expect(convertArea(10000, 'sqm', 'hectares')).toBeCloseTo(1, 6)
  })

  it('round-trips area conversion within tolerance', () => {
    const original = 1234.567
    const acres = convertArea(original, 'sqm', 'acres')
    const recovered = convertArea(acres, 'acres', 'sqm')
    expect(recovered).toBeCloseTo(original, 6)
  })

  it('converts distance between supported units', () => {
    expect(convertDistance(1, 'meters', 'feet')).toBeCloseTo(3.28084, 5)
    expect(convertDistance(1609.344, 'meters', 'miles')).toBeCloseTo(1, 6)
    expect(convertDistance(1000, 'meters', 'km')).toBeCloseTo(1, 6)
  })

  it('round-trips distance conversion within tolerance', () => {
    const original = 4321.123
    const miles = convertDistance(original, 'meters', 'miles')
    const recovered = convertDistance(miles, 'miles', 'meters')
    expect(recovered).toBeCloseTo(original, 6)
  })
})