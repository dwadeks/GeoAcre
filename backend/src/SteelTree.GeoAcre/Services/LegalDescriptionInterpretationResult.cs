namespace SteelTree.GeoAcre.Services;

public sealed class LegalDescriptionInterpretationResult
{
    public required string Mode { get; set; }

    public required string SchemaVersion { get; set; }

    public required string Status { get; set; }

    public required double Confidence { get; set; }

    public required string[] Diagnostics { get; set; }

    public LegalDescriptionBoundaryResult? Boundary { get; set; }

    public LegalDescriptionRetryGuidanceResult? Retry { get; set; }
}
