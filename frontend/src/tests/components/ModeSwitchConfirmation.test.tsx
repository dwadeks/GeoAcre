import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../../App'

describe('Mode switch confirmation', () => {
  it('requires explicit confirmation when switching with in-progress work', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Legal Description' }))
    await user.type(screen.getByLabelText(/paste legal description text/i), 'in-progress legal text')

    await user.click(screen.getByRole('button', { name: 'Draw Boundary' }))

    expect(screen.getByText(/switching modes will discard in-progress work/i)).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-content-legal')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(screen.getByTestId('sidebar-content-draw')).toBeInTheDocument()
  })
})
