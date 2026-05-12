export interface CalculateAreaResponse {
  areaSquareMeters: number
  netAreaSquareMeters: number
  excludedAreaSquareMeters: number
  perSideLengthsMeters: number[]
  hasIntersections: boolean
}
