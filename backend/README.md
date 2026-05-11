# GeoAcre Backend

## Projects
- SteelTree.GeoAcre.Geometry: core geodetic and polygon math library.
- SteelTree.GeoAcre.Geocoding: geocoding abstraction layer.
- SteelTree.GeoAcre.Web.Api: ASP.NET Core API host for geometry and geocoding endpoints.

## Commands
- Restore: dotnet restore
- Run API: dotnet run --project src/SteelTree.GeoAcre.Web.Api/SteelTree.GeoAcre.Web.Api.csproj
- Run tests: dotnet test
- Run tests with coverage: dotnet test --collect:"XPlat Code Coverage"

## Notes
- Target framework: net10.0.
- Test framework: MSTest.
- Assertions: FluentAssertions.
