namespace SteelTree.GeoAcre.Web.Api.Models;

public sealed class RetryGuidanceDto
{
    public required bool Allowed { get; set; }

    public required string Message { get; set; }
}
