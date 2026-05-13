# Contract: Legal Description Provider Abstractions

**Version**: 1.0.0-draft  
**Scope**: Interface contracts for third-party OCR and legal-description interpretation integrations

## Goals

- Keep all third-party calls behind interfaces.
- Support provider replacement without changing controller contracts.
- Enable deterministic unit tests with mock/fake implementations.

## Backend interfaces (C#)

```csharp
namespace SteelTree.GeoAcre.Geocoding;

public enum LegalInputType
{
    PastedText,
    UploadedImage
}

public sealed record LegalDescriptionSource(
    LegalInputType Type,
    string? Text,
    string? FileName,
    string? ContentType,
    byte[]? ImageBytes
);

public sealed record OcrExtractionResult(
    bool Success,
    string ExtractedText,
    IReadOnlyList<string> Diagnostics,
    double Confidence
);

public interface ILegalDescriptionOcrService
{
    Task<OcrExtractionResult> ExtractTextAsync(
        LegalDescriptionSource source,
        CancellationToken cancellationToken = default);
}

public sealed record InterpretedBoundary(
    IReadOnlyList<SteelTree.GeoAcre.Geometry.GeoPoint> Vertices,
    double Confidence,
    IReadOnlyList<string> Diagnostics
);

public sealed record LegalInterpretationResult(
    bool Success,
    IReadOnlyList<InterpretedBoundary> Candidates,
    IReadOnlyList<string> Diagnostics,
    string ProviderName
);

public interface ILegalDescriptionInterpreter
{
    Task<LegalInterpretationResult> InterpretAsync(
        string normalizedLegalText,
        CancellationToken cancellationToken = default);
}
```

## Behavioral contract

- `ILegalDescriptionOcrService`:
  - Must accept only `UploadedImage` sources.
  - Must return `Success=false` with diagnostics for unreadable images.
  - Must not throw on expected low-confidence cases; use diagnostics.

- `ILegalDescriptionInterpreter`:
  - Must accept normalized text and return 1..n candidate boundaries or diagnostics.
  - Must report confidence in [0, 1].
  - Must be provider-neutral to permit alternate implementation adapters.

## Validation and error contract

- Input validation (text vs image exclusivity) occurs before provider invocation.
- Adapter/network failures are surfaced as retriable service errors to API layer.
- Provider-specific payloads must not leak through public API contract.

## Test contract requirements

Unit tests:
- Verify each adapter honors interface invariants.
- Verify invalid source combinations fail before adapter calls.
- Verify low-confidence and unreadable image behavior maps to retry diagnostics.

Integration tests:
- Verify API endpoint behavior using fake implementations.
- Verify provider-unavailable cases map to `503`.
- Verify interpreted boundaries marked read-only with provenance `LegalInterpretation`.

## Amendment: 2026-05-13 (Interpreter Next)

- `ILegalDescriptionInterpreter` implementations must ignore optional non-semantic tract labels (for example `Tract II:` and `Tract IV:`) when present at the start of legal text.
- Interpreter must preserve legal course parsing order after normalization.
- Add interpreter-focused tests for heading-present vs heading-absent equivalence and malformed clause diagnostics.
