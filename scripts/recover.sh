#!/bin/bash
echo "🔄 Scout Analytics Recovery Process..."

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed"

# Clean corrupted state
echo "🧹 Cleaning corrupted files..."
rm -rf node_modules package-lock.json dist .vite
npm cache clean --force

# Reinstall with robust strategy  
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps || {
    echo "⚠️ Primary install failed, trying yarn..."
    npm install -g yarn
    yarn install --frozen-lockfile || {
        echo "🔧 Manual rollup fix..."
        npm install --no-package-lock --legacy-peer-deps
        npm install rollup@latest vite@latest --save-dev
        npm rebuild
    }
}

echo "✅ Recovery completed!"