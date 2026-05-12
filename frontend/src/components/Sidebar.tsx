import type { ReactNode } from 'react'
import type { AppMode } from '../models/AppMode'

type SidebarProps = {
  activeMode: AppMode
  legalModeContent?: ReactNode
}

export default function Sidebar({ activeMode, legalModeContent }: SidebarProps) {
  if (activeMode === 'DrawBoundary') {
    return (
      <aside className="card" data-testid="sidebar-content-draw">
        <div className="card-header">Draw Boundary</div>
        <div className="card-body">
          <p>Draw mode controls are active.</p>
        </div>
      </aside>
    )
  }

  if (activeMode === 'MeasureDistance') {
    return (
      <aside className="card" data-testid="sidebar-content-measure">
        <div className="card-header">Measure Distance</div>
        <div className="card-body">
          <p>Distance measurement controls are active.</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="card" data-testid="sidebar-content-legal">
      <div className="card-header">Legal Description</div>
      <div className="card-body">{legalModeContent}</div>
    </aside>
  )
}
