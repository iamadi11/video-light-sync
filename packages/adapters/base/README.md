# @video-light-sync/adapters-base

The Interface that all Light Adapters must implement.

## Implementing an Adapter

1. Implement the `LightAdapter` interface.

```typescript
import { LightAdapter } from '@video-light-sync/adapters-base';
import { LightState } from '@video-light-sync/core';

export class MyLightAdapter implements LightAdapter {
  id = 'my-light-1';
  name = 'My Smart Light';
  type = 'custom-brand';

  async init() {
    // Connect to hardware
  }

  async sync(state: LightState) {
    // Transform state (RGB/Brightness) to hardware protocol
    // Send command
    // Ensure you handle errors internally!
  }
}
```
