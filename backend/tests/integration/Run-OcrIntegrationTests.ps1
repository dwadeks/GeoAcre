param(
    [string]$EnvFile = "./tests/integration/.env.ocr.local",
    [switch]$NoBuild
)

$ErrorActionPreference = "Stop"

function Load-EnvFile {
    param([string]$Path)

    if (-not (Test-Path -Path $Path)) {
        throw "Environment file not found: $Path. Copy tests/integration/.env.ocr.local.example to tests/integration/.env.ocr.local and set values first."
    }

    Get-Content -Path $Path | ForEach-Object {
        $line = $_.Trim()

        if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
            return
        }

        $parts = $line -split "=", 2
        if ($parts.Length -ne 2) {
            return
        }

        $key = $parts[0].Trim()
        $value = $parts[1].Trim()

        if (-not [string]::IsNullOrWhiteSpace($key)) {
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

Load-EnvFile -Path $EnvFile

$required = @(
    "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT",
    "AZURE_DOCUMENT_INTELLIGENCE_API_KEY"
)

foreach ($name in $required) {
    $value = [Environment]::GetEnvironmentVariable($name, "Process")
    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "Required environment variable is missing: $name"
    }
}

$project = "./tests/integration/SteelTree.Ocr.AzureDocumentIntelligence.Tests/SteelTree.Ocr.AzureDocumentIntelligence.Tests.csproj"

if ($NoBuild) {
    dotnet test $project --no-build
}
else {
    dotnet test $project
}
