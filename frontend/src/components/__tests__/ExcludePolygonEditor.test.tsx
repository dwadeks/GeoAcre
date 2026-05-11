import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ExcludePolygonEditor from '../ExcludePolygonEditor'

const baseProps = {
  isExcludeMode: false,
  onToggleExcludeMode: vi.fn(),
  excludePolygons: [],
  onDeleteExcludePolygon: vi.fn(),
  primaryAreaSquareMeters: 1000,
  netAreaSquareMeters: 900,
  unitPreference: {
    areaUnit: 'acres' as const,
    distanceUnit: 'feet' as const,
  },
}

describe('ExcludePolygonEditor', () => {
  it('button toggles add exclude mode', () => {
    render(<ExcludePolygonEditor {...baseProps} />)

    fireEvent.click(screen.getByRole('button', { name: /add exclude mode/i }))

    expect(baseProps.onToggleExcludeMode).toHaveBeenCalledTimes(1)
  })

  it('displays exclude polygon list and delete buttons', () => {
    render(
      <ExcludePolygonEditor
        {...baseProps}
        excludePolygons={[
          {
            id: 'ex-1',
            vertices: [],
            isExcludePolygon: true,
            isValid: true,
            hasIntersections: false,
            computedAreaSquareMeters: 100,
            computedPerimeterMeters: 40,
            perSideLengthsMeters: [10, 10, 10, 10],
          },
        ]}
      />
    )

    expect(screen.getByText(/exclude polygon 1/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(baseProps.onDeleteExcludePolygon).toHaveBeenCalledWith('ex-1')
  })

  it('shows primary, excluded, and net area values', () => {
    render(<ExcludePolygonEditor {...baseProps} />)

    expect(screen.getByText(/primary area/i)).toBeInTheDocument()
    expect(screen.getByText(/total excluded area/i)).toBeInTheDocument()
    expect(screen.getByText(/net area/i)).toBeInTheDocument()
  })
})
