#!/bin/bash

# Build script for deployment
# This script ensures all dependencies are properly installed before building

echo "🚀 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Check if vite is available
if ! command -v npx vite &> /dev/null; then
    echo "❌ Vite not found, installing globally..."
    npm install -g vite
fi

# Run build
echo "🔨 Running build..."
npm run build

echo "✅ Build completed successfully!"
