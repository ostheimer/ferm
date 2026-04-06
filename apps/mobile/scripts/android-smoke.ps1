param(
  [string]$ExpoUrl,
  [string]$PackageName = "com.hege.revier",
  [string]$ApkActivity = "expo.modules.devlauncher.DevLauncherActivity",
  [string]$TestImagePath
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
  Write-Host "==> $Message"
}

function Assert-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' is not available."
  }
}

Write-Step "Checking adb availability"
Assert-Command adb

Write-Step "Checking connected device or emulator"
$devices = adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "\tdevice$" }
if (-not $devices) {
  throw "No online Android device or emulator found. Start an emulator or connect a device and rerun the smoke."
}

Write-Host $devices

if (-not $TestImagePath) {
  $scriptRoot = Split-Path -Parent $PSCommandPath
  $generatedImage = Join-Path $scriptRoot "..\tmp\android-smoke-test.png"
  Write-Step "Creating a temporary PNG test image"
  node (Join-Path $scriptRoot "create-test-image.mjs") $generatedImage | Out-Null
  $TestImagePath = $generatedImage
}

if (-not (Test-Path $TestImagePath)) {
  throw "Test image not found: $TestImagePath"
}

Write-Step "Pushing test image to the device"
$remotePath = "/sdcard/Download/hege-android-smoke.png"
adb push $TestImagePath $remotePath | Out-Null

Write-Step "Smoke checklist"
Write-Host "1. Start the Expo app in a local session: pnpm --filter @hege/mobile dev"
Write-Host "2. Open the Expo URL shown by Metro."
if ($ExpoUrl) {
  Write-Host "3. Expected Expo URL: $ExpoUrl"
} else {
  Write-Host "3. Use the current Expo debug URL from Metro or Expo Go."
}
Write-Host "4. Confirm the login screen loads, then log in with a valid demo account."
Write-Host "5. On Fallwild, select up to 3 photos from the library, attach the pushed test image if needed, submit, and verify the queue status."
Write-Host "6. Disable network, repeat Fallwild submit, then re-enable network and run Queue sync."
Write-Host "7. Verify the uploaded image is part of the Fallwild detail flow or queue result."
Write-Host ""
Write-Host "Test image on device: $remotePath"
Write-Host "Package name: $PackageName"
Write-Host "Activity hint: $ApkActivity"

Write-Step "Completed checklist generation"
