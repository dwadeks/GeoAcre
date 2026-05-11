import type { FC } from 'react'

interface SelfIntersectionWarningProps {
  message?: string
}

const SelfIntersectionWarning: FC<SelfIntersectionWarningProps> = ({
  message = 'Polygon has self-intersections. Area uses even-odd rule and may differ from expected boundary fill.',
}) => {
  return (
    <div className="alert alert-warning" role="alert" style={{ marginBottom: '0.75rem' }}>
      <strong>Intersection Warning:</strong> {message}
    </div>
  )
}

export default SelfIntersectionWarning