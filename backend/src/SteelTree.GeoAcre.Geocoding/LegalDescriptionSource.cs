namespace SteelTree.GeoAcre.Geocoding;

public sealed record LegalDescriptionSource(
    LegalInputType Type,
    string? Text,
    string? FileName,
    string? ContentType,
    byte[]? ImageBytes);
