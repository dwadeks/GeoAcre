/**
 * dragService.ts - Service for handling vertex dragging during polygon editing
 * Provides functions to manage drag state and update vertex positions in real-time
 */

import type { GeoPoint } from '../models/GeoTypes'

/**
 * Represents the state of an active vertex drag operation
 */
export type DragState = {
  /** Index of the vertex being dragged */
  vertexIndex: number
  /** Original position of the vertex before drag started */
  startLatLng: GeoPoint
  /** Current vertices array (immutable reference) */
  currentVertices: GeoPoint[]
}

/**
 * Initializes a drag operation on a vertex
 * @param vertexIndex - Index of the vertex to drag
 * @param vertices - Array of all polygon vertices
 * @returns DragState object tracking the drag operation
 */
export function startDrag(vertexIndex: number, vertices: GeoPoint[]): DragState {
  return {
    vertexIndex,
    startLatLng: vertices[vertexIndex],
    currentVertices: vertices,
  }
}

/**
 * Updates the position of a dragged vertex
 * Returns a new vertices array with the updated position (immutable)
 * @param dragState - Current drag state
 * @param newLatLng - New position for the dragged vertex
 * @returns New vertices array with updated position
 */
export function updateVertexPosition(dragState: DragState, newLatLng: GeoPoint): GeoPoint[] {
  const { vertexIndex, currentVertices } = dragState

  // Create new array with updated vertex (immutable update)
  return currentVertices.map((vertex, index) =>
    index === vertexIndex ? newLatLng : vertex
  )
}

/**
 * Finalizes a drag operation
 * Currently a no-op but reserved for future cleanup/event logging
 * @param dragState - Drag state to finalize
 */
export function endDrag(dragState: DragState): void {
  // Placeholder for potential cleanup or event tracking
  // Current implementation: drag state is discarded and UI updates via parent callback
}
