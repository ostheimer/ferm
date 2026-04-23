#!/usr/bin/env bash
set -euo pipefail

expo_url=""
package_name="com.hege.revier"
apk_activity="expo.modules.devlauncher.DevLauncherActivity"
test_image_path=""
device_serial="${ANDROID_SERIAL:-}"

usage() {
  cat <<'EOF'
Usage: bash apps/mobile/scripts/android-smoke.sh [options]

Options:
  --expo-url <url>       Expo URL shown by Metro.
  --test-image <path>    Local PNG/JPG to push to the Android device.
  --device <serial>      adb device serial, for example emulator-5554.
  --package-name <name>  Android package hint. Default: com.hege.revier.
  --activity <name>      Android activity hint.
  -h, --help             Show this help.

The script requires an already running Android emulator or connected device.
It does not start Expo, install an APK, or run an automated E2E test.
EOF
}

fail() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

step() {
  printf '==> %s\n' "$1"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command '$1' is not available."
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --expo-url)
      [ "$#" -ge 2 ] || fail "--expo-url requires a value."
      expo_url="$2"
      shift 2
      ;;
    --expo-url=*)
      expo_url="${1#*=}"
      shift
      ;;
    --test-image)
      [ "$#" -ge 2 ] || fail "--test-image requires a value."
      test_image_path="$2"
      shift 2
      ;;
    --test-image=*)
      test_image_path="${1#*=}"
      shift
      ;;
    --device)
      [ "$#" -ge 2 ] || fail "--device requires a value."
      device_serial="$2"
      shift 2
      ;;
    --device=*)
      device_serial="${1#*=}"
      shift
      ;;
    --package-name)
      [ "$#" -ge 2 ] || fail "--package-name requires a value."
      package_name="$2"
      shift 2
      ;;
    --package-name=*)
      package_name="${1#*=}"
      shift
      ;;
    --activity)
      [ "$#" -ge 2 ] || fail "--activity requires a value."
      apk_activity="$2"
      shift 2
      ;;
    --activity=*)
      apk_activity="${1#*=}"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "Unknown argument: $1"
      ;;
  esac
done

adb_for_device() {
  if [ -n "$device_serial" ]; then
    adb -s "$device_serial" "$@"
  else
    adb "$@"
  fi
}

step "Checking adb availability"
require_command adb

if [ -z "$test_image_path" ]; then
  require_command node
fi

step "Checking connected device or emulator"
if [ -n "$device_serial" ]; then
  device_state="$(adb -s "$device_serial" get-state 2>/dev/null || true)"
  [ "$device_state" = "device" ] || fail "Android device '$device_serial' is not online. Start the emulator or choose another serial."
else
  online_devices="$(adb devices | awk 'NR > 1 && $2 == "device" { print $1 }')"
  device_count="$(printf '%s\n' "$online_devices" | grep -c . || true)"

  if [ "$device_count" -eq 0 ]; then
    fail "No online Android device or emulator found. Start an emulator or connect a device and rerun the smoke."
  fi

  if [ "$device_count" -gt 1 ]; then
    printf '%s\n' "$online_devices" >&2
    fail "Multiple online Android devices found. Rerun with --device <serial> or ANDROID_SERIAL=<serial>."
  fi

  device_serial="$(printf '%s\n' "$online_devices" | sed -n '1p')"
fi

adb devices

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

if [ -z "$test_image_path" ]; then
  generated_image="$script_dir/../tmp/android-smoke-test.png"
  step "Creating a temporary PNG test image"
  node "$script_dir/create-test-image.mjs" "$generated_image" >/dev/null
  test_image_path="$generated_image"
fi

[ -f "$test_image_path" ] || fail "Test image not found: $test_image_path"

remote_path="/sdcard/Download/hege-android-smoke.png"

step "Pushing test image to the device"
adb_for_device shell "mkdir -p /sdcard/Download" >/dev/null 2>&1 || true
adb_for_device push "$test_image_path" "$remote_path" >/dev/null
adb_for_device shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d "file://$remote_path" >/dev/null 2>&1 || true

step "Smoke checklist"
printf '1. Start the Expo app in a local session: pnpm --filter @hege/mobile dev\n'
printf '2. Open the Expo URL shown by Metro.\n'
if [ -n "$expo_url" ]; then
  printf '3. Expected Expo URL: %s\n' "$expo_url"
else
  printf '3. Use the current Expo debug URL from Metro or Expo Go.\n'
fi
printf '4. Confirm the login screen loads, then log in with a valid demo account.\n'
printf '5. On Fallwild, select up to 3 photos, attach the pushed test image if needed, submit, and verify the queue status.\n'
printf '6. Disable network, repeat Fallwild submit, then re-enable network and run Queue sync.\n'
printf '7. Verify the uploaded image is part of the Fallwild detail flow or queue result.\n'
printf '\n'
printf 'Test image on device: %s\n' "$remote_path"
printf 'Selected device: %s\n' "$device_serial"
printf 'Package name: %s\n' "$package_name"
printf 'Activity hint: %s\n' "$apk_activity"

step "Completed checklist generation"
