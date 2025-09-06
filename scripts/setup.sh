#!/bin/bash

# Development setup script for Dockerfile Generator CLI
# This script sets up the development environment

set -e

echo "🛠️  Setting up Dockerfile Generator CLI development environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 24 ]; then
    echo "❌ Error: Node.js 24+ is required. Current version: $(node --version)"
    exit 1
fi
echo "✅ Node.js version: $(node --version)"

# Check pnpm version
echo "🔍 Checking pnpm version..."
if ! command -v pnpm &> /dev/null; then
    echo "❌ Error: pnpm is not installed. Please install pnpm first."
    exit 1
fi
PNPM_VERSION=$(pnpm --version | cut -d'.' -f1)
if [ "$PNPM_VERSION" -lt 8 ]; then
    echo "❌ Error: pnpm 8+ is required. Current version: $(pnpm --version)"
    exit 1
fi
echo "✅ pnpm version: $(pnpm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Install git hooks (if available)
if [ -d ".git" ]; then
    echo "🔗 Setting up git hooks..."
    # TODO: Add git hooks setup if needed
fi

# Create output directory if it doesn't exist
echo "📁 Creating output directory..."
mkdir -p output

echo "✅ Development environment setup completed!"
echo ""
echo "🚀 Next steps:"
echo "  1. Run 'pnpm dev' to start development mode"
echo "  2. Run 'pnpm test' to run tests"
echo "  3. Run 'pnpm build' to build the project"
echo "  4. Run 'pnpm start' to run the built CLI"
echo ""
echo "📚 See README.md for more information"
