export interface ApiErrorBody {
  detail?: string
  error?: string
  errors?: Record<string, string[]>
  title?: string
}
