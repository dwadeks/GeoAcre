<!--
   SYNC IMPACT REPORT
   Version change: 1.0.1 → 1.1.0
   Modified principles: III. Object-Oriented Design → III. Object-Oriented Design
   Added sections: N/A
   Removed sections: N/A
   Changes: Added a mandatory single-class-or-interface-per-file rule for hand-authored code;
                clarified file-organization expectations for OOD compliance.
   Templates updated:
      ✅ .specify/memory/constitution.md — amended principle and governance metadata
      ✅ .specify/templates/plan-template.md — Constitution Check now calls out single-class/interface-per-file compliance
      ✅ .specify/templates/tasks-template.md — task guidance now requires file-splitting work to respect the one-type-per-file rule
      ✅ backend/README.md — backend guidance now reflects the file-organization rule
      ✅ frontend/README.md — frontend guidance now reflects the file-organization rule
      ✅ .specify/templates/spec-template.md — reviewed; no change required because the amendment adds no new spec sections
   Deferred items: None
-->

# GeoAcre Constitution

## Core Principles

### I. Library-First

Every feature MUST be implemented as a standalone library before any consumer (CLI,
API, UI, service) is built on top of it. Libraries MUST be:

- Self-contained with no implicit runtime dependencies on other GeoAcre libraries
  unless explicitly declared.
- Independently buildable, testable, and publishable.
- Documented with a clear purpose statement; purely organizational (empty wrapper)
  libraries are prohibited.

No application-level code may duplicate logic that belongs in a library.

### II. Test-Driven Development (NON-NEGOTIABLE)

TDD is mandatory for all production code:

1. Write failing tests first and confirm they fail (Red).
2. Obtain approval to proceed (or self-approve when working autonomously) before
   writing implementation code.
3. Write the minimal implementation to make tests pass (Green).
4. Refactor without breaking tests (Refactor).

The Red-Green-Refactor cycle MUST be strictly enforced. Skipping the failing-test
step is a constitution violation. All public library APIs MUST have unit tests;
inter-library contracts MUST have integration tests.

### III. Object-Oriented Design

Code MUST be organized using object-oriented principles:

- Encapsulate state and behavior in classes/objects; avoid procedural top-level
  logic in libraries.
- Prefer composition over inheritance; use interfaces/protocols to express contracts.
- Single Responsibility Principle MUST be applied at the class level.
- Side-effectful and pure logic MUST be separated (e.g., domain model vs. I/O layer).
- Each hand-authored code file MUST declare exactly one top-level class or exactly
   one top-level interface. Records count as classes for this rule. Additional
   top-level types in the same file are prohibited unless the file is generated.

Rationale: keeping one top-level class or interface per file reduces hidden coupling,
improves discoverability, and makes review scope easier to reason about.

### IV. Integration Testing

Integration tests MUST be written for:

- New library public-API contracts (contract tests).
- Any change to an existing library API that could break consumers.
- Inter-library communication and shared data schemas.
- End-to-end paths through composed libraries.

Integration tests live in a dedicated `tests/integration/` directory and MUST run
in CI alongside unit tests.

### V. Simplicity (YAGNI)

Implement the simplest solution that satisfies the current requirement.
Complexity MUST be explicitly justified in a `Complexity Tracking` table in the
feature plan. Speculative abstractions, premature generalization, and gold-plating
are prohibited.

## Technology Stack & Standards

**Primary languages** (in preference order):

1. **C# / .NET 10** — preferred for all backend libraries, CLI tools, and services.
   Use the latest stable SDK. Target `net10.0` TFM unless a specific platform
   target (e.g., `net10.0-windows`) is required.
   All C# library assembly and namespace names MUST begin with `SteelTree.GeoAcre`
   (e.g., `SteelTree.GeoAcre.Parcels`, `SteelTree.GeoAcre.Geometry`).
2. **TypeScript** — preferred over plain JavaScript for all front-end libraries,
   Node.js utilities, and any context where C# is not appropriate. Strict mode
   (`"strict": true`) MUST be enabled. `any` type is prohibited without a
   documented exception.
3. **JavaScript** — only when TypeScript cannot be used (e.g., configuration files
   that do not support TypeScript).

**Tooling standards**:

- C#: Microsoft Testing Platform (MSTest runner with `microsoft.testing.platform`) for
  unit and integration tests; FluentAssertions for assertions.
- TypeScript/JavaScript: Vitest (preferred) or Jest for tests.
- All projects MUST include a linter and formatter configuration (e.g.,
  `dotnet format`, ESLint + Prettier).
- CI MUST enforce build, lint, and test gates before merge.

## Development Workflow

1. **Spec first**: Every feature begins with a specification (`spec.md`) before
   any code is written.
2. **Plan before code**: An implementation plan (`plan.md`) MUST be approved before
   task execution begins.
3. **Library before consumer**: Implement and validate the library layer before
   building any consuming application code.
4. **TDD at every layer**: Tests are written before implementation at every layer
   (unit → integration → contract).
5. **Incremental delivery**: Features MUST be organized into independently
   deployable user-story slices; no big-bang deliveries.
6. **Branch per feature**: All work occurs on a dedicated feature branch; direct
   commits to `main` are prohibited.

## Governance

This constitution supersedes all other documented practices within the GeoAcre
project. Where a conflict exists between this document and any other artifact
(README, inline comments, external guidance), this constitution takes precedence.

**Amendment procedure**:

1. Propose the amendment as a PR with a summary of motivation and impact.
2. Update this file with a bumped `CONSTITUTION_VERSION` following semantic
   versioning rules (MAJOR: breaking governance change; MINOR: new principle or
   section; PATCH: clarifications and wording fixes).
3. Update `LAST_AMENDED_DATE` to the ISO date of the amendment.
4. Propagate changes to dependent templates (plan, spec, tasks) in the same PR.

All PRs and code reviews MUST verify compliance with the principles above.
Complexity violations MUST be documented in the feature plan's Complexity Tracking
table before the PR is approved.

**Version**: 1.1.0 | **Ratified**: 2026-05-07 | **Last Amended**: 2026-05-11
