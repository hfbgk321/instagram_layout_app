#!/bin/bash

echo "🔍 Validating development environment..."

# Check Node
node -v > /dev/null 2>&1 || { echo "✗ Node.js not found"; exit 1; }
echo "✓ Node.js is installed"

# Check CocoaPods (on Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
    pod --version > /dev/null 2>&1 || { echo "✗ CocoaPods not found"; exit 1; }
    echo "✓ CocoaPods is installed"
fi

# Check Android SDK
if [ -d "android" ] && [ -f "android/local.properties" ]; then
    echo "✓ android/local.properties exists"
else
    echo "⚠ android/local.properties missing. Run scripts/setup-android-sdk.sh"
fi

echo "✓ Environment validation passed!"
exit 0
