namespace SteelTree.GeoAcre.Geocoding;

public sealed class InterpretationProviderOptions
{
    public string Provider { get; set; } = "Placeholder";

    public string Endpoint { get; set; } = string.Empty;

    public string ApiKey { get; set; } = string.Empty;

    public int TimeoutSeconds { get; set; } = 60;

    public double DefaultConfidenceThreshold { get; set; } = 0.7;

    public int MaxVertices { get; set; } = 500;
}
