# Builds the portable single-exe build and signs both the embedded ffmpeg
# (before compile, so include_bytes! captures the signed bytes) and the
# final video2audio.exe.
#
# Run from the project root: powershell -ExecutionPolicy Bypass -File src-tauri/scripts/build-portable.ps1
$ErrorActionPreference = "Stop"

$root      = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$signPs1   = Join-Path $PSScriptRoot "sign.ps1"
$ffmpegExe = Join-Path $root "src-tauri\binaries\ffmpeg-x86_64-pc-windows-msvc.exe"
$outExe    = Join-Path $root "src-tauri\target\release\video2audio.exe"
$confJson  = "src-tauri/tauri.portable.conf.json"

Write-Host "==> Signing bundled ffmpeg.exe (so include_bytes! embeds a signed binary)"
& powershell -NoProfile -ExecutionPolicy Bypass -File $signPs1 -File $ffmpegExe
if ($LASTEXITCODE -ne 0) { throw "ffmpeg signing failed" }

Write-Host "==> Building portable target"
Push-Location $root
try {
    & cargo tauri build --features portable --config $confJson
    if ($LASTEXITCODE -ne 0) { throw "cargo tauri build failed" }
} finally {
    Pop-Location
}

if (-not (Test-Path $outExe)) {
    throw "Build finished but output not found at: $outExe"
}

Write-Host "==> Signing portable video2audio.exe"
& powershell -NoProfile -ExecutionPolicy Bypass -File $signPs1 -File $outExe
if ($LASTEXITCODE -ne 0) { throw "video2audio.exe signing failed" }

$sig = Get-AuthenticodeSignature $outExe
Write-Host ""
Write-Host "Done. Output: $outExe"
Write-Host "Signature status: $($sig.Status)  (signer: $($sig.SignerCertificate.Subject))"
