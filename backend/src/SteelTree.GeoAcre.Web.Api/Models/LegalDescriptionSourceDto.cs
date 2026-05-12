namespace SteelTree.GeoAcre.Web.Api.Models;

public sealed class LegalDescriptionSourceDto
{
    public required string Type { get; set; }

    public string? Text { get; set; }

    public string? FileName { get; set; }

    public string? ContentType { get; set; }

    public string? Base64Content { get; set; }
}
