const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/MapContainer.tsx');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Find and update imports - add L import after DragState
const dragStateImportIdx = lines.findIndex(line => line.includes("import type { DragState }"));
if (dragStateImportIdx !== -1) {
  lines.splice(dragStateImportIdx + 1, 0, "import L from 'leaflet'");
}

// Find dragJustEndedRef and add dragSourceRef after it
const dragJustEndedIdx = lines.findIndex(line => line.includes('const dragJustEndedRef = useRef(false)'));
if (dragJustEndedIdx !== -1) {
  lines.splice(dragJustEndedIdx + 1, 0, "  const dragSourceRef = useRef<'inprogress' | 'primary' | null>(null)");
}

// Find and replace marker mousedown handler
let inMarkerHandler = false;
let markerHandlerStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("marker.on('mousedown',")) {
    markerHandlerStart = i;
    // Find the end of the handler (next closing })
    let braceCount = 0;
    let foundStart = false;
    for (let j = i; j < lines.length; j++) {
      const line = lines[j];
      if (line.includes('{')) {
        braceCount++;
        foundStart = true;
      }
      if (line.includes('}')) {
        braceCount--;
      }
      if (foundStart && braceCount === 0 && line.includes('}')) {
        // Replace from markerHandlerStart to j
        const replacement = [
          "      marker.on('mousedown', (e: any) => {",
          "        // Prevent map panning when starting vertex drag",
          "        L.DomEvent.stop(e)",
          "        dragSourceRef.current = 'inprogress'",
          "        setDragState(dragService.startDrag(index, vertices))",
          "      })"
        ];
        lines.splice(i, j - i + 1, ...replacement);
        break;
      }
    }
    break;
  }
}

// Find primary polygon rendering and add vertex markers code
const primaryPolygonRenderIdx = lines.findIndex(line => 
  line.includes("if (primaryPolygon && primaryPolygon.vertices.length >= 3)") &&
  lines[line + 1]?.includes("mapService.drawPolygon(mapInstanceRef.current, primaryPolygon.vertices")
);

if (primaryPolygonRenderIdx !== -1) {
  // Find the closing brace of this if block
  let braceCount = 0;
  let foundStart = false;
  for (let i = primaryPolygonRenderIdx; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('{')) {
      braceCount++;
      foundStart = true;
    }
    if (line.includes('}')) {
      braceCount--;
    }
    if (foundStart && braceCount === 0 && line.trim() === '}') {
      // Insert marker rendering code before the closing brace
      const markerCode = [
        "      // Add draggable markers for primary polygon vertices in draw mode",
        "      if (mode === 'draw') {",
        "        primaryPolygon.vertices.forEach((v, idx) => {",
        "          const marker = mapService.addMarker(",
        "            mapInstanceRef.current!,",
        "            v.latitude,",
        "            v.longitude,",
        "            `Vertex ${idx + 1}`",
        "          )",
        "          marker.off('mousedown')",
        "          marker.on('mousedown', (e: any) => {",
        "            L.DomEvent.stop(e)",
        "            dragSourceRef.current = 'primary'",
        "            setDragState(dragService.startDrag(idx, primaryPolygon.vertices))",
        "          })",
        "          markersRef.current.push(marker)",
        "        })",
        "      }"
      ];
      lines.splice(i, 0, ...markerCode);
      break;
    }
  }
}

// Find and update handleMouseUp function
let handleMouseUpIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const handleMouseUp = () => {')) {
    handleMouseUpIdx = i;
    // Find the setDragState(null) line
    for (let j = i; j < lines.length; j++) {
      if (lines[j].includes('setDragState(null)')) {
        // Insert the primary polygon update code after setDragState(null)
        const updateCode = [
          "      ",
          "      // If dragging primary polygon, update it",
          "      if (dragSourceRef.current === 'primary' && primaryPolygon) {",
          "        const updatedPrimary: Polygon = {",
          "          ...primaryPolygon,",
          "          vertices: dragState.currentVertices,",
          "        }",
          "        onPolygonChangeRef.current?.(updatedPrimary)",
          "      }",
          "      dragSourceRef.current = null"
        ];
        lines.splice(j + 1, 0, ...updateCode);
        break;
      }
    }
    break;
  }
}

const content = lines.join('\n');
fs.writeFileSync(filePath, content);
console.log('MapContainer.tsx fixed successfully');
