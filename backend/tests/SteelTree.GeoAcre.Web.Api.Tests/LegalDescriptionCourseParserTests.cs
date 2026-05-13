using SteelTree.GeoAcre.Geocoding.ProviderAdapters;

namespace SteelTree.GeoAcre.Web.Api.Tests;

[TestClass]
public class LegalDescriptionCourseParserTests
{
    [TestMethod]
    public void Parse_WithValidClauses_ParsesDirectionAndDistanceInOrder()
    {
        var parser = new LegalDescriptionCourseParser();
        var input = "thence West (W) Three Hundred Seventy (370') feet, thence North (N) 390 feet, thence East 200 ft";

        var result = parser.Parse(input);

        result.Diagnostics.Should().BeEmpty();
        result.Courses.Should().HaveCount(3);
        result.Courses.Select(c => c.Order).Should().Equal(1, 2, 3);
        result.Courses.Select(c => c.Direction).Should().Equal("West", "North", "East");
        result.Courses.Select(c => c.DistanceFeet).Should().Equal(370, 390, 200);
    }

    [TestMethod]
    public void Parse_WithDiagonalDirections_ParsesDirectionalVariants()
    {
        var parser = new LegalDescriptionCourseParser();
        var input = "thence in a Northeasterly direction 400 feet; thence in a Northwesterly direction 400 feet";

        var result = parser.Parse(input);

        result.Diagnostics.Should().BeEmpty();
        result.Courses.Should().HaveCount(2);
        result.Courses[0].Direction.Should().Be("Northeast");
        result.Courses[1].Direction.Should().Be("Northwest");
    }

    [TestMethod]
    public void Parse_WithMalformedClauses_ReturnsDiagnosticsAndNoCourses()
    {
        var parser = new LegalDescriptionCourseParser();
        var input = "thence toward the creek; thence maybe west someday";

        var result = parser.Parse(input);

        result.Courses.Should().BeEmpty();
        result.Diagnostics.Should().NotBeEmpty();
        result.Diagnostics.Should().Contain(d => d.Contains("direction", StringComparison.OrdinalIgnoreCase));
        result.Diagnostics.Should().Contain(d => d.Contains("No parseable direction-distance courses", StringComparison.OrdinalIgnoreCase));
    }

    [TestMethod]
    public void Parse_WithEmptyInput_ReturnsEmptyNormalizationDiagnostic()
    {
        var parser = new LegalDescriptionCourseParser();

        var result = parser.Parse("   ");

        result.Courses.Should().BeEmpty();
        result.Diagnostics.Should().ContainSingle(d => d.Contains("empty after normalization", StringComparison.OrdinalIgnoreCase));
    }
    [TestMethod]
    public void Parse_WithAbbreviatedDirectionsAndMixedPunctuation_ParsesAllCourses()
    {
        var parser = new LegalDescriptionCourseParser();
        var input = "thence (N) 100 ft; thence (W), 200 ft; thence (S), 300 ft; thence (E) 400 ft";

        var result = parser.Parse(input);

        result.Diagnostics.Should().BeEmpty();
        result.Courses.Should().HaveCount(4);
        result.Courses.Select(c => c.Direction).Should().Equal("North", "West", "South", "East");
        result.Courses.Select(c => c.DistanceFeet).Should().Equal(100, 200, 300, 400);
    }
}