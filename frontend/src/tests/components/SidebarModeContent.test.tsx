import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../../App'

describe('Sidebar mode content', () => {
  it('renders only active mode content in sidebar', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByTestId('sidebar-content-draw')).toBeInTheDocument()
    expect(screen.queryByTestId('sidebar-content-legal')).not.toBeInTheDocument()
    expect(screen.queryByTestId('sidebar-content-measure')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Legal Description' }))

    expect(screen.queryByTestId('sidebar-content-draw')).not.toBeInTheDocument()
    expect(screen.getByTestId('sidebar-content-legal')).toBeInTheDocument()
    expect(screen.queryByTestId('sidebar-content-measure')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Measure Distance' }))

    expect(screen.queryByTestId('sidebar-content-draw')).not.toBeInTheDocument()
    expect(screen.queryByTestId('sidebar-content-legal')).not.toBeInTheDocument()
    expect(screen.getByTestId('sidebar-content-measure')).toBeInTheDocument()
  })
})
