#!/bin/bash
set -e

echo "=================================================="
echo "   Video Light Sync - Test Runner"
echo "=================================================="

echo "[1/3] Running Unit Tests (Core, Vision, Adapters)..."
pnpm -r test

echo ""
echo "[2/3] Verifying Types..."
pnpm -r build

echo ""
echo "[3/3] Integration Checks..."
if [ -f .env ]; then
    echo "✅ .env file exists"
else
    echo "❌ .env file missing! Copy .env.example to .env"
    exit 1
fi

echo ""
echo "✅ All tests passed!"
