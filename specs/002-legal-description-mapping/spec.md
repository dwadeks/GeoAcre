# Feature Specification: GeoAcre Version 2 Legal Description Mapping

**Feature Branch**: `002-legal-description-mapping`  
**Created**: 2026-05-11  
**Status**: Draft  
**Input**: User description: "Create version 2 of the Geo Acre land estimator application. The primary focus of version 2 is a new capability. User's should be able to upload an image of the legal description for a tract of land. The software will read and understand the legal description. It will then locate and draw the tract's boundaries on the map. In addition there will be some UX improvements. The primary change is to introduce a mode selector. The three modes are: 1) draw tract boundaries, 2) draw distance line, 3) upload legal description to view property boundaries. Each mode will have a different JSON export data structure and sidebar options only for current mode."

## Clarifications

### Session 2026-05-11

- Q: What input formats must legal-description mode support? → A: It must support both pasted text and uploaded image input.
- Q: How should the system behave when both pasted text and image are provided? → A: Reject the submission and require exactly one source (paste or upload).
- Q: Should interpreted legal-description boundaries be editable before finalization? → A: No, auto-finalize as read-only once interpretation succeeds.
- Q: What are the exact names and order of the three modes? → A: Draw Boundary, Legal Description, Measure Distance.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Extract and Map Legal Description (Priority: P1)

As a land professional, I can either paste legal-description text or upload a legal-description image and have the system interpret it and draw the tract boundaries on the map.

**Why this priority**: This is the core Version 2 capability and primary business value.

**Independent Test**: Can be fully tested by (a) pasting valid legal-description text and (b) uploading a valid legal-description image, then confirming each path renders the corresponding tract boundary without manual drawing.

**Acceptance Scenarios**:

1. **Given** a user is in legal-description mode and provides legal-description content via pasted text or image upload, **When** the user submits it, **Then** the system displays the interpreted tract boundary on the map.
2. **Given** a user submitted legal-description content, **When** interpretation confidence is low or text is incomplete, **Then** the system informs the user that mapping could not be completed and provides a clear retry path.
3. **Given** a tract boundary was generated from uploaded legal text, **When** the user views results, **Then** the boundary and computed tract measurements are shown in the same results area used by other modes.
4. **Given** a user provides both pasted text and an uploaded image, **When** they submit legal-description input, **Then** the system rejects the submission and prompts the user to provide exactly one source.
5. **Given** legal-description interpretation succeeds, **When** the generated boundary is displayed, **Then** it is treated as final and not editable in legal-description mode.

---

### User Story 2 - Select and Work in a Single Mode (Priority: P2)

As a user, I can switch between Draw Boundary, Legal Description, and Measure Distance modes so that I only see controls and guidance relevant to my current task.

**Why this priority**: Mode-focused UX reduces confusion, prevents accidental cross-mode edits, and improves task completion speed.

**Independent Test**: Can be tested by switching modes and verifying only mode-specific sidebar controls/messages are shown and active.

**Acceptance Scenarios**:

1. **Given** a user opens the app, **When** they choose a mode, **Then** the sidebar displays only controls and instructional text for that mode.
2. **Given** a user has in-progress work in one mode, **When** they attempt to switch modes, **Then** the system warns about potential data loss and asks for confirmation.
3. **Given** a user confirms mode switch, **When** the app transitions to the new mode, **Then** prior in-progress state is handled according to the mode-switch policy and the new mode is fully active.

---

### User Story 3 - Export Mode-Specific JSON (Priority: P3)

As a user, I can export JSON in a structure specific to the active mode so downstream consumers receive only data relevant to that workflow.

**Why this priority**: Different workflows produce different outputs; mode-specific exports improve interoperability and reduce ambiguity.

**Independent Test**: Can be tested by creating output in each mode and confirming exported JSON matches that mode's structure and excludes unrelated mode payloads.

**Acceptance Scenarios**:

1. **Given** the user is in tract-drawing mode with completed shape data, **When** they export, **Then** JSON matches the drawing-mode schema.
2. **Given** the user is in distance-measurement mode with line data, **When** they export, **Then** JSON matches the measurement-mode schema.
3. **Given** the user is in legal-description mode with interpreted tract output, **When** they export, **Then** JSON matches the legal-description-mode schema.

### Edge Cases

- Uploaded image exists but is unreadable (blurred, low contrast, partial scan).
- Pasted legal text is incomplete, malformed, or includes mixed tracts.
- Uploaded image contains multiple legal descriptions; user must choose which tract to map.
- Uploaded text lacks sufficient location cues to place tract on the map.
- Uploaded legal text yields a self-intersecting or invalid boundary.
- User provides both text and image in a single submission.
- User attempts to modify interpreted boundary vertices in legal-description mode.
- User switches modes after generating results but before export.
- Export is requested in a mode with no completed result.
- Uploaded file type is unsupported or file exceeds allowed size.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a visible mode selector with exactly three modes in this order: Draw Boundary, Legal Description, Measure Distance.
- **FR-002**: System MUST ensure only one mode is active at a time.
- **FR-003**: System MUST display only mode-relevant sidebar controls, labels, and guidance for the currently active mode.
- **FR-004**: System MUST allow users to provide legal-description input in legal-description mode via either pasted text or uploaded image.
- **FR-005**: System MUST read and interpret legal-description input from both supported sources (pasted text and uploaded image) to extract tract boundary information.
- **FR-006**: System MUST render an interpreted tract boundary on the map when interpretation is successful.
- **FR-006a**: System MUST auto-finalize interpreted tract boundaries as read-only in legal-description mode after successful interpretation.
- **FR-007**: System MUST present a clear user-facing failure message and retry action when interpretation or boundary placement fails.
- **FR-008**: System MUST compute and display tract measurement results for successful legal-description mapping.
- **FR-008a**: System MUST reject submissions that include both pasted text and uploaded image content and instruct the user to provide exactly one source.
- **FR-009**: System MUST require explicit confirmation before mode switch when it would discard or invalidate in-progress work.
- **FR-010**: System MUST support JSON export for each mode.
- **FR-011**: System MUST produce different JSON payload structures per mode and include a mode identifier in each export.
- **FR-012**: System MUST prevent export when the current mode has no complete result and provide a clear reason.
- **FR-013**: System MUST preserve already-implemented Version 1 capabilities for manual boundary drawing and distance measurement.
- **FR-014**: System MUST maintain clear auditability of whether map output came from manual drawing or legal-description interpretation.

### Key Entities *(include if feature involves data)*

- **Mode Selection**: Represents the user’s active workflow context; includes active mode value and transition state (including pending confirmation).
- **Legal Description Input**: Represents legal-description source content provided as pasted text or uploaded image, plus source metadata and validation status.
- **Legal Interpretation Result**: Represents extracted legal-description content, interpretation status, confidence indicators, and user-facing messages.
- **Mapped Tract Boundary**: Represents the generated tract geometry and derived measurements shown on the map.
- **Mode-Specific Export Snapshot**: Represents exported output with schema version, mode identifier, and payload fields relevant only to the active mode.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of users can complete legal-description submission (text paste or image upload) and view mapped tract boundaries in under 3 minutes for supported, readable inputs.
- **SC-002**: 100% of attempted mode switches correctly present only mode-relevant sidebar controls with no unrelated controls visible.
- **SC-003**: 100% of successful exports include the correct mode identifier and pass validation for that mode's JSON structure.
- **SC-004**: At least 95% of users can correctly identify which mode they are in without external guidance.
- **SC-005**: At least 90% of failed legal-description interpretations return a clear, actionable user message on the first attempt.

## Assumptions

- Version 2 is additive and does not remove Version 1 manual drawing or distance measurement capabilities.
- Users can provide legal descriptions either as pasted text or image files.
- A supported set of legal-description formats exists and can be expanded in later releases.
- Measurement and map presentation conventions from Version 1 remain the baseline behavior unless explicitly changed.
- External dependencies required to interpret legal descriptions are available in target environments for this feature.
