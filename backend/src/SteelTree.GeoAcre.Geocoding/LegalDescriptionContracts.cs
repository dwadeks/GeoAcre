using SteelTree.GeoAcre.Geometry;

namespace SteelTree.GeoAcre.Geocoding;

public enum LegalInputType
{
    PastedText,
    UploadedImage,
}

public sealed record LegalDescriptionSource(
    LegalInputType Type,
    string? Text,
    string? FileName,
    string? ContentType,
    byte[]? ImageBytes);

public sealed record OcrExtractionResult(
    bool Success,
    string ExtractedText,
    IReadOnlyList<string> Diagnostics,
    double Confidence);

public sealed record InterpretedBoundary(
    IReadOnlyList<GeoPoint> Vertices,
    double Confidence,
    IReadOnlyList<string> Diagnostics);

public sealed record LegalInterpretationResult(
    bool Success,
    IReadOnlyList<InterpretedBoundary> Candidates,
    IReadOnlyList<string> Diagnostics,
    string ProviderName);

public sealed class LegalDescriptionProviderOptions
{
    public OcrProviderOptions Ocr { get; set; } = new();

    public InterpretationProviderOptions Interpretation { get; set; } = new();
}

public sealed class OcrProviderOptions
{
    public string Provider { get; set; } = "Placeholder";

    public string Endpoint { get; set; } = string.Empty;

    public string ApiKey { get; set; } = string.Empty;

    public int TimeoutSeconds { get; set; } = 30;
}

public sealed class InterpretationProviderOptions
{
    public string Provider { get; set; } = "Placeholder";

    public string Endpoint { get; set; } = string.Empty;

    public string ApiKey { get; set; } = string.Empty;

    public int TimeoutSeconds { get; set; } = 60;

    public double DefaultConfidenceThreshold { get; set; } = 0.7;

    public int MaxVertices { get; set; } = 500;
}