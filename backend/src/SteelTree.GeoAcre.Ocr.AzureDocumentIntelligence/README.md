# Azure Document Intelligence OCR Service

This project implements legal description OCR extraction using the Azure Document Intelligence .NET SDK.

## Overview

The service uses the `prebuilt-read` model via `DocumentAnalysisClient` to extract text from uploaded legal description images and PDFs.

## Configuration

Add this to appsettings:

```json
{
  "LegalDescriptionProviders": {
    "Ocr": {
      "Provider": "AzureDocumentIntelligence",
      "Endpoint": "https://<your-resource-name>.cognitiveservices.azure.com/",
      "ApiKey": "<your-api-key>",
      "TimeoutSeconds": 30
    }
  }
}
```

## Registration

```csharp
services.AddAzureDocumentIntelligenceOcr();
```

## Notes

- Uses Azure SDK (not direct REST calls)
- Model: `prebuilt-read`
- Returns extracted text and average word confidence
