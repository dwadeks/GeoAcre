using Microsoft.Extensions.Options;
using SteelTree.GeoAcre.Geometry;

namespace SteelTree.GeoAcre.Geocoding.ProviderAdapters;

public sealed class PlaceholderLegalDescriptionInterpreter : ILegalDescriptionInterpreter
{
    private readonly LegalDescriptionProviderOptions _options;

    public PlaceholderLegalDescriptionInterpreter(IOptions<LegalDescriptionProviderOptions> options)
    {
        _options = options.Value;
    }

    public Task<LegalInterpretationResult> InterpretAsync(
        string normalizedLegalText,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(normalizedLegalText))
        {
            return Task.FromResult(new LegalInterpretationResult(
                false,
                [],
                ["Legal description text is required for interpretation."],
                _options.Interpretation.Provider));
        }

        var boundary = new InterpretedBoundary(
            [
                new GeoPoint(39.7817, -89.6501),
                new GeoPoint(39.7820, -89.6510),
                new GeoPoint(39.7809, -89.6512),
            ],
            _options.Interpretation.DefaultConfidenceThreshold,
            ["Placeholder interpretation result. Replace with real provider implementation."]);

        return Task.FromResult(new LegalInterpretationResult(
            true,
            [boundary],
            [],
            _options.Interpretation.Provider));
    }
}
