# GeoAcre Frontend

## Stack
- React 18 + TypeScript strict mode
- Vite build tooling
- Leaflet map rendering
- Vitest + Testing Library for tests

## Commands
- Install: npm install
- Dev server: npm run dev
- Build: npm run build
- Lint: npm run lint
- Test: npm run test -- --run
- Coverage: npm run test:coverage

## Environment
Set VITE_API_URL to backend API base URL (defaults to http://localhost:5000/api).

## Notes
- Hand-authored frontend code must keep exactly one top-level class or one top-level interface per file.
- Code files containing a single class or interface MUST be named identically to that artifact.
	For example, an interface `GeoPoint` goes in `GeoPoint.ts`; a class `MapContainer` goes in `MapContainer.tsx`.
