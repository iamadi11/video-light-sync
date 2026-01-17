# @video-light-sync/transport

WebSocket implementation for real-time light sync.

## Protocol

### State Update (Client -> Server -> Clients)
A `LightState` object is broadcasted.

```json
{
  "type": "STATE_UPDATE",
  "payload": {
      "timestamp": 123456789,
      "rgb": [255, 100, 50],
      "brightness": 0.8,
      "warmth": 0.6
  }
}
```

### Device List (Server -> Client)
Sent on connection or topology change.

```json
{
  "type": "DEVICE_LIST",
  "payload": [
    { "id": "yeelight-1", "type": "yeelight", "status": "online" }
  ]
}
```

## Usage

### Server
```typescript
import { LightSyncServer } from '@video-light-sync/transport';

const server = new LightSyncServer(3001, [adapter1, adapter2]);
```

### Client
```typescript
import { StreamClient } from '@video-light-sync/transport';

const client = new StreamClient('ws://localhost:3001');
client.connect();
client.sendState(myState);
```
