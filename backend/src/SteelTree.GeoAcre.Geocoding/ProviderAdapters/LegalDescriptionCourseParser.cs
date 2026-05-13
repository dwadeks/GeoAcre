using System.Globalization;
using System.Text.RegularExpressions;

namespace SteelTree.GeoAcre.Geocoding.ProviderAdapters;

public sealed class LegalDescriptionCourseParser
{
    private static readonly Regex SegmentSplitRegex = new(
        @"\bthence\b",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex ParenthesizedDistanceRegex = new(
        @"\((?<num>\d+(?:\.\d+)?)\s*'?\)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex InlineDistanceRegex = new(
        @"\b(?<num>\d+(?:\.\d+)?)\s*(?:feet|foot|ft|')\b",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public ParseResult Parse(string normalizedLegalText)
    {
        var diagnostics = new List<string>();
        var courses = new List<CourseClause>();

        if (string.IsNullOrWhiteSpace(normalizedLegalText))
        {
            diagnostics.Add("Legal description text is empty after normalization.");
            return new ParseResult(courses, diagnostics);
        }

        var segments = SegmentSplitRegex.Split(normalizedLegalText)
            .Select(segment => segment.Trim(' ', ',', ';', '.'))
            .Where(segment => !string.IsNullOrWhiteSpace(segment))
            .ToList();

        var order = 1;
        foreach (var segment in segments)
        {
            if (!TryResolveDirection(segment, out var direction))
            {
                diagnostics.Add($"Missing recognizable direction in clause: '{segment}'.");
                continue;
            }

            if (!TryResolveDistanceFeet(segment, out var distanceFeet))
            {
                diagnostics.Add($"Missing measurable distance in clause: '{segment}'.");
                continue;
            }

            courses.Add(new CourseClause(order, direction, distanceFeet, segment));
            order++;
        }

        if (courses.Count == 0)
        {
            diagnostics.Add("No parseable direction-distance courses were found in the legal description.");
        }

        return new ParseResult(courses, diagnostics);
    }

    private static bool TryResolveDistanceFeet(string segment, out double distanceFeet)
    {
        distanceFeet = 0;

        var parenthesizedMatch = ParenthesizedDistanceRegex.Match(segment);
        if (parenthesizedMatch.Success)
        {
            return double.TryParse(
                parenthesizedMatch.Groups["num"].Value,
                NumberStyles.Float,
                CultureInfo.InvariantCulture,
                out distanceFeet);
        }

        var inlineMatch = InlineDistanceRegex.Match(segment);
        if (inlineMatch.Success)
        {
            return double.TryParse(
                inlineMatch.Groups["num"].Value,
                NumberStyles.Float,
                CultureInfo.InvariantCulture,
                out distanceFeet);
        }

        return false;
    }

    private static bool TryResolveDirection(string segment, out string direction)
    {
        direction = string.Empty;
        var text = segment.ToLowerInvariant();

        if (text.Contains("northeasterly", StringComparison.Ordinal) || text.Contains("northeast", StringComparison.Ordinal))
        {
            direction = "Northeast";
            return true;
        }

        if (text.Contains("northwesterly", StringComparison.Ordinal) || text.Contains("northwest", StringComparison.Ordinal))
        {
            direction = "Northwest";
            return true;
        }

        if (text.Contains("southeasterly", StringComparison.Ordinal) || text.Contains("southeast", StringComparison.Ordinal))
        {
            direction = "Southeast";
            return true;
        }

        if (text.Contains("southwesterly", StringComparison.Ordinal) || text.Contains("southwest", StringComparison.Ordinal))
        {
            direction = "Southwest";
            return true;
        }

        if (Regex.IsMatch(text, @"\bnorth\b|\(n\)", RegexOptions.IgnoreCase))
        {
            direction = "North";
            return true;
        }

        if (Regex.IsMatch(text, @"\bsouth\b|\(s\)", RegexOptions.IgnoreCase))
        {
            direction = "South";
            return true;
        }

        if (Regex.IsMatch(text, @"\beast\b|\(e\)", RegexOptions.IgnoreCase))
        {
            direction = "East";
            return true;
        }

        if (Regex.IsMatch(text, @"\bwest\b|\(w\)", RegexOptions.IgnoreCase))
        {
            direction = "West";
            return true;
        }

        return false;
    }

    public sealed class ParseResult
    {
        public ParseResult(IReadOnlyList<CourseClause> courses, IReadOnlyList<string> diagnostics)
        {
            Courses = courses;
            Diagnostics = diagnostics;
        }

        public IReadOnlyList<CourseClause> Courses { get; }

        public IReadOnlyList<string> Diagnostics { get; }
    }

    public sealed class CourseClause
    {
        public CourseClause(int order, string direction, double distanceFeet, string sourceFragment)
        {
            Order = order;
            Direction = direction;
            DistanceFeet = distanceFeet;
            SourceFragment = sourceFragment;
        }

        public int Order { get; }

        public string Direction { get; }

        public double DistanceFeet { get; }

        public string SourceFragment { get; }
    }
}