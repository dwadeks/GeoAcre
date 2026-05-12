namespace SteelTree.Ocr;

public sealed record OcrDocument(
    byte[] ImageBytes,
    string? FileName = null,
    string? ContentType = null);
