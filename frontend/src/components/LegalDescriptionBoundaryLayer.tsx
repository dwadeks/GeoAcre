import type { LegalDescriptionInterpretResponse } from '../models/LegalDescriptionInterpretResponse'

type LegalDescriptionBoundaryLayerProps = {
  result: LegalDescriptionInterpretResponse | null
}

export default function LegalDescriptionBoundaryLayer({
  result,
}: LegalDescriptionBoundaryLayerProps) {
  if (!result?.boundary) {
    return (
      <section className="card" aria-label="Legal description map overlay">
        <div className="card-header">Interpreted Boundary</div>
        <div className="card-body">
          <p className="text-muted">No interpreted boundary available yet.</p>
        </div>
      </section>
    )
  }

  const { boundary } = result

  return (
    <section className="card" aria-label="Legal description map overlay">
      <div className="card-header">Interpreted Boundary</div>
      <div className="card-body">
        <p>
          <strong>Read-only:</strong> {boundary.isReadOnly ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Provenance:</strong> {boundary.provenance}
        </p>
        <p>
          <strong>Vertices:</strong> {boundary.vertices.length}
        </p>
        <p>
          <strong>Area:</strong> {boundary.areaSquareMeters.toFixed(2)} square meters
        </p>
        <p>
          <strong>Perimeter:</strong> {boundary.perimeterMeters.toFixed(2)} meters
        </p>
      </div>
    </section>
  )
}
