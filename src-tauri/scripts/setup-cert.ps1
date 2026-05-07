# Recreates the "Egoz Kokus" code-signing certificate in the current user's
# certificate store if it does not exist. Idempotent — safe to run repeatedly.
#
# Run: powershell -ExecutionPolicy Bypass -File .\setup-cert.ps1
$ErrorActionPreference = "Stop"

$subject     = "CN=Egoz Kokus"
$expectedTp  = "533BAC4584E81A605E82E33893FD96825FE0159D"

$existing = Get-ChildItem Cert:\CurrentUser\My |
            Where-Object { $_.Subject -eq $subject }

if ($existing) {
    Write-Host "Certificate already present:"
    Write-Host "  Thumbprint: $($existing.Thumbprint)"
    Write-Host "  Expires:    $($existing.NotAfter)"
    if ($existing.Thumbprint -ne $expectedTp) {
        Write-Warning "Thumbprint differs from the one configured in tauri.conf.json ($expectedTp)."
        Write-Warning "Update bundle.windows.certificateThumbprint to: $($existing.Thumbprint)"
    }
    return
}

Write-Host "Creating new self-signed code-signing certificate..."
$cert = New-SelfSignedCertificate `
    -Type CodeSigningCert `
    -Subject $subject `
    -KeyAlgorithm RSA `
    -KeyLength 2048 `
    -HashAlgorithm SHA256 `
    -KeyExportPolicy Exportable `
    -KeyUsage DigitalSignature `
    -CertStoreLocation Cert:\CurrentUser\My `
    -NotAfter (Get-Date).AddYears(10)

Write-Host "Created:"
Write-Host "  Thumbprint: $($cert.Thumbprint)"
Write-Host "  Expires:    $($cert.NotAfter)"
if ($cert.Thumbprint -ne $expectedTp) {
    Write-Warning "New thumbprint differs from the one in tauri.conf.json."
    Write-Warning "Update bundle.windows.certificateThumbprint to: $($cert.Thumbprint)"
}
