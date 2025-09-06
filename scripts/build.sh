#!/bin/bash

# Build script for Dockerfile Generator CLI
# This script builds the project for production

set -e

echo "🚀 Building Dockerfile Generator CLI..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
pnpm clean

# Type check
echo "🔍 Running type check..."
pnpm type-check

# Lint code
echo "📝 Running linter..."
pnpm lint

# Run tests
echo "🧪 Running tests..."
pnpm test

# Build project
echo "🔨 Building project..."
pnpm build

echo "✅ Build completed successfully!"
echo "📁 Output files are in the dist/ directory"
echo "🚀 Run 'pnpm start' to start the CLI"
