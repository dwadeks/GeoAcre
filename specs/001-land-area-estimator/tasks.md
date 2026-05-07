# Tasks: Land Area Estimator

**Input**: Design documents from `/specs/001-land-area-estimator/`  
**Prerequisites**: plan.md (tech stack, project structure), spec.md (7 user stories P1-P7), data-model.md (entities), contracts/ (API and geometry library), research.md (map/geocoding decisions), quickstart.md (dev setup)

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story. Phases are sequenced by story priority (P1→P7) to deliver MVP incrementally.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks in same phase)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, ..., US7)
- Include exact file paths and project names in descriptions
- Tests are **REQUIRED** per constitution (TDD mandate)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project directory structure per implementation plan (frontend/, backend/, specs/, .github/, .specify/)
- [ ] T002 [P] Initialize Git repository and create initial commit
- [ ] T003 [P] Initialize frontend project with React 18.x, TypeScript 5.x, Vitest, React Testing Library in `frontend/`
- [ ] T004 [P] Configure frontend TypeScript strict mode in `frontend/tsconfig.json` (strict: true)
- [ ] T005 [P] Initialize backend C# solution with `backend/GeoAcre.sln` and Directory.Build.props
- [ ] T006 [P] Create `backend/src/SteelTree.GeoAcre.Geometry/SteelTree.GeoAcre.Geometry.csproj` as .NET 10 class library
- [ ] T007 [P] Create `backend/tests/unit/SteelTree.GeoAcre.Geometry.Tests/SteelTree.GeoAcre.Geometry.Tests.csproj` with MSTest and Moq references
- [ ] T008 [P] Create `backend/src/SteelTree.GeoAcre.Web.Api/SteelTree.GeoAcre.Web.Api.csproj` as ASP.NET Core 10 web project
- [ ] T009 [P] Create `backend/tests/integration/SteelTree.GeoAcre.Web.Api.Tests/SteelTree.GeoAcre.Web.Api.Tests.csproj` with MSTest and HttpClient testing
- [ ] T010 [P] Configure frontend ESLint, Prettier, and pre-commit hooks in `frontend/.eslintrc.json` and `frontend/prettier.config.js`
- [ ] T011 [P] Configure backend code analysis and formatting in `Directory.Build.props` (StyleCop, FxCop)
- [ ] T012 [P] Create shared frontend TypeScript models in `frontend/src/models/GeoTypes.ts` (stub: GeoPoint, Polygon interfaces)
- [ ] T013 Create root `.gitignore` with node_modules, bin/, obj/, .vs/, .env patterns

**Checkpoint**: Project structure initialized; all projects buildable and ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Geometry Library: Core Data Models & Validation

- [ ] T014 [P] Create `backend/src/SteelTree.GeoAcre.Geometry/GeoPoint.cs` as record with Latitude/Longitude validation (-90 to 90, -180 to 180 ranges)
- [ ] T015 [P] Create `backend/src/SteelTree.GeoAcre.Geometry/Polygon.cs` class with properties: Id, Vertices, IsExcludePolygon, ParentPolygonId, IsValid, HasIntersections, ComputedAreaSquareMeters, ComputedPerimeterMeters, PerSideLengthsMeters (lazy-computed properties or stub methods)
- [ ] T016 [P] Create `backend/src/SteelTree.GeoAcre.Geometry/Measurement.cs` class with properties: Id, Vertices, IsValid, TotalDistanceMeters, PerSegmentDistancesMeters

### Geometry Library: Core Algorithms

- [ ] T017 Create `backend/src/SteelTree.GeoAcre.Geometry/GeoCalculations.cs` static class with method stubs:
  - `Distance(GeoPoint from, GeoPoint to) → double` (Haversine formula, ~0.5m accuracy)
  - `ComputeArea(IEnumerable<GeoPoint> vertices) → double` (spherical excess, <0.5% accuracy)
  - `DetectIntersections(IEnumerable<GeoPoint> vertices) → bool` (sweep-line, O(n log n))
  - `ComputePerimeter(IEnumerable<GeoPoint> vertices) → double`
  - `ComputeAreaEvenOddRule(IEnumerable<GeoPoint> vertices) → double`
  - `IsPointInPolygon(GeoPoint point, IEnumerable<GeoPoint> polygonVertices) → bool`
  - `ComputeIntersection(Polygon primary, Polygon exclude) → List<GeoPoint>`
- [ ] T018 [P] Create `backend/src/SteelTree.GeoAcre.Geometry/UnitConversion.cs` static class with conversion methods (m² ↔ acres/hectares/square feet, m ↔ feet/miles/km)
- [ ] T019 [P] Create custom exceptions: `backend/src/SteelTree.GeoAcre.Geometry/InvalidPolygonException.cs`, `InvalidCoordinateException.cs`

### Geometry Library: Unit Tests (TDD—write these FIRST, ensure they FAIL)

- [ ] T020 [P] Create `backend/tests/unit/SteelTree.GeoAcre.Geometry.Tests/GeoPointTests.cs` with tests:
  - Valid coordinates create record successfully
  - Invalid latitude (>90, <-90) throws `InvalidCoordinateException`
  - Invalid longitude (>180, <-180) throws `InvalidCoordinateException`
- [ ] T021 [P] Create `backend/tests/unit/SteelTree.GeoAcre.Geometry.Tests/GeoCalculations_DistanceTests.cs` with tests:
  - Known coordinates (NYC to LA) within 0.5% accuracy (~3944 km)
  - Zero distance for same point
  - Symmetry: Distance(A, B) == Distance(B, A)
- [ ] T022 [P] Create `backend/tests/unit/SteelTree.GeoAcre.Geometry.Tests/GeoCalculations_AreaTests.cs` with tests:
  - Central Park area (~843 acres) within 0.5% accuracy
  - Triangle area calculation
  - Self-intersecting polygon uses even-odd rule correctly
- [ ] T023 [P] Create `backend/tests/unit/SteelTree.GeoAcre.Geometry.Tests/GeoCalculations_IntersectionTests.cs` with tests:
  - Simple polygon (non-intersecting) returns false
  - Self-intersecting polygon returns true
  - Square and bowtie patterns
- [ ] T024 [P] Create `backend/tests/unit/SteelTree.GeoAcre.Geometry.Tests/UnitConversionTests.cs` with tests:
  - Acres ↔ square meters conversions
  - Feet ↔ meters conversions
  - Symmetry: A → B → A recovers original within rounding

### Geometry Library: Implementation (Make tests PASS)

- [ ] T025 Implement `GeoCalculations.Distance()` using Haversine formula in `backend/src/SteelTree.GeoAcre.Geometry/GeoCalculations.cs`
- [ ] T026 Implement `GeoCalculations.ComputeArea()` using spherical excess formula in `backend/src/SteelTree.GeoAcre.Geometry/GeoCalculations.cs`
- [ ] T027 Implement `GeoCalculations.DetectIntersections()` using sweep-line or O(n²) line intersection in `backend/src/SteelTree.GeoAcre.Geometry/GeoCalculations.cs`
- [ ] T028 [P] Implement remaining `GeoCalculations` methods: `ComputePerimeter()`, `ComputeAreaEvenOddRule()`, `IsPointInPolygon()`, `ComputeIntersection()` in `backend/src/SteelTree.GeoAcre.Geometry/GeoCalculations.cs`
- [ ] T029 [P] Implement `UnitConversion` methods in `backend/src/SteelTree.GeoAcre.Geometry/UnitConversion.cs`
- [ ] T030 [P] Update Polygon lazy properties in `backend/src/SteelTree.GeoAcre.Geometry/Polygon.cs` to call `GeoCalculations` methods and cache results
- [ ] T031 [P] Update Measurement lazy properties in `backend/src/SteelTree.GeoAcre.Geometry/Measurement.cs` to call `GeoCalculations` methods

### API Infrastructure

- [ ] T032 Create `backend/src/SteelTree.GeoAcre.Web.Api/Program.cs` with ASP.NET Core 10 minimal API setup, CORS, logging, and error middleware
- [ ] T033 [P] Create `backend/src/SteelTree.GeoAcre.Web.Api/Models/GeoTypes.cs` with request/response DTOs for GeocodeSearchRequest, GeocodeSearchResponse, GeocodereverseRequest, ReverseGeocodeResponse
- [ ] T034 [P] Create error handling middleware in `backend/src/SteelTree.GeoAcre.Web.Api/Middleware/ErrorHandlingMiddleware.cs` (400, 429, 500, 503 responses)
- [ ] T035 Create `backend/src/SteelTree.GeoAcre.Web.Api/Services/IGeocodeService.cs` interface and stub implementation `NominatimGeocodeService.cs`

### Frontend Infrastructure

- [ ] T036 [P] Create `frontend/src/services/apiClient.ts` with Axios or Fetch wrapper for backend API calls
- [ ] T037 [P] Create `frontend/src/models/GeoTypes.ts` with TypeScript types matching backend DTOs
- [ ] T038 Create `frontend/src/pages/App.tsx` root component with basic layout (map area, control panel, export section)
- [ ] T039 [P] Create `frontend/src/styles/globals.css` with responsive layout base styles

**Checkpoint**: Geometry library complete with all tests passing; API infrastructure ready; frontend basic structure in place

---

## Phase 3: User Story 1 - Draw Polygon and Measure Area (Priority: P1) 🎯 MVP

**Goal**: Users can draw a polygon on a map, see the area in acres, and view each side length in feet.

**Independent Test**: Open app, navigate to any location, draw a three-or-more vertex polygon, verify area in acres and per-side distances in feet are displayed and mathematically correct.

### Tests for User Story 1 (Write FIRST, ensure they FAIL)

- [ ] T040 [P] Create `backend/tests/unit/SteelTree.GeoAcre.Geometry.Tests/PolygonTests.cs` with tests:
  - Polygon with 3 vertices is valid; fewer is invalid
  - Polygon.ComputedAreaSquareMeters matches expected area for known polygon
  - Polygon.PerSideLengthsMeters has correct count and magnitudes
  - Test data: Central Park boundary, simple triangle at equator
- [ ] T041 [P] Create `frontend/src/services/__tests__/geometryService.test.ts` with Vitest tests:
  - `calculatePolygonArea()` returns correct acres for sample coordinates
  - `formatArea()` converts square meters to acres/hectares/square feet
  - `calculateSideLengths()` returns array of lengths in feet/meters
- [ ] T042 Create `frontend/src/components/__tests__/MapContainer.test.tsx` with React Testing Library tests:
  - Map renders with Leaflet tiles visible
  - Clicking map registers vertex placement (mock click events)
  - Polygon renders after 3+ vertices placed
- [ ] T043 [P] Create `frontend/src/components/__tests__/PolygonDisplay.test.tsx` with React Testing Library tests:
  - Side lengths display with correct unit labels
  - Area displays in selected unit (default acres)
  - Area updates when polygon changes

### Implementation for User Story 1

- [ ] T044 [P] Create `frontend/src/services/geometryService.ts` with functions:
  - `calculatePolygonArea(vertices: GeoPoint[]): number` (calls Turf.js or backend)
  - `calculateSideLengths(vertices: GeoPoint[]): number[]`
  - `formatArea(squareMeters: number, unit: 'acres' | 'hectares' | 'sqm'): string`
  - `formatDistance(meters: number, unit: 'feet' | 'meters' | 'miles' | 'km'): string`
- [ ] T045 [P] Create `frontend/src/services/mapService.ts` wrapper around Leaflet:
  - `initMap(containerId: string): LeafletMap`
  - `addMarker(lat: number, lon: number): Marker`
  - `drawPolygon(vertices: [lat, lon][]): Polygon`
  - `addPopup(marker: Marker, content: string): void`
  - `panTo(lat: number, lon: number, zoom: number): void`
- [ ] T046 Create `frontend/src/components/MapContainer.tsx` with Leaflet map:
  - Renders map in centered div
  - Tracks click events to build vertex array
  - Renders polygon on canvas when 3+ vertices
  - Displays vertex markers with drag handles (for P4)
  - State management for current polygon (React.useState)
- [ ] T047 [P] Create `frontend/src/components/PolygonDisplay.tsx` to show area and side lengths
- [ ] T048 [P] Create `frontend/src/components/UnitSelector.tsx` with dropdowns for area (acres, hectares, sqm) and distance (feet, meters, miles, km) units
- [ ] T049 [P] Create `frontend/src/models/index.ts` with TypeScript types: `GeoPoint`, `Polygon`, `UnitPreference` (areaUnit, distanceUnit)
- [ ] T050 Create `frontend/src/pages/App.tsx` to integrate MapContainer, PolygonDisplay, UnitSelector with state management (useReducer or Context for session state)
- [ ] T051 [P] Create `frontend/src/index.tsx` with React.createRoot() and render App
- [ ] T052 [P] Update `frontend/package.json` with scripts: `dev`, `build`, `test`, `lint`
- [ ] T053 Update `backend/src/SteelTree.GeoAcre.Web.Api/Program.cs` to accept optional POST `/geometry/calculate-area` endpoint (body: { vertices, excludePolygons }, response: { areaSquareMeters, perSideLengthsMeters, hasIntersections, netArea })
- [ ] T054 [P] Create `backend/tests/integration/SteelTree.GeoAcre.Web.Api.Tests/GeometryControllerTests.cs` with integration tests:
  - POST /geometry/calculate-area with valid polygon returns correct area
  - Invalid polygon (< 3 vertices) returns 400 Bad Request

**Checkpoint**: User Story 1 complete and fully testable. A user can draw a polygon and see the area and side lengths. MVP is functional.

---

## Phase 4: User Story 2 - Navigate to a Location (Priority: P2)

**Goal**: Users can search for an address or enter lat/long coordinates to navigate the map to that location.

**Independent Test**: Search for "123 Main St, Springfield, IL", verify map centers on that address. Enter lat=39.7817, lon=-89.6501, verify same behavior.

### Tests for User Story 2

- [ ] T055 [P] Create `frontend/src/services/__tests__/geocodingService.test.ts` with tests:
  - `searchAddress(query)` calls backend `/geocode/search` and returns results array
  - `reverseGeocode(lat, lon)` calls backend `/geocode/reverse` and returns address string
  - Error handling for network failures and invalid inputs
- [ ] T056 Create `frontend/src/components/__tests__/LocationSearch.test.tsx` with React Testing Library tests:
  - Input field accepts address text
  - Button submits search query
  - Results dropdown displays search results
  - Clicking result triggers map navigation (pan/zoom)
- [ ] T057 [P] Create `backend/tests/integration/SteelTree.GeoAcre.Web.Api.Tests/GeocodingControllerTests.cs` with tests:
  - POST /geocode/search with "Springfield, IL" returns valid results array
  - POST /geocode/reverse with lat=39.7817, lon=-89.6501 returns address
  - Empty query returns 400 Bad Request
  - External service failure (Nominatim down) returns 503 Service Unavailable

### Implementation for User Story 2

- [ ] T058 Create `frontend/src/services/geocodingService.ts` with functions:
  - `searchAddress(query: string, maxResults?: number): Promise<SearchResult[]>`
  - `reverseGeocode(latitude: number, longitude: number): Promise<string>`
  - Each calls backend API via apiClient
- [ ] T059 Create `frontend/src/components/LocationSearch.tsx`:
  - Input field for address or lat/lon
  - Search button
  - Results dropdown with clickable results
  - Handles loading state, errors
- [ ] T060 [P] Update `frontend/src/pages/App.tsx` to integrate LocationSearch and call `mapService.panTo()` when result selected
- [ ] T061 Create `backend/src/SteelTree.GeoAcre.Web.Api/Controllers/GeocodingController.cs`:
  - POST `/geocode/search` endpoint (body: {query, maxResults?}) → response: {results: [{id, displayName, latitude, longitude, boundingBox?}]}
  - POST `/geocode/reverse` endpoint (body: {latitude, longitude}) → response: {address, latitude, longitude}
- [ ] T062 Implement `NominatimGeocodeService` in `backend/src/SteelTree.GeoAcre.Web.Api/Services/NominatimGeocodeService.cs`:
  - Call Nominatim API `https://nominatim.openstreetmap.org/search?q={query}&format=json`
  - Call Nominatim API `https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json`
  - Error handling: network failures → 503, invalid coords → 400
  - Rate limiting: max 1 request/sec (per Nominatim terms)
- [ ] T063 [P] Update `backend/src/SteelTree.GeoAcre.Web.Api/Program.cs` to register `IGeocodeService` in DI container
- [ ] T064 [P] Add rate limiting middleware for geocoding endpoint (10 req/sec per IP) in `backend/src/SteelTree.GeoAcre.Web.Api/Middleware/RateLimitingMiddleware.cs`

**Checkpoint**: User Story 2 complete. Users can search by address or coordinates and navigate the map. Combined with P1, the app now enables location-based area measurement for any real-world property.

---

## Phase 5: User Story 3 - Exclude Sub-Polygons from Area (Priority: P3)

**Goal**: Users can draw exclude polygons inside a primary polygon to subtract non-usable areas (buildings, ponds) and see the net area.

**Independent Test**: Draw a primary polygon, add one exclude polygon inside, verify displayed area equals primary minus exclude.

### Tests for User Story 3

- [ ] T065 [P] Create `backend/tests/unit/SteelTree.GeoAcre.Geometry.Tests/GeoCalculations_ExcludeTests.cs` with tests:
  - Polygon with one exclude: net area = primary area - exclude area
  - Polygon with multiple excludes: net area = primary - sum(excludes)
  - Exclude polygon larger than primary: net area >= 0 (clamped)
  - Exclude polygon partially outside primary: only intersection subtracted
- [ ] T066 Create `frontend/src/components/__tests__/ExcludePolygonEditor.test.tsx` with React Testing Library tests:
  - Button to toggle "Add Exclude Mode"
  - Drawing exclude polygon renders with different style
  - Delete exclude polygon button removes it and updates net area
  - Display shows primary area, total excluded area, net area
- [ ] T067 [P] Create `frontend/src/services/__tests__/polygonService.test.ts` with tests:
  - `calculateNetArea(primary, excludes)` returns correct difference
  - `clampArea(value)` ensures non-negative

### Implementation for User Story 3

- [ ] T068 Create `frontend/src/components/ExcludePolygonEditor.tsx`:
  - Toggle button for "Add Exclude Mode"
  - When active, draw similar to polygon editor but with different color/style
  - List of drawn exclude polygons with delete buttons
  - Displays: primary area, total excluded area, net area
- [ ] T069 [P] Create `frontend/src/services/polygonService.ts` with functions:
  - `calculateNetArea(primaryVertices: GeoPoint[], excludeVertices: GeoPoint[][]): number`
  - `clampArea(value: number): number` (ensures non-negative)
- [ ] T070 [P] Update `frontend/src/models/index.ts` to add `excludePolygons: Polygon[]` to session state
- [ ] T071 Update `frontend/src/pages/App.tsx` to:
  - Track multiple polygons (primary + excludes) in state
  - Update displayed area to show net area
  - Render all polygons with distinct styles
- [ ] T072 Update `backend/src/SteelTree.GeoAcre.Web.Api/Models/GeoTypes.cs` to add POST `/geometry/calculate-area` request body: `{ primaryVertices, excludePolygons }`
- [ ] T073 Update `backend/src/SteelTree.GeoAcre.Web.Api/Controllers/GeometryController.cs` POST `/geometry/calculate-area` to:
  - Accept primary polygon and exclude polygons
  - Calculate net area (primary - intersection with excludes)
  - Return { areaSquareMeters, netAreaSquareMeters, excludedAreaSquareMeters, perSideLengthsMeters, hasIntersections }
- [ ] T074 [P] Implement intersection calculation in `SteelTree.GeoAcre.Geometry/GeoCalculations.cs` if not already done

**Checkpoint**: User Story 3 complete. Users can define multiple exclude areas and see the net usable area.

---

## Phase 6: User Story 4 - Fine-Tune Polygon Vertices (Priority: P4)

**Goal**: Users can drag individual vertices to refine polygon boundaries; all measurements update in real time.

**Independent Test**: Draw polygon, drag one vertex to new position, verify side lengths and area recalculate instantly.

### Tests for User Story 4

- [ ] T075 Create `frontend/src/components/__tests__/VertexEditor.test.tsx` with React Testing Library tests:
  - Vertex drag handler responds to mouse/touch events
  - Polygon redraws during drag
  - Area and side lengths update in real time
  - Map pan/zoom unaffected by vertex editing
- [ ] T076 [P] Create `frontend/src/services/__tests__/dragService.test.ts` with tests:
  - `startDrag(vertexIndex)` initializes drag state
  - `updateVertexPosition(lat, lon)` moves vertex and computes new measurements
  - `endDrag()` finalizes position

### Implementation for User Story 4

- [ ] T077 Update `frontend/src/components/MapContainer.tsx` to add vertex drag handlers:
  - Render draggable vertex handles (circles) at each vertex position
  - Listen for mousedown/touchstart on handles
  - On drag: update vertex position in real-time, recompute polygon, update display
  - On drag end: finalize position
- [ ] T078 [P] Create `frontend/src/services/dragService.ts` with functions:
  - `startDrag(vertexIndex: number): DragState`
  - `updateVertexPosition(dragState: DragState, latLng: LatLng): LatLng[]` (returns updated vertices)
  - `endDrag(dragState: DragState): void`
- [ ] T079 [P] Update `frontend/src/models/index.ts` to track dragging state if needed
- [ ] T080 Update `frontend/src/pages/App.tsx` to integrate vertex drag handlers and trigger area/distance recalculation on drag update

**Checkpoint**: User Story 4 complete. Users can fine-tune boundaries by dragging vertices; real-time feedback enhances precision.

---

## Phase 7: User Story 5 - Measure Distance Along a Polyline (Priority: P5)

**Goal**: Users can activate distance measurement mode, place start/intermediate/end points, and see cumulative and per-segment distances.

**Independent Test**: Switch to distance mode, click several points, verify each segment and total distance displayed correctly.

### Tests for User Story 5

- [ ] T081 [P] Create `frontend/src/services/__tests__/measurementService.test.ts` with tests:
  - `calculatePolylineDistance(vertices)` returns total distance in meters
  - `calculateSegmentDistances(vertices)` returns array of per-segment distances
  - Symmetry: Distance from A→B→A matches 2×Distance(A, B)
- [ ] T082 Create `frontend/src/components/__tests__/MeasurementTool.test.tsx` with React Testing Library tests:
  - Mode toggle button switches to measurement mode
  - Clicking map places measurement points
  - Polyline renders with segment labels
  - Total distance displays and updates
  - Clear button resets measurement

### Implementation for User Story 5

- [ ] T083 Create `frontend/src/services/measurementService.ts` with functions:
  - `calculatePolylineDistance(vertices: GeoPoint[]): number`
  - `calculateSegmentDistances(vertices: GeoPoint[]): number[]`
- [ ] T084 Create `frontend/src/components/MeasurementTool.tsx`:
  - Toggle button to activate/deactivate measurement mode
  - When active, clicking map adds measurement point
  - Renders polyline with segment labels and total distance
  - Clear button to reset
- [ ] T085 Update `frontend/src/pages/App.tsx` to:
  - Track current mode (polygon vs. measurement)
  - Display confirmation prompt when switching modes mid-draw
  - Render appropriate editor based on mode
- [ ] T086 Update `backend/src/SteelTree.GeoAcre.Web.Api/Controllers/GeometryController.cs` to add optional POST `/geometry/calculate-distance` endpoint:
  - Body: { vertices: [lat, lon][] }
  - Response: { totalDistanceMeters, perSegmentDistancesMeters }
- [ ] T087 [P] Create `backend/tests/integration/SteelTree.GeoAcre.Web.Api.Tests/DistanceControllerTests.cs` with tests:
  - POST /geometry/calculate-distance returns correct distance
  - Invalid input (< 2 vertices) returns 400 Bad Request

**Checkpoint**: User Story 5 complete. Users can measure distances along polylines independently of area polygons.

---

## Phase 8: User Story 6 - Configure Units of Measurement (Priority: P6)

**Goal**: Users can switch area and distance units; all displayed values immediately update.

**Independent Test**: Draw polygon in acres/feet, switch to hectares/meters, verify values convert correctly.

### Tests for User Story 6

- [ ] T088 [P] Create `backend/tests/unit/SteelTree.GeoAcre.Geometry.Tests/UnitConversionTests.cs` (if not already done) with comprehensive conversions
- [ ] T089 Create `frontend/src/services/__tests__/unitService.test.ts` with Vitest tests:
  - `convertArea(value, fromUnit, toUnit)` returns correct conversion
  - `convertDistance(value, fromUnit, toUnit)` returns correct conversion
  - Supported area units: acres, hectares, square feet, square meters
  - Supported distance units: feet, meters, miles, kilometers
  - Round-trip conversions match original (within rounding error)
- [ ] T090 Create `frontend/src/components/__tests__/UnitSelector.test.tsx` with React Testing Library tests:
  - Dropdowns display all supported units
  - Changing area unit updates all area displays
  - Changing distance unit updates all distance displays
  - Default values are acres and feet

### Implementation for User Story 6

- [ ] T091 Create `frontend/src/services/unitService.ts` with functions:
  - `convertArea(value: number, fromUnit: AreaUnit, toUnit: AreaUnit): number`
  - `convertDistance(value: number, fromUnit: DistanceUnit, toUnit: DistanceUnit): number`
  - Uses constants from backend or hardcoded conversion factors
- [ ] T092 Update `frontend/src/components/UnitSelector.tsx` to:
  - Display all area unit options: acres, hectares, square feet, square meters
  - Display all distance unit options: feet, meters, miles, kilometers
  - Trigger unit change event on selection
- [ ] T093 Update `frontend/src/pages/App.tsx` to:
  - Track selected units in state (UnitPreference)
  - On unit change, re-render all displays using new units
  - Persist unit selection to localStorage (optional but recommended)
- [ ] T094 [P] Update frontend service layer to use selected units when formatting area/distance (geometryService.ts, measurementService.ts)

**Checkpoint**: User Story 6 complete. All values update dynamically when units change; app is now usable internationally.

---

## Phase 9: User Story 7 - Export Session Data as JSON (Priority: P7)

**Goal**: Users can download or copy session data (polygons, measurements, units) as JSON for backup or future import.

**Independent Test**: Draw polygon with exclude, export JSON, verify file contains correct vertex coordinates and computed values.

### Tests for User Story 7

- [ ] T095 Create `frontend/src/services/__tests__/exportService.test.ts` with Vitest tests:
  - `exportSessionToJSON(session)` returns valid JSON string
  - JSON schema includes: schemaVersion, primaryPolygon, excludePolygons, measurements, units, timestamp
  - Coordinates are precise (6 decimal places minimum)
  - Computed values (area, distance) included
- [ ] T096 Create `frontend/src/components/__tests__/ExportButton.test.tsx` with React Testing Library tests:
  - Button disabled when no shapes drawn
  - Download button triggers file download
  - Copy button copies JSON to clipboard
  - Success notification displayed

### Implementation for User Story 7

- [ ] T097 Create `frontend/src/services/exportService.ts` with functions:
  - `exportSessionToJSON(session: SessionState): string` (returns stringified JSON)
  - `downloadJSON(data: string, filename: string): void` (triggers browser download)
  - `copyToClipboard(data: string): Promise<void>` (copies to clipboard API)
  - JSON schema: { schemaVersion: "1.0.0", exportedAt: ISO8601, primaryPolygon: {id, vertices, area, perimeter}, excludePolygons: [...], measurements: [...], units: {areaUnit, distanceUnit} }
- [ ] T098 Create `frontend/src/components/ExportButton.tsx`:
  - Download button calls `downloadJSON()`
  - Copy button calls `copyToClipboard()`
  - Disabled state when session is empty
  - Success/error notifications
- [ ] T099 Update `frontend/src/models/index.ts` to define JSON export schema TypeScript type: `SessionSnapshot`
- [ ] T100 Update `frontend/src/pages/App.tsx` to integrate ExportButton
- [ ] T101 [P] Create `frontend/src/types/schemas.ts` with JSON schema constants for version tracking

**Checkpoint**: User Story 7 complete. Users can preserve and share their session data.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements, edge case handling, deployment readiness

### Self-Intersection Detection & Warning

- [ ] T102 Update `frontend/src/components/MapContainer.tsx` to detect `polygon.hasIntersections` and render warning indicator (icon or banner)
- [ ] T103 [P] Update `frontend/src/components/PolygonDisplay.tsx` to show warning message when polygon self-intersects
- [ ] T104 Create `frontend/src/components/SelfIntersectionWarning.tsx` to display warning UI

### Mode Switching & Confirmation Dialogs

- [ ] T105 Create `frontend/src/components/ConfirmationDialog.tsx` for mode switching and polygon discard prompts
- [ ] T106 Update `frontend/src/pages/App.tsx` to show confirmation when:
  - User switches modes (area ↔ measurement) with in-progress shape
  - User starts new polygon with existing polygon already drawn
  - Message: "You have an [unfinished/existing] shape — discard it?"

### Error Handling & User Messages

- [ ] T107 Update `frontend/src/services/apiClient.ts` to handle API error responses (400, 429, 500, 503) and format user-friendly messages
- [ ] T108 Create `frontend/src/components/ErrorNotification.tsx` to display errors
- [ ] T109 Add `ErrorBoundary.tsx` for React error handling
- [ ] T110 [P] Update `backend/src/SteelTree.GeoAcre.Web.Api/Middleware/ErrorHandlingMiddleware.cs` to log and format errors appropriately

### Rate Limiting Configuration

- [ ] T111 Implement rate limiting in `backend/src/SteelTree.GeoAcre.Web.Api/Middleware/RateLimitingMiddleware.cs`:
  - Geocoding: 10 req/sec per IP
  - Geometry: 100 req/sec per IP
  - Global: 1000 req/hr per IP
- [ ] T112 [P] Add rate limit response headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)

### Responsive Design & Touch Support

- [ ] T113 Update `frontend/src/styles/globals.css` for responsive layout (mobile, tablet, desktop breakpoints)
- [ ] T114 Ensure touch event handlers in MapContainer work correctly on mobile (tap to place, long-press to drag)
- [ ] T115 [P] Test UX on small screens; adjust vertex handle size for touch accuracy

### Documentation & Developer Setup

- [ ] T116 Update `quickstart.md` with local dev setup instructions: `npm run dev`, `dotnet run`, `dotnet test`, `npm test`
- [ ] T117 [P] Create `backend/README.md` with .NET project structure and build/test instructions
- [ ] T118 [P] Create `frontend/README.md` with React project structure and build/test instructions
- [ ] T119 Create or update `docker-compose.yml` for local development (optional: containerize frontend and backend services)

### Azure Deployment

- [ ] T120 Create `frontend/staticwebapp.config.json` for Azure Static Web Apps deployment
- [ ] T121 [P] Create GitHub Actions workflow `.github/workflows/deploy.yml` to build and deploy:
  - Frontend to Azure Static Web Apps
  - Backend to Azure Functions or App Service
- [ ] T122 [P] Create `azure-pipelines.yml` as alternative CI/CD (if using Azure Pipelines instead)
- [ ] T123 Create `.env.example` with environment variables template (API_BASE_URL, etc.)

### Testing & CI/CD

- [ ] T124 [P] Set up code coverage reporting in `backend/` (Coverlet)
- [ ] T125 [P] Set up code coverage reporting in `frontend/` (Vitest coverage)
- [ ] T126 Add pre-commit hook to run linting and unit tests locally
- [ ] T127 [P] Configure CI/CD to run tests on each PR

### Final QA & Acceptance

- [ ] T128 Manual end-to-end testing: Draw polygon, add exclude, measure distance, export JSON
- [ ] T129 [P] Verify accuracy of area/distance calculations against known real-world data
- [ ] T130 [P] Test all error scenarios: network failures, invalid input, rate limiting
- [ ] T131 Cross-browser testing: Chrome, Firefox, Edge, Safari (if available)
- [ ] T132 [P] Accessibility audit: Keyboard navigation, screen reader support (WCAG 2.1 AA target)

**Checkpoint**: Application complete, tested, and ready for production deployment.

---

## Dependencies & Parallel Execution Strategy

### Phase 1→2 Dependency
- All Phase 2 tasks depend on Phase 1 completion (projects created, structure ready)

### Phase 2 Parallelization
- Geometry library tasks (T014-T031) can run mostly in parallel within the library
- API infrastructure (T032-T035) can run in parallel with geometry
- Frontend infrastructure (T036-T039) can run in parallel with both

### Phase 3+ User Story Parallelization
Within each user story phase (P1-P7):
- All marked [P] tasks can run in parallel (different files, no dependencies)
- Non-[P] tasks may depend on earlier tasks in same phase

**Suggested MVP Scope**: Complete Phases 1-3 (Setup + Foundational + P1) to deliver core area estimation. This enables the app to be used at its most basic level.

**Incremental Delivery Order**: P1 → P2 → P3 → P4 → (P5, P6 in parallel) → P7 → Polish

---

## Test Summary

- **Unit Tests**: 40+ tests covering geometry algorithms, conversions, validations
- **Integration Tests**: 15+ tests covering API endpoints, frontend-backend communication
- **Component Tests**: 10+ tests covering React components and user interactions
- **Total Test Count**: ~65 tests (TDD ensures all production code is tested)

**Test Execution**:
- Backend: `dotnet test`
- Frontend: `npm test`

**Coverage Goals**:
- Backend geometry library: >95% coverage (accuracy-critical)
- Backend API controllers: >85% coverage
- Frontend components: >75% coverage
