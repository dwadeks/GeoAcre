import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import LocationSearch from '../LocationSearch'

vi.mock('../../services/geocodingService', () => ({
  searchAddress: vi.fn(),
  reverseGeocode: vi.fn(),
}))

import * as geocodingService from '../../services/geocodingService'

/** Helper: open the location search modal */
function openModal() {
  fireEvent.click(screen.getByRole('button', { name: /go to location/i }))
}

describe('LocationSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('accepts input text and submits address search query', async () => {
    vi.mocked(geocodingService.searchAddress).mockResolvedValue([])
    const onLocationSelect = vi.fn()

    render(<LocationSearch onLocationSelect={onLocationSelect} />)
    openModal()

    const input = screen.getByLabelText(/^address$/i)
    fireEvent.change(input, { target: { value: 'Springfield, IL' } })
    fireEvent.click(screen.getByRole('button', { name: /search address/i }))

    await waitFor(() => {
      expect(geocodingService.searchAddress).toHaveBeenCalledWith('Springfield, IL', 5)
    })
    expect(onLocationSelect).not.toHaveBeenCalled()
  })

  it('shows results and selecting one triggers map navigation callback', async () => {
    vi.mocked(geocodingService.searchAddress).mockResolvedValue([
      {
        id: '1',
        displayName: '123 Main St, Springfield, IL',
        latitude: 39.7817,
        longitude: -89.6501,
      },
    ])

    const onLocationSelect = vi.fn()
    render(<LocationSearch onLocationSelect={onLocationSelect} />)
    openModal()

    fireEvent.change(screen.getByLabelText(/^address$/i), {
      target: { value: '123 Main St, Springfield, IL' },
    })
    fireEvent.click(screen.getByRole('button', { name: /search address/i }))

    const resultButton = await screen.findByRole('button', {
      name: /123 main st, springfield, il/i,
    })
    fireEvent.click(resultButton)

    expect(onLocationSelect).toHaveBeenCalledWith(39.7817, -89.6501, '123 Main St, Springfield, IL')
  })

  it('accepts separate lat and lon coordinates and navigates', async () => {
    const onLocationSelect = vi.fn()
    render(<LocationSearch onLocationSelect={onLocationSelect} />)
    openModal()

    fireEvent.change(screen.getByLabelText(/^latitude$/i), {
      target: { value: '39.7817' },
    })
    fireEvent.change(screen.getByLabelText(/^longitude$/i), {
      target: { value: '-89.6501' },
    })
    fireEvent.click(screen.getByRole('button', { name: /go to coordinates/i }))

    await waitFor(() => {
      expect(onLocationSelect).toHaveBeenCalledWith(39.7817, -89.6501, '39.7817, -89.6501')
    })
  })
})