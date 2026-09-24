$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $projectRoot ".codex-runtime"
$stagingDir = Join-Path $runtimeDir "deploy-staging"
$tarballPath = Join-Path $runtimeDir "project.tgz"
$endpoint = "https://codex-deploy-skills.vercel.sh/api/deploy"

Add-Type -AssemblyName System.Net.Http

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

if (Test-Path $stagingDir) {
  Remove-Item -LiteralPath $stagingDir -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $stagingDir | Out-Null

$items = Get-ChildItem -LiteralPath $projectRoot -Force | Where-Object {
  $_.Name -notin @(
    ".git",
    "node_modules",
    ".next",
    ".npm-cache",
    ".codex-runtime"
  )
}

foreach ($item in $items) {
  Copy-Item -LiteralPath $item.FullName -Destination $stagingDir -Recurse -Force
}

if (Test-Path $tarballPath) {
  Remove-Item -LiteralPath $tarballPath -Force
}

tar -czf $tarballPath -C $stagingDir .

$fileStream = [System.IO.File]::OpenRead($tarballPath)
try {
  $httpClient = [System.Net.Http.HttpClient]::new()
  try {
    $multipart = [System.Net.Http.MultipartFormDataContent]::new()

    $fileContent = [System.Net.Http.StreamContent]::new($fileStream)
    $fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("application/gzip")
    $multipart.Add($fileContent, "file", "project.tgz")
    $multipart.Add([System.Net.Http.StringContent]::new("nextjs"), "framework")

    $response = $httpClient.PostAsync($endpoint, $multipart).GetAwaiter().GetResult()
    $responseBody = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()

    if (-not $response.IsSuccessStatusCode) {
      throw "Deploy request failed: $($response.StatusCode) $responseBody"
    }

    $payload = $responseBody | ConvertFrom-Json

    if (-not $payload.previewUrl) {
      throw "Deploy response did not include a preview URL. Raw response: $responseBody"
    }

    $previewUrl = [string]$payload.previewUrl
    $claimUrl = [string]$payload.claimUrl

    $ready = $false
    $deadline = (Get-Date).AddMinutes(5)

    do {
      Start-Sleep -Seconds 5
      try {
        $probe = Invoke-WebRequest -UseBasicParsing $previewUrl -TimeoutSec 10
        if ($probe.StatusCode -lt 500) {
          $ready = $true
        }
      } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -and $statusCode -lt 500) {
          $ready = $true
        }
      }
    } while (-not $ready -and (Get-Date) -lt $deadline)

    Write-Output "Preview URL: $previewUrl"
    if ($claimUrl) {
      Write-Output "Claim URL: $claimUrl"
    }

    $responseBody
  } finally {
    $httpClient.Dispose()
  }
} finally {
  $fileStream.Dispose()
}
