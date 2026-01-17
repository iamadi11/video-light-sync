import { WebSocketServer, WebSocket } from 'ws';
import { LightState } from '@video-light-sync/core';
import { LightAdapter } from '@video-light-sync/adapters-base';

export class LightSyncServer {
  private wss: WebSocketServer;
  private port: number;
  private adapters: LightAdapter[] = [];

  constructor(port: number = 3001, adapters: LightAdapter[] = []) {
    this.port = port;
    this.adapters = adapters;
    this.wss = new WebSocketServer({ port: this.port });
    
    // init adapters
    this.adapters.forEach(a => {
      console.log(`Initializing adapter: ${a.name}`);
      if (a.init) a.init();
    });
    
    this.wss.on('connection', (ws) => {
      console.log('Client connected');
      
      // Send device list immediately
      this.sendDeviceList(ws);

      ws.on('message', (message) => {
        try {
          // In a real app we might validate data structure here
          const str = message.toString();
          // We support both raw LightState (legacy/simple) and ServerMessage
          // For now, assume it's LightState from capture app
          const state = JSON.parse(str) as LightState;
          
          if (state.timestamp) {
             this.onLightState(state);
          }
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });

    console.log(`LightSyncServer started on port ${this.port}`);
  }

  private sendDeviceList(ws: WebSocket) {
    if (ws.readyState === WebSocket.OPEN) {
      const devices = this.adapters.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        status: 'online' as const
      }));
      
      ws.send(JSON.stringify({
        type: 'DEVICE_LIST',
        payload: devices
      }));
    }
  }

  private onLightState(state: LightState) {
    // Broadcast to all connected clients
    // We wrap it in a ServerMessage envelope
    const msg = JSON.stringify({
      type: 'STATE_UPDATE',
      payload: state
    });
    
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });

    // Broadcast to all adapters
    this.adapters.forEach(adapter => {
      adapter.sync(state).catch(err => {
        console.error(`Error syncing adapter ${adapter.name}:`, err);
      });
    });

    // Throttle logging
    if (Math.random() < 0.01) {
      console.log('Received state:', state);
    }
  }

  public close() {
    this.wss.close();
  }
}
