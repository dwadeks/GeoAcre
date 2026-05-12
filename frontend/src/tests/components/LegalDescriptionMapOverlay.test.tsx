import { render, screen } from '@testing-library/react'
import LegalDescriptionBoundaryLayer from '../../components/LegalDescriptionBoundaryLayer'
import type { LegalDescriptionInterpretResponse } from '../../models/LegalDescriptionInterpretResponse'

describe('LegalDescriptionBoundaryLayer', () => {
  it('renders read-only interpreted boundary details', () => {
    const result: LegalDescriptionInterpretResponse = {
      mode: 'LegalDescription',
      schemaVersion: '2.0.0',
      interpretation: {
        status: 'Succeeded',
        confidence: 0.9,
        diagnostics: [],
      },
      boundary: {
        provenance: 'LegalInterpretation',
        isReadOnly: true,
        vertices: [
          { latitude: 37.0, longitude: -94.0 },
          { latitude: 37.0, longitude: -94.005 },
          { latitude: 37.005, longitude: -94.005 },
        ],
        areaSquareMeters: 1234.5,
        perimeterMeters: 456.7,
        hasSelfIntersection: false,
      },
    }

    render(<LegalDescriptionBoundaryLayer result={result} />)

    expect(screen.getByText(/read-only:/i)).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText(/provenance:/i)).toBeInTheDocument()
    expect(screen.getByText('LegalInterpretation')).toBeInTheDocument()
  })

  it('renders empty state when no boundary exists', () => {
    render(<LegalDescriptionBoundaryLayer result={null} />)

    expect(screen.getByText(/no interpreted boundary available yet/i)).toBeInTheDocument()
  })
})
