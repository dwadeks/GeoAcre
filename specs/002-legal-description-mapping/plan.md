# Implementation Plan: Legal Description Mapping (V2)

**Branch**: `002-legal-description-mapping` | **Date**: 2026-05-11 | **Spec**: `/specs/002-legal-description-mapping/spec.md`
**Input**: Feature specification from `/specs/002-legal-description-mapping/spec.md`

## Summary

Deliver a third workflow mode, `Legal Description`, that accepts exactly one input source (pasted text or uploaded image), interprets legal descriptions into tract geometry, renders read-only boundaries, and exports mode-specific JSON. Third-party dependencies (OCR, legal interpretation, geocoding) will be isolated behind interfaces/adapters to preserve provider swap flexibility and align with future Azure deployment.

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
- **III. Object-Oriented Design**: PASS. External providers will be represented by interfaces and injected implementations; mode orchestration remains in service classes.
- **IV. Integration Testing**: PASS (planned). Contract/integration tests will cover mode-specific API paths and provider boundary adapters.
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
│   ├── SteelTree.Ocr/                           # NEW: OCR abstraction library (standalone)
│   └── SteelTree.Ocr.AzureDocumentIntelligence/ # NEW: Azure DI implementation (standalone)
└── tests/
    ├── SteelTree.GeoAcre.Geometry.Tests/
    ├── SteelTree.GeoAcre.Web.Api.Tests/
    ├── integration/
    │   ├── SteelTree.GeoAcre.Web.Api.Tests/
    │   └── SteelTree.Ocr.AzureDocumentIntelligence.Tests/ # NEW: OCR integration tests

frontend/
├── src/
│   ├── components/
│   ├── models/
│   ├── pages/
│   ├── services/
│   └── tests/
└── staticwebapp.config.json
```

**Structure Decision**: Keep the existing web-application split (`frontend` + `backend`) and add legal-description mode behavior through service abstractions and contracts instead of introducing new host applications. **NEW**: Extract OCR functionality into standalone projects (`SteelTree.Ocr` abstraction + `SteelTree.Ocr.AzureDocumentIntelligence` implementation) to prepare for future NuGet packaging while maintaining solution-level project references. The `SteelTree.Ocr` project contains all OCR contracts (ILegalDescriptionOcrService, OcrExtractionResult, OcrProviderOptions, etc.) and is referenced by `SteelTree.GeoAcre` services. The `SteelTree.Ocr.AzureDocumentIntelligence` project is referenced only by `SteelTree.GeoAcre.Web.Api` for dependency injection registration.

## Phase 0: Research Output

Research completed in `/specs/002-legal-description-mapping/research.md` with all technical unknowns resolved, including:

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

### OCR Project Extraction (New Standalone Library)

This phase includes extraction of OCR functionality into reusable, standalone projects to prepare for future NuGet packaging:

**Phase 2a: Create `SteelTree.Ocr` Abstraction Project**
- Create new project `backend/src/SteelTree.Ocr/` (.NET 10 Class Library)
- Move OCR contracts from `SteelTree.GeoAcre.Ocr` namespace:
  - `ILegalDescriptionOcrService` interface
  - `OcrExtractionResult` class
  - `OcrProviderOptions` class
- Add project to `GeoAcre.sln`
- No external dependencies except .NET Base Class Library

**Phase 2b: Create `SteelTree.Ocr.AzureDocumentIntelligence` Implementation Project**
- Create new project `backend/src/SteelTree.Ocr.AzureDocumentIntelligence/` (.NET 10 Class Library)
- Move OCR implementation from `SteelTree.GeoAcre.Ocr.AzureDocumentIntelligence`:
  - `AzureDocumentIntelligenceOcrService` class
  - `AddAzureDocumentIntelligenceOcr()` extension method
- Add project to `GeoAcre.sln`
- Project dependencies: `SteelTree.Ocr`, `Azure.AI.FormRecognizer` (v4.1.0+)

**Phase 2c: Delete Legacy OCR Project**
- Remove `SteelTree.GeoAcre.Ocr.AzureDocumentIntelligence` project from solution and disk

**Phase 2d: Refactor GeoAcre Projects for New OCR Projects**
- Update `SteelTree.GeoAcre` project:
  - Add project reference to `SteelTree.Ocr`
  - Remove project reference to `SteelTree.GeoAcre.Ocr.AzureDocumentIntelligence` (if present)
  - Update imports: `using SteelTree.Ocr;` where applicable
- Update `SteelTree.GeoAcre.Web.Api` project:
  - Add project reference to `SteelTree.Ocr.AzureDocumentIntelligence`
  - Remove project reference to `SteelTree.GeoAcre.Ocr.AzureDocumentIntelligence`
  - Update `Program.cs` DI registration: import from new project namespace
- Update test projects:
  - Update imports in `SteelTree.GeoAcre.Web.Api.Tests` to use `SteelTree.Ocr` for mocking
  - Update imports in integration tests to use `SteelTree.Ocr` contracts

**Phase 2e: Create Integration Tests for SteelTree.Ocr.AzureDocumentIntelligence**
- Create new test project `backend/tests/integration/SteelTree.Ocr.AzureDocumentIntelligence.Tests/` (.NET 10 xUnit project)
- Project dependencies: `SteelTree.Ocr`, `SteelTree.Ocr.AzureDocumentIntelligence`, `FluentAssertions`
- Create test data directory: `backend/tests/integration/SteelTree.Ocr.AzureDocumentIntelligence.Tests/TestData/` with sample documents:
  - `tract-ii.txt`: Sample Tract II legal description (Northwest Corner of Lot Three, Block Seven, Crestline, Cherokee County, Kansas)
  - `tract-iv.txt`: Sample Tract IV legal description (Southeast Quarter of Section Twenty-six, Township Thirty-three South, Range Twenty-five East)
- Implement integration tests:
  - `AzureDocumentIntelligenceOcrServiceTests.cs`: Verify OCR extraction against sample legal description documents
  - Test cases:
    - `ExtractText_WithValidTractIIDocument_ReturnsExpectedLegalDescription()`: Verify Tract II OCR output contains key landmarks and measurements
    - `ExtractText_WithValidTractIVDocument_ReturnsExpectedLegalDescription()`: Verify Tract IV OCR output contains section references and boundaries
  - Validate `OcrExtractionResult` contains extracted text, confidence scores, and diagnostics
  - Requires Azure Document Intelligence credentials (environment variable or configuration)
  - Mark with `[Trait("Category", "Integration")]` for CI/CD filtering if needed

**Phase 2f: Validate & Verify**
- Build `GeoAcre.sln`: All projects compile cleanly
- Run `dotnet test GeoAcre.sln`: All 59+ tests pass (including new OCR integration tests)
- Verify no breaking changes to API contracts or services
- Verify solution structure: 6 primary projects (Geometry, Geocoding, SteelTree.GeoAcre, Web.Api, SteelTree.Ocr, SteelTree.Ocr.AzureDocumentIntelligence) + 3 test projects (Geometry.Tests, Web.Api.Tests, Ocr.AzureDocumentIntelligence.Tests)

## Complexity Tracking

No constitution violations identified; table not required.
