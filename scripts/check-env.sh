#!/bin/bash
echo "🔍 Validating development environment..."
node -v > /dev/null 2>&1 || { echo "✗ Node.js not found"; exit 1; }
echo "✓ Node.js is installed"
if [[ "$OSTYPE" == "darwin"* ]]; then
    pod --version > /dev/null 2>&1 || { echo "✗ CocoaPods not found"; exit 1; }
    echo "✓ CocoaPods is installed"
fi
if [ -d "android" ] && [ -f "android/local.properties" ]; then
    echo "✓ android/local.properties exists"
else
    echo "⚠ android/local.properties missing. Run scripts/setup-android-sdk.sh"
    exit 1
fi
echo "✓ Environment validation passed!"
exit 0
