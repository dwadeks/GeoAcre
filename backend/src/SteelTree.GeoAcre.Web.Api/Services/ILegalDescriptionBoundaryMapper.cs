using SteelTree.GeoAcre.Geocoding;
using SteelTree.GeoAcre.Web.Api.Models;

namespace SteelTree.GeoAcre.Web.Api.Services;

public interface ILegalDescriptionBoundaryMapper
{
    LegalDescriptionBoundaryDto Map(InterpretedBoundary boundary);
}
