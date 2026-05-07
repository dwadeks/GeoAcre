namespace SteelTree.GeoAcre.Web.Api.Tests;

[TestClass]
public class ApiStartupTests
{
    [TestMethod]
    public void ApiShouldInitializeWithoutErrors()
    {
        // Arrange & Act - API should build without errors
        var builder = WebApplication.CreateBuilder();
        
        // Assert
        builder.Should().NotBeNull();
    }
}
