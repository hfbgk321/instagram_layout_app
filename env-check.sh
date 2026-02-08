#!/bin/bash

echo "🔍 Starting Deep Environment Validation..."

# 1. Android Environment Variables
echo "--- Checking Android Environment ---"
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME is not set."
    echo "   👉 Attempting to locate Android SDK..."
    POSSIBLE_SDK="$HOME/Library/Android/sdk"
    if [ -d "$POSSIBLE_SDK" ]; then
        echo "   ✅ Found SDK at $POSSIBLE_SDK"
        echo "   ℹ️  To fix, add this to your shell profile (.zshrc/.bash_profile):"
        echo "      export ANDROID_HOME=$POSSIBLE_SDK"
        echo "      export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    else
        echo "   ❌ Could not auto-locate Android SDK."
    fi
    ANDROID_STATUS=1
else
    echo "✅ ANDROID_HOME is set to: $ANDROID_HOME"
    ANDROID_STATUS=0
fi

# 2. Check local.properties for Android
if [ -d "android" ]; then
    if [ ! -f "android/local.properties" ]; then
        echo "⚠️  android/local.properties is MISSING."
        if [ "$ANDROID_STATUS" -eq 0 ]; then
            echo "   🛠  Generating local.properties..."
            echo "sdk.dir=$ANDROID_HOME" > android/local.properties
            echo "   ✅ Generated android/local.properties"
        else
            echo "   ❌ Cannot generate local.properties without ANDROID_HOME."
        fi
    else
        echo "✅ android/local.properties exists."
    fi
fi

# 3. macOS Specific Checks (Xcode, CocoaPods, Watchman)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "--- Checking macOS Development Tools ---"

    # Xcode
    XCODE_PATH=$(xcode-select -p 2>/dev/null)
    if [ -z "$XCODE_PATH" ]; then
        echo "❌ Xcode Command Line Tools not found."
        echo "   👉 Run: xcode-select --install"
    else
        echo "✅ Xcode tools path: $XCODE_PATH"
        # Optional: Check for basic signing identity presence (loose check)
        echo "   ℹ️  Checking for local signing identities..."
        security find-identity -v -p codesigning > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "   ✅ Local signing identities found."
        else
            echo "   ⚠️  No valid signing identities found. Physical device builds (Exit 70) may fail."
        fi
    fi

    # CocoaPods
    if command -v pod >/dev/null 2>&1; then
        POD_VERSION=$(pod --version)
        echo "✅ CocoaPods installed: $POD_VERSION"
    else
        echo "❌ CocoaPods NOT found."
        echo "   👉 Install via: sudo gem install cocoapods"
    fi

    # Watchman
    if command -v watchman >/dev/null 2>&1; then
        WATCHMAN_VERSION=$(watchman --version)
        echo "✅ Watchman installed: $WATCHMAN_VERSION"
    else
        echo "❌ Watchman NOT found."
        echo "   👉 Install via: brew install watchman"
    fi
fi

echo "--- Validation Complete ---"
if [ "$ANDROID_STATUS" -ne 0 ]; then
    exit 1
fi
exit 0
