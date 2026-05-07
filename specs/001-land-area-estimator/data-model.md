# Data Model: Land Area Estimator

**Date**: 2026-05-07  
**Purpose**: Define core entities and their relationships  
**Input**: Specification user stories + Technical Context research

## Core Entities

### GeoPoint

Represents a single geographic coordinate.

```typescript
// Frontend (TypeScript)
interface GeoPoint {
  latitude: number;  // WGS84, degrees [-90, 90]
  longitude: number; // WGS84, degrees [-180, 180]
}
```

```csharp
// Backend (C#) - SteelTree.GeoAcre.Geometry
public record GeoPoint(double Latitude, double Longitude)
{
    public GeoPoint(double lat, double lon)
        : this(ValidateLatitude(lat), ValidateLongitude(lon))
    {
    }
    private static double ValidateLatitude(double lat) =>
        lat is >= -90d and <= 90d ? lat : throw new ArgumentOutOfRangeException(nameof(lat));
    private static double ValidateLongitude(double lon) =>
        lon is >= -180d and <= 180d ? lon : throw new ArgumentOutOfRangeException(nameof(lon));
}
```

### Polygon (Primary Polygon)

Represents a closed polygon boundary (primary area or exclude area).

```typescript
// Frontend (TypeScript)
interface Polygon {
  id: string;                    // UUID
  vertices: GeoPoint[];          // ≥ 3 points for valid polygon
  isExcludePolygon: boolean;     // true if this is an exclude area
  parentPolygonId?: string;      // set if this is an exclude polygon
  isValid: boolean;              // computed: vertices.length >= 3
  hasIntersections: boolean;     // computed: sides cross each other
  computedAreaSquareMeters: number; // geodetic area
  computedPerimeterMeters: number;
  vertices?: GeoPoint[];  // for fine-tuning via drag
}
```

```csharp
// Backend (C#)
public class Polygon
{
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public List<GeoPoint> Vertices { get; init; } = new();
    public bool IsExcludePolygon { get; init; }
    public string? ParentPolygonId { get; init; }
    
    public bool IsValid => Vertices.Count >= 3;
    public bool HasIntersections => GeoCalculations.DetectIntersections(Vertices);
    public double ComputedAreaSquareMeters => GeoCalculations.ComputeGeoArea(Vertices);
    public double ComputedPerimeterMeters => GeoCalculations.ComputePerimeter(Vertices);
    
    public List<double> PerSideLengthsMeters =>
        Enumerable.Range(0, Vertices.Count)
            .Select(i => GeoCalculations.Distance(
                Vertices[i],
                Vertices[(i + 1) % Vertices.Count]))
            .ToList();
}
```

### Measurement (Polyline / Distance Measurement)

Represents an open path for distance measurement.

```typescript
// Frontend (TypeScript)
interface Measurement {
  id: string;                    // UUID
  vertices: GeoPoint[];          // ≥ 2 points for valid measurement
  isValid: boolean;              // computed: vertices.length >= 2
  totalDistanceMeters: number;   // geodetic sum of all segments
  perSegmentDistancesMeters: number[]; // distance of each segment
}
```

```csharp
// Backend (C#)
public class Measurement
{
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public List<GeoPoint> Vertices { get; init; } = new();
    
    public bool IsValid => Vertices.Count >= 2;
    public double TotalDistanceMeters =>
        Enumerable.Range(0, Vertices.Count - 1)
            .Sum(i => GeoCalculations.Distance(Vertices[i], Vertices[i + 1]));
    public List<double> PerSegmentDistancesMeters =>
        Enumerable.Range(0, Vertices.Count - 1)
            .Select(i => GeoCalculations.Distance(Vertices[i], Vertices[i + 1]))
            .ToList();
}
```

### UnitPreference

Stores user's selected units for distance and area.

```typescript
// Frontend (TypeScript)
enum AreaUnit {
  SquareFeet = "ft²",
  SquareMeters = "m²",
  Acres = "ac",
  Hectares = "ha",
}

enum DistanceUnit {
  Feet = "ft",
  Meters = "m",
  Miles = "mi",
  Kilometers = "km",
}

interface UnitPreference {
  areaUnit: AreaUnit;          // default: Acres
  distanceUnit: DistanceUnit;  // default: Feet
}
```

### SessionState

Encapsulates the current state of the editing session.

```typescript
// Frontend (TypeScript)
interface SessionState {
  primaryPolygon: Polygon | null;
  excludePolygons: Polygon[];
  measurementPolylines: Measurement[];
  unitPreference: UnitPreference;
  mapViewState: {
    centerLat: number;
    centerLon: number;
    zoomLevel: number; // 0–22
  };
  uiMode: "polygon" | "exclude" | "measurement";
  inProgressShape: {
    type: "polygon" | "measurement";
    vertices: GeoPoint[];
  } | null;
}
```

### SessionSnapshot (for Export)

Portable JSON representation of a session, designed for export and future import.

```typescript
// Frontend (TypeScript)
interface SessionSnapshot {
  schemaVersion: "1.0.0";  // for future compatibility
  exportedAt: string;       // ISO 8601 timestamp
  unitPreference: UnitPreference;
  primaryPolygon?: {
    vertices: GeoPoint[];
    computedAreaSquareMeters: number;
    perSideLengthsMeters: number[];
  };
  excludePolygons?: Array<{
    id: string;
    vertices: GeoPoint[];
    computedAreaSquareMeters: number;
  }>;
  measurements?: Array<{
    id: string;
    vertices: GeoPoint[];
    totalDistanceMeters: number;
    perSegmentDistancesMeters: number[];
  }>;
}
```

---

## Computed Fields & Calculations

### Area Calculation

- **Engine**: Turf.js (client) + SteelTree.GeoAcre.Geometry (server validation)
- **Algorithm**: Spherical excess (geodetic, accounts for Earth's curvature)
- **For self-intersecting polygons**: Even-odd fill rule applied

### Distance Calculation

- **Engine**: Turf.js (client) + SteelTree.GeoAcre.Geometry (server)
- **Algorithm**: Haversine formula or Vincenty ellipsoid (high accuracy)
- **Accuracy target**: <0.5% for distances up to 10 miles

### Self-Intersection Detection

- **Algorithm**: Sweep-line or brute-force edge-crossing checks
- **Result**: Boolean flag on Polygon entity; triggers UI warning

### Unit Conversions

Stored in a utility module:

```typescript
// Frontend (TypeScript)
namespace UnitConversion {
  export const squareMetersToAcres = (m2: number) => m2 / 4046.86;
  export const squareMetersToHectares = (m2: number) => m2 / 10000;
  export const metersToFeet = (m: number) => m * 3.28084;
  export const metersToMiles = (m: number) => m / 1609.34;
  // ... etc.
}
```

---

## Relationships

```
Session
  ├── PrimaryPolygon (0..1)
  │   └── Vertices (3+)
  ├── ExcludePolygons (0..*)
  │   ├── Vertices (3+)
  │   └── Linked to: PrimaryPolygon
  ├── Measurements (0..*)
  │   └── Vertices (2+)
  ├── UnitPreference (1)
  ├── MapViewState (1)
  └── SessionSnapshot (0..1, ephemeral for export)
```

---

## Validation Rules

| Entity | Rule | Error Message |
|--------|------|---------------|
| Polygon | ≥ 3 vertices | "Polygon must have at least 3 vertices" |
| Polygon | No duplicate consecutive vertices | "Consecutive vertices cannot be identical" |
| Polygon (exclude) | Must have parent primary polygon | "Exclude polygon requires a parent polygon" |
| Measurement | ≥ 2 vertices | "Measurement must have at least 2 vertices" |
| GeoPoint | Latitude in [-90, 90] | "Latitude must be between -90 and 90" |
| GeoPoint | Longitude in [-180, 180] | "Longitude must be between -180 and 180" |
| SessionState | Only one primary polygon | "Cannot have multiple primary polygons" |
| SessionState | Mode must be valid | "UI mode must be one of: polygon, exclude, measurement" |

---

## Storage & Persistence

### v1 (No Server-Side Persistence)

- **Session State**: In-browser (React state or localStorage for resilience)
- **Temporary Export**: User can download as JSON or copy to clipboard

### Future Enhancement (v2)

When persistence is added:

```typescript
// Future: Database schema (e.g., PostgreSQL + PostGIS)
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  snapshot JSONB  -- SessionSnapshot
);
```

The SessionSnapshot schema is already designed to be database-ready.
