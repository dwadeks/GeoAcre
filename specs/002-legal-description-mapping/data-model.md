# Data Model: Legal Description Mapping (V2)

**Date**: 2026-05-11  
**Purpose**: Define entities, validation rules, and transitions for multi-mode operation and legal-description mapping

## Entities

### ModeSelection

Represents active workflow mode and switch confirmation state.

Fields:
- activeMode: enum (`DrawBoundary`, `LegalDescription`, `MeasureDistance`)
- pendingMode: enum | null
- requiresConfirmation: boolean
- lastSwitchedAtUtc: string (ISO-8601)

Validation:
- Active mode is required.
- Mode ordering for selector UI is fixed: DrawBoundary -> LegalDescription -> MeasureDistance.
- Switch into a new mode requires confirmation when current mode has in-progress data.

State transitions:
- `Stable(modeA)` -> `PendingConfirmation(modeA->modeB)` -> `Stable(modeB)` on confirm
- `PendingConfirmation(modeA->modeB)` -> `Stable(modeA)` on cancel

### LegalDescriptionInput

Represents one legal-description submission request.

Fields:
- inputId: string (UUID)
- sourceType: enum (`PastedText`, `UploadedImage`)
- pastedText: string | null
- imageFileName: string | null
- imageContentType: string | null
- imageBytesBase64: string | null
- submittedAtUtc: string (ISO-8601)

Validation:
- Exactly one source must be provided.
- `PastedText` requires non-empty trimmed text.
- `UploadedImage` requires supported content type and non-empty byte payload.
- Submission with both text and image is invalid.

### LegalInterpretationResult

Represents OCR/parsing/interpretation pipeline output.

Fields:
- interpretationId: string (UUID)
- inputId: string (FK -> LegalDescriptionInput)
- status: enum (`Succeeded`, `Failed`, `NeedsRetry`)
- confidence: number (0.0 to 1.0)
- normalizedLegalText: string
- diagnostics: string[]
- providerMetadata: object (provider-neutral key/value map)

Validation:
- Confidence must be in [0, 1].
- `Succeeded` requires geometry candidates.
- `NeedsRetry` and `Failed` require at least one diagnostic message.

### MappedTractBoundary

Represents finalized map geometry from interpreted legal description.

Fields:
- boundaryId: string (UUID)
- interpretationId: string (FK -> LegalInterpretationResult)
- vertices: GeoPoint[]
- areaSquareMeters: number
- perimeterMeters: number
- hasSelfIntersection: boolean
- isReadOnly: boolean (always true for legal-description mode)
- provenance: enum (`Manual`, `LegalInterpretation`)

Validation:
- Vertices count >= 3.
- Polygon must pass geometry library validation before finalization.
- `isReadOnly` must be true when provenance is `LegalInterpretation`.

### ModeSpecificExportSnapshot

Represents exported JSON payload for the active mode.

Fields:
- schemaVersion: string
- mode: enum (`DrawBoundary`, `LegalDescription`, `MeasureDistance`)
- exportedAtUtc: string (ISO-8601)
- payload: object (mode-specific contract)

Validation:
- Mode discriminator is required.
- Payload must match selected mode contract.
- Export is blocked when mode has no completed result.

## Relationships

- ModeSelection (1) controls current UI/interaction context.
- LegalDescriptionInput (0..*) -> LegalInterpretationResult (0..1 per submission attempt).
- LegalInterpretationResult (0..1) -> MappedTractBoundary (0..1 successful finalization).
- ModeSpecificExportSnapshot (0..*) references exactly one active mode payload at export time.

## Derived invariants

- If active mode is `LegalDescription` and interpretation succeeds, resulting boundary is immutable in UI.
- If mode switch is confirmed, incompatible in-progress state is discarded according to switch policy.
- Export payload never includes data structures from non-active modes.

## Failure model

- OCR unreadable image -> `NeedsRetry` with actionable diagnostics.
- Ambiguous/incomplete legal text -> `Failed` or `NeedsRetry` with guidance.
- Invalid/self-intersecting interpreted polygon -> failed finalization with retry path.
