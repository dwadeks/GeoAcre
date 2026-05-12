namespace SteelTree.GeoAcre.Web.Api.Models;

public sealed class LegalDescriptionInterpretRequest
{
    public required LegalDescriptionSourceDto Source { get; set; }

    public LegalDescriptionInterpretOptionsDto? Options { get; set; }
}

public sealed class LegalDescriptionSourceDto
{
    public required string Type { get; set; }

    public string? Text { get; set; }

    public string? FileName { get; set; }

    public string? ContentType { get; set; }

    public string? Base64Content { get; set; }
}

public sealed class LegalDescriptionInterpretOptionsDto
{
    public int? MaxVertices { get; set; }

    public double? ConfidenceThreshold { get; set; }
}

public sealed class LegalDescriptionInterpretResponse
{
    public required string Mode { get; set; }

    public required string SchemaVersion { get; set; }

    public required LegalDescriptionInterpretationDto Interpretation { get; set; }

    public LegalDescriptionBoundaryDto? Boundary { get; set; }

    public RetryGuidanceDto? Retry { get; set; }
}

public sealed class LegalDescriptionInterpretationDto
{
    public required string Status { get; set; }

    public required double Confidence { get; set; }

    public required string[] Diagnostics { get; set; }
}

public sealed class LegalDescriptionBoundaryDto
{
    public required string Provenance { get; set; }

    public required bool IsReadOnly { get; set; }

    public required LatLngDto[] Vertices { get; set; }

    public required double AreaSquareMeters { get; set; }

    public required double PerimeterMeters { get; set; }

    public required bool HasSelfIntersection { get; set; }
}

public sealed class RetryGuidanceDto
{
    public required bool Allowed { get; set; }

    public required string Message { get; set; }
}

public sealed class ExportSnapshotRequest
{
    public required string ActiveMode { get; set; }

    public required ExportSnapshotStateDto State { get; set; }
}

public sealed class ExportSnapshotStateDto
{
    public string? LegalDescriptionResultId { get; set; }
}

public sealed class ExportSnapshotResponse
{
    public required string SchemaVersion { get; set; }

    public required string Mode { get; set; }

    public required string ExportedAtUtc { get; set; }

    public required object Payload { get; set; }
}