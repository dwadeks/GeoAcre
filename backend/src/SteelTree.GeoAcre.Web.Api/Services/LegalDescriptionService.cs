using SteelTree.GeoAcre.Geocoding;
using SteelTree.GeoAcre.Web.Api.Models;

namespace SteelTree.GeoAcre.Web.Api.Services;

public sealed class LegalDescriptionService : ILegalDescriptionService
{
    private const string SchemaVersion = "2.0.0";

    private readonly ILegalDescriptionOcrService _ocrService;
    private readonly ILegalDescriptionInterpreter _interpreter;
    private readonly ILegalDescriptionBoundaryMapper _boundaryMapper;

    public LegalDescriptionService(
        ILegalDescriptionOcrService ocrService,
        ILegalDescriptionInterpreter interpreter,
        ILegalDescriptionBoundaryMapper boundaryMapper)
    {
        _ocrService = ocrService;
        _interpreter = interpreter;
        _boundaryMapper = boundaryMapper;
    }

    public async Task<LegalDescriptionProcessingResult> InterpretAsync(
        LegalDescriptionInterpretRequest request,
        CancellationToken cancellationToken = default)
    {
        var source = request.Source;
        if (!TryBuildSource(source, out var domainSource, out var validationError))
        {
            return new LegalDescriptionProcessingResult
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Error = validationError,
                Code = "INVALID_INPUT_SOURCE",
            };
        }

        var normalizedText = domainSource.Text;
        if (domainSource.Type == LegalInputType.UploadedImage)
        {
            var ocrResult = await _ocrService.ExtractTextAsync(domainSource, cancellationToken);
            if (!ocrResult.Success || string.IsNullOrWhiteSpace(ocrResult.ExtractedText))
            {
                return new LegalDescriptionProcessingResult
                {
                    StatusCode = StatusCodes.Status422UnprocessableEntity,
                    Response = BuildRetryResponse(
                        ocrResult.Confidence,
                        ocrResult.Diagnostics.Count > 0
                            ? [.. ocrResult.Diagnostics]
                            : ["Unable to extract text from the uploaded image."])
                };
            }

            normalizedText = ocrResult.ExtractedText;
        }

        var interpretation = await _interpreter.InterpretAsync(normalizedText ?? string.Empty, cancellationToken);
        if (!interpretation.Success || interpretation.Candidates.Count == 0)
        {
            return new LegalDescriptionProcessingResult
            {
                StatusCode = StatusCodes.Status422UnprocessableEntity,
                Response = BuildRetryResponse(
                    0,
                    interpretation.Diagnostics.Count > 0
                        ? [.. interpretation.Diagnostics]
                        : ["Unable to interpret the legal description. Please retry."])
            };
        }

        var bestCandidate = interpretation.Candidates.OrderByDescending(c => c.Confidence).First();
        LegalDescriptionBoundaryDto boundary;
        try
        {
            boundary = _boundaryMapper.Map(bestCandidate);
        }
        catch (Exception)
        {
            return new LegalDescriptionProcessingResult
            {
                StatusCode = StatusCodes.Status422UnprocessableEntity,
                Response = BuildRetryResponse(
                    bestCandidate.Confidence,
                    ["Interpreted boundary could not be finalized. Please retry with clearer source data."])
            };
        }

        return new LegalDescriptionProcessingResult
        {
            StatusCode = StatusCodes.Status200OK,
            Response = new LegalDescriptionInterpretResponse
            {
                Mode = "LegalDescription",
                SchemaVersion = SchemaVersion,
                Interpretation = new LegalDescriptionInterpretationDto
                {
                    Status = "Succeeded",
                    Confidence = bestCandidate.Confidence,
                    Diagnostics = [.. bestCandidate.Diagnostics],
                },
                Boundary = boundary,
            },
        };
    }

    private static LegalDescriptionInterpretResponse BuildRetryResponse(double confidence, string[] diagnostics)
    {
        return new LegalDescriptionInterpretResponse
        {
            Mode = "LegalDescription",
            SchemaVersion = SchemaVersion,
            Interpretation = new LegalDescriptionInterpretationDto
            {
                Status = "NeedsRetry",
                Confidence = confidence,
                Diagnostics = diagnostics,
            },
            Retry = new RetryGuidanceDto
            {
                Allowed = true,
                Message = "Please upload a clearer scan or paste the legal text directly.",
            },
        };
    }

    private static bool TryBuildSource(
        LegalDescriptionSourceDto source,
        out LegalDescriptionSource legalDescriptionSource,
        out string validationError)
    {
        legalDescriptionSource = new LegalDescriptionSource(LegalInputType.PastedText, null, null, null, null);

        var hasText = !string.IsNullOrWhiteSpace(source.Text);
        var hasImageMetadata = !string.IsNullOrWhiteSpace(source.FileName)
            || !string.IsNullOrWhiteSpace(source.ContentType)
            || !string.IsNullOrWhiteSpace(source.Base64Content);

        if (hasText && hasImageMetadata)
        {
            validationError = "Exactly one input source is required";
            return false;
        }

        if (!Enum.TryParse<LegalInputType>(source.Type, ignoreCase: true, out var inputType))
        {
            validationError = "Unsupported legal description source type.";
            return false;
        }

        if (inputType == LegalInputType.PastedText)
        {
            if (!hasText || hasImageMetadata)
            {
                validationError = "PastedText source requires text only.";
                return false;
            }

            legalDescriptionSource = new LegalDescriptionSource(LegalInputType.PastedText, source.Text, null, null, null);
            validationError = string.Empty;
            return true;
        }

        if (string.IsNullOrWhiteSpace(source.FileName)
            || string.IsNullOrWhiteSpace(source.ContentType)
            || string.IsNullOrWhiteSpace(source.Base64Content)
            || hasText)
        {
            validationError = "UploadedImage source requires fileName, contentType, and base64Content only.";
            return false;
        }

        byte[] imageBytes;
        try
        {
            imageBytes = Convert.FromBase64String(source.Base64Content);
        }
        catch (FormatException)
        {
            validationError = "UploadedImage base64Content is invalid.";
            return false;
        }

        legalDescriptionSource = new LegalDescriptionSource(
            LegalInputType.UploadedImage,
            null,
            source.FileName,
            source.ContentType,
            imageBytes);
        validationError = string.Empty;
        return true;
    }
}
