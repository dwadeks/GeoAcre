import { apiPost } from './apiClient'
import type {
  GeocodeResult,
  GeocodeSearchResponse,
  ReverseGeocodeResponse,
} from '../models/index'

export async function searchAddress(
  query: string,
  maxResults: number = 5
): Promise<GeocodeResult[]> {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    throw new Error('Query cannot be empty')
  }

  const response = await apiPost<GeocodeSearchResponse>('/geocoding/search', {
    query: trimmedQuery,
    maxResults,
  })

  if (response.error) {
    throw new Error(response.error.message || 'Failed to search address')
  }

  return response.data?.results ?? []
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string> {
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error('Invalid coordinates')
  }

  const response = await apiPost<ReverseGeocodeResponse>('/geocoding/reverse', {
    latitude,
    longitude,
  })

  if (response.error) {
    throw new Error(response.error.message || 'Failed to reverse geocode')
  }

  return response.data?.address ?? `${latitude}, ${longitude}`
}

export default {
  searchAddress,
  reverseGeocode,
}