# Clear Chrome Extension Cache - ALRA
# Run this script AFTER removing the extension from chrome://extensions/
# and AFTER closing all Chrome windows

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🧹 CHROME EXTENSION CACHE CLEANER - ALRA" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check if Chrome is running
$chromeProcesses = Get-Process chrome -ErrorAction SilentlyContinue
if ($chromeProcesses) {
    Write-Host "⚠️  WARNING: Chrome is still running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Found $($chromeProcesses.Count) Chrome process(es)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please close Chrome completely before running this script." -ForegroundColor Yellow
    Write-Host "Or press Y to force-kill Chrome processes now." -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Kill Chrome processes? (Y/N)"
    
    if ($response -eq 'Y' -or $response -eq 'y') {
        Write-Host ""
        Write-Host "Killing Chrome processes..." -ForegroundColor Yellow
        Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "✅ Chrome processes killed" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Aborted. Please close Chrome manually and try again." -ForegroundColor Red
        exit 1
    }
}

Write-Host "🔍 Searching for ALRA extension cache..." -ForegroundColor Yellow
Write-Host ""

# Chrome user data paths
$chromeUserData = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default"
$extensionsPath = Join-Path $chromeUserData "Extensions"
$codeCachePath = Join-Path $chromeUserData "Code Cache"

# ALRA extension ID (old cached version)
$alraExtensionId = "ejikdokcnkkppbhihjkahcpjigndkjik"
$alraExtensionPath = Join-Path $extensionsPath $alraExtensionId

$itemsDeleted = 0

# Delete ALRA extension folder
if (Test-Path $alraExtensionPath) {
    Write-Host "📁 Found ALRA extension cache: $alraExtensionPath" -ForegroundColor White
    try {
        Remove-Item -Path $alraExtensionPath -Recurse -Force
        Write-Host "   ✅ Deleted ALRA extension cache" -ForegroundColor Green
        $itemsDeleted++
    } catch {
        Write-Host "   ❌ Failed to delete: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
} else {
    Write-Host "ℹ️  ALRA extension cache not found (already deleted or extension not installed)" -ForegroundColor Gray
    Write-Host ""
}

# Delete Code Cache (general Chrome cache for extensions)
if (Test-Path $codeCachePath) {
    Write-Host "📁 Found Chrome Code Cache: $codeCachePath" -ForegroundColor White
    try {
        # Delete contents but keep the folder (Chrome recreates it)
        Get-ChildItem -Path $codeCachePath -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        Write-Host "   ✅ Cleared Code Cache" -ForegroundColor Green
        $itemsDeleted++
    } catch {
        Write-Host "   ⚠️  Partial clear: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    Write-Host ""
} else {
    Write-Host "ℹ️  Code Cache not found" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Items cleared: $itemsDeleted" -ForegroundColor White
Write-Host ""

if ($itemsDeleted -gt 0) {
    Write-Host "✅ Chrome extension cache cleared successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "🚀 NEXT STEPS" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Open Chrome" -ForegroundColor White
    Write-Host "2. Go to chrome://extensions/" -ForegroundColor White
    Write-Host "3. Enable 'Developer mode'" -ForegroundColor White
    Write-Host "4. Click 'Load unpacked'" -ForegroundColor White
    Write-Host "5. Select: F:\Shivam\Alra\dist" -ForegroundColor Green
    Write-Host "6. The extension will get a NEW ID!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Expected result:" -ForegroundColor Yellow
    Write-Host "   • New extension ID (NOT ejikdokcnkkppbhihjkahcpjigndkjik)" -ForegroundColor White
    Write-Host "   • All chunk files loaded (776.js, 819.js)" -ForegroundColor White
    Write-Host "   • Phase 3 & 4 work correctly" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "⚠️  No cache files found to delete" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This could mean:" -ForegroundColor White
    Write-Host "   • Extension was never installed" -ForegroundColor Gray
    Write-Host "   • Cache already cleared" -ForegroundColor Gray
    Write-Host "   • Different Chrome profile in use" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Try loading the extension fresh anyway." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
