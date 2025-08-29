#!/bin/bash

# Battletech Mercenary Command Build Script
# Builds the game for macOS distribution

set -e

PROJECT_PATH="$(dirname "$0")"
GODOT_EXECUTABLE="godot"
BUILD_TYPE="${1:-release}"
VERSION="${2:-1.0.0}"

echo "Building Battletech Mercenary Command v${VERSION}..."
echo "Build type: ${BUILD_TYPE}"
echo "Project path: ${PROJECT_PATH}"

# Check if Godot is available
if ! command -v $GODOT_EXECUTABLE &> /dev/null; then
    echo "Error: Godot executable not found. Please install Godot 4.3+ and ensure it's in your PATH."
    echo "You can download Godot from: https://godotengine.org/download"
    exit 1
fi

# Create exports directory if it doesn't exist
mkdir -p "${PROJECT_PATH}/exports"

# Export the project
echo "Exporting project..."
cd "${PROJECT_PATH}"

if [ "$BUILD_TYPE" == "debug" ]; then
    echo "Building debug version..."
    $GODOT_EXECUTABLE --headless --export-debug "macOS" "exports/BattletechMercenaryCommand-debug.app"
else
    echo "Building release version..."
    $GODOT_EXECUTABLE --headless --export-release "macOS" "exports/BattletechMercenaryCommand.app"
fi

echo "Build completed successfully!"
echo "Output: ${PROJECT_PATH}/exports/"

# Optional: Create DMG for distribution
if [ "$BUILD_TYPE" == "release" ]; then
    echo "Creating DMG for distribution..."
    
    if command -v create-dmg &> /dev/null; then
        create-dmg \
            --volname "Battletech Mercenary Command" \
            --window-pos 200 120 \
            --window-size 600 300 \
            --icon-size 100 \
            --icon "BattletechMercenaryCommand.app" 175 120 \
            --hide-extension "BattletechMercenaryCommand.app" \
            --app-drop-link 425 120 \
            "exports/BattletechMercenaryCommand-${VERSION}.dmg" \
            "exports/BattletechMercenaryCommand.app"
        echo "DMG created: exports/BattletechMercenaryCommand-${VERSION}.dmg"
    else
        echo "Warning: create-dmg not found. DMG not created."
        echo "Install with: brew install create-dmg"
    fi
fi

echo "Build process complete!"