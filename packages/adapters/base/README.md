# Video Light Sync - Adapter SDK

This document describes how to create a new Adapter for the Video Light Sync system.

## Overview
Adapters act as the bridge between the Core system (which thinks in `LightState`: RGB, Brightness) and specific hardware protocols (Yeelight TCP, WLED UDP, Hue HTTP, etc.).

## Interface
All adapters must implement the `LightAdapter` interface exported from `@video-light-sync/adapters-base`.

```typescript
import { LightState } from '@video-light-sync/core';

export interface LightAdapter {
  id: string;      // Unique ID for this device instance
  name: string;    // Human readable name (e.g. "Desk Lamp")
  type: string;    // Adapter type (e.g. "yeelight")
  
  // Optional initialization (e.g. connecting to socket)
  init?(): Promise<void>; 
  
  // Called whenever the video frame changes (up to 30-60 times/sec)
  // Implementations must handle throttling internally if hardware is slow.
  sync(state: LightState): Promise<void>;
}
```

## Best Practices
1. **Throttling**: Most bulbs cannot handle 60 requests per second. Use a throttle check (e.g. max 10 updates/sec).
2. **Smoothing**: If the hardware supports transition duration (like Yeelight `smooth` param), use it (~300ms is a good sweet spot).
3. **Error Handling**: `sync` should not throw. Catch errors internally and log them sparingly.
4. **Mock Mode**: Provide a way to run without hardware (e.g. if no IP is provided) for easier development.
