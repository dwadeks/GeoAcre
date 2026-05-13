using System.Text.RegularExpressions;

namespace SteelTree.GeoAcre.Geocoding.ProviderAdapters;

public sealed class LegalDescriptionTextNormalizer
{
    private static readonly Regex TractHeadingRegex = new(
        @"^\s*(?<heading>Tract\s+[A-Za-z0-9]+)\s*:\s*",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex MultiSpaceRegex = new(
        @"\s+",
        RegexOptions.Compiled);

    public NormalizationResult Normalize(string input)
    {
        var originalText = input?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(originalText))
        {
            return new NormalizationResult(string.Empty, string.Empty, false, null);
        }

        var match = TractHeadingRegex.Match(originalText);
        var withoutHeading = match.Success
            ? originalText[match.Length..]
            : originalText;

        var normalized = MultiSpaceRegex.Replace(withoutHeading, " ").Trim();
        return new NormalizationResult(
            originalText,
            normalized,
            match.Success,
            match.Success ? match.Groups["heading"].Value : null);
    }

    public sealed class NormalizationResult
    {
        public NormalizationResult(string originalText, string normalizedText, bool headingRemoved, string? headingValue)
        {
            OriginalText = originalText;
            NormalizedText = normalizedText;
            HeadingRemoved = headingRemoved;
            HeadingValue = headingValue;
        }

        public string OriginalText { get; }

        public string NormalizedText { get; }

        public bool HeadingRemoved { get; }

        public string? HeadingValue { get; }
    }
}