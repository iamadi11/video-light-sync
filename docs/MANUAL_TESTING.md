# Manual Run & Testing Phase

Follow this guide to install, build, run, and manually test the Video Light Sync system.

## 1. Installation

Ensure you have **Node.js 18+** and **pnpm** installed.

```bash
# Verify versions
node -v
pnpm -v

# Install dependencies (from root)
pnpm install
```

## 2. Build

Build all packages and apps to ensure type safety and generate artifacts.

```bash
# Build entire monorepo
pnpm build
```

*Expected Output*: Success messages for `core`, `vision`, `transport`, `adapters`, and all `apps`.

## 3. Start Apps

You will need **two separate terminal windows** to run the system for testing.

### Terminal A: Desktop Hub (Server)
This app hosts the WebSocket server and manages connections to lights.

```bash
pnpm --filter desktop dev
```
*Expected Behavior*: An Electron window opens titled "Video Light Sync Hub". The console in Terminal A should say `[Desktop] Hub started on port 3001`.

### Terminal B: Web Capture (Client)
This app captures your screen and sends color data to the Hub.

```bash
pnpm --filter web-capture dev
```
*Expected Behavior*:  
- Vite will start a local server (e.g., `http://localhost:5173`).
- Open this URL in Chrome/Edge.

### Terminal C: Controller (Optional)
This app visualizes the light state.

```bash
pnpm --filter controller dev
```

## 4. Manual Test Steps

1. **Setup**: Ensure both "Desktop Hub" and "Web Capture" are running.
2. **Start Capture**:
   - In the **Web Capture** browser tab, click **"Start Sync"**.
   - Select a screen or window to share (pick a colorful video or window for best results).
3. **Verify Processing**:
   - Open current browser console (F12).
   - Verify logs appear: `Streaming State: { rgb: [...], brightness: ... }`.
   - Logs should appear roughly every ~1-2 seconds (throttled logging) but data is sent faster.
4. **Simulate Transport**:
   - Check **Terminal A (Desktop)**. It should show logs indicating it received a connection.
   - If using Mock Adapters (default if no real hardware IP is provided), Terminal A logs may show: `[Mock Adapter] Syncing: RGB(...)`.
5. **Controller Check**:
   - Open the **Controller** app URL on a phone or another tab.
   - It should connect to the WebSocket server.
   - The background or UI indicator should change color matching the captured video.
6. **Performance Check**:
   - Open Chrome Task Manager.
   - Ensure `web-capture` tab CPU usage is reasonable (< 15%).
   - Ensure `Electron` process CPU usage is not spiking.

## 5. Run Tests

Run unit tests to verify logic correctness for core algorithms.

```bash
# Run all tests
pnpm test
```

*Targeted Tests*:
```bash
# Test Core (Types/Validation)
pnpm --filter core test

# Test Vision (Frame Processing)
pnpm --filter vision test

# Test Transport (Server/Client)
pnpm --filter transport test
```

## 6. Validation Steps

| Component | Check | Expected Result |
|_|_|_|
| **Build** | `pnpm build` | Exit code 0, `dist/` folders created. |
| **Hub** | `pnpm --filter desktop dev` | Electron window opens, Port 3001 active. |
| **Capture** | Browser Console | Valid `LightState` objects logged. |
| **Transport** | Network Tab (WS) | WebSocket status: `101 Switching Protocols`. |
| **Packaging** | `pnpm --filter desktop package` | `.dmg` or `.app` created in `apps/desktop/dist-app/`. |

## 7. Troubleshooting

### Capture Permission Denied
- **Issue**: Browser throws permission error when clicking "Start Sync".
- **Fix**: Grant Screen Recording permissions to your Browser in OS System Settings (Privacy & Security).

### WebSocket Not Connecting
- **Issue**: Client says "Connecting..." forever.
- **Fix**: 
    1. Ensure Desktop Hub is running.
    2. Check port 3001 usage: `lsof -i :3001`.
    3. Ensure `web-capture` connects to `ws://localhost:3001` (default).

### Package Import Error
- **Issue**: `Cannot find module '@video-light-sync/core'`.
- **Fix**: Run `pnpm build` again to ensure local packages are compiled and linked.

### Electron Crash
- **Issue**: Electron fails to start.
- **Fix**: Ensure no other process is using port 3001. Restart terminal.
