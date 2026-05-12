import { FC, useState } from 'react'
import LegalDescriptionBoundaryLayer from './components/LegalDescriptionBoundaryLayer'
import LegalDescriptionPanel from './components/LegalDescriptionPanel'
import type { LegalDescriptionInterpretRequest } from './models/LegalDescriptionInterpretRequest'
import {
  createInitialLegalDescriptionWorkflowState,
  submitLegalDescriptionRequest,
} from './services/legalDescriptionState'

const App: FC = () => {
  const [state, setState] = useState(createInitialLegalDescriptionWorkflowState())

  const handleLegalDescriptionSubmit = async (request: LegalDescriptionInterpretRequest) => {
    setState((prev) => ({
      ...prev,
      status: 'submitting',
      errorMessage: null,
    }))

    const nextState = await submitLegalDescriptionRequest(request)
    setState(nextState)
  }

  return (
    <div className="app">
      <header>
        <h1>Land Area Estimator</h1>
      </header>
      <main>
        <LegalDescriptionPanel
          onSubmit={handleLegalDescriptionSubmit}
          isSubmitting={state.status === 'submitting'}
          errorMessage={state.errorMessage ?? undefined}
        />
        <LegalDescriptionBoundaryLayer result={state.result} />
      </main>
    </div>
  )
}

export default App
