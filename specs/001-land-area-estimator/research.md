# Research: Land Area Estimator

**Date**: 2026-05-07  
**Purpose**: Resolve Technical Context unknowns before Phase 1 design

## Research Tasks

### 1. Map Library Choice: Google Maps API vs. Leaflet + OpenStreetMap

**Unknowns**:
- Should the app use Google Maps JavaScript API or Leaflet with OpenStreetMap tiles?
- Cost, performance, and licensing implications?

**Options & Analysis**:

| Factor | Google Maps API | Leaflet + OpenStreetMap |
|--------|-----------------|------------------------|
| **Cost** | Pay-per-use (after free tier); $7 per 1000 map loads (typical); ~$100-500/month for moderate usage | Free (Leaflet library); OSM tiles free (community-supported) |
| **Licensing** | Google Terms of Service; requires API key; data © Google | Open Source (MIT); OSM data © ODbL |
| **Developer Experience** | High-level API; extensive documentation; vector/raster tiles; built-in address search | Lightweight; modular; active community; plugins available |
| **Feature Completeness** | Drawing tools, geocoding, routing all included or easy via extensions | Drawing (Leaflet Draw plugin), geocoding (via external service), flexible |
| **Geometry Accuracy** | Excellent; handles projections well | Good; standard Web Mercator; requires care for lat/long calculations |
| **Offline Support** | Limited (requires cached tiles) | Excellent (store tiles locally; no API calls) |
| **Future Scalability** | Cost increases with usage | Scales with server resources; no per-request fee |

**Recommendation**: Use **Leaflet + OpenStreetMap** as the base layer, with an **optional Google Geocoding API** for address search only (if needed). Rationale:
1. Cost control (critical for v1 MVP with unknown user load)
2. Avoids vendor lock-in
3. Offline-capable (supports future mobile/offline scenarios)
4. Geometry calculations remain ours (not hidden in Google's black box)
5. Can swap geocoding providers if needed

**Decision**: Leaflet.js + OpenStreetMap tiles (via Mapbox or similar CDN); Nominatim (free, OSM-backed) for address geocoding in Phase 1.

---

### 2. Geocoding Service: Nominatim vs. Google vs. Azure

**Unknowns**:
- Which geocoding service (address → lat/long and vice versa) should the backend use?

**Options**:

| Service | Cost | Accuracy | Rate Limits | Latency | Notes |
|---------|------|----------|-------------|---------|-------|
| **Nominatim** (OSM) | Free | Good (US ~0.1 km) | 1 req/sec (free tier) | 200–500ms | Community-run; acceptable for v1 |
| **Google Geocoding API** | $0.50 per 1000 requests (after free tier) | Excellent | 50 req/sec | 50–200ms | Premium; paid; highest accuracy |
| **Azure Maps** | $0.50–2.50 per 1000 requests (Search API) | Good | 50 req/sec | 100–300ms | Integrated with Azure ecosystem if hosted there |

**Recommendation**: Start with **Nominatim** (free, OSM data). If future user demand requires higher throughput/accuracy, switch to Google or Azure. Backend API abstraction makes this painless.

**Decision**: Nominatim for v1; abstract geocoding service behind an interface so provider can be swapped in tasks.md.

---

### 3. Geometry Calculations: Client-Side vs. Server-Side

**Unknowns**:
- Should area/distance calculations happen in the browser (TypeScript) or on the backend (C#)?

**Options**:

| Aspect | Client-Side | Server-Side | Hybrid |
|--------|-------------|------------|--------|
| **Performance** | Instant (<50ms); no network round-trip | Network latency (~200ms); server load | Best of both; offload heavy calculations |
| **Accuracy** | Must use geodetic library; harder to debug | Centralized; easier testing | Risk of inconsistency |
| **Code Reuse** | TypeScript only; duplicates C# logic | C# Geometry library; consistent | Geometry lib in C#; expose via API |
| **Offline** | Works offline | Requires network | Requires network for complex ops |
| **Maintenance** | Synchronize TS + C# implementations | Single source of truth | Single source (C#) + thin TS wrapper |

**Recommendation**: **Hybrid approach**:
- **Client-side**: Simple area/distance calculations using Turf.js (lightweight, fast) for UX responsiveness.
- **Server-side**: SteelTree.GeoAcre.Geometry library for validation and archival (when data is exported/saved).
- **Benefit**: Fast UI, validated backend, single-source-of-truth for complex geometry.

**Decision**: Turf.js (TypeScript) for client; SteelTree.GeoAcre.Geometry (C#) in backend for tests and future export validation.

---

### 4. Deployment Model & Hosting

**Unknowns**:
- Where should the app be hosted? (Azure, AWS, Vercel, GitHub Pages, etc.)
- Can the app be truly serverless, or does it need a persistent backend?

**Current Scope**:
- v1: No persistence, stateless, no authentication
- Frontend: Static SPA (can be on any CDN)
- Backend: Stateless API (geocoding only in MVP)

**Options**:

| Model | Frontend | Backend | Cost (Monthly) | Notes |
|-------|----------|---------|----------------|-------|
| **Azure Static Web Apps + Functions** | SWA (free tier available) | Azure Functions (pay-per-execution) | $0–50 | Native C#; integrated with Azure ecosystem |
| **Vercel (frontend) + Azure Functions** | Vercel (free tier) | Azure Functions | $0–30 | Frontend optimized; mix of platforms |
| **GitHub Pages + Cloud Run** | GitHub Pages (free) | Google Cloud Run (free tier) | $0–20 | Multi-cloud; flexible |
| **Self-hosted** | Any server | .NET 10 app + Docker | $10–50+ | Full control; maintenance burden |

**Recommendation for v1**: Use **Azure Static Web Apps + Azure Functions** for simplicity and consistency with GeoAcre's likely Azure focus. Alternative: GitHub Pages + Vercel for multi-cloud flexibility.

**Decision**: Target Azure Static Web Apps + Azure Functions for v1 (can migrate later if needed).

---

### 5. Testing Strategy for Geometry Library

**Unknowns**:
- How to test area/distance calculations for accuracy without real surveyed data?

**Approach**:
1. Use known geographic polygons (e.g., city blocks, well-measured properties) as test cases.
2. Cross-validate with online GIS tools (e.g., geojson.io, QGIS).
3. Unit tests for even-odd fill rule with self-intersecting polygons.
4. Property-based tests (QuickCheck-style) for polygon invariants.

**Decision**: Unit tests with known reference areas; integration tests against Nominatim + real coordinates; property-based tests for polygon math edge cases.

---

## Decisions Locked

| Item | Decision | Rationale |
|------|----------|-----------|
| Map Library | Leaflet.js + OpenStreetMap | Cost, flexibility, offline support, no vendor lock-in |
| Geocoding Service | Nominatim (OSM) | Free; acceptable accuracy for v1; swappable later |
| Geometry Calculations | Turf.js (client) + SteelTree.GeoAcre.Geometry (backend) | Fast UX + validated results + DRY principle |
| Deployment | Azure Static Web Apps + Azure Functions | Aligned with constitution; simple; C# native |
| Testing | Unit + Integration + Property-based | Accuracy critical; comprehensive coverage needed |

---

## Open Questions for Phase 1

1. Should the Leaflet.js drawing library be Leaflet.Draw or a custom implementation?
   → TBD in Design phase (depends on UI/UX mockup complexity)
2. Does backend API need caching for geocoding results?
   → Probably not for v1 (stateless); re-evaluate if repeat queries are common
3. Should geometry library be published as NuGet package?
   → Deferred to v2 (v1 keeps it internal to the project)
