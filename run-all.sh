#!/bin/bash

# Load env to ensure variables are available
set -a
[ -f .env ] && . .env
set +a

echo "=================================================="
echo "   Video Light Sync - One-Command Start"
echo "=================================================="
echo "Mode: DEV"
echo "Platform: $(uname)"
echo ""

# Function to kill child processes on exit
cleanup() {
    echo "Stopping all services..."
    pkill -P $$
    exit
}

trap cleanup SIGINT SIGTERM

echo "[1/3] Starting Web Capture App (Port 5173)..."
pnpm --filter web-capture dev &

echo "[2/3] Starting Transport Server (Port $VITE_TRANSPORT_PORT)..."
# We restart the server if it crashes
while true; do
  pnpm --filter @video-light-sync/transport start-server
  echo "Transport server crashed. Restarting in 1s..."
  sleep 1
done &

echo "[3/3] Starting Controller App (Port 5174)..."
pnpm --filter controller dev &

# Wait for all background processes
wait
