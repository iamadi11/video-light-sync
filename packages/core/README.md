# @video-light-sync/core

Shared core types and validation schemas for the Video Light Sync ecosystem.

## Key Types

### `LightState`
The canonical representation of the lighting state derived from video.

```typescript
interface LightState {
  timestamp: number;
  rgb: [number, number, number]; // [R, G, B] 0-255
  brightness: number;            // 0.0 - 1.0 (Luminance)
  warmth: number;                // 0.0 (Cool) - 1.0 (Warm)
}
```

### `LightDevice`
Representation of a connected hardware device.

```typescript
interface LightDevice {
  id: string;
  name: string;
  type: 'yeelight' | 'hue' | 'wled' | 'mock';
  status: 'online' | 'offline';
  ip?: string;
}
```

## Validation
We use **Zod** for runtime validation.

```typescript
import { ZLightState } from '@video-light-sync/core';

const result = ZLightState.safeParse(incomingData);
if (result.success) {
  // data is valid LightState
}
```
