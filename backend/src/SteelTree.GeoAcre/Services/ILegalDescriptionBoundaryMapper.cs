using SteelTree.GeoAcre.Geocoding;

namespace SteelTree.GeoAcre.Services;

public interface ILegalDescriptionBoundaryMapper
{
    LegalDescriptionBoundaryResult Map(InterpretedBoundary boundary);
}
