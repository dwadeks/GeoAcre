export const SESSION_SNAPSHOT_SCHEMA_VERSION = '1.0.0' as const

export const SESSION_SNAPSHOT_SCHEMA = {
  type: 'object',
  required: ['schemaVersion', 'exportedAt', 'units', 'excludePolygons', 'measurements'],
  properties: {
    schemaVersion: { const: SESSION_SNAPSHOT_SCHEMA_VERSION },
    exportedAt: { type: 'string', format: 'date-time' },
    units: {
      type: 'object',
      required: ['areaUnit', 'distanceUnit'],
      properties: {
        areaUnit: { enum: ['acres', 'hectares', 'sqft', 'sqm'] },
        distanceUnit: { enum: ['feet', 'meters', 'miles', 'km'] },
      },
    },
  },
} as const