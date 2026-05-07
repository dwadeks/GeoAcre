# Feature Specification: Land Area Estimator

**Feature Branch**: `001-land-area-estimator`
**Created**: 2026-05-07
**Status**: Draft
**Input**: User description: "Build a web application for estimating land size in acres..."

## Clarifications

### Session 2026-05-07

- Q: What happens to an in-progress shape when the user switches modes mid-draw? → A: Prompt to confirm discard ("You have an unfinished shape — discard it?"); user must explicitly confirm before the shape is removed and the mode switches.
- Q: What happens to an existing completed primary polygon when the user starts drawing a new one? → A: Prompt to confirm discard ("You have an existing polygon — discard it?"); the old polygon is only removed if the user explicitly confirms.
- Q: Should polygon/measurement data be exportable in v1 to support future persistence? → A: Yes — users can download or copy the current session's shapes as JSON (coordinates + computed measurements); this validates the data model for future persistence without requiring a backend.
- Q: How should touch interactions disambiguate tap-to-place vs. drag for vertex editing on mobile? → A: Tap places a new vertex; long-press on an existing vertex handle (or a dedicated drag handle) initiates a vertex drag, keeping the two gestures distinct and preventing accidental moves.
- Q: How should self-intersecting polygons (where sides cross) be handled? → A: Allow the polygon to close and calculate its area using the even-odd fill rule; display a visible warning indicator (e.g., icon, banner) that the polygon self-intersects.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Draw Polygon and Measure Area (Priority: P1)

A user has located a parcel of land on the map and wants to know its area. They
click the corners of the property boundary to form a polygon. The application
immediately shows the area of the enclosed polygon in acres and the length of
each side in feet.

**Why this priority**: This is the entire core value of the application. Without
it, nothing else matters. All other stories build on or enhance this capability.

**Independent Test**: Open the app, navigate to any location, draw a three-or-more
vertex polygon, verify the area in acres and per-side distances are displayed.
Delivers a fully usable area estimator.

**Acceptance Scenarios**:

1. **Given** the user is viewing the map, **When** they click three or more points
   on the map to form a polygon and complete it, **Then** the polygon is rendered
   with each side labeled with its length in the selected distance unit and the
   enclosed area is displayed in the selected area unit.
2. **Given** a completed polygon, **When** the user has not changed any unit
   settings, **Then** distances default to feet and area defaults to acres.
3. **Given** a polygon with fewer than three vertices, **When** the user attempts
   to complete it, **Then** the application prevents completion and shows a
   descriptive message.
4. **Given** a completed polygon, **When** the user clicks to start a new polygon,
   **Then** the application displays a confirmation prompt ("You have an existing
   polygon — discard it?"); the existing polygon and its exclude polygons are only
   removed if the user explicitly confirms.

---

### User Story 2 - Navigate to a Location (Priority: P2)

A user knows where their property is but must first get the map to that location.
They can find it by panning and zooming the map, by typing an address, or by
entering latitude and longitude coordinates.

**Why this priority**: Without navigation, only users who happen to start at the
right location can use the app. Navigation unlocks the tool for everyone. It must
exist before polygon drawing has practical value for new users.

**Independent Test**: Open the app, search for a known address, verify the map
centers on that address. Search by lat/long, verify same behavior. Delivers a
standalone location-finder even without polygon capability.

**Acceptance Scenarios**:

1. **Given** the map is displayed, **When** the user types a street address into
   the search field and submits, **Then** the map pans and zooms to center on that
   address.
2. **Given** the map is displayed, **When** the user enters a valid latitude and
   longitude and submits, **Then** the map centers on those coordinates at an
   appropriate zoom level.
3. **Given** the user enters an unrecognizable address, **When** they submit,
   **Then** the application displays a clear "location not found" message without
   crashing.
4. **Given** any mode, **When** the user pans or zooms the map using mouse/touch
   gestures, **Then** the map responds smoothly and any in-progress polygon or
   measurement remains correctly anchored to its geographic coordinates.

---

### User Story 3 - Exclude Sub-Polygons from Area (Priority: P3)

A user has drawn a property boundary polygon and wants to subtract non-usable
areas such as a house footprint or a pond. They draw one or more exclude polygons
inside the main polygon. The displayed area updates to reflect the net area
(main area minus excluded areas).

**Why this priority**: Frequently needed for real-world land estimates, but the
core tool is usable without it. Builds directly on P1.

**Independent Test**: Draw a primary polygon, add one exclude polygon inside it,
verify the displayed area equals the difference between the two.

**Acceptance Scenarios**:

1. **Given** a completed primary polygon, **When** the user activates "add exclude
   area" mode and draws a polygon inside the primary polygon, **Then** the exclude
   polygon is shown with a distinct visual style and the net area is recalculated
   and displayed.
2. **Given** one or more exclude polygons, **When** the user selects and deletes
   an exclude polygon, **Then** the net area updates accordingly.
3. **Given** multiple exclude polygons, **When** the user views area information,
   **Then** the display shows the primary area, the total excluded area, and the
   net area.
4. **Given** an exclude polygon drawn partially or fully outside the primary
   polygon, **When** the app calculates area, **Then** only the intersection with
   the primary polygon is subtracted.

---

### User Story 4 - Fine-Tune Polygon Vertices (Priority: P4)

A user has drawn a polygon but the boundary is slightly off. They drag individual
vertices to refine the shape. All measurements update in real time as vertices
are moved. The map remains pannable and zoomable while editing.

**Why this priority**: Precision matters for land estimation; without vertex
editing, users must redraw the entire polygon for small corrections. Depends on
P1 existing.

**Independent Test**: Draw a polygon, drag one vertex to a new position, verify
all side lengths and area recalculate instantly.

**Acceptance Scenarios**:

1. **Given** a completed polygon, **When** the user drags a vertex to a new
   position on the map (mouse) or long-presses a vertex handle and drags (touch),
   **Then** the polygon boundary redraws and all side lengths and the total area
   update in real time.
2. **Given** vertex editing is active, **When** the user also pans or zooms the
   map, **Then** the map moves and vertex handles remain correctly positioned over
   their geographic coordinates.
3. **Given** an exclude polygon exists, **When** the user drags one of its
   vertices, **Then** the exclude polygon redraws and the net area recalculates.
4. **Given** a touch device, **When** the user taps the map (not on an existing
   vertex handle), **Then** a new vertex is placed; tapping on an existing handle
   and holding initiates a drag, preventing accidental vertex moves during
   normal map navigation.

---

### User Story 5 - Measure Distance Along a Polyline (Priority: P5)

A user wants to measure the length of a road, fence line, or other non-closed
path without creating an area polygon. They activate Distance Measurement Mode,
click a start point, click intermediate points, and click an endpoint. The total
distance along the line is displayed, with each segment labeled.

**Why this priority**: Useful utility, but the application delivers its primary
value without it. Independent of polygon functionality.

**Independent Test**: Switch to Distance Measurement Mode, click several points,
verify each segment and cumulative total distance are shown.

**Acceptance Scenarios**:

1. **Given** the user activates Distance Measurement Mode, **When** they click a
   start point, one or more intermediate points, and an endpoint, **Then** each
   segment is drawn on the map labeled with its individual length and a summary
   shows the total path length.
2. **Given** a completed Measurement Polyline, **When** the user adds or removes
   a point, **Then** all segment labels and the total update.
3. **Given** Distance Measurement Mode is active, **When** the map is panned or
   zoomed, **Then** the Measurement Polyline stays anchored to its geographic
   coordinates.

---

### User Story 6 - Configure Units of Measurement (Priority: P6)

A user working outside the United States (or simply preferring metric units)
changes the distance unit to meters and the area unit to hectares. All existing
and future measurements on the map immediately reflect the chosen units.

**Why this priority**: Important for international usability and professional
workflows, but the app works perfectly well with its defaults (feet / acres).

**Independent Test**: Draw a polygon, switch area unit to hectares, verify the
displayed area converts correctly. Switch distance unit to meters, verify side
labels convert.

**Acceptance Scenarios**:

1. **Given** polygons or measurements are displayed, **When** the user changes
   the area unit (e.g., acres → hectares → square meters), **Then** all area
   values immediately recalculate and display in the selected unit.
2. **Given** polygons or measurements are displayed, **When** the user changes
   the distance unit (e.g., feet → meters → miles → kilometers), **Then** all
   distance labels immediately update to the selected unit.
3. **Given** the app first loads, **When** no preference has been set, **Then**
   the default area unit is acres and the default distance unit is feet.

---

### User Story 7 - Export Session Data as JSON (Priority: P7)

A user has finished measuring a parcel and wants to preserve their work for later
or hand it off to another tool. They click an export button and either download a
JSON file or copy the JSON to the clipboard. The JSON contains all polygon
vertices, exclude polygons, measurement polylines, computed areas, and distances
in the currently selected units.

**Why this priority**: No server required; validates the data model that future
persistence will rely on. Low implementation cost relative to the value of not
losing session work.

**Independent Test**: Draw a polygon with one exclude polygon, export as JSON,
verify the file contains correct vertex coordinates and computed values.

**Acceptance Scenarios**:

1. **Given** a session with at least one polygon or measurement, **When** the user
   activates the export action, **Then** a valid JSON file is downloaded (or JSON
   is copied to the clipboard) containing all vertex coordinates, computed side
   lengths, area values, and the selected units.
2. **Given** an exported JSON, **When** a developer inspects it, **Then** the
   schema is self-describing and sufficient to reconstruct all shapes (suitable
   for future import/persistence use).
3. **Given** an empty session (no shapes drawn), **When** the user activates
   export, **Then** the export action is disabled or produces an empty-shapes JSON
   with a descriptive message.

---

### Edge Cases

- What happens when the user switches mode (area polygon ↔ distance measurement)
  while a shape is in progress? A confirmation prompt is shown; the in-progress
  shape is only discarded if the user explicitly confirms.
- What happens when the user draws a self-intersecting polygon (crossing sides)?
  The polygon is allowed to close and the area is calculated using the even-odd
  fill rule (standard cartographic behavior). A visible warning indicator is
  displayed to signal the self-intersection condition.
- What happens when the user zooms in very far and tries to draw a polygon?
  Vertices should be placeable at any zoom level with sufficient precision.
- How does the app handle lat/long input in varying formats (decimal degrees,
  degrees-minutes-seconds)? Decimal degrees are assumed; alternative formats are
  out of scope for v1.
- What if address geocoding is unavailable (network failure)? A clear error
  message is shown; the user can still navigate manually.
- What happens when an exclude polygon is larger than the primary polygon?
  Net area is displayed as zero (not negative).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to pan and zoom an interactive map using mouse
  and keyboard gestures at all times, including while drawing or editing polygons
  and measurements.
- **FR-002**: Users MUST be able to search for a location by street address; the
  map MUST center on the matched location.
- **FR-003**: Users MUST be able to navigate to a location by entering decimal
  latitude and longitude coordinates.
- **FR-004**: Users MUST be able to draw an area polygon by clicking vertices on
  the map; the polygon MUST close on demand or on double-click of the last point.
  If a completed primary polygon already exists when the user initiates a new one,
  the application MUST display a confirmation prompt before discarding the existing
  polygon and its associated exclude polygons.
- **FR-005**: The application MUST display the length of each polygon side
  adjacent to that side on the map, in the currently selected distance unit.
- **FR-006**: The application MUST display the total enclosed area of the primary
  polygon, in the currently selected area unit.
- **FR-007**: Users MUST be able to draw one or more exclude polygons inside a
  primary polygon; the application MUST display the net area (primary minus
  excluded intersections).
- **FR-008**: Users MUST be able to move any polygon vertex to a new position;
  on pointer devices this is a click-and-drag; on touch devices this is a
  long-press (≥500ms) on the vertex handle followed by a drag. A plain tap
  (≤500ms) MUST NOT trigger a vertex drag and MUST NOT move the vertex.
  Visual feedback (e.g., highlight or cursor change) MUST indicate when a
  vertex is draggable. All measurements MUST update in real time during the drag.
- **FR-009**: Users MUST be able to activate a Distance Measurement Mode distinct
  from area polygon mode. If a shape is in progress when the user switches modes,
  the application MUST display a confirmation prompt ("You have an unfinished shape
  — discard it?"); the mode switch MUST NOT occur until the user confirms.
- **FR-010**: In Distance Measurement Mode, users MUST be able to place a start
  point, any number of intermediate points, and an endpoint to form a Measurement
  Polyline; total path length and per-segment lengths MUST be displayed.
- **FR-011**: Users MUST be able to select the area unit from at minimum: acres,
  hectares, square feet, square meters.
- **FR-012**: Users MUST be able to select the distance unit from at minimum:
  feet, meters, miles, kilometers.
- **FR-013**: The application MUST default to acres (area) and feet (distance)
  on first load.
- **FR-014**: Users MUST be able to delete an exclude polygon individually.
- **FR-015**: Users MUST be able to clear all polygons and measurements to start
  fresh.
- **FR-016**: Users MUST be able to export the current session's shapes as JSON;
  the export MUST include all polygon vertex coordinates (latitude/longitude),
  exclude polygon vertices, measurement polyline vertices, computed area values,
  computed distance values, and the currently selected units. Export is available
  as a file download and/or clipboard copy.
- **FR-017**: The JSON export schema MUST be self-describing and sufficient to
  fully reconstruct all session shapes, in anticipation of a future import feature.
- **FR-018**: If a polygon's sides self-intersect (cross each other), the
  application MUST calculate the area using the even-odd fill rule (a standard
  cartographic algorithm) and MUST display a visible warning indicator (e.g., an
  icon or banner) that the polygon is self-intersecting.

- **Primary Polygon**: The main boundary representing the parcel of land; has an
  ordered list of geographic vertices, a computed area, and computed per-side
  distances.
- **Exclude Polygon**: A sub-polygon that represents an area to subtract from the
  primary polygon; same structure as a primary polygon; associated with one
  primary polygon.
- **Measurement Polyline**: An open path (not closed) representing a distance
  measurement; has an ordered list of geographic vertices and computed
  per-segment and total distances.
- **Geographic Vertex**: A point defined by latitude and longitude; the
  building block of polygons and polylines.
- **Unit Preference**: User's current selection of area unit and distance unit;
  applies globally to all displayed measurements.
- **Map View State**: Current center coordinates and zoom level of the visible map.

- **Session Snapshot**: A portable JSON representation of all shapes and
  measurements in the current session; includes vertex coordinates, computed
  values, and selected units. Designed as the data contract for future persistence.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can navigate to any location, draw a polygon, and see its
  area in under 60 seconds from opening the application.
- **SC-002**: Area calculations are accurate to within 0.5% of the true geodetic
  area for polygons up to 1,000 acres.
- **SC-003**: Distance calculations are accurate to within 0.5% of true geodetic
  distance for segments up to 10 miles.
- **SC-004**: All measurement labels (area, side lengths, distances) update
  within 100 milliseconds of a vertex position change during drag in normal
  network conditions (backend response <50ms).
- **SC-005**: The application functions correctly on current major browsers
  (Chrome, Firefox, Edge, Safari) without plugins.
- **SC-006**: Users can export session data as JSON (download or copy to
  clipboard) without errors for any session containing ≥1 polygon or measurement.
- **SC-007**: All error messages (invalid input, network unavailable, rate
  limited, geocoding failure) are clear, user-friendly, and suggest recovery
  actions (e.g., "Try again", "Check your address", "Refresh and retry").
- **SC-008**: Self-intersecting polygons produce consistent, reproducible area
  results (using even-odd fill rule) and display a clear warning; the user is
  never blocked from using the tool due to self-intersection.

## Assumptions

- **No server-side persistence in v1**: Polygons and measurements are session-only
  and are not saved between page loads. However, users can export session data as
  JSON to preserve their work locally. The export schema is designed to support a
  future import/persistence feature.
- **Single primary polygon per session**: Only one primary polygon exists at a
  time; starting a new one triggers a confirmation prompt before replacing the
  previous one (see FR-004 and Clarifications).
- **Desktop-first, mobile-aware**: The primary target is desktop/laptop browsers;
  mobile/touch support is a secondary concern and not required for v1 acceptance,
  but interaction design MUST accommodate touch from the start. On touch devices:
  tap places vertices, long-press on a vertex handle initiates a drag, and two-
  finger pinch/pan navigates the map.
- **Lat/long input is decimal degrees only**: DMS and other formats are out of
  scope for v1.
- **Map tile provider availability**: The app relies on a third-party map tile
  service; offline map use is out of scope.
- **No user authentication**: The app is a public, stateless tool; no login or
  account management is required.
- **Geodetically correct calculations**: Area and distance calculations MUST
  account for Earth's curvature (not flat-plane geometry), since parcels can
  span meaningful geographic extents.
