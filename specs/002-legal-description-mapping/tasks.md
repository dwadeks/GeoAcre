# Tasks: Legal Description Mapping (V2)

**Input**: Design documents from `/specs/002-legal-description-mapping/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are included because repository constitution mandates TDD for production code.

**Organization**: Tasks are grouped by phase and user story so each story can be delivered and tested independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add feature-level configuration and scaffolding for legal-description workflow.

- [X] T001 Add legal-description provider configuration keys in backend/src/SteelTree.GeoAcre.Web.Api/appsettings.json
- [X] T002 [P] Add local-safe legal-description provider defaults in backend/src/SteelTree.GeoAcre.Web.Api/appsettings.Development.json
- [X] T003 [P] Add frontend API configuration entries for legal-description endpoints in frontend/src/services/config.ts
- [X] T004 [P] Add feature constants for legal-description limits in frontend/src/models/LegalDescriptionConstants.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared domain contracts, adapter abstractions, and mode primitives required by all stories.

**CRITICAL**: No story work should begin before this phase is complete.

- [X] T005 Create legal-description domain contracts (`LegalInputType`, `LegalDescriptionSource`, `LegalInterpretationResult`) in backend/src/SteelTree.GeoAcre.Geocoding/LegalDescriptionContracts.cs
- [X] T006 Create provider abstraction interfaces (`ILegalDescriptionOcrService`, `ILegalDescriptionInterpreter`) in backend/src/SteelTree.GeoAcre.Geocoding/ILegalDescriptionOcrService.cs and backend/src/SteelTree.GeoAcre.Geocoding/ILegalDescriptionInterpreter.cs
- [X] T007 [P] Add placeholder adapter implementations in backend/src/SteelTree.GeoAcre.Geocoding/ProviderAdapters/PlaceholderLegalDescriptionOcrService.cs and backend/src/SteelTree.GeoAcre.Geocoding/ProviderAdapters/PlaceholderLegalDescriptionInterpreter.cs
- [X] T008 Register legal-description services and options binding in backend/src/SteelTree.GeoAcre.Web.Api/Program.cs
- [X] T009 [P] Add API DTOs for legal-description interpret/export requests and responses in backend/src/SteelTree.GeoAcre.Web.Api/Models/
- [X] T010 [P] Create frontend mode and export discriminated unions in frontend/src/models/ModeTypes.ts
- [X] T011 [P] Create frontend legal-description request/response types in frontend/src/models/LegalDescriptionTypes.ts
- [X] T012 Add frontend API client methods for interpret/export contracts in frontend/src/services/legalDescriptionApi.ts

**Checkpoint**: Foundation is ready for independently testable user-story work.

---

## Phase 3: OCR Project Extraction (Plan Delta)

**Purpose**: Align implementation with the updated plan by extracting OCR abstractions/implementation into standalone projects.

- [X] T013 Create standalone OCR abstraction project backend/src/SteelTree.Ocr/SteelTree.Ocr.csproj
- [X] T014 [P] Move OCR contracts (`ILegalDescriptionOcrService`, `OcrExtractionResult`, `OcrProviderOptions`) from backend/src/SteelTree.GeoAcre.Geocoding/ to backend/src/SteelTree.Ocr/
- [X] T015 Create standalone Azure OCR implementation project backend/src/SteelTree.Ocr.AzureDocumentIntelligence/SteelTree.Ocr.AzureDocumentIntelligence.csproj
- [X] T016 [P] Move Azure OCR implementation and DI extensions from backend/src/SteelTree.GeoAcre.Ocr.AzureDocumentIntelligence/ to backend/src/SteelTree.Ocr.AzureDocumentIntelligence/
- [X] T017 Add new OCR projects to backend/GeoAcre.sln and remove backend/src/SteelTree.GeoAcre.Ocr.AzureDocumentIntelligence/SteelTree.GeoAcre.Ocr.AzureDocumentIntelligence.csproj
- [X] T018 [P] Update project references and namespaces in backend/src/SteelTree.GeoAcre/SteelTree.GeoAcre.csproj and backend/src/SteelTree.GeoAcre.Web.Api/SteelTree.GeoAcre.Web.Api.csproj
- [X] T019 [P] Update OCR contract imports in tests under backend/tests/SteelTree.GeoAcre.Web.Api.Tests/ and backend/tests/integration/SteelTree.GeoAcre.Web.Api.Tests/
- [X] T020 Create OCR integration test project backend/tests/integration/SteelTree.Ocr.AzureDocumentIntelligence.Tests/SteelTree.Ocr.AzureDocumentIntelligence.Tests.csproj
- [X] T021 [P] Add OCR integration sample files in backend/tests/integration/SteelTree.Ocr.AzureDocumentIntelligence.Tests/TestData/
- [X] T022 Add OCR integration tests in backend/tests/integration/SteelTree.Ocr.AzureDocumentIntelligence.Tests/AzureDocumentIntelligenceOcrServiceTests.cs

**Checkpoint**: OCR architecture matches updated plan and is packaging-ready.

---

## Phase 4: User Story 1 - Extract and Map Legal Description (Priority: P1)

**Goal**: Users can submit pasted text or an uploaded image, receive interpreted tract boundaries, and view read-only mapped geometry with measurements.

**Independent Test**: Submit valid text and image inputs separately and verify mapped read-only boundary renders; submit both sources together and verify rejection.

### Tests for User Story 1

- [X] T023 [P] [US1] Add unit tests for legal input source validation rules in backend/tests/SteelTree.GeoAcre.Web.Api.Tests/LegalDescriptionInputValidationTests.cs
- [X] T024 [P] [US1] Add API controller tests for interpret success/failure/retry responses in backend/tests/SteelTree.GeoAcre.Web.Api.Tests/LegalDescriptionControllerTests.cs
- [X] T025 [P] [US1] Add integration tests for legal-description interpret endpoint in backend/tests/integration/SteelTree.GeoAcre.Web.Api.Tests/LegalDescriptionInterpretationIntegrationTests.cs
- [X] T026 [P] [US1] Add frontend component tests for legal-description submit flows in frontend/src/tests/components/LegalDescriptionPanel.test.tsx
- [X] T027 [P] [US1] Add frontend map behavior tests for read-only interpreted boundary rendering in frontend/src/tests/components/LegalDescriptionMapOverlay.test.tsx

### Implementation for User Story 1

- [X] T028 [US1] Implement legal-description orchestration service in backend/src/SteelTree.GeoAcre/Services/LegalDescriptionService.cs
- [X] T029 [US1] Add legal-description interpret API endpoint in backend/src/SteelTree.GeoAcre.Web.Api/Controllers/LegalDescriptionController.cs
- [X] T030 [US1] Implement boundary read-only provenance mapping in backend/src/SteelTree.GeoAcre/Services/LegalDescriptionBoundaryMapper.cs
- [X] T031 [US1] Register service wiring and request limits in backend/src/SteelTree.GeoAcre.Web.Api/Program.cs
- [X] T032 [US1] Implement legal-description input panel in frontend/src/components/LegalDescriptionPanel.tsx
- [X] T033 [US1] Implement interpreted boundary overlay in frontend/src/components/LegalDescriptionBoundaryLayer.tsx
- [X] T034 [US1] Implement legal-description workflow state management in frontend/src/services/legalDescriptionState.ts
- [X] T035 [US1] Integrate legal-description panel and overlay into main UI flow in frontend/src/pages/App.tsx

**Checkpoint**: User Story 1 works as an MVP independent increment.

---

## Phase 5: User Story 2 - Select and Work in a Single Mode (Priority: P2)

**Goal**: Users can switch between Draw Boundary, Legal Description, and Measure Distance with mode-specific controls and confirmation for destructive transitions.

**Independent Test**: Switch among all three modes in required order, verify only current-mode sidebar content is visible, and confirm destructive mode switch requires explicit confirmation.

### Tests for User Story 2

- [X] T036 [P] [US2] Add frontend tests for mode selector order and active-mode exclusivity in frontend/src/tests/components/ModeSelector.test.tsx
- [X] T037 [P] [US2] Add frontend tests for sidebar conditional rendering by mode in frontend/src/tests/components/SidebarModeContent.test.tsx
- [X] T038 [P] [US2] Add frontend tests for mode-switch confirmation behavior in frontend/src/tests/components/ModeSwitchConfirmation.test.tsx

### Implementation for User Story 2

- [X] T039 [US2] Implement mode selector component in frontend/src/components/ModeSelector.tsx
- [X] T040 [US2] Implement mode transition guard policy in frontend/src/services/modeTransitionService.ts
- [X] T041 [US2] Refactor sidebar for mode-scoped controls in frontend/src/components/Sidebar.tsx
- [X] T042 [US2] Integrate mode selector and transition state into app flow in frontend/src/pages/App.tsx
- [X] T043 [US2] Add mode audit metadata DTO in backend/src/SteelTree.GeoAcre.Web.Api/Models/ModeAuditMetadataDto.cs

**Checkpoint**: User Stories 1 and 2 are independently functional.

---

## Phase 6: User Story 3 - Export Mode-Specific JSON (Priority: P3)

**Goal**: Users can export JSON payloads specific to the active mode with schema discriminator and validation guard when no complete result exists.

**Independent Test**: Generate completed output in each mode and verify export payload matches mode-specific schema; verify export is blocked for incomplete mode state.

### Tests for User Story 3

- [ ] T044 [P] [US3] Add frontend unit tests for mode-specific export mappers in frontend/src/tests/services/exportMapper.test.ts
- [ ] T045 [P] [US3] Add frontend tests for export blocking when active mode is incomplete in frontend/src/tests/components/ExportActions.test.tsx
- [ ] T046 [P] [US3] Add backend API tests for export snapshot contract and conflict response in backend/tests/SteelTree.GeoAcre.Web.Api.Tests/ExportControllerTests.cs
- [ ] T047 [P] [US3] Add integration tests for export endpoint per mode schema in backend/tests/integration/SteelTree.GeoAcre.Web.Api.Tests/ModeExportIntegrationTests.cs

### Implementation for User Story 3

- [ ] T048 [US3] Implement mode-specific export payload builders in frontend/src/services/exportMapper.ts
- [ ] T049 [US3] Implement export action UI and incomplete-state guard messaging in frontend/src/components/ExportActions.tsx
- [ ] T050 [US3] Implement export API endpoint in backend/src/SteelTree.GeoAcre.Web.Api/Controllers/ExportController.cs
- [ ] T051 [US3] Implement backend export snapshot service and validators in backend/src/SteelTree.GeoAcre/Services/ModeExportService.cs
- [ ] T052 [US3] Replace legacy export wiring with mode-specific export flow in frontend/src/pages/App.tsx and frontend/src/components/ExportButton.tsx

**Checkpoint**: All user stories are independently testable and complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, documentation, and non-regression checks.

- [ ] T053 [P] Add frontend regression tests for v1 draw and distance behavior in frontend/src/tests/integration/V1ModeRegression.test.tsx
- [ ] T054 [P] Add backend non-regression tests for existing geocoding and geometry endpoints in backend/tests/SteelTree.GeoAcre.Web.Api.Tests/ExistingEndpointsRegressionTests.cs
- [ ] T055 Add observability logs and request correlation for legal-description and export flows in backend/src/SteelTree.GeoAcre.Web.Api/Middleware/ErrorHandlingMiddleware.cs
- [ ] T056 Update v2 usage documentation and workflow notes in docs/legal-description-mapping.md and validate specs/002-legal-description-mapping/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 (Setup): can start immediately.
- Phase 2 (Foundational): depends on Phase 1 completion and blocks all stories.
- Phase 3 (OCR Extraction): depends on Phase 2 and should complete before final OCR packaging verification.
- Phase 4 (US1): depends on Phase 2; can proceed before OCR extraction completes if current OCR adapter remains temporarily wired.
- Phase 5 (US2): depends on Phase 2; can run in parallel with US1.
- Phase 6 (US3): depends on Phase 2 and stable mode state from US1/US2.
- Phase 7 (Polish): depends on completion of target stories.

### User Story Dependencies

- US1 (P1): no dependency on other stories after foundation.
- US2 (P2): no strict dependency on US1, but integrates with shared UI state.
- US3 (P3): depends on stable mode state and legal-description output contracts; should follow or pair with US1/US2 stabilization.

### Within Each User Story

- Tests should be written first and fail before implementation.
- Core service/domain logic should be implemented before API/controller translation where applicable.
- State/mappers should be implemented before final UI wiring.

## Parallel Execution Examples

### OCR Extraction Phase

- T014 and T016 can run in parallel after project scaffolds exist because they touch different project trees.
- T018 and T019 can run in parallel because they target different projects and test folders.

### User Story 1

- T023, T024, and T026 can run in parallel because they are independent test files.

### User Story 2

- T036, T037, and T038 can run in parallel because they cover independent component tests.

### User Story 3

- T044, T046, and T047 can run in parallel because they target separate test layers.

---

## Implementation Strategy

### MVP First

1. Confirm Phases 1 and 2 are complete.
2. Deliver and validate US1 (Phase 4).
3. Keep US2 complete and stable (Phase 5).

### Plan-Alignment Delta

1. Complete OCR extraction tasks in Phase 3 to match updated architecture.
2. Then complete US3 export contract work in Phase 6.
3. Finish polish and non-regression checks in Phase 7.

### Team Parallelization

1. Engineer A: Phase 3 OCR extraction and backend reference updates.
2. Engineer B: US3 frontend export mapper/actions.
3. Engineer C: US3 backend export endpoint/service and integration tests.

---

## Notes

- `[P]` tasks are parallelizable when they touch separate files and have no unmet dependencies.
- Task paths have been updated to match the current repository layout and latest plan.
- Existing completed items remain checked; newly introduced plan-delta tasks are intentionally unchecked.
