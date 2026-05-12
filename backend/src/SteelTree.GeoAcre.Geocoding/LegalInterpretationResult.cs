namespace SteelTree.GeoAcre.Geocoding;

public sealed record LegalInterpretationResult(
    bool Success,
    IReadOnlyList<InterpretedBoundary> Candidates,
    IReadOnlyList<string> Diagnostics,
    string ProviderName);
