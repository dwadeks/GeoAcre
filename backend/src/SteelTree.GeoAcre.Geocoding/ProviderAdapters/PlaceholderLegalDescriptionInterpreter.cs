using Microsoft.Extensions.Options;
using SteelTree.GeoAcre.Geometry;

namespace SteelTree.GeoAcre.Geocoding.ProviderAdapters;

public sealed class PlaceholderLegalDescriptionInterpreter : ILegalDescriptionInterpreter
{
    private readonly LegalDescriptionProviderOptions _options;
    private readonly LegalDescriptionTextNormalizer _normalizer = new();
    private readonly LegalDescriptionCourseParser _courseParser = new();
    private readonly LegalDescriptionBoundaryCandidateBuilder _candidateBuilder = new();

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

        var normalization = _normalizer.Normalize(normalizedLegalText);
        if (string.IsNullOrWhiteSpace(normalization.NormalizedText))
        {
            return Task.FromResult(new LegalInterpretationResult(
                false,
                [],
                ["Legal description text is empty after normalization."],
                _options.Interpretation.Provider));
        }

        var parse = _courseParser.Parse(normalization.NormalizedText);
        if (parse.Courses.Count < 3)
        {
            var diagnostics = parse.Diagnostics.Count > 0
                ? parse.Diagnostics
                : ["Unable to parse enough direction-distance clauses from the legal description."];

            return Task.FromResult(new LegalInterpretationResult(
                false,
                [],
                diagnostics,
                _options.Interpretation.Provider));
        }

        var vertices = _candidateBuilder.Build(parse.Courses);
        if (vertices.Count < 3)
        {
            return Task.FromResult(new LegalInterpretationResult(
                false,
                [],
                ["Interpreted geometry did not contain enough vertices."],
                _options.Interpretation.Provider));
        }

        var confidence = Math.Min(
            1.0,
            _options.Interpretation.DefaultConfidenceThreshold + (parse.Courses.Count * 0.03));

        var boundary = new InterpretedBoundary(
            vertices,
            confidence,
            []);

        return Task.FromResult(new LegalInterpretationResult(
            true,
            [boundary],
            parse.Diagnostics,
            _options.Interpretation.Provider));
    }
}
