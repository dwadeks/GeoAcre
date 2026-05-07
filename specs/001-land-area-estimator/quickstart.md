# Quickstart: Land Area Estimator

**Goal**: Get a development environment running and understand the project structure.  
**Time to first run**: ~15 minutes  
**Prerequisites**: Node.js 18+, .NET 10 SDK, Docker (optional)

---

## 1. Clone & Set Up

```bash
# Clone the repository (assumes you're on branch 001-land-area-estimator)
git clone https://github.com/dwadeks/GeoAcre.git
cd GeoAcre

# Verify you're on the feature branch
git branch  # Should show: * 001-land-area-estimator

# Install frontend dependencies
cd frontend
npm install
npm run build  # Verify build succeeds

# Install backend dependencies
cd ../backend
dotnet restore

# Return to repo root
cd ..
```

---

## 2. Local Development Setup

### Frontend (React + TypeScript + Leaflet)

```bash
cd frontend

# Start dev server
npm run dev
# Output: App running at http://localhost:5173

# In another terminal, run linter
npm run lint

# Run tests
npm run test
```

**Expected behavior**: 
- Browser opens with map centered on a default location (e.g., Springfield, IL)
- Map is pannable and zoomable
- "Draw Polygon" button is visible

### Backend (ASP.NET Core 10)

```bash
cd backend

# Run in debug mode
dotnet run

# Output: Now listening on: https://localhost:5001 http://localhost:5000
```

**Expected behavior**:
- Server starts without errors
- Swagger UI available at http://localhost:5000/swagger

### Verify Backend API

```bash
# Test geocoding endpoint
curl -X POST http://localhost:5000/api/geocode/search \
  -H "Content-Type: application/json" \
  -d '{"query": "123 Main St, Springfield, IL"}'

# Expected response:
# {
#   "results": [
#     {
#       "displayName": "...",
#       "latitude": 39.7817,
#       "longitude": -89.6501
#     }
#   ]
# }
```

---

## 3. Architecture Overview

```
Land Area Estimator
├── Frontend (React/TS) — React components, map UI, polygon drawing
│   ├── Calls API for geocoding
│   ├── Uses Turf.js for client-side calculations (fast feedback)
│   └── Exports session as JSON
│
└── Backend (.NET 10 API) — Geocoding service, validation
    ├── SteelTree.GeoAcre.Geometry library (core calculations)
    ├── Geocoding service (Nominatim)
    └── Optional: Validation endpoints for exported data
```

**Data Flow**:
1. User enters address → Frontend calls `/api/geocode/search` → Nominatim (via backend) → Map centers
2. User draws polygon → Frontend calculates area instantly (Turf.js) → Displayed in UI
3. User exports session → Frontend downloads JSON with all polygon vertices and computed values
4. (Future v2) User imports JSON + creates account → Server validates and persists

---

## 4. Running Tests

### Frontend Unit Tests

```bash
cd frontend

# Run Vitest
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

**Expected**: Tests for MapService, GeometryService, and React components pass.

### Backend Unit Tests

```bash
cd backend

# Run MSTest
dotnet test

# Run with coverage
dotnet test /p:CollectCoverage=true
```

**Expected**: Tests for GeoCalculations (distance, area, intersections) all pass with >95% accuracy.

### Integration Tests

```bash
cd backend/tests/integration

# Run integration tests (connects to real Nominatim)
dotnet test

# Note: These tests may be slower (~5 sec per geocoding request)
```

---

## 5. Key Files & Directories

| Path | Purpose |
|------|---------|
| `frontend/src/components/PolygonEditor.tsx` | Main polygon drawing UI |
| `frontend/src/services/mapService.ts` | Leaflet wrapper |
| `frontend/src/services/geometryService.ts` | Turf.js calculations |
| `backend/src/SteelTree.GeoAcre.Geometry/` | Core geometry library (C#) |
| `backend/src/GeoAcre.Api/` | ASP.NET Core API |
| `specs/001-land-area-estimator/` | Specification, design docs, contracts |

---

## 6. Common Tasks

### Add a new unit story (e.g., P5 Distance Measurement)

1. Implement React component in `frontend/src/components/MeasurementTool.tsx`
2. Add tests in `frontend/tests/unit/components/MeasurementTool.test.tsx`
3. Run tests; ensure all pass before committing

### Modify geometry calculations

1. Update `backend/src/SteelTree.GeoAcre.Geometry/GeoCalculations.cs`
2. Update unit tests in the same directory
3. Run `dotnet test` to verify accuracy
4. Update frontend Turf.js calls if behavior changes

### Deploy to Azure

```bash
# Prerequisites: Azure CLI logged in
az login

# Deploy frontend to Static Web Apps
cd frontend
npm run build
az staticwebapp upload-and-build \
  --app-location "frontend" \
  --api-location "backend"

# Or use GitHub Actions (workflow already configured)
```

---

## 7. Debugging

### Frontend Debugging

```bash
# Set breakpoints in VS Code
# 1. Open VS Code
# 2. Set breakpoint in TypeScript file
# 3. Run: npm run dev
# 4. Open http://localhost:5173 in browser
# 5. Trigger breakpoint; debugger pauses in VS Code
```

### Backend Debugging

```bash
# Debug in VS Code
# 1. Press F5 or click "Run & Debug"
# 2. Select ".NET" from dropdown
# 3. Set breakpoint in C# code
# 4. HTTP requests from frontend or curl trigger breakpoint
```

---

## 8. Troubleshooting

| Issue | Solution |
|-------|----------|
| **Frontend won't start** | Run `npm install` again; check Node.js version (18+) |
| **Backend fails to run** | Run `dotnet restore`; check .NET SDK version (10+) |
| **Map not loading** | Check browser console for Leaflet/Nominatim errors; verify API key if using private tile server |
| **Geocoding returns no results** | Nominatim may be rate-limited; try again after 1 minute; test with simpler address |
| **Tests fail** | Run `npm run lint` / `dotnet format` to fix formatting issues |

---

## 9. Code Style & Conventions

### TypeScript (Frontend)

- Strict mode enabled (`"strict": true` in tsconfig.json)
- No `any` without documented exception
- Use Prettier (run `npm run format` before commit)
- Lint: ESLint (run `npm run lint`)

### C# (Backend)

- Follow Microsoft naming conventions (PascalCase for public members)
- Use nullability annotations (`#nullable enable`)
- Unit test naming: `MethodName_Scenario_ExpectedResult`
- Format: `dotnet format` (run before commit)

---

## 10. Next Steps

1. **Implement User Story 1** (P1: Draw Polygon and Measure Area)
   - Start with React PolygonEditor component
   - Write failing tests first (TDD)
   - Implement until tests pass

2. **Implement User Story 2** (P2: Navigate to Location)
   - Wire up geocoding API call
   - Add address search UI

3. Continue with remaining stories (P3–P7)

See `tasks.md` for detailed task breakdown and dependencies.

---

## 11. Documentation & References

- **Specification**: `specs/001-land-area-estimator/spec.md`
- **Architecture**: This file + `data-model.md` + `plan.md`
- **API Contract**: `contracts/api-contract.md`
- **Geometry Library**: `contracts/geometry-library.md`
- **React Docs**: https://react.dev
- **Leaflet Docs**: https://leafletjs.com
- **Turf.js Docs**: https://turfjs.org
- **ASP.NET Core Docs**: https://learn.microsoft.com/en-us/aspnet/core/

---

**Ready to start?** Pick a user story from tasks.md and begin with the failing test (TDD).
