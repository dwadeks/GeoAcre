# Implementation Plan: Land Area Estimator

**Branch**: `001-land-area-estimator` | **Date**: 2026-05-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-land-area-estimator/spec.md`

## Summary

A web application for measuring land area and distance by drawing polygons and polylines on an interactive map. Users navigate to a location (address or lat/long), draw a polygon by clicking corners, see the area in acres and side lengths in feet (configurable units). Features include exclude polygons (to subtract house/pond), vertex dragging for fine-tuning, distance-measurement mode, and JSON export of session data. Desktop-first; mobile-aware interaction design. No server-side persistence in v1, but data model is export-ready for future persistence or import features.

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x (strict mode required)
- Backend: C# with .NET 10 (SteelTree.GeoAcre namespace prefix)

**Primary Dependencies**:
- Frontend: React 18.x, interactive map library (Google Maps API **OR** Leaflet/OpenStreetMap — TBD in Phase 0), TypeScript strict mode
- Backend: ASP.NET Core 10 for geocoding/reverse-geocoding API, geographic calculation libraries

**Storage**: Session-only for v1 (in-memory or browser local storage); no database required. Exported JSON is user-downloadable.

**Testing**:
- Frontend: Vitest with React Testing Library for component/integration tests
- Backend: Microsoft Testing Platform (MSTest) with FluentAssertions

**Target Platform**: Web browsers (Chrome, Firefox, Edge, Safari); desktop-first, mobile-aware with touch-optimized interactions

**Project Type**: Web application (frontend SPA + backend API)

**Performance Goals**:
- Map interactions (pan, zoom, vertex drag): <100ms response
- Area/distance recalculation (on vertex move): <50ms
- Address geocoding: <5 seconds (including network latency)

**Constraints**:
- No user authentication required (stateless, public tool)
- Area/distance calculations must be geodetically correct (account for Earth's curvature)
- Self-intersecting polygons use even-odd fill rule; warning displayed
- Export data must be portable JSON (schema version included)

**Scale/Scope**:
- Single user per session (no multi-user collaboration in v1)
- Unlimited polygon vertices (but practical UI limit ~50 for usability)
- Support for up to 10 exclude polygons per session (no hard limit, UX concern)
- ~15 functional requirements, 7 user stories, 6 screens/modes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance vs. GeoAcre Constitution v1.0.1

| Principle | Requirement | Status | Justification |
|-----------|-------------|--------|--------------|
| **I. Library-First** | Geometry/calculation logic must be a standalone library | ✅ PASS | Backend API wraps SteelTree.GeoAcre.Geometry library; frontend React components are separate concern |
| **II. TDD** | All production code requires failing tests first | ✅ PASS | Spec requirement section will enforce with contract + integration tests; unit tests for all geometric calculations |
| **III. OOP** | Code organized in classes/objects; SRP applied | ✅ PASS | C# backend classes (Polygon, Measurement, GeoPoint, etc.); TypeScript React components (PolygonDrawer, MapContainer, etc.) |
| **IV. Integration Testing** | Library contracts require integration tests | ✅ PASS | Geometry library will have contract tests; frontend-backend API integration tests mandatory |
| **V. Simplicity (YAGNI)** | No speculative abstractions | ✅ PASS | MVP scope clear; no multi-tenancy, no real-time collaboration, no complex caching |
| **Naming (C#)** | All C# assemblies begin with SteelTree.GeoAcre | ✅ PASS | Backend: SteelTree.GeoAcre.Geometry, SteelTree.GeoAcre.Geocoding, etc. |
| **Testing (C#)** | Use Microsoft Testing Platform + FluentAssertions | ✅ PASS | Specified in Technical Context |
| **TypeScript** | Strict mode enabled; no `any` without exception | ✅ PASS | Will be enforced in frontend tsconfig.json |

### Gate Evaluation

✅ **No violations; no exceptions required.** The feature aligns with all five core principles and technology stack standards.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-land-area-estimator/
├── plan.md                   # This file
├── research.md               # Phase 0 output (map library choice, geocoding service, etc.)
├── data-model.md             # Phase 1 output (Polygon, Measurement, GeoPoint, etc.)
├── contracts/
│   ├── api-contract.md       # HTTP API endpoints
│   └── geometry-library.md   # Geometry library public surface
├── quickstart.md             # Phase 1 output (dev setup, first run)
└── checklists/
    └── requirements.md       # Quality checklist (already completed in Specify phase)
```

### Source Code (Single Project: Web App + Backend API)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── MapContainer.tsx
│   │   ├── PolygonEditor.tsx
│   │   ├── MeasurementTool.tsx
│   │   ├── UnitSelector.tsx
│   │   └── ExportButton.tsx
│   ├── pages/
│   │   └── App.tsx
│   ├── services/
│   │   ├── mapService.ts       # Map SDK wrapper
│   │   ├── geocodingService.ts # Calls backend API
│   │   ├── geometryService.ts  # Client-side calculations (or calls backend)
│   │   └── apiClient.ts
│   ├── models/
│   │   └── GeoTypes.ts         # Shared TypeScript types (Polygon, Measurement, etc.)
│   ├── styles/
│   └── index.tsx
├── tests/
│   ├── unit/
│   │   └── services/
│   ├── integration/
│   │   └── api.integration.test.ts
│   └── vitest.config.ts
├── tsconfig.json               # strict: true
├── eslint.config.js
├── prettier.config.js
└── package.json

backend/
├── src/
│   ├── SteelTree.GeoAcre.Geometry/
│   │   ├── Polygon.cs
│   │   ├── Measurement.cs
│   │   ├── GeoPoint.cs
│   │   ├── GeoCalculations.cs
│   │   └── GeoCalculations.Tests.cs (unit tests)
│   ├── SteelTree.GeoAcre.Geocoding/
│   │   ├── GeocodeService.cs
│   │   ├── ReverseGeocodeService.cs
│   │   └── [service].Tests.cs
│   └── SteelTree.GeoAcre.Web.Api/
│       ├── Controllers/
│       │   ├── GeocodingController.cs
│       │   └── MeasurementController.cs
│       ├── Services/
│       └── Program.cs
├── tests/
│   ├── unit/
│   └── integration/
├── GeoAcre.sln
├── Directory.Build.props        # Common settings (TargetFramework, LangVersion, etc.)
└── azure-pipelines.yml or GitHub Actions workflow

root/
├── docker-compose.yml          # Local dev: backend + frontend
├── .gitignore
├── README.md
```

**Structure Decision**: Web application with separate frontend (React/TypeScript SPA) and backend (.NET 10 API). Frontend owns map rendering, vertex editing UI, and basic calculations; backend owns geocoding service and provides validation/secondary calculations. Geometry library (SteelTree.GeoAcre.Geometry) is a shared C# library consumed by both backend API tests and potentially desktop tooling later.

---

## Complexity Tracking

> No violations of Constitution Check; no complexity exceptions needed.

---

## Next Steps (Phases 0–1)

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
