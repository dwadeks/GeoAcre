/**
 * UnitSelector - Dropdown selectors for area and distance units
 */

import { FC } from 'react'
import type { UnitPreference } from '../models/GeoTypes'

interface UnitSelectorProps {
  unitPreference: UnitPreference
  onUnitPreferenceChange: (preference: UnitPreference) => void
}

const UnitSelector: FC<UnitSelectorProps> = ({
  unitPreference,
  onUnitPreferenceChange,
}) => {
  const handleAreaUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUnitPreferenceChange({
      ...unitPreference,
      areaUnit: e.target.value as 'acres' | 'hectares' | 'sqft' | 'sqm',
    })
  }

  const handleDistanceUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUnitPreferenceChange({
      ...unitPreference,
      distanceUnit: e.target.value as 'feet' | 'meters' | 'miles' | 'km',
    })
  }

  return (
    <div className="card">
      <div className="card-header">Measurement Units</div>

      <div className="card-body">
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Area Unit</strong>
          <select value={unitPreference.areaUnit} onChange={handleAreaUnitChange}>
            <option value="acres">📍 Acres (ac)</option>
            <option value="hectares">📍 Hectares (ha)</option>
            <option value="sqft">📍 Square Feet (ft²)</option>
            <option value="sqm">📍 Square Meters (m²)</option>
          </select>
        </label>

        <label style={{ display: 'block' }}>
          <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Distance Unit</strong>
          <select value={unitPreference.distanceUnit} onChange={handleDistanceUnitChange}>
            <option value="feet">📏 Feet (ft)</option>
            <option value="meters">📏 Meters (m)</option>
            <option value="miles">📏 Miles (mi)</option>
            <option value="km">📏 Kilometers (km)</option>
          </select>
        </label>
      </div>
    </div>
  )
}

export default UnitSelector
