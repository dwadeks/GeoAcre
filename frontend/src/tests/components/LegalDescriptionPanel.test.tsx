import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LegalDescriptionPanel from '../../components/LegalDescriptionPanel'

describe('LegalDescriptionPanel', () => {
  it('submits pasted text request', async () => {
    const user = userEvent.setup()
    const submitSpy = vi.fn().mockResolvedValue(undefined)

    render(<LegalDescriptionPanel onSubmit={submitSpy} />)

    await user.type(
      screen.getByLabelText(/paste legal description text/i),
      'Tract II beginning at the northwest corner...'
    )

    await user.click(screen.getByRole('button', { name: /interpret legal description/i }))

    expect(submitSpy).toHaveBeenCalledTimes(1)
    expect(submitSpy).toHaveBeenCalledWith({
      source: {
        type: 'PastedText',
        text: 'Tract II beginning at the northwest corner...',
      },
    })
  })

  it('submits uploaded image request', async () => {
    const user = userEvent.setup()
    const submitSpy = vi.fn().mockResolvedValue(undefined)

    render(<LegalDescriptionPanel onSubmit={submitSpy} />)

    const file = new File(['sample image content'], 'tract-ii-sample.svg', {
      type: 'image/svg+xml',
    })

    await user.upload(screen.getByLabelText(/upload legal description image/i), file)
    await user.click(screen.getByRole('button', { name: /interpret legal description/i }))

    expect(submitSpy).toHaveBeenCalledTimes(1)
    const call = submitSpy.mock.calls[0][0]
    expect(call.source.type).toBe('UploadedImage')
    expect(call.source.fileName).toBe('tract-ii-sample.svg')
    expect(call.source.contentType).toBe('image/svg+xml')
    expect(call.source.base64Content).toBeTruthy()
  })

  it('shows validation error when text and image are both provided', async () => {
    const user = userEvent.setup()
    const submitSpy = vi.fn().mockResolvedValue(undefined)

    render(<LegalDescriptionPanel onSubmit={submitSpy} />)

    await user.type(screen.getByLabelText(/paste legal description text/i), 'Tract IV...')
    const file = new File(['sample image content'], 'tract-iv-sample.svg', {
      type: 'image/svg+xml',
    })
    await user.upload(screen.getByLabelText(/upload legal description image/i), file)
    await user.click(screen.getByRole('button', { name: /interpret legal description/i }))

    expect(
      screen.getByText(/provide exactly one source: pasted text or an uploaded image/i)
    ).toBeInTheDocument()
    expect(submitSpy).not.toHaveBeenCalled()
  })
})
