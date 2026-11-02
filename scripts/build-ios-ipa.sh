#!/usr/bin/env bash
# Build an UNSIGNED iOS .ipa that can be sideloaded with a free Apple ID
# (Sideloadly / AltStore) — no Apple Developer Program membership needed.
#
# Requirements: macOS with Xcode and CocoaPods. On Windows/Linux run the
# GitHub Actions workflow instead (.github/workflows/ios-ipa.yml), which
# calls this same script on a macOS runner.
#
# Output: dist/Tachkila.ipa
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "error: this script needs macOS with Xcode." >&2
  echo "       on Windows, run the 'iOS unsigned IPA' workflow on GitHub instead." >&2
  exit 1
fi

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "error: xcodebuild not found. Install Xcode, then:" >&2
  echo "       sudo xcode-select -s /Applications/Xcode.app/Contents/Developer" >&2
  exit 1
fi

OUT_DIR="${OUT_DIR:-dist}"
APP_NAME="${APP_NAME:-Tachkila}"
DERIVED="$OUT_DIR/DerivedData"

echo "==> Generating the iOS project"
npx expo prebuild --platform ios --no-install

echo "==> Installing pods"
(cd ios && pod install)

WORKSPACE="$(ls -d ios/*.xcworkspace | head -n 1)"
SCHEME="$(basename "$WORKSPACE" .xcworkspace)"

echo "==> Building $SCHEME (Release, unsigned)"
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -derivedDataPath "$DERIVED" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  build

APP_PATH="$DERIVED/Build/Products/Release-iphoneos/$SCHEME.app"
if [[ ! -d "$APP_PATH" ]]; then
  echo "error: build produced no app bundle at $APP_PATH" >&2
  exit 1
fi

echo "==> Packaging $APP_NAME.ipa"
rm -rf "$OUT_DIR/Payload" "$OUT_DIR/$APP_NAME.ipa"
mkdir -p "$OUT_DIR/Payload"
cp -R "$APP_PATH" "$OUT_DIR/Payload/"
(cd "$OUT_DIR" && zip -qry "$APP_NAME.ipa" Payload)
rm -rf "$OUT_DIR/Payload"

SIZE="$(du -h "$OUT_DIR/$APP_NAME.ipa" | cut -f1)"
echo "==> Done: $OUT_DIR/$APP_NAME.ipa ($SIZE)"
echo "    Sideload it with Sideloadly using your free Apple ID."
echo "    A free account signature expires after 7 days; re-sign to keep using it."
