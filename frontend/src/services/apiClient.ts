/**
 * API Client - Fetch wrapper for backend API calls
 * Provides typed HTTP methods for communicating with the backend API
 */

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api'

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
        message: err instanceof Error ? err.message : 'Network error',
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
