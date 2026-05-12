# Tasks: Legal Description Mapping (V2)

**Input**: Design documents from `/specs/002-legal-description-mapping/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are included because this repository constitution mandates TDD (Red-Green-Refactor) for production code.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add feature-level configuration and scaffolding for legal-description workflow.

- [X] T001 Add legal-description provider configuration keys in backend/src/SteelTree.GeoAcre.Web.Api/appsettings.json
- [X] T002 [P] Add local-safe legal-description provider defaults in backend/src/SteelTree.GeoAcre.Web.Api/appsettings.Development.json
- [X] T003 [P] Add frontend API configuration entries for legal-description endpoints in frontend/src/services/config.ts
- [X] T004 [P] Add feature constants for legal-description limits (file size, supported content types, confidence threshold) in frontend/src/models/LegalDescriptionConstants.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared domain contracts, adapter abstractions, and mode primitives required by all stories.

**⚠️ CRITICAL**: No user story work should begin before these tasks are complete.

- [X] T005 Create legal-description domain contracts (`LegalInputType`, `LegalDescriptionSource`, `LegalInterpretationResult`) in backend/src/SteelTree.GeoAcre.Geocoding/LegalDescriptionContracts.cs
- [X] T006 Create provider abstraction interfaces (`ILegalDescriptionOcrService`, `ILegalDescriptionInterpreter`) in backend/src/SteelTree.GeoAcre.Geocoding/ILegalDescriptionProviders.cs
- [X] T007 [P] Add placeholder adapter implementations for OCR and interpretation providers in backend/src/SteelTree.GeoAcre.Geocoding/ProviderAdapters/PlaceholderLegalDescriptionProviders.cs
- [X] T008 Register legal-description services and options binding in backend/src/SteelTree.GeoAcre.Web.Api/Program.cs
- [X] T009 [P] Add API DTOs for legal-description interpret/export requests and responses in backend/src/SteelTree.GeoAcre.Web.Api/Models/LegalDescriptionDtos.cs
- [X] T010 [P] Create frontend mode and export discriminated unions in frontend/src/models/ModeTypes.ts
- [X] T011 [P] Create frontend legal-description request/response types in frontend/src/models/LegalDescriptionTypes.ts
- [X] T012 Add frontend API client methods for interpret/export contracts in frontend/src/services/legalDescriptionApi.ts

**Checkpoint**: Foundation is ready for independently testable user-story work.

---

## Phase 3: User Story 1 - Extract and Map Legal Description (Priority: P1) 🎯 MVP

**Goal**: Users can submit pasted text or an uploaded image, receive interpreted tract boundaries, and view read-only mapped geometry with measurements.

**Independent Test**: Submit valid pasted text and valid image input separately and verify mapped read-only boundary renders; submit both sources together and verify rejection.

### Tests for User Story 1 (write first and confirm failing)

- [ ] T013 [P] [US1] Add unit tests for legal input source validation rules in backend/tests/SteelTree.GeoAcre.Web.Api.Tests/LegalDescriptionInputValidationTests.cs
- [ ] T014 [P] [US1] Add API controller tests for interpret success/failure/retry responses in backend/tests/SteelTree.GeoAcre.Web.Api.Tests/LegalDescriptionControllerTests.cs
- [ ] T015 [P] [US1] Add integration tests for legal-description interpret endpoint with fake providers in backend/tests/integration/SteelTree.GeoAcre.Web.Api.Tests/LegalDescriptionInterpretationIntegrationTests.cs
- [ ] T016 [P] [US1] Add frontend component tests for legal-description submit flows (text, image, invalid both) in frontend/src/tests/components/LegalDescriptionPanel.test.tsx
- [ ] T017 [P] [US1] Add frontend map behavior tests for read-only interpreted boundary rendering in frontend/src/tests/components/LegalDescriptionMapOverlay.test.tsx

### Implementation for User Story 1

- [ ] T018 [US1] Implement legal-description application service orchestration (source validation, OCR, interpretation, geometry finalization) in backend/src/SteelTree.GeoAcre.Web.Api/Services/LegalDescriptionService.cs
- [ ] T019 [US1] Add legal-description interpret API endpoint and structured retry/failure responses in backend/src/SteelTree.GeoAcre.Web.Api/Controllers/LegalDescriptionController.cs
- [ ] T020 [US1] Implement boundary finalization and read-only provenance mapping in backend/src/SteelTree.GeoAcre.Web.Api/Services/LegalDescriptionBoundaryMapper.cs
- [ ] T021 [US1] Register controller/service wiring and request limits for upload payloads in backend/src/SteelTree.GeoAcre.Web.Api/Program.cs
- [ ] T022 [US1] Implement legal-description input panel (text paste/upload, one-source enforcement, retry messaging) in frontend/src/components/LegalDescriptionPanel.tsx
- [ ] T023 [US1] Implement interpreted boundary overlay with read-only lock behavior in frontend/src/components/LegalDescriptionBoundaryLayer.tsx
- [ ] T024 [US1] Implement legal-description workflow state management (submission, status, diagnostics, confidence) in frontend/src/services/legalDescriptionState.ts
- [ ] T025 [US1] Integrate legal-description panel and map overlay into app page flow in frontend/src/App.tsx

**Checkpoint**: User Story 1 works as an MVP independent increment.

---

## Phase 4: User Story 2 - Select and Work in a Single Mode (Priority: P2)

**Goal**: Users can switch between Draw Boundary, Legal Description, and Measure Distance with mode-specific controls and confirmation for destructive transitions.

**Independent Test**: Switch among all three modes in required order, verify only current-mode sidebar content is visible, and confirm destructive mode switch requires explicit confirmation.

### Tests for User Story 2 (write first and confirm failing)

- [ ] T026 [P] [US2] Add frontend tests for mode selector order and active-mode exclusivity in frontend/src/tests/components/ModeSelector.test.tsx
- [ ] T027 [P] [US2] Add frontend tests for sidebar conditional rendering by mode in frontend/src/tests/components/SidebarModeContent.test.tsx
- [ ] T028 [P] [US2] Add frontend tests for mode-switch confirmation behavior with in-progress work in frontend/src/tests/components/ModeSwitchConfirmation.test.tsx

### Implementation for User Story 2

- [ ] T029 [US2] Implement mode selector component with fixed order and active state in frontend/src/components/ModeSelector.tsx
- [ ] T030 [US2] Implement mode transition guard/confirmation policy in frontend/src/services/modeTransitionService.ts
- [ ] T031 [US2] Refactor sidebar to render mode-scoped controls only in frontend/src/components/Sidebar.tsx
- [ ] T032 [US2] Integrate mode selector and transition state into root app workflow in frontend/src/App.tsx
- [ ] T033 [US2] Add API-side mode audit metadata support for interpreted output provenance in backend/src/SteelTree.GeoAcre.Web.Api/Models/GeoTypes.cs

**Checkpoint**: User Stories 1 and 2 are independently functional.

---

## Phase 5: User Story 3 - Export Mode-Specific JSON (Priority: P3)

**Goal**: Users can export JSON payloads specific to active mode with schema discriminator and validation guard when no complete result exists.

**Independent Test**: Generate completed output in each mode and verify export payload matches mode-specific schema; verify export is blocked for incomplete mode state.

### Tests for User Story 3 (write first and confirm failing)

- [ ] T034 [P] [US3] Add frontend unit tests for mode-specific export mappers in frontend/src/tests/services/exportMapper.test.ts
- [ ] T035 [P] [US3] Add frontend tests for export blocking when active mode is incomplete in frontend/src/tests/components/ExportActions.test.tsx
- [ ] T036 [P] [US3] Add backend API tests for export snapshot contract and conflict response in backend/tests/SteelTree.GeoAcre.Web.Api.Tests/ExportControllerTests.cs
- [ ] T037 [P] [US3] Add integration tests for export endpoint per mode schema in backend/tests/integration/SteelTree.GeoAcre.Web.Api.Tests/ModeExportIntegrationTests.cs

### Implementation for User Story 3

- [ ] T038 [US3] Implement mode-specific export payload builders with mode discriminator and schema version in frontend/src/services/exportMapper.ts
- [ ] T039 [US3] Implement export action orchestration and incomplete-state guard messaging in frontend/src/components/ExportActions.tsx
- [ ] T040 [US3] Implement export API endpoint for mode snapshots and no-result conflict handling in backend/src/SteelTree.GeoAcre.Web.Api/Controllers/ExportController.cs
- [ ] T041 [US3] Implement backend export snapshot service and schema-specific validators in backend/src/SteelTree.GeoAcre.Web.Api/Services/ModeExportService.cs
- [ ] T042 [US3] Wire export UX into mode panels for draw/legal/measure flows in frontend/src/App.tsx

**Checkpoint**: All user stories are independently testable and complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, documentation, and non-regression checks.

- [ ] T043 [P] Add regression tests ensuring v1 draw and distance behavior remains unchanged in frontend/src/tests/integration/V1ModeRegression.test.tsx
- [ ] T044 [P] Add backend non-regression tests for existing geocoding and geometry endpoints in backend/tests/SteelTree.GeoAcre.Web.Api.Tests/ExistingEndpointsRegressionTests.cs
- [ ] T045 Add observability logs and request correlation for legal-description and export flows in backend/src/SteelTree.GeoAcre.Web.Api/Middleware/ErrorHandlingMiddleware.cs
- [ ] T046 Update v2 usage documentation and developer workflow notes in docs/legal-description-mapping.md
- [ ] T047 Validate quickstart commands and expected outcomes in specs/002-legal-description-mapping/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 (Setup): can start immediately.
- Phase 2 (Foundational): depends on Phase 1 completion; blocks all user stories.
- Phase 3 (US1): depends on Phase 2.
- Phase 4 (US2): depends on Phase 2; can run in parallel with US1 if staffed.
- Phase 5 (US3): depends on Phase 2 and mode/domain primitives from earlier phases.
- Phase 6 (Polish): depends on completion of target user stories.

### User Story Dependencies

- US1 (P1): no dependency on other user stories after Foundation.
- US2 (P2): no strict dependency on US1, but integrates with shared app state.
- US3 (P3): depends on mode state and legal-description output contracts; should be implemented after or alongside stable US1/US2 state contracts.

### Within Each User Story

- Tests must be written first and fail before implementation.
- Service/domain logic before API/controller wiring where applicable.
- State/mappers before UI wiring for frontend flows.

## Parallel Execution Examples

### User Story 1

- T013 + T014 + T016 can run in parallel because they touch separate test files:
   backend/tests/SteelTree.GeoAcre.Web.Api.Tests/LegalDescriptionInputValidationTests.cs
   backend/tests/SteelTree.GeoAcre.Web.Api.Tests/LegalDescriptionControllerTests.cs
   frontend/src/tests/components/LegalDescriptionPanel.test.tsx

### User Story 2

- T026 + T027 + T028 can run in parallel because they cover independent component tests:
   frontend/src/tests/components/ModeSelector.test.tsx
   frontend/src/tests/components/SidebarModeContent.test.tsx
   frontend/src/tests/components/ModeSwitchConfirmation.test.tsx

### User Story 3

- T034 + T036 + T037 can run in parallel because they target separate test layers:
   frontend/src/tests/services/exportMapper.test.ts
   backend/tests/SteelTree.GeoAcre.Web.Api.Tests/ExportControllerTests.cs
   backend/tests/integration/SteelTree.GeoAcre.Web.Api.Tests/ModeExportIntegrationTests.cs

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1) with full TDD cycle.
3. Validate US1 independent test criteria before proceeding.

### Incremental Delivery

1. Foundation complete (Phases 1-2).
2. Deliver US1 (core legal-description mapping).
3. Deliver US2 (mode-focused UX).
4. Deliver US3 (mode-specific export).
5. Complete polish and regressions.

### Team Parallelization

1. Complete Phase 1 and Phase 2 together.
2. Split by story after foundation:
   - Engineer A: US1 backend and integration tests.
   - Engineer B: US2 frontend mode UX and tests.
   - Engineer C: US3 export mapping/contracts and tests.

---

## Notes

- `[P]` tasks are parallelizable when they touch separate files and have no unmet dependencies.
- Every task includes a concrete file path and can be executed directly.
- Keep commits small by task or tightly-related task group.
