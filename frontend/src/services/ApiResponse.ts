export interface ApiResponse<T> {
  data?: T
  error?: {
    status: number
    title?: string
    message?: string
    details?: string
  }
}
