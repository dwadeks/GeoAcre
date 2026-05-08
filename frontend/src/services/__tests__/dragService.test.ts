/**
 * dragService.test.ts - Test suite for vertex drag functionality
 * Tests: startDrag, updateVertexPosition, endDrag operations
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as dragService from '../dragService'
import type { GeoPoint } from '../../models/GeoTypes'

describe('dragService', () => {
  describe('startDrag', () => {
    it('should initialize drag state with correct vertex index', () => {
      const vertices: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.7589, longitude: -73.9851 },
        { latitude: 40.7614, longitude: -73.9776 },
      ]

      const dragState = dragService.startDrag(0, vertices)

      expect(dragState.vertexIndex).toBe(0)
      expect(dragState.startLatLng).toEqual({ latitude: 40.7128, longitude: -74.006 })
      expect(dragState.currentVertices).toEqual(vertices)
    })

    it('should handle drag start for middle vertex', () => {
      const vertices: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.7589, longitude: -73.9851 },
        { latitude: 40.7614, longitude: -73.9776 },
      ]

      const dragState = dragService.startDrag(1, vertices)

      expect(dragState.vertexIndex).toBe(1)
      expect(dragState.startLatLng).toEqual({ latitude: 40.7589, longitude: -73.9851 })
    })

    it('should handle drag start for last vertex', () => {
      const vertices: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.7589, longitude: -73.9851 },
        { latitude: 40.7614, longitude: -73.9776 },
      ]

      const dragState = dragService.startDrag(2, vertices)

      expect(dragState.vertexIndex).toBe(2)
      expect(dragState.startLatLng).toEqual({ latitude: 40.7614, longitude: -73.9776 })
    })
  })

  describe('updateVertexPosition', () => {
    let vertices: GeoPoint[]
    let dragState: dragService.DragState

    beforeEach(() => {
      vertices = [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.7589, longitude: -73.9851 },
        { latitude: 40.7614, longitude: -73.9776 },
      ]
      dragState = dragService.startDrag(0, vertices)
    })

    it('should update vertex position during drag', () => {
      const newLatLng = { latitude: 40.71, longitude: -74.0 }
      const updated = dragService.updateVertexPosition(dragState, newLatLng)

      expect(updated).toHaveLength(3)
      expect(updated[0]).toEqual(newLatLng)
      expect(updated[1]).toEqual(vertices[1])
      expect(updated[2]).toEqual(vertices[2])
    })

    it('should update middle vertex position', () => {
      dragState = dragService.startDrag(1, vertices)
      const newLatLng = { latitude: 40.75, longitude: -73.98 }
      const updated = dragService.updateVertexPosition(dragState, newLatLng)

      expect(updated).toHaveLength(3)
      expect(updated[0]).toEqual(vertices[0])
      expect(updated[1]).toEqual(newLatLng)
      expect(updated[2]).toEqual(vertices[2])
    })

    it('should update last vertex position', () => {
      dragState = dragService.startDrag(2, vertices)
      const newLatLng = { latitude: 40.76, longitude: -73.97 }
      const updated = dragService.updateVertexPosition(dragState, newLatLng)

      expect(updated).toHaveLength(3)
      expect(updated[0]).toEqual(vertices[0])
      expect(updated[1]).toEqual(vertices[1])
      expect(updated[2]).toEqual(newLatLng)
    })

    it('should preserve other vertices unchanged', () => {
      dragState = dragService.startDrag(1, vertices)
      const newLatLng = { latitude: 40.75, longitude: -73.98 }
      const updated = dragService.updateVertexPosition(dragState, newLatLng)

      expect(updated[0]).toBe(vertices[0])
      expect(updated[2]).toBe(vertices[2])
    })

    it('should return array with same length as input', () => {
      const fourVertices: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.7589, longitude: -73.9851 },
        { latitude: 40.7614, longitude: -73.9776 },
        { latitude: 40.71, longitude: -74.0 },
      ]
      dragState = dragService.startDrag(2, fourVertices)
      const newLatLng = { latitude: 40.75, longitude: -73.98 }
      const updated = dragService.updateVertexPosition(dragState, newLatLng)

      expect(updated).toHaveLength(4)
    })
  })

  describe('endDrag', () => {
    it('should accept drag state and finalize without error', () => {
      const vertices: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.7589, longitude: -73.9851 },
        { latitude: 40.7614, longitude: -73.9776 },
      ]
      const dragState = dragService.startDrag(0, vertices)

      expect(() => {
        dragService.endDrag(dragState)
      }).not.toThrow()
    })

    it('should successfully end drag on any vertex', () => {
      const vertices: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.7589, longitude: -73.9851 },
        { latitude: 40.7614, longitude: -73.9776 },
      ]

      for (let i = 0; i < vertices.length; i++) {
        const dragState = dragService.startDrag(i, vertices)
        expect(() => {
          dragService.endDrag(dragState)
        }).not.toThrow()
      }
    })
  })

  describe('integration scenarios', () => {
    it('should support full drag workflow: start -> update -> end', () => {
      const vertices: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.7589, longitude: -73.9851 },
        { latitude: 40.7614, longitude: -73.9776 },
      ]

      // Start drag on first vertex
      const dragState = dragService.startDrag(0, vertices)
      expect(dragState.vertexIndex).toBe(0)

      // Update position multiple times
      const update1 = dragService.updateVertexPosition(dragState, {
        latitude: 40.71,
        longitude: -74.0,
      })
      expect(update1[0]).toEqual({ latitude: 40.71, longitude: -74.0 })

      const update2 = dragService.updateVertexPosition(dragState, {
        latitude: 40.71,
        longitude: -73.99,
      })
      expect(update2[0]).toEqual({ latitude: 40.71, longitude: -73.99 })

      // End drag
      expect(() => {
        dragService.endDrag(dragState)
      }).not.toThrow()
    })

    it('should handle rapid sequential vertex updates during drag', () => {
      const vertices: GeoPoint[] = [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.7589, longitude: -73.9851 },
        { latitude: 40.7614, longitude: -73.9776 },
      ]

      const dragState = dragService.startDrag(1, vertices)

      // Simulate rapid mouse moves during drag
      const positions = [
        { latitude: 40.7, longitude: -73.99 },
        { latitude: 40.72, longitude: -73.98 },
        { latitude: 40.75, longitude: -73.97 },
        { latitude: 40.76, longitude: -73.96 },
      ]

      let lastUpdated = vertices
      positions.forEach((pos) => {
        lastUpdated = dragService.updateVertexPosition(dragState, pos)
      })

      expect(lastUpdated[1]).toEqual(positions[positions.length - 1])
      expect(lastUpdated[0]).toBe(vertices[0])
      expect(lastUpdated[2]).toBe(vertices[2])
    })
  })
})
