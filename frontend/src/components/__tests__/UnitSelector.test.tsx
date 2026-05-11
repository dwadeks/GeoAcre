import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import UnitSelector from '../UnitSelector'

describe('UnitSelector', () => {
  it('shows all supported area and distance units', () => {
    const onUnitPreferenceChange = vi.fn()

    render(
      <UnitSelector
        unitPreference={{ areaUnit: 'acres', distanceUnit: 'feet' }}
        onUnitPreferenceChange={onUnitPreferenceChange}
      />
    )

    expect(screen.getByRole('option', { name: /acres/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /hectares/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /square feet \(ft²\)/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /square meters/i })).toBeInTheDocument()

    expect(screen.getByRole('option', { name: /^📏 Feet \(ft\)$/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /^📏 Meters \(m\)$/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /miles/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /kilometers/i })).toBeInTheDocument()
  })

  it('emits updated values when unit selections change', () => {
    const onUnitPreferenceChange = vi.fn()

    render(
      <UnitSelector
        unitPreference={{ areaUnit: 'acres', distanceUnit: 'feet' }}
        onUnitPreferenceChange={onUnitPreferenceChange}
      />
    )

    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: 'sqft' } })
    fireEvent.change(selects[1], { target: { value: 'km' } })

    expect(onUnitPreferenceChange).toHaveBeenCalledWith({ areaUnit: 'sqft', distanceUnit: 'feet' })
    expect(onUnitPreferenceChange).toHaveBeenCalledWith({ areaUnit: 'acres', distanceUnit: 'km' })
  })

  it('uses acres and feet defaults from supplied state', () => {
    const onUnitPreferenceChange = vi.fn()

    render(
      <UnitSelector
        unitPreference={{ areaUnit: 'acres', distanceUnit: 'feet' }}
        onUnitPreferenceChange={onUnitPreferenceChange}
      />
    )

    const selects = screen.getAllByRole('combobox')
    expect(selects[0]).toHaveValue('acres')
    expect(selects[1]).toHaveValue('feet')
  })
})