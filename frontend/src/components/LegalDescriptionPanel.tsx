import { useState } from 'react'
import type { LegalDescriptionInterpretRequest } from '../models/LegalDescriptionInterpretRequest'

type LegalDescriptionPanelProps = {
  onSubmit: (request: LegalDescriptionInterpretRequest) => void | Promise<void>
  isSubmitting?: boolean
  errorMessage?: string
}

export default function LegalDescriptionPanel({
  onSubmit,
  isSubmitting = false,
  errorMessage,
}: LegalDescriptionPanelProps) {
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null
    setImageFile(nextFile)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedText = text.trim()
    const hasText = trimmedText.length > 0
    const hasImage = imageFile !== null

    if ((hasText && hasImage) || (!hasText && !hasImage)) {
      setValidationError('Provide exactly one source: pasted text or an uploaded image.')
      return
    }

    setValidationError(null)

    if (hasText) {
      await onSubmit({
        source: {
          type: 'PastedText',
          text: trimmedText,
        },
      })
      return
    }

    if (!imageFile) {
      setValidationError('An image file is required for image submission.')
      return
    }

    const base64Content = await readFileAsBase64(imageFile)

    await onSubmit({
      source: {
        type: 'UploadedImage',
        fileName: imageFile.name,
        contentType: imageFile.type || 'application/octet-stream',
        base64Content,
      },
    })
  }

  return (
    <section className="card" aria-label="Legal description input panel">
      <div className="card-header">Legal Description</div>
      <div className="card-body">
        <form onSubmit={(event) => void handleSubmit(event)}>
          <label htmlFor="legal-description-text">Paste legal description text</label>
          <textarea
            id="legal-description-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={6}
            placeholder="Paste tract legal description text..."
            style={{ width: '100%', marginTop: '0.5rem' }}
          />

          <div style={{ marginTop: '0.75rem' }}>
            <label htmlFor="legal-description-image">Or upload legal description image</label>
            <input
              id="legal-description-image"
              type="file"
              accept="image/*,.svg"
              onChange={handleFileChange}
              style={{ display: 'block', marginTop: '0.5rem' }}
            />
          </div>

          {validationError ? <p role="alert">{validationError}</p> : null}
          {errorMessage ? <p role="alert">{errorMessage}</p> : null}

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Interpret legal description'}
          </button>
        </form>
      </div>
    </section>
  )
}

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => {
      reject(new Error('Unable to read uploaded file.'))
    }

    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      const separatorIndex = dataUrl.indexOf(',')
      resolve(separatorIndex >= 0 ? dataUrl.slice(separatorIndex + 1) : '')
    }

    reader.readAsDataURL(file)
  })
}
