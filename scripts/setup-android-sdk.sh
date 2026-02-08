#!/bin/bash

# Auto-generate android/local.properties

SDK_PATH=""

# Try to find SDK in common locations
if [ -d "$HOME/Library/Android/sdk" ]; then
    SDK_PATH="$HOME/Library/Android/sdk"
elif [ -d "/usr/local/share/android-sdk" ]; then
    SDK_PATH="/usr/local/share/android-sdk"
elif [ -n "$ANDROID_HOME" ] && [ -d "$ANDROID_HOME" ]; then
    SDK_PATH="$ANDROID_HOME"
elif [ -n "$ANDROID_SDK_ROOT" ] && [ -d "$ANDROID_SDK_ROOT" ]; then
    SDK_PATH="$ANDROID_SDK_ROOT"
fi

# Fallback to standard Mac path if not found, but warn
if [ -z "$SDK_PATH" ]; then
    SDK_PATH="$HOME/Library/Android/sdk"
    echo "⚠ Could not find Android SDK. Falling back to default: $SDK_PATH"
fi

mkdir -p android
echo "sdk.dir=$SDK_PATH" > android/local.properties
echo "✓ android/local.properties generated."
