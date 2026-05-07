# API Contract: Land Area Estimator Backend

**Version**: 1.0.0  
**Base URL**: `https://{app}.azurewebsites.net/api` (or localhost:5000 in dev)  
**Authentication**: None (v1 stateless)  
**Content-Type**: application/json

---

## Endpoints

### Geocoding

#### POST /geocode/search

Search for a location by address.

**Request**:
```json
{
  "query": "string",  // e.g., "123 Main St, Springfield, IL"
  "maxResults": 5     // optional, default 5
}
```

**Response** (200 OK):
```json
{
  "results": [
    {
      "id": "string",          // Unique result ID
      "displayName": "string", // e.g., "123 Main Street, Springfield, IL, USA"
      "latitude": 39.7817,
      "longitude": -89.6501,
      "boundingBox": {         // optional; polygon boundary of the location
        "minLat": 39.7810,
        "maxLat": 39.7824,
        "minLon": -89.6510,
        "maxLon": -89.6492
      }
    }
  ]
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Invalid query: query cannot be empty"
}
```

**Response** (503 Service Unavailable):
```json
{
  "error": "Geocoding service unavailable; please try again later"
}
```

---

#### POST /geocode/reverse

Reverse-geocode coordinates to an address.

**Request**:
```json
{
  "latitude": 39.7817,
  "longitude": -89.6501
}
```

**Response** (200 OK):
```json
{
  "address": "string",  // e.g., "123 Main Street, Springfield, IL, USA"
  "latitude": 39.7817,
  "longitude": -89.6501
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Invalid coordinates"
}
```

---

### Geometry Validation (Optional for v1)

These endpoints are for **server-side validation** of client calculations. They are optional in v1 but included for contract completeness and future export/persistence validation.

#### POST /geometry/calculate-area

Validate and calculate area of a polygon.

**Request**:
```json
{
  "vertices": [
    { "latitude": 39.7817, "longitude": -89.6501 },
    { "latitude": 39.7820, "longitude": -89.6505 },
    { "latitude": 39.7815, "longitude": -89.6510 }
  ],
  "excludePolygons": [
    {
      "vertices": [
        { "latitude": 39.7818, "longitude": -89.6503 },
        { "latitude": 39.7819, "longitude": -89.6504 },
        { "latitude": 39.7818, "longitude": -89.6505 }
      ]
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "areaSquareMeters": 12345.67,
  "perSideLengthsMeters": [123.45, 134.56, 145.67],
  "hasIntersections": false,
  "perimeter Meters": 403.68,
  "excludedAreaSquareMeters": 100.0,
  "netAreaSquareMeters": 12245.67
}
```

---

#### POST /geometry/calculate-distance

Calculate distance along a polyline.

**Request**:
```json
{
  "vertices": [
    { "latitude": 39.7817, "longitude": -89.6501 },
    { "latitude": 39.7820, "longitude": -89.6505 },
    { "latitude": 39.7825, "longitude": -89.6510 }
  ]
}
```

**Response** (200 OK):
```json
{
  "totalDistanceMeters": 678.90,
  "perSegmentDistancesMeters": [234.56, 445.34]
}
```

---

## Error Handling

All endpoints follow this error format:

**400 Bad Request** — Malformed input
```json
{
  "error": "Field 'query' is required",
  "code": "INVALID_INPUT"
}
```

**429 Too Many Requests** — Rate limited
```json
{
  "error": "Rate limit exceeded; retry after 60 seconds",
  "code": "RATE_LIMITED",
  "retryAfter": 60
}
```

**500 Internal Server Error** — Server error
```json
{
  "error": "An unexpected error occurred",
  "code": "INTERNAL_ERROR"
}
```

**503 Service Unavailable** — Dependent service (geocoding, tile server) is down
```json
{
  "error": "External service unavailable; please try again later",
  "code": "SERVICE_UNAVAILABLE"
}
```

---

## Rate Limits

- **Geocoding endpoints**: 10 requests per second per IP
- **Geometry endpoints**: 100 requests per second per IP
- **All endpoints**: 1000 requests per hour per IP (optional for v1)

---

## Headers

**Request**:
```
Content-Type: application/json
Accept: application/json
```

**Response**:
```
Content-Type: application/json
X-Request-Id: uuid  # For tracing
```

---

## Examples (cURL)

### Geocode an address

```bash
curl -X POST https://localhost:5000/api/geocode/search \
  -H "Content-Type: application/json" \
  -d '{"query": "123 Main St, Springfield, IL"}'
```

### Reverse-geocode

```bash
curl -X POST https://localhost:5000/api/geocode/reverse \
  -H "Content-Type: application/json" \
  -d '{"latitude": 39.7817, "longitude": -89.6501}'
```

### Validate area calculation

```bash
curl -X POST https://localhost:5000/api/geometry/calculate-area \
  -H "Content-Type: application/json" \
  -d '{
    "vertices": [
      {"latitude": 39.7817, "longitude": -89.6501},
      {"latitude": 39.7820, "longitude": -89.6505},
      {"latitude": 39.7815, "longitude": -89.6510}
    ]
  }'
```
