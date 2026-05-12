using SteelTree.GeoAcre.Geocoding;

namespace SteelTree.GeoAcre.Services;

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
        LegalDescriptionInterpretCommand command,
        CancellationToken cancellationToken = default)
    {
        if (!TryBuildSource(command, out var domainSource, out var validationError))
        {
            return new LegalDescriptionProcessingResult
            {
                StatusCode = 400,
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
                    StatusCode = 422,
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
                StatusCode = 422,
                Response = BuildRetryResponse(
                    0,
                    interpretation.Diagnostics.Count > 0
                        ? [.. interpretation.Diagnostics]
                        : ["Unable to interpret the legal description. Please retry."])
            };
        }

        var bestCandidate = interpretation.Candidates.OrderByDescending(c => c.Confidence).First();
        LegalDescriptionBoundaryResult boundary;
        try
        {
            boundary = _boundaryMapper.Map(bestCandidate);
        }
        catch (Exception)
        {
            return new LegalDescriptionProcessingResult
            {
                StatusCode = 422,
                Response = BuildRetryResponse(
                    bestCandidate.Confidence,
                    ["Interpreted boundary could not be finalized. Please retry with clearer source data."])
            };
        }

        return new LegalDescriptionProcessingResult
        {
            StatusCode = 200,
            Response = new LegalDescriptionInterpretationResult
            {
                Mode = "LegalDescription",
                SchemaVersion = SchemaVersion,
                Status = "Succeeded",
                Confidence = bestCandidate.Confidence,
                Diagnostics = [.. bestCandidate.Diagnostics],
                Boundary = boundary,
            },
        };
    }

    private static LegalDescriptionInterpretationResult BuildRetryResponse(double confidence, string[] diagnostics)
    {
        return new LegalDescriptionInterpretationResult
        {
            Mode = "LegalDescription",
            SchemaVersion = SchemaVersion,
            Status = "NeedsRetry",
            Confidence = confidence,
            Diagnostics = diagnostics,
            Retry = new LegalDescriptionRetryGuidanceResult
            {
                Allowed = true,
                Message = "Please upload a clearer scan or paste the legal text directly.",
            },
        };
    }

    private static bool TryBuildSource(
        LegalDescriptionInterpretCommand command,
        out LegalDescriptionSource legalDescriptionSource,
        out string validationError)
    {
        legalDescriptionSource = new LegalDescriptionSource(LegalInputType.PastedText, null, null, null, null);

        var hasText = !string.IsNullOrWhiteSpace(command.Text);
        var hasImageMetadata = !string.IsNullOrWhiteSpace(command.FileName)
            || !string.IsNullOrWhiteSpace(command.ContentType)
            || !string.IsNullOrWhiteSpace(command.Base64Content);

        if (hasText && hasImageMetadata)
        {
            validationError = "Exactly one input source is required";
            return false;
        }

        if (!Enum.TryParse<LegalInputType>(command.SourceType, ignoreCase: true, out var inputType))
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

            legalDescriptionSource = new LegalDescriptionSource(LegalInputType.PastedText, command.Text, null, null, null);
            validationError = string.Empty;
            return true;
        }

        if (string.IsNullOrWhiteSpace(command.FileName)
            || string.IsNullOrWhiteSpace(command.ContentType)
            || string.IsNullOrWhiteSpace(command.Base64Content)
            || hasText)
        {
            validationError = "UploadedImage source requires fileName, contentType, and base64Content only.";
            return false;
        }

        byte[] imageBytes;
        try
        {
            imageBytes = Convert.FromBase64String(command.Base64Content);
        }
        catch (FormatException)
        {
            validationError = "UploadedImage base64Content is invalid.";
            return false;
        }

        legalDescriptionSource = new LegalDescriptionSource(
            LegalInputType.UploadedImage,
            null,
            command.FileName,
            command.ContentType,
            imageBytes);
        validationError = string.Empty;
        return true;
    }
}
