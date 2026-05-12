using SteelTree.GeoAcre.Ocr;

namespace SteelTree.GeoAcre.Geocoding;

public sealed class LegalDescriptionProviderOptions
{
    public OcrProviderOptions Ocr { get; set; } = new();

    public InterpretationProviderOptions Interpretation { get; set; } = new();
}
