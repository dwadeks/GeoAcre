namespace SteelTree.GeoAcre.Services;

public sealed class LegalDescriptionProcessingResult
{
    public required int StatusCode { get; init; }

    public string? Error { get; init; }

    public string? Code { get; init; }

    public LegalDescriptionInterpretationResult? Response { get; init; }
}
