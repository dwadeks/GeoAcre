import type { AppMode } from '../models/AppMode'

type ModeSelectorProps = {
  activeMode: AppMode
  onModeSelect: (mode: AppMode) => void
}

const modeOptions: Array<{ mode: AppMode; label: string }> = [
  { mode: 'DrawBoundary', label: 'Draw Boundary' },
  { mode: 'LegalDescription', label: 'Legal Description' },
  { mode: 'MeasureDistance', label: 'Measure Distance' },
]

export default function ModeSelector({ activeMode, onModeSelect }: ModeSelectorProps) {
  return (
    <nav aria-label="Mode selector" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
      {modeOptions.map((option) => (
        <button
          key={option.mode}
          type="button"
          className="btn-secondary btn-sm"
          aria-pressed={activeMode === option.mode}
          onClick={() => onModeSelect(option.mode)}
        >
          {option.label}
        </button>
      ))}
    </nav>
  )
}
