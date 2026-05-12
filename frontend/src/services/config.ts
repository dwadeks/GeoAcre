const DEFAULT_API_BASE_URL = 'http://localhost:5000/api'

export const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL

export const LEGAL_DESCRIPTION_ENDPOINTS = {
  interpret: '/legal-description/interpret',
  export: '/export',
} as const

export const LEGAL_DESCRIPTION_API_CONFIG = {
  requestTimeoutMs: 30000,
} as const