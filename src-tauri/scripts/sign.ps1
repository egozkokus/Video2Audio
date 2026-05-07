# Signs a given file with the "Egoz Kokus" code-signing certificate.
# Used for the portable build, where Tauri's bundler does not run and
# therefore does not invoke its built-in signing.
#
# Run: powershell -ExecutionPolicy Bypass -File .\sign.ps1 -File <path>
param(
    [Parameter(Mandatory = $true)]
    [string]$File
)
$ErrorActionPreference = "Stop"

$thumbprint   = "533BAC4584E81A605E82E33893FD96825FE0159D"
$timestampUrl = "http://timestamp.digicert.com"

if (-not (Test-Path $File)) {
    throw "File not found: $File"
}

# Locate the newest x64 signtool.exe under the Windows 10/11 SDK.
$sdkRoots = @(
    "${env:ProgramFiles(x86)}\Windows Kits\10\bin",
    "${env:ProgramFiles}\Windows Kits\10\bin"
) | Where-Object { Test-Path $_ }

$signtool = $sdkRoots |
    ForEach-Object { Get-ChildItem -Path $_ -Recurse -Filter signtool.exe -ErrorAction SilentlyContinue } |
    Where-Object { $_.FullName -like "*\x64\*" } |
    Sort-Object FullName -Descending |
    Select-Object -First 1

if (-not $signtool) {
    throw "signtool.exe not found. Install the Windows 10/11 SDK."
}

Write-Host "Using signtool: $($signtool.FullName)"
Write-Host "Signing: $File"

& $signtool.FullName sign `
    /sha1 $thumbprint `
    /fd SHA256 `
    /tr $timestampUrl `
    /td SHA256 `
    $File

if ($LASTEXITCODE -ne 0) {
    throw "signtool failed with exit code $LASTEXITCODE"
}

Write-Host "Signed successfully."
