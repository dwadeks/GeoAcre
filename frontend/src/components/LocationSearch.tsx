import { FC, FormEvent, useMemo, useState } from 'react'
import type { GeocodeResult } from '../models/index'
import * as geocodingService from '../services/geocodingService'

interface LocationSearchProps {
  onLocationSelect: (latitude: number, longitude: number, label?: string) => void
}

const LocationSearch: FC<LocationSearchProps> = ({ onLocationSelect }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [address, setAddress] = useState('')
  const [latInput, setLatInput] = useState('')
  const [lonInput, setLonInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<GeocodeResult[]>([])

  const hasResults = useMemo(() => results.length > 0, [results])

  const handleClose = () => {
    setIsOpen(false)
    setError(null)
    setResults([])
  }

  const handleAddressSearch = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = address.trim()
    if (!trimmed) {
      setResults([])
      return
    }

    try {
      setIsLoading(true)
      const found = await geocodingService.searchAddress(trimmed, 5)
      setResults(found)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCoordSearch = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const lat = Number(latInput.trim())
    const lon = Number(lonInput.trim())

    if (Number.isNaN(lat) || Number.isNaN(lon) || latInput.trim() === '' || lonInput.trim() === '') {
      setError('Enter valid numbers for both latitude and longitude.')
      return
    }
    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90.')
      return
    }
    if (lon < -180 || lon > 180) {
      setError('Longitude must be between -180 and 180.')
      return
    }

    onLocationSelect(lat, lon, `${lat}, ${lon}`)
    handleClose()
  }

  const handleResultClick = (result: GeocodeResult) => {
    onLocationSelect(result.latitude, result.longitude, result.displayName)
    handleClose()
  }

  return (
    <>
      <button
        type="button"
        className="btn-secondary btn-sm btn-block"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Search for a location"
      >
        📍 Go to Location
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
          onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              padding: '1.5rem',
              width: '380px',
              maxWidth: '95vw',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <strong style={{ fontSize: '1rem' }}>📍 Go to Location</strong>
              <button
                type="button"
                onClick={handleClose}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', padding: '0 0.25rem', color: '#666' }}
                title="Close"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Address search */}
            <form onSubmit={handleAddressSearch} style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                Address
              </label>
              <input
                type="text"
                placeholder="e.g. 123 Main St, Springfield"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                aria-label="Address"
                style={{ marginBottom: '0.5rem' }}
              />
              <button className="btn-primary btn-sm btn-block" type="submit" disabled={isLoading}>
                {isLoading ? 'Searching…' : '🔍 Search Address'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
              <span style={{ color: '#999', fontSize: '0.8rem' }}>or enter coordinates</span>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
            </div>

            {/* Coordinate search */}
            <form onSubmit={handleCoordSearch}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <label>
                  <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.875rem' }}>Latitude</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 40.7128"
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    aria-label="Latitude"
                  />
                </label>
                <label>
                  <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.875rem' }}>Longitude</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. -74.0060"
                    value={lonInput}
                    onChange={(e) => setLonInput(e.target.value)}
                    aria-label="Longitude"
                  />
                </label>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.75rem' }}>
                Format: decimal degrees — e.g. <code>40.7128, -74.0060</code>
              </p>
              <button className="btn-success btn-sm btn-block" type="submit">
                📌 Go to Coordinates
              </button>
            </form>

            {error && (
              <p style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.75rem', marginBottom: 0 }}>
                {error}
              </p>
            )}

            {hasResults && (
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', marginBottom: 0 }} aria-label="Search results">
                {results.map((result) => (
                  <li key={result.id} style={{ marginBottom: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn-secondary btn-sm btn-block"
                      onClick={() => handleResultClick(result)}
                    >
                      {result.displayName}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default LocationSearch