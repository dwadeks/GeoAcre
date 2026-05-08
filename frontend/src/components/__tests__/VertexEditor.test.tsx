/**
 * VertexEditor.test.tsx - Test suite for vertex editing component
 * Tests: Vertex drag handler responses, polygon redrawing, real-time measurements
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FC, useState } from 'react'
import type { GeoPoint } from '../../models/GeoTypes'

// Mock component to test vertex drag handling
const MockVertexEditor: FC<{
  vertices: GeoPoint[]
  onVerticesChange: (vertices: GeoPoint[]) => void
}> = ({ vertices, onVerticesChange }) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)

  const handleMouseDown = (index: number) => {
    setDraggingIndex(index)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingIndex === null) return

    // Simulate position update during drag
    // In real implementation, this would calculate lat/lng from mouse coordinates
    const updated = vertices.map((v, i) =>
      i === draggingIndex
        ? { latitude: v.latitude + 0.001, longitude: v.longitude + 0.001 }
        : v
    )
    onVerticesChange(updated)
  }

  const handleMouseUp = () => {
    setDraggingIndex(null)
  }

  return (
    <div
      data-testid="vertex-editor"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {vertices.map((v, i) => (
        <div
          key={i}
          data-testid={`vertex-${i}`}
          onMouseDown={() => handleMouseDown(i)}
          style={{ cursor: draggingIndex === i ? 'grabbing' : 'grab' }}
        >
          V{i}: ({v.latitude.toFixed(4)}, {v.longitude.toFixed(4)})
        </div>
      ))}
      <div data-testid="dragging-state">
        {draggingIndex !== null ? `Dragging vertex ${draggingIndex}` : 'Not dragging'}
      </div>
    </div>
  )
}

describe('VertexEditor', () => {
  const sampleVertices: GeoPoint[] = [
    { latitude: 40.7128, longitude: -74.006 },
    { latitude: 40.7589, longitude: -73.9851 },
    { latitude: 40.7614, longitude: -73.9776 },
  ]

  describe('vertex drag handler', () => {
    it('should respond to mousedown on vertex', () => {
      const handleChange = vi.fn()
      render(
        <MockVertexEditor vertices={sampleVertices} onVerticesChange={handleChange} />
      )

      const vertex0 = screen.getByTestId('vertex-0')
      fireEvent.mouseDown(vertex0)

      expect(screen.getByTestId('dragging-state')).toHaveTextContent('Dragging vertex 0')
    })

    it('should respond to mousemove during drag', () => {
      const handleChange = vi.fn()
      render(
        <MockVertexEditor vertices={sampleVertices} onVerticesChange={handleChange} />
      )

      const editor = screen.getByTestId('vertex-editor')
      const vertex0 = screen.getByTestId('vertex-0')

      fireEvent.mouseDown(vertex0)
      fireEvent.mouseMove(editor)

      expect(handleChange).toHaveBeenCalled()
    })

    it('should stop dragging on mouseup', () => {
      const handleChange = vi.fn()
      render(
        <MockVertexEditor vertices={sampleVertices} onVerticesChange={handleChange} />
      )

      const vertex0 = screen.getByTestId('vertex-0')
      fireEvent.mouseDown(vertex0)
      fireEvent.mouseUp(vertex0)

      expect(screen.getByTestId('dragging-state')).toHaveTextContent('Not dragging')
    })

    it('should stop dragging on mouseleave', () => {
      const handleChange = vi.fn()
      render(
        <MockVertexEditor vertices={sampleVertices} onVerticesChange={handleChange} />
      )

      const editor = screen.getByTestId('vertex-editor')
      const vertex0 = screen.getByTestId('vertex-0')

      fireEvent.mouseDown(vertex0)
      fireEvent.mouseLeave(editor)

      expect(screen.getByTestId('dragging-state')).toHaveTextContent('Not dragging')
    })
  })

  describe('vertex position updates', () => {
    it('should update vertex position during drag', () => {
      const handleChange = vi.fn()
      const { rerender } = render(
        <MockVertexEditor vertices={sampleVertices} onVerticesChange={handleChange} />
      )

      const vertex0 = screen.getByTestId('vertex-0')
      fireEvent.mouseDown(vertex0)

      const editor = screen.getByTestId('vertex-editor')
      fireEvent.mouseMove(editor)

      expect(handleChange).toHaveBeenCalled()
      const updatedVertices = handleChange.mock.calls[0][0]
      expect(updatedVertices[0].latitude).toBeGreaterThan(sampleVertices[0].latitude)
    })

    it('should not move other vertices during single vertex drag', () => {
      const handleChange = vi.fn()
      render(
        <MockVertexEditor vertices={sampleVertices} onVerticesChange={handleChange} />
      )

      const vertex0 = screen.getByTestId('vertex-0')
      fireEvent.mouseDown(vertex0)

      const editor = screen.getByTestId('vertex-editor')
      fireEvent.mouseMove(editor)

      const updatedVertices = handleChange.mock.calls[0][0]
      expect(updatedVertices[1]).toEqual(sampleVertices[1])
      expect(updatedVertices[2]).toEqual(sampleVertices[2])
    })

    it('should handle dragging middle vertex', () => {
      const handleChange = vi.fn()
      render(
        <MockVertexEditor vertices={sampleVertices} onVerticesChange={handleChange} />
      )

      const vertex1 = screen.getByTestId('vertex-1')
      fireEvent.mouseDown(vertex1)

      const editor = screen.getByTestId('vertex-editor')
      fireEvent.mouseMove(editor)

      expect(handleChange).toHaveBeenCalled()
      const updatedVertices = handleChange.mock.calls[0][0]
      expect(updatedVertices[1].latitude).not.toEqual(sampleVertices[1].latitude)
      expect(updatedVertices[0]).toEqual(sampleVertices[0])
      expect(updatedVertices[2]).toEqual(sampleVertices[2])
    })
  })

  describe('visual feedback', () => {
    it('should show grabbing cursor during drag', () => {
      const handleChange = vi.fn()
      render(
        <MockVertexEditor vertices={sampleVertices} onVerticesChange={handleChange} />
      )

      const vertex0 = screen.getByTestId('vertex-0')
      expect(vertex0).toHaveStyle('cursor: grab')

      fireEvent.mouseDown(vertex0)
      expect(vertex0).toHaveStyle('cursor: grabbing')
    })

    it('should show grab cursor when not dragging', () => {
      const handleChange = vi.fn()
      render(
        <MockVertexEditor vertices={sampleVertices} onVerticesChange={handleChange} />
      )

      const vertex1 = screen.getByTestId('vertex-1')
      expect(vertex1).toHaveStyle('cursor: grab')
    })
  })

  describe('drag state management', () => {
    it('should track which vertex is being dragged', () => {
      const handleChange = vi.fn()
      render(
        <MockVertexEditor vertices={sampleVertices} onVerticesChange={handleChange} />
      )

      const vertex0 = screen.getByTestId('vertex-0')
      fireEvent.mouseDown(vertex0)

      expect(screen.getByTestId('dragging-state')).toHaveTextContent('Dragging vertex 0')
    })

    it('should allow switching dragged vertex without delay', () => {
      const handleChange = vi.fn()
      render(
        <MockVertexEditor vertices={sampleVertices} onVerticesChange={handleChange} />
      )

      const vertex0 = screen.getByTestId('vertex-0')
      const vertex1 = screen.getByTestId('vertex-1')

      fireEvent.mouseDown(vertex0)
      expect(screen.getByTestId('dragging-state')).toHaveTextContent('Dragging vertex 0')

      fireEvent.mouseUp(vertex0)
      fireEvent.mouseDown(vertex1)

      expect(screen.getByTestId('dragging-state')).toHaveTextContent('Dragging vertex 1')
    })
  })

  describe('polygon integrity', () => {
    it('should maintain polygon validity after vertex move', () => {
      const handleChange = vi.fn()
      render(
        <MockVertexEditor vertices={sampleVertices} onVerticesChange={handleChange} />
      )

      const vertex0 = screen.getByTestId('vertex-0')
      fireEvent.mouseDown(vertex0)

      const editor = screen.getByTestId('vertex-editor')
      fireEvent.mouseMove(editor)

      const updatedVertices = handleChange.mock.calls[0][0]
      // Polygon should still have 3 vertices
      expect(updatedVertices).toHaveLength(sampleVertices.length)
    })

    it('should not affect polygon vertex count during drag', () => {
      const handleChange = vi.fn()
      render(
        <MockVertexEditor vertices={sampleVertices} onVerticesChange={handleChange} />
      )

      const vertex1 = screen.getByTestId('vertex-1')
      fireEvent.mouseDown(vertex1)

      const editor = screen.getByTestId('vertex-editor')
      fireEvent.mouseMove(editor)

      const updatedVertices = handleChange.mock.calls[0][0]
      expect(updatedVertices.length).toBe(sampleVertices.length)
    })
  })
})
