namespace SteelTree.GeoAcre.Ocr;

public sealed class OcrProviderOptions
{
    public string Provider { get; set; } = "Placeholder";

    public string Endpoint { get; set; } = string.Empty;

    public string ApiKey { get; set; } = string.Empty;

    public int TimeoutSeconds { get; set; } = 30;
}
