# Implementation Plan: Legal Description Mapping (V2)

**Branch**: `002-legal-description-mapping` | **Date**: 2026-05-11 (amended 2026-05-13) | **Spec**: `/specs/002-legal-description-mapping/spec.md`
**Input**: Feature specification from `/specs/002-legal-description-mapping/spec.md`

## Summary

Deliver a third workflow mode, `Legal Description`, that accepts exactly one input source (pasted text or uploaded image), interprets legal descriptions into tract geometry, renders read-only boundaries, and exports mode-specific JSON. Third-party dependencies (OCR, legal interpretation, geocoding) are isolated behind interfaces/adapters to preserve provider swap flexibility and align with future Azure deployment.

## Plan Amendment: 2026-05-13

This amendment preserves the full feature plan scope and sets the next implementation target:

- **Next build item**: implement `ILegalDescriptionInterpreter` in `backend/src/SteelTree.GeoAcre.Geocoding/ProviderAdapters/PlaceholderLegalDescriptionInterpreter.cs`.
- **Interpreter rule**: legal text prefixes such as `Tract II:` and `Tract IV:` are non-semantic and must be ignored when present.
- **Validation expectation**: interpretation should succeed for fixture-like legal text whether those prefixes exist or not.
- **Execution order**:
  1. Add/extend failing tests for interpreter behavior (including prefix-present and prefix-absent equivalence).
  2. Implement interpreter parsing and diagnostics logic.
  3. Verify downstream boundary mapping remains read-only and provenance-preserving.

## Technical Context

**Language/Version**: C# (.NET 10) backend + TypeScript (strict) frontend  
**Primary Dependencies**: ASP.NET Core 10, React 18 + Vite, Leaflet, Turf.js, Axios, Swashbuckle/OpenAPI  
**Storage**: N/A for v2 (stateless request/response; no persistence)  
**Testing**: MSTest + FluentAssertions (backend), Vitest + Testing Library (frontend), integration tests under `backend/tests/integration`  
**Target Platform**: Web browsers for SPA; Linux-hosted ASP.NET Core API; planned Azure deployment (Azure Static Web Apps + Azure App Service/Container Apps)  
**Project Type**: Web application (frontend + backend + shared libraries)  
**Performance Goals**: Legal-description submission to rendered boundary in <= 3 minutes for readable inputs; mode switch UI response < 200ms; API p95 < 1.5s excluding external OCR latency  
**Constraints**: Exactly one legal-description input source per submission; interpreted boundary is auto-finalized read-only; preserve v1 draw/measure behavior; isolate third-party providers behind interfaces; design for Azure-ready configuration and secret handling  
**Scale/Scope**: Single feature slice across existing `frontend/` and `backend/`; 3 UI modes; mode-specific export schema contracts; external OCR/interpretation provider integration points

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Pre-Phase 0 gate evaluation:

- **I. Library-First**: PASS. New parsing/interpretation behavior is planned as library abstractions (`SteelTree.GeoAcre.Geocoding` extension + new legal-description service interface contracts) before API/controller wiring.
- **II. TDD (NON-NEGOTIABLE)**: PASS (planned). New public APIs and mode behaviors are test-first in unit/integration suites; failing tests required before implementation.
- **III. Object-Oriented Design**: PASS. External providers are represented by interfaces and injected implementations; mode orchestration remains in service classes.
- **IV. Integration Testing**: PASS (planned). Contract/integration tests cover mode-specific API paths and provider boundary adapters.
- **V. Simplicity (YAGNI)**: PASS. Provider abstraction is limited to required third-party touchpoints only (OCR, legal parsing, geocoding), avoiding speculative domain frameworks.

Post-Phase 1 gate re-check:

- **I. Library-First**: PASS. Data model and contracts define interface-first boundaries for third-party integrations.
- **II. TDD**: PASS. Quickstart and design artifacts define explicit red-green-refactor workflow for each story.
- **III. OOD**: PASS. Contracts keep side-effectful provider calls in adapter layers and preserve pure geometry/domain components.
- **IV. Integration Testing**: PASS. API contracts + provider contracts include integration-test targets.
- **V. Simplicity**: PASS. No additional constitution exceptions needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-legal-description-mapping/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-contract.md
│   └── legal-description-provider-contract.md
└── tasks.md               # Created later by /speckit.tasks
```

### Source Code (repository root)

```text
backend/
├── GeoAcre.sln
├── src/
│   ├── SteelTree.GeoAcre.Geometry/              # Geometry library (unchanged)
│   ├── SteelTree.GeoAcre.Geocoding/             # Legal description services (refactored)
│   ├── SteelTree.GeoAcre/                       # GeoAcre domain services (refactored)
│   ├── SteelTree.GeoAcre.Web.Api/               # API host (refactored for new OCR projects)
│   ├── SteelTree.Ocr/                           # OCR abstraction library (standalone)
│   └── SteelTree.Ocr.AzureDocumentIntelligence/ # Azure DI implementation (standalone)
└── tests/
    ├── SteelTree.GeoAcre.Geometry.Tests/
    ├── SteelTree.GeoAcre.Web.Api.Tests/
    ├── integration/
    │   ├── SteelTree.GeoAcre.Web.Api.Tests/
    │   └── SteelTree.Ocr.AzureDocumentIntelligence.Tests/

frontend/
├── src/
│   ├── components/
│   ├── models/
│   ├── pages/
│   ├── services/
│   └── tests/
└── staticwebapp.config.json
```

**Structure Decision**: Keep the existing web-application split (`frontend` + `backend`) and add legal-description mode behavior through service abstractions and contracts instead of introducing new host applications. OCR functionality is extracted into standalone projects (`SteelTree.Ocr` abstraction + `SteelTree.Ocr.AzureDocumentIntelligence` implementation) to prepare for future NuGet packaging while maintaining solution-level project references.

## Phase 0: Research Output

Research completed in `/specs/002-legal-description-mapping/research.md` with technical unknowns resolved, including:

- OCR + legal-interpretation provider strategy with interface abstraction.
- Input validation policy for mutually exclusive source selection.
- Export-schema separation per mode.
- Azure-ready deployment and configuration baseline.

## Phase 1: Design & Contracts Output

Generated artifacts:

- `/specs/002-legal-description-mapping/data-model.md`
- `/specs/002-legal-description-mapping/quickstart.md`
- `/specs/002-legal-description-mapping/contracts/api-contract.md`
- `/specs/002-legal-description-mapping/contracts/legal-description-provider-contract.md`

Agent context updated in `.github/copilot-instructions.md` to point to this feature plan and artifacts.

## Phase 2: Implementation Strategy (Planning Only)

### Core Feature Implementation

1. Add/extend backend service interfaces for legal-description ingestion and third-party adapter boundaries.
2. Add API endpoint(s) for legal-description interpretation with strict one-source validation and read-only output metadata.
3. Add frontend mode selector behavior and mode-specific sidebars in required order.
4. Implement mode-specific JSON export mappers and validation guards.
5. Add test-first coverage per story (frontend unit, backend unit, backend integration).
6. Preserve existing v1 behavior and verify non-regression in draw/measure paths.

### OCR Project Extraction (Standalone Library)

1. Create/maintain `SteelTree.Ocr` abstraction project for generic OCR contracts.
2. Create/maintain `SteelTree.Ocr.AzureDocumentIntelligence` implementation project for Azure OCR adapter wiring.
3. Keep GeoAcre domain concerns out of OCR standalone libraries.
4. Validate solution references and integration test coverage for OCR provider behavior.

### Current Priority Amendment

1. Implement `ILegalDescriptionInterpreter` next.
2. Ensure tract-heading normalization ignores optional prefix labels (`Tract II:`, `Tract IV:`).
3. Confirm equivalent interpretation behavior for heading-present and heading-absent variants of the same legal text.

## Complexity Tracking

No constitution violations identified; table not required.
