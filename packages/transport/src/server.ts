import { WebSocketServer, WebSocket } from 'ws';
import { LightState } from '@video-light-sync/core';

export class LightSyncServer {
  private wss: WebSocketServer;
  private port: number;

  constructor(port: number = 3001) {
    this.port = port;
    this.wss = new WebSocketServer({ port: this.port });
    
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
    // This hook will be used by adapters later
    // For now, we just log it for verification
    // Throttle logging
    if (Math.random() < 0.01) {
      console.log('Received state:', state);
    }
  }

  public close() {
    this.wss.close();
  }
}
