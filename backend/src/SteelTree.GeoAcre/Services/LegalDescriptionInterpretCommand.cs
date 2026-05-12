namespace SteelTree.GeoAcre.Services;

public sealed class LegalDescriptionInterpretCommand
{
    public required string SourceType { get; set; }

    public string? Text { get; set; }

    public string? FileName { get; set; }

    public string? ContentType { get; set; }

    public string? Base64Content { get; set; }

    public int? MaxVertices { get; set; }

    public double? ConfidenceThreshold { get; set; }
}
