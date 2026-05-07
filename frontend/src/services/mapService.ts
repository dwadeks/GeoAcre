/**
 * Map Service - Leaflet wrapper for interactive map management
 * Provides methods for initializing map, drawing shapes, and managing markers
 */

import L from 'leaflet'
import type { GeoPoint } from '../models/GeoTypes'

// Default Leaflet marker icon fix (Vite issue)
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.setIcon(DefaultIcon)

export interface MapInstance {
  map: L.Map
  polygons: L.Polygon[]
  markers: L.Marker[]
}

/**
 * Initialize map in the specified container
 */
export function initMap(containerId: string): MapInstance {
  const map = L.map(containerId).setView([39.8283, -98.5795], 4) // Center on USA

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)

  return {
    map,
    polygons: [],
    markers: [],
  }
}

/**
 * Add a marker to the map
 */
export function addMarker(
  mapInstance: MapInstance,
  lat: number,
  lon: number,
  title?: string
): L.Marker {
  const marker = L.marker([lat, lon], { title }).addTo(mapInstance.map)
  mapInstance.markers.push(marker)
  return marker
}

/**
 * Draw a polygon on the map
 */
export function drawPolygon(
  mapInstance: MapInstance,
  vertices: GeoPoint[],
  options?: L.PolylineOptions & { fillColor?: string; fillOpacity?: number }
): L.Polygon {
  const latlngs = vertices.map((v) => [v.latitude, v.longitude] as [number, number])

  const polygon = L.polygon(latlngs, {
    color: options?.color || '#3388ff',
    weight: options?.weight || 2,
    opacity: options?.opacity || 0.7,
    fill: true,
    fillColor: options?.fillColor || '#3388ff',
    fillOpacity: options?.fillOpacity || 0.2,
    ...options,
  }).addTo(mapInstance.map)

  mapInstance.polygons.push(polygon)
  return polygon
}

/**
 * Add popup to a marker
 */
export function addPopup(marker: L.Marker, content: string): void {
  marker.bindPopup(content)
}

/**
 * Pan and zoom to coordinates
 */
export function panTo(
  mapInstance: MapInstance,
  lat: number,
  lon: number,
  zoom?: number
): void {
  mapInstance.map.setView([lat, lon], zoom || mapInstance.map.getZoom())
}

/**
 * Remove all polygons from map
 */
export function clearPolygons(mapInstance: MapInstance): void {
  mapInstance.polygons.forEach((polygon) => polygon.remove())
  mapInstance.polygons = []
}

/**
 * Remove all markers from map
 */
export function clearMarkers(mapInstance: MapInstance): void {
  mapInstance.markers.forEach((marker) => marker.remove())
  mapInstance.markers = []
}

/**
 * Clear entire map
 */
export function clearMap(mapInstance: MapInstance): void {
  clearPolygons(mapInstance)
  clearMarkers(mapInstance)
}

/**
 * Fit bounds to show all markers
 */
export function fitBounds(mapInstance: MapInstance): void {
  if (mapInstance.polygons.length > 0) {
    const bounds = L.featureGroup(mapInstance.polygons).getBounds()
    mapInstance.map.fitBounds(bounds, { padding: [50, 50] })
  }
}

/**
 * Get map instance reference
 */
export function getMapInstance(mapId: string): L.Map | null {
  try {
    return (L.map(mapId) as any)._instance || null
  } catch {
    return null
  }
}

export default {
  initMap,
  addMarker,
  drawPolygon,
  addPopup,
  panTo,
  clearPolygons,
  clearMarkers,
  clearMap,
  fitBounds,
}
