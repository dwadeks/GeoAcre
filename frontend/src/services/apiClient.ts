/**
 * API Client - Fetch wrapper for backend API calls
 * Provides typed HTTP methods for communicating with the backend API
 */

import { API_BASE_URL } from './config'

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

interface ApiResponse<T> {
  data?: T
  error?: {
    status: number
    title?: string
    message?: string
    details?: string
  }
}

function getFriendlyMessage(status: number, fallback?: string): string {
  switch (status) {
    case 400:
      return fallback || 'The request was invalid. Please verify your input and try again.'
    case 429:
      return 'Too many requests. Please wait a moment and retry.'
    case 500:
      return 'Server error. Please try again in a few moments.'
    case 503:
      return 'Service temporarily unavailable. Please retry shortly.'
    case 0:
      return fallback || 'Network error. Check your connection and try again.'
    default:
      return fallback || 'Request failed. Please try again.'
  }
}

/**
 * Make a typed API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { status: response.status, message: response.statusText }
      }

      return {
        error: {
          status: response.status,
          message: getFriendlyMessage(response.status, errorData?.message ?? response.statusText),
          ...errorData,
        },
      }
    }

    const data = await response.json()
    return { data }
  } catch (err) {
    return {
      error: {
        status: 0,
        message: getFriendlyMessage(0, err instanceof Error ? err.message : undefined),
      },
    }
  }
}

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'GET' })
}

/**
 * POST request
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'DELETE' })
}

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
}
