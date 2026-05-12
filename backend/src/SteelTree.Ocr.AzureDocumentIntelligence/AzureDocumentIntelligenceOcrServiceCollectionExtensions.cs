namespace SteelTree.Ocr.AzureDocumentIntelligence;

public static class AzureDocumentIntelligenceOcrServiceCollectionExtensions
{
    public static IServiceCollection AddAzureDocumentIntelligenceOcr(this IServiceCollection services)
    {
        services.AddSingleton<IOcrService, AzureDocumentIntelligenceOcrService>();
        return services;
    }
}
