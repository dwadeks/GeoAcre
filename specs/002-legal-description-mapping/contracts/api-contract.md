# API Contract: Legal Description Mapping (V2)

**Version**: 2.0.0-draft  
**Base URL**: `/api`  
**Auth**: None (current state); deployment-ready for future auth enablement  
**Content-Type**: `application/json`

## Endpoint: Interpret Legal Description

`POST /api/legal-description/interpret`

Accepts exactly one source type per request: pasted text or uploaded image payload.

Request:

```json
{
  "source": {
    "type": "PastedText",
    "text": "Beginning at the NW corner of..."
  },
  "options": {
    "maxVertices": 500,
    "confidenceThreshold": 0.7
  }
}
```

```json
{
  "source": {
    "type": "UploadedImage",
    "fileName": "legal-description.png",
    "contentType": "image/png",
    "base64Content": "iVBORw0KGgoAAAANSUhEUg..."
  },
  "options": {
    "maxVertices": 500,
    "confidenceThreshold": 0.7
  }
}
```

Validation rules:
- `source.type` is required and must be `PastedText` or `UploadedImage`.
- `PastedText` requires `text`; image properties must be omitted.
- `UploadedImage` requires `fileName`, `contentType`, `base64Content`; `text` must be omitted.
- If both text and image properties are provided, return `400`.

Success response (`200`):

```json
{
  "mode": "LegalDescription",
  "schemaVersion": "2.0.0",
  "interpretation": {
    "status": "Succeeded",
    "confidence": 0.92,
    "diagnostics": []
  },
  "boundary": {
    "provenance": "LegalInterpretation",
    "isReadOnly": true,
    "vertices": [
      { "latitude": 39.7817, "longitude": -89.6501 },
      { "latitude": 39.7820, "longitude": -89.6510 },
      { "latitude": 39.7809, "longitude": -89.6512 }
    ],
    "areaSquareMeters": 8450.22,
    "perimeterMeters": 372.9,
    "hasSelfIntersection": false
  }
}
```

Retryable failure response (`422`):

```json
{
  "mode": "LegalDescription",
  "schemaVersion": "2.0.0",
  "interpretation": {
    "status": "NeedsRetry",
    "confidence": 0.41,
    "diagnostics": [
      "Uploaded image text is unreadable in section 2",
      "Missing recognizable bearing-distance sequence"
    ]
  },
  "retry": {
    "allowed": true,
    "message": "Please upload a clearer scan or paste the legal text directly."
  }
}
```

Validation error (`400`):

```json
{
  "error": "Exactly one input source is required",
  "code": "INVALID_INPUT_SOURCE"
}
```

Provider unavailable (`503`):

```json
{
  "error": "Legal interpretation provider unavailable",
  "code": "SERVICE_UNAVAILABLE"
}
```

## Endpoint: Export Active Mode Snapshot

`POST /api/export`

Request:

```json
{
  "activeMode": "LegalDescription",
  "state": {
    "legalDescriptionResultId": "4f96d2f6-8cdd-4f95-9d1a-a3de0769c103"
  }
}
```

Success response (`200`):

```json
{
  "schemaVersion": "2.0.0",
  "mode": "LegalDescription",
  "exportedAtUtc": "2026-05-11T20:00:00Z",
  "payload": {
    "provenance": "LegalInterpretation",
    "isReadOnly": true,
    "vertices": [
      { "latitude": 39.7817, "longitude": -89.6501 },
      { "latitude": 39.7820, "longitude": -89.6510 },
      { "latitude": 39.7809, "longitude": -89.6512 }
    ],
    "areaSquareMeters": 8450.22,
    "perimeterMeters": 372.9
  }
}
```

No complete result (`409`):

```json
{
  "error": "No completed result exists for active mode",
  "code": "EXPORT_NOT_AVAILABLE"
}
```

## Mode-specific export payload contracts

### DrawBoundary payload

```json
{
  "provenance": "Manual",
  "vertices": [{ "latitude": 0, "longitude": 0 }],
  "excludePolygons": [],
  "areaSquareMeters": 0,
  "perimeterMeters": 0
}
```

### LegalDescription payload

```json
{
  "provenance": "LegalInterpretation",
  "isReadOnly": true,
  "vertices": [{ "latitude": 0, "longitude": 0 }],
  "areaSquareMeters": 0,
  "perimeterMeters": 0,
  "interpretationConfidence": 0.0
}
```

### MeasureDistance payload

```json
{
  "vertices": [{ "latitude": 0, "longitude": 0 }],
  "totalDistanceMeters": 0,
  "perSegmentDistancesMeters": []
}
```
