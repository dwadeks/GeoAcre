using Microsoft.Extensions.Options;
using SteelTree.GeoAcre.Geocoding;
using SteelTree.GeoAcre.Geocoding.ProviderAdapters;

namespace SteelTree.GeoAcre.Web.Api.Tests;

[TestClass]
public class LegalDescriptionInterpreterDiagnosticsTests
{
    [TestMethod]
    public async Task InterpretAsync_WithMalformedClauses_ReturnsDiagnostics()
    {
        var interpreter = CreateInterpreter();
        var malformed = "Tract IV: thence West and then somewhere near creek; thence maybe north-ish without measurable distance.";

        var result = await interpreter.InterpretAsync(malformed);

        result.Success.Should().BeFalse();
        result.Candidates.Should().BeEmpty();
        result.Diagnostics.Should().NotBeEmpty();
        result.Diagnostics.Should().Contain(d => d.Contains("distance", StringComparison.OrdinalIgnoreCase) || d.Contains("direction", StringComparison.OrdinalIgnoreCase));
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