import type L from 'leaflet'
import type { BaseLayerMode } from './BaseLayerMode'

export interface MapInstance {
  map: L.Map
  polygons: L.Layer[]
  markers: L.Marker[]
  baseLayers: Record<BaseLayerMode, L.TileLayer>
  activeBaseLayer: BaseLayerMode
}
