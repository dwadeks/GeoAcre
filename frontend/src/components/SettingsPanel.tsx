/**
 * SettingsPanel - Gear icon button that opens a modal with app settings (units, etc.)
 */

import { FC, useState } from 'react'
import type { UnitPreference } from '../models/GeoTypes'

interface SettingsPanelProps {
  unitPreference: UnitPreference
  onUnitPreferenceChange: (preference: UnitPreference) => void
}

const SettingsPanel: FC<SettingsPanelProps> = ({ unitPreference, onUnitPreferenceChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleAreaUnit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUnitPreferenceChange({
      ...unitPreference,
      areaUnit: e.target.value as 'acres' | 'hectares' | 'sqft' | 'sqm',
    })
  }

  const handleDistanceUnit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUnitPreferenceChange({
      ...unitPreference,
      distanceUnit: e.target.value as 'feet' | 'meters' | 'miles' | 'km',
    })
  }

  return (
    <>
      <button
        type="button"
        className="btn-secondary btn-sm"
        onClick={() => setIsOpen(true)}
        title="Settings"
        aria-label="Open settings"
        style={{ padding: '0.4rem 0.6rem', fontSize: '1rem', lineHeight: 1 }}
      >
        ⚙️
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false) }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              padding: '1.5rem',
              width: '340px',
              maxWidth: '95vw',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <strong style={{ fontSize: '1rem' }}>⚙️ Settings</strong>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', padding: '0 0.25rem', color: '#666' }}
                title="Close"
                aria-label="Close settings"
              >
                ×
              </button>
            </div>

            {/* Units */}
            <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
              Measurement Units
            </p>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.875rem' }}>Area</span>
              <select value={unitPreference.areaUnit} onChange={handleAreaUnit}>
                <option value="acres">Acres (ac)</option>
                <option value="hectares">Hectares (ha)</option>
                <option value="sqft">Square Feet (ft²)</option>
                <option value="sqm">Square Meters (m²)</option>
              </select>
            </label>

            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.875rem' }}>Distance</span>
              <select value={unitPreference.distanceUnit} onChange={handleDistanceUnit}>
                <option value="feet">Feet (ft)</option>
                <option value="meters">Meters (m)</option>
                <option value="miles">Miles (mi)</option>
                <option value="km">Kilometers (km)</option>
              </select>
            </label>
          </div>
        </div>
      )}
    </>
  )
}

export default SettingsPanel
