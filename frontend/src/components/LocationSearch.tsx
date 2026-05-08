import { FC, FormEvent, useMemo, useState } from 'react'
import type { GeocodeResult } from '../models/index'
import * as geocodingService from '../services/geocodingService'

interface LocationSearchProps {
  onLocationSelect: (latitude: number, longitude: number, label?: string) => void
}

function parseCoordinates(input: string): { latitude: number; longitude: number } | null {
  const match = input.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/)
  if (!match) return null

  const latitude = Number(match[1])
  const longitude = Number(match[2])

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null

  return { latitude, longitude }
}

const LocationSearch: FC<LocationSearchProps> = ({ onLocationSelect }) => {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<GeocodeResult[]>([])

  const hasResults = useMemo(() => results.length > 0, [results])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      return
    }

    const parsed = parseCoordinates(trimmed)
    if (parsed) {
      onLocationSelect(parsed.latitude, parsed.longitude, `${parsed.latitude}, ${parsed.longitude}`)
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

  const handleResultClick = (result: GeocodeResult) => {
    onLocationSelect(result.latitude, result.longitude, result.displayName)
    setResults([])
    setQuery(result.displayName)
  }

  return (
    <div className="card">
      <div className="card-header">Location Search</div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Address or lat,lon"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Location query"
          />
          <button className="btn-primary btn-block" type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className="alert alert-danger mt-2">{error}</p>}

        {hasResults && (
          <ul className="mt-2" aria-label="Search results" style={{ listStyle: 'none', padding: 0 }}>
            {results.map((result) => (
              <li key={result.id} style={{ marginBottom: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary btn-block"
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
  )
}

export default LocationSearch