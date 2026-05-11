import { describe, expect, it, vi, beforeEach } from 'vitest'
import { reverseGeocode, searchAddress } from '../geocodingService'

vi.mock('../apiClient', () => ({
  apiPost: vi.fn(),
}))

import { apiPost } from '../apiClient'

describe('geocodingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('searchAddress(query) calls backend and returns results array', async () => {
    const mockedApiPost = vi.mocked(apiPost)
    mockedApiPost.mockResolvedValue({
      data: {
        results: [
          {
            id: '1',
            displayName: 'Springfield, IL, USA',
            latitude: 39.7817,
            longitude: -89.6501,
          },
        ],
      },
    })

    const results = await searchAddress('Springfield, IL', 5)

    expect(apiPost).toHaveBeenCalledWith('/geocoding/search', {
      query: 'Springfield, IL',
      maxResults: 5,
    })
    expect(results).toHaveLength(1)
    expect(results[0].displayName).toContain('Springfield')
  })

  it('reverseGeocode(lat, lon) calls backend and returns address string', async () => {
    const mockedApiPost = vi.mocked(apiPost)
    mockedApiPost.mockResolvedValue({
      data: {
        address: 'Springfield, IL, USA',
        latitude: 39.7817,
        longitude: -89.6501,
      },
    })

    const address = await reverseGeocode(39.7817, -89.6501)

    expect(apiPost).toHaveBeenCalledWith('/geocoding/reverse', {
      latitude: 39.7817,
      longitude: -89.6501,
    })
    expect(address).toBe('Springfield, IL, USA')
  })

  it('throws on network/service failure', async () => {
    const mockedApiPost = vi.mocked(apiPost)
    mockedApiPost.mockResolvedValue({
      error: { status: 503, message: 'Service unavailable' },
    })

    await expect(searchAddress('Springfield')).rejects.toThrow('Service unavailable')
  })
})