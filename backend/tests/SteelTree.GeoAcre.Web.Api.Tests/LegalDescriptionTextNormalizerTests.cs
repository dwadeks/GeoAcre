using SteelTree.GeoAcre.Geocoding.ProviderAdapters;

namespace SteelTree.GeoAcre.Web.Api.Tests;

[TestClass]
public class LegalDescriptionTextNormalizerTests
{
    [TestMethod]
    public void Normalize_WithTractHeading_RemovesHeadingAndCapturesMetadata()
    {
        var normalizer = new LegalDescriptionTextNormalizer();

        var result = normalizer.Normalize("Tract II:   thence West (W) 370 feet");

        result.HeadingRemoved.Should().BeTrue();
        result.HeadingValue.Should().Be("Tract II");
        result.NormalizedText.Should().Be("thence West (W) 370 feet");
    }

    [TestMethod]
    public void Normalize_WithoutTractHeading_PreservesClauseText()
    {
        var normalizer = new LegalDescriptionTextNormalizer();

        var result = normalizer.Normalize("thence North (N) 390 feet");

        result.HeadingRemoved.Should().BeFalse();
        result.HeadingValue.Should().BeNull();
        result.NormalizedText.Should().Be("thence North (N) 390 feet");
    }

    [TestMethod]
    public void Normalize_WithMixedWhitespace_CompactsWhitespace()
    {
        var normalizer = new LegalDescriptionTextNormalizer();

        var result = normalizer.Normalize(" Tract IV:   thence   East   200 feet   ");

        result.NormalizedText.Should().Be("thence East 200 feet");
    }

    [TestMethod]
    public void Normalize_WithEmptyInput_ReturnsEmptyResult()
    {
        var normalizer = new LegalDescriptionTextNormalizer();

        var result = normalizer.Normalize(" ");

        result.OriginalText.Should().BeEmpty();
        result.NormalizedText.Should().BeEmpty();
        result.HeadingRemoved.Should().BeFalse();
    }
}