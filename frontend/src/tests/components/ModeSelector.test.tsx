import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ModeSelector from '../../components/ModeSelector'

describe('ModeSelector', () => {
  it('renders modes in required order', () => {
    render(<ModeSelector activeMode="DrawBoundary" onModeSelect={vi.fn()} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveTextContent('Draw Boundary')
    expect(buttons[1]).toHaveTextContent('Legal Description')
    expect(buttons[2]).toHaveTextContent('Measure Distance')
  })

  it('shows only one active mode and emits selection', async () => {
    const user = userEvent.setup()
    const onModeSelect = vi.fn()

    render(<ModeSelector activeMode="LegalDescription" onModeSelect={onModeSelect} />)

    expect(screen.getByRole('button', { name: 'Legal Description' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Draw Boundary' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Measure Distance' })).toHaveAttribute('aria-pressed', 'false')

    await user.click(screen.getByRole('button', { name: 'Measure Distance' }))
    expect(onModeSelect).toHaveBeenCalledWith('MeasureDistance')
  })
})
