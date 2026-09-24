$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$port = 3000
$url = "http://127.0.0.1:$port/"
$runtimeDir = Join-Path $projectRoot ".codex-runtime"
$stdoutLog = Join-Path $runtimeDir "preview-dev.out.log"
$stderrLog = Join-Path $runtimeDir "preview-dev.err.log"

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

function Test-PreviewReady {
  try {
    $response = Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 2
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

function Get-PortOwners {
  $netstat = netstat -ano | Select-String ":$port"
  $owners = @()

  foreach ($line in $netstat) {
    $text = ($line.ToString() -replace "\s+", " ").Trim()
    if ($text -match "127\.0\.0\.1:$port .* (\d+)$") {
      $owners += [int]$matches[1]
    }
  }

  return $owners | Select-Object -Unique
}

if (-not (Test-PreviewReady)) {
  $owners = Get-PortOwners

  foreach ($owner in $owners) {
    try {
      Stop-Process -Id $owner -Force -ErrorAction Stop
    } catch {
      # Ignore processes we cannot or should not stop.
    }
  }

  if (Test-Path $stdoutLog) {
    Remove-Item -LiteralPath $stdoutLog -Force
  }

  if (Test-Path $stderrLog) {
    Remove-Item -LiteralPath $stderrLog -Force
  }

  Start-Process `
    -FilePath "npm.cmd" `
    -ArgumentList "run", "dev", "--", "--hostname", "127.0.0.1", "--port", "$port" `
    -WorkingDirectory $projectRoot `
    -RedirectStandardOutput $stdoutLog `
    -RedirectStandardError $stderrLog `
    -WindowStyle Hidden | Out-Null

  $deadline = (Get-Date).AddSeconds(30)
  do {
    Start-Sleep -Milliseconds 500
    if (Test-PreviewReady) {
      Start-Process $url
      Write-Output "Preview ready at $url"
      exit 0
    }
  } while ((Get-Date) -lt $deadline)

  if (Test-Path $stderrLog) {
    $stderr = Get-Content -LiteralPath $stderrLog -Raw
    if ($stderr) {
      Write-Output $stderr
    }

    if ($stderr -match "spawn EPERM") {
      throw "This terminal environment cannot start 'next dev' because process spawning is blocked. Run 'npm run dev' from a normal Windows Terminal outside Codex, or ask Codex to start the preview for you."
    }
  }

  throw "Preview server did not become ready within 30 seconds."
}

Start-Process $url
Write-Output "Preview ready at $url"
