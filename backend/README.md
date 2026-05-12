# GeoAcre Backend

## Projects
- SteelTree.GeoAcre: core application library that owns service contracts and implementations under `SteelTree.GeoAcre.Services`.
- SteelTree.GeoAcre.Geometry: core geodetic and polygon math library.
- SteelTree.GeoAcre.Geocoding: geocoding abstraction layer.
- SteelTree.GeoAcre.Web.Api: ASP.NET Core API host focused on bootstrapping, DI wiring, and HTTP request/response translation.

## Commands
- Restore: dotnet restore
- Run API: dotnet run --project src/SteelTree.GeoAcre.Web.Api/SteelTree.GeoAcre.Web.Api.csproj
- Run tests: dotnet test
- Run tests with coverage: dotnet test --collect:"XPlat Code Coverage"

## OCR Integration Tests
- Copy `tests/integration/.env.ocr.local.example` to `tests/integration/.env.ocr.local`.
- Fill in these required values:
	- `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT`
	- `AZURE_DOCUMENT_INTELLIGENCE_API_KEY`
- Run the helper script from the backend folder:
	- `pwsh ./tests/integration/Run-OcrIntegrationTests.ps1`
- Optional flags:
	- `pwsh ./tests/integration/Run-OcrIntegrationTests.ps1 -NoBuild`
	- `pwsh ./tests/integration/Run-OcrIntegrationTests.ps1 -EnvFile ./tests/integration/.env.ocr.local`

## Notes
- Target framework: net10.0.
- Test framework: MSTest.
- Assertions: FluentAssertions.
- Architecture boundary:
	- Service contracts and implementations MUST live in `backend/src/SteelTree.GeoAcre/Services` (`SteelTree.GeoAcre.Services` namespace).
	- `SteelTree.GeoAcre.Web.Api` controllers should translate between HTTP DTOs and core service models only.
	- `SteelTree.GeoAcre.Web.Api` should avoid hosting business/service logic beyond API composition concerns.
- Hand-authored backend code must keep exactly one top-level class or one top-level interface per file.
- Code files containing a single class or interface MUST be named identically to that artifact.
	For example, a class `Polygon` goes in `Polygon.cs`; an interface `IGeocodeService` goes in `IGeocodeService.cs`.
