param(
  [Parameter(Mandatory = $true)]
  [string]$RepoPath
)

$ErrorActionPreference = "Stop"

$source = Join-Path $PSScriptRoot "..\legacy-homepage\index.html"
$resolvedSource = (Resolve-Path -LiteralPath $source).Path
$resolvedRepo = (Resolve-Path -LiteralPath $RepoPath).Path

if (-not (Test-Path -LiteralPath $resolvedRepo -PathType Container)) {
  throw "Target repo path does not exist: $resolvedRepo"
}

$targetIndex = Join-Path $resolvedRepo "index.html"
$backupIndex = Join-Path $resolvedRepo "index.pre-homepage-bridge.html"
$cnameFile = Join-Path $resolvedRepo "CNAME"

if (-not (Test-Path -LiteralPath $targetIndex -PathType Leaf)) {
  throw "Target repo does not contain index.html: $targetIndex"
}

if (-not (Test-Path -LiteralPath $cnameFile -PathType Leaf)) {
  Write-Warning "CNAME was not found in the target repo. This is fine for testing, but check domain config before publishing."
}

if (-not (Test-Path -LiteralPath $backupIndex -PathType Leaf)) {
  Copy-Item -LiteralPath $targetIndex -Destination $backupIndex
}

Copy-Item -LiteralPath $resolvedSource -Destination $targetIndex -Force

Write-Host "Legacy homepage copied."
Write-Host "  Source : $resolvedSource"
Write-Host "  Target : $targetIndex"
Write-Host "  Backup : $backupIndex"
Write-Host ""
Write-Host "Only the root index.html was replaced."
Write-Host "Your existing archives, posts, and CNAME were left untouched."
