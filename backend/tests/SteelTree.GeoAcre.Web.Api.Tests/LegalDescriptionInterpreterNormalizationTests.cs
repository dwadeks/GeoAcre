using Microsoft.Extensions.Options;
using SteelTree.GeoAcre.Geocoding;
using SteelTree.GeoAcre.Geocoding.ProviderAdapters;

namespace SteelTree.GeoAcre.Web.Api.Tests;

[TestClass]
public class LegalDescriptionInterpreterNormalizationTests
{
    [TestMethod]
    public async Task InterpretAsync_WithAndWithoutTractPrefix_ProducesEquivalentCandidates()
    {
        var interpreter = CreateInterpreter();

        var withPrefix = "Tract II: thence West (W) Three Hundred Seventy (370') feet, thence North (N) Three Hundred Ninety (390') feet, thence East Two Hundred (200') feet, thence South Two Hundred Eighty (280') feet, thence East One Hundred Seventy (170') feet, thence South One Hundred Ten (110') feet.";
        var withoutPrefix = withPrefix.Replace("Tract II: ", string.Empty, StringComparison.OrdinalIgnoreCase);

        var prefixedResult = await interpreter.InterpretAsync(withPrefix);
        var noPrefixResult = await interpreter.InterpretAsync(withoutPrefix);

        prefixedResult.Success.Should().BeTrue();
        noPrefixResult.Success.Should().BeTrue();
        prefixedResult.Candidates.Should().HaveCount(1);
        noPrefixResult.Candidates.Should().HaveCount(1);

        prefixedResult.Candidates[0].Vertices.Count.Should().BeGreaterThanOrEqualTo(4);
        noPrefixResult.Candidates[0].Vertices.Count.Should().Be(prefixedResult.Candidates[0].Vertices.Count);

        prefixedResult.Candidates[0].Diagnostics.Should().BeEmpty();
        noPrefixResult.Candidates[0].Diagnostics.Should().BeEmpty();

        prefixedResult.Candidates[0].Vertices.Should().BeEquivalentTo(noPrefixResult.Candidates[0].Vertices, options => options.WithStrictOrdering());
    }

    private static PlaceholderLegalDescriptionInterpreter CreateInterpreter()
    {
        var options = Options.Create(new LegalDescriptionProviderOptions
        {
            Interpretation = new InterpretationProviderOptions
            {
                Provider = "Placeholder",
                DefaultConfidenceThreshold = 0.7,
            },
        });

        return new PlaceholderLegalDescriptionInterpreter(options);
    }
}