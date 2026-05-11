# Research: Legal Description Mapping (V2)

**Date**: 2026-05-11  
**Purpose**: Resolve technical unknowns from plan technical context before implementation

## Decision 1: Legal-description image ingestion via provider abstraction

- Decision: Introduce an interface-first OCR abstraction (`ILegalDescriptionOcrService`) and adapter implementations for external providers.
- Rationale: The feature requires image input support now and provider flexibility later. Interface boundaries prevent direct coupling to a single third-party OCR API and support test doubles.
- Alternatives considered: Direct HTTP calls in controllers (rejected: violates OOD and testability); hard lock to one provider SDK (rejected: migration and cost risk).

## Decision 2: Legal-description interpretation via domain service abstraction

- Decision: Add a dedicated interpretation interface (`ILegalDescriptionInterpreter`) that accepts normalized legal text and returns tract geometry candidates with confidence and diagnostics.
- Rationale: Parsing/legal reasoning behavior is a volatile integration point and may change provider/model over time. A dedicated interface keeps core API contracts stable while implementations evolve.
- Alternatives considered: Parse directly in API controller (rejected: poor separation of concerns); embed parsing in frontend (rejected: security, consistency, and maintainability concerns).

## Decision 3: Input source exclusivity policy

- Decision: Enforce exactly one submission source per request: either pasted text or uploaded image, never both.
- Rationale: Matches clarified requirement FR-008a and eliminates ambiguous precedence rules.
- Alternatives considered: Prioritize text over image when both supplied (rejected: hidden behavior); merge both sources (rejected: increased complexity and inconsistent outcomes).

## Decision 4: Read-only interpreted geometry semantics

- Decision: Mark successfully interpreted boundaries as finalized and read-only in legal-description mode; expose provenance in response/export.
- Rationale: Matches FR-006a and FR-014; preserves auditability between manual and interpreted outputs.
- Alternatives considered: Allow vertex editing post-interpretation (rejected: violates clarified requirement and weakens traceability).

## Decision 5: Mode-specific export contract strategy

- Decision: Define discrete payload contracts for Draw Boundary, Legal Description, and Measure Distance exports with a required `mode` discriminator and schema version.
- Rationale: Avoids mixed payload ambiguity and supports downstream contract validation.
- Alternatives considered: Single superset payload with optional fields (rejected: fragile consumers and unclear required fields per mode).

## Decision 6: Third-party call boundary placement

- Decision: Keep all third-party service calls in backend adapter layers behind interfaces; frontend calls only first-party API endpoints.
- Rationale: Centralizes credentials, retries, rate limits, and observability while preserving thin client architecture.
- Alternatives considered: Frontend direct calls to OCR/geocoding APIs (rejected: key leakage and inconsistent policy enforcement).

## Decision 7: Azure-ready deployment baseline (future state)

- Decision: Prepare for Azure deployment with frontend on Azure Static Web Apps and backend on Azure App Service or Container Apps, using environment-based configuration and managed identity where applicable.
- Rationale: Aligns with product direction and Azure best-practice guidance while avoiding premature infrastructure lock-in in this feature.
- Alternatives considered: Immediate infrastructure rewrite in this feature (rejected: outside feature scope); unmanaged secrets in config files (rejected: security risk).

## Decision 8: Validation and failure behavior for interpretation pipeline

- Decision: Return structured failure results with retry guidance when OCR/interpretation confidence is below threshold or boundary validation fails.
- Rationale: Directly supports FR-007 and improves user recovery path for unreadable/ambiguous inputs.
- Alternatives considered: Generic 500-only failure messaging (rejected: poor UX and low diagnosability).

## Best-practice alignment notes

- Third-party integrations are adapterized behind interfaces for swapability and TDD.
- API contracts keep provider-neutral request/response shapes.
- Azure readiness includes secret externalization, RBAC, and deployment via IaC in future deployment workstreams.
