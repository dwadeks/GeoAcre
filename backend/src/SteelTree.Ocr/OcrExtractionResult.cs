namespace SteelTree.Ocr;

public sealed record OcrExtractionResult(
    bool Success,
    string ExtractedText,
    IReadOnlyList<string> Diagnostics,
    double Confidence);
