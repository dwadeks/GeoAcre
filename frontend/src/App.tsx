import { FC, useState } from 'react'
import ConfirmationDialog from './components/ConfirmationDialog'
import LegalDescriptionBoundaryLayer from './components/LegalDescriptionBoundaryLayer'
import LegalDescriptionPanel from './components/LegalDescriptionPanel'
import ModeSelector from './components/ModeSelector'
import Sidebar from './components/Sidebar'
import type { AppMode } from './models/AppMode'
import type { LegalDescriptionInterpretRequest } from './models/LegalDescriptionInterpretRequest'
import { resolveModeTransition, shouldConfirmModeTransition } from './services/modeTransitionService'
import {
  createInitialLegalDescriptionWorkflowState,
  submitLegalDescriptionRequest,
} from './services/legalDescriptionState'

const App: FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>('DrawBoundary')
  const [pendingMode, setPendingMode] = useState<AppMode | null>(null)
  const [isModeSwitchOpen, setIsModeSwitchOpen] = useState(false)
  const [hasInProgressWork, setHasInProgressWork] = useState(false)
  const [state, setState] = useState(createInitialLegalDescriptionWorkflowState())

  const handleLegalDescriptionSubmit = async (request: LegalDescriptionInterpretRequest) => {
    setState((prev) => ({
      ...prev,
      status: 'submitting',
      errorMessage: null,
    }))

    const nextState = await submitLegalDescriptionRequest(request)
    setState(nextState)
    setHasInProgressWork(false)
  }

  const handleModeSelect = (nextMode: AppMode) => {
    if (
      shouldConfirmModeTransition({
        currentMode: activeMode,
        nextMode,
        hasInProgressWork,
      })
    ) {
      setPendingMode(nextMode)
      setIsModeSwitchOpen(true)
      return
    }

    setActiveMode(nextMode)
  }

  const handleModeConfirm = () => {
    if (!pendingMode) {
      setIsModeSwitchOpen(false)
      return
    }

    const nextMode = resolveModeTransition(
      {
        currentMode: activeMode,
        nextMode: pendingMode,
        hasInProgressWork,
      },
      true
    )
    setActiveMode(nextMode)
    setPendingMode(null)
    setHasInProgressWork(false)
    setIsModeSwitchOpen(false)
  }

  const handleModeCancel = () => {
    setPendingMode(null)
    setIsModeSwitchOpen(false)
  }

  return (
    <div className="app">
      <header>
        <h1>Land Area Estimator</h1>
      </header>
      <main>
        <ModeSelector activeMode={activeMode} onModeSelect={handleModeSelect} />

        <Sidebar
          activeMode={activeMode}
          legalModeContent={
            <>
              <LegalDescriptionPanel
                onSubmit={handleLegalDescriptionSubmit}
                isSubmitting={state.status === 'submitting'}
                errorMessage={state.errorMessage ?? undefined}
                onDirtyChange={setHasInProgressWork}
              />
              <LegalDescriptionBoundaryLayer result={state.result} />
            </>
          }
        />

        <ConfirmationDialog
          open={isModeSwitchOpen}
          title="Confirm Mode Switch"
          message="Switching modes will discard in-progress work. Continue?"
          onConfirm={handleModeConfirm}
          onCancel={handleModeCancel}
        />
      </main>
    </div>
  )
}

export default App
