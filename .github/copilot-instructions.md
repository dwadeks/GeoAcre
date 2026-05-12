<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
- **Implementation Plan**: specs/002-legal-description-mapping/plan.md
- **Data Model**: specs/002-legal-description-mapping/data-model.md
- **Research**: specs/002-legal-description-mapping/research.md
- **API Contract**: specs/002-legal-description-mapping/contracts/api-contract.md
- **Legal Description Provider Contract**: specs/002-legal-description-mapping/contracts/legal-description-provider-contract.md
- **Quickstart**: specs/002-legal-description-mapping/quickstart.md

## Backend Architecture Rule

- Service contracts and implementations belong in `backend/src/SteelTree.GeoAcre/Services`
	under the `SteelTree.GeoAcre.Services` namespace.
- `backend/src/SteelTree.GeoAcre.Web.Api` should stay thin and focus on
	bootstrapping, dependency injection, and HTTP DTO translation.
<!-- SPECKIT END -->
