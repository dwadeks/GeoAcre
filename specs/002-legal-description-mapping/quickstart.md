# Quickstart: Legal Description Mapping (V2)

**Goal**: Run and validate the legal-description mode workflow, mode selector behavior, and mode-specific exports.  
**Prerequisites**: Node.js 18+, .NET 10 SDK

## 1. Setup

```bash
git checkout 002-legal-description-mapping

cd frontend
npm install

cd ../backend
dotnet restore
```

## 2. Run locally

Frontend:

```bash
cd frontend
npm run dev
```

Backend:

```bash
cd backend
dotnet run --project src/SteelTree.GeoAcre.Web.Api/SteelTree.GeoAcre.Web.Api.csproj
```

Expected local URLs:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 3. Validate mode selector and mode-specific UI

1. Open app and confirm mode order: Draw Boundary, Legal Description, Measure Distance.
2. Switch modes and verify sidebar content changes to only active-mode controls.
3. Start a shape in one mode, switch modes, and verify confirmation prompt appears.

## 4. Validate legal-description mode inputs

Pasted text path:

```text
Select Legal Description mode -> paste legal description text -> submit
```

Image path:

```text
Select Legal Description mode -> upload image -> submit
```

Negative validation path:

```text
Provide both text and image -> submit -> expect validation error requiring exactly one source
```

## 5. Validate backend contract behavior

Interpret endpoint sample (text):

```bash
curl -X POST http://localhost:5000/api/legal-description/interpret \
  -H "Content-Type: application/json" \
  -d '{
    "source": {
      "type": "PastedText",
      "text": "Beginning at the NW corner..."
    }
  }'
```

Expected:
- Success returns `mode=LegalDescription`, read-only boundary, measurements.
- Unreadable/ambiguous input returns retry guidance.

## 6. Validate mode-specific export

1. Produce completed output in each mode.
2. Export while in each active mode.
3. Verify payload discriminator and structure match the active mode contract only.
4. Attempt export with no completed state and confirm clear failure reason.

## 7. Run tests (TDD gate)

Backend tests:

```bash
cd backend
dotnet test
```

Frontend tests:

```bash
cd frontend
npm run test -- --run
```

Integration tests:

```bash
cd backend/tests/integration
dotnet test
```

## 8. Azure readiness checklist (future deployment)

- Keep third-party credentials out of source control.
- Use environment-based configuration keys for provider endpoints and timeouts.
- Plan secret storage with Azure Key Vault and managed identity for deployed environments.
- Keep deployment automation in IaC for future `/infra` additions.
