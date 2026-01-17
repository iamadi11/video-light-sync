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

      ws.on('message', (message) => {
        try {
          // In a real app we might validate data structure here
          const str = message.toString();
          const state = JSON.parse(str) as LightState;
          
          this.onLightState(state);
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

  private onLightState(state: LightState) {
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
