# Video Light Sync

A monorepo for syncing video content (screen capture) to smart lights (Yeelight, WLED) with low latency.

## Architecture

This project is a **turborepo-style** monorepo using **pnpm workspaces**.

### Apps
- **`apps/web-capture`**: React app that captures the screen/tab, processes frames, and streams `LightState` to the local hub.
- **`apps/desktop`**: Electron app that acts as the **Local Hub**. It hosts the WebSocket server and manages Light Adapters (Yeelight, WLED).
- **`apps/controller`**: A PWA/Web Remote to view device status and manually control lights.

### Packages
- **`packages/core`**: Shared TypeScript types (`LightState`, `LightDevice`) and Zod schemas.
- **`packages/vision`**: Frame processing engine (Canvas -> RGB/Brightness) with temporal smoothing.
- **`packages/transport`**: WebSocket Server & Client protocol implementation.
- **`packages/adapters/base`**: Interface for Light Adapters.
- **`packages/adapters/yeelight`**: Yeelight LAN Control implementation.
- **`packages/adapters/wled`**: WLED UDP (DRGB) implementation.

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Development

Run the entire stack (Desktop Hub + Web Capture):

```bash
# In one terminal (Desktop Hub)
pnpm --filter desktop dev

# In another terminal (Web Capture)
pnpm --filter web-capture dev
```

### Building for Production

Build all packages and apps:

```bash
pnpm build
```

This ensures strict type checking and generates `dist/` artifacts for all packages.

### Packaging (Desktop)

Create a MacOS `.app` / `.dmg`:

```bash
pnpm --filter desktop package
```
Output will be in `apps/desktop/dist-app/`.

## creating a New Adapter

1. Create a new folder in `packages/adapters/`.
2. Extend `LightAdapter` from `@video-light-sync/adapters-base`.
3. Implement `init()` and `sync(state: LightState)`.
4. Add it to `apps/desktop/electron/main.ts`.

## License
MIT
