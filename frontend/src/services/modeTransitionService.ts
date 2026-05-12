import type { AppMode } from '../models/AppMode'

export type ModeTransitionContext = {
  currentMode: AppMode
  nextMode: AppMode
  hasInProgressWork: boolean
}

export function shouldConfirmModeTransition(context: ModeTransitionContext): boolean {
  return (
    context.currentMode !== context.nextMode &&
    context.hasInProgressWork
  )
}

export function resolveModeTransition(
  context: ModeTransitionContext,
  isConfirmed: boolean
): AppMode {
  if (context.currentMode === context.nextMode) {
    return context.currentMode
  }

  if (shouldConfirmModeTransition(context) && !isConfirmed) {
    return context.currentMode
  }

  return context.nextMode
}
